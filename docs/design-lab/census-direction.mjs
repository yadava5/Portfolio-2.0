/* census-direction.mjs — the round-10 instrument.
 *
 * The owner's verdict was directional: "there's no left, right, top,
 * bottom". The parent round measured the live site at translateX: 0,
 * scale: 4, rotate: 1, translateZ: 0 against the round-6 prototype's
 * 43 / 61 / 19 / 8 — density was the wrong instrument, direction the
 * right one. This script IS that instrument, kept re-runnable: it
 * scrolls the built page step by step and counts, per transform
 * component, how many elements EVER change it.
 *
 * Usage:  node tests/playwright/static-server.mjs &  (or any server on
 *         PORT/3000 serving the export)
 *         node docs/design-lab/census-direction.mjs [url]
 *
 * Output: one JSON line per engine — counts of elements whose
 * translateX / translateY / scale / rotation / translateZ ever change
 * across the scroll, plus document height (A9) and per-step density.
 */
import { chromium, webkit } from "@playwright/test";

const url = process.argv[2] ?? "http://127.0.0.1:3000/";
const STEPS = 48;
const EPS = { t: 0.5, s: 0.002, r: 0.1, z: 0.01 };

async function census(browserType, name) {
  const browser = await browserType.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(url, { waitUntil: "networkidle" });
  /* let the hero/nameplate performance finish so load-only motion does
     not read as scroll motion */
  await page.waitForTimeout(5200);

  await page.evaluate(() => {
    let i = 0;
    for (const el of document.querySelectorAll("body *")) {
      el.setAttribute("data-census", String(i++));
      /* macro = page-level storytelling elements (headlines, lines,
         figures, wrappers) as opposed to a scene's internal ink beads
         and tokens — the owner's complaint is about the former. */
      const r = el.getBoundingClientRect();
      if (r.width >= 120 && r.height >= 18) el.setAttribute("data-census-macro", "");
    }
    window.__census = { base: new Map(), moved: new Map(), density: [] };
  });

  const docH = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  const maxScroll = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  );

  for (let k = 0; k <= STEPS; k++) {
    const y = Math.round((maxScroll * k) / STEPS);
    await page.evaluate((top) => window.scrollTo(0, top), y);
    /* scrub lag (0.7) needs a beat to settle before the frame is read */
    await page.waitForTimeout(320);
    await page.evaluate((eps) => {
      const st = window.__census;
      let moving = 0;
      for (const el of document.querySelectorAll("[data-census]")) {
        const id = el.getAttribute("data-census");
        const t = getComputedStyle(el).transform;
        const m =
          t && t !== "none" ? new DOMMatrixReadOnly(t) : new DOMMatrixReadOnly();
        const rec = {
          x: m.m41,
          y: m.m42,
          z: m.m43,
          s: Math.hypot(m.a, m.b),
          r: (Math.atan2(m.b, m.a) * 180) / Math.PI,
        };
        const base = st.base.get(id);
        if (!base) {
          st.base.set(id, rec);
          continue;
        }
        const moved = st.moved.get(id) ?? {
          x: false,
          y: false,
          z: false,
          s: false,
          r: false,
        };
        let any = false;
        if (Math.abs(rec.x - base.x) > eps.t) (moved.x = true), (any = true);
        if (Math.abs(rec.y - base.y) > eps.t) (moved.y = true), (any = true);
        if (Math.abs(rec.z - base.z) > eps.z) (moved.z = true), (any = true);
        if (Math.abs(rec.s - base.s) > eps.s) (moved.s = true), (any = true);
        if (Math.abs(rec.r - base.r) > eps.r) (moved.r = true), (any = true);
        if (any) st.moved.set(id, moved);
        if (any) moving++;
      }
      st.density.push(moving);
    }, EPS);
  }

  const out = await page.evaluate(() => {
    const st = window.__census;
    const counts = { x: 0, y: 0, z: 0, s: 0, r: 0 };
    const macro = { x: 0, y: 0, z: 0, s: 0, r: 0 };
    for (const [id, moved] of st.moved.entries()) {
      const el = document.querySelector(`[data-census="${id}"]`);
      const isMacro = el?.hasAttribute("data-census-macro");
      for (const k of Object.keys(counts)) {
        if (moved[k]) {
          counts[k]++;
          if (isMacro) macro[k]++;
        }
      }
    }
    const density =
      st.density.reduce((a, b) => a + b, 0) / (st.density.length || 1);
    return { counts, macro, density: Math.round(density * 10) / 10 };
  });

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
      all: {
        translateX: r.counts.x,
        translateY: r.counts.y,
        scale: r.counts.s,
        rotate: r.counts.r,
        translateZ: r.counts.z,
      },
      macro: {
        translateX: r.macro.x,
        translateY: r.macro.y,
        scale: r.macro.s,
        rotate: r.macro.r,
        translateZ: r.macro.z,
      },
      movingPerStep: r.density,
    })
  );
}
