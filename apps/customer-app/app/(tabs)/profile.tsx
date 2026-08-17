import React from "react";
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { Button } from "../../src/components/ui/Button";
import { useAuthStore } from "../../src/store/auth-store";
import { useLogout } from "../../src/hooks/use-auth";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  route?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const logout = useLogout();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout from FoodyGo?", [
      { text: "Cancel", style: "cancel" },
      { text: "LOGOUT", style: "destructive", onPress: () => logout.mutate() },
    ]);
  };

  const mainMenu: MenuItem[] = [
    {
      icon: "receipt-outline",
      label: "My Orders",
      subtitle: "View order history & live tracking",
      route: "/(tabs)/orders",
    },
    {
      icon: "heart-outline",
      label: "Favorite Restaurants",
      subtitle: "Your saved food spots",
      route: "/favorites",
    },
    {
      icon: "location-outline",
      label: "Saved Addresses",
      subtitle: "Manage home & work addresses",
      route: "/addresses",
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      subtitle: "Order updates and promos",
      route: "/notifications",
    },
  ];

  const appMenu: MenuItem[] = [
    {
      icon: "help-buoy-outline",
      label: "Help & Support",
      subtitle: "FAQs and customer care",
      onPress: () => Alert.alert("Support", "FoodyGo Customer Care: support@foodygo.com"),
    },
    {
      icon: "moon-outline",
      label: "Appearance",
      subtitle: "System theme default",
      disabled: true,
    },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.textPrimary }]}>Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User / Guest Banner */}
        {isAuthenticated && user ? (
          <View style={styles.userCard}>
            {user.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.avatarImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {user.fullName?.charAt(0)?.toUpperCase() ?? "U"}
                </Text>
              </View>
            )}

            <View style={styles.userInfo}>
              <Text style={[typography.h3, styles.userName]} numberOfLines={1}>
                {user.fullName}
              </Text>
              <Text style={[typography.caption, styles.userEmail]} numberOfLines={1}>
                {user.email}
              </Text>
              <View style={styles.memberBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#2E7D32" />
                <Text style={styles.memberBadgeText}>Verified Member</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="person-outline" size={32} color={colors.primary} />
            </View>
            <Text style={[typography.h3, styles.guestTitle]}>
              Welcome to FoodyGo!
            </Text>
            <Text style={[typography.caption, styles.guestSubtitle]}>
              Sign in to manage your orders, save addresses, and unlock exclusive discounts.
            </Text>
            <Button
              title="Sign In / Register"
              onPress={() => router.push("/(auth)/login")}
              style={{ marginTop: 14, width: "100%" }}
            />
          </View>
        )}

        {/* Section 1: Orders & Saved */}
        <View style={styles.sectionContainer}>
          <Text style={[typography.captionBold, styles.sectionTitle]}>
            ORDERS & SAVED
          </Text>
          <View style={styles.menuCard}>
            {mainMenu.map((item, index) => (
              <MenuItemRow
                key={item.label}
                item={item}
                isLast={index === mainMenu.length - 1}
                onPress={() => {
                  if (item.route) router.push(item.route);
                  else if (item.onPress) item.onPress();
                }}
              />
            ))}
          </View>
        </View>

        {/* Section 2: App & Support */}
        <View style={styles.sectionContainer}>
          <Text style={[typography.captionBold, styles.sectionTitle]}>
            APP & SUPPORT
          </Text>
          <View style={styles.menuCard}>
            {appMenu.map((item, index) => (
              <MenuItemRow
                key={item.label}
                item={item}
                isLast={index === appMenu.length - 1}
                onPress={item.onPress}
              />
            ))}
          </View>
        </View>

        {/* Logout Button (if logged in) */}
        {isAuthenticated && (
          <View style={styles.logoutWrapper}>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="outline"
              loading={logout.isPending}
              textStyle={{ color: colors.error }}
              style={{ borderColor: colors.error }}
            />
          </View>
        )}

        <Text style={[typography.caption, styles.versionText]}>
          FoodyGo Customer App • v1.0.0 (Production Build)
        </Text>
      </ScrollView>
    </View>
  );
}

function MenuItemRow({
  item,
  isLast,
  onPress,
}: {
  item: MenuItem;
  isLast: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={item.disabled || !onPress}
      activeOpacity={0.7}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
    >
      <View style={styles.menuIconCircle}>
        <Ionicons name={item.icon} size={18} color={colors.primary} />
      </View>

      <View style={styles.menuItemTextCol}>
        <Text style={[typography.bodyBold, styles.menuItemLabel]}>
          {item.label}
        </Text>
        {item.subtitle ? (
          <Text style={[typography.caption, styles.menuItemSubtitle]}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>

      {!item.disabled ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      ) : (
        <Text style={[typography.caption, { color: colors.textTertiary }]}>Soon</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.border,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.primary,
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 18,
  },
  userEmail: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  memberBadgeText: {
    color: "#2E7D32",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  guestCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  guestIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  guestTitle: {
    color: colors.textPrimary,
  },
  guestSubtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  sectionContainer: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F4F5F7",
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemLabel: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  menuItemSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutWrapper: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  versionText: {
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: 24,
  },
});
