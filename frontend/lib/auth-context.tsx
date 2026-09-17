"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { authApi } from "./api";

export type UserRole = "ADMIN" | "FACULTY" | "STUDENT";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; user?: User | null }>;
  register: (data: RegisterData) => Promise<{ error?: string; user?: User | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  fullName: string;
  email: string;
  mobileNumber: string;
  parentMobileNumber: string;
  courseInterested: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const role = user?.role ?? null;
  const isAuthenticated = !!user;

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      setLoading(false);
      return;
    }

    try {
      // Try to get current user with access token
      const result = await authApi.me(accessToken);

      if (result.data?.user) {
        setUser(result.data.user);
        setLoading(false);
        return;
      }

      // If me() fails, try to refresh token
      if (result.error) {
        const refreshResult = await authApi.refresh(refreshToken);

        if (refreshResult.data?.accessToken && refreshResult.data?.refreshToken) {
          localStorage.setItem("accessToken", refreshResult.data.accessToken);
          localStorage.setItem("refreshToken", refreshResult.data.refreshToken);

          // Try me() again with new token
          const meResult = await authApi.me(refreshResult.data.accessToken);
          if (meResult.data?.user) {
            setUser(meResult.data.user);
            setLoading(false);
            return;
          }
        }
      }

      // If all fails, clear invalid tokens
      clearAuth();
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });

    if (result.error) {
      return { error: result.error };
    }

    let userData: User | null = null;

    if (result.data?.accessToken && result.data?.refreshToken) {
      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("refreshToken", result.data.refreshToken);

      // Fetch user after login
      const meResult = await authApi.me(result.data.accessToken);
      if (meResult.data?.user) {
        userData = meResult.data.user;
        setUser(userData);
      } else {
        setUser(null);
      }
    }

    return { error: undefined, user: userData };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const result = await authApi.register(data);

    if (result.error) {
      return { error: result.error };
    }

    let userData: User | null = null;

    if (result.data?.accessToken && result.data?.refreshToken) {
      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("refreshToken", result.data.refreshToken);

      // Fetch user after registration
      const meResult = await authApi.me(result.data.accessToken);
      if (meResult.data?.user) {
        userData = meResult.data.user;
        setUser(userData);
      } else {
        setUser(null);
      }
    }

    return { error: undefined, user: userData };
  }, []);

  const logout = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      try {
        await authApi.logout(accessToken);
      } catch {
        // Ignore logout API errors, clear local state anyway
      }
    }

    clearAuth();
  }, []);

  const refreshUser = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const result = await authApi.me(accessToken);
      if (result.data?.user) {
        setUser(result.data.user);
      } else if (result.error) {
        // Try refresh
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const refreshResult = await authApi.refresh(refreshToken);
          if (refreshResult.data?.accessToken && refreshResult.data?.refreshToken) {
            localStorage.setItem("accessToken", refreshResult.data.accessToken);
            localStorage.setItem("refreshToken", refreshResult.data.refreshToken);
            const meResult = await authApi.me(refreshResult.data.accessToken);
            if (meResult.data?.user) {
              setUser(meResult.data.user);
            }
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshUser,
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