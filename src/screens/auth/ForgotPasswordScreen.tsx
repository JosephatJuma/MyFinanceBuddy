import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useForm } from "../../hooks/useForm";
import { useThemeContext } from "../../contexts/ThemeContext";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();

  const form = useForm({
    email: {
      initialValue: "",
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
    },
  });

  const handleResetPassword = form.handleSubmit(async (values) => {
    // TODO: Implement password reset logic
    console.log("Reset password for:", values.email);
    // Show success message and navigate back
    navigation.goBack();
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Forgot Password
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Enter your email to receive reset instructions
          </Text>

          <TextInput
            label="Email"
            mode="outlined"
            {...form.getFieldProps("email")}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={form.isSubmitting}
            disabled={form.isSubmitting}
            style={styles.button}
          >
            Send Reset Link
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.textButton}
          >
            Back to Login
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  textButton: {
    marginTop: 4,
  },
});

export default ForgotPasswordScreen;
