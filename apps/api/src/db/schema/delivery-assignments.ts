import { pgTable, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { deliveryPartners } from "./delivery-partners";
import { deliveryAssignmentStatusEnum } from "../enums";

export const deliveryAssignments = pgTable(
  "delivery_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id)
      .notNull(),
    deliveryPartnerId: uuid("delivery_partner_id")
      .references(() => deliveryPartners.id)
      .notNull(),
    status: deliveryAssignmentStatusEnum("status").default("ASSIGNED").notNull(),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    acceptedAt: timestamp("accepted_at"),
    pickedUpAt: timestamp("picked_up_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    orderIdx: index("idx_delivery_assignments_order").on(table.orderId),
    partnerIdx: index("idx_delivery_assignments_partner").on(table.deliveryPartnerId),
    partnerStatusIdx: index("idx_delivery_assignments_partner_status").on(table.deliveryPartnerId, table.status),
  }),
);
