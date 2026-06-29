import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { vehicleTypeEnum } from "../enums";

export const deliveryPartners = pgTable("delivery_partners", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .unique()
    .references(() => users.id)
    .notNull(),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
  licenseNumber: varchar("license_number", { length: 100 }).notNull(),
});
