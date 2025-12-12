import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TransactionsStackParamList } from "./types";

// Import screens
import TransactionsListScreen from "../screens/transactions/TransactionsListScreen";
import TransactionDetailScreen from "../screens/transactions/TransactionDetailScreen";
import AddTransactionScreen from "../screens/transactions/AddTransactionScreen";
import EditTransactionScreen from "../screens/transactions/EditTransactionScreen";

const Stack = createNativeStackNavigator<TransactionsStackParamList>();

export const TransactionsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="TransactionsList"
        component={TransactionsListScreen}
        options={{ title: "Transactions" }}
      />
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
    </Stack.Navigator>
  );
};
