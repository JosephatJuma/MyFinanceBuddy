import { useState, useCallback, useMemo } from "react";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "auto";
export type MainNavigator = "drawer" | "tab";

export interface CustomTheme {
  dark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    border: string;
    card: string;
    notification: string;
  };
}

const lightTheme: CustomTheme = {
  dark: false,
  colors: {
    primary: "#6200ee",
    secondary: "#03dac4",
    background: "#f6f6f6",
    surface: "#ffffff",
    text: "#000000",
    error: "#B00020",
    success: "#4caf50",
    warning: "#ff9800",
    info: "#2196f3",
    border: "#e0e0e0",
    card: "#ffffff",
    notification: "#ff4081",
  },
};

const darkTheme: CustomTheme = {
  dark: true,
  colors: {
    primary: "#bb86fc",
    secondary: "#03dac6",
    background: "#121212",
    surface: "#1e1e1e",
    text: "#ffffff",
    error: "#cf6679",
    success: "#81c784",
    warning: "#ffb74d",
    info: "#64b5f6",
    border: "#2c2c2c",
    card: "#1e1e1e",
    notification: "#ff4081",
  },
};

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [mainNavigator, setMainNavigator] = useState<MainNavigator>("drawer");
  const [isDark, setIsDark] = useState(false);

  const theme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const paperTheme = useMemo(() => {
    return isDark ? MD3DarkTheme : MD3LightTheme;
  }, [isDark]);

  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = themeMode === "light" ? "dark" : "light";
    setThemeMode(newMode);
    setIsDark(newMode === "dark");
    await AsyncStorage.setItem("themeMode", newMode);
  }, [themeMode]);

  const toggleMainNavigator = useCallback(async () => {
    const newMainNavigator: MainNavigator =
      mainNavigator === "drawer" ? "tab" : "drawer";
    setMainNavigator(newMainNavigator);

    await AsyncStorage.setItem("mainNavigator", newMainNavigator);
  }, [mainNavigator]);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeMode(mode);
    setIsDark(mode === "dark");
    await AsyncStorage.setItem("themeMode", mode);
  }, []);

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("themeMode");
      if (savedTheme) {
        setThemeMode(savedTheme as ThemeMode);
        setIsDark(savedTheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  }, []);

  const loadMainNavigator = useCallback(async () => {
    try {
      const savedNavigation = await AsyncStorage.getItem("mainNavigator");
      if (savedNavigation) {
        setMainNavigator(savedNavigation as MainNavigator);
      }
    } catch (error) {
      console.error("Error loading navigator:", error);
    }
  }, []);

  return {
    theme,
    paperTheme,
    themeMode,
    isDark,
    toggleTheme,
    setTheme,
    mainNavigator,
    toggleMainNavigator,
    loadTheme,
    loadMainNavigator,
  };
};
