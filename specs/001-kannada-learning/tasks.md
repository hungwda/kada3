---
description: "Task list for Kannada Learning PWA (Preact + Phaser + sql.js/TypeORM)"
---

# Tasks: Kannada Learning

**Input**: Design documents from `/specs/001-kannada-learning/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Skipping test tasks. Add them later if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (single project)**: `src/`, `tests/` at repository root
- Paths below reflect the plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create directory structure per plan in repository root (src/, pages, services, games, db, sw, lib, public) in src/ and public/
- [X] T002 Initialize Vite Preact TypeScript project (record command in specs/001-kannada-learning/quickstart.md)
- [X] T003 Add tsconfig.json flags for Preact + decorators (project root: tsconfig.json)
- [X] T004 Add ESLint + Prettier base config (project root: .eslintrc.cjs, .prettierrc)
- [X] T005 Add PWA manifest (public/manifest.webmanifest)
- [X] T006 Add app icons placeholders (public/icons/icon-192.png, public/icons/icon-512.png)
- [X] T007 Add service worker entry and registration (src/sw/service-worker.ts, src/main.tsx)
- [X] T008 Create app shell with Preact (src/components/App.tsx, src/main.tsx)
- [X] T009 Create pages scaffolds (src/pages/Home.tsx, src/pages/Lessons.tsx, src/pages/Games.tsx, src/pages/Profiles.tsx)
- [X] T010 Create services scaffolds (src/services/audio.ts, src/services/offline.ts, src/services/cache.ts)
- [X] T011 Create storage scaffolds (src/services/storage/db.ts, src/services/storage/orm.ts, src/services/storage/persist.ts)
- [X] T012 Create db entities directory (src/db/entities/.keep)
- [X] T013 Create games directory scaffolds (src/games/match-sound/.keep, src/games/tap-letter/.keep)
- [X] T014 Add minimal global styles for mobile-first and accessibility (src/styles/global.css)
- [X] T015 Add README quickstart section referencing specs (README.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T016 Implement service worker: precache app shell + runtime cache for assets (src/sw/service-worker.ts)
- [X] T017 Register service worker on load (src/main.tsx)
- [X] T018 Implement app routing/state to navigate Home ↔ Lessons ↔ Games ↔ Profiles (src/components/App.tsx)
- [X] T019 Implement lazy-loading boundaries (dynamic imports) for Lessons/Games/Profiles pages (src/pages/*.tsx)
- [X] T020 Implement sql.js loader with locateFile for WASM (src/services/storage/db.ts)
- [X] T021 Implement TypeORM datasource bootstrap (lazy) (src/services/storage/orm.ts)
- [X] T022 Implement IndexedDB persistence APIs (save/load) (src/services/storage/persist.ts)
- [X] T023 Implement audio utilities with offline-safe playback (src/services/audio.ts)
- [X] T024 Implement cache helpers for asset versioning (src/services/cache.ts)
- [X] T025 Define TypeORM entities per data-model.md (src/db/entities/*.ts)
- [X] T026 Seed initial content pack for Kannada letters (vowels/consonants) (public/data/lessons/letters.json)
- [X] T027 Add accessibility base: AA palette, ≥16px font, 44×44 targets (src/styles/global.css)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Learn Kannada Letters Offline (Priority: P1) 🎯 MVP

**Goal**: A child can complete the first Kannada letter lesson offline end-to-end with audio and progress saved locally.

**Independent Test**: After one online load, toggle airplane mode. Open app → start first lesson → hear audio → mark complete → reopen app; progress is persisted locally.

### Implementation for User Story 1

- [X] T028 [US1] Build Home page with clear primary actions (Start Lesson, Play Game) (src/pages/Home.tsx)
- [X] T029 [P] [US1] Implement Lessons list view (reads letters.json; simple tiles) (src/pages/Lessons.tsx)
- [X] T030 [P] [US1] Implement Lesson view for a single letter (offline assets; audio playback) (src/pages/Lessons.tsx)
- [X] T031 [P] [US1] Load lesson assets via cache helpers; ensure SW runtime caching (src/services/cache.ts)
- [X] T032 [US1] Write repository method to record lesson completion (local DB) (src/services/storage/orm.ts)
- [X] T033 [US1] Persist completion on lesson end (src/pages/Lessons.tsx)
- [X] T034 [US1] Display local progress indicators on Lessons list (completed/starred) (src/pages/Lessons.tsx)
- [X] T035 [US1] Add simple feedback/animation on completion (src/pages/Lessons.tsx)
- [X] T036 [US1] Verify offline flow guards and friendly messages (src/services/offline.ts)

**Checkpoint**: User Story 1 fully functional and testable offline

---

## Phase 4: User Story 2 - Mini-Games (Priority: P2)

**Goal**: Short games reinforce letter↔sound mapping; fully playable offline; results recorded locally.

**Independent Test**: Start a mini-game from Home, complete a round in 2–3 minutes, see score/stars, and confirm persistence offline.

### Implementation for User Story 2

- [X] T037 [P] [US2] Implement Phaser wrapper page and lazy-load engine (src/pages/Games.tsx)
- [X] T038 [P] [US2] Implement match-sound scene using letter assets (src/games/match-sound/index.ts)
- [X] T039 [P] [US2] Implement tap-letter scene (tap correct letter from grid) (src/games/tap-letter/index.ts)
- [X] T040 [US2] Wire scenes to read lesson assets and audio offline (src/services/cache.ts)
- [X] T041 [US2] Record game results (score, stars, time) to Progress (src/services/storage/orm.ts)
- [X] T042 [US2] Show last score/stars in Games entry UI (src/pages/Games.tsx)

**Checkpoint**: User Stories 1 AND 2 should both work independently offline

---

## Phase 5: User Story 3 - Rewards and Streaks (Priority: P3)

**Goal**: Encourage consistent learning with stars/badges and daily streaks, all offline.

**Independent Test**: Completing lessons/games unlocks badges (e.g., 5 lessons). Completing in consecutive days increments streak. All visible offline.

### Implementation for User Story 3

- [X] T043 [P] [US3] Implement streak model updates and daily increment logic (src/services/storage/orm.ts)
- [X] T044 [P] [US3] Implement rewards evaluation (lessons completed badge rule) (src/services/storage/orm.ts)
- [X] T045 [US3] Build rewards/badges UI component (src/components/ProgressBadge.tsx)
- [X] T046 [US3] Show current streak and longest streak on Home (src/pages/Home.tsx)
- [X] T047 [US3] Display earned badges and progress toward next on Rewards view (src/pages/Lessons.tsx)

**Checkpoint**: All user stories independently functional; rewards encourage engagement

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T048 [P] Documentation updates linked from quickstart (docs/ or specs/001-kannada-learning/quickstart.md)
- [X] T049 Code cleanup and refactoring per clean code principle (src/**)
- [X] T050 Performance optimization and budgets verification (Lighthouse report attached in docs/perf/) (docs/perf/README.md)
- [X] T051 [P] Additional unit or e2e tests if requested (tests/)
- [X] T052 Security/Privacy hardening for under-13 audience (no analytics, content checks) (docs/privacy.md)
- [X] T053 Validate offline install and A2HS experience end-to-end (no file change)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational — Independent of US1; shares assets and storage
- **User Story 3 (P3)**: Can start after Foundational — Reads from Progress; independent otherwise

### Within Each User Story

- Models/services before pages that depend on them
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- [P]-marked tasks can run in parallel safely:
  - US1: T029–T031
  - US2: T037–T039
  - US3: T043–T044

---

## Parallel Example: User Story 2

```bash
# In parallel
Task: "Implement Phaser wrapper page and lazy-load engine" -> src/pages/Games.tsx
Task: "Implement match-sound scene" -> src/games/match-sound/index.ts
Task: "Implement tap-letter scene" -> src/games/tap-letter/index.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (letters offline)
4. STOP and VALIDATE: Offline test flow; progress persisted locally
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test offline → Demo (MVP)
3. Add User Story 2 → Test offline → Demo
4. Add User Story 3 → Test offline → Demo
5. Each story adds value without breaking previous stories
