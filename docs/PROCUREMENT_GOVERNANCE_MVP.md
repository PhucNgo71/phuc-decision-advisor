# Procurement Governance MVP — Codex Build Brief

## Product goal
Build a neutral web-based procurement and project-governance workflow that makes hidden bid manipulation, undocumented overrides, unequal bidder treatment, and pre-arranged awards harder to execute.

The product does **not** accuse people of corruption or determine guilt. It records process evidence, enforces transparency controls, highlights anomalies, and keeps the final decision with authorized humans.

## MVP workflow

1. Owner creates a Project.
2. Owner defines Scope, Packages, Requirements, budget range, deadlines, and scoring weights.
3. Vendors are invited through the platform.
4. Vendors submit sealed / blind bids before the deadline.
5. Bids remain hidden from competing vendors and locked after submission unless a formal revision round is opened.
6. System generates a normalized Technical + Commercial comparison matrix.
7. Authorized stakeholders score independently.
8. System records all changes, comments, scoring, overrides, and award decisions in an immutable-style audit trail.
9. Risk engine flags anomalies without alleging misconduct.
10. Owner approves, rejects, requests clarification, or starts another bid round.

## MVP modules

### 1. Project
Fields:
- project_id
- project_name
- client / owner
- location
- currency
- estimated_budget
- procurement_method
- bid_open_at
- bid_close_at
- status
- created_by
- created_at

### 2. Scope / Package
Fields:
- package_id
- project_id
- name
- description
- quantity / unit
- technical_requirements
- required_documents
- budget_range
- technical_weight
- commercial_weight
- delivery_weight
- compliance_weight

Rules:
- Weight total must equal 100%.
- Every material scope change after vendor invitation must create a revision event.
- If a scope changes after any bid is submitted, all invited vendors must receive the same revision notice.

### 3. Vendor Invitation
Fields:
- invitation_id
- project_id
- vendor_id
- invited_at
- accepted_at
- status
- invitation_version

Rules:
- All invited vendors see the same tender package version.
- Clarifications visible to one vendor must either be classified private/vendor-specific or published to all bidders when material to the tender.

### 4. Blind Bid
Fields:
- bid_id
- project_id
- vendor_id
- round
- submitted_at
- currency
- total_price
- delivery_days
- payment_terms
- warranty
- compliance_answers
- attachments
- status
- locked_at

Rules:
- Vendor cannot edit a locked bid after deadline.
- Buyer cannot inspect price before the configured bid-opening event when sealed-bid mode is enabled.
- Any reopened bid must record who approved it and why.

### 5. Comparison Matrix
Normalize all bids against the same baseline.

Output columns should include at minimum:
- Vendor
- Total submitted price
- Normalized price
- Scope exclusions
- Technical compliance
- Delivery
- Payment terms
- Warranty
- Required-document completeness
- Technical score
- Commercial score
- Total weighted score
- Flags

Important: AI may summarize differences, but deterministic calculation code must own numerical scoring.

### 6. Decision & Audit Log
Every sensitive action creates an event:
- project created
- requirement edited
- scope revised
- vendor invited / removed
- clarification issued
- bid submitted
- bid reopened
- scoring weight changed
- stakeholder score submitted
- score edited
- recommendation generated
- recommendation overridden
- vendor awarded
- award cancelled

Audit event fields:
- event_id
- project_id
- actor_id
- actor_role
- event_type
- entity_type
- entity_id
- before_snapshot
- after_snapshot
- reason
- timestamp

Audit events should be append-only from the application layer.

## Roles

### Owner Admin
Creates project, configures tender, assigns roles, approves award.

### Procurement
Manages invitations, clarifications, commercial review, comparison.

### PM / QS / Consultant
Reviews technical/commercial information according to granted permissions but cannot silently change final scoring logic.

### Evaluator
Scores assigned criteria independently.

### Vendor
Sees its invitation and tender documents, submits bid, answers clarifications, sees only information explicitly made available to bidders.

### Auditor / Compliance
Read-only access to complete timeline, scoring history, overrides, and evidence.

## Risk / anomaly engine — MVP

Do **not** output labels such as "corrupt", "bribery", "fraudster", or "guilty".

Return flags such as:

### R01 — Award / score mismatch
Awarded or proposed vendor is not the highest-ranked vendor under the approved scoring model.

