// NITPICK ROUND 2 — verify every B/S/N I raised, on the shipped tree.
// Not "did a test pass" — did it satisfy a reader.
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
const ROUTES = ["/", "/evidence/", ...CASES.map((c) => `/projects/${c}/`)];

const browser = await chromium.launch();

// ---------- S1/S2/S3/S13: typography sweep across every route ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const path of [...ROUTES, "/does-not-exist/"]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const painted = [];
      const walk = (el) => {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") return;
        for (const n of el.childNodes) {
          if (n.nodeType === 3 && n.textContent.trim()) painted.push(n.textContent);
          else if (n.nodeType === 1) walk(n);
        }
      };
      walk(document.body);
      const text = painted.join("");
      const spoken = [...document.querySelectorAll("[alt],[aria-label],[title]")]
        .map(
          (e) =>
            (e.getAttribute("alt") ?? "") +
            " " +
            (e.getAttribute("aria-label") ?? "") +
            " " +
            (e.getAttribute("title") ?? ""),
        )
        .join("");
      const shared = [
        document.title,
        ...[...document.querySelectorAll("meta[name],meta[property]")].map(
          (m) => m.getAttribute("content") ?? "",
        ),
      ].join("");
      const hits = (s, re) => (s.match(re) ?? []).length;
      // times-sign check: a ratio written with letter x  e.g. 3.5x  or 2.8X
      const timesLetter = (text.match(/\d(?:\.\d+)?\s?[xX](?![\w])/g) ?? []).filter(
        (m) => !/px|ex/.test(m),
      );
      // en-dash / hyphen in date ranges
      const dateRanges = text.match(/\b(?:19|20)\d{2}\s?[-–—]\s?(?:19|20)\d{2}\b/g) ?? [];
      const monthRanges =
        text.match(
          /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}\s*[-–—]\s*/gi,
        ) ?? [];
      return {
        straightApos: hits(text, /'/g),
        straightQuote: hits(text, /"/g),
        straightAposSpoken: hits(spoken, /'/g),
        straightAposShared: hits(shared, /'/g),
        timesLetter,
        dateRanges,
        monthRanges,
        // find the actual snippets around straight quotes for triage
        aposSnips: [...text.matchAll(/.{22}'.{22}/g)].map((m) => m[0]).slice(0, 8),
        quoteSnips: [...text.matchAll(/.{22}".{22}/g)].map((m) => m[0]).slice(0, 8),
      };
    });
    note(`type${path}`, r);
  }
  await ctx.close();
}

// ---------- S7/N3: external link marks, per route ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const path of ROUTES) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const here = location.origin;
      const out = { external: 0, unmarked: [], internalMarked: [], arrowsUsed: {} };
      for (const a of document.querySelectorAll("a[href]")) {
        const cs = getComputedStyle(a);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        if (!a.getBoundingClientRect().width) continue;
        const url = new URL(a.href, here);
        const ext = url.origin !== here;
        const txt = (a.textContent ?? "").trim();
        const marked = /↗/.test(txt);
        if (ext) {
          out.external++;
          if (!marked) out.unmarked.push(txt.slice(0, 60));
        } else if (marked) out.internalMarked.push(txt.slice(0, 60));
      }
      for (const g of ["↗", "⟶", "⟵", "→", "←", "↓", "↑", "»", "›"]) {
        const n = (document.body.innerText.match(new RegExp(g, "g")) ?? []).length;
        if (n) out.arrowsUsed[g] = n;
      }
      return out;
    });
    note(`links${path}`, {
      external: r.external,
      unmarked: r.unmarked.length,
      unmarkedSample: r.unmarked.slice(0, 5),
      internalMarked: r.internalMarked,
      arrows: r.arrowsUsed,
    });
  }
  await ctx.close();
}

// ---------- B2/S15: masthead fit + rail position across widths ----------
{
  for (const width of [360, 640, 700, 768, 800, 860, 879, 880, 900, 1024, 1280, 1440, 1920, 2560]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const hdr = document.querySelector("header");
      const rect = hdr?.getBoundingClientRect();
      // count distinct baselines of direct text in the header
      const tops = new Set();
      const walk = (el) => {
        for (const n of el.childNodes) {
          if (n.nodeType === 3 && n.textContent.trim()) {
            const rr = n.parentElement.getBoundingClientRect();
            if (rr.width) tops.add(Math.round(rr.top));
          } else if (n.nodeType === 1) {
            const cs = getComputedStyle(n);
            if (cs.display !== "none" && cs.visibility !== "hidden") walk(n);
          }
        }
      };
      if (hdr) walk(hdr);
      const nav = document.querySelector("nav");
      const railEls = [...document.querySelectorAll("nav,aside")].filter((e) => {
        const cs = getComputedStyle(e);
        return cs.position === "fixed" && e.getBoundingClientRect().width < 320;
      });
      const rail = railEls[0];
      return {
        headerH: rect ? Math.round(rect.height) : null,
        baselines: [...tops].sort((a, b) => a - b),
        navH: nav ? Math.round(nav.getBoundingClientRect().height) : null,
        railLeft: rail ? Math.round(rail.getBoundingClientRect().left) : null,
        railVisible: rail ? getComputedStyle(rail).display !== "none" : false,
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        contentLeft: (() => {
          const m = document.querySelector("main");
          const p = m?.querySelector("p");
          return p ? Math.round(p.getBoundingClientRect().left) : null;
        })(),
      };
    });
    note(`masthead@${width}`, r);
    if ([768, 879, 880, 1024, 2560].includes(width)) {
      await page.screenshot({ path: `${OUT}/masthead-${width}.png` });
    }
    await ctx.close();
  }
}

// ---------- overflow sweep: every route × every width ----------
{
  const WIDTHS = [
    320, 340, 360, 375, 390, 414, 430, 480, 540, 640, 768, 834, 1024, 1180, 1280, 1440, 1600, 1920,
    2560,
  ];
  const table = {};
  for (const path of [...ROUTES, "/does-not-exist/"]) {
    table[path] = {};
    for (const width of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width, height: 844 } });
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
      await page.waitForTimeout(800);
      const r = await page.evaluate(() => {
        const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const offenders = [];
        if (over > 0) {
          const vw = document.documentElement.clientWidth;
          for (const el of document.querySelectorAll("*")) {
            const b = el.getBoundingClientRect();
            if (b.width && b.right > vw + 0.5) {
              offenders.push({
                tag: el.tagName,
                cls: String(el.className?.baseVal ?? el.className ?? "").slice(0, 60),
                right: Math.round(b.right),
                text: (el.textContent ?? "").trim().slice(0, 50),
              });
            }
          }
        }
        return { over, offenders: offenders.slice(0, 6) };
      });
      table[path][width] = r.over;
      if (r.over > 0) note(`OVERFLOW ${path}@${width}`, r);
      await ctx.close();
    }
  }
  note("overflow.table", table);
}

writeFileSync(`${OUT}/verify-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
console.log("done");
