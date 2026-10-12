import assert from 'node:assert/strict';
import test from 'node:test';
import { demoState } from './demo.ts';
import { detectProcurementRisks } from './risk.ts';
import { compareBids } from './engine.ts';
import type { AuditEvent, ProcurementState } from './types.ts';

const copy = (): ProcurementState => JSON.parse(JSON.stringify(demoState));
const event = (type: string, id: string, at = '2026-09-15T12:00:00Z', afterSnapshot: unknown = {}): AuditEvent =>
  ({ id, projectId: 'demo-project', actorId: 'test', actorRole: 'Owner Admin', eventType: type,
    entityType: 'project', entityId: 'demo-project', beforeSnapshot: null, afterSnapshot, timestamp: at });

test('normal demo data raises no unsupported anomaly allegation', () => {
  assert.deepEqual(detectProcurementRisks(copy(), 'demo-project'), []);
});
test('R01 evidence accompanies recorded non-leading award', () => {
  const s = copy(); s.projects[0].status = 'closed';
  s.awardOverrides['demo-project'] = { vendorId: 'vendor-2', reason: 'Approved exception', createdAt: '2026-09-15' };
  s.audit.push(event('recommendation.overridden', 'override-1'));
  const first = detectProcurementRisks(s, 'demo-project').find(x => x.code === 'R01');
  // Only assert mismatch if this fixture actually ranks the other vendor first.
  const winner = compareBids(s.bids, s.vendors, s.projects[0].package)[0].vendorId;
  assert.equal(Boolean(first), winner !== 'vendor-2');
  if (first) assert.deepEqual(first.evidenceEventIds, ['override-1']);
});
test('R02, R03, R04, R05 and R06 recognize event evidence', () => {
  const s = copy(); s.audit.push(
    event('scope.revised', 'scope', '2026-09-08T10:00:00Z', { material: true }),
    event('clarification.issued', 'info', '2026-09-08T11:00:00Z', { material: true, publishedToAll: false }),
    event('score.edited', 'score'), event('weights.changed', 'weights'),
    event('bid.reopened', 'reopen', '2026-09-16T10:00:00Z', { afterDeadline: true }));
  const risks = detectProcurementRisks(s, 'demo-project');
  for (const code of ['R02', 'R03', 'R04', 'R05', 'R06']) assert.ok(risks.some(r => r.code === code), code);
  assert.deepEqual(risks.find(r => r.code === 'R03')?.evidenceEventIds, ['info']);
});
test('R07 flags selected excluded-scope offer, R08 flags an invitation funnel', () => {
  const s = copy(); s.awardOverrides['demo-project'] = {vendorId: 'vendor-2',reason:'Exception',createdAt:'2026-09-15'};
  s.invitations[1].status = 'declined'; s.invitations[2].status = 'declined';
  s.audit.push(event('invitation.declined','decline'));
  const codes = detectProcurementRisks(s, 'demo-project').map(x => x.code);
  assert.ok(codes.includes('R07')); assert.ok(codes.includes('R08'));
});
