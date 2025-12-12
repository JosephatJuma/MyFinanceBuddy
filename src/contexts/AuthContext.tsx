import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { useAuth, AuthState, User } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import AuthLoadingScreen from "../components/reusable/AuthLoadingScreen";

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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for existing Supabase session on mount
    const initializeAuth = async () => {
      try {
        await auth.checkAuth();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // If session check fails, ensure user is logged out
        auth.logout();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Set up Supabase auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase auth state changed:", event);

      if (event === "SIGNED_IN" && session?.user) {
        // User signed in - refresh auth state
        await auth.checkAuth();
      } else if (event === "SIGNED_OUT") {
        // User signed out - clear auth state
        await auth.logout();
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Token refreshed - update auth state
        await auth.checkAuth();
      } else if (event === "PASSWORD_RECOVERY") {
        // Handle password recovery if needed
        console.log("Password recovery initiated");
      } else if (event === "USER_UPDATED" && session?.user) {
        // User updated - refresh auth state
        await auth.checkAuth();
      } else if (!session) {
        // No session found - ensure logged out state
        await auth.logout();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state while initializing
  if (!isInitialized) {
    return <AuthLoadingScreen />;
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
