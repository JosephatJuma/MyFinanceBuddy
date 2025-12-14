import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

// Import stack navigators
import { HomeStackNavigator } from "./HomeStackNavigator";
import { TransactionsStackNavigator } from "./TransactionsStackNavigator";
import { BudgetStackNavigator } from "./BudgetStackNavigator";
import { ReportsStackNavigator } from "./ReportsStackNavigator";
import { SettingsStackNavigator } from "./SettingsStackNavigator";
import { useTheme } from "react-native-paper";
import HomeHeader from "../components/reusable/HomeHeader";
const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      id="main_drawer"
      screenOptions={{
        headerShown: true,
        header: (props) => <HomeHeader props={props} />,

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
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
