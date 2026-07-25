import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "../store/auth-store";
import { API_BASE_URL } from "../lib/api-client";

let socket: Socket | null = null;

let currentToken: string | null = null;

export function getSocket(): Socket {
  const token = useAuthStore.getState().accessToken;

  if (socket && currentToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    currentToken = token;
    const baseUrl = API_BASE_URL.replace("/api/v1", "");
    socket = io(baseUrl, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
