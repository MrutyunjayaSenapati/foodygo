import React, { useState, useCallback } from "react";
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
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "../../src/hooks/use-addresses";
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
        `Are you sure you want to delete ${address.label || "this address"}?`,
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

  const editingAddress = editingId
    ? addresses?.find((a) => a.id === editingId) ?? null
    : null;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h3, styles.headerTitle]}>
          Saved Addresses
        </Text>
        {!showForm && (
          <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addIconBtn}>
            <Ionicons name="add-circle" size={26} color={colors.primary} />
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
            handleFormClose();
          }}
          onCancel={handleFormClose}
        />
      ) : isLoading ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton width="100%" height={100} />
          <Skeleton width="100%" height={100} />
        </View>
      ) : (
        <FlatList
          data={addresses ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No addresses saved"
              description="Add a delivery address to order faster."
              action={
                <Button
                  title="Add New Address"
                  onPress={() => setShowForm(true)}
                />
              }
            />
          }
          renderItem={({ item }) => (
            <View style={styles.addressCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.pinCircle}>
                  <Ionicons name="location" size={18} color={colors.primary} />
                </View>
                <View style={styles.addressDetails}>
                  <View style={styles.labelRow}>
                    <Text style={[typography.bodyBold, styles.addressLabel]}>
                      {item.label || "Home"}
                    </Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>SAVED</Text>
                    </View>
                  </View>
                  <Text style={[typography.bodySmall, styles.addressLine]}>
                    {item.addressLine1}
                    {item.addressLine2 ? `, ${item.addressLine2}` : ""}
                  </Text>
                  <Text style={[typography.caption, styles.cityState]}>
                    {item.city}, {item.state} {item.postalCode}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  onPress={() => handleEdit(item.id)}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
                  <Text style={[typography.captionBold, styles.actionButtonText]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  style={[styles.actionButton, styles.deleteButton]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                  <Text style={[typography.captionBold, styles.deleteButtonText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </KeyboardAvoidingView>
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
  const [label, setLabel] = useState(initialData?.label ?? "Home");
  const [addressLine1, setAddressLine1] = useState(initialData?.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(initialData?.addressLine2 ?? "");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [state, setState] = useState(initialData?.state ?? "");
  const [postalCode, setPostalCode] = useState(initialData?.postalCode ?? "");

  const handleSubmit = async () => {
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      Alert.alert("Required Fields", "Please fill in Address, City, State, and Postal Code.");
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
      contentContainerStyle={styles.formContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8 }]}>
        ADDRESS TYPE
      </Text>
      <View style={styles.labelChips}>
        {["Home", "Work", "Other"].map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => setLabel(tag)}
            style={[styles.labelChip, label === tag && styles.labelChipActive]}
          >
            <Text style={[styles.labelChipText, label === tag && styles.labelChipTextActive]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field
        label="Street Address *"
        placeholder="House no, Flat, Building, Area"
        value={addressLine1}
        onChangeText={setAddressLine1}
      />
      <Field
        label="Landmark / Suite"
        placeholder="Near City Park, Apt 4B"
        value={addressLine2}
        onChangeText={setAddressLine2}
      />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 2 }}>
          <Field
            label="City *"
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="State *"
            placeholder="State"
            value={state}
            onChangeText={setState}
          />
        </View>
      </View>
      <Field
        label="Postal Code *"
        placeholder="Pin Code"
        value={postalCode}
        onChangeText={setPostalCode}
        keyboardType="numeric"
      />

      <View style={styles.formBtnRow}>
        <View style={{ flex: 1 }}>
          <Button title="Cancel" variant="outline" onPress={onCancel} />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={initialData ? "Update" : "Save Address"}
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 4 }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textTertiary}
        style={styles.fieldInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  backBtn: {
    marginRight: 12,
    padding: 2,
  },
  headerTitle: {
    color: colors.textPrimary,
    flex: 1,
  },
  addIconBtn: {
    padding: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addressDetails: {
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addressLabel: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  typeBadge: {
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
  },
  addressLine: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  cityState: {
    color: colors.textTertiary,
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F4F5F7",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F8F9FA",
  },
  actionButtonText: {
    color: colors.textSecondary,
    marginLeft: 4,
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: "#FFF2F2",
  },
  deleteButtonText: {
    color: colors.error,
    marginLeft: 4,
    fontSize: 12,
  },
  formContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  labelChips: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  labelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEEF1",
  },
  labelChipActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  labelChipText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  labelChipTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  fieldInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E2E6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  formBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
});
