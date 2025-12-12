import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { TextInput, Text, useTheme, HelperText } from "react-native-paper";
import { useTheme as useAppTheme } from "../../hooks";

interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

interface SelectInputProps {
  field?: string;
  label: string;
  options?: SelectOption[];
  onChangeText?: (value: string) => void;
  onBlur?: () => void;
  loading?: boolean;
  required?: boolean;
  error?: boolean;
  value?: string;
  helperText?: string | null;
  disabled?: boolean;
  multiple?: boolean;
  showDescription?: boolean;
  mode?: "flat" | "outlined";
  style?: any;
}

const SelectInput: React.FC<SelectInputProps> = ({
  field,
  label,
  options = [],
  onChangeText,
  onBlur,
  loading,
  required,
  error,
  value,
  helperText,
  disabled,
  multiple,
  showDescription = true,
  mode = "flat",
  style,
}) => {
  const [selected, setSelected] = useState<SelectOption | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();
  const { theme } = useAppTheme();

  const toggleDropdown = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (option: SelectOption) => {
    setSelected(option);
    setIsOpen(false);
    onChangeText?.(option.value);
    onBlur?.();
  };

  // set the selected value from id
  useEffect(() => {
    if (options?.length > 0 && value) {
      const item = options.find((option) => option.value === value);
      if (item) setSelected(item);
    }
  }, [value, options]);

  return (
    <View style={styles.container}>
      {/* Dropdown Button */}
      <TouchableOpacity onPress={toggleDropdown}>
        <TextInput
          onPress={toggleDropdown}
          editable={false}
          mode={mode}
          label={label}
          placeholder={`Select ${label || field}`}
          value={selected?.label || ""}
          right={
            <TextInput.Icon
              onPress={toggleDropdown}
              icon={isOpen ? "chevron-up" : "chevron-down"}
            />
          }
          error={!isOpen && error}
          disabled={disabled}
          style={[
            {
              width: "100%",
              borderRadius: 8,
              marginTop: 12,
              minHeight: 60,
              fontWeight: "600",
              fontSize: 18,
            },
            style,
          ]}
          activeOutlineColor="#004AAD"
          contentStyle={{
            textTransform: "capitalize",
          }}
        />
      </TouchableOpacity>
      {error && !isOpen && helperText && (
        <HelperText variant="labelSmall" type="error">
          {helperText}
        </HelperText>
      )}

      {/* Dropdown Overlay */}
      {isOpen && (
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOutUp}
          style={[
            styles.dropdownList,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.shadow,
              borderColor: colors.outline,
            },
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            horizontal={true} // scrollview to prevent virtualization
            contentContainerStyle={{ flex: 1 }}
          >
            <FlatList
              data={options}
              ListEmptyComponent={() => (
                <Text style={[{ color: "grey", padding: 20 }]}>
                  No data available
                </Text>
              )}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const { description, label: name } = item || {};
                const isSelected = selected?.value === item?.value;

                return (
                  <TouchableOpacity
                    style={[
                      styles.item,
                      isSelected && {
                        backgroundColor: colors.elevation.level2,
                      },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        isSelected && styles.selectedText,
                        styles.itemText,
                      ]}
                    >
                      {name}
                    </Text>
                    {description && showDescription && (
                      <Text
                        style={[
                          styles.descriptionText,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {description}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    // zIndex: 100,
  },

  dropdownList: {
    width: "100%",
    maxHeight: 200,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    zIndex: 999,
    elevation: 8,
    padding: 8,
    marginTop: 4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  item: {
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    marginBottom: 2,
  },

  selectedText: {
    fontWeight: "500",
  },
  itemText: {
    textTransform: "capitalize",
  },
  descriptionText: {
    fontSize: 12,
    color: "grey",
  },
  multipleTag: {
    //backgroundColor: "#f2f2f2",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontWeight: "500",
  },
});

export default SelectInput;
