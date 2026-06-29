import { db, type TxClient } from "../../../lib/db";
import { userRoles } from "../../../db/schema/user-roles";
import { roles } from "../../../db/schema/roles";
import { eq } from "drizzle-orm";

export async function getRoleNames(
  userId: string,
  txClient?: TxClient,
): Promise<string[]> {
  const client = txClient ?? db;
  const result = await client
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  return result.map((r: { name: string }) => r.name);
}

export async function findRoleIdByName(
  name: string,
  txClient?: TxClient,
) {
  const client = txClient ?? db;
  const result = await client
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, name))
    .limit(1);
  return result[0] ?? null;
}
