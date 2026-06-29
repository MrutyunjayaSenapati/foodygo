import { pgTable, uuid, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { restaurants } from "./restaurants";
import { addresses } from "./addresses";
import { orderStatusEnum, paymentStatusEnum } from "../enums";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    restaurantId: uuid("restaurant_id")
      .references(() => restaurants.id)
      .notNull(),
    addressId: uuid("address_id")
      .references(() => addresses.id)
      .notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).default("0").notNull(),
    packingFee: numeric("packing_fee", { precision: 10, scale: 2 }).default("0").notNull(),
    platformFee: numeric("platform_fee", { precision: 10, scale: 2 }).default("0").notNull(),
    deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull(),
    tax: numeric("tax", { precision: 10, scale: 2 }).notNull(),
    tip: numeric("tip", { precision: 10, scale: 2 }).default("0").notNull(),
    grandTotal: numeric("grand_total", { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum("status").default("PENDING").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").default("UNPAID").notNull(),
    estimatedDeliveryTime: timestamp("estimated_delivery_time"),
    actualDeliveryTime: timestamp("actual_delivery_time"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_orders_user").on(table.userId),
    restaurantIdx: index("idx_orders_restaurant").on(table.restaurantId),
    statusIdx: index("idx_orders_status").on(table.status),
    paymentStatusIdx: index("idx_orders_payment_status").on(table.paymentStatus),
    userStatusIdx: index("idx_orders_user_status").on(table.userId, table.status),
    restaurantStatusIdx: index("idx_orders_restaurant_status").on(table.restaurantId, table.status),
  }),
);
