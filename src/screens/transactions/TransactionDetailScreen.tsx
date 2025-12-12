import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TransactionsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";

type Props = NativeStackScreenProps<
  TransactionsStackParamList,
  "TransactionDetail"
>;

const TransactionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useThemeContext();
  const { id } = route.params;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Transaction Details</Text>
            <Text variant="bodyMedium" style={styles.text}>
              Transaction ID: {id}
            </Text>
            {/* Transaction details will be displayed here */}
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate("EditTransaction", { id })}
          style={styles.button}
        >
          Edit Transaction
        </Button>
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
  card: {
    marginBottom: 16,
  },
  text: {
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
});

export default TransactionDetailScreen;
