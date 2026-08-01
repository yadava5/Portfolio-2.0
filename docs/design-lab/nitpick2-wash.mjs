// NITPICK ROUND 2 — S4's :target wash, judged as a reader sees it.
// Round 3 claimed a deep-linked receipt "lifts": the paper under it goes
// one stop lighter with a 2px clay rule, fading over 2s to a residue at
// opacity 0.45. Shoot the row cold and deep-linked, and diff the pixels.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const OUT = "docs/design-lab/shots-nitpick2";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3600";
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 12);

const browser = await chromium.launch();

for (const [name, path, idQuery] of [
  ["evidence", "/evidence/", "[data-receipt-row][id]"],
  ["case", "/projects/jobtracker/", "[data-receipt-row][id], [id^='v-jobtracker']"],
]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  const info = await page.evaluate((q) => {
    const el = document.querySelector(q);
    if (!el) return null;
    return { id: el.id, tag: el.tagName, cls: String(el.className ?? "").slice(0, 90) };
  }, idQuery);
  note(`${name}.row`, info);
  if (!info) {
    await ctx.close();
    continue;
  }

  // cold: scroll it into the same place a deep link would put it
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo(0, y);
  }, info.id);
  await page.waitForTimeout(1400);
  const cold = await page.evaluate((id) => {
    const el = document.getElementById(id);
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) };
  }, info.id);
  const clip = {
    x: Math.max(0, cold.x - 40),
    y: Math.max(0, cold.y - 20),
    width: Math.min(1440, cold.w + 90),
    height: Math.min(900 - Math.max(0, cold.y - 20), cold.h + 50),
  };
  await page.screenshot({ path: `${OUT}/wash-${name}-cold.png`, clip });

  // deep-linked
  await page.goto(`${BASE}${path}#${info.id}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  const snap = async (label) => {
    const box = await page.evaluate((id) => {
      const el = document.getElementById(id);
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const before = getComputedStyle(el, "::before");
      const after = getComputedStyle(el, "::after");
      return {
        top: Math.round(b.top),
        bg: cs.backgroundColor,
        opacity: cs.opacity,
        boxShadow: cs.boxShadow.slice(0, 70),
        borderLeft: cs.borderLeftWidth + " " + cs.borderLeftColor,
        beforeContent: before.content,
        beforeBg: before.backgroundColor,
        beforeOpacity: before.opacity,
        beforeW: before.width,
        afterContent: after.content,
        afterBg: after.backgroundColor,
        afterOpacity: after.opacity,
      };
    }, info.id);
    await page.screenshot({ path: `${OUT}/wash-${name}-${label}.png`, clip });
    return box;
  };
  const t250 = await snap("t0250");
  await page.waitForTimeout(650);
  const t900 = await snap("t0900");
  await page.waitForTimeout(2400);
  const t3300 = await snap("t3300");
  note(`${name}.wash`, { t250, t900, t3300 });
  note(`${name}.washSha`, {
    cold: sha(`${OUT}/wash-${name}-cold.png`),
    t250: sha(`${OUT}/wash-${name}-t0250.png`),
    t900: sha(`${OUT}/wash-${name}-t0900.png`),
    t3300: sha(`${OUT}/wash-${name}-t3300.png`),
  });
  await ctx.close();
}

// how far does the residue actually differ from the cold paper?
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/evidence/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const css = await page.evaluate(() => {
    const rules = [];
    for (const sheet of document.styleSheets) {
      let list;
      try {
        list = sheet.cssRules;
      } catch {
        continue;
      }
      const walk = (rl) => {
        for (const r of rl) {
          if (r.cssRules) walk(r.cssRules);
          else if (r.selectorText && /:target|receipt-row/.test(r.selectorText))
            rules.push(r.cssText.slice(0, 320));
        }
      };
      walk(list);
    }
    return rules;
  });
  note("targetCSS", css);
  await ctx.close();
}

writeFileSync(`${OUT}/wash-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
console.log("done");
