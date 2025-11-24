/**
 * sql.js database lifecycle management
 */

import type { Database } from 'sql.js';
// Import sql.js using dynamic import for better browser compatibility
let initSqlJs: any = null;

let db: Database | null = null;
let sqlJs: any = null;

/**
 * Initialize sql.js with WASM file
 */
export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  try {
    // Load sql.js WASM
    if (!sqlJs) {
      // Dynamically import sql.js
      if (!initSqlJs) {
        const module = await import('sql.js');
        initSqlJs = (module as any).default || module;
      }

      sqlJs = await initSqlJs({
        locateFile: (file: string) => {
          // WASM files are copied to public/sql-wasm directory
          return `/sql-wasm/${file}`;
        }
      });
    }

    // Create or restore database
    const savedData = await loadDatabaseFromIndexedDB();
    if (savedData) {
      db = new sqlJs.Database(savedData);
      console.log('Database restored from IndexedDB');
    } else {
      db = new sqlJs.Database();
      console.log('New database created');
    }

    if (!db) {
      throw new Error('Failed to create database');
    }

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the current database instance
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Save database to IndexedDB
 */
async function loadDatabaseFromIndexedDB(): Promise<Uint8Array | null> {
  try {
    const { get } = await import('idb-keyval');
    const data = await get('sqljs-db');
    return data || null;
  } catch (error) {
    console.error('Failed to load database from IndexedDB:', error);
    return null;
  }
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Export database as Uint8Array
 */
export function exportDatabase(): Uint8Array {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db.export();
}
