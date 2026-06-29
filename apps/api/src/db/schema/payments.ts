import { pgTable, uuid, varchar, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { paymentStatusEnum } from "../enums";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id)
      .notNull(),
    razorpayOrderId: varchar("razorpay_order_id", { length: 100 }).notNull(),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 100 }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: paymentStatusEnum("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("idx_payments_order").on(table.orderId),
    razorpayOrderIdx: index("idx_payments_razorpay_order").on(table.razorpayOrderId),
    statusIdx: index("idx_payments_status").on(table.status),
  }),
);
