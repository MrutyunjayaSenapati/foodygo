import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { useRestaurantDetail } from "../../src/hooks/use-restaurants";
import { useRestaurantFoods } from "../../src/hooks/use-foods";
import { useCartStore } from "../../src/store/cart-store";
import { FoodItem } from "../../src/components/food-item";
import { CartBar } from "../../src/components/cart-bar";
import { ErrorRetry } from "../../src/components/ui/ErrorRetry";
import type { Food, FoodCategory } from "../../src/types";

interface Section {
  title: string;
  data: Food[];
  categoryId: string;
}

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { data: restaurant, isLoading: loadingRestaurant, isError: errorRestaurant, refetch: refetchRestaurant } =
    useRestaurantDetail(id ?? "");
  const { data: foodsData, isLoading: loadingFoods, isError: errorFoods, refetch: refetchFoods } =
    useRestaurantFoods(id ?? "");

  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const setRestaurantId = useCartStore((s) => s.setRestaurantId);

  const sections: Section[] = useMemo(() => {
    if (!foodsData) return [];
    const categories = foodsData.categories;
    const foods = foodsData.foods;

    if (categories.length === 0) {
      return [{ title: "Menu", data: foods, categoryId: "all" }];
    }

    const uncategorized = foods.filter((f) => !f.categoryId);
    const categorized = categories
      .map((cat: FoodCategory) => ({
        title: cat.name,
        data: foods.filter((f: Food) => f.categoryId === cat.id),
        categoryId: cat.id,
      }))
      .filter((s: Section) => s.data.length > 0);

    if (uncategorized.length > 0) {
      categorized.push({ title: "Other", data: uncategorized, categoryId: "other" });
    }

    return categorized;
  }, [foodsData]);

  const getQuantity = useCallback(
    (foodId: string) => {
      return cartItems.find((i) => i.foodId === foodId)?.quantity ?? 0;
    },
    [cartItems],
  );

  const handleAdd = useCallback(
    (food: Food) => {
      setRestaurantId(restaurant?.id ?? null);
      addItem({ foodId: food.id, quantity: 1, food: { price: Number(food.price) } as Food });
    },
    [addItem, setRestaurantId, restaurant?.id],
  );

  const handleIncrement = useCallback(
    (food: Food) => {
      addItem({ foodId: food.id, quantity: 1, food: { price: Number(food.price) } as Food });
    },
    [addItem],
  );

  const handleDecrement = useCallback(
    (food: Food) => {
      const qty = getQuantity(food.id);
      if (qty > 0) updateQuantity(food.id, qty - 1);
    },
    [updateQuantity, getQuantity],
  );

  const isLoading = loadingRestaurant || loadingFoods;
  const isError = errorRestaurant || errorFoods;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <View style={{ height: 200, backgroundColor: colors.border }} />
        <View style={{ padding: spacing.lg }}>
          <View style={{ height: 24, width: "60%", backgroundColor: colors.shimmer, borderRadius: 6, marginBottom: spacing.sm }} />
          <View style={{ height: 16, width: "40%", backgroundColor: colors.shimmer, borderRadius: 6, marginBottom: spacing.xs }} />
          <View style={{ height: 14, width: "80%", backgroundColor: colors.shimmer, borderRadius: 6 }} />
        </View>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={{ height: 72, backgroundColor: colors.shimmer, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: 8 }} />
        ))}
      </View>
    );
  }

  if (isError || !restaurant) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <ErrorRetry
          message={errorRestaurant ? "Restaurant not found" : "Failed to load menu"}
          onRetry={() => { refetchRestaurant(); refetchFoods(); }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={() => (
          <View>
            <Image
              source={{ uri: restaurant.coverUrl ?? undefined }}
              style={{
                width: "100%",
                height: 200,
                backgroundColor: colors.border,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View style={{ padding: spacing.lg }}>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>
                {restaurant.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing.sm }}>
                <Ionicons name="star" size={16} color={colors.rating} />
                <Text
                  style={[
                    typography.bodyBold,
                    { color: colors.textSecondary, marginLeft: 4 },
                  ]}
                >
                  {Number(restaurant.rating).toFixed(1)}
                </Text>
                <Text style={[typography.caption, { color: colors.textTertiary, marginLeft: spacing.sm }]}>
                  {restaurant.address}
                </Text>
              </View>
              <View style={{ flexDirection: "row", marginTop: spacing.sm, gap: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="bicycle" size={14} color={colors.textTertiary} />
                  <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    $0.00 delivery
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                  <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                    30-45 min
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg }} />
            <Text style={[typography.h3, { color: colors.textPrimary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
              Menu
            </Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={{ backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <FoodItem
            food={item}
            quantity={getQuantity(item.id)}
            onAdd={() => handleAdd(item)}
            onIncrement={() => handleIncrement(item)}
            onDecrement={() => handleDecrement(item)}
          />
        )}
        ListEmptyComponent={
          <View style={{ padding: spacing["3xl"], alignItems: "center" }}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              No menu items available
            </Text>
          </View>
        }
      />
      <CartBar />
    </View>
  );
}
