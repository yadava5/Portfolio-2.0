// Timing census for story-the-long-run.html
// Empirical stepped sweep + bisection on rendered opacity, plus analytic spec read
// from window.__fx AFTER boot() (so the data-fx-sync dusk rewrites are visible).
// Read-only w.r.t. the prototype.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('./', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const URLP = 'http://127.0.0.1:8088/story-the-long-run.html';

const VPS = [
  { tag: 'desk', width: 1440, height: 900 },
  { tag: 'mob', width: 390, height: 844 },
];

const COARSE = Number(process.env.COARSE || 16);
const BISECT = Number(process.env.BISECT || 6);

const browser = await chromium.launch({ args: ['--use-angle=metal'] });

for (const vp of VPS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: vp.tag === 'mob',
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  const errors = [], failed = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => failed.push(r.url() + ' :: ' + (r.failure()?.errorText || '')));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto(URLP, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // ---- integrity assertions: the "settled" fallback would make every opacity 1
  const health = await page.evaluate(() => ({
    settled: document.body.classList.contains('settled'),
    rm: matchMedia('(prefers-reduced-motion: reduce)').matches,
    fxCount: (window.__fx || []).length,
    hasGL: !!window.__hasGL,
    docH: document.documentElement.scrollHeight,
    vh: innerHeight, vw: innerWidth,
    beats: (window.__world.beats || []).length,
  }));
  if (health.settled) throw new Error('page fell back to .settled — opacities are all 1, census invalid');
  if (health.rm) throw new Error('reduced-motion is on — engine is in still mode');
  if (!health.fxCount) throw new Error('no __fx elements');

  // ---- analytic spec + labels, read after boot/cacheGeometry
  const spec = await page.evaluate(() => {
    const label = (el) => {
      const tag = el.tagName.toLowerCase();
      const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
      return tag + (cls ? '.' + cls : '');
    };
    const beatOf = (el) => {
      const b = el.closest('.beat');
      return b ? Number(b.dataset.beat) : -1;
    };
    return window.__fx.map((f, i) => {
      const el = f.el;
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 68);
      return {
        i, label: label(el), beat: beatOf(el), text: txt,
        decl: el.dataset.fx, sync: el.dataset.fxSync || null,
        top: f.top, h: f.h,
        specIn: f.spec.in, specOut: f.spec.out, drift: f.spec.drift,
      };
    });
  });

  const world = await page.evaluate(() => ({
    beats: window.__world.beats,
    docH: document.documentElement.scrollHeight,
    vh: innerHeight, vw: innerWidth,
    maxY: document.documentElement.scrollHeight - innerHeight,
  }));

  // ---- helper installed in page: jump + settle + read all opacities/rects
  await page.evaluate(() => {
    window.__raf = (n) => new Promise((res) => {
      let k = n;
      const step = () => (--k <= 0 ? res() : requestAnimationFrame(step));
      requestAnimationFrame(step);
    });
    window.__probeEls = window.__fx.map((f) => f.el);
    window.__readAll = () => {
      const out = new Float64Array(window.__probeEls.length * 3);
      for (let i = 0; i < window.__probeEls.length; i++) {
        const el = window.__probeEls[i];
        const r = el.getBoundingClientRect();
        out[i * 3] = parseFloat(getComputedStyle(el).opacity);
        out[i * 3 + 1] = r.top;
        out[i * 3 + 2] = r.bottom;
      }
      return Array.from(out);
    };
    window.__at = async (y, frames = 2) => {
      window.scrollTo(0, y);
      await window.__raf(frames);
      return window.__readAll();
    };
  });

  // ---- COARSE SWEEP (whole in-page loop, one round trip)
  console.log(`[${vp.tag}] coarse sweep, step ${COARSE}px, maxY ${world.maxY}`);
  const coarse = await page.evaluate(async ({ step }) => {
    const maxY = document.documentElement.scrollHeight - innerHeight;
    const n = window.__probeEls.length;
    const ys = [];
    const ops = [];       // ys.length x n, quantised opacity
    const activity = [];  // per-step: sum |dop|, #inTransition, beat, beatP
    let prev = null;
    for (let y = 0; y <= maxY; y += step) {
      const rec = await window.__at(y, 2);
      const o = new Array(n);
      for (let i = 0; i < n; i++) o[i] = rec[i * 3];
      let d = 0, trans = 0, vis = 0;
      for (let i = 0; i < n; i++) {
        if (prev) d += Math.abs(o[i] - prev[i]);
        if (o[i] > 0.02 && o[i] < 0.98) trans++;
        if (o[i] > 0.02) vis++;
      }
      ys.push(y); ops.push(o);
      activity.push({ y, d: +d.toFixed(3), trans, vis, beat: window.__world.beat, beatP: window.__world.beatP });
      prev = o;
    }
    // final exact bottom
    if (ys[ys.length - 1] !== maxY) {
      const rec = await window.__at(maxY, 2);
      const o = new Array(n); for (let i = 0; i < n; i++) o[i] = rec[i * 3];
      ys.push(maxY); ops.push(o);
      activity.push({ y: maxY, d: 0, trans: 0, vis: 0, beat: window.__world.beat, beatP: window.__world.beatP });
    }
    return { ys, ops, activity, maxY };
  }, { step: COARSE });

  // ---- find threshold-crossing brackets from the coarse grid
  const THRESH = [0.02, 0.5, 0.98];
  const brackets = []; // {el, thr, dir, lo, hi}
  const n = spec.length;
  for (let i = 0; i < n; i++) {
    for (let k = 1; k < coarse.ys.length; k++) {
      const a = coarse.ops[k - 1][i], b = coarse.ops[k][i];
      for (const t of THRESH) {
        if (a < t && b >= t) brackets.push({ el: i, thr: t, dir: 'up', lo: coarse.ys[k - 1], hi: coarse.ys[k] });
        else if (a >= t && b < t) brackets.push({ el: i, thr: t, dir: 'down', lo: coarse.ys[k - 1], hi: coarse.ys[k] });
      }
    }
  }
  console.log(`[${vp.tag}] ${brackets.length} threshold brackets -> bisecting ${BISECT} iters`);

  // ---- BISECTION, in page, one round trip
  const refined = await page.evaluate(async ({ brackets, iters }) => {
    const res = [];
    for (const br of brackets) {
      let lo = br.lo, hi = br.hi;
      for (let it = 0; it < iters; it++) {
        const mid = (lo + hi) / 2;
        const rec = await window.__at(Math.round(mid * 100) / 100, 2);
        const v = rec[br.el * 3];
        const cross = br.dir === 'up' ? v >= br.thr : v < br.thr;
        if (cross) hi = mid; else lo = mid;
      }
      const rec = await window.__at(Math.round(hi * 100) / 100, 2);
      res.push({
        el: br.el, thr: br.thr, dir: br.dir,
        y: +hi.toFixed(2),
        op: rec[br.el * 3],
        rectTop: +rec[br.el * 3 + 1].toFixed(1),
        rectBot: +rec[br.el * 3 + 2].toFixed(1),
      });
    }
    return res;
  }, { brackets, iters: BISECT });

  // ---- peak opacity + where
  const peaks = spec.map((s, i) => {
    let best = -1, by = 0;
    for (let k = 0; k < coarse.ys.length; k++) {
      if (coarse.ops[k][i] > best) { best = coarse.ops[k][i]; by = coarse.ys[k]; }
    }
    return { i, peak: best, peakY: by };
  });

  const payload = {
    vp, health, world, spec, refined, peaks,
    activity: coarse.activity, coarseStep: COARSE, bisectIters: BISECT,
    errors, failed,
  };
  writeFileSync(`${OUT}census-${vp.tag}.json`, JSON.stringify(payload));
  // opacity matrix separately (large)
  writeFileSync(`${OUT}opgrid-${vp.tag}.json`, JSON.stringify({ ys: coarse.ys, ops: coarse.ops }));
  console.log(`[${vp.tag}] wrote census. errors=${errors.length} failedReq=${failed.length}`);
  await ctx.close();
}
await browser.close();
console.log('census done');
