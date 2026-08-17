import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { useRestaurantDetail } from "../../src/hooks/use-restaurants";
import { useRestaurantFoods } from "../../src/hooks/use-foods";
import { useCartStore } from "../../src/store/cart-store";
import { useFavorites, useToggleFavorite } from "../../src/hooks/use-favorites";
import { FoodItem } from "../../src/components/food-item";
import { CartBar } from "../../src/components/cart-bar";
import { RatingPill } from "../../src/components/ui/RatingPill";
import { VegBadge } from "../../src/components/ui/VegBadge";
import { ErrorRetry } from "../../src/components/ui/ErrorRetry";
import type { Food, FoodCategory } from "../../src/types";
import {
  useAddCartItem,
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
} from "../../src/hooks/use-cart";
import { useAuthStore } from "../../src/store/auth-store";

interface Section {
  title: string;
  data: Food[];
  categoryId: string;
}

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  const {
    data: restaurant,
    isLoading: loadingRestaurant,
    isError: errorRestaurant,
    refetch: refetchRestaurant,
  } = useRestaurantDetail(id ?? "");

  const {
    data: foodsData,
    isLoading: loadingFoods,
    isError: errorFoods,
    refetch: refetchFoods,
  } = useRestaurantFoods(id ?? "");

  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const isFav = restaurant ? !!favorites?.some((f) => f.restaurantId === restaurant.id) : false;

  const handleToggleFavorite = () => {
    if (!restaurant) return;
    toggleFavorite.mutate(restaurant.id);
  };

  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const setRestaurantId = useCartStore((s) => s.setRestaurantId);
  const { data: serverCart } = useCart();
  const addCartItem = useAddCartItem();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);

  const sections: Section[] = useMemo(() => {
    if (!foodsData) return [];
    let foods = foodsData.foods;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      foods = foods.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q)),
      );
    }

    if (vegOnly) {
      foods = foods.filter((f) => {
        const name = f.name.toLowerCase();
        return !(
          name.includes("chicken") ||
          name.includes("pepperoni") ||
          name.includes("tuna") ||
          name.includes("salmon") ||
          name.includes("meat")
        );
      });
    }

    const categories = foodsData.categories;
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
      categorized.push({
        title: "Other Specialities",
        data: uncategorized,
        categoryId: "other",
      });
    }

    return categorized;
  }, [foodsData, searchQuery, vegOnly]);

  const getQuantity = useCallback(
    (foodId: string) => {
      return cartItems.find((i) => i.foodId === foodId)?.quantity ?? 0;
    },
    [cartItems],
  );

  const handleAdd = useCallback(
    (food: Food) => {
      setRestaurantId(restaurant?.id ?? null);
      addItem({
        foodId: food.id,
        quantity: 1,
        food: { ...food, price: Number(food.price) } as Food,
      });
      if (isAuthenticated) {
        addCartItem.mutate({ foodId: food.id, quantity: 1 });
      }
    },
    [addItem, setRestaurantId, restaurant?.id, isAuthenticated, addCartItem],
  );

  const handleIncrement = useCallback(
    (food: Food) => {
      addItem({
        foodId: food.id,
        quantity: 1,
        food: { ...food, price: Number(food.price) } as Food,
      });
      if (isAuthenticated) {
        const serverItem = serverCart?.items?.find((i) => i.foodId === food.id);
        if (serverItem) {
          updateCartItem.mutate({
            itemId: serverItem.id,
            data: { quantity: serverItem.quantity + 1 },
          });
        } else {
          addCartItem.mutate({ foodId: food.id, quantity: 1 });
        }
      }
    },
    [addItem, isAuthenticated, serverCart, updateCartItem, addCartItem],
  );

  const handleDecrement = useCallback(
    (food: Food) => {
      const qty = getQuantity(food.id);
      if (qty > 0) {
        updateQuantity(food.id, qty - 1);
        if (isAuthenticated) {
          const serverItem = serverCart?.items?.find((i) => i.foodId === food.id);
          if (serverItem) {
            if (qty <= 1) {
              removeCartItem.mutate(serverItem.id);
            } else {
              updateCartItem.mutate({
                itemId: serverItem.id,
                data: { quantity: qty - 1 },
              });
            }
          }
        }
      }
    },
    [updateQuantity, getQuantity, isAuthenticated, serverCart, removeCartItem, updateCartItem],
  );

  const isLoading = loadingRestaurant || loadingFoods;
  const isError = errorRestaurant || errorFoods;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <View style={{ height: 220, backgroundColor: colors.border }} />
        <View style={{ padding: 16 }}>
          <View style={{ height: 24, width: "60%", backgroundColor: colors.shimmer, borderRadius: 6, marginBottom: 8 }} />
          <View style={{ height: 16, width: "40%", backgroundColor: colors.shimmer, borderRadius: 6, marginBottom: 6 }} />
          <View style={{ height: 14, width: "80%", backgroundColor: colors.shimmer, borderRadius: 6 }} />
        </View>
      </View>
    );
  }

  if (isError || !restaurant) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <ErrorRetry
          message={errorRestaurant ? "Restaurant not found" : "Failed to load menu"}
          onRetry={() => {
            refetchRestaurant();
            refetchFoods();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Floating Top Navigation Header */}
      <View style={[styles.floatingHeader, { top: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerCircleBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={styles.headerCircleBtn}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={20}
              color={isFav ? "#EF4444" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View>
            <Image
              source={{ uri: restaurant.coverUrl || restaurant.logoUrl || undefined }}
              style={styles.heroImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />

            {/* Restaurant Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.nameRow}>
                <Text style={[typography.h2, styles.restaurantName]}>
                  {restaurant.name}
                </Text>
                <RatingPill rating={Number(restaurant.rating) || 4.5} size="md" />
              </View>

              <Text style={[typography.bodySmall, styles.addressLine]} numberOfLines={1}>
                {restaurant.address}
              </Text>

              <View style={styles.badgeRow}>
                <View style={styles.pillBadge}>
                  <Ionicons name="time-outline" size={13} color={colors.textPrimary} />
                  <Text style={[typography.captionBold, styles.pillBadgeText]}>
                    25-35 MINS
                  </Text>
                </View>

                <View style={styles.pillBadge}>
                  <Ionicons name="bicycle" size={13} color="#2E7D32" />
                  <Text style={[typography.captionBold, { color: "#2E7D32", marginLeft: 4 }]}>
                    FREE DELIVERY
                  </Text>
                </View>

                <View style={styles.pillBadge}>
                  <Text style={[typography.captionBold, styles.pillBadgeText]}>
                    $$ • $15 for two
                  </Text>
                </View>
              </View>

              {/* Menu Filter and Search Controls */}
              <View style={styles.filterControlsRow}>
                <View style={styles.menuSearchBar}>
                  <Ionicons name="search" size={16} color={colors.textTertiary} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search in menu..."
                    placeholderTextColor={colors.textTertiary}
                    style={[typography.bodySmall, styles.menuSearchInput]}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => setVegOnly(!vegOnly)}
                  style={[styles.vegToggleBtn, vegOnly && styles.vegToggleBtnActive]}
                  activeOpacity={0.8}
                >
                  <VegBadge isVeg={true} size={12} style={{ marginRight: 4 }} />
                  <Text
                    style={[
                      typography.captionBold,
                      vegOnly ? styles.vegToggleTextActive : styles.vegToggleText,
                    ]}
                  >
                    Veg Only
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[typography.bodyBold, styles.sectionHeaderText]}>
              {section.title} ({section.data.length})
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
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food-outline" size={48} color={colors.textTertiary} />
            <Text style={[typography.bodyBold, styles.emptyTitle]}>
              No items match your filter
            </Text>
            <Text style={[typography.caption, styles.emptySubtitle]}>
              Try clearing your search query or toggling Veg Only off.
            </Text>
          </View>
        }
      />

      <CartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  floatingHeader: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 99,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    height: 220,
    backgroundColor: colors.border,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    marginTop: -16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  restaurantName: {
    color: colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  addressLine: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillBadgeText: {
    color: colors.textPrimary,
    fontSize: 11,
    marginLeft: 4,
  },
  filterControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 10,
  },
  menuSearchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  menuSearchInput: {
    flex: 1,
    color: colors.textPrimary,
    marginLeft: 6,
    paddingVertical: 0,
  },
  vegToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEEF1",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  vegToggleBtnActive: {
    borderColor: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  vegToggleText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  vegToggleTextActive: {
    color: "#2E7D32",
    fontSize: 12,
  },
  sectionHeader: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ECEEF1",
  },
  sectionHeaderText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 110,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
});
