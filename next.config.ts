import type { NextConfig } from "next";

// Resolved lazily from env so the build never fails before Supabase is
// configured — once NEXT_PUBLIC_SUPABASE_URL is set, uploaded media becomes
// optimizable via next/image automatically.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  // Prisma's query engine must not be bundled by Turbopack for the client;
  // this keeps it as a real Node dependency in server code paths.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
