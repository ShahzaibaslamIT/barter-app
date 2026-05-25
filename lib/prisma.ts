import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

globalForPrisma.prisma = prisma;

/**
 * Keep Neon DB awake — ping every 4 minutes (free tier suspends after ~5 min idle).
 * Also ping immediately on startup to wake the DB if it's sleeping.
 */
if (typeof globalThis !== "undefined" && !(globalForPrisma as any).__keepAlive) {
  (globalForPrisma as any).__keepAlive = true;

  const ping = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        if (i > 0) console.log("[prisma] DB connection established after retry");
        return;
      } catch {
        if (i < retries - 1) {
          // Wait before retry — give Neon time to wake up
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }
  };

  // Wake DB immediately on startup
  ping();

  // Then keep it awake
  setInterval(() => ping(1), 4 * 60 * 1000);
}
