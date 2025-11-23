import { render } from 'preact';
import { App } from './components/App';
import './styles/global.css';
import 'reflect-metadata';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch(error => {
        console.error('SW registration failed:', error);
      });
  });
}

// Render app
render(<App />, document.getElementById('app')!);
