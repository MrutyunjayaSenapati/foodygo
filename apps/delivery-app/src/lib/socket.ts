import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "../store/auth-store";

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
    const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace("/api/v1", "");
    socket = io(baseUrl, {
      transports: ["websocket"],
      auth: { token },
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
