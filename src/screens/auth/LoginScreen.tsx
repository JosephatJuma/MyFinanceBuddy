import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, Button, Card, Divider } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useAuthContext } from "../../contexts/AuthContext";
import { useForm } from "../../hooks/useForm";
import { useThemeContext } from "../../contexts/ThemeContext";
import { TextInput } from "../../components/forms";
import { useDialog } from "../../hooks/useDialog";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";
import Svg, { Path, Circle, Rect } from "react-native-svg";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

// Logo illustration component
const LogoIllustration = ({ color }: { color: string }) => (
  <Svg width={120} height={120} viewBox="0 0 120 120">
    <Circle cx="60" cy="60" r="55" fill={color} opacity="0.1" />
    <Rect x="35" y="40" width="50" height="40" rx="6" fill={color} />
    <Circle cx="70" cy="60" r="8" fill="#fff" opacity="0.9" />
    <Circle cx="70" cy="60" r="4" fill={color} />
    <Rect
      x="45"
      y="50"
      width="15"
      height="3"
      rx="1.5"
      fill="#fff"
      opacity="0.7"
    />
    <Rect
      x="45"
      //cy="60"
      width="10"
      height="3"
      rx="1.5"
      fill="#fff"
      opacity="0.7"
    />
  </Svg>
);

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuthContext();
  const { theme } = useThemeContext();
  const dialog = useDialog();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        form.reset();
      } else {
        dialog.showError(
          result.error ||
            "Login failed. Please check your credentials and try again.",
          "Login Failed"
        );
        form.setFieldError("password", result.error || "Invalid credentials");
      }
    } catch (error) {
      dialog.showError(
        "An unexpected error occurred. Please try again.",
        "Error"
      );
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <LogoIllustration color={theme.colors.primary} />
          <Text variant="headlineLarge" style={styles.appName}>
            MyFinanceBuddy
          </Text>
          <Text variant="bodyMedium" style={styles.tagline}>
            Your Personal Finance Manager
          </Text>
        </View>

        {/* Login Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Welcome Back
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.text }]}
            >
              Sign in to continue managing your finances
            </Text>

            <TextInput
              label="Email"
              mode="outlined"
              {...form.getFieldProps("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              rightIcon="email-outline"
              style={styles.input}
            />

            <TextInput
              label="Password"
              mode="outlined"
              {...form.getFieldProps("password")}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              isPass={true}
              rightIcon="lock-outline"
              style={styles.input}
            />

            <Button
              mode="text"
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotButton}
              compact
            >
              Forgot Password?
            </Button>

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading || !form.isValid()}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              icon="login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text variant="bodySmall" style={styles.dividerText}>
                OR
              </Text>
              <Divider style={styles.divider} />
            </View>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate("Register")}
              style={styles.registerButton}
              icon="account-plus-outline"
            >
              Create New Account
            </Button>
          </Card.Content>
        </Card>

        {/* Footer */}
        <Text variant="bodySmall" style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </ScrollView>

      <ConfirmDialog config={dialog.config} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  appName: {
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 4,
  },
  tagline: {
    opacity: 0.7,
    textAlign: "center",
  },
  card: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
  },
  input: {
    marginBottom: 16,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.6,
  },
  registerButton: {
    borderRadius: 12,
  },
  footer: {
    textAlign: "center",
    marginTop: 24,
    opacity: 0.6,
  },
});

export default LoginScreen;
