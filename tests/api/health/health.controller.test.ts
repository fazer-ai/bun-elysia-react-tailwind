import { beforeEach, describe, expect, mock, test } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { Elysia } from "elysia";

import { healthController } from "@/api/health/health.controller";

const mockPrisma = {
  $queryRaw: mock(() => Promise.resolve([{ 1: 1 }])),
};

mock.module("@/api/lib/prisma", () => ({
  default: mockPrisma,
}));

const createTestClient = () => {
  const app = new Elysia().use(healthController);
  return treaty(app);
};

describe("healthController", () => {
  beforeEach(() => {
    mockPrisma.$queryRaw.mockReset();
  });

  describe("GET /health", () => {
    test("returns ok status when database is healthy", async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ 1: 1 }]);

      const api = createTestClient();
      const response = await api.health.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("status", "ok");
      expect(response.data).toHaveProperty("db");
      expect(response.data?.db).toHaveProperty("ok", true);
    });

    test("returns degraded status when database is unhealthy", async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(
        new Error("Connection failed"),
      );

      const api = createTestClient();
      const response = await api.health.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("status", "degraded");
      expect(response.data?.db).toHaveProperty("ok", false);
      expect(response.data?.db).toHaveProperty("error");
    });

    test("includes package info in response", async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ 1: 1 }]);

      const api = createTestClient();
      const response = await api.health.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("name");
      expect(response.data).toHaveProperty("version");
    });
  });
});
