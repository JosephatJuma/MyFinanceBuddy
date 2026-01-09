import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  Keyboard,
} from "react-native";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import providers
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider, useThemeContext } from "./contexts/ThemeContext";

// Import navigation
import { RootNavigator } from "./navigation";
import { FinanceProvider } from "./contexts/FinanceContext";

function AppContent() {
  const { paperTheme, isDark } = useThemeContext();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <PaperProvider theme={paperTheme}>
        <RootNavigator />
      </PaperProvider>
    </>
  );
}

export default function App() {
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

  Keyboard.addListener("keyboardDidHide", () => {
    setKeyboardVisible(false);
  });

  Keyboard.addListener("keyboardDidShow", () => {
    setKeyboardVisible(true);
  });
  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : isKeyboardVisible
          ? "height"
          : undefined
      }
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      style={styles.container}
    >
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <FinanceProvider>
                <AppContent />
              </FinanceProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
