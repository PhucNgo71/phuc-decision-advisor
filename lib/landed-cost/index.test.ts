import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateVietnamLandedCost } from './index';

test('calculates deterministic landed cost from supplied rates', () => {
  const result = calculateVietnamLandedCost({
    currency: 'USD',
    goodsValue: 1000,
    internationalFreight: 100,
    insurance: 10,
    importDutyRate: 0.1,
    vatRate: 0.1,
    customsAndPortFees: 30,
    inlandDelivery: 20,
    contingencyRate: 0.05,
    hsCode: '9401',
    countryOfOrigin: 'CN',
    dutyRateSource: 'human supplied test rate',
    vatRateSource: 'human supplied test rate',
  });

  assert.equal(result.customsValue, 1110);
  assert.equal(result.importDuty, 111);
  assert.equal(result.vatBase, 1221);
  assert.equal(result.importVat, 122.1);
  assert.equal(result.preContingencyLandedCost, 1393.1);
  assert.equal(result.contingency, 69.66);
  assert.equal(result.totalLandedCost, 1462.76);
  assert.equal(result.risk.level, 'low');
});

test('flags missing classification and tax evidence instead of inventing it', () => {
  const result = calculateVietnamLandedCost({
    goodsValue: 1000,
    internationalFreight: 100,
    importDutyRate: 0.08,
    vatRate: 0.1,
  });

  assert.equal(result.risk.level, 'high');
  assert.ok(result.risk.flags.some((flag) => flag.includes('HS code')));
  assert.ok(result.risk.flags.some((flag) => flag.includes('duty rate')));
  assert.ok(result.risk.flags.some((flag) => flag.includes('VAT rate')));
});

test('rejects invalid percentage inputs', () => {
  assert.throws(() =>
    calculateVietnamLandedCost({
      goodsValue: 1000,
      internationalFreight: 100,
      importDutyRate: 8,
      vatRate: 0.1,
    }),
  );
});
