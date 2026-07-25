import { View, Text } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", padding: spacing["4xl"], gap: spacing.sm }}>
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text, textAlign: "center" }}>
        {title}
      </Text>
      {description && (
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center" }}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="outline" size="sm" />
      )}
    </View>
  );
}
