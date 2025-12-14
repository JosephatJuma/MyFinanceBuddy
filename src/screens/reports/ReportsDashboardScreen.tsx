import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Text,
  SegmentedButtons,
  Menu,
  Button,
  ActivityIndicator,
  Chip,
  Divider,
  Icon,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ReportsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Transaction } from "../../types";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { useFinance } from "../../contexts/FinanceContext";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

type Props = NativeStackScreenProps<ReportsStackParamList, "ReportsDashboard">;

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface TrendData {
  name: string;
  income: number;
  expenses: number;
  savings: number;
  investments: number;
}

// Expense category colors
const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  Food: "#10b981",
  "Food & Dining": "#10b981",
  Transportation: "#3b82f6",
  Shopping: "#8b5cf6",
  Entertainment: "#ec4899",
  Bills: "#ef4444",
  "Bills & Utilities": "#ef4444",
  Healthcare: "#f59e0b",
  "Health & Fitness": "#f59e0b",
  Education: "#06b6d4",
  Personal: "#6b7280",
  Travel: "#14b8a6",
  Other: "#94a3b8",
};

// Income category colors
const INCOME_CATEGORY_COLORS: Record<string, string> = {
  Salary: "#10b981",
  Freelance: "#3b82f6",
  Business: "#8b5cf6",
  Investments: "#f59e0b",
  "Investment Returns": "#f59e0b",
  Gifts: "#ec4899",
  Other: "#94a3b8",
};

// Fallback colors for unknown categories
const FALLBACK_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#6b7280",
];

const screenWidth = Dimensions.get("window").width;

