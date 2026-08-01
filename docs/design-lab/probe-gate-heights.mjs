/**
 * The gate at many viewport heights, before and after approval.
 *
 * A single 1600x900 probe reported "nothing shifts" while he was watching the
 * kicker get cut — because whether the gate fits is a function of the window,
 * and the failure only appears once the expanded content exceeds it. This
 * sweeps heights and reports, for each, whether "¶ 12 · the approval gate"
 * survives a scroll to the very bottom after the lamp is lit.
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:8140/";
const browser = await chromium.launch();
const rows = [];

for (const [w, h] of [[1440, 700], [1440, 800], [1512, 900], [1600, 1000], [1920, 1080], [2000, 1123]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const docH = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= docH; y += 420) { await page.mouse.wheel(0, 420); await page.waitForTimeout(25); }
  await page.waitForTimeout(600);

  const read = () => page.evaluate(() => {
    const k = document.querySelector("#gate .kicker").getBoundingClientRect();
    const f = document.querySelector(".b8 footer").getBoundingClientRect();
    return { kickTop: Math.round(k.top), kickVisible: k.top >= 0,
             footBottom: Math.round(f.bottom), footVisible: f.bottom <= innerHeight,
             maxScroll: document.body.scrollHeight - innerHeight, y: Math.round(scrollY) };
  });
  const before = await read();
  await page.click("#approve");
  await page.waitForTimeout(3600);
  /* the real complaint: scroll to the bottom AGAIN after it has expanded */
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(500);
  const after = await read();

  rows.push({ viewport: `${w}x${h}`,
    beforeKick: before.kickTop, afterKick: after.kickTop,
    kickCutAfter: !after.kickVisible, footCutAfter: !after.footVisible,
    scrollGrew: after.maxScroll - before.maxScroll });
  await page.close();
}
console.table(rows);
const bad = rows.filter((r) => r.kickCutAfter || r.footCutAfter);
console.log(bad.length ? `\n✗ ${bad.length} viewport(s) cut the gate after approval` : "\n✓ every viewport keeps the whole gate after approval");
await browser.close();
