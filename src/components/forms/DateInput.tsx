import { TextInput, HelperText, useTheme } from "react-native-paper";
import React, { useState } from "react";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { COLOR_GRAY } from "../../constants/colors";

interface DateInputProps {
  value?: Date | string;
  label: string;
  placeholder?: string;
  onChangeText?: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string | null;
  autoFocus?: boolean;
  disabled?: boolean;
  mode?: "flat" | "outlined";
  style?: any;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  label,
  placeholder,
  onChangeText,
  onBlur,
  error,
  helperText,
  autoFocus,
  disabled,
  mode = "outlined",
  style,
}) => {
  const theme = useTheme().dark ? "dark" : "light";
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (selectedDate: Date) => {
    if (onChangeText) {
      onChangeText(selectedDate.toISOString());
    }
  };

  const toggleDatepicker = () => {
    if (!disabled) {
      setShowPicker(!showPicker);
    }
  };

  const getDatePickerValue = ({ type }: any, selectedDate?: Date) => {
    if (type === "set" && selectedDate) {
      handleChange(selectedDate);
    }
    setShowPicker(false);
    onBlur?.();
  };

  const getDisplayValue = () => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    return moment(date).format("MM/DD/YYYY");
  };

  const getPickerValue = () => {
    if (!value) return new Date();
    return value instanceof Date ? value : new Date(value);
  };

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
    <View>
      <TextInput
        label={label}
        placeholder={placeholder}
        value={getDisplayValue()}
        onPressIn={toggleDatepicker}
        showSoftInputOnFocus={false}
        disabled={disabled}
        accessibilityLabel={label}
        numberOfLines={1}
        mode={mode}
        right={
          <TextInput.Icon
            icon="calendar"
            onPress={toggleDatepicker}
            accessibilityLabel="pick date"
            size={30}
          />
        }
        style={[
          {
            width: "100%",
            height: 60,
            borderRadius: 8,
            marginTop: 12,
            minHeight: 60,
            fontWeight: "600",
            fontSize: 18,
          },
          style,
        ]}
        error={error}
        focusable={false}
        autoFocus={autoFocus}
        editable={false}
        placeholderTextColor={COLOR_GRAY}
        activeOutlineColor="#004AAD"
      />
      {renderError(helperText)}

      {showPicker && (
        <DateTimePicker
          mode="date"
          display="default"
          themeVariant={theme}
          textColor={theme === "dark" ? "#fff" : "#000"}
          value={getPickerValue()}
          onChange={getDatePickerValue}
        />
      )}
    </View>
  );
};

export default DateInput;
