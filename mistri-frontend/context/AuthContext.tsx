"use client";

import { createContext, useState, ReactNode } from "react";
import { loginUser, fetchMe, User } from "@/lib/api";

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  async function login(username: string, password: string) {
    const { access } = await loginUser(username, password);
    setAccessToken(access);
    const me = await fetchMe(access);
    setUser(me);
  }

  function logout() {
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}