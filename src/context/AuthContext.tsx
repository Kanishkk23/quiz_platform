"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";
import { mockUsers } from "@/data/mock";

interface AuthContextType extends AuthState {
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check localStorage on mount for simulated persistence
  useEffect(() => {
    const savedUser = localStorage.getItem("quiz_platform_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("quiz_platform_user");
      }
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    // Find in mock users or create session for this email
    const existing = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const currentUser: User = existing || {
      id: "u_" + Date.now(),
      name: email.split("@")[0],
      email: email,
    };

    setUser(currentUser);
    localStorage.setItem("quiz_platform_user", JSON.stringify(currentUser));
    return true;
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    const newUser: User = {
      id: "u_" + Date.now(),
      name,
      email,
    };

    setUser(newUser);
    localStorage.setItem("quiz_platform_user", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("quiz_platform_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
