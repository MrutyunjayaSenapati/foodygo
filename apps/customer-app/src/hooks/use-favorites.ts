import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../lib/api-client";
import type { Restaurant } from "../types";

interface FavoriteItem {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant: Restaurant;
}

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => apiGet<FavoriteItem[]>("/favorites"),
    staleTime: 1000 * 60 * 2,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (restaurantId: string) =>
      apiPost<{ favorited: boolean }>("/favorites", { restaurantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
