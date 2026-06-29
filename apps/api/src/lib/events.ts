import { getIO } from "./socket";

export function emitToUser(userId: string, event: string, data: unknown) {
  try {
    getIO().to(`user:${userId}`).emit(event, data);
  } catch {
    // Socket.IO not initialized
  }
}

export function emitToRestaurant(restaurantId: string, event: string, data: unknown) {
  try {
    getIO().to(`restaurant:${restaurantId}`).emit(event, data);
  } catch {
    // Socket.IO not initialized
  }
}

export function emitToDeliveryPartner(partnerId: string, event: string, data: unknown) {
  try {
    getIO().to(`delivery:${partnerId}`).emit(event, data);
  } catch {
    // Socket.IO not initialized
  }
}
