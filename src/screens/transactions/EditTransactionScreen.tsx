import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TransactionsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useForm } from "../../hooks/useForm";
import { Transaction } from "../../types";
import { useAuthContext } from "../../contexts";
import { supabase } from "../../lib/supabase";
import { useDialog } from "../../hooks";
import SelectInput from "../../components/forms/SelectInput";
import DateInput from "../../components/forms/DateInput";
import TextInput from "../../components/forms/TextInput";
import { EXPENSE_CATEGORIES } from "../../constants/options";

type Props = NativeStackScreenProps<
  TransactionsStackParamList,
  "EditTransaction"
>;

const EditTransactionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useThemeContext();
  const { id } = route.params as Transaction;
  const { user } = useAuthContext();
  const dialog = useDialog();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadTransaction();
  }, []);

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
      }
    } catch (error) {
      console.error("Error loading transaction:", error);
      dialog.showError("Failed to load transaction details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const form = useForm({
    amount: {
      initialValue: transaction?.amount,
      validation: {
        required: true,
      },
    },
    description: {
      initialValue: transaction?.description || "",
      validation: {
        required: true,
      },
    },
    category: {
      initialValue: transaction?.category || "",
      validation: {
        required: true,
      },
    },
    date: {
      initialValue: transaction?.date || new Date(),
      validation: {
        required: true,
      },
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    // TODO: Update transaction
    console.log("Update transaction:", id, values);
    navigation.goBack();
  });

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default EditTransactionScreen;
