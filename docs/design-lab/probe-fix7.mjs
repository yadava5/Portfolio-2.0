/**
 * FIX ROUND 7 probe — the nitpicker's closing punch list, measured.
 *
 * N19  the ¶07 reference list's seating rule (the `justify-between` +
 *      `flex-wrap` orphan, third occurrence) — swept 640→1920 @40px, plus
 *      a REPO-WIDE sweep of every other instance of the same construct.
 * N20  the `↗` grammar on the case files — how many external links wear
 *      the mark, and what marking them all would cost in row height at
 *      390 and 1440.
 * N21  the ambiguous home link labels (WCAG 2.4.9) — visible text,
 *      accessible name, and the row's measured width at 390.
 * N23  the font preloads that warn on /no-such-page/.
 *
 * Usage: PORT=3700 node docs/design-lab/probe-fix7.mjs [before|after]
 * (expects `PORT=3700 node tests/playwright/static-server.mjs` running)
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "before";
const PORT = process.env.PORT ?? "3700";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(process.cwd(), "docs/design-lab/shots-fix7");
fs.mkdirSync(OUT, { recursive: true });

const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`\n[${k}]\n${typeof v === "string" ? v : JSON.stringify(v)}`);
};

/** 640 → 1920 in 40px steps: the 33 widths the viewer swept. */
const SWEEP = [];
for (let w = 640; w <= 1920; w += 40) SWEEP.push(w);

const CASE_IDS = [
  "automl",
  "fast-mnist-nn",
  "jobtracker",
  "master-inventory",
  "policybot",
  "taskflow-calendar",
  "visual-assist",
];

const browser = await chromium.launch();

/* ────────────────────────────────────────────────────────────────
   The seating reader, shared by N19 and the repo-wide sweep.

   A row of `flex-wrap` + `justify-between` seats a lone wrapped item at
   flex-START. So for each container: is the LAST child on the same
   visual line as the first (`shared`), and if not, does its right edge
   reach the container's right edge (`right`) or sit at the left
   (`LEFT` — the fault)?
   ──────────────────────────────────────────────────────────────── */
const SEAT_FN = `(sel) => {
  const rows = [...document.querySelectorAll(sel)];
  return rows.map((row, i) => {
    const kids = [...row.children].filter((k) => {
      const cs = getComputedStyle(k);
      return cs.display !== "none" && k.getBoundingClientRect().width > 0;
    });
    if (kids.length < 2) return { i, n: kids.length, seat: "n/a" };
    const rb = row.getBoundingClientRect();
    const a = kids[0].getBoundingClientRect();
    const z = kids[kids.length - 1].getBoundingClientRect();
    const shared = Math.abs(a.top - z.top) < 4;
    const padR = parseFloat(getComputedStyle(row).paddingRight) || 0;
    const flushRight = Math.abs(rb.right - padR - z.right) < 2;
    return {
      i,
      shared,
      seat: shared ? "line1-right" : flushRight ? "line2-right" : "line2-LEFT",
      dx: Math.round(rb.right - padR - z.right),
    };
  });
}`;

/* ── N19 · the ¶07 reference list, swept ─────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const table = [];
  for (const w of SWEEP) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(BASE + "/?motion=off", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(260);
    const seats = await page.evaluate(
      new Function("sel", `return (${SEAT_FN})(sel)`),
      "ol.label-mono > li"
    );
    const refs = seats.filter((s) => s.seat !== "n/a");
    /* The RULE is the seat — every receipt flush right, whether it
       shares the claim's line or takes its own. Which line a receipt
       lands on is prose length, not a rule; mixing LEFT and RIGHT
       edges in one list is the fault N19 named. */
    const left = refs.filter((s) => s.seat === "line2-LEFT").length;
    table.push({
      w,
      rows: refs.length,
      flushRight: refs.length - left,
      flushLeft: left,
      uniformSeat: left === 0,
      onLine1: refs.filter((s) => s.seat === "line1-right").length,
      onLine2: refs.filter((s) => s.seat !== "line1-right").length,
      seats: refs.map((s) => s.seat),
    });
  }
  note("N19.refSeating", table);
  note(
    "N19.mixedWidths",
    table.filter((r) => !r.uniformSeat).map((r) => r.w)
  );
  note("N19.uniformAt", `${table.filter((r) => r.uniformSeat).length} / ${table.length}`);
  await page.close();
}

