import { Client } from "pg";

const ENUMS = [
  "CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED')",
  "CREATE TYPE restaurant_status AS ENUM ('PENDING', 'DOCUMENT_VERIFICATION', 'APPROVED', 'REJECTED', 'SUSPENDED')",
  "CREATE TYPE order_status AS ENUM ('PENDING', 'RESTAURANT_ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')",
  "CREATE TYPE payment_status AS ENUM ('UNPAID', 'PAID', 'FAILED', 'REFUNDED')",
  "CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED')",
  "CREATE TYPE vehicle_type AS ENUM ('BIKE', 'SCOOTER', 'CAR')",
  "CREATE TYPE delivery_assignment_status AS ENUM ('ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED')",
  "CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED')",
];

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
  console.log("Connected, creating enum types...");

  for (const sql of ENUMS) {
    const name = sql.match(/CREATE TYPE (\w+)/)[1];
    try {
      await client.query(sql);
      console.log("  OK: " + name);
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log("  EXISTS: " + name);
      } else {
        console.error("  FAIL: " + name + " - " + err.message);
      }
    }
  }

  await client.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
