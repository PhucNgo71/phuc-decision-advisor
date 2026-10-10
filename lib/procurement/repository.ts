import 'server-only';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { demoState } from './demo';
import type { ProcurementRole, ProcurementState } from './types';

const databasePath = process.env.PROCUREMENT_DB_PATH ?? join(process.cwd(), '.data', 'procurement.sqlite');
let database: DatabaseSync | undefined;

function db(): DatabaseSync {
  if (database) return database;
  mkdirSync(dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath);
  database.exec('PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS procurement_state (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL, revision INTEGER NOT NULL, updated_at TEXT NOT NULL)');
  database.prepare('INSERT OR IGNORE INTO procurement_state (id, payload, revision, updated_at) VALUES (1, ?, 1, ?)').run(JSON.stringify(demoState), new Date().toISOString());
  return database;
}

export function readProcurementState(): { state: ProcurementState; revision: number } {
  const row = db().prepare('SELECT payload, revision FROM procurement_state WHERE id = 1').get() as { payload: string; revision: number };
  const parsed = JSON.parse(row.payload) as ProcurementState;
  return { state: { ...parsed, evaluations: parsed.evaluations ?? [] }, revision: row.revision };
}

const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const mapById = <T extends { id: string }>(items: T[]) => new Map(items.map((item) => [item.id, item]));

function authorizeChange(previous: ProcurementState, next: ProcurementState, role: ProcurementRole): void {
  const oldAudit = previous.audit;
  if (next.audit.length < oldAudit.length || !oldAudit.every((event, index) => same(event, next.audit[index]))) throw new Error('Audit history is append-only.');
  if (next.audit.length === oldAudit.length) throw new Error('Every state change must append an audit event.');

  const oldBids = mapById(previous.bids);
  for (const bid of next.bids) if (oldBids.has(bid.id) && !same(oldBids.get(bid.id), bid)) throw new Error('Locked bid records are immutable; use a formal reopen event and a new bid revision.');
  if (next.bids.length > previous.bids.length && role !== 'Vendor') throw new Error('Only a vendor role may submit a bid.');

  if (!same(previous.projects, next.projects) || !same(previous.vendors, next.vendors)) {
    if (!['Owner Admin', 'Procurement'].includes(role)) throw new Error('This role cannot administer projects or invitations.');
  }
  if (!same(previous.invitations, next.invitations) && !['Owner Admin', 'Procurement', 'Vendor'].includes(role)) throw new Error('This role cannot change invitation state.');
  if (!same(previous.evaluations, next.evaluations) && role !== 'Evaluator') throw new Error('Only an evaluator may submit or revise evaluation scores.');
  if (!same(previous.awardOverrides, next.awardOverrides) && !['Owner Admin', 'Procurement'].includes(role)) throw new Error('Only an authorized owner or procurement role may record an award direction.');
}

export function writeProcurementState(next: ProcurementState, expectedRevision: number, role: ProcurementRole): number {
  const current = readProcurementState();
  if (current.revision !== expectedRevision) throw new Error('The procurement record changed. Refresh before submitting again.');
  authorizeChange(current.state, next, role);
  const revision = current.revision + 1;
  const result = db().prepare('UPDATE procurement_state SET payload = ?, revision = ?, updated_at = ? WHERE id = 1 AND revision = ?')
    .run(JSON.stringify(next), revision, new Date().toISOString(), expectedRevision);
  if (result.changes !== 1) throw new Error('Concurrent update detected. Refresh before submitting again.');
  return revision;
}
