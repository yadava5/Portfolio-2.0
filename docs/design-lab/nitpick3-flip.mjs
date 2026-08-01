// NITPICK ROUND 3 — the flip conditions, re-measured by the viewer that
// set them. Nothing here trusts WAVE4-STATUS; every number is taken off
// the built export again.
//
//   --404       overflow + leaders + the evidence row, 320..430
//   --dateline  the running head 320..900, folio side, line count
//   --masthead  767/768 at 1px, item census, slack
//   --targets   the 44px census + the overlap census, 390 and 1440
//   --stamp     the register marks: resting vs focused, measured + shot
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-nitpick3";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3601";
const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const want = (n) => flags.length === 0 || flags.includes(`--${n}`);
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`\n[${k}]`);
  console.log(typeof v === "string" ? v : JSON.stringify(v, null, 1));
};

const browser = await chromium.launch();
const settle = async (p, ms = 900) => p.waitForTimeout(ms);

// ---------------------------------------------------------------- 404
if (want("404")) {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 800 } });
  const page = await ctx.newPage();
  const rows = [];
  for (const w of [320, 340, 360, 375, 390, 414, 430, 480, 640]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto(BASE + "/no-such-page/", { waitUntil: "networkidle" });
    await settle(page, 700);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const over = de.scrollWidth - window.innerWidth;
      // find every element whose right edge passes the viewport
      const bleed = [];
      for (const el of document.querySelectorAll("*")) {
        const b = el.getBoundingClientRect();
        if (b.width && b.right > window.innerWidth + 0.5) {
          bleed.push({
            t: (el.textContent ?? "").trim().slice(0, 40),
            tag: el.tagName.toLowerCase() + "." + [...el.classList].slice(0, 2).join("."),
            right: Math.round(b.right),
          });
        }
      }
      // the index rows
      const idx = [];
      for (const a of document.querySelectorAll("a[href]")) {
        const b = a.getBoundingClientRect();
        if (!b.width) continue;
        const row = a.closest("li,div");
        // leader = any child whose border-bottom is dotted, or flex-1 spacer
        let leader = null;
        if (row) {
          for (const c of row.querySelectorAll("*")) {
            const cs = getComputedStyle(c);
            if (/dotted/.test(cs.borderBottomStyle) || /dotted/.test(cs.backgroundImage)) {
              leader = Math.round(c.getBoundingClientRect().width);
            }
          }
        }
        idx.push({
          text: (a.textContent ?? "").trim().slice(0, 34),
          w: Math.round(b.width),
          h: Math.round(b.height),
          rowRight: row ? Math.round(row.getBoundingClientRect().right) : null,
          rowH: row ? Math.round(row.getBoundingClientRect().height) : null,
          leader,
        });
      }
      return { over, bleed: bleed.slice(0, 6), idx, bodyText: document.body.innerText };
    });
    rows.push({ w, over: r.over, bleed: r.bleed, idx: r.idx });
    if ([320, 375, 390, 414].includes(w)) {
      await page.screenshot({ path: `${OUT}/n3-404-${w}.png`, fullPage: true });
    }
    if (w === 320) note("404.bodyText@320", r.bodyText);
  }
  note("404.sweep", rows);
  await ctx.close();
}

