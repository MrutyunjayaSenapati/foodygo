import { View, type ViewProps } from "react-native";
import { colors } from "../../constants/colors";
import { layout } from "../../constants/layout";

export function Card({ style, children, ...props }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: layout.cardBorderRadius,
          padding: layout.cardPadding,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
