import { pgTable, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .unique()
    .references(() => users.id)
    .notNull(),
});
