import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";

type Props = NativeStackScreenProps<SettingsStackParamList, "About">;

const AboutScreen: React.FC<Props> = () => {
  const { theme } = useThemeContext();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">MyFinanceBuddy</Text>
          <Text variant="bodyMedium" style={styles.text}>
            Version 1.0.0
          </Text>
          <Text variant="bodyMedium" style={styles.text}>
            Your personal finance management app
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

export default AboutScreen;
