import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api-client";
import type { Food, FoodCategory } from "../types";

interface RestaurantFoodsResponse {
  foods: Food[];
  categories: FoodCategory[];
}

export function useRestaurantFoods(restaurantId: string) {
  return useQuery({
    queryKey: ["restaurant-foods", restaurantId],
    queryFn: () => apiGet<RestaurantFoodsResponse>(`/foods/restaurant/${restaurantId}`),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5,
  });
}
