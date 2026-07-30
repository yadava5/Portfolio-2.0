import { defineConfig, devices } from "@playwright/test";

/* CRITIC-LEDGER F74: `window.__frameGovernor` — a remote control that
   can force any reader to the print tier — used to be installed
   unconditionally, production builds included. It is now gated on
   NEXT_PUBLIC_TEST_PROBES, which the test:e2e:* scripts set and nothing
   else does. The specs that drive the probe live here, so this is where
   the requirement is stated: a probe spec run against a probe-less
   build should fail with an instruction, not a null dereference. */
const PROBE_SPECS = ["frame-governor", "text-garnish"];
if (
  process.env.NEXT_PUBLIC_TEST_PROBES !== "1" &&
  process.argv.some((arg) => PROBE_SPECS.some((spec) => arg.includes(spec)))
) {
  throw new Error(
    "frame-governor.spec.ts and text-garnish.spec.ts drive " +
      "window.__frameGovernor, which only exists in a build made with " +
      "NEXT_PUBLIC_TEST_PROBES=1. Run `npm run test:e2e:probes`, or export " +
      "NEXT_PUBLIC_TEST_PROBES=1 for both the build and the test run."
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
    /* SAFARI — added 2026-07-30, and it was the largest hole in this
       matrix. Until today every one of these specs ran on Chromium
       twice and Firefox once: ZERO WebKit coverage, on a site whose
       readers open it from a LinkedIn message on an iPhone. Every iOS
       browser is WebKit regardless of its badge, so this project is not
       "one more desktop browser" — it is the whole mobile-Safari
       surface, which the chromium-mobile project only ever emulated in
       Blink.
       It matters here more than on an average site because this build
       leans on features Safari has historically shipped last or
       differently: `oklch()` colour (the entire day-arc is oklch
       channel scrubs), `:has()` (the print folio-orphan fix), `contain:
       paint`, and `animation-timeline: view()` (the folio dissolve and
       caption settle — Chrome 115+, Safari 18+, Firefox not at all,
       which is why they sit behind `@supports`).
       Desktop and mobile seats both, because the two differ in more
       than width on WebKit — viewport units, scroll anchoring and
       compositing all behave differently on iOS. */
    {
      name: "webkit-desktop",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "webkit-mobile",
      use: {
        ...devices["iPhone 14"],
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
