import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { userStatusEnum } from "../enums";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  fcmToken: varchar("fcm_token", { length: 500 }),
  status: userStatusEnum("status").default("ACTIVE").notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
