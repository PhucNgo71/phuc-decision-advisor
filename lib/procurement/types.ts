export type ProjectStatus = 'draft' | 'inviting' | 'bidding' | 'closed';
export type InvitationStatus = 'invited' | 'accepted' | 'declined';
export type BidStatus = 'submitted' | 'locked';
export type ProcurementRole = 'Owner Admin' | 'Procurement' | 'Evaluator' | 'Vendor' | 'Auditor / Compliance';

export interface ProcurementPackage {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  technicalRequirements: string;
  requiredDocuments: string[];
  budgetMin: number;
  budgetMax: number;
  weights: { technical: number; commercial: number; delivery: number; compliance: number };
}

export interface ProcurementProject {
  id: string;
  name: string;
  owner: string;
  location: string;
  currency: string;
  estimatedBudget: number;
  procurementMethod: 'sealed_bid';
  bidOpenAt: string;
  bidCloseAt: string;
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  package: ProcurementPackage;
}

export interface Vendor { id: string; name: string; email: string }
export interface Invitation {
  id: string; projectId: string; vendorId: string; invitedAt: string;
  acceptedAt?: string; status: InvitationStatus; invitationVersion: number;
}
export interface Bid {
  id: string; projectId: string; packageId: string; vendorId: string; round: number;
  submittedAt: string; currency: string; totalPrice: number; deliveryDays: number;
  paymentTerms: string; warrantyMonths: number; technicalScore: number;
  complianceScore: number; scopeExclusions: string; documentsComplete: boolean;
  status: BidStatus; lockedAt: string;
}
export interface Evaluation {
  id: string; projectId: string; bidId: string; vendorId: string; evaluatorId: string;
  technicalScore: number; complianceScore: number; comment: string;
  submittedAt: string; status: 'submitted'; revision: number;
}
export interface AuditEvent {
  id: string; projectId: string; actorId: string; actorRole: string; eventType: string;
  entityType: string; entityId: string; beforeSnapshot: unknown; afterSnapshot: unknown;
  reason?: string; timestamp: string;
}
export interface AwardOverride { vendorId: string; reason: string; createdAt: string }
export interface RiskFlag {
  code: string; severity: 'low' | 'medium' | 'high'; title: string; explanation: string;
  evidenceEventIds: string[]; recommendedReview: string;
}
export interface ProcurementState {
  projects: ProcurementProject[]; vendors: Vendor[]; invitations: Invitation[];
  bids: Bid[]; evaluations: Evaluation[]; audit: AuditEvent[];
  awardOverrides: Record<string, AwardOverride>;
}
export interface ComparisonRow {
  rank: number; vendorId: string; vendorName: string; totalPrice: number; normalizedPrice: number;
  deliveryDays: number; paymentTerms: string; warrantyMonths: number; scopeExclusions: string;
  documentsComplete: boolean; technicalScore: number; commercialScore: number;
  deliveryScore: number; complianceScore: number; totalWeightedScore: number; flags: string[];
}
