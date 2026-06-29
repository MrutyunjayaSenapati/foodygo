import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";

export const foodCategories = pgTable(
  "food_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .references(() => restaurants.id)
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    restaurantIdx: index("idx_food_categories_restaurant").on(table.restaurantId),
  }),
);
