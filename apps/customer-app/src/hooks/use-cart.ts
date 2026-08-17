import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "../store/cart-store";
import { useAuthStore } from "../store/auth-store";
import { apiGet, apiPost, apiPatch, apiDelete } from "../lib/api-client";
import type { Cart, CartItem, AddCartItemDTO, UpdateCartItemDTO } from "../types";

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const data = await apiGet<Cart>("/cart");
      if (data && data.items) {
        const store = useCartStore.getState();
        // Sync local store from server
        const currentItems = store.items;
        if (data.items.length > 0 && currentItems.length === 0) {
          data.items.forEach((item: CartItem) => {
            store.addItem({
              foodId: item.foodId,
              quantity: item.quantity,
              food: item.food,
            });
          });
        }
      }
      return data;
    },
    enabled: !!useAuthStore.getState().accessToken,
    staleTime: 5000,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddCartItemDTO) => apiPost<Cart>("/cart/items", data),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateCartItemDTO }) =>
      apiPatch<Cart>(`/cart/items/${itemId}`, data),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => apiDelete<Cart>(`/cart/items/${itemId}`),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clearCart);

  return useMutation({
    mutationFn: () => apiDelete<Cart>("/cart"),
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
