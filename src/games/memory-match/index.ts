export interface MemoryMatchGameConfig {
  letters: Array<{
    letter: string;
    pronunciation?: string;
  }>;
  onComplete: (score: number, stars: number) => void;
}

interface Card {
  id: number;
  letter: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export class MemoryMatchGame {
  private config: MemoryMatchGameConfig;
  private cards: Card[] = [];
  private flippedCards: Card[] = [];
  private matchedPairs = 0;
  private attempts = 0;
  private container: HTMLElement | null = null;
  private canFlip = true;

  constructor(config: MemoryMatchGameConfig) {
    this.config = config;
  }

  mount(container: HTMLElement) {
    this.container = container;
    this.initializeCards();
    this.render();
    this.attachEventListeners();
  }

  private initializeCards() {
    // Take first 6 letters and create pairs
    const letters = this.config.letters.slice(0, 6);

    // Create pairs
    const pairs = letters.flatMap((letter, index) => [
      { id: index * 2, letter: letter.letter, isFlipped: false, isMatched: false },
      { id: index * 2 + 1, letter: letter.letter, isFlipped: false, isMatched: false }
    ]);

    // Shuffle cards
    this.cards = pairs.sort(() => Math.random() - 0.5);
  }

  private render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="memory-match-game">
        <div class="game-header">
          <h2>Memory Match</h2>
          <div class="game-stats">
            <span>Pairs: ${this.matchedPairs}/6</span>
            <span>Attempts: ${this.attempts}</span>
          </div>
        </div>
        <div class="memory-grid">
          ${this.cards.map(card => `
            <div class="memory-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}"
                 data-id="${card.id}">
              <div class="card-front">?</div>
              <div class="card-back">${card.letter}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    if (!this.container) return;

    const cardElements = this.container.querySelectorAll('.memory-card');
    cardElements.forEach(cardEl => {
      cardEl.addEventListener('click', (e) => {
        const id = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
        this.flipCard(id);
      });
    });
  }

  private flipCard(id: number) {
    if (!this.canFlip) return;

    const card = this.cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    card.isFlipped = true;
    this.flippedCards.push(card);

    this.updateCardDisplay(id);

    if (this.flippedCards.length === 2) {
      this.canFlip = false;
      this.attempts++;
      this.checkMatch();
    }
  }

  private updateCardDisplay(id: number) {
    const cardEl = this.container?.querySelector(`.memory-card[data-id="${id}"]`);
    if (cardEl) {
      cardEl.classList.add('flipped');
    }

    // Update stats
    const statsEl = this.container?.querySelector('.game-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <span>Pairs: ${this.matchedPairs}/6</span>
        <span>Attempts: ${this.attempts}</span>
      `;
    }
  }

  private checkMatch() {
    const [card1, card2] = this.flippedCards;

    if (card1.letter === card2.letter) {
      // Match!
      card1.isMatched = true;
      card2.isMatched = true;
      this.matchedPairs++;

      const cardEl1 = this.container?.querySelector(`.memory-card[data-id="${card1.id}"]`);
      const cardEl2 = this.container?.querySelector(`.memory-card[data-id="${card2.id}"]`);
      cardEl1?.classList.add('matched');
      cardEl2?.classList.add('matched');

      this.flippedCards = [];
      this.canFlip = true;

      // Update stats
      const statsEl = this.container?.querySelector('.game-stats');
      if (statsEl) {
        statsEl.innerHTML = `
          <span>Pairs: ${this.matchedPairs}/6</span>
          <span>Attempts: ${this.attempts}</span>
        `;
      }

      // Check if game is complete
      if (this.matchedPairs === 6) {
        setTimeout(() => this.endGame(), 500);
      }
    } else {
      // No match
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;

        const cardEl1 = this.container?.querySelector(`.memory-card[data-id="${card1.id}"]`);
        const cardEl2 = this.container?.querySelector(`.memory-card[data-id="${card2.id}"]`);
        cardEl1?.classList.remove('flipped');
        cardEl2?.classList.remove('flipped');

        this.flippedCards = [];
        this.canFlip = true;
      }, 1000);
    }
  }

  private endGame() {
    // Score based on attempts (fewer is better)
    // Perfect game: 6 attempts (100%)
    // Calculate percentage
    const perfectAttempts = 6;
    const percentage = Math.max(0, Math.min(100, (perfectAttempts / this.attempts) * 100));

    let stars = 1;
    if (percentage >= 90) stars = 3;
    else if (percentage >= 70) stars = 2;

    // For score, use matched pairs
    this.config.onComplete(this.matchedPairs, stars);
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.cards = [];
    this.flippedCards = [];
  }
}
