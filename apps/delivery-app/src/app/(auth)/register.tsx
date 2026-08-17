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
import { useRegister } from "../../hooks/use-auth";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[a-z]/, "Needs a lowercase letter")
    .regex(/[A-Z]/, "Needs an uppercase letter")
    .regex(/[0-9]/, "Needs a number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const register = useRegister();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: RegisterForm) => {
    setError("");
    register.mutate(data, {
      onError: (err: Error) => {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error?.message ?? "Registration failed");
        } else {
          setError(err.message || "Registration failed");
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
          gap: 14,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 8, gap: 8 }}>
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 22,
              backgroundColor: colors.primaryBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person-add" size={32} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "center" }}>
            Join as Delivery Partner
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center" }}>
            Earn money on your own schedule
          </Text>
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
            <Text style={{ color: colors.error, fontSize: 13, flex: 1, fontWeight: "500" }}>{error}</Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.fullName?.message}
              leftIcon={<Ionicons name="person-outline" size={18} color={colors.textSecondary} />}
            />
          )}
        />

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
              placeholder="Min 8 chars, upper, lower, number"
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

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Confirm Password"
              placeholder="Repeat password"
              secureTextEntry={!showPassword}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
              leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />}
            />
          )}
        />

        <Button
          title="Create Account & Continue"
          icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          iconPosition="right"
          onPress={handleSubmit(onSubmit)}
          loading={register.isPending}
          size="lg"
          style={{ marginTop: 8 }}
        />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>Already registered?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primary }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
