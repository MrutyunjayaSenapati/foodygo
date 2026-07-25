import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../lib/api-client";
import type { Order } from "../types";

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: { addressId: string; couponCode?: string }) =>
      apiPost<Order>("/orders", data),
  });
}
