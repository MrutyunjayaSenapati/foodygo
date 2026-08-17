import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { RatingPill } from "./ui/RatingPill";
import type { Restaurant } from "../types";

interface RestaurantCardProps {
  restaurant: Restaurant;
  variant?: "compact" | "featured" | "full";
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

export function RestaurantCard({
  restaurant,
  variant = "compact",
  onFavoritePress,
  isFavorite,
}: RestaurantCardProps) {
  const imageUrl = restaurant.coverUrl || restaurant.logoUrl;
  const imageSource = imageUrl ? { uri: imageUrl } : undefined;
  const rating = parseFloat(String(restaurant.rating)) || 4.5;
  const isFull = variant === "full" || variant === "featured";

  if (isFull) {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/restaurant/${restaurant.id}`)}
        activeOpacity={0.85}
        style={styles.fullCard}
      >
        <View style={styles.fullImageContainer}>
          <Image
            source={imageSource}
            style={styles.fullImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <View style={styles.imageOverlayTop}>
            <RatingPill rating={rating} size="md" />
            {onFavoritePress && (
              <TouchableOpacity
                onPress={onFavoritePress}
                style={styles.favoriteButton}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={18}
                  color={isFavorite ? colors.favorite : "#FFFFFF"}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.deliveryBadge}>
            <Ionicons name="time-outline" size={13} color="#FFFFFF" />
            <Text style={[typography.captionBold, styles.deliveryTimeText]}>
              25-35 MINS
            </Text>
          </View>
        </View>

        <View style={styles.fullContent}>
          <View style={styles.titleRow}>
            <Text
              style={[typography.h4, { color: colors.textPrimary, flex: 1 }]}
              numberOfLines={1}
            >
              {restaurant.name}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              $$ • $15 for two
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text
              style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}
              numberOfLines={1}
            >
              {restaurant.address}
            </Text>
            <View style={styles.freeDeliveryPill}>
              <Text style={styles.freeDeliveryText}>Free Delivery</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Compact variant for horizontal rails
  return (
    <TouchableOpacity
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      activeOpacity={0.85}
      style={styles.compactCard}
    >
      <View style={styles.compactImageContainer}>
        <Image
          source={imageSource}
          style={styles.compactImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <View style={styles.compactRatingBadge}>
          <RatingPill rating={rating} size="sm" />
        </View>
        <View style={styles.compactTimeBadge}>
          <Text style={styles.compactTimeText}>25-30m</Text>
        </View>
      </View>

      <View style={styles.compactContent}>
        <Text
          style={[typography.bodyBold, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {restaurant.name}
        </Text>
        <Text
          style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}
          numberOfLines={1}
        >
          {restaurant.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  fullImageContainer: {
    width: "100%",
    height: 150,
    position: "relative",
    backgroundColor: colors.border,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlayTop: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deliveryTimeText: {
    color: "#FFFFFF",
    fontSize: 11,
    marginLeft: 4,
  },
  fullContent: {
    padding: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  freeDeliveryPill: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  freeDeliveryText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  compactCard: {
    width: 175,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  compactImageContainer: {
    width: 175,
    height: 110,
    position: "relative",
    backgroundColor: colors.border,
  },
  compactImage: {
    width: "100%",
    height: "100%",
  },
  compactRatingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  compactTimeBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compactTimeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  compactContent: {
    padding: 10,
  },
});
