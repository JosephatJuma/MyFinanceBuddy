import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Card,
  Icon,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useForm } from "../../hooks/useForm";
import { useDialog } from "../../hooks/useDialog";
import TextInput from "../../components/forms/TextInput";
import ConfirmDialog from "../../components/reusable/ConfirmDialog";
import { supabase } from "../../lib/supabase";
import Header from "../../components/reusable/Header";

type Props = NativeStackScreenProps<SettingsStackParamList, "Profile">;

const ProfileScreen: React.FC<Props> = () => {
  const { theme } = useThemeContext();
  const [user, setUser] = useState(null);
  const dialog = useDialog();
  const [loading, setLoading] = useState(false);

  const getUserData = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }

    setUser(user);
  };

  React.useEffect(() => {
    getUserData();
  }, []);

  const form = useForm({
    fullName: {
      initialValue: user?.user_metadata?.full_name || "",
      validation: {
        required: true,
        minLength: 2,
      },
    },
    phone: {
      initialValue: user?.user_metadata?.phone || "",
      validation: {
        required: false,
      },
    },
  });

  const handleUpdateProfile = form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: values.fullName,
          phone: values.phone,
        },
      });

      if (error) throw error;

      dialog.showSuccess("Profile updated successfully", "Success");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      dialog.showError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  });

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView
        style={[
          styles.scrollView,
          { backgroundColor: theme.colors.background },
        ]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.avatarContainer,
              //{ backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Icon source="account" size={60} color={theme.colors.primary} />
          </View>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Profile Information
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Manage your personal details
          </Text>
        </View>

        {/* Account Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon source="email" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Account Email
              </Text>
            </View>
            <View style={styles.emailContainer}>
              <Text variant="bodyLarge" style={styles.emailText}>
                {user?.email}
              </Text>
              <View
                style={[
                  styles.verifiedBadge,
                  //{ backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <Icon
                  source="check-circle"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodySmall"
                  style={[styles.verifiedText, { color: theme.colors.primary }]}
                >
                  Verified
                </Text>
              </View>
            </View>
            <Text variant="bodySmall" style={styles.helperText}>
              Email cannot be changed from here
            </Text>
          </Card.Content>
        </Card>

        {/* Personal Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon
                source="account-edit"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Personal Details
              </Text>
            </View>

            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              mode="outlined"
              {...form.getFieldProps("fullName")}
              style={styles.input}
            />

            <TextInput
              label="Phone Number"
              placeholder="Enter your phone number"
              mode="outlined"
              keyboardType="phone-pad"
              {...form.getFieldProps("phone")}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              loading={form.isSubmitting || loading}
              disabled={form.isSubmitting || loading}
              icon="content-save"
              style={styles.saveButton}
              contentStyle={styles.saveButtonContent}
            >
              Save Changes
            </Button>
          </Card.Content>
        </Card>

        {/* Account Stats Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon
                source="information-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Account Information
              </Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Icon
                  source="calendar-clock"
                  size={20}
                  color={theme.colors.text}
                />
                <Text variant="bodySmall" style={styles.statLabel}>
                  Member Since
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.statValue}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Icon
                  source="clock-outline"
                  size={20}
                  color={theme.colors.text}
                />
                <Text variant="bodySmall" style={styles.statLabel}>
                  Last Sign In
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.statValue}>
                {user?.last_sign_in_at
                  ? new Date(user?.last_sign_in_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "N/A"}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Info Note */}
        <View
          style={[
            styles.infoCard,
            //{ backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Icon source="shield-check" size={20} color={theme.colors.primary} />
          <Text variant="bodySmall" style={styles.infoText}>
            Your personal information is securely stored and encrypted
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
    textAlign: "center",
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
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  emailContainer: {
    marginBottom: 8,
  },
  emailText: {
    fontWeight: "500",
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontWeight: "600",
  },
  helperText: {
    opacity: 0.6,
    marginTop: 4,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    opacity: 0.7,
  },
  statValue: {
    fontWeight: "500",
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    flex: 1,
    opacity: 0.8,
    lineHeight: 18,
  },
});

export default ProfileScreen;
