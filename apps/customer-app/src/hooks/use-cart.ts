import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "../store/cart-store";
import { useAuthStore } from "../store/auth-store";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api-client";
import type { Cart, CartItem, AddCartItemDTO, UpdateCartItemDTO } from "../types";

export function useCart() {
  const store = useCartStore();

  return useQuery({
    queryKey: ["cart"],
    queryFn: () => apiGet<Cart>("/cart"),
    enabled: !!useAuthStore.getState().accessToken,
    staleTime: 0,
    select: (data) => {
      if (data.items && data.items.length > 0) {
        store.clearCart();
        data.items.forEach((item: CartItem) =>
          store.addItem({
            foodId: item.foodId,
            quantity: item.quantity,
            food: item.food,
          }),
        );
      }
      return data;
    },
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  const cartStore = useCartStore();

  return useMutation({
    mutationFn: (data: AddCartItemDTO) => apiPost<CartItem>("/cart/items", data),
    onSuccess: (item, variables) => {
      cartStore.addItem({
        foodId: variables.foodId,
        quantity: variables.quantity,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const cartStore = useCartStore();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateCartItemDTO }) =>
      apiPatch<CartItem>(`/cart/items/${itemId}`, data),
    onSuccess: (_item, variables) => {
      cartStore.updateQuantity(variables.itemId, variables.data.quantity);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const cartStore = useCartStore();

  return useMutation({
    mutationFn: (itemId: string) => apiDelete(`/cart/items/${itemId}`),
    onSuccess: (_data, itemId) => {
      cartStore.removeItem(itemId);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const cartStore = useCartStore();

  return useMutation({
    mutationFn: () => apiDelete("/cart"),
    onSuccess: () => {
      cartStore.clearCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
