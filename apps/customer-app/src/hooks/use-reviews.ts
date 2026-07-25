import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../lib/api-client";

export function useCreateReview() {
  return useMutation({
    mutationFn: (data: { restaurantId: string; rating: number; comment?: string }) =>
      apiPost("/reviews", data),
  });
}
