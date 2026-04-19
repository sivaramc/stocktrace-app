import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistentStorage } from '@stocktrace/core';

/**
 * Wraps `@react-native-async-storage/async-storage` behind the async
 * `PersistentStorage` contract used by @stocktrace/core's AuthStore.
 */
export const asyncStorage: PersistentStorage = {
  getItem(key) {
    return AsyncStorage.getItem(key);
  },
  async setItem(key, value) {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key) {
    await AsyncStorage.removeItem(key);
  },
};
