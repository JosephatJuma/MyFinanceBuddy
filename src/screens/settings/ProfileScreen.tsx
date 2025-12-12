import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuthContext } from "../../contexts/AuthContext";

type Props = NativeStackScreenProps<SettingsStackParamList, "Profile">;

const ProfileScreen: React.FC<Props> = () => {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Profile Information</Text>
          <Text variant="bodyMedium" style={styles.text}>
            Name: {user?.name}
          </Text>
          <Text variant="bodyMedium" style={styles.text}>
            Email: {user?.email}
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
    marginTop: 16,
  },
  text: {
    marginTop: 8,
  },
});

export default ProfileScreen;
