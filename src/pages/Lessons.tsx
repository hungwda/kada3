import { useState, useEffect } from 'preact/hooks';
import { audioService } from '../services/audio';
import { getCachedAsset } from '../services/cache';
import { getRepository } from '../services/storage/orm';
import { Progress } from '../db/entities';

interface LessonsProps {
  onNavigate: (page: 'home' | 'lessons' | 'games' | 'profiles') => void;
}

interface LessonData {
  id: string;
  code: string;
  title: string;
  type: string;
  order: number;
  durationMin: number;
  assets: {
    letter: string;
    pronunciation: string;
    image?: string;
  };
  enabled: boolean;
}

interface LessonProgress {
  completed: boolean;
  stars: number;
  bestScore: number;
}

export function Lessons({ onNavigate }: LessonsProps) {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null);
  const [progress, setProgress] = useState<Map<string, LessonProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    try {
      // Load lessons from cached JSON
      const response = await getCachedAsset('/data/lessons/letters.json');
      const data = await response.json();
      setLessons(data.lessons || []);

      // Load progress for current profile
      await loadProgress(data.lessons || []);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProgress(lessonsList: LessonData[]) {
    try {
      const currentProfileId = localStorage.getItem('currentProfileId');
      if (!currentProfileId) return;

      const progressRepo = await getRepository(Progress);
      const progressMap = new Map<string, LessonProgress>();

      for (const lesson of lessonsList) {
        const lessonProgress = await progressRepo
          .createQueryBuilder('progress')
          .where('progress.profileId = :profileId', { profileId: currentProfileId })
          .andWhere('progress.lessonId = :lessonId', { lessonId: lesson.id })
          .orderBy('progress.completedAt', 'DESC')
          .getOne();

        if (lessonProgress) {
          progressMap.set(lesson.id, {
            completed: true,
            stars: lessonProgress.stars,
            bestScore: lessonProgress.bestScore
          });
        }
      }

      setProgress(progressMap);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }

  async function playAudio(audioUrl: string) {
    try {
      await audioService.play(audioUrl);
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }

  async function completeLesson(lesson: LessonData) {
    setCompleting(true);
    try {
      const currentProfileId = localStorage.getItem('currentProfileId');
      if (!currentProfileId) {
        alert('Please create a profile first');
        return;
      }

      const progressRepo = await getRepository(Progress);

      // Create progress record
      const newProgress = progressRepo.create({
        id: crypto.randomUUID(),
        profileId: currentProfileId,
        lessonId: lesson.id,
        completedAt: new Date(),
        attempts: 1,
        score: 100,
        bestScore: 100,
        stars: 3,
        timeTakenSec: 120
      });

      await progressRepo.save(newProgress);

      // Update local progress state
      const newProgressMap = new Map(progress);
      newProgressMap.set(lesson.id, {
        completed: true,
        stars: 3,
        bestScore: 100
      });
      setProgress(newProgressMap);

      // Show completion feedback
      alert(`🎉 Great job! You completed: ${lesson.title}`);
      setSelectedLesson(null);
    } catch (error) {
      console.error('Failed to save progress:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div class="lessons-page">
        <p class="placeholder-text">Loading lessons...</p>
      </div>
    );
  }

  // Detail view
  if (selectedLesson) {
    const lessonProgress = progress.get(selectedLesson.id);
    return (
      <div class="lessons-page">
        <header class="page-header">
          <button class="back-button" onClick={() => setSelectedLesson(null)}>
            ← Back to Lessons
          </button>
          <h1>{selectedLesson.title}</h1>
        </header>

        <section class="lesson-detail">
          <div class="letter-display">
            <h2 class="kannada-letter">{selectedLesson.assets.letter}</h2>
          </div>

          <button
            class="action-button primary"
            onClick={() => playAudio(selectedLesson.assets.pronunciation)}
          >
            🔊 Play Pronunciation
          </button>

          <div class="lesson-info">
            <p>Duration: ~{selectedLesson.durationMin} minutes</p>
            {lessonProgress?.completed && (
              <p class="completion-badge">
                ✓ Completed | {lessonProgress.stars} ⭐ | Score: {lessonProgress.bestScore}
              </p>
            )}
          </div>

          {!lessonProgress?.completed && (
            <button
              class="action-button secondary"
              onClick={() => completeLesson(selectedLesson)}
              disabled={completing}
            >
              {completing ? 'Saving...' : 'Mark as Complete'}
            </button>
          )}
        </section>
      </div>
    );
  }

  // List view
  return (
    <div class="lessons-page">
      <header class="page-header">
        <button class="back-button" onClick={() => onNavigate('home')}>
          ← Back
        </button>
        <h1>Kannada Lessons</h1>
      </header>

      <section class="lessons-list">
        <p class="info-text">
          Learn Kannada vowels (ಸ್ವರಗಳು) and consonants (ವ್ಯಂಜನಗಳು) with audio pronunciation
        </p>

        <div class="lessons-grid">
          {lessons.map(lesson => {
            const lessonProgress = progress.get(lesson.id);
            return (
              <div
                key={lesson.id}
                class={`lesson-card ${lessonProgress?.completed ? 'completed' : ''}`}
                onClick={() => setSelectedLesson(lesson)}
              >
                <div class="lesson-letter">{lesson.assets.letter}</div>
                <div class="lesson-title">{lesson.title}</div>
                {lessonProgress?.completed && (
                  <div class="lesson-stars">
                    {Array.from({ length: lessonProgress.stars }, (_, i) => '⭐').join('')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
