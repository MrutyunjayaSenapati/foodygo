import { View, Text } from "react-native";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { spacing } from "../../constants/spacing";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing["3xl"],
      }}
    >
      {icon && <Text style={{ fontSize: 48, marginBottom: spacing.lg }}>{icon}</Text>}
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
