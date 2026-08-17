import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../lib/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../lib/redis", () => ({ redis: { get: vi.fn(), set: vi.fn(), del: vi.fn(), on: vi.fn(), quit: vi.fn() } }));
vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));

import usersRoutes from "../modules/users/routes/users.routes";
import { errorHandler } from "../middleware/error-handler";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/users", usersRoutes);
  app.use(errorHandler);
  return app;
}

describe("Users Integration", () => {
  let app: express.Express;

  beforeAll(() => {
    app = createApp();
  });

  it("GET /api/v1/users returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/users");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/users/:id returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/users/some-user-id");
    expect(res.status).toBe(401);
  });

  it("PATCH /api/v1/users/:id/status returns 401 without token", async () => {
    const res = await request(app)
      .patch("/api/v1/users/some-user-id/status")
      .send({ status: "ACTIVE" });
    expect(res.status).toBe(401);
  });

  it("PATCH /api/v1/users/fcm-token returns 401 without token", async () => {
    const res = await request(app)
      .patch("/api/v1/users/fcm-token")
      .send({ fcmToken: "token123" });
    expect(res.status).toBe(401);
  });
});
