# Quickstart: Kannada Learning PWA (Preact + Phaser + sql.js/TypeORM)

Date: 2025-11-22
Spec: /Users/hgowda/projects/tmp/kadaspec/specs/001-kannada-learning/spec.md
Plan: /Users/hgowda/projects/tmp/kadaspec/specs/001-kannada-learning/plan.md

This quickstart bootstraps a mobile-first PWA that works fully offline after first load. It uses:
- Preact for lightweight UI
- Phaser (lazy-loaded) for mini-games
- sql.js (WASM) + TypeORM (lazy-loaded) for local data with multi-profile support
- Service Worker + Cache Storage for app-shell and lesson assets

Constitution gates addressed:
- Offline‑first (installable PWA + offline lessons)
- Simple UX (mobile-first, AA, 2-tap primary action)
- Minimal dependencies (aggressive code-splitting; initial route ≤ 100 KB gz)
- Clean code (lint/format; modular)
- Performance budgets (TTI ≤ 2s; first-load ≤ 150 KB gz)

## 1) Prerequisites

- Node 18+ and pnpm or npm
- Git (optional)
- A modern mobile browser (Chrome/Android recommended for testing)

## 2) Create project (Vite + Preact + TS)

```bash
# Choose one package manager
pnpm create vite@latest app --template preact-ts
# or
npm create vite@latest app -- --template preact-ts

cd app
```

Install core deps (keep initial route slim; all heavy deps are lazy-loaded):
```bash
# UI/runtime
pnpm add preact

# Games (lazy)
pnpm add phaser

# Persistence (lazy)
pnpm add sql.js typeorm reflect-metadata idb-keyval

# Types and tooling
pnpm add -D typescript vite @types/node eslint prettier vite-plugin-pwa
```

Notes:
- reflect-metadata is required by TypeORM decorators (enable "experimentalDecorators" and "emitDecoratorMetadata" in tsconfig).

## 3) Configure TypeScript and routing

tsconfig.json (key flags, adjust as needed):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "moduleResolution": "Bundler",
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "types": ["vite/client"]
  }
}
```

Basic pages (code-split heavy routes):
- src/pages/Home.tsx (initial, minimal)
- src/pages/Lessons.tsx (dynamic import)
- src/pages/Games.tsx (dynamic import; loads Phaser only here)
- src/pages/Profiles.tsx (dynamic import; loads sql.js/TypeORM only here)

Example dynamic import (in a router or button click):
```ts
// Home.tsx
const goToGames = async () => {
  const { Games } = await import('../pages/Games');
  // navigate to Games (using your router of choice or simple state)
};
```

Avoid adding a routing library if not needed; a simple state machine is sufficient for MVP.

## 4) Service Worker and PWA manifest

public/manifest.webmanifest:
```json
{
  "name": "Kannada Learning",
  "short_name": "Kannada",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2c3e50",
  "icons": [
    { "src": "/icons/icon-192.png", "type": "image/png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "type": "image/png", "sizes": "512x512" }
  ]
}
```

Service worker entry src/sw/service-worker.ts:
- Precache: app shell (index.html, minimal JS/CSS, manifest, icons)
- Runtime cache: lesson assets (audio/images) with versioned cache names
- Atomic updates: use a version string and swap caches on activate

Minimal example (hand-rolled):
```ts
const CACHE_VERSION = 'v1';
const PRECACHE = `precache-${CACHE_VERSION}`;
const RUNTIME = `runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => (self as any).skipWaiting())
  );
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![PRECACHE, RUNTIME].includes(k)).map((k) => caches.delete(k)))
    ).then(() => (self as any).clients.claim())
  );
});

self.addEventListener('fetch', (event: any) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(RUNTIME).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => cached)
    )
  );
});
```

Register SW in src/main.tsx:
```ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw/service-worker.js').catch(console.error);
  });
}
```

Build-time: configure Vite to copy/emit SW and manifest from public/ or use vite-plugin-pwa later if needed.

## 5) Persistence (sql.js + TypeORM), lazy-initialized

src/services/storage/db.ts:
```ts
export async function loadSqlJs() {
  const initSqlJs = (await import('sql.js')).default;
  return initSqlJs({ locateFile: (file) => `/wasm/${file}` });
}
```

src/services/storage/orm.ts (lazy):
```ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';

let ds: DataSource | null = null;
export async function getDataSource(): Promise<DataSource> {
  if (ds) return ds;
  // dynamic imports of entities
  const { Profile } = await import('../../db/entities/Profile');
  // ... other entities
  ds = new DataSource({
    type: 'sqljs',
    autoSave: false,
    entities: [Profile /*, ...*/],
    synchronize: true
  });
  return ds.initialize();
}
```

src/services/storage/persist.ts:
- Serialize db to Uint8Array periodically and store to IndexedDB via idb-keyval.
- On app boot/Profiles page, load from IndexedDB (if present) into sql.js.

Pseudo:
```ts
import { set, get } from 'idb-keyval';
export async function saveDb(buffer: Uint8Array) { await set('db', buffer); }
export async function loadDb(): Promise<Uint8Array | null> { return (await get('db')) ?? null; }
```

Code-split: import getDataSource only inside Profiles/Lessons pages.

## 6) Phaser integration (lazy)

src/pages/Games.tsx:
```ts
export async function Games() {
  const Phaser = await import('phaser'); // lazy
  // init Phaser.Game with a simple scene, using local assets
}
```

Use small, compressed sprites/audio. Keep each mini-game under ~50–100 KB assets if possible.

## 7) Accessibility and Mobile UX

- Base font size ≥ 16px
- Tap targets ≥ 44×44 px
- High-contrast palette; text over images with overlay as needed
- Shallow navigation: Home → (Start Lesson | Play Game) in ≤ 2 taps

CSS tips: prefer CSS variables for theme; use clamp() for responsive type scaling.

## 8) Budgets and CI

Add a simple Lighthouse/Bundlesize check:
- Ensure initial route JS ≤ 100 KB gz (exclude lazy chunks)
- First load total ≤ 150 KB gz
- TTI ≤ 2s (Moto G4/Slow 3G profile in Lighthouse)

Run in CI on PRs; block merges if budgets fail.

## 9) Offline test (airplane mode)

1) Build and preview:
```bash
pnpm build
pnpm preview
```
2) Load app once online → add to home screen (optional).
3) Toggle airplane mode.
4) Verify:
- Home loads
- First lesson loads and completes
- Mini-game loads after navigation (lazy chunk cached)
- Progress persists across reloads while offline

## 10) Multi-profile

- Profiles screen creates/selects local profiles.
- Verify progress isolation between profiles.
- Confirm streak increments day-over-day per profile offline.

## Next Steps

- Implement entities per data-model.md with TypeORM decorators.
- Map openapi.yaml operations to local repository methods (no network).
- Attach audio/image assets into the SW runtime cache with versioned keys.
- Proceed to tasks breakdown (/speckit.tasks) and implementation.
