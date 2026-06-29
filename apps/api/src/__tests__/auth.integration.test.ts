import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../lib/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn((fn: (tx: Record<string, unknown>) => unknown) => fn({ insert: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: "user-id" }]) }) })),
  },
}));

vi.mock("../lib/redis", () => ({ redis: { get: vi.fn(), set: vi.fn(), del: vi.fn(), on: vi.fn(), quit: vi.fn() } }));
vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));

import authRoutes from "../modules/auth/routes/auth.routes";
import { errorHandler } from "../middleware/error-handler";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/auth", authRoutes);
  app.use(errorHandler);
  return app;
}

describe("Auth Integration", () => {
  let app: express.Express;

  beforeAll(() => {
    app = createApp();
  });

  it("POST /api/v1/auth/register returns 400 when email missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ password: "test1234", fullName: "Test" });
    expect(res.status).toBe(400);
  });

  it("POST /api/v1/auth/login returns 400 when body invalid", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({});
    expect(res.status).toBe(400);
  });

  it("POST /api/v1/auth/refresh returns 400 without token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .send({});
    expect(res.status).toBe(400);
  });

  it("POST /api/v1/auth/register returns 400 for weak password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "test@test.com", password: "123", fullName: "Test" });
    expect(res.status).toBe(400);
  });

  it("GET /api/v1/auth/me returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });
});
