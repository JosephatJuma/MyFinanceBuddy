import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Card, FAB, Icon } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { Transaction } from "../../types";
import { useFinance } from "../../contexts/FinanceContext";
import { supabase } from "../../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import TransactionCard from "../../components/reusable/TransactionCard";

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
  const { showFigures, formatCurrency, toggleShowFigures } = useFinance();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

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
      <ScrollView style={styles.scrollView}>
        {/* <Text variant="headlineMedium" style={styles.greeting}>
          Welcome, {user?.name || "User"}!
        </Text> */}

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
          <Card style={styles.card}>
            <Card.Content>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                {stats.netBalance >= 0 ? (
                  <Icon source={"check-circle"} size={25} color="#4caf50" />
                ) : (
                  <Icon source={"alert-circle"} size={25} color="#f44336" />
                )}
                <Text variant="titleMedium" style={{ marginLeft: 8 }}>
                  Financial Insights
                </Text>
              </View>
              <View>
                {insights.map((insight, index) => (
                  <Text key={index} style={{ marginBottom: 8 }}>
                    • {insight}
                  </Text>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Expenses</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {formatCurrency(stats?.totalExpenses)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Savings</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {formatCurrency(stats?.totalSavings)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Income</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {formatCurrency(stats?.totalIncome)}
            </Text>
          </Card.Content>
        </Card>

        <View>
          {recentTransactions.length === 0 ? (
            <View>
              <Text>
                No transactions yet. Add your first transaction to get started!
              </Text>
            </View>
          ) : (
            recentTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onPress={() =>
                  navigation.navigate("TransactionDetail", {
                    id: transaction.id,
                  })
                }
              />
            ))
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
  greeting: {
    marginBottom: 20,
    fontWeight: "600",
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
  card: {
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 8,
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});

export default DashboardScreen;
