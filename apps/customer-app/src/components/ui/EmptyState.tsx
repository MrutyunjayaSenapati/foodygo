import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { spacing } from "../../constants/spacing";

interface EmptyStateProps {
  icon?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, iconName, title, description, action }: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing["3xl"],
      }}
    >
      {iconName ? (
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.surfaceAlt,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons name={iconName} size={36} color={colors.textTertiary} />
        </View>
      ) : icon ? (
        <Text style={{ fontSize: 48, marginBottom: spacing.lg }}>{icon}</Text>
      ) : null}
      <Text
        style={[
          typography.h3,
          { color: colors.textPrimary, textAlign: "center", marginBottom: spacing.sm },
        ]}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, textAlign: "center", marginBottom: spacing.xl },
          ]}
        >
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}
