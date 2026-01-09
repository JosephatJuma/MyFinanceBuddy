import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, IconButton, Icon } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BudgetStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useForm } from "../../hooks/useForm";
import TextInput from "../../components/forms/TextInput";
import SelectInput from "../../components/forms/SelectInput";
import { EXPENSE_CATEGORIES } from "../../constants/options";
import { useDialog } from "../../hooks/useDialog";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";
import Header from "../../components/reusable/Header";

type Props = NativeStackScreenProps<BudgetStackParamList, "AddBudget">;

const AddBudgetScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const dialog = useDialog();
  const [loading, setLoading] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

  const form = useForm({
    category: {
      initialValue: EXPENSE_CATEGORIES[0].value,
      validation: {
        required: true,
      },
    },
    amount: {
      initialValue: "",
      validation: {
        required: true,
        custom: (value) => {
          const num = parseFloat(value);
          if (isNaN(num) || num <= 0) {
            return "Amount must be greater than 0";
          }
          return null;
        },
      },
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("budgets").insert({
        user_id: user.id,
        category: values.category,
        amount: parseFloat(values.amount),
        month: currentMonth,
      });

      if (error) {
        if (error.code === "23505") {
          dialog.showError(
            "Budget for this category already exists this month",
            "Duplicate Budget"
          );
        } else {
          throw error;
        }
      } else {
        dialog.showSuccess("Budget added successfully", "Success", () =>
          navigation.goBack()
        );
      }
    } catch (err: any) {
      dialog.showError(err.message || "Failed to add budget");
    } finally {
      setLoading(false);
    }
  });

  const categoryOptions = EXPENSE_CATEGORIES.map((cat) => ({
    label: cat.label,
    value: cat.value,
  }));

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <Header title="Add Budget" />

      <ScrollView style={styles.scrollView}>
        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: `${theme.colors.primary}15` },
          ]}
        >
          <Text variant="bodyMedium" style={styles.infoText}>
            Set a budget limit for a category to track your spending for{" "}
            {new Date(currentMonth).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Budget Details
          </Text>

          <View style={styles.inputContainer}>
            <SelectInput
              label="Category"
              options={categoryOptions}
              {...form.getFieldProps("category")}
              mode="outlined"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Budget Amount"
              placeholder="0.00"
              keyboardType="decimal-pad"
              {...form.getFieldProps("amount")}
              mode="outlined"
              left={<Icon source="currency-usd" size={25} />}
            />
          </View>

          {/* Helper Text */}
          <View style={styles.helperContainer}>
            <Text variant="bodySmall" style={styles.helperText}>
              💡 You'll receive alerts when you reach 75% and 90% of your budget
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
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
          style={styles.submitButton}
          loading={loading}
          disabled={loading || !form.isValid()}
        >
          Add Budget
        </Button>
      </View>

      <ConfirmDialog config={dialog.config} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerTitle: {
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  helperContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  helperText: {
    opacity: 0.7,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default AddBudgetScreen;
