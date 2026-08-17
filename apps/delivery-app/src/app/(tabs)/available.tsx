import { View, Text, FlatList, RefreshControl, Alert, Image } from "react-native";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../lib/api-client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorRetry } from "../../components/ui/ErrorRetry";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import type { AvailableDeliveryItem } from "../../types";
import { useAuthStore } from "../../store/auth-store";

export default function AvailableScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["available-deliveries"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/assignments/available");
      return res.data.data as AvailableDeliveryItem[];
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const acceptMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const item = data?.find((d) => d.id === assignmentId);
      await apiClient.post(`/delivery/assignments/${assignmentId}/accept`, {
        orderId: item?.orderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      Alert.alert("Success", "Delivery accepted!");
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
      Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed to accept");
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const deliveries = data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Duty Status Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.success,
            }}
          />
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
            ONLINE
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>•</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Accepting Orders
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.primaryBg,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.primary }}>
            {deliveries.length} available
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <Skeleton height={48} width={48} borderRadius={12} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton height={18} width="60%" />
                  <Skeleton height={13} width="85%" />
                </View>
              </View>
              <Skeleton height={14} width="40%" style={{ marginTop: 14 }} />
              <Skeleton height={42} width="100%" borderRadius={9999} style={{ marginTop: 12 }} />
            </Card>
          ))}
        </View>
      ) : isError ? (
        <ErrorRetry message="Failed to load deliveries" onRetry={refetch} />
      ) : deliveries.length === 0 ? (
        <EmptyState
          icon="bicycle-outline"
          title="Looking for Deliveries..."
          description="You are currently online. New orders in your zone will appear here in real-time."
          actionLabel="Refresh Orders"
          onAction={refetch}
        />
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <Card>
              {/* Header */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  {item.restaurant.logoUrl ? (
                    <Image
                      source={{ uri: item.restaurant.logoUrl }}
                      style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colors.surfaceAlt }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: colors.primaryBg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="restaurant" size={20} color={colors.primary} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }} numberOfLines={1}>
                      {item.restaurant.name}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <Ionicons name="location-sharp" size={13} color={colors.primary} />
                      <Text style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>
                        {item.restaurant.address}
                      </Text>
                    </View>
                  </View>
                </View>
                <StatusBadge status={item.status} />
              </View>

              {/* Order Info & Payout Chips */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: colors.surfaceAlt,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  marginTop: 14,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="bag-handle-outline" size={15} color={colors.textSecondary} />
                  <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                    {item.order.itemCount} item{item.order.itemCount !== 1 ? "s" : ""}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted }}>•</Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Order: ${Number(item.order.grandTotal || 0).toFixed(2)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Payout:</Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.success }}>
                    ${Number(item.order.deliveryFee || 5.00).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Accept Action */}
              <Button
                title="Accept Delivery"
                icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />}
                onPress={() => acceptMutation.mutate(item.id)}
                loading={acceptMutation.isPending}
                size="md"
                style={{ marginTop: 14 }}
              />
            </Card>
          )}
        />
      )}
    </View>
  );
}
