import { useCallback } from "react";
import { ScrollView, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../src/constants/colors";
import { spacing } from "../../src/constants/spacing";
import { SearchBar } from "../../src/components/search-bar";
import { Carousel } from "../../src/components/carousel";
import { RestaurantCard } from "../../src/components/restaurant-card";
import { RestaurantCardSkeleton } from "../../src/components/restaurant-card-skeleton";
import { useTopRatedRestaurants } from "../../src/hooks/use-restaurants";
import { useRecommendedRestaurants } from "../../src/hooks/use-recommendations";

export default function HomeScreen() {
  const router = useRouter();
  const {
    data: recommended,
    isLoading: recLoading,
    refetch: recRefetch,
  } = useRecommendedRestaurants();
  const {
    data: topRated,
    isLoading: topLoading,
    refetch: topRefetch,
  } = useTopRatedRestaurants(10);

  const refreshing = false;

  const onRefresh = useCallback(() => {
    recRefetch();
    topRefetch();
  }, [recRefetch, topRefetch]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing["4xl"] }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={{ paddingTop: spacing["2xl"] }} />

      <SearchBar />

      <Carousel
        title="Recommended for You"
        data={recommended ?? []}
        loading={recLoading}
        skeleton={<RestaurantCardSkeleton />}
        renderItem={(item) => <RestaurantCard restaurant={item} />}
      />

      <Carousel
        title="Top Rated"
        data={topRated ?? []}
        loading={topLoading}
        skeleton={<RestaurantCardSkeleton />}
        renderItem={(item) => <RestaurantCard restaurant={item} />}
        onSeeAll={() => router.push("/(tabs)/search")}
      />
    </ScrollView>
  );
}
