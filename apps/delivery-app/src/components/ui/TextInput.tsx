import { useState } from "react";
import { View, TextInput as RNTextInput, Text, type TextInputProps as RNTextInputProps } from "react-native";
import { colors } from "../../constants/colors";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function TextInput({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, letterSpacing: 0.2 }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
          borderRadius: 14,
          backgroundColor: colors.surface,
          paddingHorizontal: 14,
        }}
      >
        {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
        <RNTextInput
          style={[
            {
              flex: 1,
              paddingVertical: 13,
              fontSize: 15,
              color: colors.text,
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={{ fontSize: 12, color: colors.error, marginLeft: 2 }}>{error}</Text>
      )}
    </View>
  );
}
