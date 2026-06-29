import { pgTable, uuid, varchar, text, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { restaurantStatusEnum } from "../enums";

export const restaurants = pgTable(
  "restaurants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .references(() => users.id)
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    logoUrl: varchar("logo_url", { length: 500 }),
    coverUrl: varchar("cover_url", { length: 500 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    address: text("address").notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    rating: numeric("rating", { precision: 3, scale: 2 }).default("0").notNull(),
    status: restaurantStatusEnum("status").default("PENDING").notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    ownerIdx: index("idx_restaurants_owner").on(table.ownerUserId),
    coordsIdx: index("idx_restaurants_coords").on(table.latitude, table.longitude),
    statusIdx: index("idx_restaurants_status").on(table.status),
  }),
);
