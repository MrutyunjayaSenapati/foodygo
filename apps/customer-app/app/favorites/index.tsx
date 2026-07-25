import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites, useToggleFavorite } from "../../src/hooks/use-favorites";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { Button } from "../../src/components/ui/Button";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import type { Restaurant } from "../../src/types";

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <Header />
        <View style={{ padding: spacing.lg, flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
          {[1, 2].map((i) => (
            <Skeleton key={i} width={160} height={180} />
          ))}
        </View>
      </View>
    );
  }

  const restaurants = favorites?.map((f) => f.restaurant) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <Header />
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
        contentContainerStyle={{ paddingVertical: spacing.md, gap: spacing.md }}
        ListEmptyComponent={
          <EmptyState
            title="No favorites yet"
            description="Save your favorite restaurants for quick access"
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
          <FavoriteCard
            restaurant={item}
            onToggle={() => handleToggle(item.id)}
            toggling={toggleFavorite.isPending}
          />
        )}
      />
    </View>
  );
}

function Header() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[typography.h3, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]}>
        Favorites
      </Text>
    </View>
  );
}

function FavoriteCard({
  restaurant,
  onToggle,
  toggling,
}: {
  restaurant: Restaurant;
  onToggle: () => void;
  toggling: boolean;
}) {
  const imageSource = restaurant.coverUrl ?? restaurant.logoUrl
    ? { uri: restaurant.coverUrl ?? restaurant.logoUrl ?? "" }
    : undefined;

  const rating = parseFloat(String(restaurant.rating));

  return (
    <TouchableOpacity
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      activeOpacity={0.8}
      style={{ width: 160, marginBottom: spacing.md }}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={imageSource}
          style={{
            width: 160,
            height: 100,
            borderRadius: 12,
            backgroundColor: colors.border,
          }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <TouchableOpacity
          onPress={onToggle}
          disabled={toggling}
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.9)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="heart" size={16} color={colors.favorite} />
        </TouchableOpacity>
      </View>
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
