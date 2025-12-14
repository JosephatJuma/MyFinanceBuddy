import { useState, useCallback } from "react";
import { DialogConfig } from "../components/reusable/ConfirmDialog";

export const useDialog = () => {
  const [config, setConfig] = useState<DialogConfig>({
    visible: false,
    title: "",
    message: "",
    actions: [],
    dismissable: true,
  });

  const showDialog = useCallback(
    (dialogConfig: Omit<DialogConfig, "visible">) => {
      setConfig({
        ...dialogConfig,
        visible: true,
        onDismiss: dialogConfig.onDismiss || (() => hideDialog()),
      });
    },
    []
  );

  const hideDialog = useCallback(() => {
    setConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      confirmLabel: string = "Confirm",
      cancelLabel: string = "Cancel"
    ) => {
      showDialog({
        title,
        message,
        actions: [
          {
            label: cancelLabel,
            onPress: () => {
              hideDialog();
              onCancel?.();
            },
            mode: "text",
          },
          {
            label: confirmLabel,
            onPress: () => {
              hideDialog();
              onConfirm();
            },
            mode: "contained",
          },
        ],
        dismissable: true,
      });
    },
    [showDialog, hideDialog]
  );

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      onOk?: () => void,
      okLabel: string = "OK"
    ) => {
      showDialog({
        title,
        message,
        actions: [
          {
            label: okLabel,
            onPress: () => {
              hideDialog();
              onOk?.();
            },
            mode: "contained",
          },
        ],
        dismissable: true,
      });
    },
    [showDialog, hideDialog]
  );

  const showError = useCallback(
    (message: string, title: string = "Error") => {
      showDialog({
        title,
        message,
        actions: [
          {
            label: "OK",
            onPress: hideDialog,
            mode: "contained",
          },
        ],
        dismissable: true,
      });
    },
    [showDialog, hideDialog]
  );

  const showSuccess = useCallback(
    (message: string, title: string = "Success", onOk?: () => void) => {
      showDialog({
        title,
        message,
        actions: [
          {
            label: "OK",
            onPress: () => {
              hideDialog();
              onOk?.();
            },
            mode: "contained",
          },
        ],
        dismissable: true,
      });
    },
    [showDialog, hideDialog]
  );

  return {
    config,
    showDialog,
    hideDialog,
    showConfirm,
    showAlert,
    showError,
    showSuccess,
  };
};
