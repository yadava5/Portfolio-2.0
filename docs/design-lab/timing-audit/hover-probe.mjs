// Real pointer test: hover each inert candidate (and every button/link/chip)
// with a real mouse move and diff computed styles incl. ::before/::after.
// This replaces the stylesheet-inference in static-boxes.mjs, which under-reported.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('./', import.meta.url).pathname;
const URLP = 'http://127.0.0.1:8088/story-the-long-run.html';
const tag = process.argv[2] || 'desk';
const VP = tag === 'mob' ? { width: 390, height: 844 } : { width: 1440, height: 900 };

const boxes = JSON.parse(readFileSync(`${OUT}staticboxes-${tag}.json`, 'utf8'));
const inertSel = boxes.filter((b) => !b.ownFx && !b.moved && !b.selfMut && !b.innerMut && !b.transition && !b.animation && !b.isCanvas);

const browser = await chromium.launch({ args: ['--use-angle=metal'] });
const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
await page.goto(URLP, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

await page.evaluate(() => {
  window.__raf = (n) => new Promise((r) => { let k = n; const s = () => (--k <= 0 ? r() : requestAnimationFrame(s)); requestAnimationFrame(s); });
  const PROPS = ['transform', 'opacity', 'backgroundColor', 'color', 'borderTopColor', 'boxShadow', 'filter', 'textDecorationLine', 'fontVariationSettings', 'fill'];
  window.__snap = (el) => {
    const g = (pe) => { const cs = getComputedStyle(el, pe); return PROPS.map((p) => cs[p]).join('~'); };
    return g(null) + '||' + g('::before') + '||' + g('::after');
  };
  // build the candidate list: every inert box + every interactive-looking thing
  window.__cands = [...document.querySelectorAll('body *')].filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width * r.height < 400) return false;
    if (getComputedStyle(el).display === 'none') return false;
    return el.matches('button, a, .chip, .btn, li, .srow, .mline, .q, .ghead, .gclose, header, figure, .plate, .dict, .gzrow, .quests, .litany, .ladder, .gatecard, .schoolrec, #grain, .prov, .handoff');
  });
});

const cands = await page.evaluate(() => window.__cands.map((el, i) => {
  const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).join('.');
  const r = el.getBoundingClientRect();
  return {
    i, sel: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls ? '.' + cls : ''),
    beat: el.closest('.beat') ? Number(el.closest('.beat').dataset.beat) : -1,
    text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 56),
    pageTop: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height),
    ownFx: el.hasAttribute('data-fx'),
    fxAnc: !!el.closest('[data-fx]'),
    cursor: getComputedStyle(el).cursor,
  };
}));

const results = [];
for (const c of cands) {
  // bring it into view, park the mouse far away, snapshot, then hover
  const geo = await page.evaluate((i) => {
    const el = window.__cands[i];
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    return null;
  }, c.i);
  await page.mouse.move(2, 2);
  await page.waitForTimeout(120);
  const before = await page.evaluate((i) => window.__snap(window.__cands[i]), c.i);
  const box = await page.evaluate((i) => {
    const r = window.__cands[i].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + Math.min(r.height / 2, 14) , ok: r.width > 0 && r.y > 0 && r.y < innerHeight };
  }, c.i);
  if (!box.ok) { results.push({ ...c, hoverChanges: null, note: 'could not place pointer' }); continue; }
  await page.mouse.move(box.x, box.y);
  await page.waitForTimeout(500); // let any transition finish
  const after = await page.evaluate((i) => window.__snap(window.__cands[i]), c.i);
  results.push({ ...c, hoverChanges: before !== after, before, after });
}
await page.mouse.move(2, 2);

writeFileSync(`${OUT}hover-${tag}.json`, JSON.stringify(results, null, 1));
const dead = results.filter((r) => r.hoverChanges === false);
console.log(`[${tag}] tested ${results.length}; respond to hover: ${results.filter((r) => r.hoverChanges).length}; INERT to pointer: ${dead.length}; unreachable: ${results.filter((r) => r.hoverChanges === null).length}`);
await browser.close();
