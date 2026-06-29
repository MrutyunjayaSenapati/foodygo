import { pgEnum } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "SUSPENDED", "BANNED"]);
export const restaurantStatusEnum = pgEnum("restaurant_status", [
  "PENDING",
  "DOCUMENT_VERIFICATION",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "RESTAURANT_ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["UNPAID", "PAID", "FAILED", "REFUNDED"]);
export const discountTypeEnum = pgEnum("discount_type", ["PERCENTAGE", "FIXED"]);
export const vehicleTypeEnum = pgEnum("vehicle_type", ["BIKE", "SCOOTER", "CAR"]);
export const deliveryAssignmentStatusEnum = pgEnum("delivery_assignment_status", [
  "ASSIGNED",
  "ACCEPTED",
  "PICKED_UP",
  "COMPLETED",
  "CANCELLED",
]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);
