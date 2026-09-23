/* shoot-at.mjs <url> <w> <h> <outfile> <y>  — settle nameplate, scroll to y, shoot */
import { chromium } from '/Users/ayush/Documents/Projects/Portfolio-2.0/node_modules/@playwright/test/index.mjs';
const [url, W, H, out, Y] = process.argv.slice(2);
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 })).newPage();
await p.goto(url, { waitUntil: 'load' }); await p.waitForSelector('html[data-np-ready]', { timeout: 15000 }).catch(() => {});
await p.waitForTimeout(600);
// walk down in steps so the engine settles like a reader's scroll
for (let y = 0; y <= +Y; y += 491) { await p.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), y); await p.waitForTimeout(60); }
await p.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), +Y); await p.waitForTimeout(900);
await p.screenshot({ path: out, type: 'jpeg', quality: 80 }); await b.close(); console.log('ok', out);
