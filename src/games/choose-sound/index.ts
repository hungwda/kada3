export interface ChooseSoundGameConfig {
  letters: Array<{
    letter: string;
    pronunciation?: string;
  }>;
  onComplete: (score: number, stars: number) => void;
}

export class ChooseSoundGame {
  private config: ChooseSoundGameConfig;
  private currentIndex = 0;
  private score = 0;
  private container: HTMLElement | null = null;

  constructor(config: ChooseSoundGameConfig) {
    this.config = config;
  }

  mount(container: HTMLElement) {
    this.container = container;
    this.render();
    this.attachEventListeners();
    this.playSound();
  }

  private render() {
    if (!this.container) return;

    const currentLetter = this.config.letters[this.currentIndex];

    // Get random wrong options
    const wrongLetters = this.config.letters
      .filter((_, i) => i !== this.currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [currentLetter, ...wrongLetters].sort(() => Math.random() - 0.5);

    this.container.innerHTML = `
      <div class="choose-sound-game">
        <div class="game-header">
          <h2>Choose the Right Sound</h2>
          <div class="progress-text">Letter ${this.currentIndex + 1} of ${this.config.letters.length}</div>
        </div>
        <div class="sound-prompt">
          <button class="play-sound-btn-large">
            <span class="sound-icon">🔊</span>
            <span class="sound-text">Play Sound</span>
          </button>
          <p class="instruction">Listen and choose the correct letter</p>
        </div>
        <div class="sound-options">
          ${allOptions.map((option, i) => `
            <button class="sound-option" data-letter="${option.letter}" data-index="${i}">
              ${option.letter}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    if (!this.container) return;

    const playBtn = this.container.querySelector('.play-sound-btn-large');
    playBtn?.addEventListener('click', () => {
      this.playSound();
    });

    const optionBtns = this.container.querySelectorAll('.sound-option');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedLetter = (e.target as HTMLElement).dataset.letter;
        this.checkAnswer(selectedLetter);
      });
    });
  }

  private playSound() {
    const currentLetter = this.config.letters[this.currentIndex];
    if (currentLetter.pronunciation) {
      const audio = new Audio(currentLetter.pronunciation);
      audio.play();

      // Visual feedback
      const playBtn = this.container?.querySelector('.play-sound-btn-large');
      if (playBtn) {
        playBtn.classList.add('playing');
        audio.addEventListener('ended', () => {
          playBtn.classList.remove('playing');
        });
      }
    }
  }

  private checkAnswer(selectedLetter: string | undefined) {
    const currentLetter = this.config.letters[this.currentIndex];
    const correct = selectedLetter === currentLetter.letter;

    if (correct) {
      this.score++;
    }

    this.showFeedback(correct, selectedLetter);

    // Highlight correct answer
    const options = this.container?.querySelectorAll('.sound-option');
    options?.forEach(opt => {
      const letter = (opt as HTMLElement).dataset.letter;
      if (letter === currentLetter.letter) {
        opt.classList.add('correct-answer');
      }
      if (letter === selectedLetter && !correct) {
        opt.classList.add('wrong-answer');
      }
      (opt as HTMLButtonElement).disabled = true;
    });

    setTimeout(() => this.nextRound(), 1500);
  }

  private showFeedback(correct: boolean, selectedLetter: string | undefined) {
    if (!this.container) return;

    const feedback = document.createElement('div');
    feedback.className = `feedback ${correct ? 'correct' : 'wrong'}`;
    feedback.textContent = correct ? '✓ Correct!' : '✗ Try again!';
    this.container.appendChild(feedback);

    setTimeout(() => feedback.remove(), 1500);
  }

  private nextRound() {
    this.currentIndex++;

    if (this.currentIndex < this.config.letters.length) {
      this.render();
      this.attachEventListeners();
      this.playSound();
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
  }
}
