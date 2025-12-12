import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuth, AuthState, User } from "../hooks/useAuth";

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
  updateUser: (
    updates: Partial<User>
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  useEffect(() => {
    auth.checkAuth();
  }, []);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
