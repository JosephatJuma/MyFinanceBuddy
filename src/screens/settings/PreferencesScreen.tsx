import React from "react";
import { View, StyleSheet } from "react-native";
import { Switch, Text, List } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";

type Props = NativeStackScreenProps<SettingsStackParamList, "Preferences">;

const PreferencesScreen: React.FC<Props> = () => {
  const { theme, mainNavigator, toggleMainNavigator } = useThemeContext();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <List.Section>
        <List.Subheader>Navigation Preferences</List.Subheader>
        <List.Item
          title="Use Drawer Navigation"
          description={`Currently using: ${
            mainNavigator === "drawer" ? "Drawer" : "Bottom Tabs"
          }`}
          left={(props) => <List.Icon {...props} icon="menu" />}
          right={() => (
            <Switch
              value={mainNavigator === "drawer"}
              onValueChange={toggleMainNavigator}
            />
          )}
        />
        <List.Item
          title="Use Bottom Tabs"
          description={`Switch to ${
            mainNavigator === "drawer" ? "bottom tabs" : "drawer"
          } navigation`}
          left={(props) => <List.Icon {...props} icon="view-dashboard" />}
          right={() => (
            <Switch
              value={mainNavigator === "tab"}
              onValueChange={toggleMainNavigator}
            />
          )}
        />
      </List.Section>
      <View style={styles.note}>
        <Text variant="bodySmall" style={styles.noteText}>
          Note: App will reload after changing navigation style to apply the
          changes.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  note: {
    padding: 16,
    marginTop: 16,
  },
  noteText: {
    opacity: 0.6,
    textAlign: "center",
  },
});

export default PreferencesScreen;
