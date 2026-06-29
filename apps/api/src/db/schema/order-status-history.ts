import { pgTable, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { orderStatusEnum } from "../enums";

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id)
      .notNull(),
    status: orderStatusEnum("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("idx_order_status_history_order").on(table.orderId),
  }),
);
