import { useState, useCallback, useMemo } from "react";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "auto";
export type MainNavigator = "drawer" | "tab";
export type ColorPalette = "default" | "ocean" | "sunset" | "forest" | "purple";

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

interface PaletteTheme {
  light: CustomTheme;
  dark: CustomTheme;
  name: string;
  description: string;
}

const colorPalettes: Record<ColorPalette, PaletteTheme> = {
  default: {
    name: "Default Purple",
    description: "Classic Material Design purple theme",
    light: {
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
    },
    dark: {
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
    },
  },
  ocean: {
    name: "Ocean Blue",
    description: "Calm and professional blue tones",
    light: {
      dark: false,
      colors: {
        primary: "#0277bd",
        secondary: "#00acc1",
        background: "#e3f2fd",
        surface: "#ffffff",
        text: "#01579b",
        error: "#c62828",
        success: "#2e7d32",
        warning: "#f57c00",
        info: "#0288d1",
        border: "#b3e5fc",
        card: "#ffffff",
        notification: "#00acc1",
      },
    },
    dark: {
      dark: true,
      colors: {
        primary: "#29b6f6",
        secondary: "#26c6da",
        background: "#0a1929",
        surface: "#1a2332",
        text: "#e3f2fd",
        error: "#ef5350",
        success: "#66bb6a",
        warning: "#ffa726",
        info: "#42a5f5",
        border: "#1e3a5f",
        card: "#1a2332",
        notification: "#26c6da",
      },
    },
  },
  sunset: {
    name: "Sunset Orange",
    description: "Warm and energetic orange and red tones",
    light: {
      dark: false,
      colors: {
        primary: "#f4511e",
        secondary: "#ff6f00",
        background: "#fff3e0",
        surface: "#ffffff",
        text: "#bf360c",
        error: "#c62828",
        success: "#388e3c",
        warning: "#f57c00",
        info: "#1976d2",
        border: "#ffe0b2",
        card: "#ffffff",
        notification: "#ff6f00",
      },
    },
    dark: {
      dark: true,
      colors: {
        primary: "#ff7043",
        secondary: "#ffb74d",
        background: "#1a0f0a",
        surface: "#2d1e15",
        text: "#fff3e0",
        error: "#ef5350",
        success: "#66bb6a",
        warning: "#ffa726",
        info: "#42a5f5",
        border: "#3e2723",
        card: "#2d1e15",
        notification: "#ffb74d",
      },
    },
  },
  forest: {
    name: "Forest Green",
    description: "Natural and calming green theme",
    light: {
      dark: false,
      colors: {
        primary: "#2e7d32",
        secondary: "#558b2f",
        background: "#f1f8e9",
        surface: "#ffffff",
        text: "#1b5e20",
        error: "#c62828",
        success: "#388e3c",
        warning: "#f57c00",
        info: "#0288d1",
        border: "#dcedc8",
        card: "#ffffff",
        notification: "#558b2f",
      },
    },
    dark: {
      dark: true,
      colors: {
        primary: "#66bb6a",
        secondary: "#9ccc65",
        background: "#0d1a0f",
        surface: "#1b2a1f",
        text: "#f1f8e9",
        error: "#ef5350",
        success: "#81c784",
        warning: "#ffa726",
        info: "#42a5f5",
        border: "#2e3b32",
        card: "#1b2a1f",
        notification: "#9ccc65",
      },
    },
  },
  purple: {
    name: "Royal Purple",
    description: "Elegant and sophisticated purple theme",
    light: {
      dark: false,
      colors: {
        primary: "#7b1fa2",
        secondary: "#9c27b0",
        background: "#f3e5f5",
        surface: "#ffffff",
        text: "#4a148c",
        error: "#c62828",
        success: "#388e3c",
        warning: "#f57c00",
        info: "#1976d2",
        border: "#e1bee7",
        card: "#ffffff",
        notification: "#9c27b0",
      },
    },
    dark: {
      dark: true,
      colors: {
        primary: "#ba68c8",
        secondary: "#ce93d8",
        background: "#1a0a1f",
        surface: "#2d1a35",
        text: "#f3e5f5",
        error: "#ef5350",
        success: "#66bb6a",
        warning: "#ffa726",
        info: "#42a5f5",
        border: "#3e2549",
        card: "#2d1a35",
        notification: "#ce93d8",
      },
    },
  },
};

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [mainNavigator, setMainNavigator] = useState<MainNavigator>("drawer");
  const [colorPalette, setColorPalette] = useState<ColorPalette>("default");
  const [isDark, setIsDark] = useState(false);

  const theme = useMemo(() => {
    const selectedPalette = colorPalettes[colorPalette];
    return isDark ? selectedPalette.dark : selectedPalette.light;
  }, [isDark, colorPalette]);

  const paperTheme = useMemo(() => {
    const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
    const selectedPalette = colorPalettes[colorPalette];
    const currentColors = isDark
      ? selectedPalette.dark.colors
      : selectedPalette.light.colors;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: currentColors.primary,
        secondary: currentColors.secondary,
        background: currentColors.background,
        surface: currentColors.surface,
        error: currentColors.error,
        onPrimary: isDark ? "#000000" : "#ffffff",
        onSecondary: isDark ? "#000000" : "#ffffff",
        onBackground: currentColors.text,
        onSurface: currentColors.text,
        outline: currentColors.border,
        surfaceVariant: currentColors.card,
        onSurfaceVariant: currentColors.text,
      },
    };
  }, [isDark, colorPalette]);

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

  const changeColorPalette = useCallback(async (palette: ColorPalette) => {
    setColorPalette(palette);
    await AsyncStorage.setItem("colorPalette", palette);
  }, []);

  const loadColorPalette = useCallback(async () => {
    try {
      const savedPalette = await AsyncStorage.getItem("colorPalette");
      if (savedPalette) {
        setColorPalette(savedPalette as ColorPalette);
      }
    } catch (error) {
      console.error("Error loading color palette:", error);
    }
  }, []);

  const getPaletteInfo = useCallback((palette: ColorPalette) => {
    return colorPalettes[palette];
  }, []);

  const getAllPalettes = useCallback(() => {
    return Object.entries(colorPalettes).map(([key, value]) => ({
      key: key as ColorPalette,
      name: value.name,
      description: value.description,
      lightPreview: value.light.colors.primary,
      darkPreview: value.dark.colors.primary,
    }));
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
    colorPalette,
    changeColorPalette,
    loadTheme,
    loadMainNavigator,
    loadColorPalette,
    getPaletteInfo,
    getAllPalettes,
  };
};
