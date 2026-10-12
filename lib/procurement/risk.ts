import { compareBids } from './engine';
import type { AuditEvent, ProcurementState } from './types';

export type RiskCode = 'R01' | 'R02' | 'R03' | 'R04' | 'R05' | 'R06' | 'R07' | 'R08';
export type RiskFlag = {
  code: RiskCode;
  severity: 'low' | 'medium' | 'high';
  title: string;
  explanation: string;
  evidenceEventIds: string[];
  recommendedReview: string;
};

const definitions: Record<RiskCode, Omit<RiskFlag, 'evidenceEventIds'>> = {
  R01: { code: 'R01', severity: 'high', title: 'Award and ranking differ', explanation: 'The recorded human selection is not the highest-ranked compliant comparison row.', recommendedReview: 'Verify and document the business reasons for the selection.' },
  R02: { code: 'R02', severity: 'high', title: 'Late specification change', explanation: 'A material scope or requirement change followed a vendor invitation.', recommendedReview: 'Confirm every eligible vendor received the same revision.' },
  R03: { code: 'R03', severity: 'high', title: 'Unequal information exposure', explanation: 'A material clarification was not published to every eligible vendor.', recommendedReview: 'Publish a common clarification and provide an equal response window.' },
  R04: { code: 'R04', severity: 'medium', title: 'Evaluation score changed', explanation: 'A submitted evaluation score was subsequently edited.', recommendedReview: 'Review the original score, revision reason, and reviewer identity.' },
  R05: { code: 'R05', severity: 'high', title: 'Weights changed after bid', explanation: 'The scoring model changed following the first submitted bid.', recommendedReview: 'Review approval, notice to vendors, and whether the round must restart.' },
  R06: { code: 'R06', severity: 'high', title: 'Sealed bid reopened', explanation: 'A locked bid was reopened or replaced after the deadline.', recommendedReview: 'Review authorization, reason, affected vendors, and equal-treatment safeguards.' },
  R07: { code: 'R07', severity: 'medium', title: 'Commercial baseline needs review', explanation: 'The selected vendor has exclusions or non-comparable commercial terms requiring normalization.', recommendedReview: 'Price exclusions against the common scope and compare payment and warranty terms.' },
  R08: { code: 'R08', severity: 'medium', title: 'Single-vendor funnel', explanation: 'A competitive invitation process has narrowed to one eligible or compliant bidder following rule or scope changes.', recommendedReview: 'Review the elimination trail and consider an extension or new round.' },
};
const eventIds = (events: AuditEvent[]) => events.map(event => event.id);
const matches = (value: string, terms: string[]) => terms.some(term => value === term);
const snapshot = (event: AuditEvent): Record<string, unknown> =>
  event.afterSnapshot !== null && typeof event.afterSnapshot === 'object' && !Array.isArray(event.afterSnapshot)
    ? event.afterSnapshot as Record<string, unknown> : {};

export function detectProcurementRisks(state: ProcurementState, projectId: string): RiskFlag[] {
  const project = state.projects.find(item => item.id === projectId);
  if (!project) return [];
  const events = state.audit.filter(event => event.projectId === projectId);
  const invited = events.filter(e => matches(e.eventType, ['vendor.invited', 'invitation.created']));
  const submitted = events.filter(e => matches(e.eventType, ['bid.submitted', 'bid.submitted_and_locked']));
  const firstInvitation = invited.reduce((min, e) => Math.min(min, Date.parse(e.timestamp)), Infinity);
  const firstBid = submitted.reduce((min, e) => Math.min(min, Date.parse(e.timestamp)), Infinity);
  const flags: RiskFlag[] = [];
  const emit = (code: RiskCode, evidence: AuditEvent[]) => { if (evidence.length) flags.push({ ...definitions[code], evidenceEventIds: eventIds(evidence) }); };
  const selection = state.awardOverrides[projectId];
  const bids = state.bids.filter(b => b.projectId === projectId && b.status === 'locked');
  if (project.status === 'closed' && selection && bids.length) {
    const ranked = compareBids(bids, state.vendors, project.package);
    if (ranked[0]?.vendorId !== selection.vendorId)
      emit('R01', events.filter(e => matches(e.eventType, ['recommendation.overridden', 'vendor.awarded'])));
  }
  const lateSpec = events.filter(e => matches(e.eventType, ['scope.revised', 'requirement.edited', 'package.revised']) &&
    snapshot(e).material !== false && Date.parse(e.timestamp) >= firstInvitation);
  emit('R02', lateSpec);
  emit('R03', events.filter(e => matches(e.eventType, ['clarification.issued', 'clarification.published']) &&
    snapshot(e).material === true && snapshot(e).publishedToAll !== true));
  emit('R04', events.filter(e => matches(e.eventType, ['score.edited', 'evaluation.score_edited'])));
  emit('R05', events.filter(e => matches(e.eventType, ['scoring.weight_changed', 'weights.changed']) &&
    Date.parse(e.timestamp) >= firstBid));
  emit('R06', events.filter(e => matches(e.eventType, ['bid.reopened', 'bid.replaced']) &&
    (snapshot(e).afterDeadline === true || Date.parse(e.timestamp) > Date.parse(project.bidCloseAt))));
  const selectedBid = selection ? bids.find(b => b.vendorId === selection.vendorId) : undefined;
  if (selectedBid && (selectedBid.scopeExclusions.trim() || !selectedBid.documentsComplete))
    emit('R07', events.filter(e => e.entityId === selectedBid.id && matches(e.eventType, ['bid.submitted', 'bid.submitted_and_locked'])));
  const eligible = state.invitations.filter(i => i.projectId === projectId && i.status === 'accepted');
  const changeEvents = events.filter(e => matches(e.eventType, ['scope.revised', 'requirement.edited', 'package.revised', 'invitation.declined', 'invitation.removed']));
  if (invited.length >= 2 && eligible.length <= 1 && changeEvents.length) emit('R08', changeEvents);
  return flags;
}
