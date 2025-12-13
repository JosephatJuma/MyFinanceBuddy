import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ReportsStackParamList } from "./types";

// Import screens
import ReportsDashboardScreen from "../screens/reports/ReportsDashboardScreen";
import ReportDetailScreen from "../screens/reports/ReportDetailScreen";

const Stack = createNativeStackNavigator<ReportsStackParamList>();

export const ReportsStackNavigator = () => {
  return (
    <Stack.Navigator
      id="reports"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="ReportsDashboard"
        component={ReportsDashboardScreen}
        options={{ title: "Reports" }}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{ title: "Report Details" }}
      />
    </Stack.Navigator>
  );
};
