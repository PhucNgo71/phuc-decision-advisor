import type { AuditEvent, Bid, ProcurementProject, ProcurementState, Vendor } from './types';

const createdAt = '2026-09-07T09:00:00.000Z';
const project: ProcurementProject = {
  id: 'demo-project', name: 'HCMC Workplace Renewal', owner: 'Demo Owner', location: 'Ho Chi Minh City',
  currency: 'VND', estimatedBudget: 900000000, procurementMethod: 'sealed_bid',
  bidOpenAt: '2026-09-07T09:00', bidCloseAt: '2026-09-14T17:00', status: 'bidding',
  createdBy: 'owner-admin', createdAt,
  package: { id: 'demo-package', name: 'Workstations', description: 'Supply and install ergonomic workstations',
    quantity: 100, unit: 'sets', technicalRequirements: 'Height-adjustable desks with cable management',
    requiredDocuments: ['Technical datasheet', 'Warranty statement'], budgetMin: 650000000, budgetMax: 900000000,
    weights: { technical: 35, commercial: 40, delivery: 15, compliance: 10 } },
};
const vendors: Vendor[] = [
  { id: 'vendor-1', name: 'Northstar Workspace', email: 'bid@northstar.example' },
  { id: 'vendor-2', name: 'Greenline Office', email: 'tender@greenline.example' },
  { id: 'vendor-3', name: 'Axis Projects', email: 'procurement@axis.example' },
];
const bids: Bid[] = [
  { id: 'bid-1', projectId: project.id, packageId: project.package.id, vendorId: 'vendor-1', round: 1, submittedAt: createdAt, currency: 'VND', totalPrice: 742000000, deliveryDays: 42, paymentTerms: '50/50', warrantyMonths: 60, technicalScore: 88, complianceScore: 100, scopeExclusions: '', documentsComplete: true, status: 'locked', lockedAt: createdAt },
  { id: 'bid-2', projectId: project.id, packageId: project.package.id, vendorId: 'vendor-2', round: 1, submittedAt: createdAt, currency: 'VND', totalPrice: 705000000, deliveryDays: 55, paymentTerms: '40/60', warrantyMonths: 36, technicalScore: 82, complianceScore: 90, scopeExclusions: 'Power modules excluded', documentsComplete: true, status: 'locked', lockedAt: createdAt },
];
const audit = (eventType: string, entityType: string, entityId: string, afterSnapshot: unknown, index: number): AuditEvent => ({
  id: `audit-${index}`, projectId: project.id, actorId: index < 5 ? 'owner-admin' : `vendor-${index - 4}`,
  actorRole: index < 5 ? 'Owner Admin' : 'Vendor', eventType, entityType, entityId,
  beforeSnapshot: null, afterSnapshot, timestamp: new Date(Date.parse(createdAt) + index * 60000).toISOString(),
});
export const demoState: ProcurementState = {
  projects: [project], vendors,
  invitations: vendors.map((vendor, index) => ({ id: `invite-${index + 1}`, projectId: project.id, vendorId: vendor.id, invitedAt: createdAt, acceptedAt: createdAt, status: 'accepted', invitationVersion: 1 })),
  bids,
  audit: [audit('project.created', 'project', project.id, project, 1), ...vendors.map((vendor, index) => audit('vendor.invited', 'invitation', `invite-${index + 1}`, vendor, index + 2)), ...bids.map((bid, index) => audit('bid.submitted_and_locked', 'bid', bid.id, { status: bid.status, lockedAt: bid.lockedAt }, index + 5))],
  awardOverrides: {},
};
