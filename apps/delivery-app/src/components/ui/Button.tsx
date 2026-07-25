import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
  type TextStyle,
} from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { layout } from "../../constants/layout";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  title: string;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: "#FFFFFF" },
  secondary: { bg: colors.secondary, text: "#FFFFFF" },
  outline: { bg: "transparent", text: colors.primary, border: colors.primary },
  ghost: { bg: "transparent", text: colors.primary },
};

const sizeStyles: Record<ButtonSize, { py: number; fs: number }> = {
  sm: { py: spacing.sm, fs: 14 },
  md: { py: spacing.md, fs: 16 },
  lg: { py: spacing.lg, fs: 18 },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  title,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: v.bg,
          paddingVertical: s.py,
          paddingHorizontal: spacing.xl,
          borderRadius: layout.buttonBorderRadius,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          opacity: disabled ? 0.5 : 1,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: spacing.sm,
        },
        style,
      ]}
      {...props}
    >
      {loading && <ActivityIndicator color={v.text} size="small" />}
      <Text style={{ color: v.text, fontSize: s.fs, fontWeight: "600" } as TextStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
