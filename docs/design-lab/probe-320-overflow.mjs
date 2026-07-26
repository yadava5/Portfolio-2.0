// Fix round 3 — what exactly overflows at 320, and does it belong to
// anything this round touched?
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3200";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 320, height: 844 } });
const page = await ctx.newPage();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);

const report = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > window.innerWidth + 0.5) {
      const chain = [];
      let node = el;
      while (node && node !== document.body && chain.length < 6) {
        chain.push(
          `${node.tagName}${node.id ? "#" + node.id : ""}.${String(node.className.baseVal ?? node.className ?? "").split(" ")[0].slice(0, 22)}`
        );
        node = node.parentElement;
      }
      out.push({
        chain: chain.join(" < "),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        over: Math.round(r.right - window.innerWidth),
      });
    }
  }
  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    offenders: out.slice(0, 12),
  };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
