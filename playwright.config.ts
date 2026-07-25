import { defineConfig, devices } from "@playwright/test";

/* CRITIC-LEDGER F74: `window.__frameGovernor` — a remote control that
   can force any reader to the print tier — used to be installed
   unconditionally, production builds included. It is now gated on
   NEXT_PUBLIC_TEST_PROBES, which the test:e2e:* scripts set and nothing
   else does. The specs that drive the probe live here, so this is where
   the requirement is stated: a probe spec run against a probe-less
   build should fail with an instruction, not a null dereference. */
const PROBE_SPECS = ["frame-governor"];
if (
  process.env.NEXT_PUBLIC_TEST_PROBES !== "1" &&
  process.argv.some((arg) => PROBE_SPECS.some((spec) => arg.includes(spec)))
) {
  throw new Error(
    "frame-governor.spec.ts drives window.__frameGovernor, which only exists " +
      "in a build made with NEXT_PUBLIC_TEST_PROBES=1. Run " +
      "`npm run test:e2e:probes`, or export NEXT_PUBLIC_TEST_PROBES=1 for " +
      "both the build and the test run."
  );
}

const port = process.env.PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const nextDevCommand = `${JSON.stringify(
  process.execPath
)} node_modules/next/dist/bin/next dev --webpack --hostname 0.0.0.0 --port ${port}`;
const staticServerCommand = `${JSON.stringify(
  process.execPath
)} tests/playwright/static-server.mjs`;

export default defineConfig({
  testDir: "./tests/playwright",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "output/playwright/html-report", open: "never" }],
  ],
  outputDir: "output/playwright/test-results",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 5"],
      },
    },
    {
      name: "firefox-desktop",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command:
      process.env.PLAYWRIGHT_USE_NEXT_DEV === "1"
        ? nextDevCommand
        : staticServerCommand,
    url: baseURL,
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "1",
    timeout: 120000,
  },
});
