import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../lib/api-client";
import { getSocket } from "../lib/socket";
import type { Order } from "../types";

interface DeliveryInfo {
  assignment: {
    id: string;
    orderId: string;
    deliveryPartnerId: string | null;
    status: string;
    assignedAt: string;
    acceptedAt: string | null;
    pickedUpAt: string | null;
    completedAt: string | null;
  } | null;
  partner: {
    id: string;
    userId: string;
    vehicleType: string;
    licenseNumber: string;
    fullName: string;
    avatarUrl: string | null;
  } | null;
}

export function useOrder(orderId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => apiGet<Order>(`/orders/${orderId}`),
    enabled: !!orderId,
    refetchInterval: 1000 * 30,
  });

  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();

    const handleStatusChange = (data: { orderId: string; status: string }) => {
      if (data.orderId === orderId) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }
    };

    const handleCancelled = (data: { orderId: string }) => {
      if (data.orderId === orderId) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }
    };

    socket.on("order:status-changed", handleStatusChange);
    socket.on("order:cancelled", handleCancelled);

    return () => {
      socket.off("order:status-changed", handleStatusChange);
      socket.off("order:cancelled", handleCancelled);
    };
  }, [orderId, queryClient]);

  return query;
}

export function useDeliveryInfo(orderId: string) {
  return useQuery({
    queryKey: ["delivery", orderId],
    queryFn: () => apiGet<DeliveryInfo>(`/delivery/order/${orderId}`),
    enabled: !!orderId,
    refetchInterval: 1000 * 30,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => apiPost(`/orders/${orderId}/cancel`),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
}
