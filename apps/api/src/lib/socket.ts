import { createServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { Express } from "express";
import jwt from "jsonwebtoken";
import { env } from "./env";
import { logger } from "./logger";

let io: Server;
let httpServer: HttpServer;

export function initSocket(app: Express): HttpServer {
  httpServer = createServer(app);

  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; roles: string[] };
      socket.userId = payload.userId;
      socket.roles = payload.roles;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId!;
    const roles: string[] = socket.roles ?? [];
    logger.info({ socketId: socket.id, userId }, "Socket connected");

    socket.join(`user:${userId}`);

    socket.on("join:restaurant", (restaurantId: string) => {
      if (roles.includes("RESTAURANT_OWNER") || roles.includes("ADMIN")) {
        socket.join(`restaurant:${restaurantId}`);
        logger.info({ socketId: socket.id, restaurantId }, "Joined restaurant room");
      }
    });

    socket.on("join:delivery", (partnerId: string) => {
      if (roles.includes("DELIVERY_PARTNER")) {
        socket.join(`delivery:${partnerId}`);
        logger.info({ socketId: socket.id, partnerId }, "Joined delivery room");
      }
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id, userId }, "Socket disconnected");
    });
  });

  return httpServer;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
