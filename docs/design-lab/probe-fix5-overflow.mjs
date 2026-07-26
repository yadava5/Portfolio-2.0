// Fix round 5 — the narrow-width overflow probe, widened to every route.
//
// Fix round 4 closed the home page (the gate stamp's rotated bounding
// box) and, in closing it, measured that the CASE FILES were still over:
// /projects/jobtracker/ ran 72px past a 320px viewport, 52 at 340, 32 at
// 360, 2 at 390. `probe-fix4-overflow.mjs` sweeps one path and knows how
// to interrogate the stamp; this one sweeps all seven case files plus
// /evidence and home, and interrogates the thing that actually overflows
// on a case file: a text run with no break opportunity inside a grid
// track whose automatic minimum size is its min-content width.
//
// The report per offender is deliberately more than a selector. For each
// element painted past the viewport edge it records the rendered text,
// the box, and the three properties that decide whether a long path can
// fold — overflow-wrap, word-break, min-width — walked up the ancestor
// chain, so the fix can be attributed to a rule rather than guessed at.
// It also records, for the nearest grid/flex ancestor, whether the item
// is min-content-trapped (scrollWidth > clientWidth with min-width auto),
// which is the classic trap fix round 4 documented on the stamp.
//
// Usage:
//   BASE=http://localhost:3000 node docs/design-lab/probe-fix5-overflow.mjs
//   WIDTHS=320,390 PATHS=/projects/jobtracker/ node ... (overrides)
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000";
const WIDTHS = (process.env.WIDTHS ?? "320,340,360,390,414")
  .split(",")
  .map((w) => Number(w.trim()));
const CASE_IDS = [
  "automl",
  "fast-mnist-nn",
  "jobtracker",
  "master-inventory",
  "policybot",
  "taskflow-calendar",
  "visual-assist",
];
const PATHS = (
  process.env.PATHS ??
  ["/", "/evidence/", ...CASE_IDS.map((id) => `/projects/${id}/`)].join(",")
).split(",");

const browser = await chromium.launch();
const results = [];

for (const path of PATHS) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    const measured = await page.evaluate(() => {
      /** A short, stable selector for a node — enough to find it in source. */
      const describe = (node) => {
        const cls = String(node.className?.baseVal ?? node.className ?? "")
          .split(" ")
          .filter(Boolean)
          .slice(0, 3)
          .join(".");
        const data = [...node.attributes]
          .filter((a) => a.name.startsWith("data-"))
          .map((a) => `[${a.name}]`)
          .join("");
        return (
          node.tagName.toLowerCase() +
          (cls ? `.${cls}` : "") +
          data
        ).slice(0, 90);
      };

      const offenders = [];
      const vw = window.innerWidth;

      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (!(r.width > 0 && r.right > vw + 0.5)) continue;
        /* Only report LEAF-most offenders plus their chain: a parent that
           overflows only because its child does is noise. Keep the element
           if no descendant is also over the edge. */
        const childOver = [...el.querySelectorAll("*")].some((c) => {
          const cr = c.getBoundingClientRect();
          return cr.width > 0 && cr.right > vw + 0.5;
        });

        const cs = getComputedStyle(el);
        /* An element painted past the edge is not necessarily an element
           that WIDENS the document: a plate's hover-zoom raster sits
           400px past the viewport inside a clipping frame and costs
           nothing. Report it, but say so — an offender list that cannot
           tell clipped ink from shoving ink sends the next round after
           the wrong element. */
        let clipped = false;
        for (let a = el.parentElement; a && !clipped; a = a.parentElement) {
          const acs = getComputedStyle(a);
          if (/hidden|clip|auto|scroll/.test(acs.overflowX)) {
            clipped = a.getBoundingClientRect().right <= vw + 0.5;
          }
        }

        const chain = [];
        let node = el.parentElement;
        while (node && node !== document.body && chain.length < 6) {
          const ncs = getComputedStyle(node);
          const parentCs = node.parentElement
            ? getComputedStyle(node.parentElement)
            : null;
          const parentDisplay = parentCs?.display ?? "";
          chain.push({
            sel: describe(node),
            display: ncs.display,
            minWidth: ncs.minWidth,
            overflowWrap: ncs.overflowWrap,
            wordBreak: ncs.wordBreak,
            /* the min-content trap: a grid/flex ITEM whose automatic
               minimum size (min-width:auto) refuses to shrink */
            gridOrFlexItem: /grid|flex/.test(parentDisplay),
            clientWidth: node.clientWidth,
            scrollWidth: node.scrollWidth,
          });
          node = node.parentElement;
        }

        offenders.push({
          leaf: !childOver,
          clipped,
          sel: describe(el),
          text: (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 90),
          width: Math.round(r.width * 10) / 10,
          right: Math.round(r.right * 10) / 10,
          over: Math.round((r.right - vw) * 10) / 10,
          overflowWrap: cs.overflowWrap,
          wordBreak: cs.wordBreak,
          whiteSpace: cs.whiteSpace,
          minWidth: cs.minWidth,
          display: cs.display,
          chain,
        });
      }

      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: vw,
        overflow: document.documentElement.scrollWidth - vw,
        offenderCount: offenders.length,
        shovingCount: offenders.filter((o) => !o.clipped).length,
        leafOffenders: offenders
          .filter((o) => o.leaf)
          .sort((a, b) => Number(a.clipped) - Number(b.clipped))
          .slice(0, 10),
      };
    });

    results.push({ path, width, ...measured });
    await ctx.close();
  }
}

await browser.close();

if (process.env.JSON !== "0") console.log(JSON.stringify(results, null, 2));

console.log("\n--- overflow (scrollWidth − innerWidth) ---");
const paths = [...new Set(results.map((r) => r.path))];
const header = [
  "route".padEnd(34),
  ...WIDTHS.map((w) => String(w).padStart(6)),
];
console.log(header.join(""));
for (const p of paths) {
  const cells = WIDTHS.map((w) => {
    const hit = results.find((r) => r.path === p && r.width === w);
    return String(hit ? hit.overflow : "-").padStart(6);
  });
  console.log([p.padEnd(34), ...cells].join(""));
}

const bad = results.filter((r) => r.overflow > 0);
console.log(
  bad.length === 0
    ? "\nPASS — 0 overflow on every route at every width"
    : `\nFAIL — ${bad.length} route/width pair(s) overflow`
);
process.exit(bad.length === 0 ? 0 : 1);
