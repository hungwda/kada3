interface LessonsProps {
  onNavigate: (page: 'home' | 'lessons' | 'games' | 'profiles') => void;
}

export function Lessons({ onNavigate }: LessonsProps) {
  return (
    <div class="lessons-page">
      <header class="page-header">
        <button class="back-button" onClick={() => onNavigate('home')}>
          ← Back
        </button>
        <h1>Kannada Lessons</h1>
      </header>

      <section class="lessons-list">
        <p class="placeholder-text">Lessons will be loaded here...</p>
        <p class="info-text">
          Learn Kannada vowels (ಸ್ವರಗಳು) and consonants (ವ್ಯಂಜನಗಳು) with audio pronunciation
        </p>
      </section>
    </div>
  );
}
