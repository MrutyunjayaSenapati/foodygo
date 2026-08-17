import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../../constants/typography";

interface RatingPillProps {
  rating: number | string;
  count?: number;
  size?: "sm" | "md";
  style?: ViewStyle;
}

export function RatingPill({ rating, count, size = "md", style }: RatingPillProps) {
  const numRating = typeof rating === "number" ? rating : parseFloat(rating) || 4.5;
  const isSm = size === "sm";

  return (
    <View
      style={[
        styles.container,
        isSm ? styles.containerSm : styles.containerMd,
        style,
      ]}
    >
      <Text style={[isSm ? styles.textSm : styles.textMd, typography.captionBold]}>
        {numRating.toFixed(1)}
      </Text>
      <Ionicons
        name="star"
        size={isSm ? 10 : 12}
        color="#FFFFFF"
        style={{ marginLeft: 2 }}
      />
      {count ? (
        <Text style={[styles.countText, isSm ? styles.countSm : styles.countMd]}>
          ({count > 999 ? `${(count / 1000).toFixed(1)}k` : count})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    borderRadius: 6,
  },
  containerSm: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  containerMd: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  textSm: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  textMd: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  countText: {
    color: "#E8F5E9",
    marginLeft: 3,
  },
  countSm: {
    fontSize: 9,
  },
  countMd: {
    fontSize: 11,
  },
});
