# Open Procurement — Startup Office Pilot

Status: proposed implementation scope, 17 October 2026. This document does not represent shipped functionality.

## Outcome
A startup opening or expanding an office publishes a furniture package. Suppliers discover it and apply without an invitation. Qualified suppliers submit sealed bids, the buyer compares equivalent offers, and an authorized human records the award.

Positioning: "Publish your office needs. Let qualified suppliers compete."

## Relationship to the existing MVP
Extend docs/PROCUREMENT_GOVERNANCE_MVP.md. Preserve the Decision Advisor and its routes. For this pilot, open opportunity discovery and supplier applications enter scope, replacing invitation-only access as the default for newly created open tenders. Existing invitation-only projects retain their access rules. Payments, full marketplace commerce, ERP, blockchain infrastructure and automatic awards remain outside scope.

Openness describes participation and published rules. It does not imply public prices, unrestricted document access, or decentralized ownership. Do not claim blockchain security or guaranteed savings.

## First customer and validation
Target startups actively opening or expanding an office, initially with furniture packages. Founder or operations lead owns the brief and award. Manufacturers, brands and dealers supply offers.
Validate buyer demand and supplier participation through one real package before expanding categories.
The founder's 5–8% savings ambition is an unvalidated hypothesis. Measure comparable baseline cost versus awarded landed cost; report exclusions, quality differences and platform fees explicitly.

## First usable workflow
1. Buyer creates a project and package with quantities, specifications, location, currency, delivery date, required documents and optional public budget guidance.
2. Buyer publishes qualification criteria, required evidence, scoring weights and application/submission deadlines.
3. Public opportunity board shows an explicitly approved summary. Confidential attachments, contact details and bids are excluded.
4. A registered supplier applies from the opportunity page without an invitation.
5. Buyer reviews evidence against the published criteria. Acceptance or rejection requires a recorded reason. Suppliers see their own status and reason.
6. Accepted suppliers see the same current tender version and material clarifications.
7. Suppliers submit sealed offers before closing. Buyer and competing suppliers cannot read bid contents before the authorized opening event.
8. After closing, the buyer opens bids, reviews deterministic comparison and records a human award with reasons.
9. Suppliers receive the published outcome summary through the application. Notifications may be mocked initially; do not imply email delivery.
10. Audit view preserves the process history.

## Access and lifecycle
Tender access mode: OPEN or INVITE_ONLY.
Tender states: DRAFT -> PUBLISHED -> CLOSED -> OPENED -> AWARDED; cancellation requires a reason and event.
Application states: SUBMITTED -> UNDER_REVIEW -> ACCEPTED or REJECTED; withdrawal is allowed before the application deadline.
An invitation does not bypass qualification on an open tender.
One application per supplier per package per round; enforce uniqueness server-side.
Application deadline must precede bid close with a buyer-configured preparation interval. Block late applications and submissions using server time.
Do not close applications early or exclude a qualified supplier silently. Reversing an acceptance requires a reason, notice in the supplier view and preserved bid history.
Award visibility is configurable at publication; private commercial information is never published by default.

## Minimum data additions
- Package: accessMode, publicSummary, publicationVersion, publishedAt, applicationCloseAt, bidCloseAt, preparationInterval, qualificationCriteria, scoringModelVersion, outcomeVisibility.
- SupplierApplication: id, packageId, supplierId, round, criteriaVersion, evidenceReferences, status, submittedAt.
- QualificationDecision: applicationId, criteriaResults, decision, reason, reviewerId, decidedAt, supersedesDecisionId.
- PublicationSnapshot: packageId, version, approvedPublicFields, publishedBy, publishedAt.
- Audit events: opportunity published/cancelled; application submitted/withdrawn; qualification decided/reconsidered; public summary revised; outcome published.
Reuse existing bid, invitation, comparison and audit entities rather than duplicating them.

## Fairness and confidentiality rules
- Published criteria and weights are fixed for each round. Material changes create a new version, notify all affected suppliers in-app, and require a documented deadline extension or a new round.
- A supplier joining later sees every current material clarification.
- Private questions that affect the common scope must be anonymized and shared equally.
- Apply role and ownership checks on the server to all reads, writes, exports and attachment downloads. UI hiding alone is insufficient.
- Pre-opening API responses must exclude bid contents, prices, attachment links and derived rankings for buyers and competitors. Suppliers can access only their own offers.
- Numerical rankings use deterministic functions. AI may explain; humans qualify suppliers and approve awards.
- Append audit events atomically with sensitive mutations. Ordinary application roles cannot update or delete audit history. Do not describe an application-only log as tamper-proof.
- Do not expose supplier personal documents, other suppliers' application evidence or private commercial terms through the public board.
- Reopening requires a documented new round offered on equal terms; preserve original bids.

## Routes
Reuse procurement route conventions after inspecting the codebase.
- /procurement/opportunities — published opportunities and basic category/location/deadline filters.
- /procurement/opportunities/[id] — public summary and application entry.
- /procurement/projects/[id]/applications — buyer qualification review.
- Supplier workspace — own applications, status, tender access and bid entry.
Reuse existing comparison and audit screens.

## Implementation order
1. Inspect current implementation, persistence, authentication and AGENTS instructions. Identify mock-only behavior.
2. Add persisted access mode, publication snapshot and filtered public opportunity reads.
3. Add supplier applications, evidence, reasoned qualification decisions and ownership checks.
4. Replace invitation-only bid eligibility with a shared eligibility function supporting both access modes.
5. Connect sealed bids, opening, comparison and human award.
6. Add outcome summary and audit events.
7. Run focused authorization, lifecycle and deterministic scoring checks.

## Acceptance checks
- Anonymous visitor can discover a published open package but cannot see drafts, private tenders or confidential documents.
- An uninvited supplier can apply; a rejected or unreviewed supplier cannot bid.
- Supplier A cannot access Supplier B's application, evidence or bid.
- Buyer cannot read any sealed bid contents or derived prices before opening; opening before bid close fails.
- Three accepted suppliers can submit; late submissions fail.
- Concurrent duplicate applications, duplicate submissions and repeated opening cannot create inconsistent records.
- Revised criteria preserve the earlier version and notify all affected applicants.
- Qualified suppliers receive equal tender versions and material clarifications.
- Comparison ranks identical inputs identically and preserves source offer values.
- Award requires an authorized human; ranking overrides require a reason.
- Every qualification, reopening and award event appears in the audit trail.
- Existing invitation-only procurement and Decision Advisor behavior remain usable.

## Pilot measures
Track applications, accepted suppliers, submitted comparable bids, time to first qualified offer, buyer review time, award cycle time and supplier feedback.
Record cost differences only against an equivalent documented baseline. Do not treat more applications or the lowest submitted price alone as success.
