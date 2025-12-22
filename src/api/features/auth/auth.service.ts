import prisma from "@/api/lib/prisma";

export async function getUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
    },
  });
}

export async function createUser(email: string, passwordHash: string) {
  return prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      passwordHash,
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return Bun.password.verify(password, hash);
}
