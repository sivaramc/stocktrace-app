import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { Me } from '@stocktrace/core';
import { authStore, endpoints, onUnauthorized } from '../platform/api';

interface AuthContextValue {
  user: Me | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribe(fn: () => void) {
  return authStore.subscribe(fn);
}
function getSnapshot() {
  return authStore.getSnapshot();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void authStore.hydrate().finally(() => setReady(true));
  }, []);

  const [token, user] = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const logout = useCallback(async () => {
    await authStore.clear();
  }, []);

  useEffect(() => onUnauthorized(() => void logout()), [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await endpoints.login(email, password);
    await authStore.set(res.token, res.user);
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await endpoints.me();
    await authStore.setUser(me);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'ADMIN',
      ready,
      login,
      logout,
      refreshMe,
    }),
    [user, token, ready, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
