import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { typography } from "../constants/typography";
import { useCartStore } from "../store/cart-store";

export function CartBar() {
  const insets = useSafeAreaInsets();
  const itemCount = useCartStore((s) => s.itemCount);
  const total = useCartStore((s) => s.total);

  if (itemCount === 0) return null;

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: Math.max(insets.bottom, 12) + 8,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/cart")}
        activeOpacity={0.9}
        style={styles.floatingBar}
      >
        <View style={styles.leftInfo}>
          <Text style={[typography.captionBold, styles.itemCountText]}>
            {itemCount} ITEM{itemCount !== 1 ? "S" : ""}
          </Text>
          <Text style={[typography.h3, styles.totalPriceText]}>
            ${Number(total || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.rightAction}>
          <Text style={[typography.bodyBold, styles.viewCartText]}>
            View Cart
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
  },
  floatingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FF6B35",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  leftInfo: {
    justifyContent: "center",
  },
  itemCountText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  totalPriceText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 1,
  },
  rightAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewCartText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
