// NITPICK ROUND 2 — the surfaces I under-covered: case files end-to-end,
// /evidence deeply, tablet 768/1024, 2560, print, and desktop hover.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-nitpick2";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3600";
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};
const CASES = [
  "automl",
  "fast-mnist-nn",
  "jobtracker",
  "master-inventory",
  "policybot",
  "taskflow-calendar",
  "visual-assist",
];

const browser = await chromium.launch();

// ---------- 1. every case file, front to back, at 1440 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const id of CASES) {
    const errs = [];
    page.removeAllListeners("console");
    page.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 120)));
    await page.goto(`${BASE}/projects/${id}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const hs = [...document.querySelectorAll("h1,h2,h3")].map((h) => h.tagName);
      // heading level skips
      const skips = [];
      let prev = 0;
      for (const h of hs) {
        const n = Number(h[1]);
        if (prev && n > prev + 1) skips.push(`${prev}->${n}`);
        prev = n;
      }
      const imgs = [...document.querySelectorAll("img")].map((i) => ({
        alt: i.getAttribute("alt"),
        loading: i.getAttribute("loading"),
        w: i.naturalWidth,
        h: i.naturalHeight,
        cw: Math.round(i.getBoundingClientRect().width),
        broken: i.complete && i.naturalWidth === 0,
        src: (i.currentSrc || i.src).split("/").pop(),
      }));
      const figs = [...document.querySelectorAll("figure")].map((f) => ({
        id: f.id || null,
        cap: (f.querySelector("figcaption")?.textContent ?? "").trim().slice(0, 80),
      }));
      // figure-number crosswalk: numbers cited in prose vs numbers that exist
      const body = document.body.innerText;
      const cited = [...body.matchAll(/fig\.?\s*(\d+(?:\.\d+)?)/gi)].map((m) => m[1]);
      const exist = [...body.matchAll(/^\s*fig\.?\s*(\d+(?:\.\d+)?)/gim)].map((m) => m[1]);
      return {
        title: document.title,
        h1: h1?.textContent.trim().slice(0, 90),
        headingSkips: skips,
        headingCount: hs.length,
        imgs,
        brokenImgs: imgs.filter((i) => i.broken).length,
        missingAlt: imgs.filter((i) => i.alt === null).length,
        emptyAlt: imgs.filter((i) => i.alt === "").length,
        figures: figs.length,
        figIds: figs.map((f) => f.id),
        citedFigs: [...new Set(cited)],
        existFigs: [...new Set(exist)],
        docHeight: document.body.scrollHeight,
        counter: (body.match(/¶\s*case file[^\n]*/i) ?? [])[0] ?? null,
        h1Size: h1 ? getComputedStyle(h1).fontSize : null,
      };
    });
    note(`case.${id}`, { ...r, consoleErrors: errs.slice(0, 3) });
    await page.screenshot({ path: `${OUT}/case-${id}-top.png` });
  }
  await ctx.close();
}

// ---------- 2. /evidence, deeply ----------
{
  for (const width of [390, 768, 1024, 1440, 2560]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/evidence/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const body = document.body.innerText;
      const glance = (body.match(/\d+\s+entries[^\n]*/) ?? [])[0] ?? null;
      // arithmetic honesty: does the strip add up?
      let sums = null;
      if (glance) {
        const nums = glance.match(/\d+/g)?.map(Number) ?? [];
        sums = { nums, addsUp: nums.length >= 3 ? nums[1] + nums[2] === nums[0] : null };
      }
      const rows = [...document.querySelectorAll("[data-receipt-row], li, tr")].length;
      const held = (body.match(/HELD|held/g) ?? []).length;
      const blocks = (body.match(/▓/g) ?? []).length;
      // sticky/overlap check: is any text under the header?
      const hdr = document.querySelector("header");
      const hb = hdr?.getBoundingClientRect();
      return {
        glance,
        sums,
        rowCount: rows,
        heldMentions: held,
        redactionBlocks: blocks,
        headerH: hb ? Math.round(hb.height) : null,
        headerPos: hdr ? getComputedStyle(hdr).position : null,
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        docH: document.body.scrollHeight,
      };
    });
    note(`evidence@${width}`, r);
    await page.screenshot({ path: `${OUT}/evidence-${width}-top.png` });
    // deep link a receipt and watch the wash settle
    if (width === 1440) {
      const firstId = await page.evaluate(() => {
        const el = document.querySelector("[data-receipt-row][id], [id^='r-'], [id^='receipt']");
        return el?.id ?? null;
      });
      note("evidence.firstReceiptId", firstId);
      if (firstId) {
        await page.goto(`${BASE}/evidence/#${firstId}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${OUT}/evidence-target-300ms.png` });
        const at300 = await page.evaluate((id) => {
          const el = document.getElementById(id);
          const b = el.getBoundingClientRect();
          return { top: Math.round(b.top), bg: getComputedStyle(el).backgroundColor };
        }, firstId);
        await page.waitForTimeout(2800);
        await page.screenshot({ path: `${OUT}/evidence-target-3s.png` });
        const at3s = await page.evaluate((id) => {
          const el = document.getElementById(id);
          const b = el.getBoundingClientRect();
          return { top: Math.round(b.top), bg: getComputedStyle(el).backgroundColor };
        }, firstId);
        note("evidence.targetWash", { at300, at3s });
      }
    }
    await ctx.close();
  }
}

