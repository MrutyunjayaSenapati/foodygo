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
import { useRegister } from "../../src/hooks/use-auth";
import {
  registerResolver,
  type RegisterFormData,
} from "../../src/lib/validators";

export default function RegisterScreen() {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const register = useRegister();

  const { control, handleSubmit, formState, watch } = useForm<RegisterFormData>({
    resolver: registerResolver,
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");

  const onSubmit = useCallback(
    (data: RegisterFormData) => {
      setGeneralError(null);
      register.mutate(
        { fullName: data.fullName, email: data.email, password: data.password },
        {
          onSuccess: () => {
            console.log("[Auth] Register successful, redirected to home");
            router.replace("/(tabs)/home");
          },
          onError: (error) => {
            console.warn("[Auth] Register failed:", error?.message ?? error);
            setGeneralError(error?.message ?? "Registration failed. Please try again.");
          },
        },
      );
    },
    [register],
  );

  const isSubmitting = register.isPending;

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
          Create Account
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
          Join FoodyGo today
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
            <Skeleton height={48} borderRadius={10} style={{ marginBottom: spacing.lg }} />
            <Skeleton height={20} width="20%" style={{ marginBottom: spacing.xs }} />
            <Skeleton height={48} borderRadius={10} style={{ marginBottom: spacing.lg }} />
            <Skeleton height={20} width="35%" style={{ marginBottom: spacing.xs }} />
            <Skeleton height={48} borderRadius={10} style={{ marginBottom: spacing["2xl"] }} />
            <Skeleton height={50} borderRadius={10} />
          </>
        ) : (
          <>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <TextInput
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  autoCapitalize="words"
                  autoComplete="name"
                  placeholder="John Doe"
                />
              )}
            />

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
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <TextInput
                  label="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                  secureTextEntry
                  autoComplete="off"
                  placeholder="Re-enter password"
                />
              )}
            />

            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={[
                  typography.caption,
                  { color: passwordValue?.length >= 8 ? colors.success : colors.textTertiary, marginBottom: 2 },
                ]}
              >
                At least 8 characters
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: /[A-Z]/.test(passwordValue ?? "") ? colors.success : colors.textTertiary, marginBottom: 2 },
                ]}
              >
                One uppercase letter
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: /[a-z]/.test(passwordValue ?? "") ? colors.success : colors.textTertiary, marginBottom: 2 },
                ]}
              >
                One lowercase letter
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: /[0-9]/.test(passwordValue ?? "") ? colors.success : colors.textTertiary },
                ]}
              >
                One number
              </Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              disabled={Object.keys(formState.errors).length > 0}
              style={{ marginBottom: spacing.lg }}
            />

            <Button
              title="Already have an account? Sign In"
              onPress={() => router.back()}
              variant="ghost"
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
