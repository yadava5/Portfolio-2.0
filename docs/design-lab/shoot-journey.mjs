// Journey audit shoot: homepage depths + three case-study pages, desktop + mobile.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./shots-journey/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:3000';

const viewports = [
  { tag: 'desk', width: 1440, height: 900 },
  { tag: 'mob', width: 390, height: 844 },
];

async function settle(page, ms = 1400) {
  await page.waitForTimeout(ms);
}

async function scrollToFrac(page, frac) {
  await page.evaluate((f) => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: h * f, behavior: 'instant' });
  }, frac);
  await settle(page, 1600); // let scroll-driven motion/ink settle
}

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.tag === 'mob',
    hasTouch: vp.tag === 'mob',
  });
  const page = await ctx.newPage();

  // --- homepage: top + 3 depths
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await settle(page, 2500);
  await page.screenshot({ path: `${OUT}v-${vp.tag}-home-0-top.png` });
  for (const [i, frac] of [0.3, 0.6, 0.9].entries()) {
    await scrollToFrac(page, frac);
    await page.screenshot({ path: `${OUT}v-${vp.tag}-home-${i + 1}-d${Math.round(frac * 100)}.png` });
  }

  // --- case pages: top + one scroll
  for (const slug of ['automl', 'jobtracker', 'fast-mnist-nn']) {
    await page.goto(`${BASE}/projects/${slug}/`, { waitUntil: 'networkidle' });
    await settle(page, 2000);
    await page.screenshot({ path: `${OUT}v-${vp.tag}-case-${slug}-top.png` });
    await scrollToFrac(page, 0.5);
    await page.screenshot({ path: `${OUT}v-${vp.tag}-case-${slug}-mid.png` });
  }
  await ctx.close();
}
await browser.close();
console.log('done');
