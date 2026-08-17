import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ORDER_STATUS_FLOW, NOTIFICATION_EVENTS } from "@foodygo/shared-constants";
import type { OrderStatus, OrderStatusHistory } from "@foodygo/shared-types";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  statusHistory?: OrderStatusHistory[];
}

export function OrderStatusTimeline({
  currentStatus,
  statusHistory,
}: OrderStatusTimelineProps) {
  const isCancelled = currentStatus === "CANCELLED";
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);

  const historyStatusSet = new Set(statusHistory?.map((h) => h.status) ?? []);

  const displayStatuses: OrderStatus[] = isCancelled
    ? [
        ...ORDER_STATUS_FLOW.filter((s) => historyStatusSet.has(s)),
        "CANCELLED" as OrderStatus,
      ]
    : [...ORDER_STATUS_FLOW];

  return (
    <View style={styles.container}>
      {displayStatuses.map((status, index) => {
        const statusIndex = ORDER_STATUS_FLOW.indexOf(status as OrderStatus);
        const isCurrent = isCancelled
          ? status === "CANCELLED"
          : status === currentStatus;
        const isCompleted = isCancelled
          ? status !== "CANCELLED" && historyStatusSet.has(status)
          : statusIndex !== -1 && statusIndex < currentIndex;

        const historyEntry = statusHistory?.find((h) => h.status === status);
        const label = NOTIFICATION_EVENTS[status as OrderStatus] ?? status.replace(/_/g, " ");
        const time = historyEntry?.createdAt
          ? new Date(historyEntry.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined;

        return (
          <View key={status} style={styles.stepRow}>
            {/* Left Timeline Indicator */}
            <View style={styles.indicatorCol}>
              {isCancelled && isCurrent ? (
                <View style={styles.cancelledCircle}>
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </View>
              ) : isCurrent ? (
                <View style={styles.currentOuterCircle}>
                  <View style={styles.currentInnerDot} />
                </View>
              ) : isCompleted ? (
                <View style={styles.completedCircle}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.pendingCircle} />
              )}

              {index < displayStatuses.length - 1 && (
                <View
                  style={[
                    styles.connectorLine,
                    isCompleted
                      ? styles.connectorCompleted
                      : isCurrent && !isCancelled
                        ? styles.connectorCurrent
                        : styles.connectorPending,
                  ]}
                />
              )}
            </View>

            {/* Right Status Content */}
            <View style={styles.contentCol}>
              <Text
                style={[
                  typography.bodyBold,
                  styles.statusTitle,
                  {
                    color: isCancelled && isCurrent
                      ? colors.error
                      : isCompleted || isCurrent
                        ? colors.textPrimary
                        : colors.textTertiary,
                  },
                ]}
              >
                {label}
              </Text>
              {time ? (
                <Text style={[typography.caption, styles.timeText]}>
                  {time}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F0F1F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  stepRow: {
    flexDirection: "row",
    minHeight: 52,
  },
  indicatorCol: {
    alignItems: "center",
    width: 28,
  },
  cancelledCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  currentOuterCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryBg,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  currentInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  completedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ECEEF1",
    backgroundColor: "#FFFFFF",
    marginTop: 2,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  connectorCompleted: {
    backgroundColor: "#2E7D32",
  },
  connectorCurrent: {
    backgroundColor: colors.primary,
  },
  connectorPending: {
    backgroundColor: "#ECEEF1",
  },
  contentCol: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 12,
    justifyContent: "flex-start",
  },
  statusTitle: {
    fontSize: 14,
  },
  timeText: {
    color: colors.textSecondary,
    marginTop: 2,
  },
});
