import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  List,
  Divider,
  Switch,
  Card,
  Icon,
  Surface,
  Button,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useDialog } from "../../hooks/useDialog";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";

type Props = NativeStackScreenProps<SettingsStackParamList, "SettingsMain">;

const SettingsMainScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark, toggleTheme, colorPalette } = useThemeContext();
  const { logout, user } = useAuthContext();
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View
              style={[
                styles.avatarContainer,
                //{ backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <Icon source="account" size={40} color={theme.colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text variant="titleLarge" style={styles.userName}>
                {user?.email?.split("@")[0] || "User"}
              </Text>
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user?.email || ""}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Account Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon
                source="account-circle"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Account
              </Text>
            </View>

            <List.Item
              title="Profile Settings"
              description="Manage your personal information"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={() => (
                <View
                  style={[
                    styles.iconWrapper,
                    //{ backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Icon
                    source="account-edit"
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={() => <Icon source="chevron-right" size={24} />}
              onPress={() => navigation.navigate("Profile")}
              style={styles.listItem}
            />

            <Divider style={styles.itemDivider} />

            <List.Item
              title="Security"
              description="Password and authentication settings"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={() => (
                <View
                  style={[
                    styles.iconWrapper,
                    //{ backgroundColor: theme.colors.secondaryContainer },
                  ]}
                >
                  <Icon
                    source="shield-lock"
                    size={24}
                    color={theme.colors.secondary}
                  />
                </View>
              )}
              right={() => <Icon source="chevron-right" size={24} />}
              onPress={() => navigation.navigate("Security")}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Appearance Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon source="palette" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Appearance
              </Text>
            </View>

            <List.Item
              title="Dark Mode"
              description={
                isDark ? "Dark theme enabled" : "Light theme enabled"
              }
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={() => (
                <View
                  style={[
                    styles.iconWrapper,
                    //{ backgroundColor: theme.colors.tertiaryContainer },
                  ]}
                >
                  <Icon
                    source={isDark ? "weather-night" : "weather-sunny"}
                    size={24}
                    color={theme.colors.text}
                  />
                </View>
              )}
              right={() => (
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
            />

            <Divider style={styles.itemDivider} />

            <List.Item
              title="Customization"
              description="Theme colors and navigation style"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={() => (
                <View
                  style={[
                    styles.iconWrapper,
                    //{ backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Icon
                    source="palette-outline"
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={() => <Icon source="chevron-right" size={24} />}
              onPress={() => navigation.navigate("Preferences")}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* About Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon
                source="information"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                About
              </Text>
            </View>

            <List.Item
              title="About App"
              description="Version, terms, and privacy policy"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={() => (
                <View
                  style={[
                    styles.iconWrapper,
                    //{ backgroundColor: theme.colors.secondaryContainer },
                  ]}
                >
                  <Icon
                    source="information-outline"
                    size={24}
                    color={theme.colors.secondary}
                  />
                </View>
              )}
              right={() => <Icon source="chevron-right" size={24} />}
              onPress={() => navigation.navigate("About")}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="contained"
          onPress={handleLogout}
          icon="logout"
          buttonColor={theme.colors.error}
          textColor={"#fff"}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
        >
          Logout
        </Button>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            MyFinanceBuddy v1.0.0
          </Text>
        </View>
      </ScrollView>

      <ConfirmDialog config={dialog.config} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    elevation: 3,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontWeight: "600",
    textTransform: "capitalize",
  },
  userEmail: {
    opacity: 0.7,
    marginTop: 2,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  listItem: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  itemTitle: {
    fontWeight: "500",
    fontSize: 16,
  },
  itemDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  itemDivider: {
    marginVertical: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 16,
  },
  footerText: {
    opacity: 0.5,
  },
});

export default SettingsMainScreen;
