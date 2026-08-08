/* probe-cargo-rotation.mjs — what the glyph looks like TILTED, which is what a
 * reader actually gets.
 *
 * WHY THIS EXISTS. Cargo marks are rotated to the rail tangent
 * (`tctx.rotate(Math.atan2(...))` in `drawTokenAndTravellers`), and corridors 1
 * and 3 are flip corridors — the rail crosses the page mid-corridor, so the
 * tangent there is strongly diagonal. A screenshot taken "at arrival" catches
 * the one moment the tangent is near-vertical and would pass a mark that reads
 * as a zigzag for the whole corridor. So this samples the corridor's entire
 * paint band and captures the glyph at its WORST tilt, not at a convenient one.
 *
 * HOW IT KNOWS WHICH GLYPH IS WHICH. The painter draws each traveller as
 * save → translate(x,y) → rotate(a) → draw → restore, and the lead item's
 * waybill is filled immediately after. So hooking translate/rotate/fillText and
 * pairing a fillText with the transform that preceded it identifies the labelled
 * glyph of a corridor exactly, with no reliance on TRAV's internal ordering.
 *
 * THERE IS NO day/night DIMENSION HERE, and the first version of this file was
 * wrong to claim one. It looped `colorScheme: "dark"` and reported day and
 * night columns that were byte-identical, because this page's world is not
 * driven by `prefers-color-scheme` at all — it is the DUSK FLIP, a function of
 * scroll depth (`src/run/index.html:140`, "the dusk flip — the site's own law:
 * ink steps WITH the field"). A media query cannot move it. So each corridor is
 * captured under the light of its own position in the arc, which is the only
 * light it is ever read under: corridors 0-5 in daylight, corridor 6 at dusk
 * (¶08 IS the dusk station), the last corridors after dark. Whole-page
 * day/night contrast is `check-palette`'s job, and it already has it.
 *
 *   node tests/playwright/static-server.mjs &
 *   node docs/design-lab/probe-cargo-rotation.mjs [outDir]
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { chromium } from "@playwright/test";

const ROOT = resolve(process.argv[2] ?? "out");
const SHOTS = resolve(process.env.SHOTDIR || "docs/design-lab/shots-cargo-rotation");
mkdirSync(SHOTS, { recursive: true });

const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2",
  ".woff": "font/woff", ".ico": "image/x-icon", ".wasm": "application/wasm",
  ".pdf": "application/pdf", ".txt": "text/plain", ".xml": "application/xml",
};
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const abs = join(ROOT, p);
    const buf = await readFile(abs);
    res.writeHead(200, { "content-type": TYPES[extname(abs)] ?? "application/octet-stream" });
    res.end(buf);
  } catch { res.writeHead(404); res.end("nope"); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/`;

/* the three corridors this change re-cut, by the label their lead item paints */
const WATCH = {
  1: "five years of logs, given shape → the line",
  3: "the committed plan → manifest",
  6: "lifequest’s unfinished rows, carried unchanged",
};
const CROP = 132; /* the glyph is ~18px; this frames it with its waybill */

const browser = await chromium.launch();
const results = {};

for (const dpr of [1, 2]) {
  {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: dpr,
    });
    await page.addInitScript(() => {
      /* pair each fillText with the transform that immediately preceded it */
      window.__marks = [];
      let pend = null;
      const P = CanvasRenderingContext2D.prototype;
      const tr = P.translate, ro = P.rotate, ft = P.fillText;
      P.translate = function (x, y) { pend = { x, y, a: null }; return tr.apply(this, arguments); };
      P.rotate = function (a) { if (pend && pend.a === null) pend.a = a; return ro.apply(this, arguments); };
      P.fillText = function (s) {
        if (pend && pend.a !== null && typeof s === "string" && s.includes("→") || (pend && pend.a !== null && typeof s === "string" && s.length > 12))
          window.__marks.push({ text: s, x: pend.x, y: pend.y, a: pend.a, scroll: window.scrollY });
        return ft.apply(this, arguments);
      };
    });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500); /* entrance + fonts + engine */

    const H = await page.evaluate(() => document.body.scrollHeight);
    /* sweep the whole document; the paint bands are ~600px each */
    for (let y = 0; y < H; y += 40) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(45);
    }
    const marks = await page.evaluate(() => window.__marks);

    for (const [corridor, label] of Object.entries(WATCH)) {
      const mine = marks.filter((m) => m.text === label);
      if (!mine.length) { console.log(`  !! corridor ${corridor} painted no waybill (dpr${dpr})`); continue; }
      const deg = (m) => Math.abs((m.a * 180) / Math.PI);
      const worst = mine.reduce((a, b) => (deg(b) > deg(a) ? b : a));
      const mid = mine[Math.floor(mine.length / 2)];
      results[`corridor ${corridor} · dpr${dpr}`] = {
        stops: mine.length,
        tiltMaxDeg: +deg(worst).toFixed(1),
        tiltMidDeg: +deg(mid).toFixed(1),
      };
      for (const [tag, m] of [["worst", worst], ["mid", mid]]) {
        await page.evaluate((v) => window.scrollTo(0, v), m.scroll);
        await page.waitForTimeout(120);
        const clip = {
          x: Math.max(0, m.x - CROP / 2), y: Math.max(0, m.y - CROP / 2),
          width: CROP, height: CROP,
        };
        await page.screenshot({
          path: join(SHOTS, `c${corridor}-dpr${dpr}-${tag}.png`),
          clip,
        });
      }
    }
    await page.close();
  }
}
await browser.close();
server.close();

console.log("\n(light comes from the arc position, not a media query — see the header)\n\nwhere                  stops   max tilt   mid tilt");
for (const [k, v] of Object.entries(results))
  console.log(`  ${k.padEnd(20)} ${String(v.stops).padStart(4)}   ${String(v.tiltMaxDeg).padStart(7)}°   ${String(v.tiltMidDeg).padStart(7)}°`);
console.log(`\nshots → ${SHOTS}`);
