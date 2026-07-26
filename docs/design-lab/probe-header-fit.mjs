// Fix round 3, B2 — where does the full masthead row actually fit?
// Measures the row's baseline count at 1px-ish resolution across the band.
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3200";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const widths = process.argv[2]
  ? process.argv[2].split(",").map(Number)
  : [
      760, 780, 800, 820, 840, 860, 880, 900, 920, 940, 960, 980, 1000, 1024,
    ];

for (const width of widths) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => {
    const nav = document.querySelector("header nav");
    const kids = Array.from(nav.children);
    const tops = new Set(
      kids.map((el) => Math.round(el.getBoundingClientRect().top))
    );
    const style = getComputedStyle(nav);
    const contentWidth =
      nav.getBoundingClientRect().width -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    const needed =
      kids.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0) +
      parseFloat(style.columnGap || style.gap || "0") * (kids.length - 1);
    return {
      baselines: tops.size,
      navHeight: Math.round(nav.getBoundingClientRect().height),
      contentWidth: Math.round(contentWidth),
      needed: Math.round(needed),
      slack: Math.round(contentWidth - needed),
      items: Array.from(nav.querySelectorAll("ul > li"))
        .filter((li) => li.getBoundingClientRect().width > 0)
        .map((li) => li.textContent.trim()),
    };
  });
  console.log(
    `${width}: baselines=${m.baselines} navH=${m.navHeight} content=${m.contentWidth} needed=${m.needed} slack=${m.slack} items=${m.items.length}`
  );
}

await browser.close();
