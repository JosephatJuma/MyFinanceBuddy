import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const user: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: profile?.name || data.user.user_metadata?.name || "User",
          avatar_url: profile?.avatar_url,
          created_at: data.user.created_at,
        };

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });

        return { success: true };
      }

      throw new Error("Login failed");
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create profile in profiles table
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                name,
                email,
                created_at: new Date().toISOString(),
              },
            ]);

          if (profileError) {
            console.error("Profile creation error:", profileError);
          }

          const user: User = {
            id: data.user.id,
            email: data.user.email || email,
            name,
            created_at: data.user.created_at,
          };

          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });

          return { success: true };
        }

        throw new Error("Registration failed");
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: error instanceof Error ? error.message : "Registration failed",
        };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
      };
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: profile?.name || session.user.user_metadata?.name || "User",
          avatar_url: profile?.avatar_url,
          created_at: session.user.created_at,
        };

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      try {
        if (!authState.user)
          return { success: false, error: "No user logged in" };

        // Update profile in Supabase
        const { error } = await supabase
          .from("profiles")
          .update({
            name: updates.name,
            avatar_url: updates.avatar_url,
          })
          .eq("id", authState.user.id);

        if (error) throw error;

        const updatedUser = { ...authState.user, ...updates };

        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }));

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Update failed",
        };
      }
    },
    [authState.user]
  );

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myfinancebuddy://reset-password',
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Password reset failed",
      };
    }
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    resetPassword,
  };
};

// No more mock functions - using real Supabase authentication
const mockRegister = async (name: string, email: string, password: string) => {
  return new Promise<{
    id: string;
    email: string;
    name: string;
    token: string;
  }>((resolve, reject) => {
    setTimeout(() => {
      if (name && email && password) {
        resolve({
          id: Date.now().toString(),
          email,
          name,
          token: "mock-token-" + Date.now(),
        });
      } else {
        reject(new Error("Invalid data"));
      }
    }, 1000);
  });
};
