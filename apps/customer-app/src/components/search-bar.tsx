import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";
import { layout } from "../constants/layout";

export function SearchBar() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/search")}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surfaceAlt,
        borderRadius: layout.inputBorderRadius,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Ionicons name="search" size={20} color={colors.textTertiary} />
      <Text
        style={[
          typography.body,
          { color: colors.textTertiary, marginLeft: spacing.sm, flex: 1 },
        ]}
      >
        Search restaurants...
      </Text>
    </TouchableOpacity>
  );
}
