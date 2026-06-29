import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";
import { useCartStore } from "../store/cart-store";

export function CartBar() {
  const insets = useSafeAreaInsets();
  const itemCount = useCartStore((s) => s.itemCount);
  const total = useCartStore((s) => s.total);

  if (itemCount === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom,
        backgroundColor: colors.secondary,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyBold, { color: colors.textInverse }]}>
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </Text>
        <Text style={[typography.h3, { color: colors.textInverse, marginTop: 2 }]}>
          ${total.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/cart")}
        activeOpacity={0.8}
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: 12,
        }}
      >
        <Text style={[typography.bodyBold, { color: colors.textInverse }]}>
          View Cart
        </Text>
      </TouchableOpacity>
    </View>
  );
}
