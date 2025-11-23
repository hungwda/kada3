/**
 * Simplified match-sound game (DOM-based instead of Phaser for MVP)
 * Can be enhanced with Phaser later
 */

export interface MatchSoundGameConfig {
  letters: Array<{
    letter: string;
    audioUrl: string;
  }>;
  onComplete: (score: number, stars: number) => void;
}

export class MatchSoundGame {
  private config: MatchSoundGameConfig;
  private currentIndex = 0;
  private score = 0;
  private container: HTMLElement | null = null;

  constructor(config: MatchSoundGameConfig) {
    this.config = config;
  }

  mount(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render() {
    if (!this.container) return;

    const current = this.config.letters[this.currentIndex];
    const options = this.getRandomOptions(current.letter);

    this.container.innerHTML = `
      <div class="match-sound-game">
        <h3>Listen and tap the correct letter</h3>
        <button class="play-sound-btn">🔊 Play Sound</button>
        <div class="letter-options">
          ${options.map(opt => `
            <button class="letter-option" data-letter="${opt}">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div class="game-score">Score: ${this.score}/${this.config.letters.length}</div>
      </div>
    `;

    this.attachEventListeners(current.letter, current.audioUrl);
  }

  private getRandomOptions(correctLetter: string): string[] {
    // Get 3 random wrong letters + correct letter
    const allLetters = this.config.letters.map(l => l.letter);
    const wrongLetters = allLetters.filter(l => l !== correctLetter);
    const selected = wrongLetters.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...selected, correctLetter].sort(() => Math.random() - 0.5);
  }

  private attachEventListeners(correctLetter: string, audioUrl: string) {
    const playBtn = this.container?.querySelector('.play-sound-btn');
    playBtn?.addEventListener('click', () => {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error('Audio play failed:', err));
    });

    const options = this.container?.querySelectorAll('.letter-option');
    options?.forEach(opt => {
      opt.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const selected = target.dataset.letter;

        if (selected === correctLetter) {
          this.score++;
          this.nextRound();
        } else {
          target.style.backgroundColor = '#e74c3c';
          setTimeout(() => {
            target.style.backgroundColor = '';
          }, 500);
        }
      });
    });
  }

  private nextRound() {
    this.currentIndex++;
    if (this.currentIndex >= this.config.letters.length) {
      this.endGame();
    } else {
      this.render();
    }
  }

  private endGame() {
    const percentage = (this.score / this.config.letters.length) * 100;
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : 1;
    this.config.onComplete(this.score, stars);
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
