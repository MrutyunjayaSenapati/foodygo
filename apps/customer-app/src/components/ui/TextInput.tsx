import {
  View,
  TextInput as RNTextInput,
  Text,
  type TextInputProps as RNTextInputProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { layout } from "../../constants/layout";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function TextInput({
  label,
  error,
  containerStyle,
  style,
  ...props
}: TextInputProps) {
  return (
    <View style={[{ marginBottom: spacing.lg }, containerStyle]}>
      {label && (
        <Text
          style={[
            typography.label,
            { color: colors.textPrimary, marginBottom: spacing.xs },
          ]}
        >
          {label}
        </Text>
      )}
      <RNTextInput
        style={[
          {
            borderWidth: 1,
            borderColor: error ? colors.error : colors.border,
            borderRadius: layout.inputBorderRadius,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            fontSize: typography.body.fontSize,
            fontFamily: typography.body.fontFamily,
            color: colors.textPrimary,
            backgroundColor: colors.surface,
          },
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
      {error && (
        <Text
          style={[
            typography.caption,
            { color: colors.error, marginTop: spacing.xs },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
