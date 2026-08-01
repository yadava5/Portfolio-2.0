import { chromium } from "playwright";
const OUT = "docs/design-lab/shots-w4";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto("http://localhost:3000/projects/automl/", { waitUntil: "load" });
await page.waitForTimeout(1500);
const row = page.locator("[data-receipt-row][data-cites]").first();
await row.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
const cites = await row.getAttribute("data-cites");
console.log("row cites fig.", cites);
await row.hover();
await page.waitForTimeout(1200);
const box = await row.boundingBox();
await page.screenshot({
  path: `${OUT}/v-i-citation-rowclip.png`,
  clip: { x: 0, y: Math.max(0, box.y - 160), width: 1440, height: Math.min(900, box.height + 320) },
});
// what did CitationInk draw? inspect svg presence
const inkInfo = await page.evaluate(() => {
  const svgs = [...document.querySelectorAll("svg")].filter((s) => {
    const r = s.getBoundingClientRect();
    return r.width > 40 && r.height > 40;
  });
  return svgs.slice(0, 6).map((s) => ({
    cls: s.getAttribute("class") || s.parentElement?.getAttribute("data-citation-ink") || s.parentElement?.className?.toString().slice(0, 60),
    paths: s.querySelectorAll("path").length,
    rect: (() => { const r = s.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; })(),
  }));
});
console.log(JSON.stringify(inkInfo));
await browser.close();
