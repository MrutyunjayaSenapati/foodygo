import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
  type TextStyle,
} from "react-native";
import { colors } from "../../constants/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "success" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  title: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  pill?: boolean;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: "#FFFFFF" },
  secondary: { bg: colors.secondary, text: "#FFFFFF" },
  outline: { bg: "transparent", text: colors.primary, border: colors.primary },
  ghost: { bg: "transparent", text: colors.primary },
  success: { bg: colors.success, text: "#FFFFFF" },
  danger: { bg: colors.error, text: "#FFFFFF" },
};

const sizeStyles: Record<ButtonSize, { py: number; px: number; fs: number }> = {
  sm: { py: 8, px: 14, fs: 13 },
  md: { py: 12, px: 20, fs: 15 },
  lg: { py: 16, px: 24, fs: 16 },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  title,
  icon,
  iconPosition = "left",
  pill = true,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: v.bg,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          borderRadius: pill ? 9999 : 12,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border,
          opacity: disabled ? 0.45 : 1,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 6,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon && iconPosition === "left" ? icon : null}
          <Text style={{ color: v.text, fontSize: s.fs, fontWeight: "600", letterSpacing: 0.2 } as TextStyle}>
            {title}
          </Text>
          {icon && iconPosition === "right" ? icon : null}
        </>
      )}
    </TouchableOpacity>
  );
}
