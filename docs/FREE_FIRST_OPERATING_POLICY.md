# Free-first operating policy

## Highest-priority constraint: GitHub Pages × iPhone × completely free × overage prevention × minimum communication

This is the highest-priority engineering constraint for every development decision. It applies automatically; the user does not need to repeat it.

### 1. Core target
The game must be publishable on GitHub Pages, playable on iPhone Safari/PWA, and maintainable without paid services whenever technically practical. Keep free-tier resources with substantial headroom rather than operating near their limits.

### 2. No unauthorized cost
Never introduce paid services, paid APIs, paid servers, or metered infrastructure without explicit user authorization. Avoid designs that could unexpectedly exceed a free tier. Never upgrade a plan merely to unblock development.

### 3. GitHub Pages first
Use GitHub Pages + HTML/CSS/JavaScript as the primary playable deployment. Prefer static files and browser-side execution. Server, database, CDN, backend, or external API dependencies are exceptions, not defaults.

### 4. Browser-first game runtime
Run simulation, AI, physics, ball flight, scoring, animations, UI, and local game-state processing in the browser whenever practical. Do not spend server resources on work that can be done locally.

### 5. Minimum communication
During ordinary gameplay, default to zero network requests after the required game assets/data are available. Avoid per-frame requests, polling, per-action/per-pitch requests, unnecessary JSON downloads, remote images/fonts/audio, ads, and analytics. Cache static data and assets where practical.

### 6. Offline/PWA priority
Use a PWA/service-worker strategy where it materially reduces repeat downloads without increasing total request volume unnecessarily. Cache HTML/CSS/JS, required assets, and static game data. The game should retain basic CPU play and local saves without network access.

### 7. iPhone-first engineering
Optimize for iPhone Safari and installed PWA/native packaging: touch targets, Safe Area, Dynamic Island/notch, portrait/landscape behavior, memory, FPS, thermal load, touch latency, and low-power conditions. Prefer stable playability over unnecessary visual complexity.

### 8. 3D/performance
Compare Canvas 2D, WebGL, Three.js, 2.5D, and optimized 3D as appropriate. Optimize gameplay feel × visuals × iPhone performance × bandwidth rather than maximizing graphics alone. Avoid excessive DOM updates, allocations, garbage collection, asset loads, and repeated calculations. Use pooling/caching/lazy loading where beneficial.

### 9. Small assets and dependencies
Prefer compact local assets (WebP/AVIF/SVG where appropriate), avoid unnecessary high-resolution media, and avoid large libraries for small features. Minimize CDN/external-host dependence. Do not include unnecessary video, PSD/source images, builds, logs, caches, backups, or node_modules in the repository.

### 10. Local saves first
Use localStorage/IndexedDB for team, players, progression, results, settings, inventory, and season state whenever practical. Supabase or another backend is reserved for genuinely needed account/cloud-save/online/ranking/matching features; it is not required to run the core game.

### 11. External APIs
Do not use external APIs unless genuinely necessary. If one is necessary, prefer free sources, verify terms and rate limits, cache results, reduce requests, and provide a local/static fallback. Never make gameplay depend on a fragile external API when avoidable.

### 12. GitHub Actions / deployment minimization
Reduce unnecessary Actions executions, builds, and retained artifacts. Batch compatible development changes and deploy them together when practical. Critical fixes can deploy immediately. Always validate before deployment and verify the published result when possible.

### 13. Free-tier monitoring
For every external service actually used, periodically verify current usage, free allowance, remaining headroom, and growth rate before making usage claims. Do not claim percentages without current provider data. If usage rises, optimize/remove nonessential consumption before considering any paid service.

### 14. Architecture stages
**Stage 1:** GitHub → GitHub Pages → HTML/CSS/JS + Canvas/WebGL → localStorage/IndexedDB → offline-capable CPU game.

**Stage 2:** Add Supabase or other backend only when a specific online/account/cloud requirement justifies it, while keeping the core game functional without it where practical.

### 15. Decision order
For every implementation choice, evaluate in this order: (1) iPhone compatibility, (2) GitHub Pages compatibility, (3) zero/near-zero recurring cost, (4) free-tier overage safety, (5) minimum communication, (6) storage/bandwidth, (7) FPS/memory/thermal performance, (8) controls/game feel, (9) extensibility, (10) maintainability.

### 16. Absolute rules
Do not target the free-tier limit. Leave substantial headroom. If server/API/external-service work can be eliminated without materially harming the game, eliminate it. Do not sacrifice core game quality unnecessarily for cost savings; optimize implementation first.

## Deployment policy
GitHub is the source of truth. GitHub Pages is the primary free static deployment target. Vercel remains secondary and must not require a paid upgrade. No Vercel Functions/Cron or unnecessary metered services.

## Change policy
Inspect first → group compatible changes → implement → validate/smoke-test → deploy one verified batch → verify published behavior. This batching rule is the default for non-critical changes.
