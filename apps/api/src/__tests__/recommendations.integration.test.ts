import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

const mockRestaurants = [
  { id: "rest-1", name: "Test Restaurant", description: null, logoUrl: null, coverUrl: null, rating: "4.5", status: "APPROVED", cuisine: "Italian", latitude: "40.7128", longitude: "-74.0060", deletedAt: null, address: null, phone: null, email: null, ownerUserId: "owner-1", deliveryFee: null, estimatedDeliveryTime: null, createdAt: new Date(), updatedAt: new Date() },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function chain(returnValue: unknown): any {
  const val = returnValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler: ProxyHandler<any> = {
    get: (_target, prop) => {
      if (prop === "then") return (resolve: (v: unknown) => void) => resolve(val);
      return new Proxy(() => val, handler);
    },
    apply: (_target, _thisArg, args) => {
      if (args.length === 1 && typeof args[0] === "function") return val;
      return new Proxy(() => val, handler);
    },
  };
  return new Proxy(() => val, handler);
}

vi.mock("../lib/db", () => ({
  db: {
    select: vi.fn(() => chain(Promise.resolve(mockRestaurants))),
    selectDistinct: vi.fn(() => chain(Promise.resolve([]))),
  },
}));

vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));
vi.mock("../lib/redis", () => ({ redis: { get: vi.fn(), set: vi.fn(), del: vi.fn(), on: vi.fn(), quit: vi.fn() } }));

import recommendationsRoutes from "../modules/recommendations/routes/recommendations.routes";
import { errorHandler } from "../middleware/error-handler";
import { env } from "../lib/env";

const createToken = (userId: string, roles: string[]) =>
  jwt.sign({ userId, roles }, env.JWT_SECRET, { expiresIn: "15m" });

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/recommendations", recommendationsRoutes);
  app.use(errorHandler);
  return app;
}

describe("Recommendations Integration", () => {
  let app: express.Express;

  beforeAll(() => {
    app = createApp();
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/v1/recommendations");
    expect(res.status).toBe(401);
  });

  it("returns 200 with scored results", async () => {
    const token = createToken("user-1", ["CUSTOMER"]);
    const res = await request(app)
      .get("/api/v1/recommendations")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("returns 200 for any authenticated role (no RBAC guard)", async () => {
    const token = createToken("partner-1", ["DELIVERY_PARTNER"]);
    const res = await request(app)
      .get("/api/v1/recommendations")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
