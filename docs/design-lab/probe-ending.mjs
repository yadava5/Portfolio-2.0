/**
 * The whole ending, checked at several window sizes.
 *
 * Two claims have to hold at once and they pull against each other:
 *
 *   BEFORE approval — ¶13 does not exist. The document ends at the gate, so
 *   scrolling to the very bottom lands on the gate's own top and "¶ 12 · the
 *   approval gate — 22:41" is fully in view. Adding a station after the gate
 *   is exactly what broke this: the document grew past it.
 *
 *   AFTER approval — ¶13 exists, the reader is carried into it, the light has
 *   come up, and the morning's words are on screen.
 *
 * One viewport is not enough to see either failure; a previous pass reported
 * "no shift" from a single 1600x900 run while the kicker was being cut at 800.
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:8140/";
const browser = await chromium.launch();
const rows = [];
let bad = 0;

for (const [w, h] of [[1440, 800], [1512, 900], [1600, 1000], [1920, 1080], [2000, 1123]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(700);

  /* travel to the very bottom the way a reader does */
  const docH0 = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= docH0; y += 440) { await page.mouse.wheel(0, 440); await page.waitForTimeout(22); }
  await page.waitForTimeout(700);

  const before = await page.evaluate(() => {
    const k = document.querySelector("#gate .kicker").getBoundingClientRect();
    const g = document.getElementById("gate").getBoundingClientRect();
    const n = document.getElementById("nextmorning").getBoundingClientRect();
    return {
      docH: document.body.scrollHeight, maxScroll: document.body.scrollHeight - innerHeight,
      y: Math.round(scrollY),
      kickTop: Math.round(k.top), kickVisible: k.top >= 0 && k.bottom <= innerHeight,
      gateTop: Math.round(g.top + scrollY), gateH: Math.round(g.height),
      dawnH: Math.round(n.height), night: document.documentElement.hasAttribute("data-night"),
      clock: document.getElementById("mclock").textContent,
    };
  });

  await page.click("#approve");
  await page.waitForTimeout(9500);

  const after = await page.evaluate(() => {
    const n = document.getElementById("nextmorning").getBoundingClientRect();
    const q = document.querySelector(".bdawn .endquote").getBoundingClientRect();
    const cs = getComputedStyle(document.querySelector(".bdawn .endquote"));
    return {
      docH: document.body.scrollHeight, y: Math.round(scrollY),
      dawnH: Math.round(n.height),
      night: document.documentElement.hasAttribute("data-night"),
      clock: document.getElementById("mclock").textContent,
      phase: document.getElementById("mphase").textContent,
      quoteOnScreen: q.top >= 0 && q.bottom <= innerHeight && +cs.opacity > 0.9,
      field: getComputedStyle(document.getElementById("field")).backgroundColor,
    };
  });

  const ok = before.kickVisible && before.dawnH === 0 && before.night
    && !after.night && after.dawnH > 0 && after.quoteOnScreen
    && after.clock === "06:12" && errs.length === 0;
  if (!ok) bad++;
  rows.push({
    viewport: `${w}x${h}`,
    "¶13 before": before.dawnH, "kicker before": before.kickVisible ? "✓" : `✗ ${before.kickTop}`,
    "night before": before.night ? "✓" : "✗",
    "¶13 after": after.dawnH, "day after": !after.night ? "✓" : "✗",
    clock: after.clock, "quote on screen": after.quoteOnScreen ? "✓" : "✗",
    errs: errs.length, ok: ok ? "✓" : "✗",
  });
  if (errs.length) console.log(`  ${w}x${h} page errors:`, errs.slice(0, 2));
  await page.close();
}
console.table(rows);
console.log(bad ? `\n✗ ${bad} viewport(s) failed` : "\n✓ every viewport: the gate is last before approval, the morning arrives after");
await browser.close();
