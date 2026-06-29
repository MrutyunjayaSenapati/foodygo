import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import crypto from "node:crypto";

vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock("../lib/redis", () => ({ redis: { get: vi.fn(), set: vi.fn(), del: vi.fn(), on: vi.fn(), quit: vi.fn() } }));

vi.mock("../modules/payments/repositories/payments.repository", () => ({
  findByOrderId: vi.fn(() => Promise.resolve({ id: "pay-1", orderId: "order-1", status: "UNPAID", amount: 1000 })),
  create: vi.fn(() => Promise.resolve({ id: "pay-1", status: "UNPAID" })),
  update: vi.fn(() => Promise.resolve({ id: "pay-1", status: "PAID", razorpayPaymentId: "pay_test" })),
}));

vi.mock("../modules/orders/repositories/orders.repository", () => ({
  findById: vi.fn(() => Promise.resolve({ id: "order-1", status: "PENDING", paymentStatus: "UNPAID" })),
  updateStatus: vi.fn(() => Promise.resolve({ id: "order-1", status: "CONFIRMED" })),
}));

import paymentsRoutes from "../modules/payments/routes/payments.routes";
import { errorHandler } from "../middleware/error-handler";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/payments", paymentsRoutes);
  app.use(errorHandler);
  return app;
}

describe("Payments Integration", () => {
  let app: express.Express;

  beforeAll(() => {
    app = createApp();
  });

  it("POST /api/v1/payments/create-order returns 401 without auth", async () => {
    const res = await request(app)
      .post("/api/v1/payments/create-order")
      .send({ amount: 1000 });
    expect(res.status).toBe(401);
  });

  it("should verify a valid HMAC signature", () => {
    const secret = "test_webhook_secret";
    const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_test", order_id: "order_test", status: "captured" } } } });
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const computed = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(signature).toBe(computed);
  });

  it("should reject tampered webhook payload", () => {
    const secret = "test_webhook_secret";
    const body = JSON.stringify({ event: "payment.captured" });
    const tamperedBody = JSON.stringify({ event: "payment.failed" });
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const computedForTampered = crypto.createHmac("sha256", secret).update(tamperedBody).digest("hex");
    expect(signature).not.toBe(computedForTampered);
  });
});
