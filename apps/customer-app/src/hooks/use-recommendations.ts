import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api-client";
import type { Restaurant } from "../types";
import { useAuthStore } from "../store/auth-store";

interface RecommendedRestaurant extends Restaurant {
  score: number;
}

export function useRecommendedRestaurants() {
  const isAuthenticated = !!useAuthStore.getState().accessToken;

  return useQuery({
    queryKey: ["recommendations"],
    queryFn: () => apiGet<RecommendedRestaurant[]>("/recommendations"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}
