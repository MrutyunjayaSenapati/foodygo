import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { env } from "./env";

const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle({ client: pool });

export type TxClient = PgDatabase<NodePgQueryResultHKT, Record<string, never>>;

export async function closeDb(): Promise<void> {
  await pool.end();
}
