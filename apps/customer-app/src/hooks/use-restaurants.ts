import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiGet, apiGetPaginated } from "../lib/api-client";
import type { Restaurant } from "../types";

interface RestaurantListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  ratingMin?: number;
  ratingMax?: number;
  priceMin?: number;
  priceMax?: number;
}

export function useRestaurants(params?: RestaurantListParams) {
  return useQuery({
    queryKey: ["restaurants", params],
    queryFn: () =>
      apiGet<Restaurant[]>("/restaurants", params as Record<string, string | number | undefined>),
    staleTime: 1000 * 60 * 2,
  });
}

export function useTopRatedRestaurants(limit: number = 10) {
  return useQuery({
    queryKey: ["restaurants", "top-rated", limit],
    queryFn: () =>
      apiGet<Restaurant[]>("/restaurants", { ratingMin: 4.5, pageSize: limit }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRestaurantDetail(id: string) {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => apiGet<Restaurant>(`/restaurants/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRestaurantSearch(
  search: string,
  filters?: { ratingMin?: number; ratingMax?: number },
) {
  return useInfiniteQuery({
    queryKey: ["restaurants", "search", search, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await apiGetPaginated<Restaurant>("/restaurants", {
        search: search || undefined,
        ratingMin: filters?.ratingMin,
        ratingMax: filters?.ratingMax,
        page: pageParam,
        pageSize: 10,
      });
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: search.length >= 2,
    staleTime: 1000 * 60 * 2,
  });
}
