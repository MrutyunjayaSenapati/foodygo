import { Text, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";

interface Chip {
  key: string;
  label: string;
}

interface FilterChipsProps {
  chips: Chip[];
  selected: string | null;
  onSelect: (key: string | null) => void;
}

export function FilterChips({ chips, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
    >
      {chips.map((chip) => {
        const isSelected = selected === chip.key;
        return (
          <TouchableOpacity
            key={chip.key}
            onPress={() => onSelect(isSelected ? null : chip.key)}
            activeOpacity={0.7}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: 20,
              backgroundColor: isSelected ? colors.primary : colors.surfaceAlt,
              borderWidth: 1,
              borderColor: isSelected ? colors.primary : colors.border,
            }}
          >
            <Text
              style={[
                typography.captionBold,
                { color: isSelected ? colors.textInverse : colors.textSecondary },
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
