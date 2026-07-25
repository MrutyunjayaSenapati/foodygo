import { View, Text, ScrollView, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../lib/api-client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorRetry } from "../../components/ui/ErrorRetry";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import type { DeliveryAssignmentDetail } from "../../types";

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: "Order Placed",
  ACCEPTED: "Accepted by Partner",
  PICKED_UP: "Picked Up from Restaurant",
  COMPLETED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: assignment, isLoading, isError, refetch } = useQuery({
    queryKey: ["assignment", id],
    queryFn: async () => {
      const res = await apiClient.get(`/delivery/assignments/${id}`);
      return res.data.data as DeliveryAssignmentDetail;
    },
    enabled: !!id,
  });

  const pickupMutation = useMutation({
    mutationFn: () => apiClient.post(`/delivery/assignments/${id}/pickup`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment", id] });
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      Alert.alert("Success", "Marked as picked up");
    },
    onError: (err: any) =>
      Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed to mark as picked up"),
  });

  const completeMutation = useMutation({
    mutationFn: () => apiClient.post(`/delivery/assignments/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment", id] });
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      Alert.alert("Success", "Delivery completed!");
    },
    onError: (err: any) =>
      Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed to complete delivery"),
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
        <Skeleton height={24} width="60%" />
        <Skeleton height={100} width="100%" style={{ marginTop: spacing.md }} />
        <Skeleton height={80} width="100%" style={{ marginTop: spacing.md }} />
        <Skeleton height={120} width="100%" style={{ marginTop: spacing.md }} />
      </View>
    );
  }

  if (isError || !assignment) {
    return <ErrorRetry message="Failed to load delivery details" onRetry={refetch} />;
  }

  const statusIndex = ["ASSIGNED", "ACCEPTED", "PICKED_UP", "COMPLETED"].indexOf(assignment.status);
  const isCancelled = assignment.status === "CANCELLED";
  const timelineStatuses = isCancelled
    ? [...["ASSIGNED", "ACCEPTED", "PICKED_UP", "COMPLETED"].slice(0, Math.max(0, statusIndex)), "CANCELLED"]
    : ["ASSIGNED", "ACCEPTED", "PICKED_UP", "COMPLETED"];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["6xl"], gap: spacing.md }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
          Order #{assignment.orderId.slice(0, 8).toUpperCase()}
        </Text>
        <StatusBadge status={assignment.status} />
      </View>
      <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: spacing.xxs }}>
        Assigned {new Date(assignment.assignedAt).toLocaleString()}
      </Text>

      <Card>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: spacing.sm }}>
          Restaurant
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          {assignment.restaurant.logoUrl && (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: colors.shimmer,
              }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
              {assignment.restaurant.name}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: spacing.xxs }}>
              {assignment.restaurant.address}
            </Text>
            {assignment.restaurant.phone && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs }}>
                <Ionicons name="call-outline" size={12} color={colors.textMuted} />
                <Text style={{ fontSize: 12, color: colors.textMuted }}>{assignment.restaurant.phone}</Text>
              </View>
            )}
          </View>
        </View>
      </Card>

      <Card>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: spacing.sm }}>
          Delivery Address
        </Text>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm }}>
          <Ionicons name="location-outline" size={16} color={colors.primary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
              {assignment.deliveryAddress.addressLine1}
              {assignment.deliveryAddress.addressLine2 ? `, ${assignment.deliveryAddress.addressLine2}` : ""}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {assignment.deliveryAddress.city}, {assignment.deliveryAddress.state}{" "}
              {assignment.deliveryAddress.postalCode}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: spacing.sm }}>
          Order Items ({assignment.items.length})
        </Text>
        {assignment.items.map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              paddingVertical: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {item.imageUrl && (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  backgroundColor: colors.shimmer,
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: spacing.xxs }}>
                x{item.quantity} @ ${Number(item.price).toFixed(2)}
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
              ${(Number(item.price) * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Delivery Fee</Text>
            <Text style={{ fontSize: 13, color: colors.text }}>
              ${Number(assignment.order.deliveryFee).toFixed(2)}
            </Text>
          </View>
          {assignment.order.tip > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Tip</Text>
              <Text style={{ fontSize: 13, color: colors.text }}>
                ${Number(assignment.order.tip).toFixed(2)}
              </Text>
            </View>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: spacing.xs,
              marginTop: spacing.xs,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>Total</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.primary }}>
              ${Number(assignment.order.grandTotal).toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: spacing.sm }}>
          Customer
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.shimmer,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person-outline" size={18} color={colors.textMuted} />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>
              {assignment.customer.fullName}
            </Text>
            {assignment.customer.phone && (
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{assignment.customer.phone}</Text>
            )}
          </View>
        </View>
      </Card>

      <Card>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: spacing.md }}>
          Status Timeline
        </Text>
        {timelineStatuses.map((status, index) => {
          const isCompleted = statusIndex >= index && !isCancelled;
          const isCurrent = status === assignment.status;
          const isCancelledStep = status === "CANCELLED";
          const historyEntry = assignment.statusHistory.find((h) => h.status === status);
          const time = historyEntry?.createdAt
            ? new Date(historyEntry.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined;

          return (
            <View key={status} style={{ flexDirection: "row", minHeight: 48 }}>
              <View style={{ alignItems: "center", width: 28 }}>
                {isCancelledStep ? (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: colors.error,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="close" size={12} color="#fff" />
                  </View>
                ) : isCurrent ? (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: colors.primary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" }} />
                  </View>
                ) : isCompleted ? (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: colors.success,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                ) : (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: colors.border,
                    }}
                  />
                )}
                {index < timelineStatuses.length - 1 && (
                  <View
                    style={{
                      width: 2,
                      flex: 1,
                      backgroundColor:
                        isCompleted && !isCancelledStep
                          ? colors.success
                          : isCurrent
                            ? colors.primary
                            : colors.border,
                      marginVertical: 2,
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1, paddingLeft: spacing.md, paddingBottom: spacing.sm }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isCurrent || isCompleted ? "600" : "400",
                    color: isCancelledStep
                      ? colors.error
                      : isCompleted || isCurrent
                        ? colors.text
                        : colors.textMuted,
                  }}
                >
                  {STATUS_LABELS[status] ?? status}
                </Text>
                {time && (
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{time}</Text>
                )}
              </View>
            </View>
          );
        })}
      </Card>

      {(assignment.status === "ACCEPTED" || assignment.status === "PICKED_UP") && (
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {assignment.status === "ACCEPTED" && (
            <Button
              title="Mark as Picked Up"
              onPress={() => pickupMutation.mutate()}
              loading={pickupMutation.isPending}
            />
          )}
          {assignment.status === "PICKED_UP" && (
            <Button
              title="Mark as Delivered"
              onPress={() => completeMutation.mutate()}
              loading={completeMutation.isPending}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}
