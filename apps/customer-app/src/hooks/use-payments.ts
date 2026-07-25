import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../lib/api-client";
import type { PaymentOrderResponse } from "../types";

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (orderId: string) =>
      apiPost<PaymentOrderResponse>("/payments/create-order", { orderId }),
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: (data: {
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature: string;
    }) => apiPost<{ status: string }>("/payments/verify", data),
  });
}
