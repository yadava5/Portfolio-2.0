/* census-hysteresis.mjs — the round-11 instrument.
 *
 * The owner's verdict was about COUPLING, not direction: "moving with
 * the viewer and flowing back as well if we go back … now the diagram
 * animations are just running once, and nothing is flowing backwards."
 * The round-10 census counted which transform channels ever move;
 * this one measures whether they move AS A FUNCTION OF POSITION.
 *
 * Method (the corrected two-pass ladder — the first cut of this probe
 * sampled the down-pass and the up-pass at DIFFERENT scroll positions,
 * matched nothing, and reported a clean zero on both pages; a
 * suspiciously clean null means suspect the instrument): one shared
 * ladder of scroll stops is sampled top-down, then re-sampled
 * bottom-up at the SAME stops. Per element, per stop, we record
 * opacity (×100) and the transform's x/y/scale/rotation. An element
 * that ever changes any channel across the down-pass is "moving"; a
 * moving element whose down and up readings agree at every shared
 * stop (within 8 units) is "scrubbed" — its state is a pure function
 * of scroll position; one that disagrees is "one-shot" (it played and
 * froze, so the up-pass reads settled where the down-pass read
 * entering).
 *
 * Usage:  node tests/playwright/static-server.mjs &   (serves out/)
 *         node docs/design-lab/census-hysteresis.mjs [url]
 *
 * Output: one JSON line per engine — moving / scrubbed / one-shot
 * counts, reverses %, document height (A9), and the worst offenders
 * by disagreement so a regression names its element.
 */
import { chromium, webkit } from "@playwright/test";

const url = process.argv[2] ?? "http://127.0.0.1:3000/";
const STEPS = 40;
/* One tolerance for all channels, in the units recorded (px, opacity
 * ×100, degrees, scale ×100): the brief's own 8-unit threshold. */
const EPS = 8;
/* Settle per stop: the site's scrub lag is 0.7 — a beat under 3× lag
 * lets the catch-up tween land before the frame is read. */
const SETTLE_MS = 1500;

async function census(browserType, name) {
  const browser = await browserType.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(url, { waitUntil: "networkidle" });
  /* Let the hero/nameplate performance finish so load-only motion
     never reads as scroll motion. */
  await page.waitForTimeout(5200);

  await page.evaluate(() => {
    let i = 0;
    for (const el of document.querySelectorAll("body *")) {
      el.setAttribute("data-census", String(i++));
    }
    window.__hyst = { down: new Map(), up: new Map() };
  });

  const docH = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  const maxScroll = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  );
  const ladder = Array.from({ length: STEPS + 1 }, (_, k) =>
    Math.round((maxScroll * k) / STEPS)
  );

  const record = (pass) =>
    page.evaluate((passName) => {
      const st = window.__hyst;
      const frame = new Map();
      for (const el of document.querySelectorAll("[data-census]")) {
        const id = el.getAttribute("data-census");
        const cs = getComputedStyle(el);
        const t = cs.transform;
        const m =
          t && t !== "none"
            ? new DOMMatrixReadOnly(t)
            : new DOMMatrixReadOnly();
        frame.set(id, [
          Math.round(parseFloat(cs.opacity) * 100),
          Math.round(m.m41),
          Math.round(m.m42),
          Math.round(Math.hypot(m.a, m.b) * 100),
          Math.round(((Math.atan2(m.b, m.a) * 180) / Math.PI) * 10) / 10,
        ]);
      }
      st[passName].push(frame);
    }, pass);

  /* Down-pass, then up-pass, along the SAME ladder. */
  await page.evaluate(() => {
    window.__hyst = { down: [], up: [] };
  });
  for (const y of ladder) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(SETTLE_MS);
    await record("down");
  }
  for (const y of [...ladder].reverse()) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(SETTLE_MS);
    await record("up");
  }

  const out = await page.evaluate((eps) => {
    const st = window.__hyst;
    const stops = st.down.length;
    /* Which elements ever move on the way down? */
    const moving = new Set();
    for (const id of st.down[0].keys()) {
      const base = st.down[0].get(id);
      for (let k = 1; k < stops; k++) {
        const rec = st.down[k].get(id);
        if (!rec) continue;
        if (rec.some((v, c) => Math.abs(v - base[c]) > eps)) {
          moving.add(id);
          break;
        }
      }
    }
    /* Of those, which agree between passes at every shared stop?
       up[k] sampled ladder[STEPS - k], so down[k] pairs with
       up[stops - 1 - k]. */
    const offenders = [];
    let scrubbed = 0;
    for (const id of moving) {
      let worst = 0;
      for (let k = 0; k < stops; k++) {
        const a = st.down[k].get(id);
        const b = st.up[stops - 1 - k].get(id);
        if (!a || !b) continue;
        for (let c = 0; c < a.length; c++) {
          worst = Math.max(worst, Math.abs(a[c] - b[c]));
        }
      }
      if (worst <= eps) scrubbed++;
      else {
        const el = document.querySelector(`[data-census="${id}"]`);
        offenders.push({
          worst: Math.round(worst),
          tag: el?.tagName.toLowerCase() ?? "?",
          hint:
            el?.getAttribute("data-tm") ??
            el?.getAttribute("data-tm-bright") ??
            el?.closest("[data-scene],[data-chapter]")?.getAttribute("id") ??
            el?.className?.toString().slice(0, 40) ??
            "",
        });
      }
    }
    offenders.sort((a, b) => b.worst - a.worst);
    return {
      moving: moving.size,
      scrubbed,
      oneShot: moving.size - scrubbed,
      offenders: offenders.slice(0, 10),
    };
  }, EPS);

  await browser.close();
  return { engine: name, docH, ...out };
}

for (const [bt, name] of [
  [chromium, "chromium"],
  [webkit, "webkit"],
]) {
  const r = await census(bt, name);
  console.log(
    JSON.stringify({
      engine: r.engine,
      docHeight: r.docH,
      moving: r.moving,
      scrubbed: r.scrubbed,
      oneShot: r.oneShot,
      reverses: `${Math.round((r.scrubbed / Math.max(1, r.moving)) * 100)}%`,
      offenders: r.offenders,
    })
  );
}
