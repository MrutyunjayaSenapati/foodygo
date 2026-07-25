import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "../../lib/zod-resolver";
import { z } from "zod";
import { TextInput } from "../../components/ui/TextInput";
import { Button } from "../../components/ui/Button";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { useLogin } from "../../hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const login = useLogin();
  const [error, setError] = useState("");

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => {
    setError("");
    login.mutate(data, {
      onError: (err: any) => {
        setError(err?.response?.data?.error?.message ?? "Login failed");
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: spacing.xl,
          gap: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text, textAlign: "center" }}>
          FoodyGo Delivery
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg }}>
          Sign in to start delivering
        </Text>

        {error && (
          <View style={{ backgroundColor: "#FEE2E2", padding: spacing.md, borderRadius: 8 }}>
            <Text style={{ color: colors.error, fontSize: 14, textAlign: "center" }}>{error}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email"
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Button
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={login.isPending}
          size="lg"
        />

        <Button
          title="Create an account"
          onPress={() => router.push("/(auth)/register")}
          variant="outline"
          size="md"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
