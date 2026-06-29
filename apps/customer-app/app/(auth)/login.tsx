import { useCallback, useState } from "react";
import {
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { Button } from "../../src/components/ui/Button";
import { TextInput } from "../../src/components/ui/TextInput";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { useLogin, useGoogleSignIn } from "../../src/hooks/use-auth";
import { loginResolver, type LoginFormData } from "../../src/lib/validators";

export default function LoginScreen() {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const login = useLogin();
  const googleSignIn = useGoogleSignIn();

  const { control, handleSubmit, formState } = useForm<LoginFormData>({
    resolver: loginResolver,
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = useCallback(
    (data: LoginFormData) => {
      setGeneralError(null);
      login.mutate(data, {
        onSuccess: () => {
          console.log("[Auth] Login successful, redirected to home");
          router.replace("/(tabs)/home");
        },
        onError: (error) => {
          console.warn("[Auth] Login failed:", error?.message ?? error);
          setGeneralError(error?.message ?? "Invalid email or password");
        },
      });
    },
    [login],
  );

  const handleGoogle = useCallback(async () => {
    setGeneralError(null);
    try {
      await googleSignIn.signIn();
    } catch (error) {
      setGeneralError(
        error instanceof Error ? error.message : "Google sign-in failed",
      );
    }
  }, [googleSignIn]);

  const isSubmitting = login.isPending || googleSignIn.isLoading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[
            typography.h1,
            { color: colors.textPrimary, textAlign: "center", marginBottom: spacing.sm },
          ]}
        >
          Welcome Back
        </Text>
        <Text
          style={[
            typography.body,
            {
              color: colors.textSecondary,
              textAlign: "center",
              marginBottom: spacing["3xl"],
            },
          ]}
        >
          Sign in to continue ordering
        </Text>

        {generalError && (
          <View
            style={{
              backgroundColor: colors.errorBg,
              borderRadius: 10,
              padding: spacing.md,
              marginBottom: spacing.lg,
            }}
          >
            <Text style={[typography.bodySmall, { color: colors.error }]}>
              {generalError}
            </Text>
          </View>
        )}

        {isSubmitting ? (
          <>
            <Skeleton height={20} width="30%" style={{ marginBottom: spacing.xs }} />
            <Skeleton height={48} borderRadius={10} style={{ marginBottom: spacing.lg }} />
            <Skeleton height={20} width="25%" style={{ marginBottom: spacing.xs }} />
            <Skeleton height={48} borderRadius={10} style={{ marginBottom: spacing["2xl"] }} />
            <Skeleton height={50} borderRadius={10} style={{ marginBottom: spacing.lg }} />
          </>
        ) : (
          <>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <TextInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <TextInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  secureTextEntry
                  autoComplete="password"
                  placeholder="Enter your password"
                />
              )}
            />

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              disabled={Object.keys(formState.errors).length > 0}
              style={{ marginBottom: spacing.lg }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: spacing.lg,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text
                style={[
                  typography.caption,
                  { color: colors.textTertiary, marginHorizontal: spacing.md },
                ]}
              >
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            <Button
              title="Continue with Google"
              onPress={handleGoogle}
              variant="outline"
              style={{ marginBottom: spacing.lg }}
            />

            <Button
              title="Create Account"
              onPress={() => router.push("/(auth)/register")}
              variant="ghost"
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