const ReportsDashboardScreen: React.FC<Props> = () => {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const { formatCurrency } = useFinance();

  const [dateRange, setDateRange] = useState<"1m" | "3m" | "6m" | "1y">("3m");
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  const [viewMode, setViewMode] = useState<"category" | "trend" | "comparison">(
    "category"
  );
  const [dateMenuVisible, setDateMenuVisible] = useState(false);
  const [showCategoryFilters, setShowCategoryFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expenseData, setExpenseData] = useState<CategoryData[]>([]);
  const [incomeData, setIncomeData] = useState<CategoryData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, dateRange, selectedCategories]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: string;
    const endDate = now.toISOString().split("T")[0];

    const monthsBack =
      dateRange === "1m"
        ? 1
        : dateRange === "3m"
        ? 3
        : dateRange === "6m"
        ? 6
        : 12;
    const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    startDate = start.toISOString().split("T")[0];

    return { startDate, endDate };
  };

  const loadReportData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate);

      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories);
      }

      const { data: transactions } = await query;

      if (transactions) {
        processExpenseData(transactions.filter((t) => t.type === "expense"));
        processIncomeData(transactions.filter((t) => t.type === "income"));
        await processTrendData(startDate, endDate);
      }
    } catch (error) {
      console.error("Error loading report data:", error);
      Alert.alert("Error", "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const processExpenseData = (expenses: Transaction[]) => {
    const categoryTotals: Record<string, number> = {};
    let total = 0;

    expenses.forEach((expense) => {
      const amount = parseFloat(expense.amount.toString());
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + amount;
      total += amount;
    });

    const data: CategoryData[] = Object.entries(categoryTotals)
      .map(([category, value], index) => {
        const percentage = (value / total) * 100;
        const color =
          EXPENSE_CATEGORY_COLORS[category] ||
          FALLBACK_COLORS[index % FALLBACK_COLORS.length];

        return {
          name: `${category} ${percentage.toFixed(0)}%`,
          value,
          percentage,
          color,
          legendFontColor: theme.colors.text,
          legendFontSize: 11,
        };
      })
      .sort((a, b) => b.value - a.value);

    setExpenseData(data);
  };

  const processIncomeData = (income: Transaction[]) => {
    const categoryTotals: Record<string, number> = {};
    let total = 0;

    income.forEach((inc) => {
      const amount = parseFloat(inc.amount.toString());
      categoryTotals[inc.category] =
        (categoryTotals[inc.category] || 0) + amount;
      total += amount;
    });

    const data: CategoryData[] = Object.entries(categoryTotals)
      .map(([category, value], index) => {
        const percentage = (value / total) * 100;
        const color =
          INCOME_CATEGORY_COLORS[category] ||
          FALLBACK_COLORS[index % FALLBACK_COLORS.length];

        return {
          name: `${category} ${percentage.toFixed(0)}%`,
          value,
          percentage,
          color,
          legendFontColor: theme.colors.text,
          legendFontSize: 11,
        };
      })
      .sort((a, b) => b.value - a.value);

    setIncomeData(data);
  };

  const processTrendData = async (startDate: string, endDate: string) => {
    if (!user) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthsDiff =
      (end.getFullYear() - start.getFullYear()) * 12 +
      end.getMonth() -
      start.getMonth();
    const trends: TrendData[] = [];

    for (let i = 0; i <= Math.min(monthsDiff, 11); i++) {
      const month = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const monthStr = month.toISOString().slice(0, 7);
      const monthStart = monthStr + "-01";
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const { data: transactions } = await supabase
        .from("transactions")
        .select("type, amount")
        .eq("user_id", user.id)
        .gte("date", monthStart)
        .lte("date", monthEnd);

      const income =
        transactions
          ?.filter((t) => t.type === "income")
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      const expenses =
        transactions
          ?.filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      const savings =
        transactions
          ?.filter((t) => t.type === "saving")
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      const investments =
        transactions
          ?.filter((t) => t.type === "investment")
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

      trends.push({
        name: month.toLocaleDateString("en-US", {
          month: "short",
        }),
        income,
        expenses,
        savings,
        investments,
      });
    }

    setTrendData(trends);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const allCategories = Array.from(
    new Set([
      ...expenseData.map((d) => d.name),
      ...incomeData.map((d) => d.name),
    ])
  );

  const getDateLabel = (range: string) => {
    const labels: Record<string, string> = {
      "1m": "Last Month",
      "3m": "Last 3 Months",
      "6m": "Last 6 Months",
      "1y": "Last Year",
    };
    return labels[range] || "Last 3 Months";
  };

  const chartConfig: AbstractChartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      `rgba(${theme.dark ? "187, 134, 252" : "98, 0, 238"}, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: "500" as any,
    },
    propsForBackgroundLines: {
      strokeDasharray: "", // solid lines
      stroke: theme.dark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      strokeWidth: 1,
    },
    formatYLabel: (value) => {
      const num = parseFloat(value);
      if (num >= 1000) {
        return `UGX${(num / 1000).toFixed(0)}k`;
      }
      return `UGX${num.toFixed(0)}`;
    },
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
          Loading reports...
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
          <View style={styles.headerLeft}>
            <Icon source="chart-bar" size={28} color={theme.colors.primary} />
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Financial Reports
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersCard}>
          <View style={styles.filterHeader}>
            <Icon source="filter" size={20} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.filterTitle}>
              Filters
            </Text>
          </View>

          {/* Date Range */}
          <View style={styles.filterSection}>
            <Text variant="labelLarge" style={styles.filterLabel}>
              Date Range
            </Text>
            <Menu
              visible={dateMenuVisible}
              onDismiss={() => setDateMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setDateMenuVisible(true)}
                  icon="calendar"
                  style={styles.filterButton}
                >
                  {getDateLabel(dateRange)}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setDateRange("1m");
                  setDateMenuVisible(false);
                }}
                title="Last Month"
                leadingIcon={dateRange === "1m" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setDateRange("3m");
                  setDateMenuVisible(false);
                }}
                title="Last 3 Months"
                leadingIcon={dateRange === "3m" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setDateRange("6m");
                  setDateMenuVisible(false);
                }}
                title="Last 6 Months"
                leadingIcon={dateRange === "6m" ? "check" : undefined}
              />
              <Menu.Item
                onPress={() => {
                  setDateRange("1y");
                  setDateMenuVisible(false);
                }}
                title="Last Year"
                leadingIcon={dateRange === "1y" ? "check" : undefined}
              />
            </Menu>
          </View>

          {/* View Mode */}
          <View style={styles.filterSection}>
            <Text variant="labelLarge" style={styles.filterLabel}>
              View Mode
            </Text>
            <SegmentedButtons
              value={viewMode}
              onValueChange={(value) => setViewMode(value as any)}
              buttons={[
                { value: "category", label: "Category" },
                { value: "trend", label: "Trend" },
                { value: "comparison", label: "Compare" },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          {/* Chart Type (only for category view) */}
          {viewMode === "category" && (
            <View style={styles.filterSection}>
              <Text variant="labelLarge" style={styles.filterLabel}>
                Chart Type
              </Text>
              <SegmentedButtons
                value={chartType}
                onValueChange={(value) => setChartType(value as any)}
                buttons={[
                  { value: "pie", label: "Pie Chart", icon: "chart-pie" },
                  { value: "bar", label: "Bar Chart", icon: "chart-bar" },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
          )}

          {/* Category Filters Toggle */}
          {allCategories.length > 0 && (
            <View style={styles.filterSection}>
              <TouchableOpacity
                onPress={() => setShowCategoryFilters(!showCategoryFilters)}
                style={styles.filterToggle}
              >
                <View style={styles.filterToggleLeft}>
                  <Icon
                    source={
                      showCategoryFilters ? "chevron-down" : "chevron-right"
                    }
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text variant="labelLarge" style={styles.filterLabel}>
                    Filter by Categories
                  </Text>
                </View>
                {selectedCategories.length > 0 && (
                  <Chip
                    compact
                    style={styles.categoryCountChip}
                    textStyle={{ fontSize: 11 }}
                  >
                    {selectedCategories.length} selected
                  </Chip>
                )}
              </TouchableOpacity>

              {showCategoryFilters && (
                <View style={styles.chipContainer}>
                  {allCategories.map((category) => (
                    <Chip
                      key={category}
                      selected={
                        selectedCategories.length === 0 ||
                        selectedCategories.includes(category)
                      }
                      onPress={() => toggleCategory(category)}
                      style={styles.chip}
                    >
                      {category}
                    </Chip>
                  ))}
                  {selectedCategories.length > 0 && (
                    <Chip
                      onPress={() => setSelectedCategories([])}
                      style={[styles.chip, styles.clearChip]}
                      textStyle={{ color: "#ef4444" }}
                    >
                      Clear All
                    </Chip>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Charts Section */}
        {viewMode === "category" && (
          <>
            {/* Expenses Chart */}
            {expenseData.length > 0 && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Icon source="chart-pie" size={20} color="#ef4444" />
                  <Text variant="titleMedium" style={styles.chartTitle}>
                    Expenses by Category
                  </Text>
                </View>
                {chartType === "pie" ? (
                  <View>
                    <PieChart
                      data={expenseData}
                      width={screenWidth - 64}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="value"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      center={[10, 0]}
                      absolute
                      hasLegend={true}
                    />
                  </View>
                ) : (
                  <View>
                    <BarChart
                      data={{
                        labels: expenseData.map((d) => {
                          const cleanName = d.name.replace(/ \d+%$/, "");
                          return cleanName.substring(0, 6);
                        }),
                        datasets: [
                          {
                            data: expenseData.map((d) => d.value),
                            colors: expenseData.map((d) => () => d.color),
                          },
                        ],
                      }}
                      width={screenWidth - 64}
                      height={240}
                      chartConfig={chartConfig}
                      verticalLabelRotation={30}
                      //yAxisLabel=""
                      fromZero
                      showValuesOnTopOfBars
                      withInnerLines
                      style={styles.barChart}
                    />
                    <Text variant="bodySmall" style={styles.chartHint}>
                      💡 Tap legend items to filter categories
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Income Chart */}
            {incomeData.length > 0 && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Icon source="chart-bar" size={20} color="#10b981" />
                  <Text variant="titleMedium" style={styles.chartTitle}>
                    Income by Source
                  </Text>
                </View>
                {chartType === "pie" ? (
                  <View>
                    <PieChart
                      data={incomeData}
                      width={screenWidth - 64}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="value"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      center={[10, 0]}
                      absolute
                      hasLegend={true}
                    />
                  </View>
                ) : (
                  <View>
                    <BarChart
                      data={{
                        labels: incomeData.map((d) => {
                          const cleanName = d.name.replace(/ \d+%$/, "");
                          return cleanName.substring(0, 6);
                        }),
                        datasets: [
                          {
                            data: incomeData.map((d) => d.value),
                            colors: incomeData.map((d) => () => d.color),
                          },
                        ],
                      }}
                      width={screenWidth - 64}
                      height={240}
                      chartConfig={chartConfig}
                      verticalLabelRotation={30}
                      //yAxisLabel="$"
                      fromZero
                      showValuesOnTopOfBars
                      withInnerLines
                      style={styles.barChart}
                    />
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {viewMode === "trend" && trendData.length > 0 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Icon
                source="chart-line"
                size={20}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.chartTitle}>
                Financial Trends Over Time
              </Text>
            </View>
            <View>
              <LineChart
                data={{
                  labels: trendData.map((d) => d.name),
                  datasets: [
                    {
                      data: trendData.map((d) => d.income),
                      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                      strokeWidth: 3,
                    },
                    {
                      data: trendData.map((d) => d.expenses),
                      color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                      strokeWidth: 3,
                    },
                    {
                      data: trendData.map((d) => d.savings),
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                      strokeWidth: 3,
                    },
                    {
                      data: trendData.map((d) => d.investments),
                      color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                      strokeWidth: 3,
                    },
                  ],
                  legend: ["Income", "Expenses", "Savings", "Investments"],
                }}
                width={screenWidth - 64}
                height={280}
                chartConfig={chartConfig}
                bezier
                style={styles.lineChart}
                //yAxisLabel="$"
                withDots={true}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={true}
              />
              <Text variant="bodySmall" style={styles.chartHint}>
                💡 Track your financial trends over time
              </Text>
            </View>
          </View>
        )}

        {viewMode === "comparison" && trendData.length > 0 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Icon source="chart-bar" size={20} color="#3b82f6" />
              <Text variant="titleMedium" style={styles.chartTitle}>
                Monthly Comparison
              </Text>
            </View>
            <View>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#10b981" }]}
                  />
                  <Text variant="bodySmall">Income</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#ef4444" }]}
                  />
                  <Text variant="bodySmall">Expenses</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#3b82f6" }]}
                  />
                  <Text variant="bodySmall">Savings</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#8b5cf6" }]}
                  />
                  <Text variant="bodySmall">Investments</Text>
                </View>
              </View>
              <BarChart
                data={{
                  labels: trendData.map((d) => d.name),
                  datasets: [
                    { data: trendData.map((d) => Math.max(d.income, 0.01)) },
                    { data: trendData.map((d) => Math.max(d.expenses, 0.01)) },
                    { data: trendData.map((d) => Math.max(d.savings, 0.01)) },
                    {
                      data: trendData.map((d) => Math.max(d.investments, 0.01)),
                    },
                  ],
                }}
                width={screenWidth - 64}
                height={260}
                chartConfig={{
                  ...chartConfig,
                  barPercentage: 0.7,
                }}
                //yAxisLabel="$"
                fromZero
                withInnerLines
                style={styles.barChart}
              />
              <Text variant="bodySmall" style={styles.chartHint}>
                💡 Compare income vs expenses across months
              </Text>
            </View>
          </View>
        )}

        {/* Empty State */}
        {!loading &&
          expenseData.length === 0 &&
          incomeData.length === 0 &&
          trendData.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon
                source="chart-line"
                size={64}
                color={theme.colors.outline}
              />
              <Text variant="titleLarge" style={styles.emptyTitle}>
                No data available
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Add transactions to see your financial reports
              </Text>
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
  filtersCard: {
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  filterTitle: {
    fontWeight: "600",
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontWeight: "600",
  },
  filterToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  categoryCountChip: {
    backgroundColor: "rgba(98, 0, 238, 0.1)",
  },
  filterButton: {
    marginBottom: 0,
  },
  segmentedButtons: {
    marginBottom: 0,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    marginBottom: 0,
  },
  clearChip: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  chartCard: {
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  chartTitle: {
    fontWeight: "600",
  },
  barChart: {
    borderRadius: 16,
  },
  lineChart: {
    borderRadius: 16,
  },
  chartHint: {
    marginTop: 12,
    textAlign: "center",
    opacity: 0.6,
    fontStyle: "italic",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
});

export default ReportsDashboardScreen;
