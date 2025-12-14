import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Switch, Text, List, RadioButton, Divider } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "../../navigation/types";
import { useThemeContext } from "../../contexts/ThemeContext";
import { ColorPalette } from "../../hooks/useTheme";

type Props = NativeStackScreenProps<SettingsStackParamList, "Preferences">;

const PreferencesScreen: React.FC<Props> = () => {
  const {
    theme,
    mainNavigator,
    toggleMainNavigator,
    colorPalette,
    changeColorPalette,
    getAllPalettes,
  } = useThemeContext();

  const palettes = getAllPalettes();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Color Palette Section */}
      <List.Section>
        <List.Subheader>Color Theme</List.Subheader>
        <View style={styles.paletteDescription}>
          <Text variant="bodySmall" style={styles.descriptionText}>
            Choose your preferred color scheme. Works with both light and dark
            modes.
          </Text>
        </View>
        {palettes.map((palette) => (
          <List.Item
            key={palette.key}
            title={palette.name}
            description={palette.description}
            left={(props) => (
              <View style={styles.colorPreview}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: palette.lightPreview },
                  ]}
                />
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: palette.darkPreview },
                  ]}
                />
              </View>
            )}
            right={() => (
              <RadioButton
                value={palette.key}
                status={colorPalette === palette.key ? "checked" : "unchecked"}
                onPress={() => changeColorPalette(palette.key as ColorPalette)}
              />
            )}
            onPress={() => changeColorPalette(palette.key as ColorPalette)}
          />
        ))}
      </List.Section>

      <Divider style={styles.divider} />

      {/* Navigation Section */}
      <List.Section>
        <List.Subheader>Navigation Style</List.Subheader>
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
          Note: Changes to navigation style will take effect immediately.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paletteDescription: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  descriptionText: {
    opacity: 0.7,
    lineHeight: 20,
  },
  colorPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  divider: {
    marginVertical: 16,
  },
  note: {
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  noteText: {
    opacity: 0.6,
    textAlign: "center",
  },
});

export default PreferencesScreen;
