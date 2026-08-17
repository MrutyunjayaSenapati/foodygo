import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface VegBadgeProps {
  isVeg?: boolean;
  size?: number;
  style?: ViewStyle;
}

export function VegBadge({ isVeg = true, size = 14, style }: VegBadgeProps) {
  const color = isVeg ? "#2E7D32" : "#C62828";
  const innerSize = Math.max(4, Math.round(size * 0.45));

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderColor: color,
          borderRadius: 3,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: isVeg ? innerSize / 2 : 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  dot: {},
});
