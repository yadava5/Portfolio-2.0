/**
 * The departure, measured.
 *
 * Three claims, and the third is the one every earlier version failed:
 *
 *   1. THEY LEAVE THE GATE. The first birds are airborne within a few hundred
 *      pixels of the thread's own dock — not drifting in from off-screen.
 *   2. THEY CARRY YOU. Birds are in the air for the whole of the 7s carry from
 *      ¶12 to ¶13, so the crossing spans the transition rather than decorating
 *      one side of it.
 *   3. THEY ARE NOT A MACHINE — read as the coefficient of variation of
 *      nearest-neighbour distance. A formation with welded slots, or a queue
 *      on one shared path, holds its gaps and reads near zero. Birds do not.
 *
 * Positions are read as real bounding boxes at absolute offsets from the
 * click, because screenshots cost enough that a waitForTimeout loop drifts.
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:8140/";
const SHOTS = [600, 1800, 3200, 5000, 7000, 9500, 13000];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(600);

const docH = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= docH; y += 460) { await page.mouse.wheel(0, 460); await page.waitForTimeout(20); }
await page.waitForTimeout(600);

const dock = await page.evaluate(() => {
  const r = document.getElementById("gateDock").getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});

await page.evaluate(() => { window.__t0 = performance.now(); });
await page.click("#approve");

const read = (ms) => page.evaluate(async (t) => {
  await new Promise((res) => {
    const tick = () => (performance.now() - window.__t0 >= t ? res() : requestAnimationFrame(tick));
    tick();
  });
  const seen = [];
  let overText = 0;
  const texts = [...document.querySelectorAll(".bdawn .endquote, .bdawn .kicker, .bdawn .dawnlede, .bdawn p, #gate .kicker, #gate h2")]
    .map((n) => n.getBoundingClientRect())
    .filter((r) => r.width && r.bottom > 0 && r.top < innerHeight);
  /* the .bird div is 0x0 — it is a point on the offset-path, and the
     silhouette is the SVG inside it overflowing on a negative margin. Measure
     THAT: reading the div gives every overlap test a zero-area box, which
     reports "clear of the type" no matter where the bird actually is. */
  for (const b of document.querySelectorAll(".bird")) {
    if (+getComputedStyle(b).opacity < 0.04) continue;
    const g = b.querySelector("svg");
    if (!g) continue;
    const r = g.getBoundingClientRect();
    if (r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) continue;
    seen.push({ x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width) });
    if (texts.some((t) => r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top)) overText++;
  }
  return { seen, overText, scrollY: Math.round(scrollY), carried: document.body.classList.contains("approved") };
}, ms);

const frames = [];
for (const ms of SHOTS) frames.push({ ms, ...(await read(ms)) });

/* nearest-neighbour spacing, and how uneven it is */
const spacing = (pts) => {
  if (pts.length < 3) return null;
  const nn = pts.map((a, i) => Math.min(...pts.filter((_, j) => j !== i)
    .map((b) => Math.hypot(a.x - b.x, a.y - b.y))));
  const m = nn.reduce((s, v) => s + v, 0) / nn.length;
  const sd = Math.sqrt(nn.reduce((s, v) => s + (v - m) ** 2, 0) / nn.length);
  return { mean: Math.round(m), cv: +(sd / m).toFixed(2) };
};

console.table(frames.map((f) => {
  const sp = spacing(f.seen);
  const xs = f.seen.map((p) => p.x), ys = f.seen.map((p) => p.y);
  return {
    "t (ms)": f.ms, birds: f.seen.length, scrollY: f.scrollY,
    "spread x": f.seen.length ? `${Math.min(...xs)}–${Math.max(...xs)}` : "—",
    "spread y": f.seen.length ? `${Math.min(...ys)}–${Math.max(...ys)}` : "—",
    "nn gap": sp ? sp.mean : "—", "gap CV": sp ? sp.cv : "—",
    widest: f.seen.length ? Math.max(...f.seen.map((p) => p.w)) : "—",
    "over text": f.overText,
  };
}));

const mid = frames.find((f) => f.ms === 7000);

/* launch proximity: the earliest frame's birds against the dock */
const launch = frames.find((f) => f.seen.length);
const nearDock = launch
  ? Math.round(Math.min(...launch.seen.map((p) => Math.hypot(p.x - dock.x, p.y - dock.y))))
  : Infinity;

const airborneThroughCarry = frames
  .filter((f) => f.ms >= 1800 && f.ms <= 9500)
  .every((f) => f.seen.length >= 3);

const cv = spacing(mid?.seen ?? [])?.cv ?? 0;

/* mid-flight they may pass BEHIND the type — they are on a layer under it, and
   a flock that detours around a paragraph is a flock on rails. What must hold
   is that they are clear of it by the time the page stops and the reader
   actually starts reading. */
const settled = frames.filter((f) => f.ms >= 9500).every((f) => f.overText === 0);
const ok = nearDock < 340 && airborneThroughCarry && cv >= 0.3 && settled && errs.length === 0;
console.log(`\ndock at ${dock.x},${dock.y} · nearest bird at launch: ${nearDock}px`);
console.log(`airborne through the whole carry: ${airborneThroughCarry ? "✓" : "✗"}`);
console.log(`spacing unevenness at mid-flight (CV): ${cv}  ${cv >= 0.3 ? "✓ not a formation" : "✗ too regular"}`);
console.log(`clear of the type once the page settles: ${settled ? "✓" : "✗"}`);
console.log(`peak birds on screen: ${Math.max(...frames.map((f) => f.seen.length))}`);
console.log(`page errors: ${errs.length}`);
if (errs.length) console.log(errs.slice(0, 3));
console.log(ok ? "\n✓ they leave the gate, they carry the reader across, and they are not a formation"
               : "\n✗ see above");
await browser.close();
process.exit(ok ? 0 : 1);
