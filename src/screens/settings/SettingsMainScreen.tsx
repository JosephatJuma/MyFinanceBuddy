import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, List, Divider, Switch } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useDialog } from "../../hooks/useDialog";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";

type Props = NativeStackScreenProps<SettingsStackParamList, "SettingsMain">;

const SettingsMainScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useThemeContext();
  const { logout } = useAuthContext();
  const dialog = useDialog();

  const handleLogout = () => {
    dialog.showConfirm(
      "Logout",
      "Are you sure you want to logout? You'll need to sign in again to access your account.",
      async () => {
        const result = await logout();
        if (!result.success) {
          dialog.showError(
            result.error || "Failed to logout. Please try again."
          );
        }
      },
      undefined,
      "Logout",
      "Cancel"
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Profile"
            left={(props) => <List.Icon {...props} icon="account" />}
            onPress={() => navigation.navigate("Profile")}
          />
          <List.Item
            title="Security"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            onPress={() => navigation.navigate("Security")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Dark Mode"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => <Switch value={isDark} onValueChange={toggleTheme} />}
          />
          <List.Item
            title="Preferences"
            left={(props) => <List.Icon {...props} icon="cog" />}
            onPress={() => navigation.navigate("Preferences")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="About App"
            left={(props) => <List.Icon {...props} icon="information" />}
            onPress={() => navigation.navigate("About")}
          />
        </List.Section>

        <Divider />

        <List.Item
          title="Logout"
          titleStyle={{ color: theme.colors.error }}
          left={(props) => (
            <List.Icon {...props} icon="logout" color={theme.colors.error} />
          )}
          onPress={handleLogout}
        />
      </ScrollView>

      <ConfirmDialog config={dialog.config} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SettingsMainScreen;
