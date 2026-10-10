import type { Bid, ComparisonRow, Evaluation, ProcurementPackage, Vendor } from './types';

export function validateWeights(weights: ProcurementPackage['weights']): boolean {
  return Object.values(weights).every((weight) => Number.isFinite(weight) && weight >= 0) &&
    Object.values(weights).reduce((sum, weight) => sum + weight, 0) === 100;
}

const round = (value: number) => Math.round(value * 100) / 100;

export function compareBids(bids: Bid[], vendors: Vendor[], pkg: ProcurementPackage, evaluations: Evaluation[] = []): ComparisonRow[] {
  if (!validateWeights(pkg.weights)) throw new Error('Scoring weights must total 100%.');
  if (bids.length === 0) return [];
  const minimumPrice = Math.min(...bids.map((bid) => bid.totalPrice));
  const minimumDelivery = Math.min(...bids.map((bid) => bid.deliveryDays));
  const rows = bids.map((bid) => {
    const submittedEvaluations = evaluations.filter((evaluation) => evaluation.bidId === bid.id && evaluation.status === 'submitted');
    const technicalScore = submittedEvaluations.length
      ? round(submittedEvaluations.reduce((sum, evaluation) => sum + evaluation.technicalScore, 0) / submittedEvaluations.length)
      : bid.technicalScore;
    const complianceScore = submittedEvaluations.length
      ? round(submittedEvaluations.reduce((sum, evaluation) => sum + evaluation.complianceScore, 0) / submittedEvaluations.length)
      : bid.complianceScore;
    const commercialScore = round((minimumPrice / bid.totalPrice) * 100);
    const deliveryScore = round((minimumDelivery / bid.deliveryDays) * 100);
    const totalWeightedScore = round(
      technicalScore * pkg.weights.technical / 100 +
      commercialScore * pkg.weights.commercial / 100 +
      deliveryScore * pkg.weights.delivery / 100 +
      complianceScore * pkg.weights.compliance / 100,
    );
    const flags = [
      ...(!submittedEvaluations.length ? ['Independent evaluator score required'] : []),
      ...(bid.scopeExclusions.trim() ? ['Scope exclusions require review'] : []),
      ...(!bid.documentsComplete ? ['Required documents incomplete'] : []),
    ];
    return {
      rank: 0, vendorId: bid.vendorId,
      vendorName: vendors.find((vendor) => vendor.id === bid.vendorId)?.name ?? 'Unknown vendor',
      totalPrice: bid.totalPrice, normalizedPrice: round(bid.totalPrice / minimumPrice * 100),
      deliveryDays: bid.deliveryDays, paymentTerms: bid.paymentTerms,
      warrantyMonths: bid.warrantyMonths, scopeExclusions: bid.scopeExclusions,
      documentsComplete: bid.documentsComplete, technicalScore,
      commercialScore, deliveryScore, complianceScore,
      totalWeightedScore, flags,
    };
  });
  return rows.sort((a, b) => b.totalWeightedScore - a.totalWeightedScore || a.totalPrice - b.totalPrice || a.vendorName.localeCompare(b.vendorName))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
