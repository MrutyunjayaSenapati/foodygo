import { View, Text, FlatList, RefreshControl, Alert } from "react-native";
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

export default function AvailableScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["available-deliveries"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/assignments/available");
      return res.data.data as AvailableDeliveryItem[];
    },
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
    onError: (err: any) => {
      Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed to accept");
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.background, gap: spacing.md }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <Skeleton height={20} width="60%" />
            <Skeleton height={14} width="40%" style={{ marginTop: spacing.sm }} />
            <Skeleton height={14} width="80%" style={{ marginTop: spacing.xs }} />
          </Card>
        ))}
      </View>
    );
  }

  if (isError) {
    return <ErrorRetry message="Failed to load deliveries" onRetry={refetch} />;
  }

  const deliveries = data ?? [];

  if (deliveries.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          title="No deliveries available"
          description="Check back later for new delivery requests"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, flex: 1 }}>
                {item.restaurant.name}
              </Text>
              <StatusBadge status={item.status} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm }}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }} numberOfLines={1}>
                {item.restaurant.address}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm }}>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>
                {item.order.itemCount} item{item.order.itemCount !== 1 ? "s" : ""}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.success }}>
                ${Number(item.order.deliveryFee).toFixed(2)}
              </Text>
            </View>
            <Button
              title="Accept"
              onPress={() => acceptMutation.mutate(item.id)}
              loading={acceptMutation.isPending}
              size="sm"
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        )}
      />
    </View>
  );
}
