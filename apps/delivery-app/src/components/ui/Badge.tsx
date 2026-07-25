import { View, Text, type ViewProps } from "react-native";

interface BadgeProps extends ViewProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  label: string;
}

const badgeColors = {
  default: { bg: "#F3F4F6", text: "#374151" },
  success: { bg: "#D1FAE5", text: "#065F46" },
  warning: { bg: "#FEF3C7", text: "#92400E" },
  error: { bg: "#FEE2E2", text: "#991B1B" },
  info: { bg: "#DBEAFE", text: "#1E40AF" },
} as const;

function getBadgeColor(variant: string) {
  return badgeColors[variant as keyof typeof badgeColors] ?? badgeColors.default;
}

export function Badge({ variant = "default", label, style, ...props }: BadgeProps) {
  const c = getBadgeColor(variant);
  return (
    <View
      style={[
        {
          backgroundColor: c.bg,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
          alignSelf: "flex-start",
        },
        style,
      ]}
      {...props}
    >
      <Text style={{ fontSize: 12, fontWeight: "600", color: c.text }}>{label}</Text>
    </View>
  );
}
