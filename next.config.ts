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

  /**
   * Probe-only routes, admitted by FILE EXTENSION rather than by a
   * runtime branch.
   *
   * The HELD apparatus — the reserved dashed-clay stamp for a number
   * the site states but cannot yet reproduce — has three call sites
   * and, since Glyph's accuracy claim was earned on 2026-07-30, ZERO
   * production rows to render. Measured: `grep -rn "held:"
   * src/lib/data/` returns three hits and not one of them is a live
   * entry (a string inside an erratum, a counter's type, and that
   * counter initialised to 0). So `receiptAuditState`'s `held` branch,
   * `EvidenceTable`'s stamp block and /evidence's status line are all
   * unreachable in the shipped site, and a regression in any of them
   * would be invisible until the next claim needed holding.
   *
   * The fixture that covers them must therefore NOT ship. Gating a
   * normal route on the flag would not achieve that: `output: "export"`
   * emits every route in the tree at build time, so the page would
   * still appear in `out/` and in the sitemap, merely empty.
   * `pageExtensions` decides which files are routes AT ALL, so with the
   * flag unset `page.probe.tsx` is an ordinary module nothing imports
   * and the route does not exist to be exported.
   *
   * Same reasoning as the NEXT_PUBLIC_TEST_PROBES declaration above,
   * one level up the stack: there, a gate that only evaluated false at
   * runtime still shipped the code; here, a gate that only rendered
   * nothing would still ship the route.
   *
   * Verified the way F74 was — by looking at the build output, not by
   * trusting the config: `held-apparatus.spec.ts` asserts the probe
   * route resolves under the flag, and `check-probe-routes.mjs` asserts
   * `out/` contains no `probe/` route in a normal build.
   *
   * The directory is `probe/`, NOT `_probe/`. The first cut used the
   * leading underscore to signal "not a real page", and the route then
   * failed to appear even WITH the flag set — App Router reads
   * `_folder` as a private folder and opts it and every subfolder out
   * of routing entirely, so the two gates silently stacked and the
   * probe could never resolve. Two mechanisms that both mean "not a
   * route" is one mechanism too many; the extension is the gate, and
   * the folder name is just a name.
   */
  pageExtensions:
    process.env.NEXT_PUBLIC_TEST_PROBES === "1"
      ? ["tsx", "ts", "probe.tsx"]
      : ["tsx", "ts"],

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
