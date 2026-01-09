import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from "react-native";
import {
  Text,
  SegmentedButtons,
  Menu,
  Button,
  ActivityIndicator,
  Chip,
  Card,
  Surface,
  Icon,
} from "react-native-paper";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ReportsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Transaction } from "../../types";
import { PieChart, BarChart, LineChart } from "react-native-chart-kit";
import { useFinance } from "../../contexts/FinanceContext";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { useDialog } from "../../hooks/useDialog";
import DateInput from "../../components/forms/DateInput";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";

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
  const dialog = useDialog();

  const [dateRange, setDateRange] = useState<
    "1m" | "3m" | "6m" | "1y" | "custom"
  >("3m");
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() - 3))
      .toISOString()
      .split("T")[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
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
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, dateRange, selectedCategories, customStartDate, customEndDate]);

  const getDateRange = () => {
    if (dateRange === "custom") {
      return {
        startDate: customStartDate,
        endDate: customEndDate,
      };
    }

    const now = new Date();
    let startDate: string;
    const endDate = now.toISOString().split("T")[0];

    if (dateRange === "1m") {
      // Get first day of current month
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = start.toISOString().split("T")[0];
    } else {
      const monthsBack = dateRange === "3m" ? 3 : dateRange === "6m" ? 6 : 12;
      const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      startDate = start.toISOString().split("T")[0];
    }

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
      dialog.showError("Failed to load report data");
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
    if (range === "custom") {
      const start = new Date(customStartDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const end = new Date(customEndDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${start} - ${end}`;
    }
    const labels: Record<string, string> = {
      "1m": "This Month",
      "3m": "Last 3 Months",
      "6m": "Last 6 Months",
      "1y": "Last Year",
    };
    return labels[range] || "Last 3 Months";
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const { startDate, endDate } = getDateRange();

      // Fetch all transactions for the period
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      if (!transactions || transactions.length === 0) {
        Alert.alert(
          "No Data",
          "No transactions found for the selected period."
        );
        return;
      }

      // Calculate totals by type
      const income = transactions.filter((t) => t.type === "income");
      const expenses = transactions.filter((t) => t.type === "expense");
      const savings = transactions.filter((t) => t.type === "saving");
      const investments = transactions.filter((t) => t.type === "investment");

      const totalIncome = income.reduce(
        (sum, t) => sum + parseFloat(t.amount.toString()),
        0
      );
      const totalExpenses = expenses.reduce(
        (sum, t) => sum + parseFloat(t.amount.toString()),
        0
      );
      const totalSavings = savings.reduce(
        (sum, t) => sum + parseFloat(t.amount.toString()),
        0
      );
      const totalInvestments = investments.reduce(
        (sum, t) => sum + parseFloat(t.amount.toString()),
        0
      );

      // Create CSV content
      let csvContent = "";

      // Summary Section
      csvContent += "Financial Report Summary\n";
      csvContent += `Period:,${startDate} to ${endDate}\n`;
      csvContent += `Generated:,${new Date().toLocaleString()}\n`;
      csvContent += "\n";
      csvContent += "Category,Amount (UGX)\n";
      csvContent += `Total Income,${totalIncome.toFixed(2)}\n`;
      csvContent += `Total Expenses,${totalExpenses.toFixed(2)}\n`;
      csvContent += `Total Savings,${totalSavings.toFixed(2)}\n`;
      csvContent += `Total Investments,${totalInvestments.toFixed(2)}\n`;
      csvContent += `Net Balance,${(totalIncome - totalExpenses).toFixed(2)}\n`;
      csvContent += "\n\n";

      // Income Details
      if (income.length > 0) {
        csvContent += "INCOME DETAILS\n";
        csvContent += "Date,Category,Description,Amount (UGX)\n";
        income.forEach((t) => {
          const desc = (t.description || "").replace(/,/g, ";");
          csvContent += `${t.date},${t.category},${desc},${parseFloat(
            t.amount.toString()
          ).toFixed(2)}\n`;
        });
        csvContent += `,,Total Income:,${totalIncome.toFixed(2)}\n`;
        csvContent += "\n\n";
      }

      // Expense Details
      if (expenses.length > 0) {
        csvContent += "EXPENSE DETAILS\n";
        csvContent += "Date,Category,Description,Amount (UGX)\n";
        expenses.forEach((t) => {
          const desc = (t.description || "").replace(/,/g, ";");
          csvContent += `${t.date},${t.category},${desc},${parseFloat(
            t.amount.toString()
          ).toFixed(2)}\n`;
        });
        csvContent += `,,Total Expenses:,${totalExpenses.toFixed(2)}\n`;
        csvContent += "\n\n";
      }

      // Savings Details
      if (savings.length > 0) {
        csvContent += "SAVINGS DETAILS\n";
        csvContent += "Date,Category,Description,Amount (UGX)\n";
        savings.forEach((t) => {
          const desc = (t.description || "").replace(/,/g, ";");
          csvContent += `${t.date},${t.category},${desc},${parseFloat(
            t.amount.toString()
          ).toFixed(2)}\n`;
        });
        csvContent += `,,Total Savings:,${totalSavings.toFixed(2)}\n`;
        csvContent += "\n\n";
      }

      // Investments Details
      if (investments.length > 0) {
        csvContent += "INVESTMENTS DETAILS\n";
        csvContent += "Date,Category,Description,Amount (UGX)\n";
        investments.forEach((t) => {
          const desc = (t.description || "").replace(/,/g, ";");
          csvContent += `${t.date},${t.category},${desc},${parseFloat(
            t.amount.toString()
          ).toFixed(2)}\n`;
        });
        csvContent += `,,Total Investments:,${totalInvestments.toFixed(2)}\n`;
        csvContent += "\n\n";
      }

      // Category Breakdown
      csvContent += "CATEGORY BREAKDOWN\n\n";
      csvContent += "Expense Categories\n";
      csvContent += "Category,Amount (UGX),Percentage\n";
      expenseData.forEach((d) => {
        csvContent += `${d.name.replace(/ \d+%$/, "")},${d.value.toFixed(
          2
        )},${d.percentage.toFixed(2)}%\n`;
      });
      csvContent += "\n";
      csvContent += "Income Sources\n";
      csvContent += "Source,Amount (UGX),Percentage\n";
      incomeData.forEach((d) => {
        csvContent += `${d.name.replace(/ \d+%$/, "")},${d.value.toFixed(
          2
        )},${d.percentage.toFixed(2)}%\n`;
      });

      // Save to file
      const fileName = `financial_report_${startDate}_to_${endDate}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: "utf8",
      });

      // Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Financial Report",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert(
          "Export Complete",
          `Report saved to: ${fileName}\n\nYou can find it in your app's documents folder.`
        );
      }

      dialog.showSuccess("Report exported successfully!", "Export Complete");
    } catch (error: any) {
      console.error("Export error:", error);
      dialog.showError(
        error?.message || "Failed to export report",
        "Export Failed"
      );
    } finally {
      setExporting(false);
    }
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View
              style={[
                styles.headerIconContainer,
                //{ backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <Icon
                source="chart-line"
                size={32}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.headerText}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Financial Reports
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                Analyze your spending patterns
              </Text>
            </View>
          </View>
        </View>

        {/* Filters Card */}
        <Card style={styles.filtersCard}>
          <Card.Content>
            <View style={styles.filterHeader}>
              <Icon
                source="filter-variant"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.filterTitle}>
                Report Filters
              </Text>
            </View>

            {/* Date Range Selector */}
            <View style={styles.filterSection}>
              <Text variant="labelLarge" style={styles.filterLabel}>
                Date Range
              </Text>
              <View style={styles.dateRangeButtons}>
                <SegmentedButtons
                  value={dateRange}
                  onValueChange={(value) => setDateRange(value as any)}
                  buttons={[
                    { value: "custom", label: "Custom" },
                    { value: "1m", label: "1M" },
                    { value: "3m", label: "3M" },
                    // { value: "6m", label: "6M" },
                    { value: "1y", label: "1Y" },
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>
            </View>

            {/* Custom Date Range Inputs */}
            {dateRange === "custom" && (
              <View style={styles.customDateSection}>
                <Surface
                  style={[
                    styles.customDateCard,
                    //{ backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <Icon
                    source="calendar-range"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text variant="bodySmall" style={styles.customDateLabel}>
                    Select your custom date range
                  </Text>
                </Surface>
                <View style={styles.dateInputsRow}>
                  <View style={styles.dateInputWrapper}>
                    <DateInput
                      label="Start Date"
                      value={customStartDate}
                      onChangeText={(value) => setCustomStartDate(value as any)}
                      mode="outlined"
                      style={styles.dateInput}
                    />
                  </View>
                  <View style={styles.dateInputWrapper}>
                    <DateInput
                      label="End Date"
                      value={customEndDate}
                      onChangeText={(value) => setCustomEndDate(value as any)}
                      mode="outlined"
                      //minimumDate={customStartDate}
                      // maximumDate={new Date()}
                      style={styles.dateInput}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* View Mode */}
            <View style={styles.filterSection}>
              <Text variant="labelLarge" style={styles.filterLabel}>
                View Mode
              </Text>
              <SegmentedButtons
                value={viewMode}
                onValueChange={(value) => setViewMode(value as any)}
                buttons={[
                  { value: "category", label: "Category", icon: "chart-pie" },
                  { value: "trend", label: "Trend", icon: "chart-line" },
                  { value: "comparison", label: "Compare", icon: "chart-bar" },
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
                      Filter Categories
                    </Text>
                  </View>
                  {selectedCategories.length > 0 && (
                    <Chip
                      compact
                      style={[styles.categoryCountChip]}
                      textStyle={{ fontSize: 11, color: theme.colors.primary }}
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
                        textStyle={{ color: theme.colors.error }}
                        icon="close"
                      >
                        Clear
                      </Chip>
                    )}
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Export Button */}
        {(expenseData.length > 0 ||
          incomeData.length > 0 ||
          trendData.length > 0) && (
          <Card style={styles.exportCard} elevation={1}>
            <Card.Content>
              <View style={styles.exportContainer}>
                <View style={styles.exportLeft}>
                  <Icon source="file-excel" size={32} color="#217346" />
                  <View style={styles.exportTextContainer}>
                    <Text variant="titleMedium" style={styles.exportTitle}>
                      Export to CSV
                    </Text>
                    <Text variant="bodySmall" style={styles.exportSubtitle}>
                      Download report for {getDateLabel(dateRange)}
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  onPress={exportToCSV}
                  loading={exporting}
                  disabled={exporting}
                  icon="download"
                  style={styles.exportButton}
                  buttonColor="#217346"
                >
                  Export
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Charts Section */}
        {viewMode === "category" && (
          <>
            {/* Expenses Chart */}
            {expenseData.length > 0 && (
              <Card style={styles.chartCard} elevation={2}>
                <Card.Content>
                  <View style={styles.chartHeader}>
                    <View
                      style={[
                        styles.chartIconContainer,
                        { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                      ]}
                    >
                      <Icon
                        source="arrow-down-circle"
                        size={24}
                        color="#ef4444"
                      />
                    </View>
                    <View style={styles.chartTitleContainer}>
                      <Text variant="titleMedium" style={styles.chartTitle}>
                        Expenses by Category
                      </Text>
                      <Text variant="bodySmall" style={styles.chartSubtitle}>
                        {expenseData.length} categories
                      </Text>
                    </View>
                  </View>
                  {chartType === "pie" ? (
                    <View style={styles.chartWrapper}>
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
                    <View style={styles.chartWrapper}>
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
                        fromZero
                        showValuesOnTopOfBars
                        withInnerLines
                        style={styles.barChart}
                      />
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Income Chart */}
            {incomeData.length > 0 && (
              <Card style={styles.chartCard} elevation={2}>
                <Card.Content>
                  <View style={styles.chartHeader}>
                    <View
                      style={[
                        styles.chartIconContainer,
                        { backgroundColor: "rgba(16, 185, 129, 0.1)" },
                      ]}
                    >
                      <Icon
                        source="arrow-up-circle"
                        size={24}
                        color="#10b981"
                      />
                    </View>
                    <View style={styles.chartTitleContainer}>
                      <Text variant="titleMedium" style={styles.chartTitle}>
                        Income by Source
                      </Text>
                      <Text variant="bodySmall" style={styles.chartSubtitle}>
                        {incomeData.length} sources
                      </Text>
                    </View>
                  </View>
                  {chartType === "pie" ? (
                    <View style={styles.chartWrapper}>
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
                    <View style={styles.chartWrapper}>
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
                        fromZero
                        showValuesOnTopOfBars
                        withInnerLines
                        style={styles.barChart}
                      />
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {viewMode === "trend" && trendData.length > 0 && (
          <Card style={styles.chartCard} elevation={2}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <View
                  style={[
                    styles.chartIconContainer,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Icon
                    source="chart-line"
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.chartTitleContainer}>
                  <Text variant="titleMedium" style={styles.chartTitle}>
                    Financial Trends
                  </Text>
                  <Text variant="bodySmall" style={styles.chartSubtitle}>
                    Track performance over time
                  </Text>
                </View>
              </View>
              <View style={styles.chartWrapper}>
                <LineChart
                  data={{
                    labels: trendData.map((d) => d.name),
                    datasets: [
                      {
                        data: trendData.map((d) => d.income),
                        color: (opacity = 1) =>
                          `rgba(16, 185, 129, ${opacity})`,
                        strokeWidth: 3,
                      },
                      {
                        data: trendData.map((d) => d.expenses),
                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                        strokeWidth: 3,
                      },
                      {
                        data: trendData.map((d) => d.savings),
                        color: (opacity = 1) =>
                          `rgba(59, 130, 246, ${opacity})`,
                        strokeWidth: 3,
                      },
                      {
                        data: trendData.map((d) => d.investments),
                        color: (opacity = 1) =>
                          `rgba(139, 92, 246, ${opacity})`,
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
                  withDots={true}
                  withShadow={false}
                  withInnerLines={true}
                  withOuterLines={true}
                />
              </View>
            </Card.Content>
          </Card>
        )}

        {viewMode === "comparison" && trendData.length > 0 && (
          <Card style={styles.chartCard} elevation={2}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <View
                  style={[
                    styles.chartIconContainer,
                    { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                  ]}
                >
                  <Icon source="chart-bar" size={24} color="#3b82f6" />
                </View>
                <View style={styles.chartTitleContainer}>
                  <Text variant="titleMedium" style={styles.chartTitle}>
                    Monthly Comparison
                  </Text>
                  <Text variant="bodySmall" style={styles.chartSubtitle}>
                    Compare all categories
                  </Text>
                </View>
              </View>
              <View style={styles.chartWrapper}>
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
                      {
                        data: trendData.map((d) => Math.max(d.expenses, 0.01)),
                      },
                      { data: trendData.map((d) => Math.max(d.savings, 0.01)) },
                      {
                        data: trendData.map((d) =>
                          Math.max(d.investments, 0.01)
                        ),
                      },
                    ],
                  }}
                  width={screenWidth - 64}
                  height={260}
                  chartConfig={{
                    ...chartConfig,
                    barPercentage: 0.7,
                  }}
                  fromZero
                  withInnerLines
                  style={styles.barChart}
                />
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Empty State */}
        {!loading &&
          expenseData.length === 0 &&
          incomeData.length === 0 &&
          trendData.length === 0 && (
            <Card style={styles.emptyCard} elevation={0}>
              <Card.Content style={styles.emptyContainer}>
                <View
                  style={[
                    styles.emptyIconContainer,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <Icon
                    source="chart-line-variant"
                    size={64}
                    color={theme.colors.text}
                  />
                </View>
                <Text variant="titleLarge" style={styles.emptyTitle}>
                  No data available
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Add transactions to see your financial reports and insights
                </Text>
              </Card.Content>
            </Card>
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
  },
  scrollContent: {
    paddingBottom: 24,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.6,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: "700",
    marginBottom: 2,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  filtersCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    elevation: 2,
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
    marginBottom: 8,
  },
  dateRangeButtons: {
    marginBottom: 0,
  },
  customDateSection: {
    marginBottom: 16,
  },
  customDateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  customDateLabel: {
    opacity: 0.8,
  },
  dateInputsRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateInputWrapper: {
    flex: 1,
  },
  dateInput: {
    marginBottom: 0,
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
    // Background color set inline
  },
  segmentedButtons: {
    marginBottom: 0,
    maxWidth: "100%",
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
    // Style applied inline
  },
  chartCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  chartIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  chartTitleContainer: {
    flex: 1,
  },
  chartTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },
  chartSubtitle: {
    opacity: 0.7,
  },
  chartWrapper: {
    alignItems: "center",
  },
  barChart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  lineChart: {
    borderRadius: 16,
    marginVertical: 8,
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
  emptyCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 20,
  },
  exportCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(33, 115, 70, 0.2)",
  },
  exportContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  exportLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  exportTextContainer: {
    flex: 1,
  },
  exportTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  exportSubtitle: {
    opacity: 0.7,
    lineHeight: 18,
  },
  exportButton: {
    borderRadius: 8,
  },
});

export default ReportsDashboardScreen;
