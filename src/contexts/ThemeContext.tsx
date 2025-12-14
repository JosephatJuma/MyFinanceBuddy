import React, { createContext, useContext, useEffect, ReactNode } from "react";
import {
  useTheme,
  ThemeMode,
  CustomTheme,
  MainNavigator,
} from "../hooks/useTheme";

interface ThemeContextType {
  theme: CustomTheme;
  paperTheme: any;
  themeMode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
  mainNavigator: MainNavigator;
  toggleMainNavigator: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeData = useTheme();

  useEffect(() => {
    themeData.loadTheme();
    themeData.loadMainNavigator();
  }, []);

  return (
    <ThemeContext.Provider value={themeData}>{children}</ThemeContext.Provider>
  );
};
