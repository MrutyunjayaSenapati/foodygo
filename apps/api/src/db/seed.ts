import "dotenv/config";
import { db } from "../lib/db";
import { roles } from "./schema/roles";

const SEED_ROLES = ["CUSTOMER", "RESTAURANT_OWNER", "DELIVERY_PARTNER", "ADMIN"];

async function seed() {
  console.log("Seeding roles...");

  for (const name of SEED_ROLES) {
    await db.insert(roles).values({ name }).onConflictDoNothing();
  }

  console.log("Roles seeded successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
