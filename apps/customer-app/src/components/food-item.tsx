import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";
import type { Food } from "../types";

interface FoodItemProps {
  food: Food;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function FoodItem({ food, quantity, onAdd, onIncrement, onDecrement }: FoodItemProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      }}
    >
      {food.imageUrl && (
        <Image
          source={{ uri: food.imageUrl }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 8,
            backgroundColor: colors.border,
            marginRight: spacing.md,
          }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={[typography.bodyBold, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {food.name}
        </Text>
        {food.description && (
          <Text
            style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}
            numberOfLines={2}
          >
            {food.description}
          </Text>
        )}
        <Text
          style={[
            typography.bodyBold,
            { color: colors.primary, marginTop: spacing.xs },
          ]}
        >
          ${Number(food.price).toFixed(2)}
        </Text>
      </View>
      <View style={{ justifyContent: "center", marginLeft: spacing.sm }}>
        {quantity === 0 ? (
          <TouchableOpacity
            onPress={onAdd}
            activeOpacity={0.7}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        ) : (
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={onIncrement}
              activeOpacity={0.7}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="add" size={16} color={colors.textInverse} />
            </TouchableOpacity>
            <Text
              style={[
                typography.bodyBold,
                { color: colors.textPrimary, marginVertical: 2, minWidth: 20, textAlign: "center" },
              ]}
            >
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={onDecrement}
              activeOpacity={0.7}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="remove" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
