"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { loginUser, fetchMe, User } from "@/lib/api";

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_STORAGE_KEY = "mistri_access_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // true until we've checked localStorage

  // On first mount, check if a token was saved from a previous session.
  // If so, verify it's still valid by fetching the user's profile.
useEffect(() => {
  async function initializeAuth() {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const me = await fetchMe(savedToken);
      setAccessToken(savedToken);
      setUser(me);
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }

  void initializeAuth();
}, []);

  async function login(username: string, password: string) {
    const { access } = await loginUser(username, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, access);
    setAccessToken(access);
    const me = await fetchMe(access);
    setUser(me);
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}