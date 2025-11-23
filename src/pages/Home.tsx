interface HomeProps {
  onNavigate: (page: 'home' | 'lessons' | 'games' | 'profiles') => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div class="home-page">
      <header class="home-header">
        <h1>Welcome to Kannada Learning!</h1>
        <p>Learn Kannada letters and sounds through fun lessons and games</p>
      </header>

      <section class="primary-actions">
        <button class="action-button primary" onClick={() => onNavigate('lessons')}>
          📚 Start Learning
        </button>
        <button class="action-button secondary" onClick={() => onNavigate('games')}>
          🎮 Play Games
        </button>
      </section>

      <section class="stats-overview">
        <div class="stat-card">
          <span class="stat-label">Lessons Completed</span>
          <span class="stat-value">0</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Current Streak</span>
          <span class="stat-value">0 days</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Stars Earned</span>
          <span class="stat-value">0 ⭐</span>
        </div>
      </section>
    </div>
  );
}
