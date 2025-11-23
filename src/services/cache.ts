/**
 * Cache Storage helpers for asset versioning and offline access
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `kannada-learning-${CACHE_VERSION}`;

export interface CacheOptions {
  cacheName?: string;
  maxAge?: number; // in seconds
}

/**
 * Add assets to cache
 */
export async function cacheAssets(urls: string[], options: CacheOptions = {}): Promise<void> {
  const cacheName = options.cacheName || CACHE_NAME;

  try {
    const cache = await caches.open(cacheName);
    await cache.addAll(urls);
    console.log(`Cached ${urls.length} assets to ${cacheName}`);
  } catch (error) {
    console.error('Failed to cache assets:', error);
    throw error;
  }
}

/**
 * Get asset from cache or fetch from network
 */
export async function getCachedAsset(url: string, options: CacheOptions = {}): Promise<Response> {
  const cacheName = options.cacheName || CACHE_NAME;

  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(url);
    // Cache for future use
    await cache.put(url, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('Failed to get cached asset:', url, error);
    throw error;
  }
}

/**
 * Clear old caches
 */
export async function clearOldCaches(): Promise<void> {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => name !== CACHE_NAME && name.startsWith('kannada-learning-'));

  await Promise.all(oldCaches.map(name => caches.delete(name)));
  console.log(`Cleared ${oldCaches.length} old caches`);
}

/**
 * Check if asset is cached
 */
export async function isCached(url: string, options: CacheOptions = {}): Promise<boolean> {
  const cacheName = options.cacheName || CACHE_NAME;

  try {
    const cache = await caches.open(cacheName);
    const response = await cache.match(url);
    return !!response;
  } catch {
    return false;
  }
}

/**
 * Get cache storage usage
 */
export async function getCacheSize(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}
