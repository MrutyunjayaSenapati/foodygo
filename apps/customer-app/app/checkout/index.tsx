import { useState, useCallback } from "react";
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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/constants/colors";
import { typography } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { useCartStore } from "../../src/store/cart-store";
import { useAddresses, useCreateAddress } from "../../src/hooks/use-addresses";
import { useCreateOrder } from "../../src/hooks/use-orders";
import { useCreatePaymentOrder, useVerifyPayment } from "../../src/hooks/use-payments";
import { useRestaurantDetail } from "../../src/hooks/use-restaurants";
import { Button } from "../../src/components/ui/Button";
import { Skeleton } from "../../src/components/ui/Skeleton";
import type { Address } from "../../src/types";
import type { CartItemInput } from "../../src/store/cart-store";

const TAX_RATE = 0.08;
const PACKING_FEE_RATE = 0.02;
const DELIVERY_FEE = 0;

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [createdAddressId, setCreatedAddressId] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);

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
  const packingFee = subtotal * PACKING_FEE_RATE;
  const grandTotal = subtotal + tax + packingFee + DELIVERY_FEE;

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

  const handleContinueToReview = useCallback(() => {
    if (selectedAddressId) setStep(1);
  }, [selectedAddressId]);

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddressId) return;

    try {
      const order = await createOrder.mutateAsync({
        addressId: selectedAddressId,
      });
      setCreatedOrderId(order.id);

      const payment = await createPaymentOrder.mutateAsync(order.id);
      setRazorpayOrderId(payment.razorpayOrderId);

      setStep(2);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to place order";
      Alert.alert("Order Failed", message);
    }
  }, [selectedAddressId, createOrder, createPaymentOrder]);

  const handleCompletePayment = useCallback(async () => {
    try {
      await verifyPayment.mutateAsync({
        razorpayPaymentId: "pay_" + Date.now(),
        razorpayOrderId: razorpayOrderId ?? "order_" + Date.now(),
        razorpaySignature: "simulated",
      });
    } catch {
      clearCart();
      if (createdOrderId) {
        router.replace(`/order/${createdOrderId}`);
      } else {
        router.replace("/(tabs)/orders");
      }
      return;
    }

    clearCart();
    if (createdOrderId) {
      router.replace(`/order/${createdOrderId}`);
    } else {
      router.replace("/(tabs)/orders");
    }
  }, [razorpayOrderId, verifyPayment, clearCart, createdOrderId]);

  const activeAddressId = selectedAddressId ?? createdAddressId;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
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
            onContinue={handleContinueToReview}
            canContinue={!!activeAddressId}
          />
        )}

        {step === 1 && (
          <ReviewStep
            restaurantName={restaurant?.name ?? "Restaurant"}
            items={items}
            itemCount={itemCount}
            subtotal={subtotal}
            tax={tax}
            packingFee={packingFee}
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
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <TouchableOpacity onPress={onBack} style={{ marginRight: spacing.md }}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          {step === 0 ? "Delivery Address" : step === 1 ? "Review Order" : "Payment"}
        </Text>
        <StepDots current={step} total={2} />
      </View>
      {loading && <ActivityIndicator size="small" color={colors.primary} />}
    </View>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
      {Array.from({ length: total + 1 }, (_, i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i <= current ? colors.primary : colors.border,
          }}
        />
      ))}
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
  onContinue: () => void;
  canContinue: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <Skeleton width="100%" height={160} />
        ) : addresses.length > 0 ? (
          <View style={{ gap: spacing.md }}>
            {addresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                onPress={() => onSelect(addr.id)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  padding: spacing.md,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: selectedId === addr.id ? colors.primary : colors.border,
                  backgroundColor: selectedId === addr.id ? colors.primaryBg : colors.surface,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selectedId === addr.id ? colors.primary : colors.textTertiary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: spacing.md,
                    marginTop: 2,
                  }}
                >
                  {selectedId === addr.id && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  {addr.label ? (
                    <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                      {addr.label}
                    </Text>
                  ) : null}
                  <Text
                    style={[
                      typography.body,
                      { color: colors.textSecondary, marginTop: 2 },
                    ]}
                  >
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                  </Text>
                  <Text style={[typography.body, { color: colors.textSecondary }]}>
                    {addr.city}, {addr.state} {addr.postalCode}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center" }]}>
            No saved addresses. Add one below.
          </Text>
        )}

        <TouchableOpacity
          onPress={onToggleForm}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: spacing.lg,
            paddingVertical: spacing.md,
          }}
        >
          <Ionicons
            name={showAddForm ? "chevron-up" : "add-circle-outline"}
            size={20}
            color={colors.primary}
          />
          <Text
            style={[
              typography.bodyBold,
              { color: colors.primary, marginLeft: spacing.sm },
            ]}
          >
            {showAddForm ? "Hide Form" : "Add New Address"}
          </Text>
        </TouchableOpacity>

        {showAddForm && (
          <AddressForm
            onSubmit={onAddressCreated}
            loading={creating}
          />
        )}
      </ScrollView>

      <View
        style={{
          padding: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <Button
          title="Continue"
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
  const [label, setLabel] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const createAddress = useCreateAddress();

  const handleSubmit = async () => {
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      Alert.alert("Required Fields", "Please fill in all required fields.");
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
    <View
      style={{
        marginTop: spacing.md,
        padding: spacing.md,
        borderRadius: 12,
        backgroundColor: colors.surfaceAlt,
        gap: spacing.md,
      }}
    >
      <Field
        label="Label"
        placeholder="e.g. Home, Work"
        value={label}
        onChangeText={setLabel}
      />
      <Field
        label="Address Line 1 *"
        placeholder="Street address"
        value={addressLine1}
        onChangeText={setAddressLine1}
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
        placeholder="Postal code"
        value={postalCode}
        onChangeText={setPostalCode}
        keyboardType="numeric"
      />
      <Button
        title="Save Address"
        onPress={handleSubmit}
        loading={loading}
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
    <View>
      <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: 4 }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
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

function ReviewStep({
  restaurantName,
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
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg }}
      >
        <View
          style={{
            padding: spacing.md,
            borderRadius: 12,
            backgroundColor: colors.surface,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
            {restaurantName}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </Text>
        </View>

        <View
          style={{
            borderRadius: 12,
            backgroundColor: colors.surface,
            overflow: "hidden",
          }}
        >
          {items.map((item, index) => (
            <View
              key={item.foodId}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderBottomWidth: index < items.length - 1 ? 1 : 0,
                borderBottomColor: colors.borderLight,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[typography.bodyBold, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {item.food?.name ?? item.foodId}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                ${((item.food?.price ?? 0) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: spacing.lg,
            padding: spacing.md,
            borderRadius: 12,
            backgroundColor: colors.surface,
          }}
        >
          <PricingRow label="Subtotal" value={subtotal} />
          <PricingRow label="Delivery Fee" value={deliveryFee} />
          <PricingRow label="Packing Fee" value={packingFee} />
          <PricingRow label="Tax (8%)" value={tax} />
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginVertical: spacing.sm,
            }}
          />
          <PricingRow label="Total" value={grandTotal} bold />
        </View>
      </ScrollView>

      <View
        style={{
          padding: spacing.lg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <Button
          title={`Place Order — $${grandTotal.toFixed(2)}`}
          onPress={onPlaceOrder}
          loading={loading}
        />
      </View>
    </View>
  );
}

function PricingRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 2,
      }}
    >
      <Text
        style={[
          bold ? typography.bodyBold : typography.body,
          { color: bold ? colors.textPrimary : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          bold ? typography.bodyBold : typography.body,
          { color: bold ? colors.textPrimary : colors.textSecondary },
        ]}
      >
        ${value.toFixed(2)}
      </Text>
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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing["3xl"],
      }}
    >
      <Ionicons
        name="checkmark-circle-outline"
        size={64}
        color={colors.success}
      />
      <Text
        style={[
          typography.h3,
          { color: colors.textPrimary, marginTop: spacing.lg, textAlign: "center" },
        ]}
      >
        Order Placed Successfully!
      </Text>
      <Text
        style={[
          typography.body,
          { color: colors.textSecondary, marginTop: spacing.sm, textAlign: "center" },
        ]}
      >
        Your order has been placed and is being processed by the restaurant.
      </Text>

      {orderId && (
        <Text
          style={[
            typography.caption,
            { color: colors.textTertiary, marginTop: spacing.md, textAlign: "center" },
          ]}
        >
          Order #{orderId.slice(0, 8)}
          {razorpayOrderId ? ` · Ref: ${razorpayOrderId.slice(0, 12)}` : ""}
        </Text>
      )}

      <Button
        title="View My Orders"
        onPress={onComplete}
        loading={loading}
        style={{ marginTop: spacing["2xl"] }}
      />
    </View>
  );
}
