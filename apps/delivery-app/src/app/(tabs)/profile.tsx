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
import { useAuthStore } from "../../store/auth-store";
import { useLogout } from "../../hooks/use-auth";
import type { DeliveryPartnerProfile } from "../../types";

const VEHICLE_OPTIONS = [
  { value: "BIKE", label: "Bike", icon: "bicycle" as const },
  { value: "SCOOTER", label: "Scooter", icon: "speedometer" as const },
  { value: "CAR", label: "Car", icon: "car-sport" as const },
] as const;

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

  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  const { data: partner, isLoading, isError, refetch } = useQuery({
    queryKey: ["partner-profile"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/partners/me");
      return res.data.data as DeliveryPartnerProfile;
    },
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery({
    queryKey: ["partner-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/stats");
      return res.data.data as PartnerStats;
    },
    enabled: isAuthenticated,
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
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) => {
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
      <View style={{ flex: 1, padding: 16, backgroundColor: colors.background, gap: 14 }}>
        <Card>
          <Skeleton height={64} width={64} borderRadius={32} />
          <Skeleton height={22} width="50%" style={{ marginTop: 12 }} />
          <Skeleton height={14} width="40%" style={{ marginTop: 6 }} />
        </Card>
        <Skeleton height={120} borderRadius={16} />
        <Skeleton height={100} borderRadius={16} />
      </View>
    );
  }

  if (isError) {
    return <ErrorRetry message="Failed to load profile" onRetry={refetch} />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
    >
      {/* Profile Header Card */}
      <Card>
        <View style={{ alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.primaryBg,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 3,
              borderColor: "#FFFFFF",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>
              {user?.fullName ?? partner?.fullName}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
              {user?.email ?? partner?.email}
            </Text>
          </View>

          {/* Badges */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: colors.successBg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: colors.successBorder,
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }} />
              <Text style={{ fontSize: 11, fontWeight: "700", color: colors.success }}>
                Active Partner
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: colors.warningBg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: colors.warningBorder,
              }}
            >
              <Ionicons name="star" size={12} color={colors.rating} />
              <Text style={{ fontSize: 11, fontWeight: "700", color: colors.warning }}>
                4.9 Rating
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Performance & Earnings Metric Cards Grid */}
      {stats && (
        <Card>
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Performance & Earnings
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {/* Total Earnings */}
            <View
              style={{
                flex: 1,
                padding: 14,
                backgroundColor: colors.successBg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.successBorder,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary }}>
                  Total Payout
                </Text>
                <Ionicons name="wallet-outline" size={16} color={colors.success} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: colors.success, marginTop: 6 }}>
                ${Number(stats.totalEarnings).toFixed(0)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                Lifetime
              </Text>
            </View>

            {/* Total Deliveries */}
            <View
              style={{
                flex: 1,
                padding: 14,
                backgroundColor: colors.primaryBg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#FFD5C2",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary }}>
                  Completed
                </Text>
                <Ionicons name="bicycle-outline" size={16} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "800", color: colors.primary, marginTop: 6 }}>
                {stats.totalDeliveries}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                Total trips
              </Text>
            </View>
          </View>

          {/* This Week summary */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.surfaceAlt,
              borderRadius: 12,
              paddingVertical: 10,
              marginTop: 10,
            }}
          >
            <View style={{ flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: colors.borderLight }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
                ${Number(stats.thisWeekEarnings).toFixed(0)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>This Week Earnings</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
                {stats.thisWeekDeliveries}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>This Week Trips</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Vehicle Information Card */}
      {partner && (
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Vehicle Information
            </Text>
            {!editing && (
              <TouchableOpacity
                onPress={startEditing}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: colors.primaryBg,
                }}
              >
                <Ionicons name="create-outline" size={14} color={colors.primary} />
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary }}>Select Vehicle</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {VEHICLE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setVehicleType(opt.value)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: vehicleType === opt.value ? colors.primary : colors.border,
                      backgroundColor: vehicleType === opt.value ? colors.primaryBg : colors.surface,
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={vehicleType === opt.value ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: vehicleType === opt.value ? colors.primary : colors.textSecondary,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary, marginTop: 4 }}>License Number</Text>
              <RNTextInput
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                placeholder="e.g. OD05AK6397"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                style={{
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.text,
                  backgroundColor: colors.surface,
                }}
              />
              <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                <Button title="Cancel" variant="outline" onPress={cancelEditing} size="sm" style={{ flex: 1 }} />
                <Button
                  title="Save Details"
                  onPress={saveProfile}
                  loading={updateMutation.isPending}
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }}
              >
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>Vehicle Type</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons
                    name={partner.vehicleType === "CAR" ? "car-sport" : partner.vehicleType === "SCOOTER" ? "speedometer" : "bicycle"}
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                    {partner.vehicleType}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>License Plate</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                  {partner.licenseNumber}
                </Text>
              </View>
            </View>
          )}
        </Card>
      )}

      {/* Account Info */}
      <Card>
        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
          Account Details
        </Text>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Role</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>Delivery Partner</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Partner ID</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{partner?.id?.slice(0, 14)}...</Text>
          </View>
        </View>
      </Card>

      {/* Logout Button */}
      <Button
        title="Log Out"
        icon={<Ionicons name="log-out-outline" size={18} color={colors.error} />}
        onPress={handleLogout}
        variant="ghost"
        style={{
          borderWidth: 1.5,
          borderColor: colors.errorBorder,
          backgroundColor: colors.errorBg,
        }}
      />
    </ScrollView>
  );
}
