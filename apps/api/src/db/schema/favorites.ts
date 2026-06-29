import { pgTable, uuid, unique, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { restaurants } from "./restaurants";

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    restaurantId: uuid("restaurant_id")
      .references(() => restaurants.id)
      .notNull(),
  },
  (table) => ({
    userRestaurantUnique: unique().on(table.userId, table.restaurantId),
    userIdx: index("idx_favorites_user").on(table.userId),
    restaurantIdx: index("idx_favorites_restaurant").on(table.restaurantId),
  }),
);
