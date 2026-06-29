import { View, Text } from "react-native";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { spacing } from "../../constants/spacing";
import { Button } from "./Button";

interface ErrorRetryProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorRetry({
  message = "Something went wrong",
  onRetry,
}: ErrorRetryProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing["3xl"],
      }}
    >
      <Text style={{ fontSize: 48, marginBottom: spacing.lg }}>!</Text>
      <Text
        style={[
          typography.h3,
          { color: colors.textPrimary, textAlign: "center", marginBottom: spacing.sm },
        ]}
      >
        Oops!
      </Text>
      <Text
        style={[
          typography.body,
          { color: colors.textSecondary, textAlign: "center", marginBottom: spacing.xl },
        ]}
      >
        {message}
      </Text>
      {onRetry && <Button title="Try Again" onPress={onRetry} variant="outline" />}
    </View>
  );
}
