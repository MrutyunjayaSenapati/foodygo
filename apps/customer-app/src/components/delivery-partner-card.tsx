import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";

interface DeliveryPartnerCardProps {
  fullName: string;
  avatarUrl: string | null;
  vehicleType: string;
}

const VEHICLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  BIKE: "bicycle-outline",
  SCOOTER: "bicycle-outline",
  CAR: "car-outline",
};

export function DeliveryPartnerCard({
  fullName,
  avatarUrl,
  vehicleType,
}: DeliveryPartnerCardProps) {
  const vehicleIcon = VEHICLE_ICONS[vehicleType] ?? "bicycle-outline";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
        borderRadius: 12,
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
      }}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.border,
          }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primaryBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person" size={24} color={colors.primary} />
        </View>
      )}

      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
          {fullName}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
          <Ionicons name={vehicleIcon} size={14} color={colors.textSecondary} />
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            {vehicleType === "CAR" ? "Car" : vehicleType === "SCOOTER" ? "Scooter" : "Bike"}
          </Text>
        </View>
      </View>
    </View>
  );
}
