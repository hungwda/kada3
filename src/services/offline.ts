/**
 * Offline detection and handling utilities
 */

export function isOnline(): boolean {
  return navigator.onLine;
}

export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function onConnectionChange(callback: (online: boolean) => void): () => void {
  const onlineHandler = () => callback(true);
  const offlineHandler = () => callback(false);

  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);

  return () => {
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('offline', offlineHandler);
  };
}

/**
 * Show offline-friendly error message
 */
export function getOfflineMessage(): string {
  return 'You are offline. Some features may not be available, but you can continue learning!';
}

/**
 * Queue for offline operations (placeholder for future implementation)
 */
class OfflineQueue {
  private queue: Array<() => Promise<void>> = [];

  add(operation: () => Promise<void>) {
    this.queue.push(operation);
  }

  async processQueue() {
    if (!isOnline()) {
      console.log('Still offline, queue will process when online');
      return;
    }

    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error('Failed to process queued operation:', error);
          // Re-add to queue if failed
          this.queue.unshift(operation);
          break;
        }
      }
    }
  }
}

export const offlineQueue = new OfflineQueue();

// Auto-process queue when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineQueue.processQueue();
  });
}
