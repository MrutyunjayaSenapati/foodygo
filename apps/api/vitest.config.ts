import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    exclude: ["node_modules", "dist"],
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      REDIS_URL: "redis://localhost:6379",
      JWT_SECRET: "test-jwt-secret-that-is-at-least-32-chars-long!!",
      JWT_REFRESH_SECRET: "test-refresh-secret-that-is-at-least-32-chars!!",
      NODE_ENV: "test",
    },
  },
});
