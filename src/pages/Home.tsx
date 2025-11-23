import { useState, useEffect } from 'preact/hooks';
import { getRepository } from '../services/storage/orm';
import { Progress, Streak } from '../db/entities';

interface HomeProps {
  onNavigate: (page: 'home' | 'lessons' | 'games' | 'profiles') => void;
}

interface Stats {
  lessonsCompleted: number;
  currentStreak: number;
  starsEarned: number;
}

export function Home({ onNavigate }: HomeProps) {
  const [stats, setStats] = useState<Stats>({
    lessonsCompleted: 0,
    currentStreak: 0,
    starsEarned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // TODO: Get current profile ID from context/state
      // For now, we'll use a default profile or show 0 if no profile exists
      const currentProfileId = localStorage.getItem('currentProfileId');

      if (currentProfileId) {
        const progressRepo = await getRepository(Progress);
        const streakRepo = await getRepository(Streak);

        // Get unique completed lessons count
        const completedLessons = await progressRepo
          .createQueryBuilder('progress')
          .where('progress.profileId = :profileId', { profileId: currentProfileId })
          .select('DISTINCT progress.lessonId')
          .getRawMany();

        // Get total stars earned
        const starsResult = await progressRepo
          .createQueryBuilder('progress')
          .where('progress.profileId = :profileId', { profileId: currentProfileId })
          .select('SUM(progress.stars)', 'total')
          .getRawOne();

        // Get current streak
        const streak = await streakRepo.findOne({
          where: { profileId: currentProfileId }
        });

        setStats({
          lessonsCompleted: completedLessons.length,
          currentStreak: streak?.currentCount || 0,
          starsEarned: starsResult?.total || 0
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

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
          <span class="stat-value">{loading ? '...' : stats.lessonsCompleted}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Current Streak</span>
          <span class="stat-value">{loading ? '...' : `${stats.currentStreak} days`}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Stars Earned</span>
          <span class="stat-value">{loading ? '...' : `${stats.starsEarned} ⭐`}</span>
        </div>
      </section>
    </div>
  );
}
