import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, FAB, Appbar } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import HomeHeader from "../../components/reusable/HomeHeader";

type Props = NativeStackScreenProps<HomeStackParamList, "Dashboard">;

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <Text variant="headlineMedium" style={styles.greeting}>
          Welcome, {user?.name || "User"}!
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Balance Overview</Text>
            <Text variant="headlineLarge" style={styles.balance}>
              $0.00
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Recent Transactions</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              No transactions yet
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Budget Summary</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              No budgets set
            </Text>
          </Card.Content>
        </Card>
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
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  balance: {
    marginTop: 8,
    color: "#4caf50",
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