// ---------- 3. tablet 768 & 1024 full-page, home + a case file ----------
{
  for (const width of [768, 834, 1024]) {
    const ctx = await browser.newContext({ viewport: { width, height: 1024 } });
    const page = await ctx.newPage();
    for (const [name, path] of [
      ["home", "/"],
      ["case", "/projects/master-inventory/"],
      ["ev", "/evidence/"],
    ]) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${OUT}/tab-${width}-${name}.png` });
      const r = await page.evaluate(() => {
        const gaps = [];
        // find horizontal rules / columns that collapsed oddly
        const grids = [...document.querySelectorAll("*")].filter((e) => {
          const cs = getComputedStyle(e);
          return cs.display === "grid" && e.getBoundingClientRect().width > 400;
        });
        return {
          gridCount: grids.length,
          gridCols: grids.slice(0, 8).map((g) => getComputedStyle(g).gridTemplateColumns),
          scrollW: document.documentElement.scrollWidth,
          clientW: document.documentElement.clientWidth,
          docH: document.body.scrollHeight,
        };
      });
      note(`tablet.${width}.${name}`, r);
    }
    await ctx.close();
  }
}

// ---------- 4. 2560 — the wide-paper problem ----------
{
  const ctx = await browser.newContext({ viewport: { width: 2560, height: 1400 } });
  const page = await ctx.newPage();
  for (const [name, path] of [
    ["home", "/"],
    ["case", "/projects/jobtracker/"],
    ["ev", "/evidence/"],
    ["404", "/nope/"],
  ]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${OUT}/w2560-${name}.png` });
    const r = await page.evaluate(() => {
      const main = document.querySelector("main");
      const mb = main?.getBoundingClientRect();
      const p = [...document.querySelectorAll("main p")].find(
        (x) => x.getBoundingClientRect().width > 200,
      );
      const pb = p?.getBoundingClientRect();
      const cs = p ? getComputedStyle(p) : null;
      // measure characters per line of the body voice
      const cpl = p ? Math.round(pb.width / (parseFloat(cs.fontSize) * 0.5)) : null;
      return {
        mainLeft: mb ? Math.round(mb.left) : null,
        mainWidth: mb ? Math.round(mb.width) : null,
        proseLeft: pb ? Math.round(pb.left) : null,
        proseWidth: pb ? Math.round(pb.width) : null,
        proseFont: cs?.fontSize,
        approxCPL: cpl,
        leftGutter: pb ? Math.round(pb.left) : null,
        rightGutter: pb ? Math.round(2560 - pb.right) : null,
      };
    });
    note(`w2560.${name}`, r);
  }
  await ctx.close();
}

