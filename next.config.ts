import type { NextConfig } from "next";

const productionBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.NODE_ENV === "production" ? "/Portfolio-2.0" : "");

const nextConfig: NextConfig = {
  /**
   * CRITIC-LEDGER F74 — the test-probe flag, declared so it is ALWAYS
   * inlined.
   *
   * `window.__frameGovernor` (governor.ts) is a remote control that can
   * force any reader to the print tier, and it used to be installed on
   * every load. It is now behind
   * `process.env.NEXT_PUBLIC_TEST_PROBES === "1"` — but an UNSET
   * NEXT_PUBLIC_* variable is not substituted at all: the reference
   * survives into the bundle, evaluates false at runtime, and the whole
   * harness ships as unreachable-but-present code. Measured: the probe
   * was still in the production chunks after the gate went in.
   *
   * Declaring it here means the value is always a string literal in the
   * output, so an unset flag compiles to `"" === "1"` — statically
   * false, and the minifier deletes the block. Verified by grepping
   * `__frameGovernor` in out/_next/static/chunks after each build.
   */
  env: {
    NEXT_PUBLIC_TEST_PROBES: process.env.NEXT_PUBLIC_TEST_PROBES ?? "",
  },

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
