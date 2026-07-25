/**
 * F37 evidence shoot — the Glyph scene's two seats at 390 vs 1440.
 *
 * Usage:
 *   PORT=3300 node tests/playwright/static-server.mjs &
 *   node docs/design-lab/shoot-f37.mjs <tag>       # tag = "before" | "after"
 *
 * Writes PNGs + probe JSON into docs/design-lab/shots-f37/.
 * The census is the F66 harness's, unchanged (per scene text node:
 * authored size, rendered size, viewBox overflow, pairwise text
 * collisions at 0.5-unit tolerance) plus one F37-specific reading: the
 * forward-pass panel's label inventory, so "the stages are named" is a
 * measured claim, not an asserted one. The fault's floor stays F66's —
 * no rendered text below 11px at 390.
 *
 * Captures run in the reduced-motion (static) world on purpose: the
 * server markup IS the settled frame (amendment A7), so the stills are
 * deterministic; the engine world is covered by the playwright suites.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const TAG = process.argv[2] ?? "before";
const BASE = process.env.BASE ?? "http://127.0.0.1:3300";
const OUT = resolve("docs/design-lab/shots-f37");
mkdirSync(OUT, { recursive: true });

const WIDTHS = [
  { name: "390", viewport: { width: 390, height: 844 } },
  { name: "1440", viewport: { width: 1440, height: 900 } },
];

/** The Glyph scene's two seats. */
const SURFACES = [
  { scene: "glyph", surface: "row", url: "/", root: "[data-scene-glyph]" },
  {
    scene: "glyph",
    surface: "plate",
    url: "/projects/fast-mnist-nn/",
    root: "#project-visual [data-scene-glyph]",
  },
];

/**
 * In-page census of one scene root: every VISIBLE svg plate's text
 * nodes with authored + rendered size, overflow past the viewBox, and
 * pairwise text-bbox collisions (0.5-unit tolerance, the wave-2 bar).
 */
const censusScene = (rootSel) => {
  const root = document.querySelector(rootSel);
  if (!root) return { missing: true };
  const plates = [];
  for (const svg of root.querySelectorAll("svg")) {
    const r = svg.getBoundingClientRect();
    if (r.width === 0) continue; /* the hidden edition (display:none) */
    const vb = (svg.getAttribute("viewBox") ?? "0 0 1 1")
      .split(/\s+/)
      .map(Number);
    const scale = r.width / vb[2];
    const texts = [];
    for (const t of svg.querySelectorAll("text")) {
      const fs = parseFloat(getComputedStyle(t).fontSize);
      let bb = null;
      try {
        const b = t.getBBox();
        bb = { x: b.x, y: b.y, w: b.width, h: b.height };
      } catch {
        /* unrendered */
      }
      texts.push({
        text: t.textContent.trim().slice(0, 32),
        authored: Math.round(fs * 100) / 100,
        rendered: Math.round(fs * scale * 100) / 100,
        bb,
      });
    }
    const TOL = 0.5;
    const overflows = texts
      .filter(
        (t) =>
          t.bb &&
          (t.bb.x < vb[0] - TOL ||
            t.bb.y < vb[1] - TOL ||
            t.bb.x + t.bb.w > vb[0] + vb[2] + TOL ||
            t.bb.y + t.bb.h > vb[1] + vb[3] + TOL)
      )
      .map((t) => t.text);
    const collisions = [];
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i].bb;
        const b = texts[j].bb;
        if (!a || !b) continue;
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox > TOL && oy > TOL)
          collisions.push(`${texts[i].text} × ${texts[j].text}`);
      }
    }
    plates.push({
      viewBox: vb.join(" "),
      clientWidth: Math.round(r.width * 10) / 10,
      scale: Math.round(scale * 1000) / 1000,
      minRendered: texts.length
        ? Math.min(...texts.map((t) => t.rendered))
        : null,
      texts: texts.map((t) => ({
        text: t.text,
        authored: t.authored,
        rendered: t.rendered,
      })),
      overflows,
      collisions,
    });
  }
  /* F37's own reading: the forward-pass panel is the aria-hidden svg
     (the race plates carry role="img"); its label inventory is the
     "stages are named" claim, measured. */
  const fp = Array.from(root.querySelectorAll("svg[aria-hidden]")).find(
    (svg) => svg.getBoundingClientRect().width > 0
  );
  const forwardPassLabels = fp
    ? Array.from(fp.querySelectorAll("text"))
        .map((t) => t.textContent.trim())
        .filter((s) => !/^\d$/.test(s)) /* the 0–9 slot digits */
    : [];
  return {
    plates,
    forwardPassLabels,
    minRendered: plates.length
      ? Math.min(...plates.map((p) => p.minRendered ?? Infinity))
      : null,
  };
};

const browser = await chromium.launch();
const probe = { tag: TAG, base: BASE, at: new Date().toISOString(), runs: [] };

for (const width of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: width.viewport,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  let currentUrl = null;
  for (const spec of SURFACES) {
    if (currentUrl !== spec.url) {
      await page.goto(`${BASE}${spec.url}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      currentUrl = spec.url;
    }
    const data = await page.evaluate(censusScene, spec.root);
    probe.runs.push({ width: width.name, ...spec, ...data });
    const fig = page.locator(spec.root).locator("xpath=ancestor::figure[1]");
    const target = (await fig.count()) ? fig : page.locator(spec.root);
    await target.screenshot({
      path: resolve(
        OUT,
        `${TAG}-${spec.scene}-${spec.surface}-${width.name}.png`
      ),
      animations: "disabled",
    });
  }
  await ctx.close();
}

await browser.close();
writeFileSync(
  resolve(OUT, `probe-${TAG}.json`),
  JSON.stringify(probe, null, 2)
);

/* The headline table: min rendered text px + the named stages */
const rows = probe.runs.map((r) => ({
  surface: r.surface,
  width: r.width,
  min: r.minRendered,
  overflows: r.plates?.reduce((n, p) => n + p.overflows.length, 0) ?? null,
  collisions: r.plates?.reduce((n, p) => n + p.collisions.length, 0) ?? null,
  fpLabels: r.forwardPassLabels?.join(" · ") || "(none)",
}));
console.log(`f37 ${TAG}: shots + probe-${TAG}.json → ${OUT}`);
console.table(rows);
