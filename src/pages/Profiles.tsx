interface ProfilesProps {
  onNavigate: (page: 'home' | 'lessons' | 'games' | 'profiles') => void;
}

export function Profiles({ onNavigate }: ProfilesProps) {
  return (
    <div class="profiles-page">
      <header class="page-header">
        <button class="back-button" onClick={() => onNavigate('home')}>
          ← Back
        </button>
        <h1>Profiles</h1>
      </header>

      <section class="profiles-list">
        <p class="placeholder-text">No profiles yet</p>
        <button class="action-button primary">+ Add Profile</button>
        <p class="info-text">Create profiles for each child using the app</p>
      </section>
    </div>
  );
}
