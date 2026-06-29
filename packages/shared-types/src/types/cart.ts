import type { Food } from "./food";

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  foodId: string;
  quantity: number;
  food?: Food;
}

export interface AddCartItemDTO {
  foodId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}
