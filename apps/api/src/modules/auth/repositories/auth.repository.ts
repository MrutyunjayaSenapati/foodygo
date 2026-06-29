import { db } from "../../../lib/db";
import { users } from "../../../db/schema/users";
import { eq } from "drizzle-orm";
import type { RegisterDTO } from "../types";

export async function findByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function findById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createUser(data: RegisterDTO & { passwordHash: string }) {
  const result = await db.insert(users).values({
    email: data.email,
    passwordHash: data.passwordHash,
    fullName: data.fullName,
  }).returning();
  return result[0]!;
}


