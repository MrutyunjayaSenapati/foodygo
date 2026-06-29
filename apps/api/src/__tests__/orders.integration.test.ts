import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock("../lib/fcm", () => ({ sendPushNotificationToUser: vi.fn(() => Promise.resolve()) }));

vi.mock("../modules/orders/repositories/orders.repository", () => ({
  getOrdersByUser: vi.fn(() => Promise.resolve({ data: [], total: 0, page: 1, pageSize: 10 })),
  getOrderById: vi.fn(() => Promise.resolve(null)),
  getOrderItems: vi.fn(() => Promise.resolve([])),
  updateStatus: vi.fn(() => Promise.resolve({ id: "order-1", status: "RESTAURANT_ACCEPTED" })),
  createFromCart: vi.fn(() => Promise.resolve({ id: "order-1", status: "PENDING" })),
  getOrdersByRestaurant: vi.fn(() => Promise.resolve({ data: [], total: 0, page: 1, pageSize: 10 })),
}));

vi.mock("../modules/notifications/repositories/notifications.repository", () => ({
  create: vi.fn(() => Promise.resolve({ id: "notif-1" })),
}));

import ordersRoutes from "../modules/orders/routes/orders.routes";
import { errorHandler } from "../middleware/error-handler";
import { env } from "../lib/env";

const createToken = (userId: string, roles: string[]) =>
  jwt.sign({ userId, roles }, env.JWT_SECRET, { expiresIn: "15m" });

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/orders", ordersRoutes);
  app.use(errorHandler);
  return app;
}

describe("Orders Integration", () => {
  let app: express.Express;

  beforeAll(() => {
    app = createApp();
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/v1/orders");
    expect(res.status).toBe(401);
  });

  it("POST /api/v1/orders returns 401 without auth", async () => {
    const res = await request(app).post("/api/v1/orders").send({});
    expect(res.status).toBe(401);
  });

  it("returns 200 with valid token", async () => {
    const token = createToken("user-1", ["CUSTOMER"]);
    const res = await request(app)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("returns 404 for non-existent order", async () => {
    const token = createToken("user-1", ["CUSTOMER"]);
    const res = await request(app)
      .get("/api/v1/orders/non-existent")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("PATCH /api/v1/orders/:id/status returns 401 without auth", async () => {
    const res = await request(app)
      .patch("/api/v1/orders/order-1/status")
      .send({ status: "RESTAURANT_ACCEPTED" });
    expect(res.status).toBe(401);
  });
});
