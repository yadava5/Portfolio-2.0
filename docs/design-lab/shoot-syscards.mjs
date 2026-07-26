// SYSTEM CARDS + CADENCE ISOLATION shoot — evidence for the round that
// gave the placement model its third terminal and gave Cadence its
// security section.
//
// Captures, into docs/design-lab/shots-syscards/:
//   case-rail-cadence      the meta ledger with `system card ↗` under
//                          `live demo ↗` — the composition the row depends on
//   case-rail-applied      the same rail on a second file (four carry it)
//   case-rail-390          the rail at 390, where the path must still read
//   ch05-jetpack           ¶05's jetpack rail — the only row that grew
//   ch05-jetpack-390       the same rail at 390 (it does not grow here)
//   ch05-index             ¶05's closing index — LifeQuest's line, both links
//   ch05-index-390         the same at 390, where the two links split lines
//   cadence-summary        the deck, which now names the inert standing
//   cadence-decisions      the two new ADR clauses (GUC over pooler; inert)
//   cadence-receipt-05     the receipt that must never be skimmed
//   cadence-receipts       the isolation rows as a block
//   cadence-boundaries     "what i'm NOT claiming" — four new limits
//   cadence-corrections    the register: the two-pin note + the host erratum
//
// Serve the static export on :3200 first (tests/playwright/static-server.mjs).
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://127.0.0.1:3200";
const OUT = "docs/design-lab/shots-syscards";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

const clipAround = async (page, locator, pad = 28, width = 1440) => {
  const box = await locator.boundingBox();
  return {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: Math.min(width, box.width + pad * 2),
    height: box.height + pad * 2,
  };
};

const shoot = async (page, name, locator, pad = 28, width = 1440) => {
  try {
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `${OUT}/${name}.png`,
      clip: await clipAround(page, locator, pad, width),
    });
    console.log(`  ▸ ${name}`);
  } catch (error) {
    console.log(`  ! ${name} — ${error.message.split("\n")[0]}`);
  }
};

/* ── the case-file rails ───────────────────────────────────────── */
const desktop = await browser.newPage({
  viewport: { width: 1440, height: 900 },
});

for (const [name, id] of [
  ["case-rail-cadence", "taskflow-calendar"],
  ["case-rail-applied", "jobtracker"],
]) {
  await desktop.goto(`${BASE}/projects/${id}/`, { waitUntil: "networkidle" });
  await desktop.waitForTimeout(500);
  /* The whole dl, so the shot shows the system-card row in the company
     it keeps — role, timeframe, stack, repo @ sha, live demo, card. */
  await shoot(desktop, name, desktop.locator("dl").first(), 24);
}

/* ── Cadence's isolation section ───────────────────────────────── */
await desktop.goto(`${BASE}/projects/taskflow-calendar/`, {
  waitUntil: "networkidle",
});
await desktop.waitForTimeout(500);

await shoot(desktop, "cadence-summary", desktop.locator("header").last(), 28);
await shoot(desktop, "cadence-decisions", desktop.locator("#decisions"), 24);
await shoot(
  desktop,
  "cadence-receipt-05",
  desktop.locator("#v-taskflow-calendar-5"),
  36
);
await shoot(desktop, "cadence-corrections", desktop.locator("#corrections"), 24);

/* The isolation rows as one block: receipt 04 through receipt 10. Taken
   at a tall viewport rather than clipped out of a 900px frame. */
try {
  await desktop.setViewportSize({ width: 1440, height: 2200 });
  const first = desktop.locator("#v-taskflow-calendar-4");
  const last = desktop.locator("#v-taskflow-calendar-10");
  await first.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(700);
  const a = await first.boundingBox();
  const b = await last.boundingBox();
  await desktop.screenshot({
    path: `${OUT}/cadence-receipts.png`,
    clip: {
      x: Math.max(0, a.x - 24),
      y: Math.max(0, a.y - 24),
      width: Math.min(1440, a.width + 48),
      height: Math.min(2200 - Math.max(0, a.y - 24), b.y + b.height - a.y + 48),
    },
  });
  console.log("  ▸ cadence-receipts");
} catch (error) {
  console.log(`  ! cadence-receipts — ${error.message.split("\n")[0]}`);
}

/* The boundary rows — found by their own heading, not by structure. */
try {
  const block = desktop
    .locator("#validation div")
    .filter({ hasText: "NOT claiming" })
    .last();
  await block.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(600);
  const box = await block.boundingBox();
  await desktop.screenshot({
    path: `${OUT}/cadence-boundaries.png`,
    clip: {
      x: Math.max(0, box.x - 24),
      y: Math.max(0, box.y - 24),
      width: Math.min(1440, box.width + 48),
      height: box.height + 48,
    },
  });
  console.log("  ▸ cadence-boundaries");
} catch (error) {
  console.log(`  ! cadence-boundaries — ${error.message.split("\n")[0]}`);
}

/* ── ¶05, both worlds ──────────────────────────────────────────── */
await desktop.setViewportSize({ width: 1440, height: 900 });
await desktop.goto(`${BASE}/`, { waitUntil: "networkidle" });
await desktop.waitForTimeout(600);

const jetpackRow = (page) =>
  page.locator("#work [data-thread-row]").filter({ hasText: "jetpack" });
const indexBlock = (page) =>
  page.locator("#work div").filter({ hasText: "also live, without a case file" }).last();

await shoot(desktop, "ch05-jetpack", jetpackRow(desktop), 24);
await shoot(desktop, "ch05-index", indexBlock(desktop), 24);

const mobile = await browser.newPage({ ...devices["Pixel 5"] });
await mobile.goto(`${BASE}/`, { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
await shoot(mobile, "ch05-jetpack-390", jetpackRow(mobile), 16, 390);
await shoot(mobile, "ch05-index-390", indexBlock(mobile), 16, 390);

await mobile.goto(`${BASE}/projects/taskflow-calendar/`, {
  waitUntil: "networkidle",
});
await mobile.waitForTimeout(500);
await shoot(mobile, "case-rail-390", mobile.locator("dl").first(), 16, 390);

await browser.close();
