import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";
import type { Restaurant } from "../types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const CARD_WIDTH = 160;
const IMAGE_HEIGHT = 100;

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const imageSource = restaurant.coverUrl ?? restaurant.logoUrl
    ? { uri: restaurant.coverUrl ?? restaurant.logoUrl ?? "" }
    : undefined;

  const rating = parseFloat(String(restaurant.rating));

  return (
    <TouchableOpacity
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      activeOpacity={0.8}
      style={{ width: CARD_WIDTH }}
    >
      <Image
        source={imageSource}
        style={{
          width: CARD_WIDTH,
          height: IMAGE_HEIGHT,
          borderRadius: 12,
          backgroundColor: colors.border,
        }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={{ paddingTop: spacing.sm, paddingHorizontal: 2 }}>
        <Text
          style={[typography.bodyBold, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {restaurant.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
          <Ionicons name="star" size={14} color={colors.rating} />
          <Text
            style={[
              typography.captionBold,
              { color: colors.textSecondary, marginLeft: 4 },
            ]}
          >
            {rating.toFixed(1)}
          </Text>
        </View>
        <Text
          style={[typography.caption, { color: colors.textTertiary, marginTop: 2 }]}
          numberOfLines={1}
        >
          {restaurant.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
