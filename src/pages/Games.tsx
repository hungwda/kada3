import { useState, useEffect, useRef } from 'preact/hooks';
import { MatchSoundGame } from '../games/match-sound';
import { TapLetterGame } from '../games/tap-letter';
import { LetterTracingGame } from '../games/letter-tracing';
import { BubblePopGame } from '../games/bubble-pop';
import { MemoryMatchGame } from '../games/memory-match';
import { DragDropGame } from '../games/drag-drop';
import { ChooseSoundGame } from '../games/choose-sound';
import { getCachedAsset } from '../services/cache';
import { getRepository } from '../services/storage/orm';
import { Progress } from '../db/entities';

interface GamesProps {
  onNavigate: (page: 'home' | 'lessons' | 'games' | 'profiles') => void;
}

type GameType = 'match-sound' | 'tap-letter' | 'letter-tracing' | 'bubble-pop' | 'memory-match' | 'drag-drop' | 'choose-sound' | null;

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
  const gameInstanceRef = useRef<MatchSoundGame | TapLetterGame | LetterTracingGame | BubblePopGame | MemoryMatchGame | DragDropGame | ChooseSoundGame | null>(null);

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
      for (const game of ['match-sound', 'tap-letter', 'letter-tracing', 'bubble-pop', 'memory-match', 'drag-drop', 'choose-sound']) {
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
      } else if (gameType === 'letter-tracing') {
        const game = new LetterTracingGame({
          letters: letters.map((l: any) => ({
            letter: l.assets.letter,
            pronunciation: l.assets.pronunciation
          })),
          onComplete: (score, stars) => handleGameComplete('letter-tracing', score, stars)
        });
        gameInstanceRef.current = game;
        game.mount(gameContainerRef.current);
      } else if (gameType === 'bubble-pop') {
        const game = new BubblePopGame({
          letters: letters.map((l: any) => ({
            letter: l.assets.letter,
            pronunciation: l.assets.pronunciation
          })),
          onComplete: (score, stars) => handleGameComplete('bubble-pop', score, stars)
        });
        gameInstanceRef.current = game;
        game.mount(gameContainerRef.current);
      } else if (gameType === 'memory-match') {
        const game = new MemoryMatchGame({
          letters: letters.map((l: any) => ({
            letter: l.assets.letter,
            pronunciation: l.assets.pronunciation
          })),
          onComplete: (score, stars) => handleGameComplete('memory-match', score, stars)
        });
        gameInstanceRef.current = game;
        game.mount(gameContainerRef.current);
      } else if (gameType === 'drag-drop') {
        const game = new DragDropGame({
          letters: letters.map((l: any) => ({
            letter: l.assets.letter,
            pronunciation: l.assets.pronunciation,
            image: l.assets.image
          })),
          onComplete: (score, stars) => handleGameComplete('drag-drop', score, stars)
        });
        gameInstanceRef.current = game;
        game.mount(gameContainerRef.current);
      } else if (gameType === 'choose-sound') {
        const game = new ChooseSoundGame({
          letters: letters.map((l: any) => ({
            letter: l.assets.letter,
            pronunciation: l.assets.pronunciation
          })),
          onComplete: (score, stars) => handleGameComplete('choose-sound', score, stars)
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
    const gameTitles: Record<string, string> = {
      'match-sound': 'Match the Sound',
      'tap-letter': 'Tap the Letter',
      'letter-tracing': 'Letter Tracing',
      'bubble-pop': 'Bubble Pop',
      'memory-match': 'Memory Match',
      'drag-drop': 'Drag & Drop',
      'choose-sound': 'Choose the Right Sound'
    };

    return (
      <div class="games-page">
        <header class="page-header">
          <button class="back-button" onClick={() => setCurrentGame(null)}>
            ← Back to Games
          </button>
          <h1>{gameTitles[currentGame]}</h1>
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

        <div class="game-card">
          <h2>✏️ Letter Tracing</h2>
          <p>Trace the letters with your finger</p>
          {gameScores.has('letter-tracing') && (
            <p class="game-stats">
              Last: {gameScores.get('letter-tracing')?.lastScore} | {gameScores.get('letter-tracing')?.lastStars} ⭐
            </p>
          )}
          <button class="play-button action-button primary" onClick={() => setCurrentGame('letter-tracing')}>
            Play Now
          </button>
        </div>

        <div class="game-card">
          <h2>🫧 Bubble Pop</h2>
          <p>Pop the correct letter bubble</p>
          {gameScores.has('bubble-pop') && (
            <p class="game-stats">
              Last: {gameScores.get('bubble-pop')?.lastScore} | {gameScores.get('bubble-pop')?.lastStars} ⭐
            </p>
          )}
          <button class="play-button action-button primary" onClick={() => setCurrentGame('bubble-pop')}>
            Play Now
          </button>
        </div>

        <div class="game-card">
          <h2>🧠 Memory Match</h2>
          <p>Find matching pairs of letters</p>
          {gameScores.has('memory-match') && (
            <p class="game-stats">
              Last: {gameScores.get('memory-match')?.lastScore} | {gameScores.get('memory-match')?.lastStars} ⭐
            </p>
          )}
          <button class="play-button action-button primary" onClick={() => setCurrentGame('memory-match')}>
            Play Now
          </button>
        </div>

        <div class="game-card">
          <h2>🎯 Drag & Drop</h2>
          <p>Drag the letter to the correct spot</p>
          {gameScores.has('drag-drop') && (
            <p class="game-stats">
              Last: {gameScores.get('drag-drop')?.lastScore} | {gameScores.get('drag-drop')?.lastStars} ⭐
            </p>
          )}
          <button class="play-button action-button primary" onClick={() => setCurrentGame('drag-drop')}>
            Play Now
          </button>
        </div>

        <div class="game-card">
          <h2>🔊 Choose the Right Sound</h2>
          <p>Listen and choose the correct letter</p>
          {gameScores.has('choose-sound') && (
            <p class="game-stats">
              Last: {gameScores.get('choose-sound')?.lastScore} | {gameScores.get('choose-sound')?.lastStars} ⭐
            </p>
          )}
          <button class="play-button action-button primary" onClick={() => setCurrentGame('choose-sound')}>
            Play Now
          </button>
        </div>
      </section>
    </div>
  );
}
