import { beforeEach, describe, expect, mock, test } from "bun:test";

import {
  createUser,
  getUserByEmail,
  hashPassword,
  verifyPassword,
} from "@/api/auth/auth.service";

const mockUser = {
  id: BigInt(1),
  email: "test@example.com",
  passwordHash: "$2b$10$hashedpassword",
  role: "USER" as const,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

type MockUser = typeof mockUser | null;

const mockPrisma = {
  user: {
    findFirst: mock(() => Promise.resolve(null as MockUser)),
    create: mock(() => Promise.resolve(mockUser)),
  },
};

mock.module("@/api/lib/prisma", () => ({
  default: mockPrisma,
}));

describe("auth.service", () => {
  beforeEach(() => {
    mockPrisma.user.findFirst.mockReset();
    mockPrisma.user.create.mockReset();
  });

  describe("getUserByEmail", () => {
    test("returns user when found", async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(mockUser);

      const result = await getUserByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledTimes(1);
    });

    test("returns null when user not found", async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      const result = await getUserByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });

    test("trims and searches case-insensitively", async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(mockUser);

      await getUserByEmail("  TEST@EXAMPLE.COM  ");

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: { equals: "TEST@EXAMPLE.COM", mode: "insensitive" } },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
        },
      });
    });
  });

  describe("createUser", () => {
    test("creates user with trimmed lowercase email", async () => {
      const createdUser = { ...mockUser, email: "new@example.com" };
      mockPrisma.user.create.mockResolvedValueOnce(createdUser);

      const result = await createUser("  NEW@EXAMPLE.COM  ", "hashedPassword");

      expect(result).toEqual(createdUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "new@example.com",
          passwordHash: "hashedPassword",
        },
      });
    });

    test("returns created user with all fields", async () => {
      mockPrisma.user.create.mockResolvedValueOnce(mockUser);

      const result = await createUser("test@example.com", "hashedPassword");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("passwordHash");
      expect(result).toHaveProperty("role");
    });
  });

  describe("hashPassword", () => {
    test("hashes a password using bcrypt", async () => {
      const password = "securePassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]?\$/);
    });

    test("produces different hashes for the same password (salt)", async () => {
      const password = "securePassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    test("returns true for matching password and hash", async () => {
      const password = "securePassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    test("returns false for non-matching password", async () => {
      const password = "securePassword123";
      const wrongPassword = "wrongPassword456";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    test("returns false for empty password", async () => {
      const password = "securePassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("", hash);

      expect(isValid).toBe(false);
    });
  });
});
