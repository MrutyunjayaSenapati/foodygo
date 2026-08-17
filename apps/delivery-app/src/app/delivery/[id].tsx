import { View, Text, ScrollView, Alert, Linking, Image, TouchableOpacity } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../lib/api-client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorRetry } from "../../components/ui/ErrorRetry";
import { colors } from "../../constants/colors";
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
  const insets = useSafeAreaInsets();
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
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) =>
      Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed to mark as picked up"),
  });

  const completeMutation = useMutation({
    mutationFn: () => apiClient.post(`/delivery/assignments/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment", id] });
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      Alert.alert("Success", "Delivery completed!");
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) =>
      Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed to complete delivery"),
  });

  const openPhone = (phone?: string | null) => {
    if (!phone) {
      Alert.alert("Notice", "Phone number not available");
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("Error", "Could not open phone dialer");
    });
  };

  const openDirections = (address: string) => {
    const query = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {
      Alert.alert("Error", "Could not open map navigation");
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 16, paddingHorizontal: 16, gap: 14 }}>
        <Skeleton height={28} width="60%" />
        <Skeleton height={120} width="100%" borderRadius={16} />
        <Skeleton height={100} width="100%" borderRadius={16} />
        <Skeleton height={140} width="100%" borderRadius={16} />
      </View>
    );
  }

  if (isError || !assignment) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ErrorRetry message="Failed to load delivery details" onRetry={refetch} />
      </View>
    );
  }

  const statusIndex = ["ASSIGNED", "ACCEPTED", "PICKED_UP", "COMPLETED"].indexOf(assignment.status);
  const isCancelled = assignment.status === "CANCELLED";
  const timelineStatuses = isCancelled
    ? [...["ASSIGNED", "ACCEPTED", "PICKED_UP", "COMPLETED"].slice(0, Math.max(0, statusIndex)), "CANCELLED"]
    : ["ASSIGNED", "ACCEPTED", "PICKED_UP", "COMPLETED"];

  const fullDeliveryAddress = [
    assignment.deliveryAddress.addressLine1,
    assignment.deliveryAddress.addressLine2,
    assignment.deliveryAddress.city,
    assignment.deliveryAddress.state,
    assignment.deliveryAddress.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      {/* Top Navigation Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surfaceAlt,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
            Order #{assignment.orderId.slice(0, 8).toUpperCase()}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>
            {new Date(assignment.assignedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>

        <StatusBadge status={assignment.status} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14 }}
      >
        {/* Restaurant Card */}
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Pickup Location
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {assignment.restaurant.phone && (
                <TouchableOpacity
                  onPress={() => openPhone(assignment.restaurant.phone)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: colors.surfaceAlt,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="call" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => openDirections(assignment.restaurant.address)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: colors.primaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="navigate" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            {assignment.restaurant.logoUrl ? (
              <Image
                source={{ uri: assignment.restaurant.logoUrl }}
                style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colors.surfaceAlt }}
              />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.primaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="restaurant" size={22} color={colors.primary} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
                {assignment.restaurant.name}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                {assignment.restaurant.address}
              </Text>
            </View>
          </View>
        </Card>

        {/* Customer & Delivery Address Card */}
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Drop-off Destination
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {assignment.customer.phone && (
                <TouchableOpacity
                  onPress={() => openPhone(assignment.customer.phone)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: colors.surfaceAlt,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="call" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => openDirections(fullDeliveryAddress)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: colors.primaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="navigate" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.surfaceAlt,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="person" size={18} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                  {assignment.customer.fullName}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>Customer</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start", marginTop: 4 }}>
              <Ionicons name="location" size={18} color={colors.primary} style={{ marginTop: 2 }} />
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20, flex: 1 }}>
                {fullDeliveryAddress}
              </Text>
            </View>
          </View>
        </Card>

        {/* Order Items Breakdown */}
        <Card>
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
            Order Items ({assignment.items.length})
          </Text>
          {assignment.items.map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderLight,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.surfaceAlt }}
                  />
                ) : (
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: colors.surfaceAlt,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="fast-food-outline" size={18} color={colors.textSecondary} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                    x{item.quantity} @ ${Number(item.price).toFixed(2)}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Bill summary */}
          <View style={{ marginTop: 12, gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Delivery Fee</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                ${Number(assignment.order.deliveryFee).toFixed(2)}
              </Text>
            </View>
            {assignment.order.tip > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Tip</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.success }}>
                  +${Number(assignment.order.tip).toFixed(2)}
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
                paddingTop: 10,
                marginTop: 6,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>Order Grand Total</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>
                ${Number(assignment.order.grandTotal).toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Status Timeline Card */}
        <Card>
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>
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
              <View key={status} style={{ flexDirection: "row", minHeight: 44 }}>
                <View style={{ alignItems: "center", width: 24 }}>
                  {isCancelledStep ? (
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
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
                        width: 18,
                        height: 18,
                        borderRadius: 9,
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
                        width: 18,
                        height: 18,
                        borderRadius: 9,
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
                        width: 18,
                        height: 18,
                        borderRadius: 9,
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
                <View style={{ flex: 1, paddingLeft: 12, paddingBottom: 10 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isCurrent || isCompleted ? "700" : "500",
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
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>{time}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      {(assignment.status === "ACCEPTED" || assignment.status === "PICKED_UP") && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {assignment.status === "ACCEPTED" && (
            <Button
              title="Confirm Pickup from Restaurant"
              icon={<Ionicons name="bag-check-outline" size={20} color="#FFFFFF" />}
              onPress={() => pickupMutation.mutate()}
              loading={pickupMutation.isPending}
              size="lg"
            />
          )}
          {assignment.status === "PICKED_UP" && (
            <Button
              title="Complete Delivery to Customer"
              icon={<Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />}
              onPress={() => completeMutation.mutate()}
              loading={completeMutation.isPending}
              variant="success"
              size="lg"
            />
          )}
        </View>
      )}
    </View>
  );
}
