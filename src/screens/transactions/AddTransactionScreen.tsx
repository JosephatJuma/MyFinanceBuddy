import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Button,
  SegmentedButtons,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TransactionsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Icon } from "react-native-paper";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  SAVING_CATEGORIES,
  INVESTMENT_CATEGORIES,
  ExpenseType,
} from "../../types/finance";
import TextInput from "../../components/forms/TextInput";
import SelectInput from "../../components/forms/SelectInput";
import DateInput from "../../components/forms/DateInput";

type Props = NativeStackScreenProps<
  TransactionsStackParamList,
  "AddTransaction"
>;

const AddTransactionScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();

  const [type, setType] = useState<ExpenseType>("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCategoriesForType = () => {
    switch (type) {
      case "expense":
        return EXPENSE_CATEGORIES;
      case "income":
        return INCOME_CATEGORIES;
      case "saving":
        return SAVING_CATEGORIES;
      case "investment":
        return INVESTMENT_CATEGORIES;
    }
  };

  useEffect(() => {
    setCategory(getCategoriesForType()[0]);
  }, [type]);

  const handleSubmit = async () => {
    if (!user) return;

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type,
          category: category || getCategoriesForType()[0],
          amount: parseFloat(amount),
          description,
          date,
        });

      if (insertError) throw insertError;

      Alert.alert("Success", "Transaction added successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to add transaction");
      Alert.alert("Error", err.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = getCategoriesForType().map((cat) => ({
    label: cat,
    value: cat,
  }));

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text variant="headlineSmall" style={styles.title}>
            Add Transaction
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.form}>
          {/* Type Selector */}
          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.label}>
              Type
            </Text>
            <SegmentedButtons
              value={type}
              onValueChange={(value) => setType(value as ExpenseType)}
              buttons={[
                {
                  value: "expense",
                  label: "Expense",
                  style:
                    type === "expense"
                      ? { backgroundColor: theme.colors.primary }
                      : undefined,
                },
                {
                  value: "income",
                  label: "Income",
                  style:
                    type === "income"
                      ? { backgroundColor: theme.colors.primary }
                      : undefined,
                },
              ]}
              style={styles.segmentedButtons}
            />
            <SegmentedButtons
              value={type}
              onValueChange={(value) => setType(value as ExpenseType)}
              buttons={[
                {
                  value: "saving",
                  label: "Saving",
                  style:
                    type === "saving"
                      ? { backgroundColor: theme.colors.primary }
                      : undefined,
                },
                {
                  value: "investment",
                  label: "Investment",
                  style:
                    type === "investment"
                      ? { backgroundColor: theme.colors.primary }
                      : undefined,
                },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          {/* Category Selector */}
          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.label}>
              Category
            </Text>
            <SelectInput
              options={categoryOptions}
              label=""
              mode="flat"
              value={category}
              onChangeText={setCategory}
              error={false}
            />
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <TextInput
              label="Amount"
              mode="flat"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              left={<Icon source="currency-usd" size={30} />}
              error={false}
            />
          </View>

          {/* Date Input */}
          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.label}>
              Date
            </Text>
            <DateInput
              label=""
              mode="flat"
              value={date}
              onChangeText={setDate}
              error={false}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.label}>
              Description (Optional)
            </Text>
            <TextInput
              label=""
              mode="flat"
              value={description}
              onChangeText={setDescription}
              placeholder="Add a note about this transaction..."
              multiline
              numberOfLines={3}
              error={false}
              maxLength={400}
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? "Adding..." : "Add Transaction"}
            </Button>
          </View>
        </View>
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontWeight: "700",
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.3)",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default AddTransactionScreen;
