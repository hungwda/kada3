export interface BubblePopGameConfig {
  letters: Array<{
    letter: string;
    pronunciation?: string;
  }>;
  onComplete: (score: number, stars: number) => void;
}

interface Bubble {
  id: number;
  letter: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  isCorrect: boolean;
}

export class BubblePopGame {
  private config: BubblePopGameConfig;
  private currentIndex = 0;
  private score = 0;
  private container: HTMLElement | null = null;
  private bubbles: Bubble[] = [];
  private animationFrame: number | null = null;
  private gameArea: HTMLElement | null = null;

  constructor(config: BubblePopGameConfig) {
    this.config = config;
  }

  mount(container: HTMLElement) {
    this.container = container;
    this.render();
    this.startRound();
  }

  private render() {
    if (!this.container) return;

    const currentLetter = this.config.letters[this.currentIndex];

    this.container.innerHTML = `
      <div class="bubble-pop-game">
        <div class="game-header">
          <h2>Pop the Bubbles!</h2>
          <div class="progress-text">Letter ${this.currentIndex + 1} of ${this.config.letters.length}</div>
        </div>
        <div class="target-letter">
          <span class="target-label">Find:</span>
          <span class="target-value">${currentLetter.letter}</span>
          ${currentLetter.pronunciation ? `<button class="play-sound-btn">🔊</button>` : ''}
        </div>
        <div class="bubble-game-area"></div>
      </div>
    `;

    this.gameArea = this.container.querySelector('.bubble-game-area');

    const playBtn = this.container.querySelector('.play-sound-btn');
    if (playBtn && currentLetter.pronunciation) {
      playBtn.addEventListener('click', () => {
        const audio = new Audio(currentLetter.pronunciation);
        audio.play();
      });
    }
  }

  private startRound() {
    const currentLetter = this.config.letters[this.currentIndex];

    // Get random wrong letters
    const wrongLetters = this.config.letters
      .filter((_, i) => i !== this.currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(l => l.letter);

    // Create bubbles with current letter and wrong letters
    const allLetters = [currentLetter.letter, ...wrongLetters];

    this.bubbles = allLetters.map((letter, i) => ({
      id: i,
      letter,
      x: Math.random() * 80 + 10, // Random x position (10-90% of width)
      y: 100 + Math.random() * 20, // Start below screen
      speed: 0.3 + Math.random() * 0.5, // Random speed
      size: 60 + Math.random() * 20,
      isCorrect: letter === currentLetter.letter
    }));

    this.animate();
  }

  private animate() {
    if (!this.gameArea) return;

    // Update bubble positions
    this.bubbles = this.bubbles.filter(bubble => {
      bubble.y -= bubble.speed;
      return bubble.y > -20; // Remove bubbles that went off screen
    });

    // Render bubbles
    this.gameArea.innerHTML = this.bubbles.map(bubble => `
      <div class="bubble"
           data-id="${bubble.id}"
           style="
             left: ${bubble.x}%;
             bottom: ${bubble.y}%;
             width: ${bubble.size}px;
             height: ${bubble.size}px;
           ">
        <span class="bubble-letter">${bubble.letter}</span>
      </div>
    `).join('');

    // Attach click handlers
    this.gameArea.querySelectorAll('.bubble').forEach(bubbleEl => {
      bubbleEl.addEventListener('click', (e) => {
        const id = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
        this.popBubble(id);
      });
    });

    // Check if all bubbles are gone (player failed)
    if (this.bubbles.length === 0) {
      this.nextRound();
      return;
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  private popBubble(id: number) {
    const bubble = this.bubbles.find(b => b.id === id);
    if (!bubble) return;

    if (bubble.isCorrect) {
      this.score++;
      this.showFeedback(true);
      setTimeout(() => this.nextRound(), 500);
    } else {
      this.showFeedback(false);
      // Remove wrong bubble
      this.bubbles = this.bubbles.filter(b => b.id !== id);
    }
  }

  private showFeedback(correct: boolean) {
    if (!this.container) return;

    const feedback = document.createElement('div');
    feedback.className = `feedback ${correct ? 'correct' : 'wrong'}`;
    feedback.textContent = correct ? '✓' : '✗';
    this.container.appendChild(feedback);

    setTimeout(() => feedback.remove(), 500);
  }

  private nextRound() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.currentIndex++;

    if (this.currentIndex < this.config.letters.length) {
      this.render();
      this.startRound();
    } else {
      this.endGame();
    }
  }

  private endGame() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const totalQuestions = this.config.letters.length;
    const percentage = (this.score / totalQuestions) * 100;

    let stars = 1;
    if (percentage >= 90) stars = 3;
    else if (percentage >= 70) stars = 2;

    this.config.onComplete(this.score, stars);
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.bubbles = [];
  }
}
