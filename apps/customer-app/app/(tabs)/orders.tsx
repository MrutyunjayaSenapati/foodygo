import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOrdersList, OrderListItem } from "../../src/hooks/use-orders-list";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Button } from "../../src/components/ui/Button";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending Approval", color: "#E65100", bg: "#FFF3E0" },
  RESTAURANT_ACCEPTED: { label: "Accepted", color: "#0288D1", bg: "#E1F5FE" },
  PREPARING: { label: "Food Preparing", color: "#FF6B35", bg: "#FFF0EB" },
  READY_FOR_PICKUP: { label: "Ready for Pickup", color: "#7B1FA2", bg: "#F3E5F5" },
  PICKED_UP: { label: "Picked Up", color: "#0288D1", bg: "#E1F5FE" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "#2E7D32", bg: "#E8F5E9" },
  DELIVERED: { label: "Delivered", color: "#2E7D32", bg: "#E8F5E9" },
  CANCELLED: { label: "Cancelled", color: "#C62828", bg: "#FFEBEE" },
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
    ({ item }: { item: OrderListItem }) => {
      const config = STATUS_CONFIG[item.status] || {
        label: item.status,
        color: colors.textSecondary,
        bg: "#F4F5F7",
      };
      const isActive = !["DELIVERED", "CANCELLED"].includes(item.status);

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleOrderPress(item.id)}
          style={styles.orderCard}
        >
          {/* Card Top Row */}
          <View style={styles.cardHeader}>
            <View style={styles.restaurantRow}>
              {item.restaurantLogo ? (
                <Image
                  source={{ uri: item.restaurantLogo }}
                  style={styles.restaurantThumb}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <View style={styles.defaultThumb}>
                  <Ionicons name="restaurant" size={20} color={colors.primary} />
                </View>
              )}

              <View style={styles.restaurantInfo}>
                <Text
                  style={[typography.bodyBold, styles.restaurantName]}
                  numberOfLines={1}
                >
                  {item.restaurantName ?? "Restaurant Order"}
                </Text>
                <Text style={[typography.caption, styles.dateText]}>
                  {new Date(item.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
              <Text style={[typography.captionBold, { color: config.color, fontSize: 10 }]}>
                {config.label}
              </Text>
            </View>
          </View>

          {/* Card Mid Divider */}
          <View style={styles.cardDivider} />

          {/* Amount & Items Row */}
          <View style={styles.metaRow}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              Order ID: #{item.id.slice(0, 8)}
            </Text>
            <Text style={[typography.bodyBold, styles.totalAmount]}>
              ${Number(item.grandTotal).toFixed(2)}
            </Text>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => handleOrderPress(item.id)}
              style={[styles.actionBtn, isActive ? styles.activeTrackBtn : styles.detailsBtn]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  typography.captionBold,
                  isActive ? styles.activeTrackText : styles.detailsText,
                ]}
              >
                {isActive ? "Track Live Order 🛵" : "View Order Details →"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [handleOrderPress],
  );

  if (isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>Your Orders</Text>
        </View>
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton width="100%" height={120} />
          <Skeleton width="100%" height={120} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
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
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.textPrimary }]}>Your Orders</Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {orders.length} Total Orders
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No orders placed yet"
            description="Explore our top-rated restaurants and order delicious food today!"
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
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  restaurantRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  restaurantThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  defaultThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  restaurantInfo: {
    marginLeft: 10,
    flex: 1,
  },
  restaurantName: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  dateText: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F4F5F7",
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalAmount: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  actionRow: {
    marginTop: 10,
  },
  actionBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTrackBtn: {
    backgroundColor: colors.primaryBg,
  },
  activeTrackText: {
    color: colors.primary,
  },
  detailsBtn: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#ECEEF1",
  },
  detailsText: {
    color: colors.textSecondary,
  },
});
