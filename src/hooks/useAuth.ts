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

      if (error) {
        console.error("Login error:", error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });

        // Return user-friendly error messages
        let errorMessage = "Login failed. Please try again.";
        if (error.message.includes("Invalid login credentials")) {
          errorMessage =
            "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email address before logging in.";
        } else if (error.message.includes("network")) {
          errorMessage =
            "Network error. Please check your internet connection.";
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      if (data.user) {
        console.log("Login successful for user:", data.user.id);

        // Fetch user profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
        }

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

      throw new Error("Login failed - no user data returned");
    } catch (error) {
      console.error("Login exception:", error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
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

        if (error) {
          console.error("Registration error:", error);
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });

          // Return user-friendly error messages
          let errorMessage = "Registration failed. Please try again.";
          if (error.message.includes("already registered")) {
            errorMessage =
              "This email is already registered. Please login instead.";
          } else if (error.message.includes("Password")) {
            errorMessage = "Password must be at least 6 characters long.";
          } else if (error.message.includes("Email")) {
            errorMessage = "Please enter a valid email address.";
          } else if (error.message.includes("network")) {
            errorMessage =
              "Network error. Please check your internet connection.";
          }

          return {
            success: false,
            error: errorMessage,
          };
        }

        if (data.user) {
          console.log("Registration successful for user:", data.user.id);

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
            // Continue even if profile creation fails
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

        throw new Error("Registration failed - no user data returned");
      } catch (error) {
        console.error("Registration exception:", error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Registration failed. Please try again.",
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
      //navigation?.replace("Auth");
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
      console.log("Checking authentication status...");
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      // Handle session error
      if (sessionError) {
        console.error("Session error:", sessionError);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // Handle no session found
      if (!session?.user) {
        console.log("No active session found");
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      console.log("Session found for user:", session.user.id);

      // Session found - fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 = no rows returned (profile doesn't exist yet)
        console.error("Profile fetch error:", profileError);
      }

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

      console.log("Auth check completed, user authenticated:", user.email);
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      console.log("Auth check completed with error");
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
        redirectTo: "myfinancebuddy://reset-password",
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
