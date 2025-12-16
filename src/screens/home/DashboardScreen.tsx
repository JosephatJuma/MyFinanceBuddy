import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Text, Card, FAB, Icon, Surface, Button } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { Transaction } from "../../types";
import { useFinance } from "../../contexts/FinanceContext";
import { supabase } from "../../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import TransactionCard from "../../components/reusable/TransactionCard";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<HomeStackParamList, "Dashboard">;

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  totalInvestments: number;
  netBalance: number;
  monthlyIncome: number;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();

  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    totalInvestments: 0,
    netBalance: 0,
    monthlyIncome: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showFigures, formatCurrency, toggleShowFigures } = useFinance();

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadDashboardData();
      }
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const startOfLastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startOfMonth)
        .order("date", { ascending: false });

      const { data: recentTxns } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: lastWeekExpenses } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "expense")
        .gte("date", startOfLastWeek);

      if (transactions) {
        const income = transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
        const expenses = transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
        const savings = transactions
          .filter((t) => t.type === "saving")
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
        const investments = transactions
          .filter((t) => t.type === "investment")
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

        const monthlyIncome = profile?.monthly_income || 0;
        const netBalance = income - expenses;

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          totalSavings: savings,
          totalInvestments: investments,
          netBalance,
          monthlyIncome,
        });

        generateInsights(
          income,
          expenses,
          savings,
          monthlyIncome,
          lastWeekExpenses?.reduce(
            (sum, t) => sum + parseFloat(t.amount.toString()),
            0
          ) || 0
        );
      }

      if (recentTxns) {
        setRecentTransactions(recentTxns);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (
    income: number,
    expenses: number,
    savings: number,
    monthlyIncome: number,
    weeklyExpenses: number
  ) => {
    const insights: string[] = [];

    if (expenses > income && income > 0) {
      insights.push(
        "You're spending more than you're earning this month. Consider reviewing your expenses."
      );
    } else if (income > expenses && income > 0) {
      insights.push("Great job! You're maintaining a surplus this month.");
    }

    if (savings > 0) {
      const savingsRate =
        monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
      if (savingsRate > 20) {
        insights.push(
          `Excellent! You're saving ${savingsRate.toFixed(
            0
          )}% of your income. Keep it up!`
        );
      } else if (savingsRate > 10) {
        insights.push(
          `You're saving ${savingsRate.toFixed(
            0
          )}% of your income. Good progress!`
        );
      }
    }

    if (weeklyExpenses > monthlyIncome * 0.3) {
      insights.push(
        "You're spending quite a bit this week. Consider tracking daily expenses more carefully."
      );
    }

    if (expenses === 0 && income === 0) {
      insights.push(
        "Start tracking your daily expenses to get personalized insights!"
      );
    }

    setInsights(insights);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Greeting Header */}
        <Surface style={styles.greetingCard} elevation={0}>
          <View style={styles.greetingContent}>
            <View>
              <Text variant="bodyMedium" style={styles.greetingText}>
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return "Good Morning";
                  if (hour < 18) return "Good Afternoon";
                  return "Good Evening";
                })()}
              </Text>
              <Text variant="headlineSmall" style={styles.userName}>
                {user?.user_metadata?.full_name ||
                  user?.email?.split("@")[0] ||
                  "Guest"}
              </Text>
            </View>
            <View
              style={[
                styles.greetingIconContainer,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <Icon
                source="hand-wave"
                size={28}
                color={theme.colors.onPrimaryContainer}
              />
            </View>
          </View>
          <Text variant="bodySmall" style={styles.dateText}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </Surface>

        {/* Credit Card Style Balance Card */}
        <LinearGradient
          colors={["#667eea", "#764ba2", "#f093fb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.creditCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardChip} />
            <TouchableOpacity
              onPress={toggleShowFigures}
              style={styles.eyeButton}
            >
              <Icon
                source={showFigures ? "eye-off" : "eye"}
                size={24}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Total Balance</Text>
            <Text style={styles.cardBalance}>
              {formatCurrency(stats?.netBalance)}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoLabel}>Account Holder</Text>
              <Text style={styles.cardInfoValue}>{user?.name || "User"}</Text>
            </View>
            <View style={styles.cardLogo}>
              <Icon source="credit-card" size={32} color="#ffffff" />
            </View>
          </View>

          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} pointerEvents="none" />
          <View style={styles.decorativeCircle2} pointerEvents="none" />
        </LinearGradient>

        {insights.length > 0 && (
          <Card style={styles.insightsCard}>
            <Card.Content>
              <View style={styles.insightsHeader}>
                <View
                  style={[
                    styles.insightsIconContainer,
                    {
                      backgroundColor:
                        stats.netBalance >= 0
                          ? "rgba(76, 175, 80, 0.1)"
                          : "rgba(244, 67, 54, 0.1)",
                    },
                  ]}
                >
                  <Icon
                    source={
                      stats.netBalance >= 0 ? "check-circle" : "alert-circle"
                    }
                    size={24}
                    color={stats.netBalance >= 0 ? "#4caf50" : "#f44336"}
                  />
                </View>
                <View style={styles.insightsHeaderText}>
                  <Text variant="titleMedium">Financial Insights</Text>
                  <Text variant="bodySmall" style={styles.insightsSubtitle}>
                    {insights.length} insight{insights.length > 1 ? "s" : ""}{" "}
                    for you
                  </Text>
                </View>
              </View>
              <View style={styles.insightsList}>
                {insights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <Icon
                      source="circle-small"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text variant="bodyMedium" style={styles.insightText}>
                      {insight}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Financial Overview
          </Text>

          <View style={styles.statsGrid}>
            {/* Row 1 */}
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statCardContent}>
                  <View style={styles.statHeader}>
                    <View
                      style={[
                        styles.statIconContainer,
                        { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                      ]}
                    >
                      <Icon
                        source="arrow-down-circle"
                        size={24}
                        color="#ef4444"
                      />
                    </View>
                    <Text variant="labelLarge" style={styles.statLabel}>
                      Expenses
                    </Text>
                  </View>
                  <Text
                    variant="headlineMedium"
                    style={[styles.statValue, { color: "#ef4444" }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatCurrency(stats?.totalExpenses)}
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.statCard}>
                <Card.Content style={styles.statCardContent}>
                  <View style={styles.statHeader}>
                    <View
                      style={[
                        styles.statIconContainer,
                        { backgroundColor: "rgba(16, 185, 129, 0.1)" },
                      ]}
                    >
                      <Icon
                        source="arrow-up-circle"
                        size={24}
                        color="#10b981"
                      />
                    </View>
                    <Text variant="labelLarge" style={styles.statLabel}>
                      Income
                    </Text>
                  </View>
                  <Text
                    variant="headlineMedium"
                    style={[styles.statValue, { color: "#10b981" }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatCurrency(stats?.totalIncome)}
                  </Text>
                </Card.Content>
              </Card>
            </View>

            {/* Row 2 */}
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statCardContent}>
                  <View style={styles.statHeader}>
                    <View
                      style={[
                        styles.statIconContainer,
                        { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                      ]}
                    >
                      <Icon source="piggy-bank" size={24} color="#3b82f6" />
                    </View>
                    <Text variant="labelLarge" style={styles.statLabel}>
                      Savings
                    </Text>
                  </View>
                  <Text
                    variant="headlineMedium"
                    style={[styles.statValue, { color: "#3b82f6" }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatCurrency(stats?.totalSavings)}
                  </Text>
                </Card.Content>
              </Card>

              <Card style={styles.statCard}>
                <Card.Content style={styles.statCardContent}>
                  <View style={styles.statHeader}>
                    <View
                      style={[
                        styles.statIconContainer,
                        { backgroundColor: theme.colors.primaryContainer },
                      ]}
                    >
                      <Icon
                        source="chart-line-variant"
                        size={24}
                        color={theme.colors.onPrimaryContainer}
                      />
                    </View>
                    <Text variant="labelLarge" style={styles.statLabel}>
                      Investments
                    </Text>
                  </View>
                  <Text
                    variant="headlineMedium"
                    style={styles.statValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatCurrency(stats?.totalInvestments)}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <View>
              <Text variant="titleLarge">Recent Transactions</Text>
              <Text variant="bodySmall" style={styles.transactionsSubtitle}>
                Last {recentTransactions.length} transactions
              </Text>
            </View>
            {recentTransactions.length > 0 && (
              <Button
                mode="text"
                onPress={() => navigation.navigate("Transactions")}
                compact
              >
                View All
              </Button>
            )}
          </View>

          {recentTransactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <View
                  style={[
                    styles.emptyIconContainer,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <Icon
                    source="receipt-text-outline"
                    size={48}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  No transactions yet
                </Text>
                <Text variant="bodyMedium" style={styles.emptyDescription}>
                  Add your first transaction to get started with tracking your
                  finances!
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() =>
                    navigation.navigate("TransactionDetail", {
                      id: transaction.id,
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate("AddTransaction")}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  greetingCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  greetingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  greetingText: {
    opacity: 0.7,
    marginBottom: 4,
  },
  userName: {
    fontWeight: "600",
    textTransform: "capitalize",
  },
  greetingIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    opacity: 0.6,
  },
  creditCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    minHeight: 200,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    zIndex: 10,
  },
  cardChip: {
    width: 50,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  cardBalance: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardInfo: {
    flex: 1,
  },
  cardInfoLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardInfoValue: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  cardLogo: {
    opacity: 0.8,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -100,
    right: -50,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -50,
    left: -30,
  },
  insightsCard: {
    marginBottom: 24,
    borderRadius: 16,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  insightsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  insightsHeaderText: {
    flex: 1,
  },
  insightsSubtitle: {
    opacity: 0.6,
    marginTop: 2,
  },
  insightsList: {
    gap: 8,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  insightText: {
    flex: 1,
    marginLeft: 4,
    lineHeight: 22,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: "600",
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    minWidth: (Dimensions.get("window").width - 44) / 2,
    maxWidth: (Dimensions.get("window").width - 44) / 2,
  },
  statCardContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  statLabel: {
    fontWeight: "600",
    flex: 1,
  },
  statValue: {
    fontWeight: "700",
    marginTop: 4,
  },
  transactionsSection: {
    marginBottom: 80,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionsSubtitle: {
    opacity: 0.6,
    marginTop: 2,
  },
  transactionsList: {
    gap: 8,
  },
  emptyCard: {
    borderRadius: 16,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  emptyDescription: {
    textAlign: "center",
    opacity: 0.6,
    maxWidth: 280,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});

export default DashboardScreen;
