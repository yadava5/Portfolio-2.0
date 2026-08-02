/**
 * The dusk corridor, and whether anything is on screen while it crosses.
 *
 * ¶08's dusk chain is: entrances → a shared corridor at op 1 → ONE shared
 * curtain that takes every dusk element to 0 → the sky darkens → the closing
 * line arrives after the flip. Between the curtain and that line the station
 * is deliberately empty, and on a laptop that is invisible because a
 * neighbouring station is always in frame. On a phone ¶08 is 2418px against a
 * 664px viewport, so the corridor is isolated and the reader gets half a
 * screen of bare rail.
 *
 * Emits a per-position ink census. Used two ways: to prove the phone's blank
 * is gone, and to prove the laptop's is byte-identical to before.
 */
import { webkit, devices } from "@playwright/test";
const BASE = process.argv[2] ?? "http://localhost:8142/";
const b = await webkit.launch();
const out = {};
for (const [label, opts] of [
  ["iPhone", { ...devices["iPhone 14"] }],
  ["1440x900", { viewport: { width: 1440, height: 900 } }],
  ["1280x800", { viewport: { width: 1280, height: 800 } }],
]) {
  const p = await b.newPage(opts);
  await p.goto(BASE, { waitUntil: "load" });
  await p.waitForTimeout(900);
  const vh = await p.evaluate(() => innerHeight);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const rows = [];
  for (let y = 0; y <= H - vh; y += Math.round(vh * 0.25)) {
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(60);
    rows.push(
      await p.evaluate(() => {
        let ink = 0;
        for (const el of document.querySelectorAll(
          "[data-fx], .kicker, h2, h3, p, figure, .quests, .ladder"
        )) {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight || r.width < 2 || r.height < 2) continue;
          if (+getComputedStyle(el).opacity > 0.08) ink++;
        }
        return ink;
      })
    );
  }
  const blanks = rows.filter((n) => n === 0).length;
  const beats = await p.evaluate(() =>
    [...document.querySelectorAll("[data-beat]")].map((e) => Math.round(e.getBoundingClientRect().height))
  );
  out[label] = { vh, docH: H, blanks, ink: rows, beats };
  console.log(
    `${label.padEnd(9)} vh=${vh} docH=${H}  positions with NOTHING on screen: ${blanks}` +
      (blanks ? `  ← ${(blanks * vh * 0.25 / vh).toFixed(2)} screens` : "  ✓")
  );
  await p.close();
}
await b.close();
console.log(JSON.stringify(out));
