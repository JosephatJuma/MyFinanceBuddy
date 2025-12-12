import { TextInput, HelperText, useTheme } from "react-native-paper";
import React, { useState } from "react";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import moment from "moment";
import { COLOR_GRAY } from "../../constants/colors";
const DateInput = (
  { value, label, placeholder, onChange, error, autoFocus, disabled },
  ...props
) => {
  const theme = useTheme().dark ? "dark" : "light";
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (text) => {
    onchange && onChange(text);
  };

  const toggleDatepicker = () => {
    setShowPicker(!showPicker);
  };
  const getDatePickerValue = ({ type }, selectedDate) => {
    toggleDatepicker();
    handleChange(selectedDate);
  };

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
    <View>
      <TextInput
        //className="m-4 bg-gray-100 font-bold text-gray-500"
        label={label}
        placeholder={placeholder}
        value={moment(value).format("MM/DD/YYYY")}
        //onChangeText={handleChange}
        onPressIn={toggleDatepicker}
        showSoftInputOnFocus={false}
        disabled={disabled}
        accessibilityLabel={label}
        numberOfLines={1}
        mode="outlined"
        right={
          <TextInput.Icon
            icon="calendar"
            onPress={toggleDatepicker}
            accessibilityLabel="pick date"
            size={30}
          />
        }
        style={{
          width: "100%",
          height: 60,
          borderRadius: 8,
          marginTop: 12,
          minHeight: 60,

          fontWeight: "600",
          fontSize: 18,
        }}
        error={error}
        focusable={false}
        autoFocus={autoFocus}
        editable={true}
        placeholderTextColor={COLOR_GRAY}
        activeOutlineColor="#004AAD"
      />
      {renderError(error)}

      {showPicker && (
        <DateTimePicker
          mode="date"
          display="default"
          themeVariant={theme}
          textColor={theme === "dark" ? "#fff" : "#000"}
          value={value}
          onChange={(event, selectedDate) => {
            //toggleDatepicker();
            getDatePickerValue(event, selectedDate);
          }}
        />
      )}
    </View>
  );
};

export default DateInput;
