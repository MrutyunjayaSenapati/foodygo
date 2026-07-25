import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "../../lib/zod-resolver";
import { z } from "zod";
import { TextInput } from "../../components/ui/TextInput";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { usePartnerRegister } from "../../hooks/use-auth";

const vehicles = [
  { value: "BIKE", label: "Bike" },
  { value: "SCOOTER", label: "Scooter" },
  { value: "CAR", label: "Car" },
] as const;

const partnerSchema = z.object({
  vehicleType: z.enum(["BIKE", "SCOOTER", "CAR"]),
  licenseNumber: z.string().min(1, "License number is required").max(100),
});

type PartnerForm = z.infer<typeof partnerSchema>;

export default function PartnerRegisterScreen() {
  const partnerRegister = usePartnerRegister();
  const [error, setError] = useState("");

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<PartnerForm>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { vehicleType: undefined, licenseNumber: "" },
  });

  const selectedVehicle = watch("vehicleType");

  const onSubmit = (data: PartnerForm) => {
    setError("");
    partnerRegister.mutate(data, {
      onError: (err: any) => {
        setError(err?.response?.data?.error?.message ?? "Registration failed");
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
          Vehicle Details
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg }}>
          Tell us about your delivery vehicle
        </Text>

        {error && (
          <View style={{ backgroundColor: "#FEE2E2", padding: spacing.md, borderRadius: 8 }}>
            <Text style={{ color: colors.error, fontSize: 14, textAlign: "center" }}>{error}</Text>
          </View>
        )}

        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>Vehicle Type</Text>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {vehicles.map((v) => (
            <TouchableOpacity
              key={v.value}
              onPress={() => setValue("vehicleType", v.value, { shouldValidate: true })}
              style={{ flex: 1 }}
            >
              <Card
                style={{
                  alignItems: "center",
                  padding: spacing.lg,
                  borderWidth: 2,
                  borderColor: selectedVehicle === v.value ? colors.primary : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: selectedVehicle === v.value ? colors.primary : colors.text,
                  }}
                >
                  {v.label}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
        {errors.vehicleType && (
          <Text style={{ fontSize: 12, color: colors.error }}>{errors.vehicleType.message}</Text>
        )}

        <Controller
          control={control}
          name="licenseNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="License Number"
              placeholder="DL-12345678"
              autoCapitalize="characters"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.licenseNumber?.message}
            />
          )}
        />

        <Button
          title="Start Delivering"
          onPress={handleSubmit(onSubmit)}
          loading={partnerRegister.isPending}
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
