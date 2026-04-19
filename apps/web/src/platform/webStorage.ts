import type { PersistentStorage } from '@stocktrace/core';

/**
 * Wraps `window.localStorage` behind the async `PersistentStorage` contract
 * so shared @stocktrace/core code can use the same storage abstraction across
 * web and React Native.
 */
export const webStorage: PersistentStorage = {
  async getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // quota / private-mode: drop silently so logins still work in memory.
    }
  },
  async removeItem(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // noop
    }
  },
};
