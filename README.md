# Phuc Decision Advisor v0.1

Codex-ready starter for a multi-dimensional business Decision Advisor.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Start here in Codex

Read `AGENTS.md`, then `docs/PRODUCT.md` and `docs/DECISION_MODEL.md`.

Recommended first implementation tasks:
1. Convert the static opportunity screen into editable project inputs.
2. Add Win Objective selection with per-scope priority.
3. Add portfolio recommendation logic using `data/portfolio.json`.
4. Add commercial validation using `data/commercial-rules.json`.
5. Define persisted Opportunity, Decision, Product Experience, and Learning schemas.
6. Add an Advisor API that returns the structured `AdvisorOutput` contract.
