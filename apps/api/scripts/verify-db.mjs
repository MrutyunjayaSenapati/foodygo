import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });
  await client.connect();

  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("Tables (" + tables.rows.length + "):");
  tables.rows.forEach((r) => console.log("  " + r.table_name));

  const enums = await client.query(
    "SELECT t.typname AS enum_name, array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') GROUP BY t.typname ORDER BY t.typname"
  );
  console.log("\nEnums (" + enums.rows.length + "):");
  enums.rows.forEach((r) => console.log("  " + r.enum_name + " = " + r.values));

  const fks = await client.query(
    "SELECT COUNT(*) AS cnt FROM information_schema.table_constraints WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY'"
  );
  console.log("\nForeign keys: " + fks.rows[0].cnt);

  const indexes = await client.query(
    "SELECT COUNT(*) AS cnt FROM pg_indexes WHERE schemaname = 'public'"
  );
  console.log("Indexes: " + indexes.rows[0].cnt);

  await client.end();
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
