export interface LetterTracingGameConfig {
  letters: Array<{
    letter: string;
    pronunciation?: string;
  }>;
  onComplete: (score: number, stars: number) => void;
}

export class LetterTracingGame {
  private config: LetterTracingGameConfig;
  private currentIndex = 0;
  private score = 0;
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private traceProgress = 0;
  private minProgress = 50; // Minimum percentage to consider letter traced

  constructor(config: LetterTracingGameConfig) {
    this.config = config;
  }

  mount(container: HTMLElement) {
    this.container = container;
    this.render();
    this.attachEventListeners();
  }

  private render() {
    if (!this.container) return;

    const currentLetter = this.config.letters[this.currentIndex];

    this.container.innerHTML = `
      <div class="letter-tracing-game">
        <div class="game-header">
          <h2>Trace the Letter</h2>
          <div class="progress-text">Letter ${this.currentIndex + 1} of ${this.config.letters.length}</div>
        </div>
        <div class="tracing-area">
          <div class="letter-display">${currentLetter.letter}</div>
          <canvas id="tracing-canvas" width="300" height="300"></canvas>
          <div class="trace-progress-bar">
            <div class="trace-progress-fill" style="width: 0%"></div>
          </div>
        </div>
        <div class="tracing-controls">
          <button class="clear-btn">Clear</button>
          <button class="next-btn" disabled>Next</button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#tracing-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext('2d') || null;

    if (this.ctx) {
      // Draw the letter outline on canvas as a guide
      this.ctx.font = '200px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.strokeStyle = '#e0e0e0';
      this.ctx.lineWidth = 4;
      this.ctx.strokeText(currentLetter.letter, 150, 150);
    }
  }

  private attachEventListeners() {
    if (!this.container || !this.canvas || !this.ctx) return;

    const clearBtn = this.container.querySelector('.clear-btn') as HTMLButtonElement;
    const nextBtn = this.container.querySelector('.next-btn') as HTMLButtonElement;

    // Mouse events
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

    clearBtn?.addEventListener('click', () => {
      this.clearCanvas();
      this.traceProgress = 0;
      this.updateProgressBar();
      nextBtn.disabled = true;
    });

    nextBtn?.addEventListener('click', () => {
      this.nextRound();
    });
  }

  private startDrawing(e: MouseEvent) {
    this.isDrawing = true;
    if (this.ctx && this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      this.ctx.beginPath();
      this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  }

  private handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    this.isDrawing = true;
    if (this.ctx && this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.ctx.beginPath();
      this.ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  }

  private draw(e: MouseEvent) {
    if (!this.isDrawing || !this.ctx || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    this.ctx.stroke();

    this.updateTraceProgress();
  }

  private handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (!this.isDrawing || !this.ctx || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    this.ctx.stroke();

    this.updateTraceProgress();
  }

  private stopDrawing() {
    this.isDrawing = false;
  }

  private clearCanvas() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Redraw the letter outline
    const currentLetter = this.config.letters[this.currentIndex];
    this.ctx.font = '200px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 4;
    this.ctx.strokeText(currentLetter.letter, 150, 150);
  }

  private updateTraceProgress() {
    if (!this.ctx || !this.canvas) return;

    // Simple progress calculation based on canvas coverage
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    let drawnPixels = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      // Check if pixel has green color (our drawing color)
      if (imageData.data[i + 1] > 150) {
        drawnPixels++;
      }
    }

    // Calculate progress as percentage
    const totalPixels = (this.canvas.width * this.canvas.height) / 100; // Rough estimate
    this.traceProgress = Math.min(100, (drawnPixels / totalPixels) * 2);

    this.updateProgressBar();

    // Enable next button if progress is sufficient
    const nextBtn = this.container?.querySelector('.next-btn') as HTMLButtonElement;
    if (nextBtn && this.traceProgress >= this.minProgress) {
      nextBtn.disabled = false;
    }
  }

  private updateProgressBar() {
    const progressFill = this.container?.querySelector('.trace-progress-fill') as HTMLElement;
    if (progressFill) {
      progressFill.style.width = `${this.traceProgress}%`;
    }
  }

  private nextRound() {
    if (this.traceProgress >= this.minProgress) {
      this.score++;
    }

    this.currentIndex++;
    this.traceProgress = 0;

    if (this.currentIndex < this.config.letters.length) {
      this.render();
      this.attachEventListeners();
    } else {
      this.endGame();
    }
  }

  private endGame() {
    const totalQuestions = this.config.letters.length;
    const percentage = (this.score / totalQuestions) * 100;

    let stars = 1;
    if (percentage >= 90) stars = 3;
    else if (percentage >= 70) stars = 2;

    this.config.onComplete(this.score, stars);
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.canvas = null;
    this.ctx = null;
  }
}
