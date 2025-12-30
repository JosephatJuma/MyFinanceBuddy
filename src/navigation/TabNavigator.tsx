import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

// Import stack navigators
import { useTheme } from "react-native-paper";
import HomeHeader from "../components/reusable/HomeHeader";
import BudgetListScreen from "../screens/budget/BudgetListScreen";
import TransactionsListScreen from "../screens/transactions/TransactionsListScreen";
import SettingsMainScreen from "../screens/settings/SettingsMainScreen";
import DashboardScreen from "../screens/home/DashboardScreen";
import ReportsDashboardScreen from "../screens/reports/ReportsDashboardScreen";
const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      id="main_drawer"
      screenOptions={{
        headerShown: true,
        header: (props) => <HomeHeader props={props} />,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: {
          // width: 280,
          backgroundColor: colors.background,
          borderTopWidth: 0,
        },
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsMainScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
