import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { useDebounce } from "../../src/hooks/use-debounce";
import { useRestaurantSearch } from "../../src/hooks/use-restaurants";
import { useRecentSearchesStore } from "../../src/store/recent-searches-store";
import { RestaurantCard } from "../../src/components/restaurant-card";
import { RestaurantCardSkeleton } from "../../src/components/restaurant-card-skeleton";
import { FilterChips } from "../../src/components/filter-chips";
import { CategoryBubble, CategoryItem } from "../../src/components/ui/CategoryBubble";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ErrorRetry } from "../../src/components/ui/ErrorRetry";
import { Button } from "../../src/components/ui/Button";

const RATING_CHIPS = [
  { key: "4.5", label: "★ 4.5+" },
  { key: "4.0", label: "★ 4.0+" },
  { key: "3.5", label: "★ 3.5+" },
];

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

const TRENDING_SEARCHES = [
  "Pizza Paradise",
  "Sushi Master",
  "Margherita",
  "California Roll",
  "Garlic Bread",
  "Pepperoni",
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q || "");
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const { searches, addSearch, removeSearch, clearSearches } = useRecentSearchesStore();

  useEffect(() => {
    if (params.q) {
      setQuery(params.q);
    }
  }, [params.q]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      addSearch(debouncedQuery.trim());
    }
  }, [debouncedQuery, addSearch]);

  const ratingMin = ratingFilter ? parseFloat(ratingFilter) : undefined;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useRestaurantSearch(debouncedQuery, { ratingMin });

  const allResults = data?.pages.flatMap((page) => page.items) ?? [];
  const isSearching = debouncedQuery.trim().length >= 2;
  const isEmptyResult = isSearching && !isLoading && !isError && allResults.length === 0;

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  const handleSelectRecent = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const handleSelectCuisine = useCallback((item: CategoryItem) => {
    setQuery(item.query || item.name);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={colors.primary} />
        <TextInput
          value={query}
          onChangeText={handleSearch}
          onSubmitEditing={() => Keyboard.dismiss()}
          placeholder="Search restaurants, cuisines, dishes..."
          placeholderTextColor={colors.textTertiary}
          returnKeyType="search"
          autoCorrect={false}
          style={[typography.body, styles.textInput]}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {isSearching && (
        <View style={styles.filterRow}>
          <FilterChips
            chips={RATING_CHIPS}
            selected={ratingFilter}
            onSelect={setRatingFilter}
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {renderHeader()}

      {!isSearching && (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.exploreContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Recent Searches Section */}
          {searches.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Text style={[typography.h3, styles.sectionTitle]}>Recent Searches</Text>
                <TouchableOpacity onPress={clearSearches}>
                  <Text style={[typography.captionBold, { color: colors.primary }]}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.recentList}>
                {searches.map((item) => (
                  <View key={item} style={styles.recentRow}>
                    <TouchableOpacity
                      onPress={() => handleSelectRecent(item)}
                      style={styles.recentTextWrapper}
                    >
                      <Ionicons name="time-outline" size={18} color={colors.textTertiary} />
                      <Text style={[typography.body, styles.recentItemText]} numberOfLines={1}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeSearch(item)} hitSlop={8}>
                      <Ionicons name="close" size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Popular Cuisines Section */}
          <View style={styles.sectionBlock}>
            <Text style={[typography.captionBold, styles.subHeaderTitle]}>
              POPULAR CUISINES
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 4 }}
            >
              {POPULAR_CUISINES.map((item) => (
                <CategoryBubble
                  key={item.id}
                  item={item}
                  onPress={handleSelectCuisine}
                />
              ))}
            </ScrollView>
          </View>

          {/* Trending Searches Section */}
          <View style={styles.sectionBlock}>
            <Text style={[typography.captionBold, styles.subHeaderTitle]}>
              TRENDING ON FOODYGO
            </Text>
            <View style={styles.trendingChipsContainer}>
              {TRENDING_SEARCHES.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setQuery(item)}
                  style={styles.trendingChip}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trending-up" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[typography.captionBold, styles.trendingChipText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Loading Skeletons */}
      {isSearching && isLoading && (
        <View style={styles.resultsContainer}>
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />
        </View>
      )}

      {/* Error Retry */}
      {isSearching && isError && (
        <View style={styles.resultsContainer}>
          <ErrorRetry message="Failed to load results" onRetry={() => refetch()} />
        </View>
      )}

      {/* Empty Result */}
      {isEmptyResult && (
        <EmptyState
          title="No restaurants found"
          description={`We couldn't find matches for "${query}". Try searching for pizza, sushi, or burger.`}
          action={
            <Button
              title="Clear Search"
              onPress={handleClear}
              variant="outline"
              style={{ marginTop: 12 }}
            />
          }
        />
      )}

      {/* Search Results List */}
      {isSearching && allResults.length > 0 && (
        <FlatList
          data={allResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard restaurant={item} variant="full" />
          )}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
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
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    marginLeft: 10,
    paddingVertical: 0,
  },
  filterRow: {
    marginTop: 10,
  },
  exploreContent: {
    paddingBottom: 32,
  },
  sectionBlock: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  subHeaderTitle: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  recentList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F5F7",
  },
  recentTextWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  recentItemText: {
    color: colors.textPrimary,
    marginLeft: 10,
  },
  trendingChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  trendingChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ECEEF1",
  },
  trendingChipText: {
    color: colors.textPrimary,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsList: {
    padding: 16,
    paddingBottom: 40,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
