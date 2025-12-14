import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Text,
  Searchbar,
  Menu,
  Button,
  ActivityIndicator,
  Icon,
  Divider,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TransactionsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { Transaction } from "../../types";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks";
import { useFinance } from "../../contexts/FinanceContext";
import TransactionCard from "../../components/reusable/TransactionCard";
import { useAuthContext } from "../../contexts";

type Props = NativeStackScreenProps<
  TransactionsStackParamList,
  "TransactionsList"
>;

const TransactionsListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const { formatCurrency } = useFinance();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [dateMenuVisible, setDateMenuVisible] = useState(false);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, typeFilter, dateFilter]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "yesterday":
          filterDate.setDate(now.getDate() - 1);
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (dateFilter !== "all") {
        filtered = filtered.filter((t) => new Date(t.date) >= filterDate);
      }
    }

    setFilteredTransactions(filtered);
  };

  const handleDeleteTransaction = async (id: string) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.from("transactions").delete().eq("id", id);
              loadTransactions();
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert("Error", "Failed to delete transaction");
            }
          },
        },
      ]
    );
  };

  const groupTransactionsByDate = () => {
    const grouped: Record<string, Transaction[]> = {};

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });

    return grouped;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      all: "All Types",
      income: "Income",
      expense: "Expenses",
    };
    return labels[type] || "All Types";
  };

  const getDateLabel = (date: string) => {
    const labels: Record<string, string> = {
      all: "All Time",
      today: "Today",
      yesterday: "Yesterday",
      week: "Last 7 Days",
      month: "Last Month",
      "3months": "Last 3 Months",
      year: "Last Year",
    };
    return labels[date] || "All Time";
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
          Loading transactions...
        </Text>
      </View>
    );
  }

  const groupedTransactions = groupTransactionsByDate();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon source="history" size={28} color={theme.colors.primary} />
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Transaction History
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.countText}>
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <Searchbar
            placeholder="Search transactions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            icon="magnify"
            elevation={1}
          />

          <View style={styles.filterRow}>
            <Menu
              visible={typeMenuVisible}
              onDismiss={() => setTypeMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setTypeMenuVisible(true)}
                  icon="filter"
                  style={styles.filterButton}
                  contentStyle={styles.filterButtonContent}
                >
                  {getTypeLabel(typeFilter)}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setTypeFilter("all");
                  setTypeMenuVisible(false);
                }}
                title="All Types"
                leadingIcon={typeFilter === "all" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setTypeFilter("income");
                  setTypeMenuVisible(false);
                }}
                title="Income"
                leadingIcon={typeFilter === "income" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setTypeFilter("expense");
                  setTypeMenuVisible(false);
                }}
                title="Expenses"
                leadingIcon={typeFilter === "expense" ? "check" : undefined}
              />
            </Menu>

            <Menu
              visible={dateMenuVisible}
              onDismiss={() => setDateMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setDateMenuVisible(true)}
                  icon="calendar"
                  style={styles.filterButton}
                  contentStyle={styles.filterButtonContent}
                >
                  {getDateLabel(dateFilter)}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setDateFilter("all");
                  setDateMenuVisible(false);
                }}
                title="All Time"
                leadingIcon={dateFilter === "all" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setDateFilter("today");
                  setDateMenuVisible(false);
                }}
                title="Today"
                leadingIcon={dateFilter === "today" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setDateFilter("yesterday");
                  setDateMenuVisible(false);
                }}
                title="Yesterday"
                leadingIcon={dateFilter === "yesterday" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setDateFilter("week");
                  setDateMenuVisible(false);
                }}
                title="Last 7 Days"
                leadingIcon={dateFilter === "week" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setDateFilter("month");
                  setDateMenuVisible(false);
                }}
                title="Last Month"
                leadingIcon={dateFilter === "month" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setDateFilter("3months");
                  setDateMenuVisible(false);
                }}
                title="Last 3 Months"
                leadingIcon={dateFilter === "3months" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setDateFilter("year");
                  setDateMenuVisible(false);
                }}
                title="Last Year"
                leadingIcon={dateFilter === "year" ? "check" : undefined}
              />
            </Menu>
          </View>
        </View>

        {/* Empty State */}
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon source="history" size={64} color={theme.colors.info} />
            <Text variant="titleLarge" style={styles.emptyTitle}>
              No transactions found
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {searchQuery || typeFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters"
                : "Start by adding your first transaction"}
            </Text>
          </View>
        ) : (
          /* Grouped Transactions */
          <View style={styles.transactionsContainer}>
            {Object.entries(groupedTransactions).map(([date, txns]) => (
              <View key={date} style={styles.dateGroup}>
                <View style={styles.dateHeader}>
                  <Text variant="titleMedium" style={styles.dateText}>
                    {date}
                  </Text>
                </View>
                <View style={styles.transactionsList}>
                  {txns.map((transaction, index) => (
                    <View key={transaction.id}>
                      <TransactionCard
                        transaction={transaction}
                        // onPress={() =>
                        //   navigation.navigate("TransactionDetails", {
                        //     transactionId: transaction.id,
                        //   })
                        // }
                      />
                      {index < txns.length - 1 && (
                        <View style={styles.spacer} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
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
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontWeight: "700",
    marginLeft: 8,
  },
  countText: {
    opacity: 0.6,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  searchbar: {
    marginBottom: 12,
    elevation: 1,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  filterButtonContent: {
    paddingVertical: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
  },
  transactionsContainer: {
    gap: 24,
    marginBottom: 16,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateText: {
    fontWeight: "600",
  },
  transactionsList: {
    gap: 8,
  },
  spacer: {
    height: 4,
  },
});

export default TransactionsListScreen;
