// NITPICK 3 — the read. Frames down the home page and the two other
// surfaces at desktop and phone, plus the day-arc ground sampled at the
// same y's so a "nothing happens here" complaint can be checked against
// the picture rather than against a table.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-nitpick3";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3601";
const notes = [];
const note = (k, v) => { notes.push({ k, v }); console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`); };

const TARGETS = (process.env.ONLY ?? "home1440,home390,ev1440,case1440,case390").split(",");
const browser = await chromium.launch();

async function walk(tag, route, vw, vh, step) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const h = await page.evaluate(() => document.body.scrollHeight);
  const frames = Math.min(24, Math.ceil(h / step));
  const arc = [];
  for (let i = 0; i < frames; i++) {
    const y = Math.min(i * step, h - vh);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(650);
    const ground = await page.evaluate(() => {
      const f = document.querySelector("[data-light-field]") ?? document.body;
      const cs = getComputedStyle(f);
      return {
        bg: cs.backgroundColor,
        img: (cs.backgroundImage || "").slice(0, 60),
        phase: document.documentElement.getAttribute("data-arc-phase"),
        chapter: (document.querySelector("[data-chapter]:not([hidden])") ?? {}).dataset?.chapter ?? null,
      };
    });
    arc.push({ y, ...ground });
    await page.screenshot({ path: `${OUT}/walk-${tag}-${String(i).padStart(2, "0")}-y${y}.png` });
  }
  note(`walk.${tag}`, { h, frames, arc });
  await ctx.close();
}

if (TARGETS.includes("home1440")) await walk("home1440", "/", 1440, 900, 800);
if (TARGETS.includes("home390")) await walk("home390", "/", 390, 844, 780);
if (TARGETS.includes("ev1440")) await walk("ev1440", "/evidence/", 1440, 900, 820);
if (TARGETS.includes("case1440")) await walk("case1440", "/projects/automl/", 1440, 900, 850);
if (TARGETS.includes("case390")) await walk("case390", "/projects/automl/", 390, 844, 800);

writeFileSync(`${OUT}/walk-notes.json`, JSON.stringify(notes, null, 1));
await browser.close();
console.log("--- done ---");
