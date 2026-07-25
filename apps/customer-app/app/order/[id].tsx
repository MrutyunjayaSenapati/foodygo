import { useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CANCELLABLE_STATUSES } from "@foodygo/shared-constants";
import type { OrderStatus, OrderStatusHistory } from "@foodygo/shared-types";
import { useOrder, useDeliveryInfo, useCancelOrder } from "../../src/hooks/use-order-tracking";
import { useRestaurantDetail } from "../../src/hooks/use-restaurants";
import { OrderStatusTimeline } from "../../src/components/order-status-timeline";
import { DeliveryPartnerCard } from "../../src/components/delivery-partner-card";
import { Button } from "../../src/components/ui/Button";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const { data: order, isLoading, error } = useOrder(id ?? "");
  const { data: delivery } = useDeliveryInfo(id ?? "");
  const cancelOrder = useCancelOrder();
  const { data: restaurant } = useRestaurantDetail(order?.restaurantId ?? "");

  const isCancellable = order && CANCELLABLE_STATUSES.includes(order.status as typeof CANCELLABLE_STATUSES[number]);
  const isDelivered = order?.status === "DELIVERED";

  useEffect(() => {
    if (isDelivered) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(confettiAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isDelivered, confettiAnim]);

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
            } catch {
              Alert.alert("Error", "Failed to cancel order.");
            }
          },
        },
      ],
    );
  }, [cancelOrder, id]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <Header onBack={() => router.back()} title="Order Details" />
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton width="60%" height={24} />
          <Skeleton width="100%" height={200} />
          <Skeleton width="100%" height={80} />
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <Header onBack={() => router.back()} title="Order" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: spacing["3xl"] }}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.md }]}>
            Order not found
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <Header
        onBack={() => router.back()}
        title={`Order #${order.id.slice(0, 8)}`}
      />

      {isDelivered && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: confettiAnim,
            zIndex: 10,
          }}
        >
          <Ionicons
            name="star"
            size={200}
            color={colors.primary}
            style={{ position: "absolute", top: 100, left: 20, opacity: 0.3 }}
          />
          <Ionicons
            name="checkmark-circle"
            size={150}
            color={colors.success}
            style={{ position: "absolute", top: 200, right: 30, opacity: 0.3 }}
          />
          <Ionicons
            name="star-half"
            size={180}
            color={colors.rating}
            style={{ position: "absolute", bottom: 200, left: 50, opacity: 0.2 }}
          />
        </Animated.View>
      )}

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            {restaurant?.name ?? "Restaurant"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <StatusBadge status={order.status} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
              {new Date(order.createdAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Text style={[typography.h4, { color: colors.textPrimary, paddingHorizontal: spacing.lg }]}>
            Order Status
          </Text>
          <OrderStatusTimeline
            currentStatus={order.status as OrderStatus}
            statusHistory={(order as { statusHistory?: OrderStatusHistory[] }).statusHistory}
          />
        </View>

        {delivery?.partner && (
          <View style={{ marginTop: spacing.sm }}>
            <Text style={[typography.h4, { color: colors.textPrimary, paddingHorizontal: spacing.lg }]}>
              Delivery Partner
            </Text>
            <DeliveryPartnerCard
              fullName={delivery.partner.fullName}
              avatarUrl={delivery.partner.avatarUrl}
              vehicleType={delivery.partner.vehicleType}
            />
          </View>
        )}

        <View
          style={{
            marginHorizontal: spacing.lg,
            marginTop: spacing.lg,
            padding: spacing.md,
            borderRadius: 12,
            backgroundColor: colors.surface,
          }}
        >
          <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            Items
          </Text>
          {order.items?.map((item, index) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
                borderBottomWidth: index < (order.items?.length ?? 0) - 1 ? 1 : 0,
                borderBottomColor: colors.borderLight,
              }}
            >
              <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                {item.foodId.slice(0, 8)} x{item.quantity}
              </Text>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm }}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary, textAlign: "right" }]}>
              Total: ${Number(order.grandTotal).toFixed(2)}
            </Text>
          </View>
        </View>

        {isCancellable && (
          <View style={{ padding: spacing.lg }}>
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

        {isDelivered && (
          <View style={{ padding: spacing.lg }}>
            <Button
              title="Write a Review"
              onPress={() =>
                router.push({
                  pathname: "/review",
                  params: { restaurantId: order.restaurantId, restaurantName: restaurant?.name ?? "" },
                })
              }
            />
          </View>
        )}

        <View style={{ height: spacing["6xl"] }} />
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
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Ionicons
        name="arrow-back"
        size={24}
        color={colors.textPrimary}
        onPress={onBack}
      />
      <Text
        style={[
          typography.h3,
          { color: colors.textPrimary, marginLeft: spacing.md, flex: 1 },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    PENDING: colors.warning,
    RESTAURANT_ACCEPTED: colors.info,
    PREPARING: colors.primary,
    READY_FOR_PICKUP: colors.primary,
    PICKED_UP: colors.info,
    OUT_FOR_DELIVERY: colors.success,
    DELIVERED: colors.success,
    CANCELLED: colors.error,
  };

  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: (colorMap[status] ?? colors.textTertiary) + "20",
      }}
    >
      <Text
        style={[
          typography.captionBold,
          { color: colorMap[status] ?? colors.textTertiary },
        ]}
      >
        {status.replace(/_/g, " ")}
      </Text>
    </View>
  );
}
