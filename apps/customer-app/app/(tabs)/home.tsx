import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { LocationHeader } from "../../src/components/location-header";
import { SearchBar } from "../../src/components/search-bar";
import { Carousel } from "../../src/components/carousel";
import { CategoryBubble, CategoryItem } from "../../src/components/ui/CategoryBubble";
import { RestaurantCard } from "../../src/components/restaurant-card";
import { RestaurantCardSkeleton } from "../../src/components/restaurant-card-skeleton";
import { useTopRatedRestaurants, useRestaurants } from "../../src/hooks/use-restaurants";
import { useRecommendedRestaurants } from "../../src/hooks/use-recommendations";

const POPULAR_CUISINES: CategoryItem[] = [
  {
    id: "pizza",
    name: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80",
    query: "Pizza",
  },
  {
    id: "sushi",
    name: "Sushi",
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80",
    query: "Sushi",
  },
  {
    id: "burger",
    name: "Burgers",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
    query: "Burger",
  },
  {
    id: "indian",
    name: "Indian",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80",
    query: "Indian",
  },
  {
    id: "salad",
    name: "Healthy",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80",
    query: "Salad",
  },
  {
    id: "bakery",
    name: "Bakery",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80",
    query: "Bakery",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data: recommended,
    isLoading: recLoading,
    isRefetching: recRefetching,
    refetch: recRefetch,
  } = useRecommendedRestaurants();

  const {
    data: topRated,
    isLoading: topLoading,
    isRefetching: topRefetching,
    refetch: topRefetch,
  } = useTopRatedRestaurants(10);

  const {
    data: allRestaurants,
    isLoading: allLoading,
    isRefetching: allRefetching,
    refetch: allRefetch,
  } = useRestaurants();

  const refreshing = recRefetching || topRefetching || allRefetching;

  const onRefresh = useCallback(() => {
    recRefetch();
    topRefetch();
    allRefetch();
  }, [recRefetch, topRefetch, allRefetch]);

  const handleCuisinePress = (cuisine: CategoryItem) => {
    router.push({
      pathname: "/(tabs)/search",
      params: { q: cuisine.query || cuisine.name },
    });
  };

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top, backgroundColor: "#FFFFFF" }}>
        <LocationHeader />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Search Header Bar */}
        <View style={styles.searchSection}>
          <SearchBar />
        </View>

        {/* Promotional Offer Banner */}
        <View style={styles.offerBanner}>
          <View style={styles.offerLeft}>
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>LIMITED OFFER</Text>
            </View>
            <Text style={[typography.h3, styles.offerTitle]}>
              50% OFF up to $10
            </Text>
            <Text style={[typography.caption, styles.offerSubtitle]}>
              Use coupon code: <Text style={styles.codeHighlight}>FOODY50</Text>
            </Text>
          </View>
          <View style={styles.offerRightIcon}>
            <Ionicons name="gift" size={36} color={colors.primary} />
          </View>
        </View>

        {/* Cuisine Quick Discovery Rail */}
        <View style={styles.sectionHeader}>
          <Text style={[typography.captionBold, styles.sectionSubtitle]}>
            {"WHAT'S ON YOUR MIND?"}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cuisineRail}
        >
          {POPULAR_CUISINES.map((item) => (
            <CategoryBubble
              key={item.id}
              item={item}
              onPress={handleCuisinePress}
            />
          ))}
        </ScrollView>

        {/* Recommended for You Rail */}
        <View style={{ marginTop: 8 }}>
          <Carousel
            title="Recommended for You"
            data={recommended ?? []}
            loading={recLoading}
            skeleton={<RestaurantCardSkeleton />}
            renderItem={(item) => (
              <RestaurantCard restaurant={item} variant="compact" />
            )}
          />
        </View>

        {/* Top Rated Near You Carousel */}
        <View style={{ marginTop: 4 }}>
          <Carousel
            title="Top Rated Near You"
            data={topRated ?? []}
            loading={topLoading}
            skeleton={<RestaurantCardSkeleton />}
            renderItem={(item) => (
              <RestaurantCard restaurant={item} variant="compact" />
            )}
            onSeeAll={() => router.push("/(tabs)/search")}
          />
        </View>

        {/* All Restaurants List */}
        <View style={styles.allRestaurantsSection}>
          <View style={styles.allHeaderRow}>
            <Text style={[typography.h3, { color: colors.textPrimary }]}>
              All Restaurants Near You
            </Text>
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
              {allRestaurants?.length || 0} PLACES
            </Text>
          </View>

          {allLoading ? (
            <View style={{ marginTop: 12 }}>
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </View>
          ) : (
            (allRestaurants ?? []).map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                variant="full"
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  searchSection: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  offerBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#FFF4EF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#FFE0D3",
  },
  offerLeft: {
    flex: 1,
  },
  discountTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  discountTagText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  offerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  offerSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  codeHighlight: {
    fontWeight: "700",
    color: colors.primary,
  },
  offerRightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFE8DC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  cuisineRail: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  allRestaurantsSection: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  allHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
});
