import { db } from "../../../lib/db";
import { carts } from "../../../db/schema/carts";
import { cartItems } from "../../../db/schema/cart-items";
import { foods } from "../../../db/schema/foods";
import { eq, and } from "drizzle-orm";

export async function findCartByUserId(userId: string) {
  const result = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function createCart(userId: string) {
  const result = await db
    .insert(carts)
    .values({ userId })
    .returning();
  return result[0]!;
}

export async function findCartItem(cartId: string, foodId: string) {
  const result = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.foodId, foodId)))
    .limit(1);
  return result[0] ?? null;
}

export async function addCartItem(cartId: string, foodId: string, quantity: number) {
  const result = await db
    .insert(cartItems)
    .values({ cartId, foodId, quantity })
    .returning();
  return result[0]!;
}

export async function updateCartItemQuantity(id: string, quantity: number) {
  const result = await db
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, id))
    .returning();
  return result[0] ?? null;
}

export async function removeCartItem(id: string) {
  const result = await db
    .delete(cartItems)
    .where(eq(cartItems.id, id))
    .returning();
  return result[0] ?? null;
}

export async function getCartItems(cartId: string) {
  return db
    .select()
    .from(cartItems)
    .innerJoin(foods, eq(cartItems.foodId, foods.id))
    .where(eq(cartItems.cartId, cartId));
}

export async function clearCart(cartId: string) {
  await db
    .delete(cartItems)
    .where(eq(cartItems.cartId, cartId));
}
