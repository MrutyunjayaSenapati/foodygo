import { useInfiniteQuery } from "@tanstack/react-query";
import { apiGetPaginated } from "../lib/api-client";
import type { Order } from "../types";

export interface OrderListItem extends Order {
  restaurantName?: string;
  restaurantLogo?: string;
}

export function useOrdersList() {
  return useInfiniteQuery({
    queryKey: ["orders"],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await apiGetPaginated<OrderListItem>("/orders", {
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
    staleTime: 1000 * 60 * 2,
  });
}
