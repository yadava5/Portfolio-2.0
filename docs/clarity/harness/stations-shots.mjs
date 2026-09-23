/* stations-shots.mjs <url> <label> <w> <h> <mobile> <outdir>
   One screenshot per station: scroll so the station's kicker sits ~22% down, settle, shoot.
   Waits for the nameplate to finish (html[data-np-ready]) before anything. */
import { chromium } from '../../../node_modules/@playwright/test/index.mjs';
import { mkdirSync } from 'node:fs';
const [url, label, W, H, MOB, dir] = process.argv.slice(2);
const mobile = MOB === '1';
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load' });
await page.waitForSelector('html[data-np-ready]', { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(800);
await page.screenshot({ path: `${dir}/${label}-00-top.jpg`, type: 'jpeg', quality: 80 });
const tops = await page.evaluate(() => [...document.querySelectorAll('main > section')].map((s) => {
  const k = s.querySelector('.kicker'); const r = (k || s).getBoundingClientRect();
  return { id: s.id, y: r.top + scrollY };
}));
let i = 1;
for (const t of tops) {
  if (t.id === 'nextmorning' || t.id === 'start') continue;
  await page.evaluate((y) => window.scrollTo({ top: Math.max(0, y - innerHeight * 0.22), behavior: 'instant' }), t.y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}/${label}-${String(i++).padStart(2, '0')}-${t.id}.jpg`, type: 'jpeg', quality: 80 });
}
await browser.close();
console.log('done', label, i - 1);
