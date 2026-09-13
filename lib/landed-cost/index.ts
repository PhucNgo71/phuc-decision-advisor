import { retrieveKnowledge, type RagResult } from '../rag';

export interface LandedCostInput {
  currency?: string;
  goodsValue: number;
  internationalFreight: number;
  insurance?: number;
  importDutyRate: number;
  vatRate: number;
  customsAndPortFees?: number;
  inlandDelivery?: number;
  otherCosts?: number;
  contingencyRate?: number;
  hsCode?: string;
  countryOfOrigin?: string;
  ftaClaimed?: boolean;
  dutyRateSource?: string;
  vatRateSource?: string;
}

export interface LandedCostOutput {
  currency: string;
  customsValue: number;
  importDuty: number;
  vatBase: number;
  importVat: number;
  preContingencyLandedCost: number;
  contingency: number;
  totalLandedCost: number;
  landedCostUpliftVsGoods: number;
  risk: {
    level: 'low' | 'medium' | 'high';
    score: number;
    flags: string[];
  };
  assumptions: string[];
  groundedKnowledge: RagResult[];
}

function assertRate(name: string, value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${name} must be a decimal between 0 and 1.`);
  }
}

function assertMoney(name: string, value: number) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number.`);
  }
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateVietnamLandedCost(input: LandedCostInput): LandedCostOutput {
  assertMoney('goodsValue', input.goodsValue);
  assertMoney('internationalFreight', input.internationalFreight);
  assertRate('importDutyRate', input.importDutyRate);
  assertRate('vatRate', input.vatRate);
  assertRate('contingencyRate', input.contingencyRate ?? 0);

  const insurance = input.insurance ?? 0;
  const customsAndPortFees = input.customsAndPortFees ?? 0;
  const inlandDelivery = input.inlandDelivery ?? 0;
  const otherCosts = input.otherCosts ?? 0;
  const contingencyRate = input.contingencyRate ?? 0;

  [
    ['insurance', insurance],
    ['customsAndPortFees', customsAndPortFees],
    ['inlandDelivery', inlandDelivery],
    ['otherCosts', otherCosts],
  ].forEach(([name, value]) => assertMoney(String(name), Number(value)));

  // Deterministic estimator. Rates are supplied/grounded inputs rather than inferred by the LLM.
  const customsValue = input.goodsValue + input.internationalFreight + insurance;
  const importDuty = customsValue * input.importDutyRate;
  const vatBase = customsValue + importDuty;
  const importVat = vatBase * input.vatRate;
  const preContingencyLandedCost =
    customsValue + importDuty + importVat + customsAndPortFees + inlandDelivery + otherCosts;
  const contingency = preContingencyLandedCost * contingencyRate;
  const totalLandedCost = preContingencyLandedCost + contingency;

  const flags: string[] = [];
  let score = 0;

  if (!input.hsCode) {
    flags.push('HS code not supplied; duty classification must be verified by a human/import specialist.');
    score += 25;
  }
  if (!input.countryOfOrigin) {
    flags.push('Country of origin not supplied; preferential tariff eligibility cannot be validated.');
    score += 15;
  }
  if (input.ftaClaimed && !input.dutyRateSource) {
    flags.push('FTA preference is claimed but no duty-rate source/evidence is attached.');
    score += 25;
  }
  if (!input.dutyRateSource) {
    flags.push('Import duty rate has no cited source.');
    score += 20;
  }
  if (!input.vatRateSource) {
    flags.push('VAT rate has no cited source.');
    score += 10;
  }
  if (contingencyRate === 0) {
    flags.push('No contingency is included for customs, freight, FX, storage, or classification uncertainty.');
    score += 5;
  }

  score = Math.min(score, 100);
  const level = score >= 50 ? 'high' : score >= 20 ? 'medium' : 'low';

  const query = [
    'Vietnam import landed cost customs tax VAT freight',
    input.hsCode ? `HS ${input.hsCode}` : '',
    input.countryOfOrigin ? `origin ${input.countryOfOrigin}` : '',
    input.ftaClaimed ? 'FTA preferential tariff certificate of origin' : '',
  ].filter(Boolean).join(' ');

  return {
    currency: input.currency ?? 'VND',
    customsValue: round(customsValue),
    importDuty: round(importDuty),
    vatBase: round(vatBase),
    importVat: round(importVat),
    preContingencyLandedCost: round(preContingencyLandedCost),
    contingency: round(contingency),
    totalLandedCost: round(totalLandedCost),
    landedCostUpliftVsGoods: input.goodsValue === 0 ? 0 : round(totalLandedCost / input.goodsValue - 1),
    risk: { level, score, flags },
    assumptions: [
      'Customs value is estimated as goods value + international freight + insurance.',
      'Import duty is calculated from the supplied importDutyRate.',
      'Import VAT is calculated on customs value + import duty using the supplied vatRate.',
      'This estimator does not determine an HS code, legal tariff rate, FTA eligibility, or customs ruling.',
      'AI may explain the result, but a human remains responsible for approving commercial/import assumptions.',
    ],
    groundedKnowledge: retrieveKnowledge(query, 6),
  };
}
