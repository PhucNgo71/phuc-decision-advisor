# Codex Instructions — P Decision Advisor

## Product intent
Build a web-based multi-dimensional strategic Decision Advisor for workplace/project sales and procurement strategy.

The system must ADVISE, not decide. Human judgment remains final.

## Reasoning contract
Every strategic analysis begins by determining the project's Win Objective. Do not recommend products or pricing before understanding what winning means.

Always consider customer, relationship/power, competition, product/portfolio, commercial, execution and current strategic context.

Every recommendation should include:
1. Situation
2. Win Objective
3. Key signals
4. Conflicts / contradictions
5. 2–3 scenarios
6. Trade-offs
7. Risks
8. Unknowns
9. Recommended direction
10. What could change the advice
11. Confidence

## Knowledge safety
Classify learning as Fact, Current Preference, Experience, Judgment, Hard Rule, or Temporary Context. Never silently promote a preference to a hard rule.

## Current hard commercial boundary
Minimum deal gross margin is 12% of selling price unless the user explicitly changes this rule.

## v0.1 scope
Focus on three experiences first:
- conversational Advisor
- Opportunity Strategy view
- Product Brain

Avoid premature CRM/RFQ/ERP complexity.

## Suggested stack
Next.js + TypeScript frontend; PostgreSQL + pgvector for structured and semantic memory; server-side LLM provider abstraction; rules engine kept separate from the LLM.

## Architecture principle
LLM is replaceable. Decision history, structured rules, portfolio knowledge, product experience and user corrections are the durable intelligence layer.

