import "express";
import "http";
import "socket.io";

declare namespace Express {
  interface Request {
    id?: string;
    rawBody?: string;
    user?: {
      userId: string;
      roles: string[];
    };
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody?: string;
  }
}

declare module "socket.io" {
  interface Socket {
    userId?: string;
    roles?: string[];
  }
}
