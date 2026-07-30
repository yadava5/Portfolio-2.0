/* Shot + proof rig for the three hero candidates.
   Serves docs/design-lab/candidates over http, walks each page at
   1440×900 and 390×844, scripts real digits onto the pad with mouse
   events, and records the WASM classifier's actual output plus the
   transferred weight of every response. REPORT ONLY. */
import { chromium } from "@playwright/test";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("./candidates/", import.meta.url).pathname;
const OUT = new URL("./shots-hero-round/", import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".wasm": "application/wasm",
  ".bin": "application/octet-stream",
  ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    res.writeHead(404); res.end("nope"); return;
  }
  res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((ok) => server.listen(4499, ok));
const BASE = "http://localhost:4499";

/* — digit paths in pad-fraction coords (y down) — */
const arc = (cx, cy, r, a0deg, a1deg, n) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0deg + ((a1deg - a0deg) * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const DIGITS = {
  three: [
    arc(0.48, 0.32, 0.17, 205, 460, 26),
    /* pen stays down: continue into the lower bowl */
  ],
  zero: [arc(0.5, 0.5, 0.26, 90, 450, 40)],
};
DIGITS.three = [[...DIGITS.three[0], ...arc(0.47, 0.64, 0.2, 255, 520, 30)]];

async function drawStrokes(page, strokes, { midShot } = {}) {
  const box = await page.locator("#pad").boundingBox();
  let midTaken = false;
  for (const pts of strokes) {
    const P = pts.map(([fx, fy]) => [box.x + fx * box.width, box.y + fy * box.height]);
    await page.mouse.move(P[0][0], P[0][1]);
    await page.mouse.down();
    for (let i = 1; i < P.length; i++) {
      await page.mouse.move(P[i][0], P[i][1], { steps: 2 });
      if (midShot && !midTaken && i === Math.floor(P.length * 0.55)) {
        await page.screenshot({ path: midShot });
        midTaken = true;
      }
    }
    await page.mouse.up();
  }
  await page.waitForTimeout(700); /* debounce + readout animation */
}

async function clearPad(page) {
  await page.locator("#clear").click();
  await page.waitForTimeout(150);
}

const PAGES = [
  ["a", "hero-a-paper-amplified.html"],
  ["b", "hero-b-two-worlds.html"],
  ["c", "hero-c-full-modern.html"],
];
const VIEWPORTS = [
  ["desk", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

/* SwiftShader flags: default headless chromium here ships no WebGL at
   all, which would silently hide B's shader and C's constellation. */
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const report = {};

for (const [tag, file] of PAGES) {
  report[tag] = {};
  for (const [vtag, viewport] of VIEWPORTS) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
    const weights = new Map();
    const errors = [];
    page.on("response", async (r) => {
      try {
        const u = new URL(r.url());
        if (u.origin !== BASE) return;
        weights.set(u.pathname, (await r.body()).length);
      } catch {}
    });
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));

    await page.goto(`${BASE}/${file}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    /* wait for the classifier to be live */
    const live = await page
      .evaluate(() => Promise.race([
        window.__demo.ready.then(() => true),
        new Promise((ok) => setTimeout(() => ok(false), 8000)),
      ]))
      .catch(() => false);
    await page.waitForTimeout(1400); /* entrance choreography settles */
    await page.screenshot({ path: `${OUT}${tag}-${vtag}-1-settled.png` });

    /* draw a three (mid-interaction shot happens mid-stroke) */
    await page.locator("#pad").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await drawStrokes(page, DIGITS.three, { midShot: `${OUT}${tag}-${vtag}-2-midstroke.png` });
    const r3 = await page.evaluate(() => window.__demo.last);
    await page.screenshot({ path: `${OUT}${tag}-${vtag}-3-classified.png` });

    /* clear, then a zero for a second reading */
    await clearPad(page);
    await drawStrokes(page, DIGITS.zero);
    const r0 = await page.evaluate(() => window.__demo.last);

    /* below-the-fold shot on desktop: B's seam, A's work grid, C's list */
    if (vtag === "desk") {
      if (tag === "b") {
        /* the seam itself: paper mid-slide over the night stage */
        await page.evaluate(() => window.scrollTo({ top: innerHeight * 0.55, behavior: "instant" }));
        await page.waitForTimeout(900);
        await page.screenshot({ path: `${OUT}${tag}-${vtag}-5-seam.png` });
      }
      await page.evaluate(() => window.scrollTo({ top: innerHeight * 1.05, behavior: "instant" }));
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${OUT}${tag}-${vtag}-4-scrolled.png` });
    }

    const total = [...weights.values()].reduce((a, b) => a + b, 0);
    report[tag][vtag] = {
      live, three: r3, zero: r0, errors,
      totalKB: +(total / 1024).toFixed(1),
      files: Object.fromEntries(
        [...weights.entries()].map(([k, v]) => [k, +(v / 1024).toFixed(1)])
      ),
    };
    await page.close();
  }
}

await browser.close();
server.close();
console.log(JSON.stringify(report, null, 2));
