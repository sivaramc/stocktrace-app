import type { Me } from './types';

/**
 * Minimal async key-value storage contract. Implementations:
 *   - Web: wraps `window.localStorage` (sync, wrapped in resolved promises).
 *   - Mobile: wraps `@react-native-async-storage/async-storage` or Expo SecureStore.
 */
export interface PersistentStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const TOKEN_KEY = 'stocktrace.jwt';
const USER_KEY = 'stocktrace.me';

/**
 * In-memory auth state backed by a persistent storage adapter. Reads are sync
 * so the axios request interceptor can inject the JWT without awaiting. Writes
 * propagate to the adapter in the background.
 *
 * Call `hydrate()` once at app start (before rendering) to populate the
 * in-memory state from disk.
 */
export type AuthSnapshot = readonly [token: string | null, user: Me | null];

export class AuthStore {
  private token: string | null = null;
  private user: Me | null = null;
  private listeners = new Set<() => void>();
  private snapshot: AuthSnapshot = [null, null];

  constructor(private readonly storage: PersistentStorage) {}

  async hydrate(): Promise<void> {
    const [rawToken, rawUser] = await Promise.all([
      this.storage.getItem(TOKEN_KEY),
      this.storage.getItem(USER_KEY),
    ]);
    this.token = rawToken;
    this.user = rawUser ? this.parseUser(rawUser) : null;
    this.snapshot = [this.token, this.user];
    this.emit();
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): Me | null {
    return this.user;
  }

  /**
   * Reference-stable snapshot of the current auth state. A new tuple is
   * allocated only when the token or user actually changes, so consumers like
   * `useSyncExternalStore` (which compares snapshots with `Object.is`) won't
   * loop forever.
   */
  getSnapshot(): AuthSnapshot {
    return this.snapshot;
  }

  async set(token: string, user: Me): Promise<void> {
    this.token = token;
    this.user = user;
    this.snapshot = [token, user];
    await Promise.all([
      this.storage.setItem(TOKEN_KEY, token),
      this.storage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
    this.emit();
  }

  async setUser(user: Me): Promise<void> {
    this.user = user;
    this.snapshot = [this.token, user];
    await this.storage.setItem(USER_KEY, JSON.stringify(user));
    this.emit();
  }

  async clear(): Promise<void> {
    this.token = null;
    this.user = null;
    this.snapshot = [null, null];
    await Promise.all([this.storage.removeItem(TOKEN_KEY), this.storage.removeItem(USER_KEY)]);
    this.emit();
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    this.listeners.forEach((fn) => fn());
  }

  private parseUser(raw: string): Me | null {
    try {
      return JSON.parse(raw) as Me;
    } catch {
      return null;
    }
  }
}
