import * as cartRepository from "../repositories/cart.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import type { AddCartItemDTO, UpdateCartItemDTO } from "@foodygo/shared-types";

export async function getCart(userId: string) {
  let cart = await cartRepository.findCartByUserId(userId);

  if (!cart) {
    cart = await cartRepository.createCart(userId);
  }

  const items = await cartRepository.getCartItems(cart.id);

  return {
    id: cart.id,
    userId: cart.userId,
    items: items.map((item) => ({
      id: item.cart_items.id,
      cartId: item.cart_items.cartId,
      foodId: item.cart_items.foodId,
      quantity: item.cart_items.quantity,
      food: item.foods,
    })),
  };
}

export async function addItem(userId: string, dto: AddCartItemDTO) {
  let cart = await cartRepository.findCartByUserId(userId);

  if (!cart) {
    cart = await cartRepository.createCart(userId);
  }

  const existing = await cartRepository.findCartItem(cart.id, dto.foodId);

  if (existing) {
    await cartRepository.updateCartItemQuantity(existing.id, existing.quantity + dto.quantity);
  } else {
    await cartRepository.addCartItem(cart.id, dto.foodId, dto.quantity);
  }

  return getCart(userId);
}

export async function updateItem(userId: string, itemId: string, dto: UpdateCartItemDTO) {
  const cart = await cartRepository.findCartByUserId(userId);

  if (!cart) {
    throw new AppError(ErrorCode.NOT_FOUND, "Cart not found");
  }

  const item = await cartRepository.updateCartItemQuantity(itemId, dto.quantity);

  if (!item) {
    throw new AppError(ErrorCode.NOT_FOUND, "Cart item not found");
  }

  return getCart(userId);
}

export async function removeItem(userId: string, itemId: string) {
  const cart = await cartRepository.findCartByUserId(userId);

  if (!cart) {
    throw new AppError(ErrorCode.NOT_FOUND, "Cart not found");
  }

  const item = await cartRepository.removeCartItem(itemId);

  if (!item) {
    throw new AppError(ErrorCode.NOT_FOUND, "Cart item not found");
  }

  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await cartRepository.findCartByUserId(userId);

  if (cart) {
    await cartRepository.clearCart(cart.id);
  }

  return getCart(userId);
}
