import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { typography } from "../../constants/typography";
import { colors } from "../../constants/colors";

export interface CategoryItem {
  id: string;
  name: string;
  imageUrl: string;
  query?: string;
}

interface CategoryBubbleProps {
  item: CategoryItem;
  onPress: (item: CategoryItem) => void;
}

export function CategoryBubble({ item, onPress }: CategoryBubbleProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <Text style={[typography.captionBold, styles.label]} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 72,
    marginRight: 12,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  label: {
    color: colors.textPrimary,
    marginTop: 6,
    textAlign: "center",
  },
});
