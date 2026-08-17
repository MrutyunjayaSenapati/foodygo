import { View, type ViewProps } from "react-native";
import { colors } from "../../constants/colors";

interface CardProps extends ViewProps {
  variant?: "elevated" | "outlined" | "flat";
}

export function Card({ style, children, variant = "elevated", ...props }: CardProps) {
  const isElevated = variant === "elevated";
  const isOutlined = variant === "outlined";

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: isOutlined ? colors.border : "rgba(226, 232, 240, 0.8)",
          ...(isElevated
            ? {
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }
            : {}),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
