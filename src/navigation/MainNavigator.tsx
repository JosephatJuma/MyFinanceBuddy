import { View, Text } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerNavigator } from "./DrawerNavigator";
import { TabNavigator } from "./TabNavigator";
import { useThemeContext } from "../contexts";
import BudgetDetailScreen from "../screens/budget/BudgetDetailScreen";
import AddBudgetScreen from "../screens/budget/AddBudgetScreen";
import EditBudgetScreen from "../screens/budget/EditBudgetScreen";
import EditTransactionScreen from "../screens/transactions/EditTransactionScreen";
import AddTransactionScreen from "../screens/transactions/AddTransactionScreen";
import TransactionDetailScreen from "../screens/transactions/TransactionDetailScreen";
import AboutScreen from "../screens/settings/AboutScreen";
import SecurityScreen from "../screens/settings/SecurityScreen";
import PreferencesScreen from "../screens/settings/PreferencesScreen";
import ProfileScreen from "../screens/settings/ProfileScreen";

const Stack = createNativeStackNavigator();
const MainNavigator = () => {
  const { themeMode, mainNavigator } = useThemeContext();
  return (
    <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Main"
        key={`main-${mainNavigator}`}
        component={mainNavigator === "drawer" ? DrawerNavigator : TabNavigator}
      />
      {/* Budget Navigations */}
      <Stack.Screen
        name="BudgetDetail"
        component={BudgetDetailScreen}
        options={{ title: "Budget Details" }}
      />
      <Stack.Screen
        name="AddBudget"
        component={AddBudgetScreen}
        options={{ title: "Create Budget" }}
      />
      <Stack.Screen
        name="EditBudget"
        component={EditBudgetScreen}
        options={{ title: "Edit Budget" }}
      />

      {/* Transactions Navigations */}
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ title: "Transaction Details" }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: "Add Transaction" }}
      />
      <Stack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{ title: "Edit Transaction" }}
      />

      {/* Seetings Navigations */}

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

export default MainNavigator;
