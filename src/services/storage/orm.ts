/**
 * TypeORM datasource and repository management
 */

import { DataSource } from 'typeorm';
import {
  Profile,
  Lesson,
  Activity,
  Progress,
  Streak,
  Badge,
  EarnedBadge,
  Settings,
  Asset
} from '../../db/entities';

let dataSource: DataSource | null = null;

/**
 * Load database from IndexedDB
 */
async function loadDatabaseFromIndexedDB(): Promise<Uint8Array | undefined> {
  try {
    const { get } = await import('idb-keyval');
    const data = await get('sqljs-db');
    return data || undefined;
  } catch (error) {
    console.error('Failed to load database from IndexedDB:', error);
    return undefined;
  }
}

/**
 * Initialize TypeORM DataSource (lazy)
 */
export async function getDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  try {
    // Load saved database if available
    const savedData = await loadDatabaseFromIndexedDB();

    // Create TypeORM DataSource
    dataSource = new DataSource({
      type: 'sqljs',
      database: savedData,
      sqlJsConfig: {
        locateFile: (file: string) => `/sql-wasm/${file}`
      },
      synchronize: true, // Auto-create tables in development
      logging: false,
      entities: [Profile, Lesson, Activity, Progress, Streak, Badge, EarnedBadge, Settings, Asset]
    });

    await dataSource.initialize();
    console.log('TypeORM DataSource initialized');

    return dataSource;
  } catch (error) {
    console.error('Failed to initialize DataSource:', error);
    throw error;
  }
}

/**
 * Get repository for an entity
 */
export async function getRepository<T>(entity: new () => T) {
  const ds = await getDataSource();
  return ds.getRepository(entity);
}

/**
 * Close DataSource
 */
export async function closeDataSource(): Promise<void> {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
  }
}
