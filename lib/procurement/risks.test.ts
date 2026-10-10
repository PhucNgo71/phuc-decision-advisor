import assert from 'node:assert/strict';
import test from 'node:test';
import { detectRisks } from './risks.ts';
import { demoState } from './demo.ts';
import type { AuditEvent, ProcurementState } from './types.ts';

const event = (id: string, eventType: string, timestamp: string): AuditEvent => ({ id, projectId: 'demo-project', actorId: 'tester', actorRole: 'Procurement', eventType, entityType: 'test', entityId: id, beforeSnapshot: null, afterSnapshot: {}, timestamp });
const stateWith = (...events: AuditEvent[]): ProcurementState => ({ ...structuredClone(demoState), audit: [...demoState.audit, ...events] });

test('R02 and R05 require an earlier invitation or bid event', () => {
  const state = stateWith(event('scope', 'scope.revised', '2026-09-08T10:00:00.000Z'), event('weights', 'scoring_weights.changed', '2026-09-08T11:00:00.000Z'));
  const codes = detectRisks(state, 'demo-project').map((risk) => risk.code);
  assert.ok(codes.includes('R02')); assert.ok(codes.includes('R05'));
});

test('R03, R04 and R06 derive from traceable audit evidence', () => {
  const state = stateWith(event('clarification', 'clarification.material_limited', '2026-09-08T10:00:00.000Z'), event('score', 'evaluation.score_edited', '2026-09-08T11:00:00.000Z'), event('reopen', 'bid.reopened', '2026-09-08T12:00:00.000Z'));
  const risks = detectRisks(state, 'demo-project');
  assert.deepEqual(risks.filter((risk) => ['R03', 'R04', 'R06'].includes(risk.code)).map((risk) => risk.code), ['R03', 'R04', 'R06']);
  assert.deepEqual(risks.find((risk) => risk.code === 'R06')?.evidenceEventIds, ['reopen']);
});

test('R08 identifies a multi-vendor process narrowed to one comparable bid', () => {
  const state = structuredClone(demoState); state.bids = [state.bids[0]];
  assert.ok(detectRisks(state, 'demo-project').some((risk) => risk.code === 'R08'));
});

test('R01 and R07 flag a non-leading selection with commercial comparability concerns', () => {
  const state = structuredClone(demoState); state.projects[0].status = 'closed';
  const ranked = [...state.bids].sort((left, right) => left.vendorId.localeCompare(right.vendorId));
  state.awardOverrides['demo-project'] = { vendorId: 'vendor-2', reason: 'Human review', createdAt: '2026-09-08T12:00:00Z' };
  const codes = detectRisks(state, 'demo-project').map((risk) => risk.code);
  assert.ok(ranked.length > 1); assert.ok(codes.includes('R01')); assert.ok(codes.includes('R07'));
});
