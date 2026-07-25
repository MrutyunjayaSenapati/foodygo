import { View, ActivityIndicator } from "react-native";
import { colors } from "../../constants/colors";

export function LoadingOverlay() {
  return (
    <View
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: colors.overlay,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
