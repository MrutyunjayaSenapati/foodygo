import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from "../../src/hooks/use-addresses";
import { Button } from "../../src/components/ui/Button";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { EmptyState } from "../../src/components/ui/EmptyState";
import type { Address } from "../../src/types";

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = useCallback(
    (address: Address) => {
      Alert.alert(
        "Delete Address",
        `Delete ${address.label || "this address"}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteAddress.mutate(address.id),
          },
        ],
      );
    },
    [deleteAddress],
  );

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setShowForm(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
  }, []);

  const editingAddress = editingId
    ? addresses?.find((a) => a.id === editingId) ?? null
    : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]}>
          Addresses
        </Text>
        {!showForm && (
          <TouchableOpacity onPress={() => setShowForm(true)}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {showForm ? (
        <AddressForm
          initialData={editingAddress}
          loading={createAddress.isPending || updateAddress.isPending}
          onSubmit={async (data) => {
            if (editingAddress) {
              await updateAddress.mutateAsync({ id: editingAddress.id, data });
            } else {
              await createAddress.mutateAsync(data);
            }
            handleFormSuccess();
          }}
          onCancel={handleFormClose}
        />
      ) : isLoading ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {[1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={100} />
          ))}
        </View>
      ) : (
        <FlatList
          data={addresses ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          ListEmptyComponent={
            <EmptyState
              title="No addresses saved"
              description="Add an address for delivery"
              action={
                <Button
                  title="Add Address"
                  onPress={() => setShowForm(true)}
                />
              }
            />
          }
          renderItem={({ item }) => (
            <View
              style={{
                padding: spacing.md,
                borderRadius: 12,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    {item.label && (
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 4,
                          backgroundColor: colors.primaryBg,
                        }}
                      >
                        <Text style={[typography.captionBold, { color: colors.primary }]}>
                          {item.label}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[typography.body, { color: colors.textPrimary, marginTop: 4 }]}>
                    {item.addressLine1}
                    {item.addressLine2 ? `, ${item.addressLine2}` : ""}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    {item.city}, {item.state} {item.postalCode}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: spacing.md, marginTop: spacing.md }}>
                <TouchableOpacity onPress={() => handleEdit(item.id)}>
                  <Ionicons name="pencil-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
}) {
  return (
    <View>
      <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 4 }]}>
        {label}
        {required ? " *" : ""}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          ...typography.body,
          color: colors.textPrimary,
        }}
      />
    </View>
  );
}

function AddressForm({
  initialData,
  loading,
  onSubmit,
  onCancel,
}: {
  initialData: Address | null;
  loading: boolean;
  onSubmit: (data: {
    label?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initialData?.label ?? "");
  const [addressLine1, setAddressLine1] = useState(initialData?.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(initialData?.addressLine2 ?? "");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [state, setState] = useState(initialData?.state ?? "");
  const [postalCode, setPostalCode] = useState(initialData?.postalCode ?? "");

  const handleSubmit = async () => {
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      Alert.alert("Required Fields", "Please fill in all required fields.");
      return;
    }

    await onSubmit({
      label: label.trim() || undefined,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
    });
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      keyboardShouldPersistTaps="handled"
    >
      <Field
        label="Label"
        placeholder="e.g. Home, Work"
        value={label}
        onChangeText={setLabel}
      />
      <Field
        label="Address Line 1"
        placeholder="Street address"
        value={addressLine1}
        onChangeText={setAddressLine1}
        required
      />
      <Field
        label="Address Line 2"
        placeholder="Apt, suite, etc."
        value={addressLine2}
        onChangeText={setAddressLine2}
      />
      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <View style={{ flex: 2 }}>
          <Field
            label="City"
            placeholder="City"
            value={city}
            onChangeText={setCity}
            required
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="State"
            placeholder="State"
            value={state}
            onChangeText={setState}
            required
          />
        </View>
      </View>
      <Field
        label="Postal Code"
        placeholder="Postal code"
        value={postalCode}
        onChangeText={setPostalCode}
        required
      />
      <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Button title="Cancel" variant="outline" onPress={onCancel} />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={initialData ? "Update" : "Save"}
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
}
