import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { VegBadge } from "./ui/VegBadge";
import type { Food } from "../types";

interface FoodItemProps {
  food: Food;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  isVeg?: boolean;
}

export function FoodItem({
  food,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  isVeg,
}: FoodItemProps) {
  const foodName = (food?.name ?? "").toLowerCase();
  const isVegetarian =
    isVeg ??
    !(
      foodName.includes("chicken") ||
      foodName.includes("pepperoni") ||
      foodName.includes("tuna") ||
      foodName.includes("salmon") ||
      foodName.includes("meat")
    );

  return (
    <View style={styles.container}>
      <View style={styles.detailsContainer}>
        <View style={styles.topRow}>
          <VegBadge isVeg={isVegetarian} size={14} style={{ marginRight: 6 }} />
          {foodName.includes("margherita") || foodName.includes("spicy tuna") ? (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>★ BESTSELLER</Text>
            </View>
          ) : null}
        </View>

        <Text
          style={[typography.bodyBold, styles.foodName]}
          numberOfLines={2}
        >
          {food.name}
        </Text>

        <Text style={[typography.bodyBold, styles.priceText]}>
          ${Number(food.price).toFixed(2)}
        </Text>

        {food.description ? (
          <Text
            style={[typography.caption, styles.descriptionText]}
            numberOfLines={2}
          >
            {food.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.imageAndActionContainer}>
        {food.imageUrl ? (
          <Image
            source={{ uri: food.imageUrl }}
            style={styles.foodImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.foodImage, { backgroundColor: colors.border }]} />
        )}

        <View style={styles.buttonWrapper}>
          {quantity === 0 ? (
            <TouchableOpacity
              onPress={onAdd}
              activeOpacity={0.8}
              accessibilityLabel={`Add ${food.name}`}
              testID={`add-btn-${food.id}`}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>ADD</Text>
              <Ionicons name="add" size={14} color={colors.primary} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          ) : (
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                onPress={onDecrement}
                activeOpacity={0.7}
                accessibilityLabel="Decrease quantity"
                testID={`dec-btn-${food.id}`}
                style={styles.stepperBtn}
              >
                <Ionicons name="remove" size={14} color={colors.primary} />
              </TouchableOpacity>

              <Text style={styles.stepperCount}>{quantity}</Text>

              <TouchableOpacity
                onPress={onIncrement}
                activeOpacity={0.7}
                accessibilityLabel="Increase quantity"
                testID={`inc-btn-${food.id}`}
                style={styles.stepperBtn}
              >
                <Ionicons name="add" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F3F5",
    justifyContent: "space-between",
  },
  detailsContainer: {
    flex: 1,
    paddingRight: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bestsellerBadge: {
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestsellerText: {
    color: "#E65100",
    fontSize: 9,
    fontWeight: "700",
  },
  foodName: {
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 2,
  },
  priceText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  descriptionText: {
    color: colors.textSecondary,
    lineHeight: 18,
  },
  imageAndActionContainer: {
    width: 100,
    alignItems: "center",
    position: "relative",
    paddingBottom: 14,
  },
  foodImage: {
    width: 96,
    height: 88,
    borderRadius: 12,
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 78,
  },
  addBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    overflow: "hidden",
    minWidth: 84,
    height: 32,
  },
  stepperBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  stepperCount: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 6,
    textAlign: "center",
  },
});
