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
import { useAuthStore } from "../../store/auth-store";

export default function ActiveScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/assignments/my");
      return res.data.data as DeliveryAssignment[];
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const pickupMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/delivery/assignments/${id}/pickup`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      Alert.alert("Success", "Marked as picked up");
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) =>
      Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed"),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/delivery/assignments/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      Alert.alert("Success", "Delivery completed!");
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) =>
      Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed"),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const activeDeliveries = (data ?? []).filter(
    (a) => a.status === "ACCEPTED" || a.status === "PICKED_UP",
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Active Deliveries Header Banner */}
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
          <Ionicons name="navigate-circle" size={20} color={colors.primary} />
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
            IN PROGRESS
          </Text>
        </View>
        <View
          style={{
            backgroundColor: activeDeliveries.length > 0 ? colors.warningBg : colors.surfaceAlt,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 9999,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: activeDeliveries.length > 0 ? colors.warning : colors.textMuted,
            }}
          >
            {activeDeliveries.length} active
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <Skeleton height={20} width="50%" />
              <Skeleton height={14} width="70%" style={{ marginTop: spacing.sm }} />
              <Skeleton height={42} width="100%" borderRadius={9999} style={{ marginTop: 14 }} />
            </Card>
          ))}
        </View>
      ) : isError ? (
        <ErrorRetry message="Failed to load active deliveries" onRetry={refetch} />
      ) : activeDeliveries.length === 0 ? (
        <EmptyState
          icon="bicycle-outline"
          title="No Active Deliveries"
          description="You don't have any in-progress deliveries right now. Check available orders to accept a delivery."
          actionLabel="View Available Orders"
          onAction={() => router.push("/(tabs)/available")}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {activeDeliveries.map((assignment) => (
            <Card key={assignment.id}>
              {/* Order Header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: colors.primaryBg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="cube" size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
                      Order #{assignment.orderId.slice(0, 8).toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                      Assigned {new Date(assignment.assignedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </View>
                <StatusBadge status={assignment.status} />
              </View>

              {/* Progress Step Indicator */}
              <View
                style={{
                  backgroundColor: colors.surfaceAlt,
                  padding: 12,
                  borderRadius: 12,
                  marginTop: 14,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons
                    name={assignment.status === "PICKED_UP" ? "checkmark-circle" : "radio-button-on"}
                    size={16}
                    color={assignment.status === "PICKED_UP" ? colors.success : colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: assignment.status === "ACCEPTED" ? "700" : "500",
                      color: assignment.status === "ACCEPTED" ? colors.text : colors.textSecondary,
                    }}
                  >
                    Step 1: Pick up from restaurant
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons
                    name={assignment.status === "PICKED_UP" ? "radio-button-on" : "ellipse-outline"}
                    size={16}
                    color={assignment.status === "PICKED_UP" ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: assignment.status === "PICKED_UP" ? "700" : "500",
                      color: assignment.status === "PICKED_UP" ? colors.text : colors.textMuted,
                    }}
                  >
                    Step 2: Deliver to customer
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <Button
                  title="View Details"
                  icon={<Ionicons name="document-text-outline" size={16} color={colors.primary} />}
                  onPress={() => router.push(`/delivery/${assignment.id}`)}
                  variant="outline"
                  size="md"
                  style={{ flex: 1 }}
                />
                {assignment.status === "ACCEPTED" && (
                  <Button
                    title="Confirm Pickup"
                    icon={<Ionicons name="bag-check-outline" size={16} color="#FFFFFF" />}
                    onPress={() => pickupMutation.mutate(assignment.id)}
                    loading={pickupMutation.isPending}
                    size="md"
                    style={{ flex: 1 }}
                  />
                )}
                {assignment.status === "PICKED_UP" && (
                  <Button
                    title="Mark Delivered"
                    icon={<Ionicons name="checkmark-done" size={16} color="#FFFFFF" />}
                    onPress={() => completeMutation.mutate(assignment.id)}
                    loading={completeMutation.isPending}
                    variant="success"
                    size="md"
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
