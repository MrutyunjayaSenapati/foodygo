import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { useCartStore } from "../../src/store/cart-store";
import { useAuthStore } from "../../src/store/auth-store";
import { useRestaurantDetail } from "../../src/hooks/use-restaurants";
import {
  useClearCart,
  useCart,
  useAddCartItem,
  useUpdateCartItem,
  useRemoveCartItem,
} from "../../src/hooks/use-cart";
import { VegBadge } from "../../src/components/ui/VegBadge";
import { BillCard } from "../../src/components/ui/BillCard";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Button } from "../../src/components/ui/Button";

const TAX_RATE = 0.08;
const PACKING_FEE = 0.14;
const DELIVERY_FEE = 0;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [cookingNote, setCookingNote] = useState("");

  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.itemCount);
  const total = useCartStore((s) => s.total);
  const restaurantId = useCartStore((s) => s.restaurantId);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const clearCartMutation = useClearCart();
  const { data: serverCart } = useCart();
  const addCartItem = useAddCartItem();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);

  const { data: restaurant } = useRestaurantDetail(restaurantId ?? "");

  const subtotal = Number(total) || 0;
  const tax = subtotal * TAX_RATE;
  const grandTotal = Math.max(0, subtotal + tax + PACKING_FEE + DELIVERY_FEE - appliedDiscount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "FOODY50" || code === "WELCOME50") {
      const discountAmount = Math.min(10, subtotal * 0.5);
      setAppliedDiscount(discountAmount);
      setCouponMessage(`Applied ${code}! Saved $${discountAmount.toFixed(2)}`);
    } else if (code.length > 0) {
      setAppliedDiscount(0);
      setCouponMessage("Invalid coupon code. Try FOODY50.");
    }
  };

  const handleClearAll = useCallback(() => {
    clearCart();
    setAppliedDiscount(0);
    setCouponMessage(null);
    if (isAuthenticated) {
      clearCartMutation.mutate();
    }
  }, [clearCart, isAuthenticated, clearCartMutation]);

  const handleDecrement = useCallback(
    (foodId: string, quantity: number) => {
      if (quantity <= 1) {
        removeItem(foodId);
        if (isAuthenticated) {
          const serverItem = serverCart?.items?.find((i) => i.foodId === foodId);
          if (serverItem) removeCartItem.mutate(serverItem.id);
        }
      } else {
        updateQuantity(foodId, quantity - 1);
        if (isAuthenticated) {
          const serverItem = serverCart?.items?.find((i) => i.foodId === foodId);
          if (serverItem) {
            updateCartItem.mutate({
              itemId: serverItem.id,
              data: { quantity: quantity - 1 },
            });
          }
        }
      }
    },
    [removeItem, updateQuantity, isAuthenticated, serverCart, removeCartItem, updateCartItem],
  );

  const handleIncrement = useCallback(
    (foodId: string, quantity: number) => {
      updateQuantity(foodId, quantity + 1);
      if (isAuthenticated) {
        const serverItem = serverCart?.items?.find((i) => i.foodId === foodId);
        if (serverItem) {
          updateCartItem.mutate({
            itemId: serverItem.id,
            data: { quantity: quantity + 1 },
          });
        } else {
          addCartItem.mutate({ foodId, quantity: 1 });
        }
      }
    },
    [updateQuantity, isAuthenticated, serverCart, updateCartItem, addCartItem],
  );

  if (items.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <EmptyState
          iconName="cart-outline"
          title="Your cart is empty"
          description="Good food is always cooking! Browse restaurants and add items to your cart."
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
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>Your Cart</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
          <Text style={[typography.captionBold, { color: colors.error }]}>Clear Cart</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Header Banner */}
        <View style={styles.restaurantBanner}>
          <View style={styles.restaurantInfo}>
            <Text style={[typography.bodyBold, styles.restaurantName]} numberOfLines={1}>
              {restaurant?.name || "Selected Restaurant"}
            </Text>
            <Text style={[typography.caption, styles.deliveryMeta]}>
              Delivery in 25-35 mins • {restaurant?.address || "Nearby"}
            </Text>
          </View>
          <View style={styles.restaurantIcon}>
            <Ionicons name="restaurant" size={20} color={colors.primary} />
          </View>
        </View>

        {/* Cart Items List */}
        <View style={styles.itemsCard}>
          {items.map((item, index) => {
            const foodName = (item.food?.name ?? "").toLowerCase();
            const isVeg =
              !foodName.includes("chicken") &&
              !foodName.includes("pepperoni") &&
              !foodName.includes("tuna") &&
              !foodName.includes("salmon");

            return (
              <View
                key={item.foodId}
                style={[
                  styles.itemRow,
                  index < items.length - 1 && styles.itemBorder,
                ]}
              >
                <VegBadge isVeg={isVeg} size={14} style={{ marginRight: 10, marginTop: 4 }} />

                <View style={styles.itemDetails}>
                  <Text style={[typography.bodyBold, styles.itemName]} numberOfLines={1}>
                    {item.food?.name ?? item.foodId}
                  </Text>
                  <Text style={[typography.bodyBold, styles.itemPrice]}>
                    ${Number(item.food?.price || 0).toFixed(2)}
                  </Text>
                </View>

                {item.food?.imageUrl && (
                  <Image
                    source={{ uri: item.food.imageUrl }}
                    style={styles.foodThumb}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                )}

                {/* Stepper Controls */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    onPress={() => handleDecrement(item.foodId, item.quantity)}
                    activeOpacity={0.7}
                    style={styles.stepperBtn}
                  >
                    <Ionicons name="remove" size={14} color={colors.primary} />
                  </TouchableOpacity>

                  <Text style={styles.stepperCount}>{item.quantity}</Text>

                  <TouchableOpacity
                    onPress={() => handleIncrement(item.foodId, item.quantity)}
                    activeOpacity={0.7}
                    style={styles.stepperBtn}
                  >
                    <Ionicons name="add" size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Cooking Instructions Card */}
        <View style={styles.noteCard}>
          <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            value={cookingNote}
            onChangeText={setCookingNote}
            placeholder="Add cooking or delivery instructions..."
            placeholderTextColor={colors.textTertiary}
            style={[typography.bodySmall, styles.noteInput]}
          />
        </View>

        {/* Apply Coupon Box */}
        <View style={styles.couponCard}>
          <View style={styles.couponInputRow}>
            <Ionicons name="pricetag-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <TextInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Enter coupon code (e.g. FOODY50)"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              style={[typography.bodySmall, styles.couponInput]}
            />
            <TouchableOpacity
              onPress={handleApplyCoupon}
              style={styles.applyBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>APPLY</Text>
            </TouchableOpacity>
          </View>

          {couponMessage && (
            <Text
              style={[
                typography.captionBold,
                appliedDiscount > 0 ? styles.couponSuccessText : styles.couponErrorText,
              ]}
            >
              {couponMessage}
            </Text>
          )}
        </View>

        {/* Bill Summary Breakdown */}
        <BillCard
          subtotal={subtotal}
          deliveryFee={DELIVERY_FEE}
          packingFee={PACKING_FEE}
          tax={tax}
          discount={appliedDiscount}
          total={grandTotal}
        />
      </ScrollView>

      {/* Floating Bottom Bar with Checkout Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
        <View style={styles.totalInfo}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            GRAND TOTAL
          </Text>
          <Text style={[typography.h2, styles.grandTotalText]}>
            ${Number(grandTotal || 0).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/checkout")}
          style={styles.checkoutBtn}
          activeOpacity={0.85}
        >
          <Text style={[typography.bodyBold, styles.checkoutBtnText]}>
            Proceed to Checkout
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  clearBtn: {
    padding: 6,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
    paddingTop: 12,
  },
  restaurantBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  restaurantInfo: {
    flex: 1,
    marginRight: 10,
  },
  restaurantName: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  deliveryMeta: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  restaurantIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  itemsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F4F5F7",
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  itemPrice: {
    color: colors.textPrimary,
    marginTop: 2,
    fontSize: 13,
  },
  foodThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    height: 30,
  },
  stepperBtn: {
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperCount: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 4,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  noteInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  couponCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  couponInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  applyBtn: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  applyBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  couponSuccessText: {
    color: "#2E7D32",
    marginTop: 8,
    fontSize: 12,
  },
  couponErrorText: {
    color: colors.error,
    marginTop: 8,
    fontSize: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#ECEEF1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  totalInfo: {
    justifyContent: "center",
  },
  grandTotalText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 180,
  },
  checkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
