import {
  TextInput as PTextInput,
  HelperText,
  TextInputProps,
} from "react-native-paper";
import React, { useState } from "react";
import { useTheme } from "../../hooks";

interface TextInputComponentProps extends TextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  isPass?: boolean;
  isDate?: boolean;
  getDate?: () => void;
  multiline?: boolean;
  maxLength?: number;
  disabled?: boolean;
  numberOfLines?: number;
  mode?: "flat" | "outlined";
  rightIcon?: string;
  action?: () => void;
  affix?: string;
  error?: string;
  autoFocus?: boolean;
  editable?: boolean;
}

const TextInput = (props: TextInputComponentProps) => {
  const [showPass, setShowPass] = useState(true);
  const { theme } = useTheme();

  const renderError = (error) => {
    return (
      <>
        {error && (
          <HelperText variant="labelSmall" type="error">
            {error}
          </HelperText>
        )}
      </>
    );
  };

  return (
    <>
      <PTextInput
        label={props.label}
        placeholder={props.placeholder}
        value={props.value}
        onChangeText={props.onChange ? props.onChange : null}
        showSoftInputOnFocus={props.isDate ? false : true}
        secureTextEntry={props.isPass && showPass}
        multiline={props.multiline ? true : false}
        maxLength={props.maxLength}
        disabled={props.disabled}
        accessibilityLabel={props.label}
        numberOfLines={props.numberOfLines ? props.numberOfLines : 1}
        mode={props.mode}
        right={
          props.isPass ? (
            <PTextInput.Icon
              onPress={() => setShowPass(!showPass)}
              icon={showPass ? "eye" : "eye-off"}
              accessibilityLabel={showPass ? "show password" : "hide password"}
              size={30}
            />
          ) : props.isDate ? (
            <PTextInput.Icon
              icon="calendar"
              onPress={props.getDate}
              accessibilityLabel="pick date"
              size={30}
            />
          ) : props.multiline ? (
            <PTextInput.Affix
              text={`${props?.value?.length}/${props?.maxLength}`}
              textStyle={{ color: "gray", fontSize: 12 }}
            />
          ) : props.affix ? (
            <PTextInput.Affix
              text={props?.affix}
              textStyle={{ color: "gray", fontSize: 12 }}
            />
          ) : null
        }
        left={
          props.rightIcon ? (
            <PTextInput.Icon
              icon={props.rightIcon}
              accessibilityLabel={props.rightIcon}
              onPress={props.action ? props.action : () => {}}
              size={30}
            />
          ) : null
        }
        style={{
          width: "100%",
          height: !props.multiline && 60,
          borderRadius: 8,
          padding: props.multiline && 5,
          marginTop: 12,
          minHeight: 60,
          fontSize: 18,
        }}
        focusable={false}
        autoFocus={props.autoFocus}
        editable={props.editable}
        placeholderTextColor={"gray"}
        activeOutlineColor="#004AAD"
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
      />
      {renderError(props.error)}
    </>
  );
};

export default TextInput;
