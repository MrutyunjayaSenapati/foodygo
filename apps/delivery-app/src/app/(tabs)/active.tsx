import { View, Text, ScrollView, RefreshControl, Alert } from "react-native";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../../lib/api-client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorRetry } from "../../components/ui/ErrorRetry";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import type { DeliveryAssignment } from "../../types";

export default function ActiveScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/assignments/my");
      return res.data.data as DeliveryAssignment[];
    },
    refetchInterval: 30000,
  });

  const pickupMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/delivery/assignments/${id}/pickup`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      Alert.alert("Success", "Marked as picked up");
    },
    onError: (err: any) => Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed"),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/delivery/assignments/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      Alert.alert("Success", "Delivery completed!");
    },
    onError: (err: any) => Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed"),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const activeDeliveries = (data ?? []).filter(
    (a) => a.status === "ACCEPTED" || a.status === "PICKED_UP",
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.background, gap: spacing.md }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <Skeleton height={20} width="50%" />
            <Skeleton height={14} width="70%" style={{ marginTop: spacing.sm }} />
          </Card>
        ))}
      </View>
    );
  }

  if (isError) {
    return <ErrorRetry message="Failed to load active deliveries" onRetry={refetch} />;
  }

  if (activeDeliveries.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          title="No active deliveries"
          description="Accept available deliveries to get started"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {activeDeliveries.map((assignment) => (
          <Card key={assignment.id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
                Order #{assignment.orderId.slice(0, 8)}
              </Text>
              <StatusBadge status={assignment.status} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm }}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Assigned {new Date(assignment.assignedAt).toLocaleTimeString()}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }}>
              <Button
                title="View Details"
                onPress={() => router.push(`/delivery/${assignment.id}`)}
                variant="outline"
                size="sm"
                style={{ flex: 1 }}
              />
              {assignment.status === "ACCEPTED" && (
                <Button
                  title="Picked Up"
                  onPress={() => pickupMutation.mutate(assignment.id)}
                  loading={pickupMutation.isPending}
                  size="sm"
                  style={{ flex: 1 }}
                />
              )}
              {assignment.status === "PICKED_UP" && (
                <Button
                  title="Completed"
                  onPress={() => completeMutation.mutate(assignment.id)}
                  loading={completeMutation.isPending}
                  size="sm"
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
