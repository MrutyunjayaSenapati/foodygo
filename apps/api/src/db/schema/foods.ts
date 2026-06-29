import { pgTable, uuid, varchar, text, numeric, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";
import { foodCategories } from "./food-categories";

export const foods = pgTable(
  "foods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .references(() => restaurants.id)
      .notNull(),
    categoryId: uuid("category_id").references(() => foodCategories.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 500 }),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    restaurantIdx: index("idx_foods_restaurant").on(table.restaurantId),
    categoryIdx: index("idx_foods_category").on(table.categoryId),
    restaurantAvailableIdx: index("idx_foods_restaurant_available").on(table.restaurantId, table.isAvailable),
  }),
);
