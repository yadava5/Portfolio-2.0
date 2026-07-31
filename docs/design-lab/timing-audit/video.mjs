// Reading-pace walkthrough video. Same scroll profile as the census clock:
// 750 px/s cruise + 1.6 s pause at each beat's reading anchor
// (beat.top + 0.5*beat.h - 0.62*vh), driven by an in-page rAF loop.
import { chromium } from 'playwright';
import { mkdirSync, renameSync } from 'node:fs';

const OUT = new URL('./video/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const URLP = 'http://127.0.0.1:8088/story-the-long-run.html';
const CRUISE = 750, PAUSE = 1600;

const VPS = [
  { tag: 'desk-1440x900', width: 1440, height: 900 },
  { tag: 'mob-390x844', width: 390, height: 844 },
];

const browser = await chromium.launch({ args: ['--use-angle=metal'] });
for (const vp of VPS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    hasTouch: vp.tag.startsWith('mob'),
    recordVideo: { dir: OUT, size: { width: vp.width, height: vp.height } },
  });
  const page = await ctx.newPage();
  await page.goto(URLP, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // fonts, wasm, first paint at dawn

  const bad = await page.evaluate(() => document.body.classList.contains('settled'));
  if (bad) throw new Error('settled fallback — video would show the static page');

  await page.waitForTimeout(1200); // hold on the title
  const dur = await page.evaluate(async ({ cruise, pause }) => {
    const vh = innerHeight;
    const maxY = document.documentElement.scrollHeight - vh;
    const stops = (window.__world.beats || []).map((b) => Math.max(0, Math.min(maxY, b.top + 0.5 * b.h - 0.62 * vh)))
      .sort((a, b) => a - b);
    const t0 = performance.now();
    let y = 0, next = 0, last = performance.now();
    return await new Promise((done) => {
      const step = (now) => {
        const dt = Math.min(64, now - last); last = now;
        if (next < stops.length && y >= stops[next]) {
          // hold
          const holdUntil = now + pause;
          const hold = (n2) => {
            if (n2 < holdUntil) { requestAnimationFrame(hold); return; }
            next++; last = performance.now(); requestAnimationFrame(step);
          };
          requestAnimationFrame(hold); return;
        }
        y = Math.min(maxY, y + (cruise * dt) / 1000);
        window.scrollTo(0, y);
        if (y >= maxY) { done(+((performance.now() - t0) / 1000).toFixed(1)); return; }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { cruise: CRUISE, pause: PAUSE });

  await page.waitForTimeout(2200); // hold on the gate
  console.log(`[${vp.tag}] scroll pass ${dur}s`);
  const v = page.video();
  await ctx.close();
  const p = await v.path();
  const dest = `${OUT}story-timing-${vp.tag}.webm`;
  renameSync(p, dest);
  console.log(`[${vp.tag}] -> ${dest}`);
}
await browser.close();
console.log('video done');
