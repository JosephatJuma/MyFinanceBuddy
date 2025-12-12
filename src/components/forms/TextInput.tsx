import {
  TextInput as PTextInput,
  HelperText,
  TextInputProps as PaperTextInputProps,
} from "react-native-paper";
import React, { useState } from "react";
import { useTheme } from "../../hooks";

interface TextInputComponentProps extends Omit<PaperTextInputProps, "error"> {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string | null;
  isPass?: boolean;
  multiline?: boolean;
  maxLength?: number;
  disabled?: boolean;
  numberOfLines?: number;
  mode?: "flat" | "outlined";
  rightIcon?: string;
  action?: () => void;
  affix?: string;
  autoFocus?: boolean;
  editable?: boolean;
  style?: any;
  keyboardType?: any;
}

const TextInput = (props: TextInputComponentProps) => {
  const [showPass, setShowPass] = useState(true);
  const { theme } = useTheme();

  const renderError = (helperText: string | null | undefined) => {
    return (
      <>
        {helperText && (
          <HelperText variant="labelSmall" type="error">
            {helperText}
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
        value={props.value || ""}
        onChangeText={props.onChangeText}
        onBlur={props.onBlur}
        secureTextEntry={props.isPass && showPass}
        multiline={props.multiline ? true : false}
        maxLength={props.maxLength}
        disabled={props.disabled}
        accessibilityLabel={props.label}
        numberOfLines={props.numberOfLines ? props.numberOfLines : 1}
        mode={props.mode}
        error={props.error}
        keyboardType={props.keyboardType}
        right={
          props.isPass ? (
            <PTextInput.Icon
              onPress={() => setShowPass(!showPass)}
              icon={showPass ? "eye" : "eye-off"}
              accessibilityLabel={showPass ? "show password" : "hide password"}
              size={30}
            />
          ) : props.multiline ? (
            <PTextInput.Affix
              text={`${props?.value?.length || 0}/${props?.maxLength}`}
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
        style={[
          {
            width: "100%",
            height: !props.multiline ? 60 : undefined,
            borderRadius: 8,
            marginTop: 12,
            minHeight: 60,
            fontWeight: "600" as "600",
            fontSize: 18,
          },
          props.style,
        ]}
        activeOutlineColor="#004AAD"
        contentStyle={{
          textTransform: "capitalize",
        }}
        editable={props.editable !== undefined ? props.editable : true}
        autoFocus={props.autoFocus}
      />
      {renderError(props.helperText)}
    </>
  );
};

export default TextInput;
