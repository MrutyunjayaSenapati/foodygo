import { View, Text, FlatList, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../lib/api-client";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorRetry } from "../../components/ui/ErrorRetry";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import type { DeliveryAssignment } from "../../types";

export default function HistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/assignments/my");
      return res.data.data as DeliveryAssignment[];
    },
    select: (assignments) =>
      assignments.filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED"),
    refetchInterval: 30000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.background, gap: spacing.md }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <Skeleton height={20} width="50%" />
            <Skeleton height={14} width="30%" style={{ marginTop: spacing.sm }} />
          </Card>
        ))}
      </View>
    );
  }

  if (isError) {
    return <ErrorRetry message="Failed to load history" onRetry={refetch} />;
  }

  const history = data ?? [];

  if (history.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          title="No delivery history"
          description="Your completed deliveries will appear here"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                Order #{item.orderId.slice(0, 8)}
              </Text>
              <StatusBadge status={item.status} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm }}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                {item.completedAt
                  ? new Date(item.completedAt).toLocaleDateString()
                  : new Date(item.assignedAt).toLocaleDateString()}
              </Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}
