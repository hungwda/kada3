/**
 * IndexedDB persistence for sql.js database
 */

import { get, set } from 'idb-keyval';
import { exportDatabase } from './db';

const DB_KEY = 'sqljs-db';

/**
 * Save database to IndexedDB
 */
export async function saveDatabaseToIndexedDB(): Promise<void> {
  try {
    const data = exportDatabase();
    await set(DB_KEY, data);
    console.log('Database saved to IndexedDB');
  } catch (error) {
    console.error('Failed to save database to IndexedDB:', error);
    throw error;
  }
}

/**
 * Load database from IndexedDB
 */
export async function loadDatabaseFromIndexedDB(): Promise<Uint8Array | null> {
  try {
    const data = await get(DB_KEY);
    if (data) {
      console.log('Database loaded from IndexedDB');
      return data as Uint8Array;
    }
    return null;
  } catch (error) {
    console.error('Failed to load database from IndexedDB:', error);
    return null;
  }
}

/**
 * Clear database from IndexedDB
 */
export async function clearDatabase(): Promise<void> {
  try {
    await set(DB_KEY, null);
    console.log('Database cleared from IndexedDB');
  } catch (error) {
    console.error('Failed to clear database from IndexedDB:', error);
    throw error;
  }
}

/**
 * Auto-save database periodically
 */
export function startAutoSave(intervalMs: number = 30000): () => void {
  const timer = setInterval(() => {
    saveDatabaseToIndexedDB().catch(err => {
      console.error('Auto-save failed:', err);
    });
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(timer);
}
