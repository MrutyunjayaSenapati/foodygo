import { Client } from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
  console.log("Connected, applying full migration...");

  const sql = readFileSync(
    join(__dirname, "../src/db/migrations/0000_parched_squadron_sinister.sql"),
    "utf8"
  );

  const statements = sql.split("--> statement-breakpoint");

  let success = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    try {
      await client.query(stmt);
      success++;
      if (success % 10 === 0) process.stdout.write(".");
    } catch (err) {
      failed++;
      console.error("\n[" + i + "] FAILED: " + err.message);
      console.error("  SQL: " + stmt.substring(0, 150) + (stmt.length > 150 ? "..." : ""));
    }
  }

  console.log("\nDone. " + success + " succeeded, " + failed + " failed");
  await client.end();
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
