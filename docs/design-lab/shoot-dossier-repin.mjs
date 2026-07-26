// DOSSIER RE-PIN shoot — evidence for the Applied re-pin (3225eb4 →
// 36a2f54) and LifeQuest's ¶05 index placement.
//
// Captures, into docs/design-lab/shots-dossier/:
//   applied-kicker      the case-file head — status word + the new
//                       repo pin ledger (yadava5/applied @ 36a2f54)
//   applied-summary     the rewritten summary + evidence disclosure
//   applied-fig2        architecture fig. 2 — the RLS gate node
//   applied-receipts    the receipts table (9 rows, re-pinned)
//   applied-boundaries  "what i'm NOT claiming" — the rules-only and
//                       stale-docs rows this round added
//   applied-corrections the corrections register — the three errata
//   applied-artifacts   the provenance strips (README relabelled)
//   home-ch05-index     ¶05's closing index, both lines, with LifeQuest
//   home-ch05-index-mob the same at 390px
//
// Serve the static export on :3200 first (tests/playwright/static-server.mjs).
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://127.0.0.1:3200";
const OUT = "docs/design-lab/shots-dossier";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

const clipAround = async (page, sel, pad = 28, width = 1440) => {
  const box = await page.locator(sel).first().boundingBox();
  return {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: Math.min(width, box.width + pad * 2),
    height: box.height + pad * 2,
  };
};

const settle = async (page, sel) => {
  await page.locator(sel).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
};

/* ── the case file ─────────────────────────────────────────────── */
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(`${BASE}/projects/jobtracker/`, {
  waitUntil: "networkidle",
});
await desktop.waitForTimeout(900);

const plates = [
  ["applied-kicker", "[data-dossier-kicker]"],
  ["applied-summary", "#problem"],
  ["applied-fig2", "#architecture"],
  ["applied-receipts", "[data-receipt-row]"],
  ["applied-artifacts", "#artifacts"],
];

for (const [name, sel] of plates) {
  try {
    await settle(desktop, sel);
    /* The kicker and the receipts rows are narrow strips — widen the
       clip so the plate carries its own context (the pin ledger under
       the kicker; the rows around the first receipt). */
    const pad = name === "applied-kicker" || name === "applied-receipts" ? 220 : 28;
    await desktop.screenshot({
      path: `${OUT}/${name}.png`,
      clip: await clipAround(desktop, sel, pad),
    });
    console.log(`  ▸ ${name}`);
  } catch (error) {
    console.log(`  ! ${name} — ${error.message.split("\n")[0]}`);
  }
}

/* The boundary rows. Selected by their own heading, not by structure:
   `#validation ul` grabs a receipt row's artifact list and
   `div:has(> h3)` grabs the whole section. This is the block whose two
   new rows carry the round's honesty — it has to be the right block. */
try {
  const block = desktop
    .locator("#validation div")
    .filter({ hasText: "NOT claiming" })
    .last();
  await block.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(600);
  const box = await block.boundingBox();
  await desktop.screenshot({
    path: `${OUT}/applied-boundaries.png`,
    clip: {
      x: Math.max(0, box.x - 28),
      y: Math.max(0, box.y - 28),
      width: Math.min(1440, box.width + 56),
      height: box.height + 56,
    },
  });
  console.log("  ▸ applied-boundaries");
} catch (error) {
  console.log(`  ! applied-boundaries — ${error.message.split("\n")[0]}`);
}

/* The corrections register — found by its own heading, because its
   container has no stable id. */
try {
  /* Three errata run long, so the register is shot at a tall viewport
     rather than clipped out of a 900px frame. */
  await desktop.setViewportSize({ width: 1440, height: 1400 });
  const reg = desktop.getByText(/corrections/i).last();
  await reg.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(700);
  const box = await reg.boundingBox();
  const top = Math.max(0, box.y - 40);
  await desktop.screenshot({
    path: `${OUT}/applied-corrections.png`,
    clip: { x: Math.max(0, box.x - 28), y: top, width: 960, height: 1400 - top },
  });
  console.log("  ▸ applied-corrections");
} catch (error) {
  console.log(`  ! applied-corrections — ${error.message.split("\n")[0]}`);
}

/* ── ¶05's closing index, with LifeQuest ───────────────────────── */
await desktop.goto(`${BASE}/`, { waitUntil: "networkidle" });
await desktop.waitForTimeout(600);
await desktop.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll("#work p"));
  const head = nodes.find((n) => n.textContent.includes("cited above"));
  head?.scrollIntoView({ behavior: "instant", block: "center" });
});
await desktop.waitForTimeout(1400);
await desktop.screenshot({ path: `${OUT}/home-ch05-index.png` });
console.log("  ▸ home-ch05-index");

const mobile = await browser.newPage({ ...devices["Pixel 5"] });
await mobile.goto(`${BASE}/`, { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
await mobile.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll("#work p"));
  const head = nodes.find((n) => n.textContent.includes("cited above"));
  head?.scrollIntoView({ behavior: "instant", block: "center" });
});
await mobile.waitForTimeout(1400);
await mobile.screenshot({ path: `${OUT}/home-ch05-index-mob.png` });
console.log("  ▸ home-ch05-index-mob");

await browser.close();
