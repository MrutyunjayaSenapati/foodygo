import { View, Text } from "react-native";
import { colors } from "../../constants/colors";
import { Button } from "./Button";

import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "cube-outline",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 32, gap: 12 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primaryBg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
        }}
      >
        <Ionicons name={icon} size={36} color={colors.primary} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, textAlign: "center" }}>
        {title}
      </Text>
      {description && (
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20, maxWidth: 280 }}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
}
