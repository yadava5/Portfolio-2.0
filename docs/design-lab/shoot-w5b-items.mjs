// W5 round-B items 2+3 verification shoot.
// Item 2: t-slip margin seating — automl + jobtracker at 1440/1024/390.
// Item 3: the "on file:" manifest — empty, seeded, live-pressed.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-w5";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const RECORD = { iso: "2026-07-18", label: "jul 18, 2026" };
const SEED = {
  "paper-memory:v1:visited": { jobtracker: RECORD, automl: RECORD },
  "paper-memory:v1:audits": { jobtracker: RECORD },
  "paper-memory:v1:approved": RECORD,
};

const browser = await chromium.launch();

async function scrollToId(page, id, offset = 120) {
  await page.evaluate(
    ([sel, off]) => {
      const el = document.getElementById(sel);
      if (!el) return;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - off,
        behavior: "instant",
      });
    },
    [id, offset]
  );
  await page.waitForTimeout(900);
}

/* ── Item 2: decisions margin seating ─────────────────────────────── */
for (const [tag, viewport] of [
  ["1440", { width: 1440, height: 900 }],
  ["1024", { width: 1024, height: 820 }],
  ["390", { width: 390, height: 844 }],
]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const id of ["automl", "jobtracker"]) {
    await page.goto(`${BASE}/projects/${id}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await scrollToId(page, "decisions", 100);
    await page.screenshot({ path: `${OUT}/b-tslips-${id}-${tag}.png` });
    console.log(`  ✓ b-tslips-${id}-${tag}`);
  }
  await ctx.close();
}

/* ── Item 3: the manifest ─────────────────────────────────────────── */
for (const [tag, viewport] of [
  ["1440", { width: 1440, height: 900 }],
  ["390", { width: 390, height: 844 }],
]) {
  /* empty store — nothing renders */
  {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await scrollToId(page, "gate", 60);
    await page.screenshot({ path: `${OUT}/b-manifest-empty-${tag}.png` });
    console.log(`  ✓ b-manifest-empty-${tag}`);
    await ctx.close();
  }
  /* seeded trail — dried manifest under the seal */
  {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.addInitScript((seed) => {
      for (const [key, value] of Object.entries(seed)) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    }, SEED);
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await scrollToId(page, "gate", 60);
    await page.screenshot({ path: `${OUT}/b-manifest-seeded-${tag}.png` });
    console.log(`  ✓ b-manifest-seeded-${tag}`);
    await ctx.close();
  }
}

/* live press at 1440: empty → sign at the gate → the line inks in */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await scrollToId(page, "gate", 60);
  await page.locator("[data-stamp]:visible").click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/b-manifest-livepress-1440.png` });
  console.log("  ✓ b-manifest-livepress-1440");
  await ctx.close();
}

await browser.close();
