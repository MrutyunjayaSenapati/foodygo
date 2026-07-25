import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOrdersList } from "../../src/hooks/use-orders-list";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Button } from "../../src/components/ui/Button";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import type { OrderListItem } from "../../src/hooks/use-orders-list";

const STATUS_COLORS: Record<string, string> = {
  PENDING: colors.warning,
  RESTAURANT_ACCEPTED: colors.info,
  PREPARING: colors.primary,
  READY_FOR_PICKUP: colors.primary,
  PICKED_UP: colors.info,
  OUT_FOR_DELIVERY: colors.success,
  DELIVERED: colors.success,
  CANCELLED: colors.error,
};

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useOrdersList();

  const orders = data?.pages.flatMap((page) => page.items) ?? [];

  const handleOrderPress = useCallback((orderId: string) => {
    router.push(`/order/${orderId}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: OrderListItem }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleOrderPress(item.id)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: spacing.md,
          backgroundColor: colors.surface,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.sm,
          borderRadius: 12,
        }}
      >
        {item.restaurantLogo ? (
          <Image
            source={{ uri: item.restaurantLogo }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: colors.border,
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: colors.primaryBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="storefront-outline" size={24} color={colors.primary} />
          </View>
        )}

        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text
            style={[typography.bodyBold, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {item.restaurantName ?? "Order"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {new Date(item.createdAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: colors.textTertiary,
                marginHorizontal: 6,
              }}
            />
            <Text style={[typography.captionBold, { color: colors.textPrimary }]}>
              ${Number(item.grandTotal).toFixed(2)}
            </Text>
          </View>
        </View>

        <StatusBadge status={item.status} />
      </TouchableOpacity>
    ),
    [handleOrderPress],
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={{ padding: spacing.lg }}>
          <Skeleton width="100%" height={64} />
        </View>
      );
    }
    return <View style={{ height: spacing["6xl"] }} />;
  }, [isFetchingNextPage]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <View style={{ paddingTop: spacing["5xl"], gap: spacing.sm }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ paddingHorizontal: spacing.lg }}>
              <Skeleton width="100%" height={64} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <EmptyState
          title="Something went wrong"
          description="Could not load your orders"
          action={
            <Button title="Try Again" onPress={() => refetch()} variant="outline" />
          }
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Text style={[typography.h2, { color: colors.textPrimary }]}>Your Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            title="No orders yet"
            description="Browse restaurants and place your first order"
            action={
              <Button
                title="Browse Restaurants"
                onPress={() => router.replace("/(tabs)/home")}
              />
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={
          orders.length === 0 ? { flex: 1 } : undefined
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: (STATUS_COLORS[status] ?? colors.textTertiary) + "20",
      }}
    >
      <Text
        style={[
          typography.captionBold,
          { color: STATUS_COLORS[status] ?? colors.textTertiary },
        ]}
      >
        {status === "RESTAURANT_ACCEPTED"
          ? "Accepted"
          : status === "OUT_FOR_DELIVERY"
            ? "Out for Delivery"
            : status === "READY_FOR_PICKUP"
              ? "Ready"
              : status === "PICKED_UP"
                ? "Picked Up"
                : status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")}
      </Text>
    </View>
  );
}
