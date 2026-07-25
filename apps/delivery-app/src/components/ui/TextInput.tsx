import { View, TextInput as RNTextInput, Text, type TextInputProps as RNTextInputProps } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { layout } from "../../constants/layout";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, style, ...props }: TextInputProps) {
  return (
    <View style={{ gap: spacing.xs }}>
      {label && (
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
          {label}
        </Text>
      )}
      <RNTextInput
        style={[
          {
            borderWidth: 1,
            borderColor: error ? colors.error : colors.border,
            borderRadius: layout.buttonBorderRadius,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 2,
            fontSize: 16,
            color: colors.text,
            backgroundColor: colors.surface,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error && (
        <Text style={{ fontSize: 12, color: colors.error }}>{error}</Text>
      )}
    </View>
  );
}
