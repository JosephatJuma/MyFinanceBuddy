import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BudgetStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";

type Props = NativeStackScreenProps<BudgetStackParamList, "EditBudget">;

const EditBudgetScreen: React.FC<Props> = ({ route }) => {
  const { theme } = useThemeContext();
  const { id } = route.params;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text>Edit Budget: {id}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default EditBudgetScreen;
