import { View, Text, Alert, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { Button } from "../../src/components/ui/Button";
import { useAuthStore } from "../../src/store/auth-store";
import { useLogout } from "../../src/hooks/use-auth";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  onPress?: () => void;
  destructive?: boolean;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout.mutate() },
    ]);
  };

  const mainMenu: MenuItem[] = [
    { icon: "receipt-outline", label: "My Orders", route: "/order/history" },
    { icon: "heart-outline", label: "Favorites", route: "/favorites/index" },
    { icon: "location-outline", label: "Addresses", route: "/addresses/index" },
    { icon: "notifications-outline", label: "Notifications", route: "/notifications/index" },
  ];

  const settingsMenu: MenuItem[] = [
    { icon: "moon-outline", label: "Dark Mode" },
    { icon: "notifications-off-outline", label: "Notification Preferences" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", paddingVertical: spacing["2xl"] }}>
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.border,
                marginBottom: spacing.lg,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primaryBg,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: spacing.lg,
              }}
            >
              <Text style={[typography.h1, { color: colors.primary }]}>
                {user?.fullName?.charAt(0)?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            {user?.fullName ?? "Guest"}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
            {user?.email ?? ""}
          </Text>
        </View>

        <Section title="Orders & Saved">
          {mainMenu.map((item) => (
            <MenuItemRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              onPress={() => {
                if (item.route) router.push(item.route);
              }}
            />
          ))}
        </Section>

        <Section title="Settings">
          {settingsMenu.map((item) => (
            <MenuItemRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              disabled
            />
          ))}
        </Section>

        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            loading={logout.isPending}
            textStyle={{ color: colors.error }}
            style={{ borderColor: colors.error }}
          />
        </View>

        <View style={{ height: spacing["6xl"] }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text
        style={[
          typography.captionBold,
          { color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      <View
        style={{
          marginHorizontal: spacing.lg,
          borderRadius: 12,
          backgroundColor: colors.surface,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function MenuItemRow({
  icon,
  label,
  onPress,
  disabled,
  destructive
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
      }}
    >
      <Ionicons name={icon} size={20} color={destructive ? colors.error : colors.textPrimary} />
      <Text
        style={[
          typography.body,
          {
            color: destructive ? colors.error : colors.textPrimary,
            flex: 1,
            marginLeft: spacing.md,
          },
        ]}
      >
        {label}
      </Text>
      {!disabled ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      ) : (
        <Text style={[typography.caption, { color: colors.textTertiary }]}>Soon</Text>
      )}
    </TouchableOpacity>
  );
}
