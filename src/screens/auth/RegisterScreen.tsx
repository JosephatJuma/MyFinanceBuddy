import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useAuthContext } from "../../contexts/AuthContext";
import { useForm } from "../../hooks/useForm";
import { useThemeContext } from "../../contexts/ThemeContext";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuthContext();
  const { theme } = useThemeContext();

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
    const result = await register(values.name, values.email, values.password);
    if (!result.success) {
      form.setFieldError("email", result.error || "Registration failed");
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
            style={styles.input}
          />

          <TextInput
            label="Email"
            mode="outlined"
            {...form.getFieldProps("email")}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            label="Password"
            mode="outlined"
            {...form.getFieldProps("password")}
            secureTextEntry
            style={styles.input}
          />

          <TextInput
            label="Confirm Password"
            mode="outlined"
            {...form.getFieldProps("confirmPassword")}
            secureTextEntry
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={form.isSubmitting}
            disabled={form.isSubmitting}
            style={styles.button}
          >
            Register
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
