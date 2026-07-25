import { View, Text } from "react-native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { Button } from "./Button";

interface ErrorRetryProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorRetry({ message = "Something went wrong", onRetry }: ErrorRetryProps) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", padding: spacing["4xl"], gap: spacing.md }}>
      <Text style={{ fontSize: 16, color: colors.error, textAlign: "center" }}>{message}</Text>
      {onRetry && <Button title="Try Again" onPress={onRetry} variant="outline" size="sm" />}
    </View>
  );
}
