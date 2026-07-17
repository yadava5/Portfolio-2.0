/**
 * Screenshot harness for design-lab candidates.
 * Usage: node docs/design-lab/shoot-candidates.mjs
 * Writes docs/design-lab/shots/<candidate>-{hero,mid,end,mobile}.png
 */
import { chromium } from "@playwright/test";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("docs/design-lab");
const outDir = path.join(root, "shots");
await mkdir(outDir, { recursive: true });

const candidates = (await readdir(path.join(root, "candidates"))).filter((f) =>
  f.endsWith(".html")
);

const browser = await chromium.launch();
for (const file of candidates) {
  const slug = file.replace(".html", "");
  const url = "file://" + path.join(root, "candidates", file);

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(url);
  await page.waitForTimeout(2500); /* fonts + entrance */

  await page.screenshot({ path: path.join(outDir, `${slug}-hero.png`) });

  const total = await page.evaluate(() => document.body.scrollHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * 0.45));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, `${slug}-mid.png`) });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, `${slug}-end.png`) });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, `${slug}-mobile.png`) });

  await page.close();
  console.log(`shot ${slug}`);
}
await browser.close();
console.log("done");
