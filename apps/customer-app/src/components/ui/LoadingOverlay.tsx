import { View, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

interface LoadingOverlayProps {
  visible: boolean;
}

export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View
      style={{
        ...StyleSheet.absoluteFill,
        backgroundColor: colors.overlay,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </View>
  );
}
