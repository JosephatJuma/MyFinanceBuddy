import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  Icon,
  Card,
  Chip,
  IconButton,
  Divider,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TransactionsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { Transaction } from "../../types";
import { supabase } from "../../lib/supabase";
import { useFinance } from "../../contexts/FinanceContext";
import { useDialog } from "../../hooks/useDialog";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";

type Props = NativeStackScreenProps<
  TransactionsStackParamList,
  "TransactionDetail"
>;

const { width } = Dimensions.get("window");

const TransactionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const { formatCurrency } = useFinance();
  const dialog = useDialog();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaction();
  }, [id]);

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

  const handleDelete = () => {
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

          dialog.showSuccess(
            "Transaction deleted successfully",
            "Success",
            () => navigation.goBack()
          );
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

  const getTransactionConfig = (type: string) => {
    switch (type) {
      case "income":
        return {
          icon: "arrow-up-circle",
          color: "#4caf50",
          bgColor: "rgba(76, 175, 80, 0.1)",
          sign: "+",
          label: "Income",
        };
      case "expense":
        return {
          icon: "arrow-down-circle",
          color: "#f44336",
          bgColor: "rgba(244, 67, 54, 0.1)",
          sign: "-",
          label: "Expense",
        };
      default:
        return {
          icon: "cash",
          color: "#9e9e9e",
          bgColor: "rgba(158, 158, 158, 0.1)",
          sign: "",
          label: "Transaction",
        };
    }
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
          Loading transaction...
        </Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Icon source="alert-circle" size={64} color={theme.colors.error} />
        <Text variant="titleLarge" style={styles.errorText}>
          Transaction not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  const config = getTransactionConfig(transaction.type);
  const formattedDate = new Date(transaction.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Transaction Details
        </Text>
        <IconButton
          icon="pencil"
          size={24}
          onPress={() =>
            navigation.navigate("EditTransaction", {
              id: id,
            })
          }
        />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Amount Card */}
        <Card style={[styles.amountCard, { backgroundColor: config.bgColor }]}>
          <Card.Content style={styles.amountCardContent}>
            <View style={styles.amountIconContainer}>
              <Icon source={config.icon} size={48} color={config.color} />
            </View>
            <Text
              variant="headlineLarge"
              style={[styles.amount, { color: config.color }]}
            >
              {config.sign}
              {formatCurrency(parseFloat(transaction.amount.toString()))}
            </Text>
            <Chip
              style={[
                styles.typeChip,
                { backgroundColor: theme.colors.surface },
              ]}
              textStyle={{ color: config.color, fontWeight: "600" }}
              icon={config.icon}
            >
              {config.label}
            </Chip>
          </Card.Content>
        </Card>

        {/* Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Transaction Information
            </Text>

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Icon source="tag" size={20} color={theme.colors.text} />
                <Text variant="bodyMedium" style={styles.labelText}>
                  Category
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {transaction.category}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Icon source="calendar" size={20} color={theme.colors.text} />
                <Text variant="bodyMedium" style={styles.labelText}>
                  Date
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.detailValue}>
                {formattedDate}
              </Text>
            </View>

            {transaction.description && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Icon source="text" size={20} color={theme.colors.text} />
                    <Text variant="bodyMedium" style={styles.labelText}>
                      Description
                    </Text>
                  </View>
                  <Text
                    variant="bodyLarge"
                    style={[styles.detailValue, styles.descriptionValue]}
                  >
                    {transaction.description}
                  </Text>
                </View>
              </>
            )}

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Icon
                  source="clock-outline"
                  size={20}
                  color={theme.colors.text}
                />
                <Text variant="bodyMedium" style={styles.labelText}>
                  Created
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.detailValue}>
                {new Date(transaction?.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Receipt Card */}
        {/* {transaction.receipt_url && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Receipt
              </Text>
              <TouchableOpacity activeOpacity={0.8}>
                <Image
                  source={{ uri: transaction.receipt_url }}
                  style={styles.receiptImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Icon source="receipt" size={32} color="#fff" />
                  <Text variant="bodySmall" style={styles.overlayText}>
                    Receipt attached
                  </Text>
                </View>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )} */}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate("EditTransaction", transaction)}
            style={styles.editButton}
            icon="pencil"
          >
            Edit Transaction
          </Button>
          <Button
            mode="contained"
            onPress={handleDelete}
            style={styles.deleteButton}
            buttonColor={theme.colors.error}
            icon="delete"
          >
            Delete
          </Button>
        </View>
      </ScrollView>

      <ConfirmDialog config={dialog.config} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  amountCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 20,
    elevation: 0,
  },
  amountCardContent: {
    alignItems: "center",
    paddingVertical: 24,
  },
  amountIconContainer: {
    marginBottom: 12,
  },
  amount: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  typeChip: {
    marginTop: 8,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  labelText: {
    marginLeft: 8,
    opacity: 0.7,
  },
  detailValue: {
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  descriptionValue: {
    flex: 1,
  },
  divider: {
    marginVertical: 4,
  },
  receiptImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  imageOverlay: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "#fff",
    marginTop: 8,
    fontWeight: "600",
  },
  actionButtons: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  editButton: {
    borderWidth: 2,
  },
  deleteButton: {
    // Button color set via buttonColor prop
  },
});

export default TransactionDetailScreen;
