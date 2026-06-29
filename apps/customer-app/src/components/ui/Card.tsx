import { View, type ViewStyle, type StyleProp } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { layout } from "../../constants/layout";

interface CardProps {
  children: React.ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, padded = true, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: layout.cardBorderRadius,
          padding: padded ? spacing.lg : 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
