import { pgTable, uuid, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { globalCategories } from "./global-categories";

export const globalFoods = pgTable(
  "global_foods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => globalCategories.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 500 }),
    isAvailable: boolean("is_available").default(true).notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    categoryIdx: index("idx_global_foods_category").on(table.categoryId),
  }),
);
