import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  Icon,
  Card,
  ProgressBar,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BudgetStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { EXPENSE_CATEGORIES } from "../../constants/options";
import { useFinance } from "../../contexts/FinanceContext";
import { useFocusEffect } from "@react-navigation/native";
import { useDialog } from "../../hooks/useDialog";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";

type Props = NativeStackScreenProps<BudgetStackParamList, "BudgetList">;

interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string;
  created_at?: string;
}

interface SpendingData {
  [category: string]: number;
}

const BudgetListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const { formatCurrency } = useFinance();
  const dialog = useDialog();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [spending, setSpending] = useState<SpendingData>({});
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
  const currentMonthDisplay = new Date(currentMonth).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadBudgets();
        loadSpending();
      }
    }, [user])
  );

  const loadBudgets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", currentMonth);

      if (error) throw error;

      if (data) {
        setBudgets(data);
      }
    } catch (error) {
      console.error("Error loading budgets:", error);
      dialog.showError("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const loadSpending = async () => {
    if (!user) return;

    try {
      const startOfMonth = new Date(currentMonth).toISOString().split("T")[0];
      const endOfMonth = new Date(
        new Date(currentMonth).getFullYear(),
        new Date(currentMonth).getMonth() + 1,
        0
      )
        .toISOString()
        .split("T")[0];

      const { data, error } = await supabase
        .from("transactions")
        .select("category, amount")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .gte("date", startOfMonth)
        .lte("date", endOfMonth);

      if (error) throw error;

      if (data) {
        const spendingByCategory: SpendingData = {};
        data.forEach((transaction) => {
          const category = transaction.category;
          const amount = parseFloat(transaction.amount.toString());
          spendingByCategory[category] =
            (spendingByCategory[category] || 0) + amount;
        });
        setSpending(spendingByCategory);
      }
    } catch (error) {
      console.error("Error loading spending:", error);
    }
  };

  const handleDeleteBudget = (id: string) => {
    dialog.showConfirm(
      "Delete Budget",
      "Are you sure you want to delete this budget?",
      async () => {
        try {
          const { error } = await supabase
            .from("budgets")
            .delete()
            .eq("id", id);

          if (error) throw error;

          loadBudgets();
          dialog.showSuccess("Budget deleted successfully");
        } catch (error) {
          console.error("Error deleting budget:", error);
          dialog.showError("Failed to delete budget");
        }
      },
      undefined,
      "Delete",
      "Cancel"
    );
  };

  const getProgressPercentage = (spent: number, budget: number): number => {
    return Math.min((spent / budget) * 100, 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return "#ef4444";
    if (percentage >= 75) return "#f59e0b";
    return "#10b981";
  };

  const getCategoryIcon = (category: string): string => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category);
    return cat?.icon || "tag";
  };

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
          Loading budgets...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.headerTop}>
              <Icon source="target" size={28} color={theme.colors.primary} />
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Budget Goals
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              {currentMonthDisplay}
            </Text>
          </View>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate("AddBudget")}
            style={styles.addButton}
          >
            Add Budget
          </Button>
        </View>

        {/* Budget Cards */}
        {budgets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon source="target" size={64} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.emptyTitle}>
                No budgets set
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Set budget goals to track your spending and stay on target
              </Text>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => navigation.navigate("AddBudget")}
                style={styles.emptyButton}
              >
                Create Your First Budget
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.budgetGrid}>
            {budgets.map((budget) => {
              const spent = spending[budget.category] || 0;
              const budgetAmount = parseFloat(budget.amount.toString());
              const percentage = getProgressPercentage(spent, budgetAmount);
              const remaining = budgetAmount - spent;
              const progressColor = getProgressColor(percentage);

              return (
                <Card key={budget.id} style={styles.budgetCard}>
                  <Card.Content>
                    {/* Header */}
                    <View style={styles.budgetHeader}>
                      <View style={styles.budgetHeaderLeft}>
                        <View
                          style={[
                            styles.iconContainer,
                            { backgroundColor: `${progressColor}20` },
                          ]}
                        >
                          <Icon
                            source={getCategoryIcon(budget.category)}
                            size={24}
                            color={progressColor}
                          />
                        </View>
                        <View>
                          <Text
                            variant="titleMedium"
                            style={styles.categoryName}
                          >
                            {budget.category}
                          </Text>
                          <Text variant="bodySmall" style={styles.budgetAmount}>
                            {formatCurrency(spent)} of{" "}
                            {formatCurrency(budgetAmount)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteBudget(budget.id)}
                        style={styles.deleteButton}
                      >
                        <Icon
                          source="delete"
                          size={20}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressSection}>
                      <ProgressBar
                        progress={percentage / 100}
                        color={progressColor}
                        style={styles.progressBar}
                      />
                      <View style={styles.progressInfo}>
                        <View style={styles.remainingContainer}>
                          <Icon
                            source={
                              remaining >= 0 ? "trending-up" : "alert-circle"
                            }
                            size={16}
                            color={remaining >= 0 ? "#10b981" : "#ef4444"}
                          />
                          <Text
                            variant="bodySmall"
                            style={[
                              styles.remainingText,
                              {
                                color: remaining >= 0 ? "#10b981" : "#ef4444",
                              },
                            ]}
                          >
                            {remaining >= 0
                              ? `${formatCurrency(remaining)} remaining`
                              : `${formatCurrency(
                                  Math.abs(remaining)
                                )} over budget`}
                          </Text>
                        </View>
                        <Text variant="bodySmall" style={styles.percentageText}>
                          {percentage.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <ConfirmDialog config={dialog.config} />
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontWeight: "700",
  },
  headerSubtitle: {
    opacity: 0.6,
    marginLeft: 36,
  },
  addButton: {
    marginTop: 4,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyButton: {
    marginTop: 8,
  },
  budgetGrid: {
    gap: 16,
  },
  budgetCard: {
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  budgetHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    fontWeight: "600",
  },
  budgetAmount: {
    opacity: 0.6,
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  progressSection: {
    gap: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remainingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  remainingText: {
    fontWeight: "500",
  },
  percentageText: {
    opacity: 0.6,
  },
});

export default BudgetListScreen;
