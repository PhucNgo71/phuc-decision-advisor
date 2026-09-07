import assert from 'node:assert/strict';
import test from 'node:test';
import { compareBids, validateWeights } from './engine.ts';
import { demoState } from './demo.ts';

test('weights must be non-negative and total 100', () => {
  assert.equal(validateWeights({ technical: 35, commercial: 40, delivery: 15, compliance: 10 }), true);
  assert.equal(validateWeights({ technical: 35, commercial: 45, delivery: 15, compliance: 10 }), false);
  assert.equal(validateWeights({ technical: -5, commercial: 80, delivery: 15, compliance: 10 }), false);
});

test('comparison is deterministic and normalizes lowest price to commercial score 100', () => {
  const project = demoState.projects[0];
  const rows = compareBids(demoState.bids, demoState.vendors, project.package);
  assert.equal(rows.length, 2);
  assert.equal(rows.find(row => row.totalPrice === 705000000)?.commercialScore, 100);
  assert.deepEqual(compareBids(demoState.bids, demoState.vendors, project.package), rows);
  assert.deepEqual(rows.map(row => row.rank), [1, 2]);
});

test('ties resolve by lower price and then vendor name', () => {
  const project = demoState.projects[0];
  const same = demoState.bids.map(bid => ({ ...bid, technicalScore: 100, complianceScore: 100, deliveryDays: 40, totalPrice: 700000000 }));
  const rows = compareBids(same, demoState.vendors, project.package);
  assert.deepEqual(rows.map(row => row.vendorName), ['Greenline Office', 'Northstar Workspace']);
});
