import { pgTable, uuid, integer, numeric, index } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { foods } from "./foods";

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id)
      .notNull(),
    foodId: uuid("food_id")
      .references(() => foods.id)
      .notNull(),
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    orderIdx: index("idx_order_items_order").on(table.orderId),
  }),
);
