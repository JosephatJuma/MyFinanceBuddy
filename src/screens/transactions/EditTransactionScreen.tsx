import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TransactionsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useForm } from "../../hooks/useForm";

type Props = NativeStackScreenProps<
  TransactionsStackParamList,
  "EditTransaction"
>;

const EditTransactionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useThemeContext();
  const { id } = route.params;

  const form = useForm({
    amount: {
      initialValue: "",
      validation: {
        required: true,
      },
    },
    description: {
      initialValue: "",
      validation: {
        required: true,
      },
    },
    category: {
      initialValue: "",
      validation: {
        required: true,
      },
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    // TODO: Update transaction
    console.log("Update transaction:", id, values);
    navigation.goBack();
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Edit Transaction
            </Text>

            <TextInput
              label="Amount"
              mode="outlined"
              {...form.getFieldProps("amount")}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Description"
              mode="outlined"
              {...form.getFieldProps("description")}
              style={styles.input}
            />

            <TextInput
              label="Category"
              mode="outlined"
              {...form.getFieldProps("category")}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={form.isSubmitting}
              disabled={form.isSubmitting}
              style={styles.button}
            >
              Update Transaction
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Cancel
            </Button>
          </Card.Content>
        </Card>
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
    marginTop: 16,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default EditTransactionScreen;
