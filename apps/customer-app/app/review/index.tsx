import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreateReview } from "../../src/hooks/use-reviews";
import { Button } from "../../src/components/ui/Button";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";

export default function ReviewScreen() {
  const { restaurantId, restaurantName } = useLocalSearchParams<{
    restaurantId: string;
    restaurantName: string;
  }>();
  const insets = useSafeAreaInsets();
  const createReview = useCreateReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      await createReview.mutateAsync({ restaurantId: restaurantId!, rating, comment: comment || undefined });
      setSubmitted(true);
    } catch {
      // Error handled by mutation
    }
  };

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: spacing["3xl"] }}>
          <Ionicons name="checkmark-circle" size={72} color={colors.success} />
          <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.lg }]}>
            Review Submitted
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm }]}>
            Thank you for your review!
          </Text>
          <Button
            title="Back to Order"
            onPress={() => router.back()}
            style={{ marginTop: spacing["2xl"] }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <Header />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[typography.h3, { color: colors.textPrimary, textAlign: "center" }]}>
            Rate your experience
          </Text>
          <Text
            style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: spacing.xs }]}
          >
            {restaurantName ?? "Restaurant"}
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: spacing["2xl"] }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={44}
                  color={star <= rating ? colors.rating : colors.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={[typography.caption, { color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm }]}>
              {["", "Terrible", "Poor", "Average", "Good", "Excellent"][rating]}
            </Text>
          )}

          <View style={{ marginTop: spacing["2xl"] }}>
            <Text style={[typography.label, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              Comment (optional)
            </Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: spacing.md,
                fontSize: typography.body.fontSize,
                color: colors.textPrimary,
                backgroundColor: colors.surface,
                minHeight: 120,
                textAlignVertical: "top",
              }}
            />
          </View>
        </ScrollView>

        <View style={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.lg }}>
          <Button
            title="Submit Review"
            onPress={handleSubmit}
            loading={createReview.isPending}
            disabled={rating === 0}
          />
          {createReview.isError && (
            <Text style={[typography.caption, { color: colors.error, textAlign: "center", marginTop: spacing.sm }]}>
              {createReview.error?.message ?? "Failed to submit review"}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Header() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[typography.h3, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]}>
        Write a Review
      </Text>
    </View>
  );
}
