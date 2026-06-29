import { OrderStatus } from "@foodygo/shared-types";

export const ORDER_STATUS_FLOW: readonly OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.RESTAURANT_ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.PICKED_UP,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
] as const;

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.RESTAURANT_ACCEPTED, OrderStatus.CANCELLED],
  [OrderStatus.RESTAURANT_ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP],
  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.PICKED_UP],
  [OrderStatus.PICKED_UP]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.RESTAURANT_ACCEPTED,
];

export const NOTIFICATION_EVENTS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Order placed",
  [OrderStatus.RESTAURANT_ACCEPTED]: "Restaurant accepted order",
  [OrderStatus.PREPARING]: "Food is being prepared",
  [OrderStatus.READY_FOR_PICKUP]: "Order is ready for pickup",
  [OrderStatus.PICKED_UP]: "Order has been picked up",
  [OrderStatus.OUT_FOR_DELIVERY]: "Driver is on the way",
  [OrderStatus.DELIVERED]: "Order delivered",
  [OrderStatus.CANCELLED]: "Order cancelled",
};

export const NOTIFICATION_TRIGGER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.RESTAURANT_ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];
