import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, List, Divider } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TransactionsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";

type Props = NativeStackScreenProps<
  TransactionsStackParamList,
  "TransactionsList"
>;

const TransactionsListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No transactions yet. Add your first transaction!
        </Text>
        {/* Transaction list will be populated here */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    opacity: 0.6,
    padding: 16,
  },
});

export default TransactionsListScreen;
