import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";

interface BillCardProps {
  subtotal: number;
  deliveryFee: number;
  packingFee?: number;
  tax: number;
  discount?: number;
  total: number;
}

export function BillCard({
  subtotal,
  deliveryFee,
  packingFee = 0.14,
  tax,
  discount = 0,
  total,
}: BillCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="receipt-outline" size={18} color={colors.textPrimary} style={{ marginRight: 6 }} />
        <Text style={[typography.bodyBold, styles.headerTitle]}>Bill Details</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={[typography.bodySmall, styles.label]}>Item Total</Text>
        <Text style={[typography.bodySmall, styles.value]}>${Number(subtotal || 0).toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[typography.bodySmall, styles.label]}>Delivery Partner Fee</Text>
        <Text style={[typography.bodySmall, Number(deliveryFee || 0) === 0 ? styles.freeText : styles.value]}>
          {Number(deliveryFee || 0) === 0 ? "FREE" : `$${Number(deliveryFee).toFixed(2)}`}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[typography.bodySmall, styles.label]}>Restaurant Packaging Fee</Text>
        <Text style={[typography.bodySmall, styles.value]}>${Number(packingFee || 0).toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[typography.bodySmall, styles.label]}>Taxes & Charges (8%)</Text>
        <Text style={[typography.bodySmall, styles.value]}>${Number(tax || 0).toFixed(2)}</Text>
      </View>

      {Number(discount || 0) > 0 && (
        <View style={styles.row}>
          <Text style={[typography.bodySmall, styles.discountLabel]}>Coupon Discount</Text>
          <Text style={[typography.bodySmall, styles.discountValue]}>-${Number(discount).toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.thickDivider} />

      <View style={[styles.row, { marginTop: 4 }]}>
        <Text style={[typography.bodyBold, styles.totalLabel]}>To Pay</Text>
        <Text style={[typography.h3, styles.totalValue]}>${Number(total || 0).toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F1F3",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F3F5",
    marginVertical: 12,
  },
  thickDivider: {
    height: 1.5,
    backgroundColor: "#ECEEF1",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    color: colors.textSecondary,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: "500",
  },
  freeText: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  discountLabel: {
    color: colors.primary,
    fontWeight: "600",
  },
  discountValue: {
    color: colors.primary,
    fontWeight: "700",
  },
  totalLabel: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  totalValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
});
