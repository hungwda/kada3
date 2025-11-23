interface GamesProps {
  onNavigate: (page: 'home' | 'lessons' | 'games' | 'profiles') => void;
}

export function Games({ onNavigate }: GamesProps) {
  return (
    <div class="games-page">
      <header class="page-header">
        <button class="back-button" onClick={() => onNavigate('home')}>
          ← Back
        </button>
        <h1>Mini Games</h1>
      </header>

      <section class="games-list">
        <div class="game-card">
          <h2>🎵 Match the Sound</h2>
          <p>Listen and match the correct Kannada letter</p>
          <button class="play-button" disabled>
            Coming Soon
          </button>
        </div>

        <div class="game-card">
          <h2>✋ Tap the Letter</h2>
          <p>Tap the correct letter from the grid</p>
          <button class="play-button" disabled>
            Coming Soon
          </button>
        </div>
      </section>
    </div>
  );
}
