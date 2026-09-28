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
 * CLOSED 2026-08-08: 11/48 ON CORRIDOR 6 IS THE ACCEPTED CEILING.
 * Re-measured after the three marks were re-cut and two waybills added, and
 * against the shipped build for comparison — every corridor byte-identical,
 * corridor 6 still 11, the two new labels at 4/48 (corridor 1) and zero
 * (corridor 5). Reopen on exactly two triggers: any corridor measuring ABOVE
 * 11/48 after a future change, or a human reporting the collision. Neither
 * has happened; the number has been stable since round 2, and spending a
 * drawing-model change on a probe figure no reader has complained about is
 * optimisation ahead of the complaint.
 *
 * AND AN ERRATUM, because a wrong prediction recorded is worth more than a
 * quiet correction. The acceptance criterion for the re-cut said corridor 6
 * "must come in under its current 11/48" — and stated the mechanism that
 * makes that impossible in the same sentence: labels drive this number, not
 * mark geometry. Only `j === 0` paints a waybill, so dropping beat 6 from
 * `n: 2` to `n: 1` removed a `j === 1` that had never printed text. The
 * measurement was right and the criterion was wrong.
 *
 * REOPENED 2026-09-27, by the first trigger above. Corridor 6 measures 19/48
 * at 1440×900, identically at 779098b (round 13) and on round 14's figure
 * branch, so it rose before round 14 and was not caught because nothing
 * gates this number. The corridor labels have also shifted since the table
 * above was written. The ceiling is not raised to match; the overlap is an
 * open finding until someone decides it.
 *
 * CLOSED ON CORRIDOR 6, 2026-09-28 (round 15), AND STILL OPEN ON CORRIDOR 1.
 * Both triggers had fired on corridor 6: the number was over the ceiling and
 * the owner read it — "the ticket sits on missions". The cause was not the
 * label, it was the LINE: ¶08's hold was 33% of the viewport against a column
 * capped at 1180, so the rail and its cargo stood inside the paragraph.
 * buildThread now measures ¶08's own prose box and holds the line in the
 * gutter, and the waybill goes with it. Measured here at 1440×900, before
 * and after, on the same tree:
 *
 *     corridor 6, distinct stops over prose          19 → 0
 *     corridor 6, that label's own count             19 → 0
 *     corridor 1, distinct stops over prose          19 → 19   (untouched)
 *     every other corridor                           ±1        (sampling)
 *
 * THREE THINGS THIS RUN CHANGED IN THE PROBE, because the old reading could
 * not have answered the question:
 *   · DISTINCT STOPS per corridor, as well as per label. Corridor 1 carries
 *     two waybills at 12 and 13 stops; added up that is 25 of 48, and a
 *     reader is at one scroll position at a time. Its real number is 19.
 *   · A SECOND READING over the figures' own drawn labels, which the prose
 *     selector list cannot see. ¶08's waybill now crosses fig. 08's plate,
 *     so the question "did it just move onto the drawing" has to be
 *     answerable. It measures NONE at every sampled stop: the label crosses
 *     the building's linework, where the painter's cartographic halo is the
 *     answer, and misses every one of the plate's own words.
 *   · Both readings print even when empty, so a silent zero is a measurement
 *     rather than a probe that stopped finding its subject.
 *
 * CORRIDOR 1 IS THE OPEN ONE NOW, at 19 of 48 distinct stops over ¶02's and
 * ¶03's prose, unchanged by round 15 and above the 11 ceiling. It is the same
 * shape of defect — the line holds inside a column — and the same fix is
 * available and NOT taken here, because ¶02 and ¶03 are two of the eight
 * stations whose crossings are the page's own idiom (see buildThread's
 * round-15 erratum: moving them all costs either the sweep or the slope
 * ceiling). Decide it with the owner, not in a probe.
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
    /* TWO READINGS, because moving a line can move a label off the words and
       onto a drawing. `prose` is the ceiling's own definition, unchanged
       since round 2. `drawn ink` is the figures' SVG text and their plate
       boxes, which the first selector list cannot see at all — corridor 6's
       waybill left ¶08's paragraph in round 15 and began crossing fig. 08. */
    const { boxes, marks } = await page.evaluate(() => {
      const vis = (el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || r.width === 0) return null;
        const st = getComputedStyle(el);
        if (!(+st.opacity > 0.05) || st.visibility === "hidden") return null;
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      };
      const take = (sel, label) =>
        [...document.querySelectorAll(sel)]
          .map((el) => {
            const r = vis(el);
            if (!r || !(el.textContent || "").trim()) return null;
            return { ...r, what: label(el) };
          })
          .filter(Boolean);
      return {
        boxes: take(
          "main p, main li, main figcaption, main h1, main h2, main blockquote, main span",
          (el) => el.textContent.trim().slice(0, 44)
        ),
        marks: take("main figure.plate svg text, main figure.plate svg tspan",
          (el) => "svg: " + el.textContent.trim().slice(0, 38)),
      };
    });
    const over = (d, list) => {
      for (const b of list) {
        const ox = Math.min(d.right, b.right) - Math.max(d.left, b.left);
        const oy = Math.min(d.bottom, b.bottom) - Math.max(d.top, b.top);
        if (ox > 6 && oy > 4) return b;
      }
      return null;
    };
    for (const d of drawn) {
      const b = over(d, boxes);
      if (b) hits.push({ kind: "prose", corridor: i, stop: y, label: d.text, over: b.what });
      const m = over(d, marks);
      if (m) hits.push({ kind: "svg", corridor: i, stop: y, label: d.text, over: m.what });
    }
  }
}

await browser.close();
server.close();

/* PER LABEL, and PER STOP. The ceiling ("11 of 48") was written when every
   corridor carried one waybill; two labels in one corridor can overlap at the
   same scroll position and count twice, which reads as a corridor twice as
   bad as the reader's own experience of it. Both are printed. */
const report = (kind, what) => {
  const byLabel = new Map(), byStop = new Map();
  for (const h of hits.filter((x) => x.kind === kind)) {
    const k = JSON.stringify([h.corridor, h.label]);
    byLabel.set(k, (byLabel.get(k) ?? 0) + 1);
    const s = JSON.stringify([h.corridor, h.stop]);
    byStop.set(s, true);
  }
  console.log(`\n  ── waybills over ${what}, per label`);
  if (!byLabel.size) console.log("     none at 1440×900");
  for (const [k, n] of [...byLabel].sort()) {
    const [corridor, label] = JSON.parse(k);
    console.log(`     corridor ${corridor}  "${label}"  ${n} of 48 sampled stops`);
  }
  const perCorridor = new Map();
  for (const s of byStop.keys()) {
    const [corridor] = JSON.parse(s);
    perCorridor.set(corridor, (perCorridor.get(corridor) ?? 0) + 1);
  }
  console.log(`  ── distinct stops per corridor, over ${what}`);
  if (!perCorridor.size) console.log("     none");
  for (const [corridor, n] of [...perCorridor].sort((a, b) => a[0] - b[0]))
    console.log(`     corridor ${corridor}  ${n} of 48`);
};
report("prose", "prose (the ceiling's own reading)");
report("svg", "a figure's own drawn labels");
