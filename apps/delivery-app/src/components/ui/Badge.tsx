import { View, Text, type ViewProps } from "react-native";

interface BadgeProps extends ViewProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  label: string;
}

const badgeColors = {
  default: { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  success: { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  warning: { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
  error: { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
  info: { bg: "#EFF6FF", text: "#1E40AF", dot: "#3B82F6" },
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
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 9999,
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        },
        style,
      ]}
      {...props}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: c.dot,
        }}
      />
      <Text style={{ fontSize: 11, fontWeight: "600", color: c.text, letterSpacing: 0.2 }}>{label}</Text>
    </View>
  );
}
