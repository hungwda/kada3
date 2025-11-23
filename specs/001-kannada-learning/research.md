# Research: Kannada Learning (Phase 0)

**Date**: 2025-11-22
**Feature**: /Users/hgowda/projects/tmp/kadaspec/specs/001-kannada-learning/spec.md

## Summary

All critical unknowns from the spec have been resolved for MVP. The app is a mobile-first PWA for kids to learn Kannada in bite-sized lessons, works fully offline after first load, supports multiple local profiles, and keeps the experience fun via mini-games and rewards. Technical selections prioritize minimal initial-route weight by deferring heavy modules (game engine, WASM DB) via code-splitting.

## Decisions

### UI Framework
- Decision: Preact (with TypeScript)
- Rationale: Preact provides a React-like developer experience at a fraction of the bundle size, aligning with the constitution’s minimal dependencies and size budgets. Strong ecosystem compatibility with JSX, Vite, and TypeScript.
- Alternatives considered:
  - React: Larger runtime cost on initial route; non-essential for MVP.
  - Vanilla DOM: Lowest cost but increases complexity for component state and reusability, slowing delivery.

### Game Engine
- Decision: Phaser 3 for mini-games (lazy-loaded)
- Rationale: Phaser provides robust scenes, input handling, sprites, and audio suited for short games. It accelerates delivery and reduces defect risk vs. building canvas interactions from scratch.
- Mitigation: Strict route-based code-splitting to keep initial route under 100 KB gzip. Phaser loads only on Games routes.
- Alternatives considered:
  - Pixi.js + custom logic: Lower-level; more engineering effort for interactions and scenes.
  - Canvas from scratch: High effort; increased bug risk; slower iteration.

### Persistence (Offline-First)
- Decision: sql.js (WASM SQLite) + TypeORM (browser) (lazy-loaded)
- Rationale: A relational schema simplifies multi-profile separation, progress tracking, and future-evolving data models. sql.js enables deterministic local DB with ACID-like behavior. TypeORM improves model expressiveness and consistency.
- Persistence strategy: Keep sql.js database in memory during a session; serialize to Uint8Array and store in IndexedDB on checkpoints (e.g., lesson complete, app background).
- Alternatives considered:
  - IndexedDB via idb/Dexie: Viable but more boilerplate and higher risk of ad hoc store fragmentation as the model grows.
  - JSON files: Simpler initially but fragile for concurrent updates and schema evolutions.

### Service Worker and Caching
- Decision: Hand-rolled Service Worker with precache manifest + runtime caching for media
- Rationale: Avoids heavy tooling while satisfying constitution gates (installable, offline app shell, atomic updates). Control over cache versioning and update flow.
- Alternatives considered:
  - Workbox: Productive but adds dependency weight; acceptable later if complexity grows.

### Accessibility and Mobile UX
- Decision: Mobile-first, AA contrast, 16px base font, 44×44 touch targets; shallow navigation (≤ 2 levels)
- Rationale: Constitution mandates Simple UX. Children benefit from clear layouts and large targets.

### Privacy and Compliance
- Decision: Audience is under 13. No analytics in MVP; parental consent required for any future data sharing. All data remains local (no sync).
- Rationale: Legal and ethical requirements for children’s privacy; aligns with MVP constraints.

### Languages (UI)
- Decision: Kannada primary with simple English helper labels for parents; full toggle deferred post-MVP
- Rationale: Maximizes focus on Kannada learning while providing minimal guidance for guardians.

### Multi-Profile Support
- Decision: Multiple local profiles, offline profile switching
- Rationale: Shared devices are common; profiles separated via relational schema.

### Performance Budgets and Code-Splitting
- Decision: Initial route ≤ 100 KB gzip; first load ≤ 150 KB gzip. Phaser and sql.js+TypeORM lazy-loaded.
- Rationale: Constitution performance gate; ensure TTI ≤ 2s on mid-tier Android with throttling.

## Open Questions (Post-MVP)
- Content licensing and sources for pronunciation audio/samples.
- Lesson authoring pipeline and localization workflows.
- Game difficulty curves and adaptive progression (future).

## Risks and Mitigations
- Heavy dependencies (Phaser, sql.js) increasing total size
  - Mitigation: Lazy-load only on demand; compress media; audit bundles regularly.
- WASM persistence performance on low-end devices
  - Mitigation: Batch saves; checkpointing; async serialization; fallbacks on storage quota errors.
- Audio compatibility across iOS/Android/Safari
  - Mitigation: Use tested formats (AAC/MP3/OGG as needed) and preload strategies; feature-detect.

## Alternatives Summary
| Topic      | Decision                    | Alternatives                       | Reason Rejected                         |
|------------|-----------------------------|------------------------------------|-----------------------------------------|
| UI         | Preact                      | React, Vanilla DOM                 | Size, delivery speed                    |
| Games      | Phaser (lazy-load)          | Pixi + custom, Canvas from scratch | Engineering effort, defect risk         |
| Storage    | sql.js + TypeORM (lazy)     | IndexedDB libs, JSON files         | Schema clarity, ACID-like, evolvability |
| SW         | Hand-rolled                 | Workbox                            | Dependency minimization                  |

## Conclusion
The MVP design meets all constitution gates with explicit mitigations for dependency size and performance. No blocking unknowns remain for planning and design deliverables. Proceed to Phase 1 outputs (data-model, contracts, quickstart) and implement CI checks for budgets and offline tests.
