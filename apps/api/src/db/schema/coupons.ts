import { pgTable, uuid, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { discountTypeEnum } from "../enums";

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
});
