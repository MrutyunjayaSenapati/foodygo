import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites, useToggleFavorite } from "../../src/hooks/use-favorites";
import { RestaurantCard } from "../../src/components/restaurant-card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { Button } from "../../src/components/ui/Button";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { data: favorites, isLoading, isRefetching, refetch } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const handleToggle = useCallback(
    (restaurantId: string) => {
      toggleFavorite.mutate(restaurantId);
    },
    [toggleFavorite],
  );

  const restaurants = favorites?.map((f) => f.restaurant) ?? [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h3, styles.headerTitle]}>
          Favorite Restaurants
        </Text>
      </View>

      {isLoading ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton width="100%" height={160} />
          <Skeleton width="100%" height={160} />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No favorites saved yet"
              description="Tap the heart icon on any restaurant to save it to your favorites."
              action={
                <Button
                  title="Discover Restaurants"
                  onPress={() => router.replace("/(tabs)/home")}
                />
              }
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              variant="full"
              isFavorite={true}
              onFavoritePress={() => handleToggle(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  backBtn: {
    marginRight: 12,
    padding: 2,
  },
  headerTitle: {
    color: colors.textPrimary,
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
});
