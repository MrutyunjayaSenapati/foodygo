import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
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
import { useCartStore, CartItemInput } from "../../src/store/cart-store";
import { useAddresses, useCreateAddress } from "../../src/hooks/use-addresses";
import { useCreateOrder } from "../../src/hooks/use-orders";
import { useCreatePaymentOrder, useVerifyPayment } from "../../src/hooks/use-payments";
import { useRestaurantDetail } from "../../src/hooks/use-restaurants";
import { BillCard } from "../../src/components/ui/BillCard";
import { Button } from "../../src/components/ui/Button";
import { Skeleton } from "../../src/components/ui/Skeleton";
import { EmptyState } from "../../src/components/ui/EmptyState";
import type { Address } from "../../src/types";

const TAX_RATE = 0.08;
const PACKING_FEE = 0.14;
const DELIVERY_FEE = 0;

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [createdAddressId, setCreatedAddressId] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");

  const items = useCartStore((s) => s.items);
  const restaurantId = useCartStore((s) => s.restaurantId);
  const itemCount = useCartStore((s) => s.itemCount);
  const subtotal = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clearCart);

  const { data: addresses, isLoading: loadingAddresses } = useAddresses();
  const { data: restaurant } = useRestaurantDetail(restaurantId ?? "");
  const createAddress = useCreateAddress();
  const createOrder = useCreateOrder();
  const createPaymentOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();

  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax + PACKING_FEE + DELIVERY_FEE;

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  }, [step]);

  const handleSelectAddress = useCallback((id: string) => {
    setSelectedAddressId(id);
  }, []);

  const handleAddressCreated = useCallback((address: Address) => {
    setSelectedAddressId(address.id);
    setCreatedAddressId(address.id);
    setShowAddForm(false);
  }, []);

  const activeAddressId =
    selectedAddressId ??
    createdAddressId ??
    addresses?.[0]?.id ??
    null;

  const handleContinueToReview = useCallback(() => {
    if (activeAddressId) {
      if (!selectedAddressId) setSelectedAddressId(activeAddressId);
      setStep(1);
    }
  }, [activeAddressId, selectedAddressId]);

  const handlePlaceOrder = useCallback(async () => {
    const addressIdToUse = selectedAddressId ?? activeAddressId;
    if (!addressIdToUse) return;

    try {
      const order = await createOrder.mutateAsync({
        addressId: addressIdToUse,
      });
      setCreatedOrderId(order.id);

      try {
        const payment = await createPaymentOrder.mutateAsync(order.id);
        setRazorpayOrderId(payment.razorpayOrderId);
      } catch {
        // Fallback for simulated payment order
      }

      setStep(2);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to place order";
      Alert.alert("Order Failed", message);
    }
  }, [selectedAddressId, activeAddressId, createOrder, createPaymentOrder]);

  const handleCompletePayment = useCallback(async () => {
    try {
      if (razorpayOrderId) {
        await verifyPayment.mutateAsync({
          razorpayPaymentId: "pay_" + Date.now(),
          razorpayOrderId: razorpayOrderId,
          razorpaySignature: "simulated",
        });
      }
    } catch {
      // Proceed to live order
    }

    clearCart();
    if (createdOrderId) {
      router.replace(`/order/${createdOrderId}`);
    } else {
      router.replace("/(tabs)/orders");
    }
  }, [razorpayOrderId, verifyPayment, clearCart, createdOrderId]);

  if (items.length === 0 && step < 2) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header step={0} onBack={() => router.back()} loading={false} />
        <EmptyState
          iconName="cart-outline"
          title="Your cart is empty"
          description="Add items from a restaurant before proceeding to checkout."
          action={
            <Button
              title="Browse Restaurants"
              onPress={() => router.replace("/(tabs)/home")}
            />
          }
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header
          step={step}
          onBack={handleBack}
          loading={
            createOrder.isPending ||
            createPaymentOrder.isPending ||
            verifyPayment.isPending
          }
        />

        {step === 0 && (
          <AddressStep
            addresses={addresses ?? []}
            loading={loadingAddresses}
            selectedId={activeAddressId}
            onSelect={handleSelectAddress}
            showAddForm={showAddForm}
            onToggleForm={() => setShowAddForm((s) => !s)}
            onAddressCreated={handleAddressCreated}
            creating={createAddress.isPending}
            deliveryNote={deliveryNote}
            onChangeDeliveryNote={setDeliveryNote}
            onContinue={handleContinueToReview}
            canContinue={!!activeAddressId}
          />
        )}

        {step === 1 && (
          <ReviewStep
            restaurantName={restaurant?.name ?? "Restaurant"}
            restaurantAddress={restaurant?.address ?? ""}
            items={items}
            itemCount={itemCount}
            subtotal={subtotal}
            tax={tax}
            packingFee={PACKING_FEE}
            deliveryFee={DELIVERY_FEE}
            grandTotal={grandTotal}
            loading={createOrder.isPending}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {step === 2 && (
          <PaymentStep
            loading={verifyPayment.isPending}
            orderId={createdOrderId}
            razorpayOrderId={razorpayOrderId}
            onComplete={handleCompletePayment}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function Header({
  step,
  onBack,
  loading,
}: {
  step: number;
  onBack: () => void;
  loading: boolean;
}) {
  const steps = ["1. Address", "2. Review", "3. Payment"];

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h3, styles.headerTitle]}>
          {step === 0 ? "Select Delivery Address" : step === 1 ? "Review Your Order" : "Payment Successful"}
        </Text>
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      {/* 3-Step Progress Bar */}
      <View style={styles.progressBar}>
        {steps.map((label, idx) => (
          <View key={label} style={styles.stepItem}>
            <View
              style={[
                styles.stepBadge,
                idx <= step ? styles.stepBadgeActive : styles.stepBadgeInactive,
              ]}
            >
              <Text
                style={[
                  typography.captionBold,
                  idx <= step ? styles.stepTextActive : styles.stepTextInactive,
                ]}
              >
                {label}
              </Text>
            </View>
            {idx < steps.length - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  idx < step ? styles.stepConnectorActive : styles.stepConnectorInactive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function AddressStep({
  addresses,
  loading,
  selectedId,
  onSelect,
  showAddForm,
  onToggleForm,
  onAddressCreated,
  creating,
  deliveryNote,
  onChangeDeliveryNote,
  onContinue,
  canContinue,
}: {
  addresses: Address[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  showAddForm: boolean;
  onToggleForm: () => void;
  onAddressCreated: (address: Address) => void;
  creating: boolean;
  deliveryNote: string;
  onChangeDeliveryNote: (t: string) => void;
  onContinue: () => void;
  canContinue: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.captionBold, styles.sectionLabel]}>
          SAVED ADDRESSES
        </Text>

        {loading ? (
          <Skeleton width="100%" height={140} />
        ) : addresses.length > 0 ? (
          <View style={{ gap: 12 }}>
            {addresses.map((addr) => {
              const isSelected = selectedId === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  onPress={() => onSelect(addr.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.addressCard,
                    isSelected ? styles.addressCardActive : styles.addressCardInactive,
                  ]}
                >
                  <View style={styles.addressLeft}>
                    <View
                      style={[
                        styles.pinCircle,
                        isSelected ? styles.pinCircleActive : styles.pinCircleInactive,
                      ]}
                    >
                      <Ionicons
                        name="location-sharp"
                        size={18}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                    </View>
                  </View>

                  <View style={styles.addressContent}>
                    <View style={styles.addressHeaderRow}>
                      <Text style={[typography.bodyBold, styles.addressLabel]}>
                        {addr.label || "Home"}
                      </Text>
                      {isSelected && (
                        <View style={styles.selectedTag}>
                          <Text style={styles.selectedTagText}>DELIVER HERE</Text>
                        </View>
                      )}
                    </View>

                    <Text style={[typography.bodySmall, styles.addressText]}>
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    </Text>
                    <Text style={[typography.caption, styles.addressCity]}>
                      {addr.city}, {addr.state} {addr.postalCode}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyAddress}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              No saved addresses found. Add an address below.
            </Text>
          </View>
        )}

        {/* Add Address Form Toggle */}
        <TouchableOpacity
          onPress={onToggleForm}
          activeOpacity={0.7}
          style={styles.addAddressToggle}
        >
          <Ionicons
            name={showAddForm ? "chevron-up" : "add-circle-outline"}
            size={20}
            color={colors.primary}
          />
          <Text style={[typography.bodyBold, { color: colors.primary, marginLeft: 8 }]}>
            {showAddForm ? "Hide Address Form" : "Add New Address"}
          </Text>
        </TouchableOpacity>

        {showAddForm && (
          <AddressForm
            onSubmit={onAddressCreated}
            loading={creating}
          />
        )}

        {/* Delivery Instructions Note */}
        <View style={styles.deliveryNoteCard}>
          <Text style={[typography.captionBold, styles.deliveryNoteLabel]}>
            DELIVERY INSTRUCTIONS (OPTIONAL)
          </Text>
          <TextInput
            value={deliveryNote}
            onChangeText={onChangeDeliveryNote}
            placeholder="e.g. Ring the doorbell, leave at door..."
            placeholderTextColor={colors.textTertiary}
            style={[typography.bodySmall, styles.deliveryNoteInput]}
          />
        </View>
      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
        <Button
          title="Continue to Order Summary →"
          onPress={onContinue}
          disabled={!canContinue}
        />
      </View>
    </View>
  );
}

function AddressForm({
  onSubmit,
  loading,
}: {
  onSubmit: (address: Address) => void;
  loading: boolean;
}) {
  const [label, setLabel] = useState("Home");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const createAddress = useCreateAddress();

  const handleSubmit = async () => {
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      Alert.alert("Required Fields", "Please fill in Address, City, State, and Postal Code.");
      return;
    }

    try {
      const address = await createAddress.mutateAsync({
        label: label.trim() || undefined,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      });
      onSubmit(address);
    } catch {
      Alert.alert("Error", "Failed to save address.");
    }
  };

  return (
    <View style={styles.formCard}>
      <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 8 }]}>
        NEW ADDRESS DETAILS
      </Text>

      {/* Label Chips */}
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
        placeholder="Flat / House no, Building, Street"
        value={addressLine1}
        onChangeText={setAddressLine1}
      />
      <Field
        label="Landmark / Area"
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
      <Button
        title="Save & Select Address"
        onPress={handleSubmit}
        loading={loading}
        style={{ marginTop: 8 }}
      />
    </View>
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
    <View style={{ marginBottom: 8 }}>
      <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 4 }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textTertiary}
        style={styles.textInput}
      />
    </View>
  );
}

function ReviewStep({
  restaurantName,
  restaurantAddress,
  items,
  itemCount,
  subtotal,
  tax,
  packingFee,
  deliveryFee,
  grandTotal,
  loading,
  onPlaceOrder,
}: {
  restaurantName: string;
  restaurantAddress: string;
  items: CartItemInput[];
  itemCount: number;
  subtotal: number;
  tax: number;
  packingFee: number;
  deliveryFee: number;
  grandTotal: number;
  loading: boolean;
  onPlaceOrder: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Header */}
        <View style={styles.reviewRestaurantCard}>
          <View style={styles.restaurantIconCircle}>
            <Ionicons name="restaurant" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[typography.bodyBold, { color: colors.textPrimary, fontSize: 16 }]}>
              {restaurantName}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {restaurantAddress || "Delivery in 25-35 mins"}
            </Text>
          </View>
        </View>

        {/* Order Items List */}
        <View style={styles.reviewItemsCard}>
          <Text style={[typography.captionBold, styles.itemsHeader]}>
            ORDERED ITEMS ({itemCount})
          </Text>

          {items.map((item, index) => (
            <View
              key={item.foodId}
              style={[
                styles.reviewItemRow,
                index < items.length - 1 && styles.reviewItemBorder,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[typography.bodyBold, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.food?.name ?? item.foodId}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  Qty: {item.quantity} × ${Number(item.food?.price || 0).toFixed(2)}
                </Text>
              </View>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                ${(Number(item.food?.price || 0) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Bill Details Breakdown */}
        <BillCard
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          packingFee={packingFee}
          tax={tax}
          total={grandTotal}
        />
      </ScrollView>

      {/* Place Order CTA Bar */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
        <Button
          title={`Place Order — $${Number(grandTotal || 0).toFixed(2)}`}
          onPress={onPlaceOrder}
          loading={loading}
        />
      </View>
    </View>
  );
}

function PaymentStep({
  loading,
  orderId,
  razorpayOrderId,
  onComplete,
}: {
  loading: boolean;
  orderId: string | null;
  razorpayOrderId: string | null;
  onComplete: () => void;
}) {
  return (
    <View style={styles.successContainer}>
      <View style={styles.successIconCircle}>
        <Ionicons name="checkmark-circle" size={64} color="#2E7D32" />
      </View>

      <Text style={[typography.h2, styles.successTitle]}>
        Order Confirmed!
      </Text>

      <Text style={[typography.body, styles.successSubtitle]}>
        Your food is being prepared with love and care.
      </Text>

      {orderId && (
        <View style={styles.orderRefBadge}>
          <Text style={[typography.captionBold, styles.orderRefText]}>
            Order ID: #{orderId.slice(0, 8)}
            {razorpayOrderId ? ` · Ref: ${razorpayOrderId.slice(0, 10)}` : ""}
          </Text>
        </View>
      )}

      <View style={styles.successActionButtons}>
        <Button
          title="Track Live Order 🛵"
          onPress={onComplete}
          loading={loading}
          style={{ width: "100%" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    marginRight: 12,
    padding: 2,
  },
  headerTitle: {
    color: colors.textPrimary,
    flex: 1,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stepBadgeActive: {
    backgroundColor: colors.primaryBg,
  },
  stepBadgeInactive: {
    backgroundColor: "#F4F5F7",
  },
  stepTextActive: {
    color: colors.primary,
    fontSize: 11,
  },
  stepTextInactive: {
    color: colors.textTertiary,
    fontSize: 11,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  stepConnectorActive: {
    backgroundColor: colors.primary,
  },
  stepConnectorInactive: {
    backgroundColor: "#ECEEF1",
  },
  sectionLabel: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  addressCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  addressCardActive: {
    borderColor: colors.primary,
    backgroundColor: "#FFF8F5",
  },
  addressCardInactive: {
    borderColor: "#F0F1F3",
  },
  addressLeft: {
    marginRight: 12,
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pinCircleActive: {
    backgroundColor: colors.primaryBg,
  },
  pinCircleInactive: {
    backgroundColor: "#F4F5F7",
  },
  addressContent: {
    flex: 1,
  },
  addressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressLabel: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  selectedTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedTagText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  addressText: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  addressCity: {
    color: colors.textTertiary,
    marginTop: 2,
  },
  emptyAddress: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  addAddressToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 10,
  },
  formCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEEF1",
  },
  labelChips: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  labelChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F4F5F7",
  },
  labelChipActive: {
    backgroundColor: colors.primaryBg,
  },
  labelChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  labelChipTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E2E6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  deliveryNoteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  deliveryNoteLabel: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  deliveryNoteInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
  },
  footerBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ECEEF1",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 6,
  },
  reviewRestaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  restaurantIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewItemsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  itemsHeader: {
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  reviewItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  reviewItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F4F5F7",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: {
    color: colors.textPrimary,
    textAlign: "center",
  },
  successSubtitle: {
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  orderRefBadge: {
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 16,
  },
  orderRefText: {
    color: colors.textSecondary,
  },
  successActionButtons: {
    width: "100%",
    marginTop: 32,
  },
});
