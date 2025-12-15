import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Switch,
  Text,
  List,
  RadioButton,
  Divider,
  Card,
  Icon,
  Surface,
} from "react-native-paper";
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
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Icon source="palette" size={40} color={theme.colors.primary} />
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Personalize Your Experience
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Customize the app's appearance and navigation
        </Text>
      </View>

      {/* Color Theme Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon
              source="palette-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Color Theme
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Choose your preferred color scheme. Works with both light and dark
            modes.
          </Text>

          <View style={styles.palettesContainer}>
            {palettes.map((palette, index) => (
              <Surface
                key={palette.key}
                style={[
                  styles.paletteCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor:
                      colorPalette === palette.key
                        ? theme.colors.primary
                        : "transparent",
                    borderWidth: colorPalette === palette.key ? 2 : 1,
                  },
                ]}
                elevation={colorPalette === palette.key ? 2 : 0}
              >
                <List.Item
                  title={palette.name}
                  description={palette.description}
                  titleStyle={styles.paletteTitle}
                  descriptionStyle={styles.paletteDescription}
                  left={() => (
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
                    <RadioButton.Android
                      value={palette.key}
                      status={
                        colorPalette === palette.key ? "checked" : "unchecked"
                      }
                      onPress={() =>
                        changeColorPalette(palette.key as ColorPalette)
                      }
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() =>
                    changeColorPalette(palette.key as ColorPalette)
                  }
                  style={styles.paletteItem}
                />
              </Surface>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Navigation Style Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Icon
              source="navigation-variant"
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Navigation Style
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Select how you want to navigate through the app
          </Text>

          <View style={styles.navigationOptions}>
            {/* Drawer Option */}
            <Surface
              style={[
                styles.navigationCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor:
                    mainNavigator === "drawer"
                      ? theme.colors.primary
                      : "transparent",
                  borderWidth: mainNavigator === "drawer" ? 2 : 1,
                },
              ]}
              elevation={mainNavigator === "drawer" ? 2 : 0}
            >
              <List.Item
                title="Drawer Navigation"
                description="Slide from the left edge to access all features"
                titleStyle={styles.navTitle}
                descriptionStyle={styles.navDescription}
                left={() => (
                  <View
                    style={[
                      styles.iconContainer,
                      //{ backgroundColor: theme.colors.primaryContainer },
                    ]}
                  >
                    <Icon
                      source="menu"
                      size={28}
                      color={theme.colors.primary}
                    />
                  </View>
                )}
                right={() => (
                  <RadioButton.Android
                    value="drawer"
                    status={
                      mainNavigator === "drawer" ? "checked" : "unchecked"
                    }
                    onPress={() => {
                      if (mainNavigator !== "drawer") toggleMainNavigator();
                    }}
                    color={theme.colors.primary}
                  />
                )}
                onPress={() => {
                  if (mainNavigator !== "drawer") toggleMainNavigator();
                }}
                style={styles.navigationItem}
              />
            </Surface>

            {/* Bottom Tabs Option */}
            <Surface
              style={[
                styles.navigationCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor:
                    mainNavigator === "tab"
                      ? theme.colors.primary
                      : "transparent",
                  borderWidth: mainNavigator === "tab" ? 2 : 1,
                },
              ]}
              elevation={mainNavigator === "tab" ? 2 : 0}
            >
              <List.Item
                title="Bottom Tabs"
                description="Quick access to main sections at the bottom"
                titleStyle={styles.navTitle}
                descriptionStyle={styles.navDescription}
                left={() => (
                  <View
                    style={[
                      styles.iconContainer,
                      //{ backgroundColor: theme.colors.primaryContainer },
                    ]}
                  >
                    <Icon
                      source="view-dashboard"
                      size={28}
                      color={theme.colors.primary}
                    />
                  </View>
                )}
                right={() => (
                  <RadioButton.Android
                    value="tab"
                    status={mainNavigator === "tab" ? "checked" : "unchecked"}
                    onPress={() => {
                      if (mainNavigator !== "tab") toggleMainNavigator();
                    }}
                    color={theme.colors.primary}
                  />
                )}
                onPress={() => {
                  if (mainNavigator !== "tab") toggleMainNavigator();
                }}
                style={styles.navigationItem}
              />
            </Surface>
          </View>
        </Card.Content>
      </Card>

      {/* Info Note */}
      <Surface
        style={[
          styles.infoCard,
          //{ backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Icon source="information" size={20} color={theme.colors.primary} />
        <Text variant="bodySmall" style={styles.infoText}>
          Changes will take effect immediately. Restart the app if you
          experience any issues.
        </Text>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    marginTop: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  headerSubtitle: {
    marginTop: 4,
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
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  palettesContainer: {
    gap: 12,
  },
  paletteCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  paletteItem: {
    paddingVertical: 4,
  },
  paletteTitle: {
    fontWeight: "600",
  },
  paletteDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  colorPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  navigationOptions: {
    gap: 12,
  },
  navigationCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  navigationItem: {
    paddingVertical: 4,
  },
  navTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  navDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
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

export default PreferencesScreen;
