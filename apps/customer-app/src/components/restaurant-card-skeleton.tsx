import { View } from "react-native";
import { Skeleton } from "./ui/Skeleton";
import { spacing } from "../constants/spacing";

const CARD_WIDTH = 160;

export function RestaurantCardSkeleton() {
  return (
    <View style={{ width: CARD_WIDTH }}>
      <Skeleton
        width={CARD_WIDTH}
        height={100}
        borderRadius={12}
        style={{ marginBottom: spacing.sm }}
      />
      <Skeleton width={CARD_WIDTH - 20} height={16} style={{ marginBottom: spacing.xs }} />
      <Skeleton width={60} height={14} style={{ marginBottom: spacing.xs }} />
      <Skeleton width={CARD_WIDTH - 40} height={12} />
    </View>
  );
}