### R02 — Late specification change
Material technical requirement changed after vendors were invited or after bids were submitted.

### R03 — Unequal information risk
Material clarification or scope information was supplied to fewer than all eligible bidders.

### R04 — Scoring override
A submitted score was manually changed after initial evaluation.

### R05 — Weight manipulation risk
Scoring weights changed after first bid submission.

### R06 — Reopened bid
A locked bid was reopened or replaced after the deadline.

### R07 — Price normalization concern
Winning bid appears cheaper only because exclusions or commercial terms differ from baseline.

### R08 — Single-vendor funnel
Competitive process started with multiple vendors but rules/scope changes progressively leave only one compliant bidder.

Risk object:
```ts
type RiskFlag = {
  code: string;
  severity: "low" | "medium" | "high";
  title: string;
  explanation: string;
  evidenceEventIds: string[];
  recommendedReview: string;
};
```

## Decision principles
- AI advises; authorized humans decide.
- Numerical scoring is deterministic and auditable.
- LLM-generated explanations must cite underlying structured events/data inside the app.
- Human override is allowed but requires a reason.
- Never silently alter submitted bid data.
- Never silently alter scoring weights.
- Preserve history rather than overwriting sensitive records.

## Suggested stack
Stay compatible with the existing repo direction:
- Next.js
- TypeScript
- PostgreSQL
- Prisma or equivalent typed ORM
- Server-side authorization
- LLM provider abstraction for summaries / anomaly explanation
- Deterministic rules engine separate from LLM

## Initial entities
```ts
type Project = {};
type Package = {};
type Vendor = {};
type Invitation = {};
type Bid = {};
type BidLine = {};
type Evaluation = {};
type Score = {};
type Clarification = {};
type AuditEvent = {};
type RiskFlag = {};
type AwardDecision = {};
```
Codex should replace the placeholders with real typed schemas and persistence models.

## First Codex implementation sequence

### Task 1 — Inspect current app
Understand existing routes, components, data model, and conventions. Reuse shared UI and auth assumptions where practical. Do not rewrite the Decision Advisor unnecessarily.

### Task 2 — Add procurement workspace
Add navigation entry and routes under a clear namespace such as `/procurement`.

Minimum screens:
- `/procurement`
- `/procurement/projects/new`
- `/procurement/projects/[id]`
- `/procurement/projects/[id]/vendors`
- `/procurement/projects/[id]/bids`
- `/procurement/projects/[id]/comparison`
- `/procurement/projects/[id]/audit`

### Task 3 — Build Project + Package creation
Editable form with scoring-weight validation and tender dates.

### Task 4 — Build vendor invitation state
For MVP, notification delivery can be mocked, but invitations and vendor access state must be persisted.

### Task 5 — Build blind bid submission
Create vendor-facing bid entry, lock behavior, deadline validation, and revision-round rules.

### Task 6 — Build deterministic comparison matrix
Normalize commercial fields and calculate weighted score in pure TypeScript functions with tests.

### Task 7 — Build append-only audit log
Every sensitive mutation should generate an AuditEvent.

### Task 8 — Add rule-based anomaly flags
Implement R01–R08 without an LLM first. Display evidence and recommended human review.

### Task 9 — Add AI explanation layer
Only after structured rules work. AI summarizes risks and trade-offs; it must not decide award or accuse individuals.

## MVP acceptance criteria
A demo user can:
1. Create one procurement project.
2. Define at least one package and scoring model.
3. Invite at least three vendors.
4. Submit three sealed bids.
5. Close bidding.
6. Open and compare bids on the same normalized baseline.
7. Record evaluator scores.
8. See calculated ranking.
9. Override a recommendation only by entering a reason.
10. See the override and all prior changes in the audit timeline.
11. Trigger at least R01, R02, R05, and R06 through test data.
12. Export or render a decision summary suitable for Owner / Compliance review.

## Not in MVP
- Payments
- ERP integrations
- Full contract management
- Supplier onboarding/KYC
- Legal determination of corruption/fraud
- Automatic vendor blacklisting
- Autonomous award decision
- Complex blockchain implementation
- Marketplace functionality

## Product positioning
Use language such as:

**AI Procurement & Project Governance**

"Make every project decision traceable, comparable, and reviewable."

Avoid positioning the product primarily as an "anti-corruption app". The core promise is transparent decision governance and reduced procurement leakage.
