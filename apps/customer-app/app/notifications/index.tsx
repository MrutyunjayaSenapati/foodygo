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
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "../../src/hooks/use-notifications";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";

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
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header unreadCount={0} onMarkAllRead={() => {}} markingAll={false} />
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={74} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header
        unreadCount={unreadCount}
        onMarkAllRead={() => markAllAsRead.mutate()}
        markingAll={markAllAsRead.isPending}
      />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No notifications"
            description="You're all caught up! Order status updates and promos will appear here."
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
            <View style={{ padding: 16 }}>
              <Skeleton width="100%" height={60} />
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isOrder = item.title.toLowerCase().includes("order");

          return (
            <TouchableOpacity
              onPress={() => handlePress(item.id, item.isRead)}
              activeOpacity={0.75}
              style={[
                styles.notificationCard,
                !item.isRead && styles.unreadCard,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  !item.isRead ? styles.iconCircleUnread : styles.iconCircleRead,
                ]}
              >
                <Ionicons
                  name={isOrder ? "fast-food" : "notifications"}
                  size={18}
                  color={!item.isRead ? colors.primary : colors.textSecondary}
                />
              </View>

              <View style={styles.textContent}>
                <View style={styles.titleRow}>
                  <Text style={[typography.bodyBold, styles.titleText]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                {item.body && (
                  <Text
                    style={[typography.bodySmall, styles.bodyText]}
                    numberOfLines={2}
                  >
                    {item.body}
                  </Text>
                )}

                <Text style={[typography.caption, styles.timeText]}>
                  {formatRelativeTime(item.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
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
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[typography.h3, styles.headerTitle]}>
        Notifications
      </Text>
      {unreadCount > 0 && (
        <TouchableOpacity onPress={onMarkAllRead} disabled={markingAll}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
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
    gap: 10,
  },
  notificationCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F1F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: "#FFF8F5",
    borderColor: "#FFE0D3",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconCircleUnread: {
    backgroundColor: colors.primaryBg,
  },
  iconCircleRead: {
    backgroundColor: "#F4F5F7",
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  bodyText: {
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  timeText: {
    color: colors.textTertiary,
    marginTop: 6,
  },
});
