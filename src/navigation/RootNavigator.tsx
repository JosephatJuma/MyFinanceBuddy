import React from "react";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

// Import navigators
import { AuthNavigator } from "./AuthNavigator";
import { DrawerNavigator } from "./DrawerNavigator";
import { TabNavigator } from "./TabNavigator";

// Import context
import { useAuthContext } from "../contexts/AuthContext";
import { useThemeContext } from "../contexts/ThemeContext";
import AuthLoadingScreen from "../components/reusable/AuthLoadingScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  const { themeMode, mainNavigator } = useThemeContext();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <NavigationContainer
      theme={themeMode === "dark" ? DarkTheme : DefaultTheme}
    >
      <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen
            name="Main"
            key={`main-${mainNavigator}`}
            component={
              mainNavigator === "drawer" ? DrawerNavigator : TabNavigator
            }
          />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
