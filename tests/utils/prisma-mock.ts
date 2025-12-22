import { mock } from "bun:test";

export const mockUser = {
  id: BigInt(1),
  email: "test@example.com",
  passwordHash: "$2b$10$hashedpassword",
  role: "USER" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export type MockUser = typeof mockUser | null;

export const mockFindFirst = mock(() => Promise.resolve(null as MockUser));
export const mockCreate = mock(() => Promise.resolve(mockUser));
export const mockQueryRaw = mock(() => Promise.resolve([{ 1: 1 }]));

export const prismaMock = {
  user: {
    findFirst: mockFindFirst,
    create: mockCreate,
  },
  $queryRaw: mockQueryRaw,
};

export function setupPrismaMock() {
  mock.module("@/api/lib/prisma", () => ({
    default: prismaMock,
  }));
}

export function resetPrismaMocks() {
  mockFindFirst.mockReset();
  mockCreate.mockReset();
  mockQueryRaw.mockReset();
}
