/**
 * Watch the ending actually move.
 *
 * Every claim I made about the lamp until now was a claim about resolved end
 * states and keyframe text, because the browser tab I was driving was
 * backgrounded — and Chrome does not advance CSS transitions or animations in
 * a hidden tab. That is not a limitation worth keeping: it means motion could
 * ship that nobody had ever seen.
 *
 * Playwright runs a real, visible page. This walks the ending frame by frame
 * and writes PNGs, so the sway, the filament stutter and the falling light can
 * be looked at rather than asserted.
 *
 *   node docs/design-lab/shoot-lamp.mjs            (expects a server on :8140)
 *   node docs/design-lab/shoot-lamp.mjs http://…   (or point it somewhere)
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:8140/";
const OUT = "output/lamp-shoot";
mkdirSync(OUT, { recursive: true });

const shots = [];
const shoot = async (page, name, clip) => {
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, clip });
  shots.push(name);
  console.log(`  · ${name}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 2,
});
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1200);

/* walk to the bottom the way a reader does, so the engine's own rAF loop runs
   and every entrance resolves — a jump would leave the fx elements pre-hidden */
const docH = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= docH; y += 420) {
  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(45);
}
await page.waitForTimeout(900);

/* 1 · does the final screen actually land on the gate's top? */
const geom = await page.evaluate(() => {
  const g = document.getElementById("gate").getBoundingClientRect();
  const kick = document.querySelector("#gate .kicker").getBoundingClientRect();
  const hour = document.querySelector("#gate .hourline").getBoundingClientRect();
  return {
    scrollY: Math.round(scrollY),
    maxScroll: document.body.scrollHeight - innerHeight,
    gateTop: Math.round(g.top + scrollY),
    gateHeight: Math.round(g.height),
    viewport: innerHeight,
    kickerTopInView: Math.round(kick.top),
    kickerVisible: kick.top >= 0 && kick.bottom <= innerHeight,
    hourVisible: hour.top >= 0 && hour.bottom <= innerHeight,
    kickerText: document.querySelector("#gate .kicker").textContent.trim(),
    hourText: document.querySelector("#gate .hourline").textContent.trim(),
  };
});
console.log("\ngate landing:", JSON.stringify(geom, null, 2));

await shoot(page, "01-gate-before-approve");

/* the card's own box, so the lamp can be seen in detail */
const clip = await page.evaluate(() => {
  const r = document.querySelector(".gatecard").getBoundingClientRect();
  return { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: Math.min(r.width + 20, innerWidth), height: Math.min(r.height + 20, innerHeight) };
});

/* 2 · the reward, sampled across the whole sequence */
await page.click("#approve");
for (const t of [120, 300, 550, 800, 1000, 1200, 1450, 1700, 2000, 2400, 3200]) {
  await page.waitForTimeout(t === 120 ? 120 : 0);
  if (t !== 120) await page.waitForTimeout(0);
  await shoot(page, `02-approve+${String(t).padStart(4, "0")}ms`, await page.evaluate(() => {
    const r = document.querySelector(".gatecard").getBoundingClientRect();
    return { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: Math.min(r.width + 20, innerWidth - r.x + 10), height: Math.min(r.height + 20, innerHeight - r.y + 10) };
  }));
  await page.waitForTimeout(t < 3200 ? 200 : 0);
}

await page.waitForTimeout(1500);
await shoot(page, "03-settled-lamp-on", clip);
await shoot(page, "04-settled-full-screen");

/* 3 · the switch: put it out, and light it again */
await page.click("#lampbtn");
await page.waitForTimeout(160);
await shoot(page, "05-lamp-off+160ms", clip);
await page.waitForTimeout(1400);
await shoot(page, "06-lamp-off-settled", clip);
await page.click("#lampbtn");
for (const t of [140, 380, 700, 1100]) {
  await page.waitForTimeout(t === 140 ? 140 : 240);
  await shoot(page, `07-relit+${String(t).padStart(4, "0")}ms`, clip);
}
await page.waitForTimeout(1600);
await shoot(page, "08-relit-settled", clip);

const state = await page.evaluate(() => ({
  lamp: document.getElementById("endlight").dataset.lamp,
  lit: getComputedStyle(document.getElementById("endquote")).getPropertyValue("--lit").trim(),
  note: document.getElementById("lampnote").textContent,
  litRungs: document.querySelectorAll(".ladder li.lit").length,
  deployLit: document.querySelector('.ladder li[data-ph="11"]').classList.contains("lit"),
}));
console.log("\nfinal state:", JSON.stringify(state));
console.log(`\n${shots.length} frames → ${OUT}/`);
await browser.close();
