# Kannada Learning PWA

An offline-first Progressive Web App for teaching Kannada to kids through bite-sized lessons and fun mini-games.

## Features

- 📚 **Interactive Lessons**: Learn Kannada vowels and consonants with audio pronunciation
- 🎮 **Mini-Games**: Reinforce learning with fun games (Match the Sound, Tap the Letter)
- ⭐ **Rewards & Streaks**: Earn stars, badges, and maintain daily learning streaks
- 👥 **Multi-Profile**: Support for multiple child profiles on one device
- 📴 **Offline-First**: Works fully offline after initial load
- 📱 **Mobile-Optimized**: Designed for mobile devices with AA accessibility

## Tech Stack

- **Frontend**: Preact (lightweight React alternative)
- **Build**: Vite + TypeScript
- **Games**: Phaser 3
- **Storage**: sql.js (WASM SQLite) + TypeORM + IndexedDB
- **PWA**: Service Worker with Workbox
- **Testing**: Vitest (unit), Playwright (E2E)

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd kada3

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

### Development Commands

```bash
# Lint code
npm run lint

# Format code
npm run format

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components (Home, Lessons, Games, Profiles)
├── services/        # Business logic and utilities
│   └── storage/    # Database and persistence
├── games/          # Phaser game scenes
├── db/             # TypeORM entities
│   └── entities/
├── sw/             # Service worker
└── styles/         # Global styles

public/
├── icons/          # PWA app icons
├── data/           # Static lesson content
└── manifest.webmanifest
```

## Documentation

For detailed implementation plans and specifications, see:

- [Feature Specification](specs/001-kannada-learning/spec.md)
- [Implementation Plan](specs/001-kannada-learning/plan.md)
- [Tasks Breakdown](specs/001-kannada-learning/tasks.md)
- [Data Model](specs/001-kannada-learning/data-model.md)
- [Quickstart Guide](specs/001-kannada-learning/quickstart.md)

## License

See [LICENSE](LICENSE) file for details.