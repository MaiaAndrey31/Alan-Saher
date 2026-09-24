import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Used only by the Prisma CLI (migrate/studio/db push) — always the direct
// (non-pooled) Supabase connection, port 5432. The running app never reads
// this; see src/lib/db.ts for the pooled runtime connection.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
