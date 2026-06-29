import { View, Text, Alert } from "react-native";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { Button } from "../../src/components/ui/Button";
import { useAuthStore } from "../../src/store/auth-store";
import { useLogout } from "../../src/hooks/use-auth";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout.mutate() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.xl }}>
      <View style={{ alignItems: "center", marginTop: 40, marginBottom: 40 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primaryBg,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: spacing.lg,
          }}
        >
          <Text style={[typography.h1, { color: colors.primary }]}>
            {user?.fullName?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          {user?.fullName ?? "Guest"}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
          {user?.email ?? ""}
        </Text>
      </View>

      <Button
        title="Addresses"
        onPress={() => {}}
        variant="ghost"
        style={{ marginBottom: spacing.sm }}
      />
      <Button
        title="Favorites"
        onPress={() => {}}
        variant="ghost"
        style={{ marginBottom: spacing.sm }}
      />
      <Button
        title="Notifications"
        onPress={() => {}}
        variant="ghost"
        style={{ marginBottom: spacing["3xl"] }}
      />

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        loading={logout.isPending}
      />
    </View>
  );
}
