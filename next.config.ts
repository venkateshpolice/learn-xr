import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Skip sharp image processing in dev — large PNGs (2–3MB each) were slowing first load
  images: {
    unoptimized: process.env.NODE_ENV === "development",
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
