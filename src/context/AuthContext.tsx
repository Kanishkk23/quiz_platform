"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { User, AuthState } from "@/types";
import { createClient } from "@/lib/client";

export interface AuthResult {
  success: boolean;
  error?: string | null;
  requiresEmailVerification?: boolean;
  userAlreadyExists?: boolean;
}

export interface AuthContextType extends AuthState {
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  signInWithOAuth: (provider: "google" | "github", redirectToPath?: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string; avatar_url?: string };
}): User {
  return {
    id: supabaseUser.id,
    name:
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split("@")[0] ||
      "User",
    email: supabaseUser.email || "",
    avatarUrl: supabaseUser.user_metadata?.avatar_url || "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    // Get current session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        if (session?.user && !error) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    // Listen to real-time auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (email: string, password?: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password || "",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      return { success: false, error: message };
    }
  };

  const register = async (
    name: string,
    email: string,
    password?: string
  ): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password || "",
        options: {
          data: {
            full_name: name.trim(),
            name: name.trim(),
          },
        },
      });

      if (error) {
        const isAlreadyRegistered =
          error.message?.toLowerCase().includes("already registered") ||
          error.message?.toLowerCase().includes("already exists") ||
          error.message?.toLowerCase().includes("user already") ||
          error.status === 422;

        return {
          success: false,
          error: isAlreadyRegistered
            ? "User already exists with this email. Redirecting to login..."
            : error.message,
          userAlreadyExists: isAlreadyRegistered,
        };
      }

      // Check for Supabase email enumeration protection:
      // When enabled, Supabase returns data.user with identities: [] if user already exists
      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        return {
          success: false,
          error: "User already exists with this email. Redirecting to login...",
          userAlreadyExists: true,
        };
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }

      const requiresEmailVerification = !data.session;
      return { success: true, requiresEmailVerification };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=/reset-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send password reset email";
      return { success: false, error: message };
    }
  };

  const updatePassword = async (password: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update password";
      return { success: false, error: message };
    }
  };

  const signInWithOAuth = async (
    provider: "google" | "github",
    redirectToPath?: string
  ): Promise<AuthResult> => {
    try {
      const nextParam = redirectToPath
        ? `?next=${encodeURIComponent(redirectToPath)}`
        : "";
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback${nextParam}`
          : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : `Failed to sign in with ${provider}`;
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      setUser(null);
      try {
        localStorage.removeItem("quiz_platform_user");
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        resetPassword,
        updatePassword,
        signInWithOAuth,
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
