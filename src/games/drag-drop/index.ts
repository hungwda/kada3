export interface DragDropGameConfig {
  letters: Array<{
    letter: string;
    pronunciation?: string;
    image?: string;
  }>;
  onComplete: (score: number, stars: number) => void;
}

export class DragDropGame {
  private config: DragDropGameConfig;
  private currentIndex = 0;
  private score = 0;
  private container: HTMLElement | null = null;
  private draggedElement: HTMLElement | null = null;

  constructor(config: DragDropGameConfig) {
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

    // Get random wrong options
    const wrongLetters = this.config.letters
      .filter((_, i) => i !== this.currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [currentLetter, ...wrongLetters].sort(() => Math.random() - 0.5);

    this.container.innerHTML = `
      <div class="drag-drop-game">
        <div class="game-header">
          <h2>Drag & Drop</h2>
          <div class="progress-text">Letter ${this.currentIndex + 1} of ${this.config.letters.length}</div>
        </div>
        <div class="drag-drop-target">
          <div class="target-label">Match the letter:</div>
          ${currentLetter.image ?
            `<img src="${currentLetter.image}" alt="${currentLetter.letter}" class="target-image" />` :
            `<div class="target-letter">${currentLetter.letter}</div>`
          }
          ${currentLetter.pronunciation ? `<button class="play-sound-btn">🔊</button>` : ''}
          <div class="drop-zone" data-letter="${currentLetter.letter}">
            <span class="drop-placeholder">Drop here</span>
          </div>
        </div>
        <div class="drag-items">
          ${allOptions.map((option, i) => `
            <div class="drag-item" draggable="true" data-letter="${option.letter}" data-index="${i}">
              ${option.letter}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const playBtn = this.container.querySelector('.play-sound-btn');
    if (playBtn && currentLetter.pronunciation) {
      playBtn.addEventListener('click', () => {
        const audio = new Audio(currentLetter.pronunciation);
        audio.play();
      });
    }
  }

  private attachEventListeners() {
    if (!this.container) return;

    const dragItems = this.container.querySelectorAll('.drag-item');
    const dropZone = this.container.querySelector('.drop-zone');

    dragItems.forEach(item => {
      item.addEventListener('dragstart', this.handleDragStart.bind(this));
      item.addEventListener('dragend', this.handleDragEnd.bind(this));

      // Touch events for mobile
      item.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      item.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      item.addEventListener('touchend', this.handleTouchEnd.bind(this));
    });

    if (dropZone) {
      dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
      dropZone.addEventListener('drop', this.handleDrop.bind(this));
    }
  }

  private handleDragStart(e: DragEvent) {
    this.draggedElement = e.target as HTMLElement;
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/html', this.draggedElement.innerHTML);
    this.draggedElement.classList.add('dragging');
  }

  private handleDragEnd(e: DragEvent) {
    (e.target as HTMLElement).classList.remove('dragging');
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    return false;
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.draggedElement) return;

    const droppedLetter = this.draggedElement.dataset.letter;
    const targetLetter = (e.target as HTMLElement).dataset.letter;

    this.checkAnswer(droppedLetter === targetLetter);

    return false;
  }

  // Touch event handlers for mobile
  private touchOffset = { x: 0, y: 0 };
  private clone: HTMLElement | null = null;

  private handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const target = e.target as HTMLElement;

    this.draggedElement = target;

    // Create a clone for visual feedback
    this.clone = target.cloneNode(true) as HTMLElement;
    this.clone.classList.add('dragging-clone');
    this.clone.style.position = 'fixed';
    this.clone.style.pointerEvents = 'none';
    this.clone.style.zIndex = '1000';
    document.body.appendChild(this.clone);

    const rect = target.getBoundingClientRect();
    this.touchOffset = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };

    this.updateClonePosition(touch.clientX, touch.clientY);
  }

  private handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (!this.clone) return;

    const touch = e.touches[0];
    this.updateClonePosition(touch.clientX, touch.clientY);
  }

  private updateClonePosition(x: number, y: number) {
    if (!this.clone) return;
    this.clone.style.left = `${x - this.touchOffset.x}px`;
    this.clone.style.top = `${y - this.touchOffset.y}px`;
  }

  private handleTouchEnd(e: TouchEvent) {
    if (!this.clone || !this.draggedElement) return;

    const touch = e.changedTouches[0];
    const dropZone = this.container?.querySelector('.drop-zone');

    if (dropZone) {
      const rect = dropZone.getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        const droppedLetter = this.draggedElement.dataset.letter;
        const targetLetter = (dropZone as HTMLElement).dataset.letter;
        this.checkAnswer(droppedLetter === targetLetter);
      }
    }

    this.clone.remove();
    this.clone = null;
    this.draggedElement = null;
  }

  private checkAnswer(correct: boolean) {
    if (correct) {
      this.score++;
      this.showFeedback(true);
      setTimeout(() => this.nextRound(), 800);
    } else {
      this.showFeedback(false);
    }
  }

  private showFeedback(correct: boolean) {
    if (!this.container) return;

    const dropZone = this.container.querySelector('.drop-zone');
    if (dropZone) {
      dropZone.classList.add(correct ? 'correct' : 'wrong');
      setTimeout(() => {
        dropZone.classList.remove('correct', 'wrong');
      }, 800);
    }

    const feedback = document.createElement('div');
    feedback.className = `feedback ${correct ? 'correct' : 'wrong'}`;
    feedback.textContent = correct ? '✓' : '✗';
    this.container.appendChild(feedback);

    setTimeout(() => feedback.remove(), 800);
  }

  private nextRound() {
    this.currentIndex++;

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
    if (this.clone) {
      this.clone.remove();
      this.clone = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.draggedElement = null;
  }
}
