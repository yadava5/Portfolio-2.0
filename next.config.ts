import type { NextConfig } from "next";

const productionBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.NODE_ENV === "production" ? "/Portfolio-2.0" : "");

const nextConfig: NextConfig = {
  /** Enable static export for GitHub Pages */
  output: "export",

  /** Base path for GitHub Pages (repo name) */
  basePath: productionBasePath,

  /** Trailing slashes for static hosting compatibility */
  trailingSlash: true,

  /** Disable image optimization for static export */
  images: {
    unoptimized: true,
    qualities: [75, 85],
  },

  /** Fix Turbopack root directory for monorepo setup */
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
