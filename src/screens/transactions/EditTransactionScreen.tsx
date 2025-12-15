import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TransactionsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useForm } from "../../hooks/useForm";
import { Transaction } from "../../types";
import { useAuthContext } from "../../contexts";
import { supabase } from "../../lib/supabase";
import { useDialog } from "../../hooks";
import { SelectInput, DateInput, TextInput } from "../../components/forms";
import { EXPENSE_CATEGORIES } from "../../constants/options";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";

type Props = NativeStackScreenProps<
  TransactionsStackParamList,
  "EditTransaction"
>;

const EditTransactionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useThemeContext();
  const { id } = route.params;
  const { user } = useAuthContext();
  const dialog = useDialog();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setTransaction(data);
        // Initialize form with loaded transaction data
        form.setValues({
          amount: data.amount.toString(),
          description: data.description || "",
          category: data.category || "",
          type: data.type || "expense",
          date: new Date(data.date),
        });
      }
    } catch (error) {
      console.error("Error loading transaction:", error);
      dialog.showError("Failed to load transaction details", "Error");
    } finally {
      setLoading(false);
    }
  };

  const form = useForm({
    amount: {
      initialValue: "",
      validation: {
        required: true,
      },
    },
    description: {
      initialValue: "",
      validation: {
        required: true,
      },
    },
    category: {
      initialValue: "",
      validation: {
        required: true,
      },
    },
    type: {
      initialValue: "expense",
      validation: {
        required: true,
      },
    },
    date: {
      initialValue: new Date(),
      validation: {
        required: true,
      },
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!user || !transaction) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          amount: parseFloat(values.amount),
          description: values.description,
          category: values.category,
          type: values.type,
          date: values.date,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      dialog.showSuccess("Transaction updated successfully", "Success", () => {
        navigation.goBack();
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      dialog.showError("Failed to update transaction");
    }
  });

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading transaction...
        </Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text variant="titleLarge">Transaction not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  // console.log(transaction);
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Edit Transaction
            </Text>

            <SelectInput
              label="Type"
              options={[
                { label: "Income", value: "income" },
                { label: "Expense", value: "expense" },
                { label: "Savings", value: "savings" },
                { label: "Investment", value: "investment" },
              ]}
              mode="outlined"
              {...form.getFieldProps("type")}
              style={styles.input}
            />

            <SelectInput
              label="Category"
              options={EXPENSE_CATEGORIES}
              mode="outlined"
              {...form.getFieldProps("category")}
              style={styles.input}
            />

            <TextInput
              label="Amount"
              mode="outlined"
              {...form.getFieldProps("amount")}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Description"
              mode="outlined"
              {...form.getFieldProps("description")}
              style={styles.input}
            />

            <DateInput
              label="Date"
              mode="outlined"
              {...form.getFieldProps("date")}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={form.isSubmitting}
              disabled={form.isSubmitting}
              style={styles.button}
            >
              Update Transaction
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Cancel
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <ConfirmDialog config={dialog.config} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginTop: 16,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 5,
  },
  button: {
    marginTop: 8,
  },
});

export default EditTransactionScreen;
