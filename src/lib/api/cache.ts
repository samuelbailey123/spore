interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const HOUR = 3_600_000;

export const TTL = {
  CURRENT: 1 * HOUR,
  FORECAST: 3 * HOUR,
  HISTORY: 24 * HOUR,
  GEOCODE: 7 * 24 * HOUR,
} as const;

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function cacheInvalidate(key: string): void {
  store.delete(key);
}

export function cacheClear(): void {
  store.clear();
}

export function cacheSize(): number {
  return store.size;
}
