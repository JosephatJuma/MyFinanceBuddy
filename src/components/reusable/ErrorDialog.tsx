import React from "react";
import { Portal, Dialog, Button, Text } from "react-native-paper";
import { StyleSheet } from "react-native";

interface ErrorDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  onDismiss: () => void;
  dismissText?: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  visible,
  title = "Error",
  message,
  onDismiss,
  dismissText = "OK",
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{dismissText}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  // Add any custom styles if needed
});

export default ErrorDialog;
