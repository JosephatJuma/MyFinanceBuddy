import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "./types";

// Import screens
import SettingsMainScreen from "../screens/settings/SettingsMainScreen";
import ProfileScreen from "../screens/settings/ProfileScreen";
import PreferencesScreen from "../screens/settings/PreferencesScreen";
import SecurityScreen from "../screens/settings/SecurityScreen";
import AboutScreen from "../screens/settings/AboutScreen";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsMainScreen}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
        options={{ title: "Preferences" }}
      />
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ title: "Security" }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: "About" }}
      />
    </Stack.Navigator>
  );
};
