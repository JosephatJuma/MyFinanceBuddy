import React, { useState } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Button, Card, Divider, ProgressBar } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useAuthContext } from "../../contexts/AuthContext";
import { useForm } from "../../hooks/useForm";
import { useThemeContext } from "../../contexts/ThemeContext";
import TextInput from "../../components/forms/TextInput";
import { useDialog } from "../../hooks/useDialog";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuthContext();
  const { theme } = useThemeContext();
  const dialog = useDialog();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        form.reset();
        dialog.showSuccess(
          "Account created successfully! Welcome to MyFinanceBuddy.",
          "Welcome!"
        );
      } else {
        dialog.showError(
          result.error || "Registration failed. Please try again.",
          "Registration Failed"
        );
        form.setFieldError("email", result.error || "Registration failed");
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

  const getPasswordStrength = () => {
    const password = form.values.password;
    if (!password) return { strength: 0, label: "" };
    
    let strength = 0;
    if (password.length >= 6) strength += 0.25;
    if (password.length >= 8) strength += 0.25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 0.25;
    if (/[0-9]/.test(password)) strength += 0.25;
    
    const labels = ["Weak", "Fair", "Good", "Strong"];
    const index = Math.min(Math.floor(strength * 4), 3);
    return { strength, label: labels[index] || "" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            {/* Header */}
            <Text variant="headlineLarge" style={styles.title}>
              Create Account
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Join MyFinanceBuddy and start managing your finances smartly
            </Text>

            {/* Name Input */}
            <TextInput
              label="Full Name"
              mode="outlined"
              {...form.getFieldProps("name")}
              autoCapitalize="words"
              left={<TextInput.Icon icon="account-outline" />}
              style={styles.input}
            />

            {/* Email Input */}
            <TextInput
              label="Email Address"
              mode="outlined"
              {...form.getFieldProps("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="email-outline" />}
              style={styles.input}
            />

            {/* Password Input with Strength Indicator */}
            <TextInput
              label="Password"
              mode="outlined"
              {...form.getFieldProps("password")}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            {form.values.password && (
              <View style={styles.passwordStrengthContainer}>
                <ProgressBar
                  progress={passwordStrength.strength}
                  color={
                    passwordStrength.strength < 0.5
                      ? "#ef4444"
                      : passwordStrength.strength < 0.75
                      ? "#f59e0b"
                      : "#10b981"
                  }
                  style={styles.strengthBar}
                />
                <Text variant="bodySmall" style={styles.strengthLabel}>
                  Password Strength: {passwordStrength.label}
                </Text>
              </View>
            )}

            {/* Confirm Password Input */}
            <TextInput
              label="Confirm Password"
              mode="outlined"
              {...form.getFieldProps("confirmPassword")}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="lock-check-outline" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              style={styles.input}
            />

            {/* Helper Text */}
            <View style={styles.helperTextContainer}>
              <Text variant="bodySmall" style={styles.helperText}>
                • Password must be at least 6 characters
              </Text>
              <Text variant="bodySmall" style={styles.helperText}>
                • Use a mix of letters, numbers & symbols
              </Text>
            </View>

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading || !form.isValid()}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
              icon="account-plus"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text variant="bodySmall" style={styles.dividerText}>
                Already have an account?
              </Text>
              <Divider style={styles.divider} />
            </View>

            {/* Login Button */}
            <Button
              mode="text"
              onPress={() => navigation.navigate("Login")}
              style={styles.loginButton}
              icon="login"
            >
              Sign In Instead
            </Button>
          </Card.Content>
        </Card>

        {/* Footer */}
        <Text variant="bodySmall" style={styles.footer}>
          By creating an account, you agree to our{"\n"}
          Terms of Service & Privacy Policy
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
    padding: 20,
    paddingTop: 40,
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
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  passwordStrengthContainer: {
    marginTop: -12,
    marginBottom: 16,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  strengthLabel: {
    opacity: 0.7,
  },
  helperTextContainer: {
    marginBottom: 16,
    marginTop: -8,
  },
  helperText: {
    opacity: 0.7,
    marginVertical: 2,
  },
  registerButton: {
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
  loginButton: {
    borderRadius: 12,
  },
  footer: {
    textAlign: "center",
    marginTop: 24,
    opacity: 0.6,
    lineHeight: 18,
  },
});

export default RegisterScreen;
