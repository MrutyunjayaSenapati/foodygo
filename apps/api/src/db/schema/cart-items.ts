import { pgTable, uuid, integer, index } from "drizzle-orm/pg-core";
import { carts } from "./carts";
import { foods } from "./foods";

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .references(() => carts.id)
      .notNull(),
    foodId: uuid("food_id")
      .references(() => foods.id)
      .notNull(),
    quantity: integer("quantity").default(1).notNull(),
  },
  (table) => ({
    cartIdIdx: index("idx_cart_items_cart").on(table.cartId),
  }),
);
