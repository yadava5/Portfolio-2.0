/* r15 · where the rail crosses heading or prose ink, station by station.
 *
 * G10c reads only ¶10 and ¶11. This walks EVERY station's prose and heading at
 * the eight two-column seats and reports the rail's nearest approach to any
 * line box of ink, so "fix ¶08" can be checked against "is anything else as
 * bad". Ink, not boxes, and transforms neutralised — the same reading G10c
 * makes, for the same reason (a box runs to the column edge; its last line
 * does not).
 *
 *   node probe-rail-ink.mjs [outDir] [port]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { chromium } from "@playwright/test";

const OUT = process.argv[2] ?? "out";
const PORT = +(process.argv[3] ?? 3501);
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
await new Promise((r) => server.listen(PORT, r));

const SEATS = [
  [1512, 982], [1456, 949], [1440, 900], [1375, 800],
  [1366, 768], [1280, 800], [1280, 720], [1250, 800],
];
const STATIONS = [
  "who", "path", "work", "cadence", "glyph", "jetpack-compress",
  "lifequest", "automl", "review", "cosigners",
];

const browser = await chromium.launch();
const rows = [];
for (const [w, h] of SEATS) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`http://127.0.0.1:${PORT}/`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(4200);
  const out = await page.evaluate((ids) => {
    const st = document.createElement("style");
    st.textContent = ids.map((i) => `#${i},#${i} *`).join(",") + "{transform:none !important}";
    document.head.appendChild(st);
    /* THE NEUTRALISATION IS ASSERTED, the same as G10c's. __rail() is layout
       space; a client rect plus scrollY only equals it if nothing above the
       node still carries a transform, and every station's prose and plate
       carry entrance ones. A residual means every number below is measured
       in the wrong frame. */
    const dirty = ids.flatMap((i) => [...document.querySelectorAll(`#${i} *`)])
      .filter((e) => { const t = getComputedStyle(e).transform; return t && t !== "none"; }).length;
    const rail = window.__rail();
    const read = (host) => {
      const tw = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      const nodes = [];
      for (let n = tw.nextNode(); n; n = tw.nextNode())
        if (n.textContent && n.textContent.trim()) nodes.push(n);
      let min = Infinity, worst = "", rects = 0;
      /* A GRAZE AND A STRIKE ARE NOT THE SAME DEFECT. min alone reads 0 for a
         line the rail touches at one corner and for a heading it runs down
         the middle of, and every swing between columns touches something. So
         the strike is counted too: rail samples strictly inside a line box,
         and the y span they cover. */
      let inside = 0, yLo = Infinity, yHi = -Infinity;
      const struck = new Set();
      for (const n of nodes) {
        const r = document.createRange();
        r.selectNodeContents(n);
        for (const lr of r.getClientRects()) {
          if (!lr.width || !lr.height) continue;
          rects++;
          const L = lr.left, R = lr.right, T = lr.top + scrollY, B = lr.bottom + scrollY;
          for (const p of rail) {
            const dx = p.x < L ? L - p.x : p.x > R ? p.x - R : 0;
            const dy = p.y < T ? T - p.y : p.y > B ? p.y - B : 0;
            const d = Math.hypot(dx, dy);
            if (d < min) { min = d; worst = (n.textContent || "").trim().slice(0, 32); }
            if (dx === 0 && dy === 0) {
              inside++;
              if (p.y < yLo) yLo = p.y;
              if (p.y > yHi) yHi = p.y;
              struck.add((n.textContent || "").trim().slice(0, 28));
            }
          }
        }
      }
      return { min: min === Infinity ? -1 : +min.toFixed(2), worst, rects,
        inside, span: inside ? +(yHi - yLo).toFixed(0) : 0,
        yLo: inside ? +yLo.toFixed(0) : 0,
        struck: [...struck].slice(0, 4) };
    };
    const res = [];
    for (const id of ids) {
      const sec = document.getElementById(id);
      if (!sec) continue;
      for (const [what, sel] of [["prose", ".prose"], ["h2", "h2"]]) {
        const host = sec.querySelector(sel);
        if (!host) continue;
        const r = read(host);
        /* the column's own geometry, so a fix has somewhere to go */
        const b = host.getBoundingClientRect();
        res.push({ id, what, ...r,
          left: +b.left.toFixed(1), right: +b.right.toFixed(1) });
      }
    }
    st.remove();
    return { dirty, res };
  }, STATIONS);
  if (out.dirty)
    throw new Error(`${w}x${h}: ${out.dirty} elements kept a transform — every rect here is in the wrong space`);
  for (const r of out.res) rows.push({ w, h, ...r });
  await page.close();
}
await browser.close();
server.close();

const ids = [...new Set(rows.map((r) => r.id + "·" + r.what))];
console.log("STRIKES · rail samples inside a line box (span of y they cover)\n");
console.log("seat".padEnd(11) + ids.map((i) => i.slice(0, 11).padStart(12)).join(""));
for (const [w, h] of SEATS) {
  const line = ids.map((k) => {
    const r = rows.find((x) => x.w === w && x.id + "·" + x.what === k);
    return (r ? (r.inside ? `${r.inside}/${r.span}` : ".") : "-").padStart(12);
  }).join("");
  console.log((`${w}x${h}`).padEnd(11) + line);
}
console.log("\nCLEARANCE · nearest approach in px (0 means it touches ink)\n");
console.log("seat".padEnd(11) + ids.map((i) => i.slice(0, 11).padStart(12)).join(""));
for (const [w, h] of SEATS) {
  const line = ids.map((k) => {
    const r = rows.find((x) => x.w === w && x.id + "·" + x.what === k);
    return (r ? r.min.toFixed(1) : "-").padStart(12);
  }).join("");
  console.log((`${w}x${h}`).padEnd(11) + line);
}
console.log("\nevery strike, worst first:");
for (const r of rows.filter((x) => x.inside).sort((a, b) => b.inside - a.inside))
  console.log(`  ${r.w}x${r.h}  ${(r.id + "·" + r.what).padEnd(22)} ${String(r.inside).padStart(4)} samples over ${String(r.span).padStart(4)}px from y ${r.yLo}  ${JSON.stringify(r.struck)}`);
