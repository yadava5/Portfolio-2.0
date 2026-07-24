/**
 * Small-font audit shots (owner: "give more attention to small fonts"):
 * close-up clips of every ≤13px voice — header/rail mono labels, the
 * 11px apparatus lines, scene-figure SVG text (12.5px + 9.5px sc-small),
 * folio kickers — over BOTH the day paper and the dusk field, at 1x AND
 * 2x DPR, into docs/design-lab/shots-smallfonts/.
 *
 * Serves the committed static export (build first):
 *   NEXT_PUBLIC_BASE_PATH= npm run build
 *   node docs/design-lab/shoot-smallfonts.mjs
 */

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = resolve(repo, "docs/design-lab/shots-smallfonts");
mkdirSync(outDir, { recursive: true });

const PORT = 3312;
const server = spawn(process.execPath, ["tests/playwright/static-server.mjs"], {
  cwd: repo,
  env: { ...process.env, PORT: String(PORT) },
  stdio: "ignore",
});
await new Promise((r) => setTimeout(r, 1500));

/** [name, scroll target, clip selector] — clip is padded 12px around. */
const SHOTS = [
  // Day paper (hero, ch01): 11px apparatus lines + 13px header labels
  ["hero-11px-apparatus", { y: 0 }, "text=case files:"],
  ["header-labels-day", { y: 0 }, ".site-header"],
  // ch05 work rows: 11px "last verified" mute + 12.5px scene text
  ["ch05-last-verified-11px", { chapter: "05", offset: 0.35 }, null],
  // Dusk range, night entry (field dark, chrome still day)
  ["ch06-night-entry-scene", { dusk: 0.75 }, "[data-chapter='06']"],
  // Settled dusk (chrome flipped): header + rail + scene sc-small
  ["header-labels-dusk", { dusk: 1.0 }, ".site-header"],
  ["ch06-scene-smalltext-dusk", { dusk: 1.0 }, "[data-chapter='06']"],
];

const browser = await chromium.launch();

for (const dpr of [1, 2]) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: dpr,
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/`);
  await page
    .locator("header[data-lenis-connected='true']")
    .waitFor({ timeout: 8000 });
  await page.locator(".pin-spacer").first().waitFor({ timeout: 8000 });
  await page.waitForTimeout(400);

  const scrollTo = async (target) => {
    await page.evaluate((t) => {
      if (t.y !== undefined) {
        window.scrollTo({ top: t.y, behavior: "instant" });
        return;
      }
      if (t.chapter) {
        const el = document.querySelector(`[data-chapter='${t.chapter}']`);
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: Math.round(top + el.getBoundingClientRect().height * t.offset),
          behavior: "instant",
        });
        return;
      }
      const sec = document.querySelector("[data-chapter='06']");
      const top = sec.getBoundingClientRect().top + window.scrollY;
      const f = 0.92 * (1 - t.dusk);
      window.scrollTo({
        top: Math.round(top - window.innerHeight * f) + (t.dusk >= 1 ? 4 : 0),
        behavior: "instant",
      });
    }, target);
    await page.waitForTimeout(350);
  };

  for (const [name, target, selector] of SHOTS) {
    await scrollTo(target);
    const path = `${outDir}/${name}-${dpr}x.png`;
    if (selector) {
      const el = page.locator(selector).first();
      try {
        await el.waitFor({ timeout: 3000 });
        await el.screenshot({ path });
        continue;
      } catch {
        /* fall through to viewport shot */
      }
    }
    await page.screenshot({ path });
  }
  await context.close();
}

await browser.close();
server.kill();
console.log(`Wrote shots to ${outDir}`);
