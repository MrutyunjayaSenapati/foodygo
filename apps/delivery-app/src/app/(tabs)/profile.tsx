import { View, Text, ScrollView, Alert, TextInput as RNTextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../lib/api-client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorRetry } from "../../components/ui/ErrorRetry";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { useAuthStore } from "../../store/auth-store";
import { useLogout } from "../../hooks/use-auth";
import type { DeliveryPartnerProfile } from "../../types";

const VEHICLE_OPTIONS = ["BIKE", "SCOOTER", "CAR"] as const;

interface PartnerStats {
  totalDeliveries: number;
  totalEarnings: number;
  thisWeekDeliveries: number;
  thisWeekEarnings: number;
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [vehicleType, setVehicleType] = useState<string>("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const { data: partner, isLoading, isError, refetch } = useQuery({
    queryKey: ["partner-profile"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/partners/me");
      return res.data.data as DeliveryPartnerProfile;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["partner-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/stats");
      return res.data.data as PartnerStats;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { vehicleType?: string; licenseNumber?: string }) => {
      const res = await apiClient.patch(`/delivery/partners/${partner!.id}`, data);
      return res.data.data as DeliveryPartnerProfile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["partner-profile"], data);
      setEditing(false);
      Alert.alert("Success", "Profile updated");
    },
    onError: (err: any) => {
      Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed to update profile");
    },
  });

  const startEditing = () => {
    setVehicleType(partner?.vehicleType ?? "BIKE");
    setLicenseNumber(partner?.licenseNumber ?? "");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const saveProfile = () => {
    const changes: { vehicleType?: string; licenseNumber?: string } = {};
    if (vehicleType !== partner?.vehicleType) changes.vehicleType = vehicleType;
    if (licenseNumber !== partner?.licenseNumber) changes.licenseNumber = licenseNumber;
    if (Object.keys(changes).length === 0) {
      setEditing(false);
      return;
    }
    updateMutation.mutate(changes);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout.mutate() },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.background, gap: spacing.md }}>
        <Card>
          <Skeleton height={60} width={60} borderRadius={30} />
          <Skeleton height={20} width="50%" style={{ marginTop: spacing.sm }} />
          <Skeleton height={14} width="40%" style={{ marginTop: spacing.xs }} />
        </Card>
        <Skeleton height={100} borderRadius={12} />
        <Skeleton height={80} borderRadius={12} />
      </View>
    );
  }

  if (isError) {
    return <ErrorRetry message="Failed to load profile" onRetry={refetch} />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["6xl"] }}
    >
      <Card>
        <View style={{ alignItems: "center", gap: spacing.sm }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>
            {user?.fullName ?? partner?.fullName}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {user?.email ?? partner?.email}
          </Text>
        </View>
      </Card>

      {partner && (
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
              Vehicle Information
            </Text>
            {!editing && (
              <TouchableOpacity onPress={startEditing} style={{ padding: spacing.xs }}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          {editing ? (
            <View style={{ gap: spacing.md }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Vehicle Type</Text>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                {VEHICLE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setVehicleType(opt)}
                    style={{
                      flex: 1,
                      paddingVertical: spacing.sm,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: vehicleType === opt ? colors.primary : colors.border,
                      backgroundColor: vehicleType === opt ? colors.primary + "10" : colors.surface,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: vehicleType === opt ? colors.primary : colors.textSecondary,
                      }}
                    >
                      {opt.charAt(0) + opt.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm }}>License Number</Text>
              <RNTextInput
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                placeholder="Enter license number"
                placeholderTextColor={colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  fontSize: 14,
                  color: colors.text,
                  backgroundColor: colors.surface,
                }}
              />
              <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
                <Button title="Cancel" variant="outline" onPress={cancelEditing} style={{ flex: 1 }} />
                <Button
                  title="Save"
                  onPress={saveProfile}
                  loading={updateMutation.isPending}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>Type</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                  {partner.vehicleType}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>License</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                  {partner.licenseNumber}
                </Text>
              </View>
            </View>
          )}
        </Card>
      )}

      {stats && (
        <Card>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: spacing.md }}>
            Earnings
          </Text>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <View style={{ flex: 1, alignItems: "center", padding: spacing.md, backgroundColor: colors.success + "10", borderRadius: 12 }}>
              <Text style={{ fontSize: 22, fontWeight: "700", color: colors.success }}>
                ${Number(stats.totalEarnings).toFixed(0)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs }}>
                Total Earned
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: "center", padding: spacing.md, backgroundColor: colors.primary + "10", borderRadius: 12 }}>
              <Text style={{ fontSize: 22, fontWeight: "700", color: colors.primary }}>
                {stats.totalDeliveries}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs }}>
                Deliveries
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.sm }}>
            <View style={{ flex: 1, alignItems: "center", paddingVertical: spacing.sm }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
                ${Number(stats.thisWeekEarnings).toFixed(0)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>This Week</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center", paddingVertical: spacing.sm }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
                {stats.thisWeekDeliveries}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>This Week</Text>
            </View>
          </View>
        </Card>
      )}

      <Card>
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: spacing.md }}>
          Account
        </Text>
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>Role</Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
              Delivery Partner
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>User ID</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
              {user?.id.slice(0, 12)}...
            </Text>
          </View>
        </View>
      </Card>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        style={{ marginTop: spacing.lg, borderColor: colors.error }}
      />
    </ScrollView>
  );
}
