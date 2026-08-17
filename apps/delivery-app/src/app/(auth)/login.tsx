import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "../../lib/zod-resolver";
import { z } from "zod";
import { TextInput } from "../../components/ui/TextInput";
import { Button } from "../../components/ui/Button";
import { colors } from "../../constants/colors";
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
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => {
    setError("");
    login.mutate(data, {
      onError: (err: Error) => {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error?.message ?? "Login failed");
        } else {
          setError(err.message || "Login failed");
        }
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
          padding: 24,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={{ alignItems: "center", marginBottom: 12, gap: 10 }}>
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 24,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Ionicons name="bicycle" size={40} color="#FFFFFF" />
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.5 }}>
              FoodyGo <Text style={{ color: colors.primary }}>Driver</Text>
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
              Sign in to start delivering & earning
            </Text>
          </View>
        </View>

        {error ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.errorBg,
              borderWidth: 1,
              borderColor: colors.errorBorder,
              padding: 12,
              borderRadius: 12,
            }}
          >
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={{ color: colors.error, fontSize: 13, flex: 1, fontWeight: "500" }}>
              {error}
            </Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email Address"
              placeholder="partner@foodygo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.email?.message}
              leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              }
            />
          )}
        />

        <Button
          title="Sign In as Delivery Partner"
          icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          iconPosition="right"
          onPress={handleSubmit(onSubmit)}
          loading={login.isPending}
          size="lg"
          style={{ marginTop: 8 }}
        />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>Want to become a partner?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/partner-register")}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primary }}>
              Register Now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
