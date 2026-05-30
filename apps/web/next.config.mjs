import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // @barter/db exports raw TypeScript (src/index.ts) — Next must compile it
  // into the bundle instead of copying the uncompiled .ts into the function,
  // which would throw at runtime. First runtime-imported workspace package.
  transpilePackages: ["@barter/db"],
  // Trace from the monorepo root so the hoisted Prisma query-engine binary
  // (generated into ../../node_modules by @barter/db) is bundled into the
  // serverless functions.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    },
  ],
}

export default nextConfig
