import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "../../lib/zod-resolver";
import { z } from "zod";
import { TextInput } from "../../components/ui/TextInput";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { colors } from "../../constants/colors";
import { usePartnerRegister } from "../../hooks/use-auth";

const vehicles = [
  { value: "BIKE", label: "Bike", icon: "bicycle" as const },
  { value: "SCOOTER", label: "Scooter", icon: "speedometer" as const },
  { value: "CAR", label: "Car", icon: "car-sport" as const },
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
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 8, gap: 8 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              backgroundColor: colors.primaryBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="speedometer" size={36} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "center" }}>
            Vehicle Registration
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center" }}>
            Select your mode of delivery transportation
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

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary }}>
            Vehicle Type
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {vehicles.map((v) => {
              const isSelected = selectedVehicle === v.value;
              return (
                <TouchableOpacity
                  key={v.value}
                  onPress={() => setValue("vehicleType", v.value, { shouldValidate: true })}
                  style={{ flex: 1 }}
                  activeOpacity={0.8}
                >
                  <Card
                    style={{
                      alignItems: "center",
                      paddingVertical: 16,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primaryBg : colors.surface,
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name={v.icon}
                      size={24}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: isSelected ? colors.primary : colors.text,
                      }}
                    >
                      {v.label}
                    </Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.vehicleType && (
            <Text style={{ fontSize: 12, color: colors.error, marginLeft: 2 }}>{errors.vehicleType.message}</Text>
          )}
        </View>

        <Controller
          control={control}
          name="licenseNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Vehicle License Number"
              placeholder="e.g. OD-05-AK-6397"
              autoCapitalize="characters"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.licenseNumber?.message}
              leftIcon={<Ionicons name="card-outline" size={18} color={colors.textSecondary} />}
            />
          )}
        />

        <Button
          title="Complete Setup & Go Online"
          icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
          onPress={handleSubmit(onSubmit)}
          loading={partnerRegister.isPending}
          size="lg"
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
