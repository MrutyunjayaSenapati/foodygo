import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { useCartStore } from "../../src/store/cart-store";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Button } from "../../src/components/ui/Button";

const TAX_RATE = 0.08;
const PACKING_FEE_RATE = 0.02;
const DELIVERY_FEE = 0;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.itemCount);
  const total = useCartStore((s) => s.total);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = total;
  const tax = subtotal * TAX_RATE;
  const packingFee = subtotal * PACKING_FEE_RATE;
  const grandTotal = subtotal + tax + packingFee + DELIVERY_FEE;

  const handleDecrement = useCallback(
    (foodId: string, quantity: number) => {
      if (quantity <= 1) {
        removeItem(foodId);
      } else {
        updateQuantity(foodId, quantity - 1);
      }
    },
    [removeItem, updateQuantity],
  );

  const handleIncrement = useCallback(
    (foodId: string, quantity: number) => {
      updateQuantity(foodId, quantity + 1);
    },
    [updateQuantity],
  );

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <EmptyState
          title="Your cart is empty"
          description="Browse restaurants to add items"
          action={
            <Button
              title="Browse Restaurants"
              onPress={() => router.replace("/(tabs)/home")}
            />
          }
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.foodId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing["5xl"] }}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>Your Cart</Text>
              <TouchableOpacity onPress={clearCart}>
                <Text style={[typography.captionBold, { color: colors.error }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </Text>
            <View style={{ height: 1, backgroundColor: colors.border, marginTop: spacing.md }} />
          </View>
        )}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              alignItems: "center",
            }}
          >
            {item.food?.imageUrl && (
              <Image
                source={{ uri: item.food.imageUrl }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  backgroundColor: colors.border,
                  marginRight: spacing.md,
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={[typography.bodyBold, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {item.food?.name ?? item.foodId}
              </Text>
              <Text style={[typography.bodyBold, { color: colors.primary, marginTop: 2 }]}>
                ${(item.food?.price ?? 0).toFixed(2)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <TouchableOpacity
                onPress={() => handleDecrement(item.foodId, item.quantity)}
                activeOpacity={0.7}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="remove" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text
                style={[
                  typography.bodyBold,
                  { color: colors.textPrimary, minWidth: 20, textAlign: "center" },
                ]}
              >
                {item.quantity}
              </Text>
              <TouchableOpacity
                onPress={() => handleIncrement(item.foodId, item.quantity)}
                activeOpacity={0.7}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="add" size={16} color={colors.textInverse} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View style={{ paddingVertical: spacing.md, gap: spacing.sm }}>
              <Row label="Subtotal" value={subtotal} />
              <Row label="Delivery Fee" value={DELIVERY_FEE} />
              <Row label="Packing Fee" value={packingFee} />
              <Row label="Tax (8%)" value={tax} />
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.xs }} />
              <Row label="Total" value={grandTotal} bold />
            </View>
            <Button
              title="Proceed to Checkout"
              onPress={() => router.push("/checkout")}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      />
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text
        style={[
          bold ? typography.bodyBold : typography.body,
          { color: bold ? colors.textPrimary : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          bold ? typography.bodyBold : typography.body,
          { color: bold ? colors.textPrimary : colors.textSecondary },
        ]}
      >
        ${value.toFixed(2)}
      </Text>
    </View>
  );
}
