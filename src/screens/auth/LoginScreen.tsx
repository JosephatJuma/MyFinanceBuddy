import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useAuthContext } from "../../contexts/AuthContext";
import { useForm } from "../../hooks/useForm";
import { useThemeContext } from "../../contexts/ThemeContext";
import TextInput from "../../components/forms/TextInput";
import ErrorDialog from "../../components/reusable/ErrorDialog";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuthContext();
  const { theme } = useThemeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
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
  });

  const handleLogin = form.handleSubmit(async (values) => {
    try {
      setIsLoading(true);
      const result = await login(values.email, values.password);

      if (result.success) {
        // Reset form only on success
        form.reset();
        // Navigation will happen automatically via AuthContext
      } else {
        setErrorMessage(result.error || "Login failed. Please try again.");
        setErrorDialogVisible(true);
        form.setFieldError("password", result.error || "Login failed");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setErrorDialogVisible(true);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome Back
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sign in to continue
          </Text>

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

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.textButton}
          >
            Forgot Password?
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate("Register")}
            style={styles.button}
          >
            Create Account
          </Button>
        </Card.Content>
      </Card>

      <ErrorDialog
        visible={errorDialogVisible}
        title="Login Failed"
        message={errorMessage}
        onDismiss={() => setErrorDialogVisible(false)}
      />
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

export default LoginScreen;
