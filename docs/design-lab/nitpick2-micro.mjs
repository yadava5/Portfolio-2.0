// NITPICK ROUND 2 — the small things a reader feels but a test does not:
// the skip link's layout cost, the dateline's wrap, focus-ring contrast,
// colour-scheme declaration, and the two right-arrows in one caption.
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

const browser = await chromium.launch();

// ---------- 1. the skip link's layout cost ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  const read = () =>
    page.evaluate(() => {
      const mark = document.querySelector("header a[href='/'], header a[href='./']");
      const nav = document.querySelector("header nav");
      const skip = document.querySelector("a[href='#main-content']");
      const sb = skip?.getBoundingClientRect();
      const cs = skip ? getComputedStyle(skip) : null;
      return {
        wordmarkLeft: mark ? Math.round(mark.getBoundingClientRect().left) : null,
        navLeft: nav ? Math.round(nav.getBoundingClientRect().left) : null,
        skipBox: sb ? [Math.round(sb.left), Math.round(sb.top), Math.round(sb.width)] : null,
        skipPosition: cs?.position,
        skipClip: cs?.clipPath,
        skipW: cs?.width,
        skipBg: cs?.backgroundColor,
        skipColor: cs?.color,
      };
    });
  const before = await read();
  await page.keyboard.press("Tab");
  await page.waitForTimeout(400);
  const focused = await read();
  await page.keyboard.press("Tab");
  await page.waitForTimeout(400);
  const after = await read();
  note("skipLink.shift", { before, focused, after });
  await ctx.close();
}

// ---------- 2. where the dateline wraps ----------
{
  for (const width of [640, 700, 760, 800, 820, 840, 860, 880, 900, 1024]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const r = await page.evaluate(() => {
      const all = [...document.querySelectorAll("p,div,span")];
      const dl = all.find((e) => /summer 2026/.test(e.textContent) && e.textContent.length < 160);
      if (!dl) return null;
      const b = dl.getBoundingClientRect();
      const tops = new Set();
      const walk = (el) => {
        for (const n of el.childNodes) {
          if (n.nodeType === 3 && n.textContent.trim()) {
            const rr = document.createRange();
            rr.selectNodeContents(n);
            for (const rect of rr.getClientRects()) tops.add(Math.round(rect.top));
          } else if (n.nodeType === 1) walk(n);
        }
      };
      walk(dl);
      const season = all.find((e) => e.textContent.trim() === "summer 2026");
      const sb = season?.getBoundingClientRect();
      return {
        lines: [...tops].sort((a, b) => a - b),
        lineCount: tops.size,
        h: Math.round(b.height),
        seasonLeft: sb ? Math.round(sb.left) : null,
        seasonTop: sb ? Math.round(sb.top) : null,
      };
    });
    note(`dateline@${width}`, r);
    await ctx.close();
  }
}

// ---------- 3. focus-ring contrast + colour-scheme ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="color-scheme"]')?.content ?? null;
    const rootCS = getComputedStyle(document.documentElement).colorScheme;
    const bodyCS = getComputedStyle(document.body).colorScheme;
    // gather every distinct focus-visible outline the site paints
    const seen = {};
    for (const el of document.querySelectorAll("a[href],button,[tabindex]")) {
      if (!el.getBoundingClientRect().width) continue;
      el.focus();
      const cs = getComputedStyle(el);
      const key = `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor} off:${cs.outlineOffset}`;
      seen[key] = (seen[key] ?? 0) + 1;
    }
    return { metaColorScheme: meta, rootColorScheme: rootCS, bodyColorScheme: bodyCS, focusRings: seen };
  });
  note("focusAndScheme", r);
  await ctx.close();
}

// ---------- 4. the two right-arrows in one caption ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const out = [];
    const walk = (el) => {
      for (const n of el.childNodes) {
        if (n.nodeType === 3 && /[→⟶]/.test(n.textContent)) {
          const p = n.parentElement;
          const cs = getComputedStyle(p);
          out.push({
            text: n.textContent.trim().slice(0, 110),
            glyphs: [...new Set(n.textContent.match(/[→⟶⟵←↗↩]/g) ?? [])],
            tag: p.tagName,
            font: cs.fontFamily.split(",")[0],
            size: cs.fontSize,
            top: Math.round(p.getBoundingClientRect().top + window.scrollY),
          });
        } else if (n.nodeType === 1) walk(n);
      }
    };
    walk(document.body);
    return out;
  });
  note("arrowGlyphs.home", r);
  await ctx.close();
}

// ---------- 5. the same, on a case file, plus the "→" role ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const id of ["jobtracker", "policybot", "taskflow-calendar"]) {
    await page.goto(`${BASE}/projects/${id}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const out = [];
      const walk = (el) => {
        for (const n of el.childNodes) {
          if (n.nodeType === 3 && /→/.test(n.textContent)) {
            out.push({
              text: n.textContent.trim().slice(0, 120),
              tag: n.parentElement.tagName,
              size: getComputedStyle(n.parentElement).fontSize,
            });
          } else if (n.nodeType === 1) walk(n);
        }
      };
      walk(document.body);
      return out;
    });
    note(`plainArrow.${id}`, r);
  }
  await ctx.close();
}

// ---------- 6. tap-target audit at 390 across all routes ----------
{
  const CASES = ["automl", "jobtracker", "taskflow-calendar"];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  for (const path of ["/", "/evidence/", ...CASES.map((c) => `/projects/${c}/`), "/nope/"]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(1100);
    const r = await page.evaluate(() => {
      const small = [];
      for (const el of document.querySelectorAll("a[href],button,[role='button']")) {
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height) continue;
        if (b.width < 24 || b.height < 24) {
          small.push({
            t: (el.innerText ?? "").trim().slice(0, 34),
            w: Math.round(b.width),
            h: Math.round(b.height),
          });
        }
      }
      // and adjacency: links whose boxes are < 8px apart vertically
      const boxes = [...document.querySelectorAll("a[href],button")]
        .map((e) => ({ e, b: e.getBoundingClientRect() }))
        .filter((x) => x.b.width && x.b.height);
      let crowded = 0;
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i].b,
            c = boxes[j].b;
          const dx = Math.max(0, Math.max(a.left, c.left) - Math.min(a.right, c.right));
          const dy = Math.max(0, Math.max(a.top, c.top) - Math.min(a.bottom, c.bottom));
          if (dx === 0 && dy > 0 && dy < 6) crowded++;
        }
      return { under24: small.length, sample: small.slice(0, 10), crowdedPairs: crowded };
    });
    note(`tapTargets@390${path}`, r);
  }
  await ctx.close();
}

writeFileSync(`${OUT}/micro-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
console.log("done");