// ----------------------------------------------------------- dateline
if (want("dateline")) {
  const ctx = await browser.newContext({ viewport: { width: 640, height: 900 } });
  const page = await ctx.newPage();
  const out = [];
  for (let w = 320; w <= 900; w += 20) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await settle(page, 600);
    const r = await page.evaluate(() => {
      const k = document.querySelector("[data-thread-kicker]");
      if (!k) return null;
      const row = k.parentElement;
      const kb = k.getBoundingClientRect();
      const rb = row.getBoundingClientRect();
      const kids = [...row.children].map((c) => {
        const b = c.getBoundingClientRect();
        return {
          t: (c.textContent ?? "").trim().slice(0, 30),
          l: Math.round(b.left),
          r: Math.round(b.right),
          top: Math.round(b.top),
          h: Math.round(b.height),
        };
      });
      const lh = parseFloat(getComputedStyle(k).lineHeight) || 20;
      return {
        rowLeft: Math.round(rb.left),
        rowRight: Math.round(rb.right),
        rowH: Math.round(rb.height),
        kickerLines: Math.round(kb.height / lh),
        kickerText: (k.textContent ?? "").trim(),
        kids,
      };
    });
    if (!r) continue;
    const folio = r.kids.find((c) => /summer/.test(c.t));
    const kicker = r.kids.find((c) => /¶/.test(c.t));
    out.push({
      w,
      rowH: r.rowH,
      lines: r.kickerLines,
      folio: folio
        ? folio.top > (kicker?.top ?? 0) + 4
          ? Math.abs(folio.r - r.rowRight) <= 2
            ? "OWN LINE, RIGHT"
            : `OWN LINE, LEFT (r=${folio.r} vs ${r.rowRight})`
          : "shares line"
        : "hidden",
      folioR: folio?.r ?? null,
      rowR: r.rowRight,
    });
    if ([640, 700, 768, 800].includes(w)) {
      const k = page.locator("[data-thread-kicker]").first();
      const box = await k.evaluate((e) => {
        const b = e.parentElement.getBoundingClientRect();
        return { x: b.left - 12, y: b.top + window.scrollY - 12, width: b.width + 24, height: b.height + 24 };
      });
      await page.screenshot({ path: `${OUT}/n3-runhead-${w}.png`, clip: box });
    }
  }
  note("dateline.sweep", out);
  await ctx.close();
}

// ----------------------------------------------------------- masthead
if (want("masthead")) {
  const ctx = await browser.newContext({ viewport: { width: 768, height: 900 } });
  const page = await ctx.newPage();
  const out = [];
  for (const w of [600, 640, 700, 740, 760, 766, 767, 768, 769, 800, 840, 879, 880, 900, 1024]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await settle(page, 600);
    const r = await page.evaluate(() => {
      const h = document.querySelector("header, .site-header");
      const ul = h?.querySelector("ul");
      const items = ul
        ? [...ul.querySelectorAll("li")]
            .filter((li) => li.getBoundingClientRect().width > 0)
            .map((li) => ({
              t: (li.textContent ?? "").trim().slice(0, 20),
              w: Math.round(li.getBoundingClientRect().width),
              h: Math.round(li.getBoundingClientRect().height),
            }))
        : [];
      // everything visible in the header, in order, with gaps
      const vis = [...(h?.querySelectorAll("a,button") ?? [])]
        .filter((e) => e.getBoundingClientRect().width > 0)
        .map((e) => {
          const b = e.getBoundingClientRect();
          return { t: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 22), l: Math.round(b.left), r: Math.round(b.right), h: Math.round(b.height) };
        });
      return {
        headerH: Math.round(h?.getBoundingClientRect().height ?? 0),
        ulH: Math.round(ul?.getBoundingClientRect().height ?? 0),
        ulW: Math.round(ul?.getBoundingClientRect().width ?? 0),
        items,
        vis,
      };
    });
    // widest gap between adjacent visible header controls
    let maxGap = 0, gapAt = null;
    for (let i = 1; i < r.vis.length; i++) {
      const g = r.vis[i].l - r.vis[i - 1].r;
      if (g > maxGap) { maxGap = g; gapAt = `${r.vis[i - 1].t} | ${r.vis[i].t}`; }
    }
    out.push({ w, headerH: r.headerH, ulH: r.ulH, n: r.items.length, items: r.items.map((i) => i.t), maxGap, gapAt });
    if ([767, 768, 640, 880].includes(w)) {
      await page.screenshot({ path: `${OUT}/n3-masthead-${w}.png`, clip: { x: 0, y: 0, width: w, height: 90 } });
    }
  }
  note("masthead.sweep", out);
  await ctx.close();
}

