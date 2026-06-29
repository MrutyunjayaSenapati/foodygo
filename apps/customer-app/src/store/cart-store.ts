import { create } from "zustand";
import type { CartItem } from "@foodygo/shared-types";

interface CartItemInput {
  foodId: string;
  quantity: number;
  food?: CartItem["food"];
}

interface CartState {
  restaurantId: string | null;
  items: CartItemInput[];
  itemCount: number;
  total: number;
  addItem: (item: CartItemInput) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  removeItem: (foodId: string) => void;
  clearCart: () => void;
  setRestaurantId: (id: string | null) => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  restaurantId: null,
  items: [],
  itemCount: 0,
  total: 0,

  addItem: (item) => {
    const existing = get().items.find((i) => i.foodId === item.foodId);
    const items = existing
      ? get().items.map((i) =>
          i.foodId === item.foodId ? { ...i, quantity: i.quantity + item.quantity } : i,
        )
      : [...get().items, item];

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce(
      (sum, i) => sum + i.quantity * (i.food?.price ?? 0),
      0,
    );

    set({ items, itemCount, total });
  },

  updateQuantity: (foodId, quantity) => {
    const items =
      quantity <= 0
        ? get().items.filter((i) => i.foodId !== foodId)
        : get().items.map((i) =>
            i.foodId === foodId ? { ...i, quantity } : i,
          );

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce(
      (sum, i) => sum + i.quantity * (i.food?.price ?? 0),
      0,
    );

    set({ items, itemCount, total });
  },

  removeItem: (foodId) => {
    const items = get().items.filter((i) => i.foodId !== foodId);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce(
      (sum, i) => sum + i.quantity * (i.food?.price ?? 0),
      0,
    );

    set({ items, itemCount, total });
  },

  clearCart: () =>
    set({ items: [], restaurantId: null, itemCount: 0, total: 0 }),

  setRestaurantId: (restaurantId) => set({ restaurantId }),
}));
