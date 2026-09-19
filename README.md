# Baseball 3D Game

Clean-room 3D baseball game foundation designed for **iPhone portrait play** and native iOS packaging.

## Target
Build toward a high-quality full baseball game: pitching, batting, ball flight, fielding, baserunning, AI, innings, teams/players, replay/cameras, saves, and future online architecture.

## Platform
- iPhone portrait-first UI and camera.
- Three.js + TypeScript-oriented web runtime.
- Capacitor 7 native iOS shell.
- Browser is for development/testing; the target player experience is an installed iPhone app.

## Engineering
GitHub is the source of truth. Keep simulation deterministic/testable, separate game logic from rendering, and optimize for real-device robustness. Do not copy proprietary code, assets, branding, UI, audio, or player likenesses from commercial games or reference repositories.

## iPhone
On a Mac with Xcode: `npm install`, `npx cap add ios`, `npx cap sync ios`, `npx cap open ios`. Select an iPhone, enable automatic signing, and Run.


## Intended use
This project is currently intended for personal/non-commercial use. Non-commercial intent does not waive third-party licenses, attribution requirements, database terms, copyright, trademark, publicity, or other applicable rights. Third-party code/data/assets must remain subject to their original licenses and provenance records.


<!-- Pages deployment trigger: 2026-09-19T21:31:27.783Z -->