// ------------------------------------------------------------ targets
if (want("targets")) {
  const ROUTES = [
    "/",
    "/evidence/",
    "/projects/automl/",
    "/projects/fast-mnist-nn/",
    "/projects/jobtracker/",
    "/projects/master-inventory/",
    "/projects/policybot/",
    "/projects/taskflow-calendar/",
    "/projects/visual-assist/",
    "/no-such-page/",
  ];
  for (const vw of [390, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: 844 } });
    const page = await ctx.newPage();
    const rep = [];
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await settle(page, 1400);
      await page.evaluate(() => window.scrollTo(0, 0));
      await settle(page, 700);
      const r = await page.evaluate(() => {
        const els = [...document.querySelectorAll("a[href],button,[role=button]")].filter(
          (e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0
        );
        const boxes = els.map((e) => {
          const b = e.getBoundingClientRect();
          return {
            t: (e.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40),
            x: b.left, y: b.top + window.scrollY, w: b.width, h: b.height,
          };
        });
        const small = boxes.filter((b) => b.h < 24).map((b) => ({ t: b.t, h: Math.round(b.h) }));
        // overlap census
        const overlaps = [];
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], c = boxes[j];
            const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
            const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
            if (ox > 0.5 && oy > 0.5)
              overlaps.push({ a: a.t, b: c.t, ox: Math.round(ox), oy: Math.round(oy) });
          }
        return { n: boxes.length, small, nSmall: small.length, overlaps };
      });
      rep.push({ route, n: r.n, nSmall: r.nSmall, small: r.small, nOverlap: r.overlaps.length, overlaps: r.overlaps.slice(0, 12) });
    }
    note(`targets@${vw}`, rep);
    await ctx.close();
  }
}

// -------------------------------------------------------------- stamp
if (want("stamp")) {
  for (const vw of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await settle(page, 2600);
    const info = await page.evaluate(() => {
      const el =
        document.querySelector("[data-approval-stamp]") ||
        [...document.querySelectorAll("button,a")].find((e) => /approv/i.test(e.textContent ?? ""));
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        text: (el.textContent ?? "").trim().slice(0, 40),
        box: { x: Math.round(b.left), y: Math.round(b.top + window.scrollY), w: Math.round(b.width), h: Math.round(b.height) },
      };
    });
    note(`stamp.found@${vw}`, info);
    if (!info) { await ctx.close(); continue; }
    const clip = (pad) => ({
      x: Math.max(0, info.box.x - pad),
      y: Math.max(0, info.box.y - pad),
      width: Math.min(vw, info.box.w + pad * 2),
      height: info.box.h + pad * 2,
    });
    await page.screenshot({ path: `${OUT}/n3-stamp-${vw}-rest.png`, clip: clip(40) });
    // focus it with the keyboard, the way it is actually reached
    const st = await page.evaluate(() => {
      const el =
        document.querySelector("[data-approval-stamp]") ||
        [...document.querySelectorAll("button,a")].find((e) => /approv/i.test(e.textContent ?? ""));
      el.focus();
      const cs = getComputedStyle(el);
      const marks = [...el.querySelectorAll(".stamp-register, [class*=register]")].map((m) => {
        const ms = getComputedStyle(m);
        return { cls: m.getAttribute("class"), opacity: ms.opacity, stroke: ms.stroke, fill: ms.fill, box: m.getBoundingClientRect().width };
      });
      return {
        outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
        offset: cs.outlineOffset,
        rotate: cs.rotate,
        marks,
        activeIsStamp: document.activeElement === el,
      };
    });
    note(`stamp.focused@${vw}`, st);
    await settle(page, 500);
    await page.screenshot({ path: `${OUT}/n3-stamp-${vw}-focus.png`, clip: clip(40) });
    // and via real Tab, to confirm :focus-visible actually fires
    await page.evaluate(() => document.activeElement.blur());
    await settle(page, 300);
    const tabbed = await page.evaluate(() => {
      const el =
        document.querySelector("[data-approval-stamp]") ||
        [...document.querySelectorAll("button,a")].find((e) => /approv/i.test(e.textContent ?? ""));
      return el.matches(":focus-visible");
    });
    note(`stamp.focusVisibleAfterBlur@${vw}`, tabbed);
    await ctx.close();
  }
}

writeFileSync(`${OUT}/flip-notes.json`, JSON.stringify(notes, null, 1));
await browser.close();
console.log("\n--- done ---");
