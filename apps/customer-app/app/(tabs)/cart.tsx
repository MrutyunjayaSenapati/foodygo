import { View, Text } from "react-native";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { useCartStore } from "../../src/store/cart-store";

export default function CartScreen() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <Text style={[typography.h2, { color: colors.textPrimary }]}>Your Cart</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
          Your cart is empty
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: 16 }]}>Your Cart</Text>
      {items.map((item) => (
        <View key={item.foodId} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
          <Text style={[typography.body, { color: colors.textPrimary }]}>
            {item.food?.name ?? item.foodId} x{item.quantity}
          </Text>
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
            ${((item.food?.price ?? 0) * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, marginTop: 16 }}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          Total: ${total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}
