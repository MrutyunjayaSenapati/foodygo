import React, { useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CANCELLABLE_STATUSES } from "@foodygo/shared-constants";
import type { OrderStatus, OrderStatusHistory } from "@foodygo/shared-types";
import { useOrder, useDeliveryInfo, useCancelOrder } from "../../src/hooks/use-order-tracking";
import { useRestaurantDetail } from "../../src/hooks/use-restaurants";
import { useRestaurantFoods } from "../../src/hooks/use-foods";
import { OrderStatusTimeline } from "../../src/components/order-status-timeline";
import { DeliveryPartnerCard } from "../../src/components/delivery-partner-card";
import { Button } from "../../src/components/ui/Button";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { data: order, isLoading, error, refetch } = useOrder(id ?? "");
  const { data: delivery } = useDeliveryInfo(id ?? "");
  const cancelOrder = useCancelOrder();
  const { data: restaurant } = useRestaurantDetail(order?.restaurantId ?? "");
  const { data: foodsData } = useRestaurantFoods(order?.restaurantId ?? "");

  const isCancellable = order && CANCELLABLE_STATUSES.includes(order.status as typeof CANCELLABLE_STATUSES[number]);
  const isDelivered = order?.status === "DELIVERED";
  const isCancelled = order?.status === "CANCELLED";

  useEffect(() => {
    if (!isDelivered && !isCancelled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isDelivered, isCancelled, pulseAnim]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "Keep Order", style: "cancel" },
        {
          text: "Cancel Order",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelOrder.mutateAsync(id!);
              refetch();
            } catch {
              Alert.alert("Error", "Failed to cancel order.");
            }
          },
        },
      ],
    );
  }, [cancelOrder, id, refetch]);

  if (isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header onBack={() => router.back()} title="Order Details" />
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton width="60%" height={24} />
          <Skeleton width="100%" height={180} />
          <Skeleton width="100%" height={100} />
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header onBack={() => router.back()} title="Order Details" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={54} color={colors.error} />
          <Text style={[typography.h3, styles.errorTitle]}>
            Order not found
          </Text>
          <Button
            title="Back to Orders"
            onPress={() => router.replace("/(tabs)/orders")}
            variant="outline"
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header
        onBack={() => router.back()}
        title={`Order #${order.id.slice(0, 8)}`}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Delivery Status Banner */}
        <View style={styles.statusBanner}>
          <Animated.View
            style={[
              styles.statusIconCircle,
              { transform: [{ scale: pulseAnim }] },
              isDelivered ? styles.statusIconDelivered : isCancelled ? styles.statusIconCancelled : styles.statusIconActive,
            ]}
          >
            <Ionicons
              name={
                isDelivered
                  ? "checkmark-circle"
                  : isCancelled
                    ? "close-circle"
                    : "bicycle"
              }
              size={28}
              color="#FFFFFF"
            />
          </Animated.View>

          <View style={styles.statusBannerText}>
            <Text style={[typography.h3, styles.statusHeadline]}>
              {isDelivered
                ? "Order Delivered!"
                : isCancelled
                  ? "Order Cancelled"
                  : "Arriving in 25-30 mins 🛵"}
            </Text>
            <Text style={[typography.caption, styles.statusSubtext]}>
              {isDelivered
                ? "Hope you enjoyed your meal!"
                : isCancelled
                  ? "This order was cancelled."
                  : "Your delicious food is on its way"}
            </Text>
          </View>
        </View>

        {/* Restaurant Header Card */}
        <View style={styles.restaurantCard}>
          <View style={styles.restaurantRow}>
            <View style={styles.restaurantIcon}>
              <Ionicons name="restaurant" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[typography.bodyBold, styles.restaurantName]} numberOfLines={1}>
                {restaurant?.name ?? "Restaurant"}
              </Text>
              <Text style={[typography.caption, styles.restaurantAddress]} numberOfLines={1}>
                {restaurant?.address ?? "Nearby Restaurant"}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.sectionBlock}>
          <Text style={[typography.captionBold, styles.sectionLabel]}>
            ORDER TIMELINE
          </Text>
          <OrderStatusTimeline
            currentStatus={order.status as OrderStatus}
            statusHistory={(order as { statusHistory?: OrderStatusHistory[] }).statusHistory}
          />
        </View>

        {/* Delivery Partner Details (if assigned) */}
        {delivery?.partner && (
          <View style={styles.sectionBlock}>
            <Text style={[typography.captionBold, styles.sectionLabel]}>
              DELIVERY PARTNER
            </Text>
            <DeliveryPartnerCard
              fullName={delivery.partner.fullName}
              avatarUrl={delivery.partner.avatarUrl}
              vehicleType={delivery.partner.vehicleType}
            />
          </View>
        )}

        {/* Order Items Card */}
        <View style={styles.itemsCard}>
          <Text style={[typography.captionBold, styles.itemsHeader]}>
            ORDER SUMMARY ({order.items?.length ?? 0} ITEMS)
          </Text>

          {order.items?.map((item, index) => {
            const foodName =
              foodsData?.foods.find((f) => f.id === item.foodId)?.name ??
              `Item #${item.foodId.slice(0, 4)}`;
            return (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  index < (order.items?.length ?? 0) - 1 && styles.itemBorder,
                ]}
              >
                <Text style={[typography.body, styles.itemName]} numberOfLines={1}>
                  {foodName} × {item.quantity}
                </Text>
                <Text style={[typography.bodyBold, styles.itemPrice]}>
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </Text>
              </View>
            );
          })}

          <View style={styles.totalRow}>
            <Text style={[typography.bodyBold, styles.totalLabel]}>Total Paid</Text>
            <Text style={[typography.h3, styles.totalAmount]}>
              ${Number(order.grandTotal).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Cancel Button */}
        {isCancellable && (
          <View style={styles.actionBlock}>
            <Button
              title="Cancel Order"
              variant="outline"
              onPress={handleCancel}
              loading={cancelOrder.isPending}
              textStyle={{ color: colors.error }}
              style={{ borderColor: colors.error }}
            />
          </View>
        )}

        {/* Review Button */}
        {isDelivered && (
          <View style={styles.actionBlock}>
            <Button
              title="Write a Restaurant Review ⭐"
              onPress={() =>
                router.push({
                  pathname: "/review",
                  params: {
                    restaurantId: order.restaurantId,
                    restaurantName: restaurant?.name ?? "",
                  },
                })
              }
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Header({
  onBack,
  title,
}: {
  onBack: () => void;
  title: string;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[typography.h3, styles.headerTitle]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  backBtn: {
    marginRight: 12,
    padding: 2,
  },
  headerTitle: {
    color: colors.textPrimary,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  statusIconActive: {
    backgroundColor: colors.primary,
  },
  statusIconDelivered: {
    backgroundColor: "#2E7D32",
  },
  statusIconCancelled: {
    backgroundColor: colors.error,
  },
  statusBannerText: {
    flex: 1,
  },
  statusHeadline: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  statusSubtext: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  restaurantCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  restaurantRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  restaurantName: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  restaurantAddress: {
    color: colors.textSecondary,
    marginTop: 1,
  },
  sectionBlock: {
    marginTop: 16,
  },
  sectionLabel: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  itemsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  itemsHeader: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F4F5F7",
  },
  itemName: {
    color: colors.textPrimary,
    flex: 1,
  },
  itemPrice: {
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ECEEF1",
    marginTop: 10,
    paddingTop: 10,
  },
  totalLabel: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  totalAmount: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  actionBlock: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    color: colors.textPrimary,
    marginTop: 12,
  },
});
