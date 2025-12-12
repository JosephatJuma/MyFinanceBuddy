import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  email: string;
  name: string;
  token?: string;
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

      // TODO: Replace with actual API call
      const response = await mockLogin(email, password);

      const user: User = {
        id: response.id,
        email: response.email,
        name: response.name,
        token: response.token,
      };

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("token", response.token);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
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

        // TODO: Replace with actual API call
        const response = await mockRegister(name, email, password);

        const user: User = {
          id: response.id,
          email: response.email,
          name: response.name,
          token: response.token,
        };

        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("token", response.token);

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });

        return { success: true };
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
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

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
      const userString = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (userString && token) {
        const user: User = JSON.parse(userString);
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

        const updatedUser = { ...authState.user, ...updates };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

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

  return {
    ...authState,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
  };
};

// Mock API functions - Replace with actual API calls
const mockLogin = async (email: string, password: string) => {
  return new Promise<{
    id: string;
    email: string;
    name: string;
    token: string;
  }>((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        resolve({
          id: "1",
          email,
          name: "Test User",
          token: "mock-token-" + Date.now(),
        });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 1000);
  });
};

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