/* ── N19b · every other justify-between + flex-wrap in the repo ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const ROUTES = [
    ["home", "/?motion=off"],
    ["evidence", "/evidence/"],
    ["case-automl", "/projects/automl/"],
    ["case-jobtracker", "/projects/jobtracker/"],
    ["404", "/no-such-page/"],
  ];
  const found = {};
  /* 320 too: the construct's fault is width-driven, and the narrow end
     is where a two-link footer row first cannot share a line. */
  const WIDE = [320, 360, 390, 430, 640, 768, 900, 1024, 1160, 1280, 1440, 1920];
  for (const [name, route] of ROUTES) {
    for (const w of WIDE) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(220);
      const rows = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("*")) {
          const cs = getComputedStyle(el);
          if (cs.display !== "flex" && cs.display !== "inline-flex") continue;
          if (cs.justifyContent !== "space-between") continue;
          if (!cs.flexWrap.startsWith("wrap")) continue;
          const kids = [...el.children].filter(
            (k) =>
              getComputedStyle(k).display !== "none" &&
              k.getBoundingClientRect().width > 0
          );
          if (kids.length < 2) continue;
          const rb = el.getBoundingClientRect();
          const a = kids[0].getBoundingClientRect();
          const z = kids[kids.length - 1].getBoundingClientRect();
          const shared = Math.abs(a.top - z.top) < 4;
          const padR = parseFloat(cs.paddingRight) || 0;
          const flushRight = Math.abs(rb.right - padR - z.right) < 2;
          /* a stable-ish identity for the container across widths */
          const key =
            (el.className || "").toString().split(/\s+/).slice(0, 6).join(" ") ||
            el.tagName;
          out.push({
            key,
            tag: el.tagName,
            seat: shared
              ? "line1-right"
              : flushRight
                ? "line2-right"
                : "line2-LEFT",
            txt: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 44),
          });
        }
        return out;
      });
      for (const r of rows) {
        const id = `${name} :: ${r.tag}.${r.key}`;
        found[id] ??= { seats: {}, sample: r.txt, faultAt: [] };
        found[id].seats[r.seat] = (found[id].seats[r.seat] ?? 0) + 1;
        if (r.seat === "line2-LEFT" && !found[id].faultAt.includes(w))
          found[id].faultAt.push(w);
      }
    }
  }
  const summary = Object.entries(found).map(([id, v]) => ({
    id,
    sample: v.sample,
    seats: v.seats,
    faultAt: v.faultAt,
  }));
  note("N19b.constructSweep", summary);
  note(
    "N19b.faulting",
    summary.filter((s) => s.faultAt.length > 0).map((s) => `${s.id} @ ${s.faultAt.join(",")}`)
  );
  await page.close();
}

