import { FlatList, View, Text } from "react-native";
import { spacing } from "../constants/spacing";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { SectionHeader } from "./section-header";

interface CarouselProps<T> {
  title: string;
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  loading?: boolean;
  skeleton?: React.ReactElement;
  onSeeAll?: () => void;
  emptyMessage?: string;
  itemWidth?: number;
}

export function Carousel<T>({
  title,
  data,
  renderItem,
  loading,
  skeleton,
  onSeeAll,
  emptyMessage,
}: CarouselProps<T>) {
  return (
    <View>
      <SectionHeader title={title} actionLabel={onSeeAll ? "See All" : undefined} onAction={onSeeAll} />

      {loading && skeleton ? (
        <FlatList
          horizontal
          data={[1, 2, 3]}
          renderItem={() => skeleton}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        />
      ) : data.length === 0 ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
          <Text style={[typography.caption, { color: colors.textTertiary }]}>
            {emptyMessage ?? "No items available at the moment"}
          </Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={data}
          renderItem={({ item, index }) => renderItem(item, index)}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
          showsHorizontalScrollIndicator={false}
          snapToInterval={160}
          decelerationRate="fast"
        />
      )}
    </View>
  );
}
