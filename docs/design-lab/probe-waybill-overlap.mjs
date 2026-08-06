/* Does a waybill ever print THROUGH the prose? The painter guards only the
 * STACKED layout — "canvas text under DOM text would print through it" — and
 * on two-column desktop the rail crosses the prose column near some stations
 * with nothing checking it. Hook fillText, measure the text it drew, and
 * compare with every text-bearing box on screen, per corridor.
 *
 * WHAT IT MEASURED, 2026-08-05, at 1440×900, 48 stops per corridor:
 *
 *     corridor  6   "one valid gzip member → manifest"                11
 *     corridor 10   "two recommendations, carried as written …"        8
 *     corridor  1   "the engineer's credentials → manifest"            5
 *     corridor  9   "run 042, reviewed → the references"               5
 *     corridor  8   "automl's halted run → manifest"                   4
 *     corridor  8   "run 042's report → the review"                    4
 *     corridor  2   "five years of logs, given shape → the line"       1
 *     corridor  7   "lifequest's unfinished rows, carried unchanged"   1
 *
 * So the overlap is a PROPERTY OF THE DESKTOP LAYOUT, not of any one label:
 * the run's worst corridor is 6, which carries a single waybill and has done
 * since round 2. This was run to answer whether adding a second labelled
 * waybill to corridor 8 made things worse; two labels there overlap at 8 of
 * 48 stops, below corridor 6's 11, so the answer was no.
 *
 * NOT FIXED HERE, deliberately. The painter is a pure function of scroll by
 * design; knowing where the prose column is would mean measuring the DOM from
 * inside it, which is a change to the drawing model and not to the cargo. It
 * is recorded so the next person to open the painter finds a measurement
 * rather than an impression.
 *
 *   node docs/design-lab/probe-waybill-overlap.mjs [outDir]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { chromium } from "@playwright/test";

const OUT = process.argv[2] ?? "out";
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2",
  ".wasm": "application/wasm", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".pdf": "application/pdf",
};
const server = createServer(async (req, res) => {
  try {
    let p = join(OUT, decodeURIComponent(req.url.split("?")[0]));
    const s = await stat(p).catch(() => null);
    if (s?.isDirectory()) p = join(p, "index.html");
    const body = await readFile(p);
    res.writeHead(200, { "Content-Type": TYPES[extname(p)] ?? "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404).end("not found"); }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  window.__paint = [];
  const real = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (text, x, y) {
    /* only the waybills: 11.5px Fragment Mono is the painter's own size */
    if (String(this.font).startsWith("11.5px")) {
      const w = this.measureText(String(text)).width;
      const left = this.textAlign === "right" ? x - w : x;
      window.__paint.push({
        text: String(text), scrollY: window.scrollY,
        left, right: left + w, top: y - 11.5, bottom: y + 3,
      });
    }
    return real.call(this, text, x, y);
  };
});

await page.goto(`http://127.0.0.1:${port}/`);
await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
await page.evaluate(() => document.fonts.ready);

const beats = await page.evaluate(() =>
  [...document.querySelectorAll("[data-beat]")]
    .map((el) => ({
      beat: Number(el.getAttribute("data-beat")),
      top: el.getBoundingClientRect().top + window.scrollY,
    }))
    .sort((a, b) => a.top - b.top)
);

const hits = [];
for (let i = 0; i < beats.length - 1; i++) {
  const span = beats[i + 1].top - beats[i].top;
  for (let f = 0.05; f < 1; f += 0.02) {
    const y = Math.round(beats[i].top + span * f);
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    const drawn = await page.evaluate(() => {
      const p = window.__paint.splice(0);
      return p.filter((d) => d.scrollY === window.scrollY);
    });
    if (!drawn.length) continue;
    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll("main p, main li, main figcaption, main h1, main h2, main blockquote, main span")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight || r.width === 0) return false;
          const st = getComputedStyle(el);
          return +st.opacity > 0.05 && st.visibility !== "hidden" && el.textContent.trim();
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom,
                   what: el.textContent.trim().slice(0, 44) };
        })
    );
    for (const d of drawn) {
      for (const b of boxes) {
        const ox = Math.min(d.right, b.right) - Math.max(d.left, b.left);
        const oy = Math.min(d.bottom, b.bottom) - Math.max(d.top, b.top);
        if (ox > 6 && oy > 4) {
          hits.push({ corridor: i, label: d.text, over: b.what, ox: Math.round(ox), oy: Math.round(oy) });
          break;
        }
      }
    }
  }
}

await browser.close();
server.close();

const byKey = new Map();
for (const h of hits) {
  const k = JSON.stringify([h.corridor, h.label]);
  byKey.set(k, (byKey.get(k) ?? 0) + 1);
}
if (!byKey.size) console.log("no waybill printed through prose at 1440×900");
for (const [k, n] of [...byKey].sort()) {
  const [corridor, label] = JSON.parse(k);
  console.log(`  corridor ${corridor}  "${label}"  overlapped prose at ${n} of 48 sampled stops`);
}
