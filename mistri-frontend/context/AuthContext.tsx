"use client";

import { createContext, useState, useEffect, useRef, ReactNode } from "react";
import { loginUser, fetchMe, refreshAccessToken, User } from "@/lib/api";

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_STORAGE_KEY = "mistri_access_token";
const REFRESH_STORAGE_KEY = "mistri_refresh_token";

// Slightly under Django's ACCESS_TOKEN_LIFETIME (30 min), so we renew
// before the current token actually expires, never after.
const SILENT_REFRESH_INTERVAL_MS = 25 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleSilentRefresh() {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(async () => {
      const storedRefresh = localStorage.getItem(REFRESH_STORAGE_KEY);
      if (!storedRefresh) return;
      try {
        const { access, refresh } = await refreshAccessToken(storedRefresh);
        localStorage.setItem(TOKEN_STORAGE_KEY, access);
        if (refresh) localStorage.setItem(REFRESH_STORAGE_KEY, refresh);
        setAccessToken(access);
        scheduleSilentRefresh();
      } catch {
        // Refresh token itself expired (7 days) or was revoked server-side —
        // nothing left to renew from, so end the session cleanly.
        logout();
      }
    }, SILENT_REFRESH_INTERVAL_MS);
  }

  useEffect(() => {
    async function initializeAuth() {
      const storedRefresh = localStorage.getItem(REFRESH_STORAGE_KEY);

      if (!storedRefresh) {
        setLoading(false);
        return;
      }

      try {
        // Always refresh on load rather than trusting a possibly-stale
        // access token — one extra request, but guarantees a valid session
        // even if the tab was closed longer than the access token's lifetime.
        const { access, refresh } = await refreshAccessToken(storedRefresh);
        localStorage.setItem(TOKEN_STORAGE_KEY, access);
        if (refresh) localStorage.setItem(REFRESH_STORAGE_KEY, refresh);

        const me = await fetchMe(access);
        setAccessToken(access);
        setUser(me);
        scheduleSilentRefresh();
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    }

    void initializeAuth();
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(username: string, password: string) {
    const { access, refresh } = await loginUser(username, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, access);
    localStorage.setItem(REFRESH_STORAGE_KEY, refresh);
    setAccessToken(access);
    const me = await fetchMe(access);
    setUser(me);
    scheduleSilentRefresh();
  }

  function logout() {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}