import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAddresses } from "../hooks/use-addresses";
import { useAuthStore } from "../store/auth-store";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";

export function LocationHeader() {
  const router = useRouter();
  const { data: addresses } = useAddresses();
  const user = useAuthStore((s) => s.user);
  const primaryAddress = addresses?.[0];

  const label = primaryAddress?.label || (user ? "Home" : "Deliver to");
  const addressText = primaryAddress
    ? `${primaryAddress.addressLine1}, ${primaryAddress.city}`
    : "Select delivery location";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => router.push(user ? "/addresses" : "/(auth)/login")}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="location-sharp" size={20} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.labelRow}>
            <Text style={[typography.bodyBold, styles.label]} numberOfLines={1}>
              {label}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.textPrimary} style={{ marginLeft: 3 }} />
          </View>
          <Text style={[typography.caption, styles.addressText]} numberOfLines={1}>
            {addressText}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push("/(tabs)/profile")}
        activeOpacity={0.7}
      >
        <View style={styles.avatarCircle}>
          <Text style={[typography.captionBold, styles.avatarText]}>
            {user?.fullName?.charAt(0)?.toUpperCase() || "G"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  addressText: {
    color: colors.textSecondary,
    marginTop: 1,
  },
  profileButton: {
    padding: 2,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
