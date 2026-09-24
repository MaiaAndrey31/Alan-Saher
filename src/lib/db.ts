import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
// Relative (not the `@/` alias) so this file resolves identically under
// Next's bundler and under `tsx` running prisma/seed.ts outside Next.
import { PrismaClient } from "../generated/prisma/client";

/**
 * Runtime Prisma client — always the pooled Supabase connection (port 6543,
 * PgBouncer/Supavisor transaction mode), required on Vercel serverless where
 * every invocation would otherwise open its own direct connection. The CLI
 * (migrate/studio) uses the direct connection instead, via prisma.config.ts.
 *
 * Standard global-singleton pattern: avoids re-creating the client (and its
 * connection pool) on every dev hot-reload or warm serverless invocation.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
