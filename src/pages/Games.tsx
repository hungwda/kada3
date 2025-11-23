import { useState, useEffect, useRef } from 'preact/hooks';
import { MatchSoundGame } from '../games/match-sound';
import { TapLetterGame } from '../games/tap-letter';
import { getCachedAsset } from '../services/cache';
import { getRepository } from '../services/storage/orm';
import { Progress } from '../db/entities';

interface GamesProps {
  onNavigate: (page: 'home' | 'lessons' | 'games' | 'profiles') => void;
}

type GameType = 'match-sound' | 'tap-letter' | null;

interface GameScore {
  game: string;
  lastScore: number;
  lastStars: number;
  plays: number;
}

export function Games({ onNavigate }: GamesProps) {
  const [currentGame, setCurrentGame] = useState<GameType>(null);
  const [gameScores, setGameScores] = useState<Map<string, GameScore>>(new Map());
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<MatchSoundGame | TapLetterGame | null>(null);

  useEffect(() => {
    loadGameScores();
  }, []);

  useEffect(() => {
    if (currentGame && gameContainerRef.current) {
      startGame(currentGame);
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, [currentGame]);

  async function loadGameScores() {
    try {
      const currentProfileId = localStorage.getItem('currentProfileId');
      if (!currentProfileId) return;

      const progressRepo = await getRepository(Progress);
      const scores = new Map<string, GameScore>();

      // Load scores for each game type
      for (const game of ['match-sound', 'tap-letter']) {
        const gameProgress = await progressRepo
          .createQueryBuilder('progress')
          .where('progress.profileId = :profileId', { profileId: currentProfileId })
          .andWhere('progress.lessonId LIKE :gamePrefix', { gamePrefix: `game-${game}%` })
          .orderBy('progress.completedAt', 'DESC')
          .getMany();

        if (gameProgress.length > 0) {
          const latest = gameProgress[0];
          scores.set(game, {
            game,
            lastScore: latest.score,
            lastStars: latest.stars,
            plays: gameProgress.length
          });
        }
      }

      setGameScores(scores);
    } catch (error) {
      console.error('Failed to load game scores:', error);
    }
  }

  async function startGame(gameType: GameType) {
    if (!gameType || !gameContainerRef.current) return;

    try {
      // Load lesson data
      const response = await getCachedAsset('/data/lessons/letters.json');
      const data = await response.json();
      const letters = data.lessons.slice(0, 5); // Use first 5 letters for games

      if (gameType === 'match-sound') {
        const game = new MatchSoundGame({
          letters: letters.map((l: any) => ({
            letter: l.assets.letter,
            audioUrl: l.assets.pronunciation
          })),
          onComplete: (score, stars) => handleGameComplete('match-sound', score, stars)
        });
        gameInstanceRef.current = game;
        game.mount(gameContainerRef.current);
      } else if (gameType === 'tap-letter') {
        const game = new TapLetterGame({
          letters: letters.map((l: any) => ({
            letter: l.assets.letter,
            prompt: `Tap the letter: ${l.title}`
          })),
          gridSize: 4,
          onComplete: (score, stars) => handleGameComplete('tap-letter', score, stars)
        });
        gameInstanceRef.current = game;
        game.mount(gameContainerRef.current);
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to load game. Please try again.');
      setCurrentGame(null);
    }
  }

  async function handleGameComplete(gameType: string, score: number, stars: number) {
    try {
      const currentProfileId = localStorage.getItem('currentProfileId');
      if (!currentProfileId) {
        alert('Please create a profile first');
        return;
      }

      const progressRepo = await getRepository(Progress);

      // Record game result
      const gameProgress = progressRepo.create({
        id: crypto.randomUUID(),
        profileId: currentProfileId,
        lessonId: `game-${gameType}-${Date.now()}`,
        completedAt: new Date(),
        attempts: 1,
        score,
        bestScore: score,
        stars,
        timeTakenSec: 180
      });

      await progressRepo.save(gameProgress);

      // Show results
      alert(`🎉 Game Complete!\nScore: ${score}\nStars: ${'⭐'.repeat(stars)}`);

      // Reload scores and return to menu
      await loadGameScores();
      setCurrentGame(null);
    } catch (error) {
      console.error('Failed to save game score:', error);
      alert('Failed to save score. Please try again.');
      setCurrentGame(null);
    }
  }

  // Game view
  if (currentGame) {
    return (
      <div class="games-page">
        <header class="page-header">
          <button class="back-button" onClick={() => setCurrentGame(null)}>
            ← Back to Games
          </button>
          <h1>{currentGame === 'match-sound' ? 'Match the Sound' : 'Tap the Letter'}</h1>
        </header>
        <div ref={gameContainerRef} class="game-container"></div>
      </div>
    );
  }

  // Game selection menu
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
          {gameScores.has('match-sound') && (
            <p class="game-stats">
              Last: {gameScores.get('match-sound')?.lastScore} | {gameScores.get('match-sound')?.lastStars} ⭐
            </p>
          )}
          <button class="play-button action-button primary" onClick={() => setCurrentGame('match-sound')}>
            Play Now
          </button>
        </div>

        <div class="game-card">
          <h2>✋ Tap the Letter</h2>
          <p>Tap the correct letter from the grid</p>
          {gameScores.has('tap-letter') && (
            <p class="game-stats">
              Last: {gameScores.get('tap-letter')?.lastScore} | {gameScores.get('tap-letter')?.lastStars} ⭐
            </p>
          )}
          <button class="play-button action-button primary" onClick={() => setCurrentGame('tap-letter')}>
            Play Now
          </button>
        </div>
      </section>
    </div>
  );
}
