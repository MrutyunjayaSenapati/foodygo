import { View, Text } from "react-native";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { spacing } from "../../constants/spacing";

interface BadgeProps {
  count: number;
  variant?: "primary" | "error";
}

export function Badge({ count, variant = "primary" }: BadgeProps) {
  if (count <= 0) return null;

  return (
    <View
      style={{
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: variant === "error" ? colors.error : colors.primary,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xs,
      }}
    >
      <Text
        style={[
          typography.captionBold,
          { color: colors.textInverse, fontSize: 10, lineHeight: 14 },
        ]}
      >
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
}
