import { Badge } from "./Badge";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
  ASSIGNED: { label: "Assigned", variant: "info" },
  ACCEPTED: { label: "Accepted", variant: "warning" },
  PICKED_UP: { label: "Picked Up", variant: "info" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "error" },
  ACTIVE: { label: "Active", variant: "success" },
  INACTIVE: { label: "Inactive", variant: "warning" },
  SUSPENDED: { label: "Suspended", variant: "error" },
  BANNED: { label: "Banned", variant: "error" },
  PENDING: { label: "Pending", variant: "warning" },
  RESTAURANT_ACCEPTED: { label: "Accepted", variant: "info" },
  PREPARING: { label: "Preparing", variant: "info" },
  READY_FOR_PICKUP: { label: "Ready for Pickup", variant: "warning" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", variant: "info" },
  DELIVERED: { label: "Delivered", variant: "success" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={config.variant} label={config.label} />;
}
