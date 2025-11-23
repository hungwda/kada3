<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: initialized from template
  - [PRINCIPLE_1_NAME] → Offline‑First Mobile Web (NON‑NEGOTIABLE)
  - [PRINCIPLE_2_NAME] → Simple UX, Mobile‑First
  - [PRINCIPLE_3_NAME] → Minimal Dependencies
  - [PRINCIPLE_4_NAME] → Clean Code
  - [PRINCIPLE_5_NAME] → Performance & Size Budget
- Added sections:
  - Additional Constraints
  - Development Workflow
- Removed sections: None
-->

# Kadaspec Constitution

## Core Principles

### I. Offline‑First Mobile Web (NON‑NEGOTIABLE)
The application MUST remain usable for its primary user journey without network connectivity
after the first successful load.

- MUST implement an installable PWA: valid Web App Manifest and a Service Worker.
- MUST cache the app shell and essential assets on first load; updates use safe, atomic swaps.
- MUST provide local-first reads/writes: queue mutations and retry when online (no data loss).
- MUST degrade gracefully: no hard blockers on failed network calls; show clear offline states.
- MUST persist critical user state locally (e.g., IndexedDB/Cache Storage) with conflict resolution.
- Rationale: Mobile contexts are frequently offline or constrained; offline-first preserves value
  and reliability.

### II. Simple UX, Mobile‑First
Deliver a focused, minimal interface optimized for small screens and touch interaction.

- MUST keep MVP scope to one primary user journey; no more than two taps to the primary action.
- MUST meet accessibility AA color contrast; base font size ≥ 16px; tap targets ≥ 44×44 px.
- MUST avoid complex gestures; core flows operable with basic touch and keyboard navigation.
- MUST keep navigation shallow (≤ 2 levels) and predictable; avoid modal stacking.
- SHOULD provide immediate feedback for actions; prefer optimistic UI for queued offline work.
- Rationale: Simplicity lowers cognitive load, speeds completion, and reduces error rates.

### III. Minimal Dependencies
Rely on platform capabilities first; introduce dependencies only with explicit justification.

- MUST use platform HTML/CSS/JS APIs for MVP; no UI/runtime framework by default.
- MUST provide a written justification to add any runtime dependency including:
  purpose, alternatives considered, gzip size impact, and risk profile.
- MUST keep initial-route compressed JS ≤ 100 KB and avoid transitive heavy deps.
- MUST avoid build-time lock-in for runtime; build tooling is allowed for development only.
- Rationale: Fewer dependencies reduce attack surface, bundle size, and long-term maintenance.

### IV. Clean Code
Maintain clear, modular code that is easy to read, change, and verify.

- MUST enforce linting and formatting repository-wide via CI.
- MUST follow single-responsibility: small modules; keep files reasonably small and cohesive.
- MUST isolate side effects; prefer pure functions for business logic with explicit inputs/outputs.
- MUST centralize error handling and logging; never swallow errors silently.
- SHOULD include smoke tests for the critical path and offline behavior (happy path).
- Rationale: Clean code reduces defects and accelerates iteration, especially with a small MVP.

### V. Performance & Size Budget
Deliver fast, resource-efficient experiences on modest mobile hardware and networks.

- MUST achieve Time to Interactive ≤ 2s on a Moto G4/Slow 3G profile (Lighthouse guidance).
- MUST keep first-load total transfer ≤ 150 KB compressed; subsequent navigations ≤ 50 KB.
- MUST avoid long tasks > 50 ms on the main thread; batch and yield where appropriate.
- MUST ship responsive, optimized images; prevent layout shifts; target smooth 60 fps scroll.
- Rationale: Lightweight performance preserves battery, data, and user trust.

## Additional Constraints

- Security: HTTPS only; set sensible CSP; avoid third‑party scripts unless strictly required
  and reviewed for privacy/security.
- Privacy: No tracking/analytics by default in MVP; opt‑in only with clear value.
- Data: Use IndexedDB and Cache Storage for offline data; localStorage only for small,
  non‑sensitive configuration.
- Internationalization: Optional for MVP; separate strings to enable later i18n.
- Observability: Minimal, structured logs for critical path and offline queue state.

## Development Workflow

- Scope: Start with a single P1 user story that is independently deliverable offline.
- Contracts: If remote APIs are needed, define contracts first; all calls MUST handle offline
  and retries.
- Definition of Done:
  - Offline flow verified (airplane mode test) for the P1 journey.
  - Accessibility AA checked on mobile viewport.
  - Bundle budgets validated (build report attached).
  - Lint/format clean; critical-path smoke test passes.
- Release: Ship the MVP as an installable PWA; changes beyond MVP require explicit scope review.

## Governance

- Authority: This constitution supersedes other practices where conflicts arise.
- Amendment Procedure:
  - Open a PR describing proposed changes, rationale, and impact (principles/sections affected).
  - Provide migration/communication plan if behavior or gates change.
  - Upon approval, update this file with a semver bump and amendment date.
- Versioning Policy:
  - MAJOR: Backward‑incompatible changes to governance or removal/redefinition of principles.
  - MINOR: New principle/section added or materially expanded guidance.
  - PATCH: Clarifications and non‑semantic edits.
- Compliance Review:
  - Every PR MUST include a “Constitution Check” in the plan/spec: demonstrate adherence to:
    - Offline‑First gates (installable PWA, offline test evidence).
    - Simple UX gates (AA contrast, tap target sizes, shallow navigation).
    - Minimal Dependencies gates (dependency justification, size budget report).
    - Clean Code gates (lint/format CI passing; critical-path smoke test).
    - Performance gates (Lighthouse/Bundle size evidence).
  - CI SHOULD enforce these gates where automatable; reviewers MUST block if unmet.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date not provided | **Last Amended**: 2025-11-22
