/* probe-coupling11.mjs — the round-11 functional walk, before the suites.
 *
 * Five behaviors the conversion must produce, each read directly:
 *  1. HOLD — park a chapter mid-viewport: every entrance target inside
 *     the reading band rests settled (opacity 1, identity transform) —
 *     the round-5 contract (assemble and HOLD).
 *  2. REVERSE — scroll above a settled chapter's window: the same
 *     targets return to their from-states (the owner's ask).
 *  3. RE-ENTER — scroll back down: they settle again (no one-shot
 *     residue, no stranding).
 *  4. LANDING — a fresh `/#work` hash load settles the landed content
 *     (the F01 class, now position-derived).
 *  5. DEPARTURE RETURN — below a departed chapter the wrap is receded;
 *     returning above restores it (already scrubbed; confirmed).
 *
 * Usage:  node tests/playwright/static-server.mjs &
 *         node docs/design-lab/probe-coupling11.mjs [base-url]
 */
import { chromium } from "@playwright/test";

const base = (process.argv[2] ?? "http://127.0.0.1:3000/").replace(/\/$/, "");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(5200);

const readBand = (sel) =>
  page.evaluate((selector) => {
    const out = [];
    for (const el of document.querySelectorAll(selector)) {
      const r = el.getBoundingClientRect();
      if (r.height === 0) continue;
      /* the reading band: fully inside 15%–70% of the viewport */
      if (r.top < innerHeight * 0.15 || r.bottom > innerHeight * 0.7) continue;
      const cs = getComputedStyle(el);
      const t = cs.transform;
      const m =
        t && t !== "none" ? new DOMMatrixReadOnly(t) : new DOMMatrixReadOnly();
      out.push({
        text: (el.textContent ?? "").trim().slice(0, 28),
        opacity: Math.round(parseFloat(cs.opacity) * 100) / 100,
        dx: Math.round(m.m41),
        dy: Math.round(m.m42),
        s: Math.round(Math.hypot(m.a, m.b) * 1000) / 1000,
      });
    }
    return out;
  }, sel);

const TM = "[data-tm], [data-tm-bright]";

/* 1 · HOLD — park chapter 03 mid-viewport */
await page.evaluate(() => {
  const el = document.querySelector("#path");
  window.scrollTo(0, scrollY + el.getBoundingClientRect().top - 200);
});
await page.waitForTimeout(2000);
const held = await readBand(TM);
const heldBad = held.filter(
  (r) => r.opacity < 1 || Math.abs(r.dx) > 0.5 || Math.abs(r.dy) > 0.5 || Math.abs(r.s - 1) > 0.002
);
console.log(
  JSON.stringify({ probe: "hold", inBand: held.length, unsettled: heldBad })
);

/* 2 · REVERSE — go back above ch03's window, read ch03's targets */
const ch3Targets = () =>
  page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll(
      "#path [data-tm], #path [data-tm-bright] div"
    )) {
      const cs = getComputedStyle(el);
      const t = cs.transform;
      const m =
        t && t !== "none" ? new DOMMatrixReadOnly(t) : new DOMMatrixReadOnly();
      out.push({
        opacity: Math.round(parseFloat(cs.opacity) * 100) / 100,
        dx: Math.round(m.m41),
        dy: Math.round(m.m42),
      });
    }
    return out;
  });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(2000);
const reversed = await ch3Targets();
const returnedToFrom = reversed.filter(
  (r) => r.opacity === 0 || Math.abs(r.dx) > 5 || Math.abs(r.dy) > 5
).length;
console.log(
  JSON.stringify({
    probe: "reverse",
    targets: reversed.length,
    inFromState: returnedToFrom,
  })
);

/* 3 · RE-ENTER — back down; the reading band settles again (the same
   band read as probe 1: content still below the fold legitimately
   holds its from-state — that is the coupling, not a stranding) */
await page.evaluate(() => {
  const el = document.querySelector("#path");
  window.scrollTo(0, scrollY + el.getBoundingClientRect().top - 200);
});
await page.waitForTimeout(2000);
const reentered = await readBand(TM);
const reBad = reentered.filter(
  (r) => r.opacity < 1 || Math.abs(r.dx) > 0.5 || Math.abs(r.dy) > 0.5
);
console.log(
  JSON.stringify({
    probe: "re-enter",
    inBand: reentered.length,
    unsettled: reBad,
  })
);

/* 4 · LANDING — a fresh /#work load settles what it lands on */
const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page2.goto(base + "/#work", { waitUntil: "networkidle" });
await page2.waitForTimeout(4000);
const landed = await page2.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll(
    "#work [data-tm], #work [data-tm-bright]"
  )) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight * 0.7 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    out.push(Math.round(parseFloat(cs.opacity) * 100) / 100);
  }
  return out;
});
console.log(
  JSON.stringify({
    probe: "landing",
    visibleTargets: landed.length,
    stranded: landed.filter((o) => o < 0.99).length,
  })
);
await page2.close();

/* 5 · DEPARTURE — below ch02 the wrap recedes; above, it returns */
const departState = () =>
  page.evaluate(() => {
    const wrap = document.querySelector("#who [data-tm-depart]");
    const t = getComputedStyle(wrap).transform;
    const m =
      t && t !== "none" ? new DOMMatrixReadOnly(t) : new DOMMatrixReadOnly();
    return { dy: Math.round(m.m42 * 10) / 10, s: Math.round(Math.hypot(m.a, m.b) * 1000) / 1000 };
  });
await page.evaluate(() => {
  const el = document.querySelector("#who");
  window.scrollTo(0, scrollY + el.getBoundingClientRect().bottom - innerHeight * 0.05);
});
await page.waitForTimeout(2000);
const departed = await departState();
await page.evaluate(() => {
  const el = document.querySelector("#who");
  window.scrollTo(0, scrollY + el.getBoundingClientRect().top - 300);
});
await page.waitForTimeout(2000);
const returned = await departState();
console.log(JSON.stringify({ probe: "departure", departed, returned }));

await browser.close();
