# Implementation Plan: Kannada Learning

**Branch**: `001-kannada-learning` | **Date**: 2025-11-22 | **Spec**: /Users/hgowda/projects/tmp/kadaspec/specs/001-kannada-learning/spec.md
**Input**: Feature specification from `/specs/001-kannada-learning/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a mobile-ready PWA that teaches Kannada to kids via bite-sized lessons and fun mini-games.
Primary flows work fully offline after first load; progress, rewards, and multi-profile usage are stored locally.
Frontend uses Preact for a simple UI, Phaser for mini-games, and sql.js + TypeORM for local persistence.

## Technical Context

**Language/Version**: TypeScript 5.x (compiles to JS, ES2020 target)
**Primary Dependencies**: Preact X, Phaser 3.6+, sql.js (WASM) + TypeORM (browser), idb-keyval (tiny)
**Storage**: sql.js (in-memory WASM SQLite) persisted to IndexedDB; Cache Storage for app-shell and assets
**Testing**: Vitest (unit), Playwright (E2E with offline/airplane mode), Lighthouse (budgets)
**Target Platform**: Mobile Web PWA (Android/Chrome focus; works on iOS Safari where possible)
**Project Type**: web
**Performance Goals**: TTI ≤ 2s on mid-tier Android (throttled), initial route JS ≤ 100 KB gz, first-load total ≤ 150 KB gz
**Constraints**: Offline-first; minimal dependencies; simple UX (AA contrast, ≥16px base, 44×44 tap targets); multi-user local profiles
**Scale/Scope**: MVP: 1 primary journey, 7 mini-games (match-sound, tap-letter, tracing, bubble-pop, memory-match, drag-drop, choose-sound), 1–2 lesson packs; multiple local profiles on device

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Offline‑First Mobile Web
  - PWA manifest + service worker required.
  - App-shell caching, offline lessons/media, local queuing (no network required for MVP).
  - Plan: Ship SW with Workbox-like patterns or hand-rolled precache/runtime cache; all P1 flows pass airplane-mode tests.
- Simple UX, Mobile‑First
  - Primary action ≤ 2 taps; shallow navigation (≤ 2 levels); AA contrast; 16px base; 44×44 tap targets.
  - Plan: Home → “Start lesson” or “Play game” in ≤ 2 taps; no modal stacks; large, clear buttons.
- Minimal Dependencies
  - Platform APIs first; every dependency justified; initial-route ≤ 100 KB JS gz.
  - Risk: Phaser (~hundreds of KB) and sql.js (WASM ~0.5–1.2 MB) are heavy.
  - Mitigation: Strict code-splitting: initial route loads only Preact + shell; lazy-load Phaser and sql.js + TypeORM on demand (games/data screen).
- Clean Code
  - Lint/format in CI; small cohesive modules; pure logic for core teachers; centralized error handling/logging.
  - Plan: ESLint + Prettier; domain logic separated from UI; typed entities for lessons/activities.
- Performance & Size Budget
  - TTI ≤ 2s; first-load ≤ 150 KB; avoid long tasks > 50 ms; optimized media.
  - Plan: Image/audio compression; defers heavy WASM/game bundles; measure via Lighthouse.

Status: CONDITIONALLY PASS with explicit mitigations (lazy-load heavy deps; budgets enforced on initial route). Any regression requires scope review.

## Project Structure

### Documentation (this feature)

```text
specs/001-kannada-learning/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── checklists/
    └── requirements.md  # Already created from /speckit.specify
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── App.tsx
│   ├── Button.tsx
│   └── ProgressBadge.tsx
├── pages/
│   ├── Home.tsx           # small initial route
│   ├── Lessons.tsx        # code-split
│   ├── Games.tsx          # code-split (Phaser wrapper)
│   └── Profiles.tsx       # multi-profile mgmt (code-split)
├── services/
│   ├── storage/
│   │   ├── db.ts          # sql.js lifecycle (lazy)
│   │   ├── orm.ts         # TypeORM datasource/entities (lazy)
│   │   └── persist.ts     # save/load DB to IndexedDB
│   ├── audio.ts           # offline audio utilities
│   ├── offline.ts         # airplane-mode checks, queueing primitives
│   └── cache.ts           # Cache Storage helpers
├── games/                 # Phaser scenes (lazy entry)
│   ├── match-sound/
│   ├── tap-letter/
│   ├── tracing/           # letter tracing game
│   ├── bubble-pop/        # pop bubbles with correct letters
│   ├── memory-match/      # match pairs of letters/sounds
│   ├── drag-drop/         # drag letters to correct positions
│   └── choose-sound/      # choose the right sound for a letter
├── db/
│   ├── entities/          # TypeORM entities
│   └── migrations/        # optional, for local schema evolutions
├── sw/
│   └── service-worker.ts  # app-shell + runtime caching
└── lib/
    └── utils.ts

tests/
├── unit/
├── integration/
└── e2e/                   # Playwright (offline tests)
```

**Structure Decision**: Single web project with aggressive route-based code-splitting. Initial route (Home) ships minimal JS and no heavy libs. Phaser and sql.js+TypeORM load only when entering Games/Profiles/first lesson.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Phaser dependency | Enables game-like, responsive mini-games with sound and input | Canvas from scratch slows delivery and increases defect risk |
| sql.js + TypeORM | Structured local persistence; relational queries; multi-profile | IndexedDB direct APIs are cumbersome; ad-hoc stores hard to evolve |
| WASM/sql.js size | Local DB with ACID-like semantics | JSON files risk corruption and complex concurrency semantics |
