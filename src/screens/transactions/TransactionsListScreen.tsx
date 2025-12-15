import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  Text,
  Searchbar,
  Menu,
  Button,
  ActivityIndicator,
  Icon,
  FAB,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TransactionsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { Transaction } from "../../types";
import { supabase } from "../../lib/supabase";
import { useFinance } from "../../contexts/FinanceContext";
import TransactionCard from "../../components/reusable/TransactionCard";
import { useAuthContext } from "../../contexts";
import { useDialog } from "../../hooks/useDialog";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<
  TransactionsStackParamList,
  "TransactionsList"
>;

const ITEMS_PER_PAGE = 20;

const TransactionsListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const { formatCurrency } = useFinance();
  const dialog = useDialog();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [dateMenuVisible, setDateMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        resetAndLoadTransactions();
      }
    }, [user])
  );

  useEffect(() => {
    if (user) {
      resetAndLoadTransactions();
    }
  }, [typeFilter, dateFilter, searchQuery]);

  const resetAndLoadTransactions = async () => {
    setPage(0);
    setHasMore(true);
    setTransactions([]);
    await loadTransactions(0, true);
  };

  const loadTransactions = async (
    pageNum: number = page,
    reset: boolean = false
  ) => {
    if (!user || (!reset && !hasMore)) return;

    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let query = supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

      // Apply type filter
      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      // Apply date filter
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

        query = query.gte("date", filterDate.toISOString().split("T")[0]);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `category.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      const { data, error, count } = await query
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      if (data) {
        if (reset) {
          setTransactions(data);
        } else {
          setTransactions((prev) => [...prev, ...data]);
        }
        setPage(pageNum);
        setHasMore(
          data.length === ITEMS_PER_PAGE &&
            (!count || (pageNum + 1) * ITEMS_PER_PAGE < count)
        );
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      dialog.showError("Failed to load transactions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await resetAndLoadTransactions();
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadTransactions(page + 1);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    dialog.showConfirm(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      async () => {
        try {
          const { error } = await supabase
            .from("transactions")
            .delete()
            .eq("id", id);

          if (error) throw error;

          dialog.showSuccess("Transaction deleted successfully");
          await resetAndLoadTransactions();
        } catch (error) {
          console.error("Error deleting transaction:", error);
          dialog.showError("Failed to delete transaction");
        }
      },
      undefined,
      "Delete",
      "Cancel"
    );
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

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      onPress={() => navigation.navigate("TransactionDetail", { id: item.id })}
      onEdit={() => navigation.navigate("EditTransaction", { id: item.id })}
      onDelete={() => handleDeleteTransaction(item.id)}
    />
  );

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon source="history" size={28} color={theme.colors.primary} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Transactions
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.countText}>
          {transactions.length}+ transaction
          {transactions.length !== 1 ? "s" : ""}
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
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon source="history" size={64} color={theme.colors?.text} />
      <Text variant="titleLarge" style={styles.emptyTitle}>
        No transactions found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        {searchQuery || typeFilter !== "all" || dateFilter !== "all"
          ? "Try adjusting your filters"
          : "Start by adding your first transaction"}
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("AddTransaction")}
        style={styles.emptyButton}
        icon="plus"
      >
        Add Transaction
      </Button>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text variant="bodySmall" style={styles.loadingMoreText}>
          Loading more...
        </Text>
      </View>
    );
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

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.flatListContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("AddTransaction")}
        label="Add"
      />

      <ConfirmDialog config={dialog.config} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
    marginTop: 16,
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
    marginBottom: 16,
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
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  separator: {
    height: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingMoreText: {
    marginTop: 8,
    opacity: 0.6,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});

export default TransactionsListScreen;
