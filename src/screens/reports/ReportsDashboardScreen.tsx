import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ReportsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";

type Props = NativeStackScreenProps<ReportsStackParamList, "ReportsDashboard">;

const ReportsDashboardScreen: React.FC<Props> = () => {
  const { theme } = useThemeContext();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineMedium">Reports Dashboard</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default ReportsDashboardScreen;
