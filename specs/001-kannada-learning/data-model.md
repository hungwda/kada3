# Data Model: Kannada Learning (Phase 1)

**Feature**: /Users/hgowda/projects/tmp/kadaspec/specs/001-kannada-learning/spec.md
**Scope**: Local-only persistence for offline-first PWA with multiple child profiles.
**Notes**: Conceptual schema; maps cleanly to TypeORM entities over sql.js (WASM). Keys are stable and designed for future evolutions.

## Entities

### Profile
Represents a local child user on the device.

- id (uuid, PK)
- name (string, 1–24 chars)
- avatar (string, optional, emoji/asset key)
- createdAt (datetime, default now)
- updatedAt (datetime, auto-update)
- lastActiveAt (datetime, nullable)

Constraints/Rules:
- Name required; trimmed; duplicate names allowed but discouraged (warn UI).
- Deleting a profile cascades: Progress, Streak, EarnedBadge rows.

Indexes:
- idx_profile_lastActiveAt (lastActiveAt)

---

### Lesson
Atomic learning unit (e.g., a Kannada letter, intro, or pronunciation lesson).

- id (uuid, PK)
- code (string, unique, e.g., "KA_001")
- title (string, 1–64 chars)
- type (enum: letter | intro | pronunciation)
- order (integer, >= 0, for sequencing)
- durationMin (integer, default 2, range 1–5)
- assets (json, optional)  // references to audio/image resources
- enabled (boolean, default true)

Constraints/Rules:
- order defines display sequence within type.
- duration target aligns with bite-sized design (2–3 minutes).

Indexes:
- ux_lesson_order (order, type)

---

### Activity
Interactive item linked to a Lesson (e.g., trace, match sound, tap letter).

- id (uuid, PK)
- lessonId (uuid, FK → Lesson.id)
- type (enum: trace | match_sound | tap_letter | quiz)
- promptRef (string, optional; refers to content snippet)
- target (json) // structure varies by activity (e.g., letter IDs, audio keys)
- difficulty (integer, 1–3, default 1)
- maxScore (integer, default 100)
- order (integer, >= 0)

Constraints/Rules:
- At least one Activity per Lesson for P1 lessons.
- Activity content must be available offline (assets precached or packaged).

Indexes:
- idx_activity_lesson_order (lessonId, order)

---

### Progress
Per-profile record of lesson outcomes and attempts.

- id (uuid, PK)
- profileId (uuid, FK → Profile.id)
- lessonId (uuid, FK → Lesson.id)
- completedAt (datetime)
- attempts (integer, default 1, >= 1)
- score (integer, 0–100)
- bestScore (integer, 0–100)
- stars (integer, 0–3)
- timeTakenSec (integer, >= 0)

Constraints/Rules:
- One row per completion attempt (history). bestScore can be denormalized for quick reads.
- Latest completion is the record with max(completedAt).

Indexes:
- idx_progress_profile_lesson (profileId, lessonId)
- idx_progress_profile_completedAt (profileId, completedAt DESC)

---

### Streak
Daily engagement tracker per profile.

- id (uuid, PK)
- profileId (uuid, FK → Profile.id, unique)
- currentCount (integer, default 0)
- longestCount (integer, default 0)
- lastActiveDate (date, nullable)

Constraints/Rules:
- Increment currentCount when activity occurs on consecutive days; break resets; longestCount tracks max.

Indexes:
- uq_streak_profile (profileId unique)

---

### Badge
Achievement definition.

- id (uuid, PK)
- code (string, unique, e.g., "BADGE_5_LESSONS")
- name (string, 1–48)
- description (string, 1–160)
- rule (json) // e.g., { "type": "lessons_completed", "count": 5 }
- icon (string, optional) // asset key

Constraints/Rules:
- Rule must be evaluable offline via Progress aggregates.

Indexes:
- uq_badge_code (code unique)

---

### EarnedBadge
Association: which profile earned which badge.

- id (uuid, PK)
- profileId (uuid, FK → Profile.id)
- badgeId (uuid, FK → Badge.id)
- earnedAt (datetime)

Constraints/Rules:
- Unique per (profileId, badgeId).
- Insert on rule satisfaction; idempotent checks required.

Indexes:
- uq_earnedBadge_profile_badge (profileId, badgeId unique)

---

### Settings
Local preferences applicable to UI/UX and helpers.

- id (integer, PK, singleton row = 1)
- languagePref (enum: kn | kn_en_helpers, default kn_en_helpers)
- audioOn (boolean, default true)
- hapticsOn (boolean, default true)

Constraints/Rules:
- Single row enforced by convention; migrations maintain defaults.

---

### Asset
Metadata for local static assets used in lessons/games.

- id (uuid, PK)
- kind (enum: audio | image | sprite | font | data)
- path (string) // cache key/path
- checksum (string) // for cache integrity
- version (string)

Constraints/Rules:
- Managed by SW and content pipeline; ensures offline availability and atomic updates.

Indexes:
- idx_asset_path (path)

## Relationships

- Profile 1—N Progress
- Profile 1—1 Streak
- Profile N—N Badge via EarnedBadge
- Lesson 1—N Activity
- Settings is a singleton
- Asset is standalone; referenced by Lessons/Activities via assets or target fields

## Validation Rules (derived from spec)

- Lessons must target 2–3 minutes; enforce via durationMin and content validation.
- Accessibility: Not stored in DB; enforced at UI design-time, but violations logged with context.
- Local-only: No external IDs; all references are local UUIDs or codes.
- Offline-first: Inserts/updates must never fail if no network; persistence to IndexedDB must be queued/retried on quota/transient errors with user-safe messaging.

## Derived Views (read models)

- ProfileOverview(profileId): latest completion per lesson, stars, streak summary, earned badges.
- LessonProgress(lessonId, profileId): history, bestScore, lastCompletedAt.

## Migration Notes

- Use semantic versioning for schema changes (stored in a meta table, e.g., SchemaVersion).
- Write migration steps as pure SQL statements applicable to sql.js, executed at app boot when a version bump is detected.

## Data Retention and Privacy

- Audience under 13; all data local-only in MVP.
- Optional data wipe per profile; global wipe for device transfer or parental request.

## Example TypeORM Mapping Notes (informative)

- UUID columns as `varchar(36)` in sql.js; enforce in entity decorators.
- Date/time stored as ISO strings (UTC) for portability; convert at edges.
- Composite unique indices via `@Unique([...])` on EarnedBadge and Badge.
