import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ORDER_STATUS_FLOW, NOTIFICATION_EVENTS } from "@foodygo/shared-constants";
import type { OrderStatus, OrderStatusHistory } from "@foodygo/shared-types";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  statusHistory?: OrderStatusHistory[];
}

export function OrderStatusTimeline({
  currentStatus,
  statusHistory,
}: OrderStatusTimelineProps) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  const isCancelled = currentStatus === "CANCELLED";
  const displayStatuses = isCancelled
    ? [...ORDER_STATUS_FLOW.slice(0, currentIndex), "CANCELLED" as OrderStatus]
    : ORDER_STATUS_FLOW;

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
      {displayStatuses.map((status, index) => {
        const statusIndex = ORDER_STATUS_FLOW.indexOf(status as OrderStatus);
        const isCompleted = statusIndex < currentIndex && !isCancelled;
        const isCurrent = status === currentStatus || (isCancelled && index === displayStatuses.length - 1);

        const historyEntry = statusHistory?.find((h) => h.status === status);
        const label = NOTIFICATION_EVENTS[status as OrderStatus] ?? status;
        const time = historyEntry?.createdAt
          ? new Date(historyEntry.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined;

        return (
          <View key={status} style={{ flexDirection: "row", minHeight: 56 }}>
            <View style={{ alignItems: "center", width: 32 }}>
              {isCompleted || (isCurrent && isCancelled) ? (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.error,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={14} color={colors.textInverse} />
                </View>
              ) : isCurrent ? (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.textInverse,
                    }}
                  />
                </View>
              ) : isCompleted ? (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.success,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                </View>
              ) : (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                />
              )}

              {index < displayStatuses.length - 1 && (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    backgroundColor: isCompleted
                      ? colors.success
                      : isCurrent && !isCancelled
                        ? colors.primary
                        : colors.border,
                    marginVertical: 2,
                  }}
                />
              )}
            </View>

            <View style={{ flex: 1, paddingLeft: spacing.md, paddingBottom: index < displayStatuses.length - 1 ? spacing.md : 0 }}>
              <Text
                style={[
                  typography.bodyBold,
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
              {time && (
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  {time}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
