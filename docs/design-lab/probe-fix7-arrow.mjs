/**
 * FIX ROUND 7 · N20 — the `↗` grammar on the case files.
 *
 * StoryShell's F41 note defines `↗` as "leaves the site". The case
 * files' receipts table prints its artifact labels bare, so the same
 * artifact wears the mark on /evidence/ and loses it on its own file.
 * FIX4 declined to hang the marks as a density call; the nitpicker
 * accepted that in pass 2 and reversed in pass 3, on the ground that
 * the site's own stated grammar is contradicted.
 *
 * This rig produces the numbers the ruling needs:
 *   1. the census — external `target="_blank"` links per route, marked
 *      vs bare, split by SAME-ORIGIN (a `_blank` that never leaves the
 *      site, e.g. the resume PDF — correctly unmarked) and CROSS-ORIGIN
 *   2. the column's composition — does the artifact column carry ONE
 *      kind of link (so a column-header rule could cover it) or two
 *   3. the density cost — inject the glyph on every bare cross-origin
 *      artifact link and re-measure the cell, at 390 and 1440 and at
 *      320 (the width fix round 5 fought to fit), reporting the count
 *      actually mutated so a null result cannot be a silent no-op
 *
 * Usage: PORT=3700 node docs/design-lab/probe-fix7-arrow.mjs [tag]
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "before";
const PORT = process.env.PORT ?? "3700";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(process.cwd(), "docs/design-lab/shots-fix7");
fs.mkdirSync(OUT, { recursive: true });

const CASE_IDS = [
  "automl",
  "fast-mnist-nn",
  "jobtracker",
  "master-inventory",
  "policybot",
  "taskflow-calendar",
  "visual-assist",
];
const ROUTES = [
  ["home", "/?motion=off"],
  ["evidence", "/evidence/"],
  ["404", "/no-such-page/"],
  ...CASE_IDS.map((id) => [`case-${id}`, `/projects/${id}/`]),
];

const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`\n[${k}]\n${JSON.stringify(v)}`);
};

const browser = await chromium.launch();

/* ── 1 + 2 · census and column composition ───────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const census = [];
  for (const [name, route] of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(320);
    census.push({
      name,
      ...(await page.evaluate(() => {
        const mark = (a) =>
          /↗/.test(a.textContent || "") || !!a.querySelector("svg");
        const blank = [...document.querySelectorAll('a[target="_blank"]')];
        const cross = blank.filter((a) => {
          try {
            return new URL(a.href, location.href).origin !== location.origin;
          } catch {
            return false;
          }
        });
        const same = blank.length - cross.length;
        const bare = cross.filter((a) => !mark(a));
        const inCell = bare.filter((a) => a.closest(".wrap-anywhere"));
        /* Composition of the artifact column: how many links in it are
           external, how many are on-page fig citations. */
        const cells = [...document.querySelectorAll(".wrap-anywhere")];
        const colExternal = cells.reduce(
          (s, c) => s + c.querySelectorAll('a[target="_blank"]').length,
          0
        );
        const colCite = cells.reduce(
          (s, c) => s + c.querySelectorAll("a.cite-link").length,
          0
        );
        return {
          blank: blank.length,
          sameOrigin: same,
          cross: cross.length,
          crossMarked: cross.length - bare.length,
          crossBare: bare.length,
          bareInArtifactCell: inCell.length,
          colExternal,
          colCite,
        };
      })),
    });
  }
  note("census", census);
  note("censusTotals", {
    blank: census.reduce((s, c) => s + c.blank, 0),
    sameOrigin: census.reduce((s, c) => s + c.sameOrigin, 0),
    cross: census.reduce((s, c) => s + c.cross, 0),
    crossMarked: census.reduce((s, c) => s + c.crossMarked, 0),
    crossBare: census.reduce((s, c) => s + c.crossBare, 0),
    bareInArtifactCell: census.reduce((s, c) => s + c.bareInArtifactCell, 0),
    colExternal: census.reduce((s, c) => s + c.colExternal, 0),
    colCite: census.reduce((s, c) => s + c.colCite, 0),
  });
  await page.close();
}

/* ── 3 · what marking them all costs ─────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const cost = [];
  for (const id of ["jobtracker", "taskflow-calendar", "fast-mnist-nn", "visual-assist"]) {
    for (const w of [320, 390, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(`${BASE}/projects/${id}/`, {
        waitUntil: "domcontentloaded",
      });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(420);
      const read = () =>
        page.evaluate(() => {
          const cells = [...document.querySelectorAll(".wrap-anywhere")];
          const lines = (el) => {
            const lh = parseFloat(getComputedStyle(el).lineHeight) || 18;
            return Math.round(el.getBoundingClientRect().height / lh);
          };
          return {
            cellH: cells.reduce(
              (s, c) => s + Math.round(c.getBoundingClientRect().height),
              0
            ),
            linkLines: cells.reduce(
              (s, c) =>
                s +
                [...c.querySelectorAll("li")].reduce((t, li) => t + lines(li), 0),
              0
            ),
            docH: Math.round(document.documentElement.scrollHeight),
            overflow: Math.round(
              document.documentElement.scrollWidth - window.innerWidth
            ),
          };
        });
      const before = await read();
      const mutated = await page.evaluate(() => {
        let n = 0;
        for (const a of document.querySelectorAll(
          '.wrap-anywhere a[target="_blank"]'
        )) {
          if (!/↗/.test(a.textContent || "")) {
            a.append(" ↗");
            n++;
          }
        }
        return n;
      });
      const after = await read();
      cost.push({
        id,
        w,
        mutated,
        cellH: [before.cellH, after.cellH],
        linkLines: [before.linkLines, after.linkLines],
        docH: [before.docH, after.docH],
        overflow: [before.overflow, after.overflow],
      });
    }
  }
  note("densityCost", cost);
  await page.close();
}

fs.writeFileSync(`${OUT}/fix7-arrow-${TAG}.json`, JSON.stringify(notes, null, 1));
await browser.close();
console.log("\n--- done ---");
