import { useState, lazy, Suspense } from 'preact/compat';
import { Home } from '../pages/Home';

// Lazy load pages for better performance
const Lessons = lazy(() => import('../pages/Lessons').then(m => ({ default: m.Lessons })));
const Games = lazy(() => import('../pages/Games').then(m => ({ default: m.Games })));
const Profiles = lazy(() => import('../pages/Profiles').then(m => ({ default: m.Profiles })));

type Page = 'home' | 'lessons' | 'games' | 'profiles';

function LoadingFallback() {
  return (
    <div class="loading-container">
      <p>Loading...</p>
    </div>
  );
}

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'lessons':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Lessons onNavigate={setCurrentPage} />
          </Suspense>
        );
      case 'games':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Games onNavigate={setCurrentPage} />
          </Suspense>
        );
      case 'profiles':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Profiles onNavigate={setCurrentPage} />
          </Suspense>
        );
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div class="app">
      <nav class="bottom-nav">
        <button
          class={currentPage === 'home' ? 'active' : ''}
          onClick={() => setCurrentPage('home')}
          aria-label="Home"
        >
          🏠 Home
        </button>
        <button
          class={currentPage === 'lessons' ? 'active' : ''}
          onClick={() => setCurrentPage('lessons')}
          aria-label="Lessons"
        >
          📚 Lessons
        </button>
        <button
          class={currentPage === 'games' ? 'active' : ''}
          onClick={() => setCurrentPage('games')}
          aria-label="Games"
        >
          🎮 Games
        </button>
        <button
          class={currentPage === 'profiles' ? 'active' : ''}
          onClick={() => setCurrentPage('profiles')}
          aria-label="Profiles"
        >
          👤 Profile
        </button>
      </nav>
      <main class="page-content">{renderPage()}</main>
    </div>
  );
}