/* ── N20 · the ↗ census + the density cost of marking them all ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const census = [];
  const ROUTES = [
    ["home", "/?motion=off"],
    ["evidence", "/evidence/"],
    ["404", "/no-such-page/"],
    ...CASE_IDS.map((id) => [`case-${id}`, `/projects/${id}/`]),
  ];
  for (const [name, route] of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(320);
    const v = await page.evaluate(() => {
      const ext = [...document.querySelectorAll('a[target="_blank"]')];
      const marked = ext.filter((a) => /↗/.test(a.textContent || ""));
      const bare = ext.filter((a) => !/↗/.test(a.textContent || ""));
      const inTable = bare.filter((a) => a.closest("[data-receipt-row], ol li"));
      return {
        external: ext.length,
        marked: marked.length,
        bare: bare.length,
        bareInEvidenceTable: inTable.length,
        bareSample: bare
          .slice(0, 4)
          .map((a) => (a.textContent || "").trim().slice(0, 46)),
      };
    });
    census.push({ name, ...v });
  }
  note("N20.arrowCensus", census);
  note("N20.totals", {
    external: census.reduce((s, c) => s + c.external, 0),
    marked: census.reduce((s, c) => s + c.marked, 0),
    bare: census.reduce((s, c) => s + c.bare, 0),
  });

  /* Density: the artifact cell on the busiest case file, before and
     after hanging the mark on every bare link — measured by injecting
     the glyph and re-reading the cell's box. */
  for (const w of [390, 1440]) {
    await page.setViewportSize({ width: w, height: 1200 });
    await page.goto(BASE + "/projects/jobtracker/", {
      waitUntil: "domcontentloaded",
    });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    const before = await page.evaluate(() => {
      const cells = [...document.querySelectorAll(".wrap-anywhere")];
      const doc = document.documentElement;
      return {
        cells: cells.length,
        totalH: cells.reduce(
          (s, c) => s + Math.round(c.getBoundingClientRect().height),
          0
        ),
        docH: Math.round(doc.scrollHeight),
        overflow: Math.round(doc.scrollWidth - window.innerWidth),
        artifactLines: cells.reduce((s, c) => {
          const ul = c.querySelector("ul");
          if (!ul) return s;
          return (
            s +
            [...ul.querySelectorAll("li")].reduce((t, li) => {
              const lh = parseFloat(getComputedStyle(li).lineHeight) || 18;
              return t + Math.round(li.getBoundingClientRect().height / lh);
            }, 0)
          );
        }, 0),
      };
    });
    const after = await page.evaluate(() => {
      for (const a of document.querySelectorAll(
        '.wrap-anywhere a[target="_blank"]'
      )) {
        if (!/↗/.test(a.textContent || "")) a.append(" ↗");
      }
      const cells = [...document.querySelectorAll(".wrap-anywhere")];
      const doc = document.documentElement;
      return {
        totalH: cells.reduce(
          (s, c) => s + Math.round(c.getBoundingClientRect().height),
          0
        ),
        docH: Math.round(doc.scrollHeight),
        overflow: Math.round(doc.scrollWidth - window.innerWidth),
        artifactLines: cells.reduce((s, c) => {
          const ul = c.querySelector("ul");
          if (!ul) return s;
          return (
            s +
            [...ul.querySelectorAll("li")].reduce((t, li) => {
              const lh = parseFloat(getComputedStyle(li).lineHeight) || 18;
              return t + Math.round(li.getBoundingClientRect().height / lh);
            }, 0)
          );
        }, 0),
      };
    });
    note(`N20.density@${w}`, { before, after });
  }
  await page.close();
}

/* ── N21 · the ambiguous home links ──────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const out = {};
  for (const w of [390, 768, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(BASE + "/?motion=off", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(360);
    out[w] = await page.evaluate(() => {
      const links = [...document.querySelectorAll("main a")];
      const texts = {};
      for (const a of links) {
        const t = (a.textContent || "").trim().replace(/\s+/g, " ");
        (texts[t] ??= []).push({
          href: a.getAttribute("href"),
          aria: a.getAttribute("aria-label"),
          w: Math.round(a.getBoundingClientRect().width),
          h: Math.round(a.getBoundingClientRect().height),
          lines: Math.round(
            a.getBoundingClientRect().height /
              (parseFloat(getComputedStyle(a).lineHeight) || 18)
          ),
        });
      }
      const dupes = Object.entries(texts)
        .filter(([, v]) => v.length > 1 && v.some((x) => x.href))
        .map(([t, v]) => ({ text: t, n: v.length, hrefs: v.map((x) => x.href), boxes: v }));
      return { dupes };
    });
  }
  note("N21.ambiguousLinks", out);
  await page.close();
}

/* ── N23 · the preloads that warn ────────────────────────────── */
{
  for (const route of ["/", "/no-such-page/", "/evidence/"]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const warns = [];
    page.on("console", (m) => {
      if (/preload/i.test(m.text())) warns.push(m.text().slice(0, 180));
    });
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForTimeout(4200);
    const used = await page.evaluate(async () => {
      await document.fonts.ready;
      const seen = new Set();
      document.fonts.forEach((f) => {
        if (f.status === "loaded") seen.add(`${f.family}/${f.style}`);
      });
      const preloads = [
        ...document.querySelectorAll('link[rel="preload"][as="font"]'),
      ].map((l) => l.getAttribute("href").split("/").pop());
      return { loadedFaces: [...seen], preloads };
    });
    note(`N23.preload${route}`, { warns, ...used });
    await ctx.close();
  }
}

fs.writeFileSync(
  `${OUT}/fix7-probe-${TAG}.json`,
  JSON.stringify(notes, null, 1)
);
await browser.close();
console.log("\n--- done ---");
