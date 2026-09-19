# Free-first operating policy

This project is operated with a permanent free-tier-first constraint.

## Default rules

1. Never upgrade a paid plan merely to unblock development.
2. Prefer static/client-side computation and GitHub Pages for the playable web build.
3. Keep Vercel secondary; do not add Functions, Cron, server-side APIs, or other metered infrastructure unless explicitly required.
4. Minimize Supabase usage: local save first, authenticated cloud save only when needed, debounced writes, no per-pitch/per-action requests.
5. Avoid large media assets and unnecessary network requests.
6. Do not trigger a deployment for every tiny cosmetic change when batching is practical. Accumulate compatible changes and deploy them together.
7. Before adding a feature, choose the implementation with the lowest ongoing bandwidth, build, database, storage, and execution cost that preserves game quality.
8. If a free-tier resource approaches a practical safety threshold, reduce/disable nonessential usage before considering any paid service.
9. Never claim a usage percentage unless the provider's current usage data has actually been checked.
10. This policy applies automatically; the user does not need to repeat the free-tier requirement.

## Deployment policy

GitHub is the source of truth. GitHub Pages is the primary free static deployment target.

Development work may be accumulated and then reflected in a single deployment commit when that reduces unnecessary deployments. Critical fixes may still be deployed immediately.

## Game runtime policy

Gameplay simulation, AI, physics, presentation, and other deterministic work should run in the browser whenever practical. Cloud services are not used for work that can safely be done locally.

## Change policy

Prefer fewer, larger, verified changes over many tiny deployments:
- inspect existing code first
- group related changes
- run validation/smoke tests
- commit/deploy the verified batch
- verify the published result
