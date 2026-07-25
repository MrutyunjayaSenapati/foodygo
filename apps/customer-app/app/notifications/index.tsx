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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "../../src/hooks/use-notifications";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.pages.flatMap((p) => p.items) ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handlePress = useCallback(
    (notificationId: string, isRead: boolean) => {
      if (!isRead) {
        markAsRead.mutate(notificationId);
      }
    },
    [markAsRead],
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <Header unreadCount={0} onMarkAllRead={() => {}} markingAll={false} />
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} width="100%" height={72} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <Header
        unreadCount={unreadCount}
        onMarkAllRead={() => markAllAsRead.mutate()}
        markingAll={markAllAsRead.isPending}
      />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: spacing.sm, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            title="No notifications"
            description="You're all caught up!"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ padding: spacing.md }}>
              <Skeleton width="100%" height={60} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item.id, item.isRead)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              backgroundColor: item.isRead ? colors.background : colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            <View style={{ width: 8, marginTop: 6, alignItems: "center" }}>
              {!item.isRead && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.primary,
                  }}
                />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text
                style={[
                  typography.bodyBold,
                  { color: colors.textPrimary },
                ]}
              >
                {item.title}
              </Text>
              {item.body && (
                <Text
                  style={[
                    typography.body,
                    { color: colors.textSecondary, marginTop: 2 },
                  ]}
                  numberOfLines={2}
                >
                  {item.body}
                </Text>
              )}
              <Text
                style={[
                  typography.caption,
                  { color: colors.textTertiary, marginTop: 4 },
                ]}
              >
                {formatRelativeTime(item.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function Header({
  unreadCount,
  onMarkAllRead,
  markingAll,
}: {
  unreadCount: number;
  onMarkAllRead: () => void;
  markingAll: boolean;
}) {
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
      <Text
        style={[
          typography.h3,
          { color: colors.textPrimary, flex: 1, marginLeft: spacing.md },
        ]}
      >
        Notifications
      </Text>
      {unreadCount > 0 && (
        <TouchableOpacity onPress={onMarkAllRead} disabled={markingAll}>
          <Text style={[typography.bodyBold, { color: colors.primary }]}>
            Mark all read
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString([], { month: "short", day: "numeric" });
}
