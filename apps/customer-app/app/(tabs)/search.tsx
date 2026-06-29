import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { useDebounce } from "../../src/hooks/use-debounce";
import { useRestaurantSearch } from "../../src/hooks/use-restaurants";
import { useRecentSearchesStore } from "../../src/store/recent-searches-store";
import { RestaurantCard } from "../../src/components/restaurant-card";
import { RestaurantCardSkeleton } from "../../src/components/restaurant-card-skeleton";
import { FilterChips } from "../../src/components/filter-chips";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ErrorRetry } from "../../src/components/ui/ErrorRetry";

const RATING_CHIPS = [
  { key: "4.5", label: "4.5+" },
  { key: "4.0", label: "4.0+" },
  { key: "3.5", label: "3.5+" },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const { searches, addSearch, removeSearch, clearSearches } = useRecentSearchesStore();

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      addSearch(debouncedQuery);
    }
  }, [debouncedQuery, addSearch]);

  const ratingMin = ratingFilter ? parseFloat(ratingFilter) : undefined;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useRestaurantSearch(debouncedQuery, { ratingMin });

  const allResults = data?.pages.flatMap((page) => page.items) ?? [];
  const showRecent = debouncedQuery.length < 2 && searches.length > 0;
  const isEmptyResult = debouncedQuery.length >= 2 && !isLoading && !isError && allResults.length === 0;

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
    },
    [],
  );

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  const handleSelectRecent = useCallback(
    (term: string) => {
      setQuery(term);
    },
    [],
  );

  const handleRemoveRecent = useCallback(
    (term: string) => {
      removeSearch(term);
    },
    [removeSearch],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderHeader = () => (
    <>
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surfaceAlt,
            borderRadius: 12,
            paddingHorizontal: spacing.md,
            height: 44,
          }}
        >
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search restaurants..."
            placeholderTextColor={colors.textTertiary}
            returnKeyType="search"
            autoCorrect={false}
            style={[
              typography.body,
              {
                flex: 1,
                color: colors.textPrimary,
                marginLeft: spacing.sm,
                paddingVertical: 0,
              },
            ]}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {debouncedQuery.length >= 2 && (
        <View style={{ marginBottom: spacing.md }}>
          <FilterChips
            chips={RATING_CHIPS}
            selected={ratingFilter}
            onSelect={setRatingFilter}
          />
        </View>
      )}
    </>
  );

  const renderRecentHeader = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
      }}
    >
      <Text style={[typography.h3, { color: colors.textPrimary }]}>Recent Searches</Text>
      <TouchableOpacity onPress={clearSearches}>
        <Text style={[typography.captionBold, { color: colors.primary }]}>Clear All</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecentItem = ({ item }: { item: string }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      }}
    >
      <TouchableOpacity
        onPress={() => handleSelectRecent(item)}
        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
      >
        <Ionicons name="time-outline" size={18} color={colors.textTertiary} />
        <Text
          style={[
            typography.body,
            { color: colors.textPrimary, marginLeft: spacing.sm },
          ]}
          numberOfLines={1}
        >
          {item}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleRemoveRecent(item)} hitSlop={8}>
        <Ionicons name="close" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );

  const renderSkeletons = () => (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </View>
  );

  const renderGridItem = ({ item }: { item: (typeof allResults)[0] }) => (
    <View style={{ width: "48%" }}>
      <RestaurantCard restaurant={item} />
    </View>
  );

  if (isLoading && debouncedQuery.length >= 2) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        {renderHeader()}
        {renderSkeletons()}
      </View>
    );
  }

  if (isError && debouncedQuery.length >= 2) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        {renderHeader()}
        <ErrorRetry message="Failed to load results" onRetry={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      {renderHeader()}

      {showRecent && (
        <FlatList
          data={searches}
          keyExtractor={(item) => item}
          renderItem={renderRecentItem}
          ListHeaderComponent={renderRecentHeader}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {isEmptyResult && (
        <EmptyState
          title="No restaurants found"
          description="Try adjusting your search or filters"
        />
      )}

      {debouncedQuery.length >= 2 && allResults.length > 0 && (
        <FlatList
          data={allResults}
          keyExtractor={(item) => item.id}
          renderItem={renderGridItem}
          numColumns={2}
          columnWrapperStyle={{
            paddingHorizontal: spacing.lg,
            gap: spacing.md,
            marginBottom: spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: spacing.xl, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
