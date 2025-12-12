import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BudgetStackParamList } from "./types";

// Import screens
import BudgetListScreen from "../screens/budget/BudgetListScreen";
import BudgetDetailScreen from "../screens/budget/BudgetDetailScreen";
import AddBudgetScreen from "../screens/budget/AddBudgetScreen";
import EditBudgetScreen from "../screens/budget/EditBudgetScreen";

const Stack = createNativeStackNavigator<BudgetStackParamList>();

export const BudgetStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="BudgetList"
        component={BudgetListScreen}
        options={{ title: "Budgets" }}
      />
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
    </Stack.Navigator>
  );
};
