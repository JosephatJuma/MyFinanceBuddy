import React from "react";
import { StyleSheet } from "react-native";
import { Portal, Dialog, Button, Text } from "react-native-paper";
import { useThemeContext } from "../../contexts/ThemeContext";

export interface DialogAction {
  label: string;
  onPress: () => void;
  mode?: "text" | "outlined" | "contained";
  color?: string;
  loading?: boolean;
  disabled?: boolean;
}

export interface DialogConfig {
  visible: boolean;
  title: string;
  message: string;
  actions?: DialogAction[];
  dismissable?: boolean;
  onDismiss?: () => void;
}

interface ConfirmDialogProps {
  config: DialogConfig;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ config }) => {
  const { theme } = useThemeContext();
  const {
    visible,
    title,
    message,
    actions = [],
    dismissable = true,
    onDismiss,
  } = config;

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={dismissable ? onDismiss : undefined}
        dismissable={dismissable}
        style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
      >
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          {actions.map((action, index) => (
            <Button
              key={index}
              mode={action.mode || "text"}
              onPress={action.onPress}
              loading={action.loading}
              disabled={action.disabled}
              textColor={action.color}
              style={styles.button}
            >
              {action.label}
            </Button>
          ))}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  message: {
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  button: {
    marginLeft: 8,
  },
});

export default ConfirmDialog;