// ---------- 5. desktop hover micro-interactions ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const targets = await page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll("a[href], button")) {
      const b = a.getBoundingClientRect();
      if (b.width > 8 && b.top > 0 && b.bottom < window.innerHeight) {
        out.push({
          text: (a.innerText ?? "").trim().slice(0, 34),
          x: Math.round(b.left + b.width / 2),
          y: Math.round(b.top + b.height / 2),
        });
      }
    }
    return out.slice(0, 14);
  });
  const hoverResults = [];
  for (const t of targets) {
    const before = await page.evaluate(
      ([x, y]) => {
        const el = document.elementFromPoint(x, y);
        const cs = getComputedStyle(el);
        return {
          color: cs.color,
          bg: cs.backgroundColor,
          deco: cs.textDecorationLine + " " + cs.textDecorationColor,
          transform: cs.transform,
          opacity: cs.opacity,
          cursor: cs.cursor,
          shadow: cs.boxShadow.slice(0, 40),
          bdb: cs.borderBottomWidth + " " + cs.borderBottomColor,
        };
      },
      [t.x, t.y],
    );
    await page.mouse.move(t.x, t.y);
    await page.waitForTimeout(420);
    const after = await page.evaluate(
      ([x, y]) => {
        const el = document.elementFromPoint(x, y);
        const cs = getComputedStyle(el);
        return {
          color: cs.color,
          bg: cs.backgroundColor,
          deco: cs.textDecorationLine + " " + cs.textDecorationColor,
          transform: cs.transform,
          opacity: cs.opacity,
          cursor: cs.cursor,
          shadow: cs.boxShadow.slice(0, 40),
          bdb: cs.borderBottomWidth + " " + cs.borderBottomColor,
        };
      },
      [t.x, t.y],
    );
    const changed = Object.keys(before).filter((k) => before[k] !== after[k]);
    hoverResults.push({ text: t.text, changed, cursor: after.cursor, before, after });
    await page.mouse.move(2, 2);
    await page.waitForTimeout(120);
  }
  note(
    "hover.home",
    hoverResults.map((h) => ({ text: h.text, changed: h.changed, cursor: h.cursor })),
  );
  note("hover.detail", hoverResults.filter((h) => h.changed.length === 0));
  await ctx.close();
}

// ---------- 6. print ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  for (const [name, path] of [
    ["home", "/"],
    ["case", "/projects/jobtracker/"],
    ["evidence", "/evidence/"],
    ["404", "/nope/"],
  ]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(1400);
    await page.emulateMedia({ media: "print" });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/print-${name}-screen.png`, fullPage: false });
    const r = await page.evaluate(() => {
      const vis = (s) => {
        const e = document.querySelector(s);
        if (!e) return null;
        const cs = getComputedStyle(e);
        return cs.display !== "none" && cs.visibility !== "hidden";
      };
      const nav = document.querySelector("header nav");
      return {
        header: vis("header"),
        headerNav: nav ? getComputedStyle(nav).display !== "none" : null,
        footer: vis("footer"),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        colophon: /colophon|set in|typeset/i.test(document.body.innerText),
        motionToggleVisible: [...document.querySelectorAll("button")].some(
          (b) => /motion:/.test(b.innerText) && getComputedStyle(b).display !== "none",
        ),
      };
    });
    note(`print.${name}`, r);
    await page.pdf({
      path: `${OUT}/print-${name}.pdf`,
      format: "Letter",
      printBackground: false,
    });
    await page.emulateMedia({ media: "screen" });
  }
  await ctx.close();
}

writeFileSync(`${OUT}/deep-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
console.log("done");
