// Example: Creating a component with all custom hooks
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { useAuthContext } from "./src/contexts";
import { useThemeContext } from "./src/contexts";
import { useStorage } from "./src/hooks";
import { useForm } from "./src/hooks";

const ExampleComponent = () => {
  // ============================================
  // 1. Using Auth Hook
  // ============================================
  const { user, isAuthenticated, logout } = useAuthContext();

  // ============================================
  // 2. Using Theme Hook
  // ============================================
  const { theme, isDark, toggleTheme } = useThemeContext();

  // ============================================
  // 3. Using Storage Hook
  // ============================================
  const { value: savedData, setValue: setSavedData } = useStorage(
    "myData",
    null
  );

  // ============================================
  // 4. Using Form Hook
  // ============================================
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
    age: {
      initialValue: "",
      validation: {
        required: true,
        min: 18,
        max: 120,
      },
    },
    password: {
      initialValue: "",
      validation: {
        required: true,
        minLength: 6,
        maxLength: 50,
      },
    },
    confirmPassword: {
      initialValue: "",
      validation: {
        required: true,
        custom: (value) => {
          if (value !== form.values.password) {
            return "Passwords must match";
          }
          return null;
        },
      },
    },
  });

  // ============================================
  // 5. Form Submission Handler
  // ============================================
  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      // Save to storage
      await setSavedData(values);

      // You can also call APIs here
      console.log("Form submitted:", values);

      // Reset form after successful submission
      form.reset();
    } catch (error) {
      console.error("Submission error:", error);
      form.setFieldError("email", "Something went wrong");
    }
  });

  // ============================================
  // 6. Manual Field Manipulation
  // ============================================
  const handleClearForm = () => {
    form.reset();
  };

  const handleSetEmail = () => {
    form.setValue("email", "preset@example.com");
  };

  // ============================================
  // 7. Conditional Rendering Based on Auth
  // ============================================
  if (!isAuthenticated) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text>Please log in</Text>
      </View>
    );
  }

  // ============================================
  // 8. Main Component Render
  // ============================================
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Card style={styles.card}>
        <Card.Content>
          {/* User Info */}
          <Text variant="headlineMedium" style={{ color: theme.colors.text }}>
            Welcome, {user?.name}!
          </Text>

          {/* Theme Toggle */}
          <Button mode="outlined" onPress={toggleTheme} style={styles.button}>
            {isDark ? "Light Mode" : "Dark Mode"}
          </Button>

          {/* Saved Data Display */}
          {savedData && (
            <Text variant="bodyMedium">Saved: {JSON.stringify(savedData)}</Text>
          )}

          {/* Form Inputs */}
          <TextInput
            label="Name"
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
            label="Age"
            mode="outlined"
            {...form.getFieldProps("age")}
            keyboardType="numeric"
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

          {/* Form Actions */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={form.isSubmitting}
            disabled={form.isSubmitting || !form.isValid()}
            style={styles.button}
          >
            Submit
          </Button>

          <Button
            mode="outlined"
            onPress={handleClearForm}
            style={styles.button}
          >
            Clear Form
          </Button>

          <Button mode="text" onPress={handleSetEmail} style={styles.button}>
            Preset Email
          </Button>

          {/* Logout */}
          <Button
            mode="text"
            onPress={logout}
            style={styles.button}
            textColor={theme.colors.error}
          >
            Logout
          </Button>

          {/* Debug Info */}
          <Text variant="bodySmall" style={styles.debug}>
            Form Valid: {form.isValid() ? "Yes" : "No"}
          </Text>
          <Text variant="bodySmall" style={styles.debug}>
            Submitting: {form.isSubmitting ? "Yes" : "No"}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginTop: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  debug: {
    marginTop: 8,
    opacity: 0.6,
  },
});

export default ExampleComponent;
