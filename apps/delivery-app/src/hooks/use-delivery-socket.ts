import { useEffect } from "react";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, disconnectSocket } from "../lib/socket";
import apiClient from "../lib/api-client";
import { useAuthStore } from "../store/auth-store";
import type { DeliveryPartnerProfile } from "../types";

export function useDeliverySocket() {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;

    const setup = async () => {
      const socket = getSocket();

      socket.on("connect", () => {
        // Fetch partner ID and join room
        apiClient
          .get("/delivery/partners/me")
          .then((res) => {
            const profile = res.data.data as DeliveryPartnerProfile;
            if (mounted && profile?.id) {
              socket.emit("join:delivery", profile.id);
            }
          })
          .catch(() => {});
      });

      if (socket.connected) {
        socket.emit("connect" as any);
      }

      socket.on("delivery:accepted", (data: { orderId: string }) => {
        queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
        queryClient.invalidateQueries({ queryKey: ["available-deliveries"] });
        queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
        Alert.alert("Delivery Accepted", `Order #${data.orderId.slice(0, 8).toUpperCase()} has been accepted`);
      });

      socket.on("delivery:picked-up", (data: { orderId: string }) => {
        queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
        queryClient.invalidateQueries({ queryKey: ["assignment"] });
        queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
      });

      socket.on("delivery:completed", (data: { orderId: string }) => {
        queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
        queryClient.invalidateQueries({ queryKey: ["assignment"] });
        queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
        Alert.alert("Delivery Completed", `Order #${data.orderId.slice(0, 8).toUpperCase()} has been delivered`);
      });

      socket.on("order:status-changed", (data: { orderId: string; status: string }) => {
        queryClient.invalidateQueries({ queryKey: ["assignment"] });
      });

      socket.on("order:cancelled", (data: { orderId: string }) => {
        queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
        queryClient.invalidateQueries({ queryKey: ["assignment"] });
        queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
      });
    };

    setup();

    return () => {
      mounted = false;
      const socket = getSocket();
      socket.off("delivery:accepted");
      socket.off("delivery:picked-up");
      socket.off("delivery:completed");
      socket.off("order:status-changed");
      socket.off("order:cancelled");
    };
  }, [isAuthenticated, queryClient]);
}
