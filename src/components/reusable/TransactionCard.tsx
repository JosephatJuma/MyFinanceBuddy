import { View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Card, Icon, Text } from "react-native-paper";
import { useFinance } from "../../contexts/FinanceContext";
import { Transaction } from "../../types";

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

const getTransactionConfig = (type: "income" | "expense") => {
  switch (type) {
    case "income":
      return {
        icon: "arrow-up-circle",
        color: "#4caf50",
        bgColor: "rgba(76, 175, 80, 0.1)",
        sign: "+",
      };
    case "expense":
      return {
        icon: "arrow-down-circle",
        color: "#f44336",
        bgColor: "rgba(244, 67, 54, 0.1)",
        sign: "-",
      };
    default:
      return {
        icon: "cash",
        color: "#9e9e9e",
        bgColor: "rgba(158, 158, 158, 0.1)",
        sign: "",
      };
  }
};

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const { formatCurrency } = useFinance();
  const config = getTransactionConfig(transaction.type);

  const formattedDate = new Date(transaction.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <View style={styles.leftSection}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: config.bgColor },
              ]}
            >
              <Icon source={config.icon} size={24} color={config.color} />
            </View>
            <View style={styles.infoContainer}>
              <Text variant="titleMedium" style={styles.category}>
                {transaction.category}
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {formattedDate}
              </Text>
              {transaction.description && (
                <Text
                  variant="bodySmall"
                  style={styles.description}
                  numberOfLines={1}
                >
                  {transaction.description}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.rightSection}>
            <Text
              variant="titleMedium"
              style={[styles.amount, { color: config.color }]}
            >
              {config.sign}
              {formatCurrency(parseFloat(transaction.amount.toString()))}
            </Text>
            <View
              style={[styles.typeBadge, { backgroundColor: config.bgColor }]}
            >
              <Text
                variant="labelSmall"
                style={[styles.typeText, { color: config.color }]}
              >
                {transaction.type.toUpperCase()}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  category: {
    fontWeight: "600",
    marginBottom: 2,
  },
  date: {
    opacity: 0.6,
    fontSize: 12,
  },
  description: {
    opacity: 0.5,
    fontSize: 11,
    marginTop: 2,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  amount: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontWeight: "600",
    fontSize: 10,
    letterSpacing: 0.5,
  },
});

export default TransactionCard;
