# RAG + MCP Architecture

## Goal
Turn P Decision Advisor into a grounded, tool-using advisory system while preserving the core boundary:

**AI advises. Human decides.**

## RAG layer
`lib/rag/index.ts` builds a grounded knowledge index from the existing durable intelligence layer:

- reviewed learning imports
- commercial rules
- portfolio knowledge
- practical experience

Every retrieved chunk carries:

- knowledge type
- source/citation
- text used for reasoning
- retrieval score

The first implementation intentionally uses deterministic local retrieval so the application remains dependency-light and inspectable. The next production step is to replace the scorer with PostgreSQL + pgvector / embeddings while preserving the same `RagResult` contract.

### Retrieval policy
1. Retrieve before strategic advice when internal knowledge is relevant.
2. Keep `hard_rule`, `fact`, `current_preference`, `experience`, `judgment`, and `temporary_context` distinct.
3. Never silently promote preference or judgment into a hard rule.
4. Surface citations/evidence in the advisor response.
5. Unknown or weakly grounded information should remain an explicit unknown.

## MCP/tool layer
`lib/mcp/index.ts` is the application tool gateway and policy boundary.

Tools are classified as:

- `read` — inspect data
- `calculate` — deterministic calculation
- `propose` — create a recommendation/proposed action
- `write` — change an external or durable system

Write tools must set `requiresHumanApproval: true` and cannot execute without explicit approval.

The first implementation is an internal MCP-style registry. The next production step is to expose/consume real Model Context Protocol servers and adapters for approved systems while keeping this registry as the authorization boundary.

Recommended adapters:

1. Landed-cost / import estimator — calculate only
2. Procurement comparison engine — read + calculate
3. Supplier/project database — read
4. GitHub/project workflow — read first; writes behind approval
5. CRM/ERP actions — proposal first; explicit approval before any write

## Advisor orchestration
Recommended flow:

1. Determine **Win Objective**.
2. Build a decision query from project/customer/product/commercial context.
3. Retrieve grounded RAG evidence.
4. Invoke deterministic MCP tools only when calculation or external data is required.
5. Produce the Decision Advisor contract:
   - Situation
   - Win Objective
   - Key signals
   - Conflicts / contradictions
   - 2–3 scenarios
   - Trade-offs
   - Risks
   - Unknowns
   - Recommended direction
   - What could change the advice
   - Confidence
6. Show evidence/tool outputs.
7. Leave the final decision and any write action to the human.

## API surface
`GET /api/advisor-context?q=<question>` currently exposes:

- retrieved RAG results
- formatted grounded context
- available MCP tools
- the human-decision policy

This endpoint is intended as the bridge into the conversational Advisor and Decision Lab.

## Production roadmap

### Phase 1 — now
- deterministic grounded retrieval
- source attribution
- knowledge-type preservation
- MCP/tool registry
- human approval gate

### Phase 2
- PostgreSQL + pgvector
- embeddings and hybrid semantic + keyword retrieval
- project/customer scoped retrieval filters
- recency and confidence weighting
- retrieval evaluation set

### Phase 3
- real MCP servers/adapters
- landed-cost calculator tool
- procurement governance tools
- supplier/project data connectors
- immutable tool-call audit trail

### Phase 4
- LLM orchestration
- evidence-first advisory prompt
- scenario generation
- tool-call planning with explicit approval checkpoints
- advisor quality/evaluation dashboard
