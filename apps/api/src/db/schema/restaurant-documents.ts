import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";
import { users } from "./users";
import { verificationStatusEnum } from "../enums";

export const restaurantDocuments = pgTable(
  "restaurant_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .references(() => restaurants.id)
      .notNull(),
    documentType: varchar("document_type", { length: 50 }).notNull(),
    documentUrl: varchar("document_url", { length: 500 }).notNull(),
    verificationStatus: verificationStatusEnum("verification_status").default("PENDING").notNull(),
    verifiedBy: uuid("verified_by").references(() => users.id),
    verifiedAt: timestamp("verified_at"),
    remarks: text("remarks"),
  },
  (table) => ({
    restaurantIdx: index("idx_restaurant_documents_restaurant").on(table.restaurantId),
  }),
);
