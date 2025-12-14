import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useAuthContext } from "../../contexts/AuthContext";
import { useForm } from "../../hooks/useForm";
import { useThemeContext } from "../../contexts/ThemeContext";
import TextInput from "../../components/forms/TextInput";
import ErrorDialog from "../../components/reusable/ErrorDialog";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuthContext();
  const { theme } = useThemeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    name: {
      initialValue: "",
      validation: {
        required: true,
        minLength: 2,
      },
    },
    email: {
      initialValue: "",
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
    },
    password: {
      initialValue: "",
      validation: {
        required: true,
        minLength: 6,
      },
    },
    confirmPassword: {
      initialValue: "",
      validation: {
        required: true,
        custom: (value) => {
          if (value !== form.values.password) {
            return "Passwords do not match";
          }
          return null;
        },
      },
    },
  });

  const handleRegister = form.handleSubmit(async (values) => {
    try {
      setIsLoading(true);
      const result = await register(values.name, values.email, values.password);

      if (result.success) {
        // Reset form only on success
        form.reset();
        // Navigation will happen automatically via AuthContext
      } else {
        setErrorMessage(
          result.error || "Registration failed. Please try again."
        );
        setErrorDialogVisible(true);
        form.setFieldError("email", result.error || "Registration failed");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setErrorDialogVisible(true);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sign up to get started
          </Text>

          <TextInput
            label="Full Name"
            mode="outlined"
            {...form.getFieldProps("name")}
            autoCapitalize="words"
            style={styles.input}
          />

          <TextInput
            label="Email"
            mode="outlined"
            {...form.getFieldProps("email")}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <TextInput
            label="Password"
            mode="outlined"
            {...form.getFieldProps("password")}
            isPass
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <TextInput
            label="Confirm Password"
            mode="outlined"
            {...form.getFieldProps("confirmPassword")}
            isPass
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? "Creating Account..." : "Register"}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            style={styles.textButton}
          >
            Already have an account? Login
          </Button>
        </Card.Content>
      </Card>

      <ErrorDialog
        visible={errorDialogVisible}
        title="Registration Failed"
        message={errorMessage}
        onDismiss={() => setErrorDialogVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginTop: 40,
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

export default RegisterScreen;
