import { compareBids } from './engine.ts';
import type { ProcurementState, RiskFlag } from './types';

const flag = (code: string, severity: RiskFlag['severity'], title: string, explanation: string, evidenceEventIds: string[], recommendedReview: string): RiskFlag =>
  ({ code, severity, title, explanation, evidenceEventIds, recommendedReview });

export function detectRisks(state: ProcurementState, projectId: string): RiskFlag[] {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return [];
  const events = state.audit.filter((event) => event.projectId === projectId);
  const bids = state.bids.filter((bid) => bid.projectId === projectId);
  const evaluations = state.evaluations.filter((evaluation) => evaluation.projectId === projectId);
  const rows = project.status === 'closed' ? compareBids(bids, state.vendors, project.package, evaluations) : [];
  const risks: RiskFlag[] = [];
  const override = state.awardOverrides[projectId];

  if (override && rows[0] && override.vendorId !== rows[0].vendorId) risks.push(flag('R01', 'high', 'Award / score mismatch', 'The recorded human selection differs from the highest deterministic rank.', events.filter((event) => event.eventType === 'recommendation.overridden').map((event) => event.id), 'Confirm the documented trade-off and approval authority before award.'));
  const lateScope = events.filter((event) => event.eventType === 'scope.revised' && events.some((prior) => ['vendor.invited', 'bid.submitted_and_locked'].includes(prior.eventType) && prior.timestamp < event.timestamp));
  if (lateScope.length) risks.push(flag('R02', 'high', 'Late specification change', 'A material scope revision occurred after invitation or bid submission.', lateScope.map((event) => event.id), 'Verify that every eligible bidder received the same revision and adequate response time.'));
  const unequal = events.filter((event) => event.eventType === 'clarification.material_limited');
  if (unequal.length) risks.push(flag('R03', 'high', 'Unequal information risk', 'Material tender information was recorded as reaching fewer than all eligible bidders.', unequal.map((event) => event.id), 'Publish the clarification to all eligible bidders and record receipt.'));
  const editedScores = events.filter((event) => event.eventType === 'evaluation.score_edited');
  if (editedScores.length) risks.push(flag('R04', 'medium', 'Scoring override', 'An evaluator score was changed after its initial submission.', editedScores.map((event) => event.id), 'Review the prior score, revised score, reason, and approving role.'));
  const weightChanges = events.filter((event) => event.eventType === 'scoring_weights.changed' && events.some((prior) => prior.eventType === 'bid.submitted_and_locked' && prior.timestamp < event.timestamp));
  if (weightChanges.length) risks.push(flag('R05', 'high', 'Weight manipulation risk', 'Scoring weights changed after the first bid was submitted.', weightChanges.map((event) => event.id), 'Restore the approved baseline or obtain documented approval and notify all bidders.'));
  const reopened = events.filter((event) => event.eventType === 'bid.reopened');
  if (reopened.length) risks.push(flag('R06', 'high', 'Reopened bid', 'A locked bid was reopened or replaced.', reopened.map((event) => event.id), 'Verify the authorizer, reason, timing, and equal treatment of bidders.'));
  const selectedId = override?.vendorId ?? rows[0]?.vendorId;
  const selectedBid = bids.find((bid) => bid.vendorId === selectedId);
  if (selectedBid && (selectedBid.scopeExclusions.trim() || !selectedBid.documentsComplete)) risks.push(flag('R07', 'medium', 'Price normalization concern', 'The selected or leading bid has exclusions or incomplete documents that may affect like-for-like price comparison.', events.filter((event) => event.entityId === selectedBid.id).map((event) => event.id), 'Price the exclusions and confirm document completeness before relying on the commercial rank.'));
  const invited = state.invitations.filter((invitation) => invitation.projectId === projectId).length;
  const compliant = bids.filter((bid) => bid.documentsComplete && !bid.scopeExclusions.trim()).length;
  if (invited > 1 && bids.length > 0 && compliant <= 1) risks.push(flag('R08', 'medium', 'Single-vendor funnel', 'A process that invited multiple vendors currently has one or fewer bids without recorded exclusions or missing documents.', events.filter((event) => ['vendor.invited', 'bid.submitted_and_locked', 'scope.revised'].includes(event.eventType)).map((event) => event.id), 'Review whether requirements or changes unintentionally narrowed the competitive field.'));
  return risks;
}
