/**
 * Simplified tap-letter game (DOM-based instead of Phaser for MVP)
 * Can be enhanced with Phaser later
 */

export interface TapLetterGameConfig {
  letters: Array<{
    letter: string;
    prompt: string;
  }>;
  gridSize: number;
  onComplete: (score: number, stars: number) => void;
}

export class TapLetterGame {
  private config: TapLetterGameConfig;
  private currentIndex = 0;
  private score = 0;
  private startTime = Date.now();
  private container: HTMLElement | null = null;

  constructor(config: TapLetterGameConfig) {
    this.config = config;
  }

  mount(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render() {
    if (!this.container) return;

    const current = this.config.letters[this.currentIndex];
    const grid = this.generateGrid(current.letter);

    this.container.innerHTML = `
      <div class="tap-letter-game">
        <h3>${current.prompt}</h3>
        <div class="target-letter">Tap: ${current.letter}</div>
        <div class="letter-grid" style="grid-template-columns: repeat(${this.config.gridSize}, 1fr)">
          ${grid.map(letter => `
            <button class="grid-letter" data-letter="${letter}">
              ${letter}
            </button>
          `).join('')}
        </div>
        <div class="game-score">Score: ${this.score}/${this.config.letters.length}</div>
      </div>
    `;

    this.attachEventListeners(current.letter);
  }

  private generateGrid(correctLetter: string): string[] {
    const gridCount = this.config.gridSize * this.config.gridSize;
    const allLetters = this.config.letters.map(l => l.letter);
    const grid: string[] = [];

    // Add correct letter once
    grid.push(correctLetter);

    // Fill rest with random letters
    while (grid.length < gridCount) {
      const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
      grid.push(randomLetter);
    }

    // Shuffle
    return grid.sort(() => Math.random() - 0.5);
  }

  private attachEventListeners(correctLetter: string) {
    const letters = this.container?.querySelectorAll('.grid-letter');
    letters?.forEach(letter => {
      letter.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const selected = target.dataset.letter;

        if (selected === correctLetter) {
          this.score++;
          target.style.backgroundColor = '#2ecc71';
          setTimeout(() => this.nextRound(), 500);
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
    const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
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
