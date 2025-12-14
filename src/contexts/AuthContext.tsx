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
    let isMounted = true;
    let initTimeout: NodeJS.Timeout;

    // Check for existing Supabase session on mount
    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication...");

        // Set a timeout to prevent infinite loading
        initTimeout = setTimeout(() => {
          if (isMounted && !isInitialized) {
            console.warn("Auth initialization timeout - setting initialized");
            setIsInitialized(true);
          }
        }, 5000); // 5 second timeout

        await auth.checkAuth();
        console.log("Auth initialized, authenticated:", auth.isAuthenticated);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // If session check fails, ensure user is logged out
        try {
          await auth.logout();
        } catch (logoutError) {
          console.error("Logout error:", logoutError);
        }
      } finally {
        clearTimeout(initTimeout);
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Set up Supabase auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Supabase auth state changed:",
        event,
        "Session exists:",
        !!session
      );

      if (!isMounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        // User signed in - manually update auth state without calling checkAuth
        console.log("User signed in, updating auth state");
        // Don't call checkAuth here as it can cause loops
        // The login/register functions already update the state
      } else if (event === "SIGNED_OUT") {
        // User signed out - clear auth state
        console.log("User signed out, clearing auth state");
        await auth.logout();
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Token refreshed - just log, state should persist
        console.log("Token refreshed");
      } else if (event === "PASSWORD_RECOVERY") {
        // Handle password recovery if needed
        console.log("Password recovery initiated");
      } else if (event === "USER_UPDATED" && session?.user) {
        // User updated - just log, state should persist
        console.log("User updated");
      } else if (!session && event !== "INITIAL_SESSION") {
        // No session found - ensure logged out state (but not on initial load)
        console.log("No session found, ensuring logged out state");
        await auth.logout();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  // Show loading state while initializing
  if (!isInitialized) {
    return <AuthLoadingScreen />;
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
