import { View, Text } from "react-native";
import React from "react";
import { Button, ButtonProps } from "react-native-paper";

interface Props extends ButtonProps {
  title?: string;
  handleSubmit?: () => void;
}

const FormButton = (props: Props) => {
  return (
    <Button
      mode="contained"
      onPress={props.handleSubmit}
      loading={props.loading}
      disabled={props.disabled}
      {...props}
    >
      {props.title || "Submit"}
    </Button>
  );
};

export default FormButton;
