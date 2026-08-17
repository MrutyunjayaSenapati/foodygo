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
import { useAuthStore } from "../../store/auth-store";

export default function HistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/assignments/my");
      return res.data.data as DeliveryAssignment[];
    },
    select: (assignments) =>
      assignments.filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED"),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const history = data ?? [];
  const completedCount = history.filter((h) => h.status === "COMPLETED").length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* History Summary Banner */}
      <View
        style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
            Past Deliveries
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
            Your lifetime delivery track record
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.successBg,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: colors.successBorder,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.success }}>
            {completedCount} Delivered
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <Skeleton height={20} width="50%" />
              <Skeleton height={14} width="30%" style={{ marginTop: spacing.sm }} />
            </Card>
          ))}
        </View>
      ) : isError ? (
        <ErrorRetry message="Failed to load history" onRetry={refetch} />
      ) : history.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No Delivery History"
          description="Your completed and delivered orders will be neatly cataloged here."
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
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
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: item.status === "COMPLETED" ? colors.successBg : colors.errorBg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={item.status === "COMPLETED" ? "checkmark-done-circle" : "close-circle"}
                      size={20}
                      color={item.status === "COMPLETED" ? colors.success : colors.error}
                    />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                      Order #{item.orderId.slice(0, 8).toUpperCase()}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        {item.completedAt
                          ? new Date(item.completedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                          : new Date(item.assignedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </Text>
                    </View>
                  </View>
                </View>
                <StatusBadge status={item.status} />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
