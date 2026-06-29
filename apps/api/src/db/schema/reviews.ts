import { pgTable, uuid, integer, text, timestamp, unique, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { restaurants } from "./restaurants";

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    restaurantId: uuid("restaurant_id")
      .references(() => restaurants.id)
      .notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userRestaurantUnique: unique().on(table.userId, table.restaurantId),
    restaurantIdx: index("idx_reviews_restaurant").on(table.restaurantId),
    userIdx: index("idx_reviews_user").on(table.userId),
  }),
);
