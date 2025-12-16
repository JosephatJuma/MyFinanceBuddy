import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, Button, Card, IconButton } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { useForm } from "../../hooks/useForm";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import TextInput from "../../components/forms/TextInput";
import { useDialog } from "../../hooks/useDialog";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";
import Svg, { Path, Circle } from "react-native-svg";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

// Email illustration component
const EmailIllustration = ({ color }: { color: string }) => (
  <Svg width={100} height={100} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="45" fill={color} opacity="0.1" />
    <Path
      d="M 25 35 L 50 50 L 75 35 L 75 65 L 25 65 Z"
      fill={color}
      opacity="0.3"
    />
    <Path d="M 25 35 L 75 35 L 50 50 Z" fill={color} />
    <Circle cx="70" cy="40" r="8" fill="#10b981" />
    <Path
      d="M 67 40 L 69 42 L 73 38"
      stroke="#fff"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useThemeContext();
  const { resetPassword } = useAuthContext();
  const dialog = useDialog();
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    const result = await resetPassword(values.email);
    setIsLoading(false);

    if (result.success) {
      dialog.showSuccess(
        "Password reset email sent! Please check your inbox and follow the instructions to reset your password.",
        "Email Sent",
        () => navigation.goBack()
      );
    } else {
      dialog.showError(
        result.error ||
          "Failed to send reset email. Please check your email and try again.",
        "Error"
      );
      form.setFieldError("email", result.error || "Failed to send reset email");
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
        {/* Back Button */}
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <EmailIllustration color={theme.colors.primary} />
        </View>

        {/* Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Forgot Password?
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.text }]}
            >
              No worries! Enter your email address and we'll send you
              instructions to reset your password.
            </Text>

            <TextInput
              label="Email Address"
              mode="outlined"
              {...form.getFieldProps("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              rightIcon="email-outline"
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading || !form.isValid()}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
              icon="send"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.backToLoginButton}
              icon="arrow-left"
            >
              Back to Sign In
            </Button>
          </Card.Content>
        </Card>

        {/* Helper Text */}
        <View style={styles.helperContainer}>
          <Text variant="bodySmall" style={styles.helperText}>
            • Check your spam folder if you don't see the email
          </Text>
          <Text variant="bodySmall" style={styles.helperText}>
            • The reset link will expire in 24 hours
          </Text>
          <Text variant="bodySmall" style={styles.helperText}>
            • Contact support if you need further assistance
          </Text>
        </View>
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
    paddingTop: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  illustrationContainer: {
    alignItems: "center",
    marginVertical: 20,
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
    marginBottom: 12,
    marginTop: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
    lineHeight: 22,
  },
  input: {
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backToLoginButton: {
    marginTop: 12,
    borderRadius: 12,
  },
  helperContainer: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
  helperText: {
    opacity: 0.6,
    marginVertical: 4,
    lineHeight: 18,
  },
});

export default ForgotPasswordScreen;
