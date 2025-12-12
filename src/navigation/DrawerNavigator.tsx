import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { DrawerParamList } from "./types";
import { Ionicons } from "@expo/vector-icons";

// Import stack navigators
import { HomeStackNavigator } from "./HomeStackNavigator";
import { TransactionsStackNavigator } from "./TransactionsStackNavigator";
import { BudgetStackNavigator } from "./BudgetStackNavigator";
import { ReportsStackNavigator } from "./ReportsStackNavigator";
import { SettingsStackNavigator } from "./SettingsStackNavigator";

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          width: 280,
        },
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          drawerLabel: "Home",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Transactions"
        component={TransactionsStackNavigator}
        options={{
          drawerLabel: "Transactions",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Budget"
        component={BudgetStackNavigator}
        options={{
          drawerLabel: "Budget",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsStackNavigator}
        options={{
          drawerLabel: "Reports",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          drawerLabel: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
