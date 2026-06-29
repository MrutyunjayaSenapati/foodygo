import { View, Text } from "react-native";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

export default function OrdersScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <Text style={[typography.h2, { color: colors.textPrimary }]}>Orders</Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
        Track your orders
      </Text>
    </View>
  );
}
