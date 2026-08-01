// NITPICK — walk the whole story slowly at every width. Frames + per-section metrics.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-nitpick";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.NITPICK_BASE ?? "https://yadava5.github.io/Portfolio-2.0";
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};

const browser = await chromium.launch();

async function walk(label, viewport, opts = {}) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: opts.dsf ?? 2,
    reducedMotion: opts.reduced ? "reduce" : "no-preference",
    isMobile: !!opts.isMobile,
    hasTouch: !!opts.isMobile,
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  note(`${label}.height`, `${h}px = ${(h / viewport.height).toFixed(2)} viewports`);

  // section map + how many viewports each chapter costs
  const secs = await page.evaluate(() =>
    [...document.querySelectorAll("main section[id]")].map((s) => {
      const r = s.getBoundingClientRect();
      return { id: s.id, top: Math.round(r.top + window.scrollY), h: Math.round(r.height) };
    })
  );
  note(
    `${label}.chapters`,
    secs.map((s) => `${s.id}: ${s.h}px = ${(s.h / viewport.height).toFixed(2)}vp`)
  );

  const frames = opts.frames ?? 30;
  for (let i = 0; i < frames; i++) {
    const y = Math.round(((h - viewport.height) * i) / (frames - 1));
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await page.waitForTimeout(opts.settle ?? 850);
    await page.screenshot({ path: `${OUT}/${label}-${String(i).padStart(2, "0")}-y${y}.png` });
  }

  // horizontal overflow check at rest
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    const bad = [];
    if (de.scrollWidth > de.clientWidth + 1) {
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.right > de.clientWidth + 1 || r.left < -1) {
          if (getComputedStyle(el).position === "fixed") continue;
          bad.push({
            tag: el.tagName,
            cls: (el.className.baseVal ?? el.className ?? "").toString().slice(0, 70),
            left: Math.round(r.left),
            right: Math.round(r.right),
          });
        }
      }
    }
    return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, offenders: bad.slice(0, 8) };
  });
  note(`${label}.hOverflow`, overflow);

  if (errs.length) note(`${label}.consoleErrors`, errs.slice(0, 10));
  await ctx.close();
}

const which = process.argv[2] ?? "all";
try {
  if (which === "all" || which === "desk")
    await walk("w1440", { width: 1440, height: 900 }, { frames: 34 });
  if (which === "all" || which === "mob")
    await walk("w390", { width: 390, height: 844 }, { frames: 34, isMobile: true, dsf: 3 });
  if (which === "all" || which === "tab")
    await walk("w768", { width: 768, height: 1024 }, { frames: 26 });
  if (which === "all" || which === "wide")
    await walk("w2560", { width: 2560, height: 1440 }, { frames: 22, dsf: 1 });
} finally {
  await browser.close();
  writeFileSync(`${OUT}/walk-${which}-notes.json`, JSON.stringify(notes, null, 2));
}
