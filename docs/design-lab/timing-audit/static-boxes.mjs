// Inventory of INERT surfaces: box-like elements that never arrive, never
// transform, never mutate and never answer the pointer.
// Method: MutationObserver over the whole document during a full scroll sweep
// (catches every scrub* target, which mutate SVG attrs / text / classes),
// + computed transform+opacity sampling, + a stylesheet scan for :hover rules.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const OUT = new URL('./', import.meta.url).pathname;
const URLP = 'http://127.0.0.1:8088/story-the-long-run.html';
const VPS = [{ tag: 'desk', width: 1440, height: 900 }, { tag: 'mob', width: 390, height: 844 }];

const browser = await chromium.launch({ args: ['--use-angle=metal'] });
for (const vp of VPS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(URLP, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // arm the observer BEFORE sweeping
  await page.evaluate(() => {
    window.__mut = new Set();
    const mo = new MutationObserver((recs) => {
      for (const r of recs) {
        let t = r.target.nodeType === 1 ? r.target : r.target.parentElement;
        if (t) window.__mut.add(t);
      }
    });
    mo.observe(document.documentElement, { attributes: true, childList: true, characterData: true, subtree: true });
    window.__raf = (n) => new Promise((res) => { let k = n; const s = () => (--k <= 0 ? res() : requestAnimationFrame(s)); requestAnimationFrame(s); });
  });

  const res = await page.evaluate(async () => {
    const maxY = document.documentElement.scrollHeight - innerHeight;

    // candidate boxes: visible, box-like, non-trivial area
    const isBoxy = (cs) =>
      (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') ||
      cs.boxShadow !== 'none' ||
      ['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(cs['border' + s + 'Width']) > 0) ||
      cs.backgroundImage !== 'none';

    const all = [...document.querySelectorAll('body *')].filter((el) => {
      const tn = el.tagName;
      if (['SCRIPT', 'STYLE', 'TEMPLATE', 'BR', 'DEFS', 'CLIPPATH', 'LINEARGRADIENT', 'STOP', 'TITLE'].includes(tn)) return false;
      if (el.closest('svg') && tn !== 'SVG' && tn !== 'svg') return false; // svg internals handled via their <svg>
      const r = el.getBoundingClientRect();
      if (r.width * r.height < 1200) return false;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      return isBoxy(cs) || el.matches('figure, .plate, .dict, .gzrow, .quests, .litany, .ladder, .gatecard, .schoolrec, .prov, #manifest, #mast, canvas');
    });

    // :hover / :focus / :active rules that match each candidate (or a descendant)
    const hoverSel = [];
    for (const sh of document.styleSheets) {
      let rules; try { rules = sh.cssRules; } catch { continue; }
      const walk = (rs) => {
        for (const r of rs) {
          if (r.cssRules) { walk(r.cssRules); continue; }
          if (!r.selectorText) continue;
          if (/:hover|:focus|:active/.test(r.selectorText)) hoverSel.push(r.selectorText);
        }
      };
      walk(rules);
    }
    const bare = [...new Set(hoverSel.flatMap((s) => s.split(',').map((x) => x.trim())))]
      .filter((s) => /:hover|:focus|:active/.test(s))
      .map((s) => s.replace(/::?(hover|focus|active|focus-visible|focus-within)/g, ''))
      .map((s) => s.trim()).filter(Boolean);
    const matchesHover = (el) => {
      for (const s of bare) {
        try { if (el.matches(s) || el.querySelector(s)) return s; } catch { }
      }
      return null;
    };

    // baseline styles. MOTION (transform/opacity/filter/clip) is choreography.
    // COLOUR is the page-wide day->night arc and is NOT per-element choreography,
    // so it is tracked separately and does not count as "animated".
    const mo_ = (el) => { const cs = getComputedStyle(el); return cs.transform + '|' + cs.opacity + '|' + cs.filter + '|' + cs.clipPath + '|' + cs.width + 'x' + cs.height; };
    const co_ = (el) => { const cs = getComputedStyle(el); return cs.backgroundColor + '|' + cs.color + '|' + cs.borderTopColor; };
    const bm = all.map(mo_), bc = all.map(co_);
    const moved = new Array(all.length).fill(false);
    const recoloured = new Array(all.length).fill(false);

    // full sweep
    for (let y = 0; y <= maxY; y += 24) {
      window.scrollTo(0, y);
      await window.__raf(2);
      for (let i = 0; i < all.length; i++) {
        if (!moved[i] && mo_(all[i]) !== bm[i]) moved[i] = true;
        if (!recoloured[i] && co_(all[i]) !== bc[i]) recoloured[i] = true;
      }
    }
    window.scrollTo(0, 0); await window.__raf(3);

    const M = [...window.__mut];
    const selfMut = (el) => window.__mut.has(el);
    const innerMut = (el) => M.some((m) => m !== el && el.contains(m));

    const desc = (el) => {
      const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).join('.');
      const id = el.id ? '#' + el.id : '';
      return el.tagName.toLowerCase() + id + (cls ? '.' + cls : '');
    };

    window.__cands = all;
    return all.map((el, i) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const fxAnc = el.closest('[data-fx]');
      return {
        sel: desc(el),
        beat: el.closest('.beat') ? Number(el.closest('.beat').dataset.beat) : -1,
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70),
        w: Math.round(r.width), h: Math.round(r.height),
        pageTop: Math.round(r.top + scrollY),
        ownFx: el.hasAttribute('data-fx'),
        fxAncestor: fxAnc && fxAnc !== el ? desc(fxAnc) : null,
        moved: moved[i],
        recoloured: recoloured[i],
        selfMut: selfMut(el),
        innerMut: innerMut(el),
        transition: cs.transitionProperty === 'none' || cs.transitionProperty === 'all' && cs.transitionDuration === '0s' ? null : `${cs.transitionProperty} ${cs.transitionDuration}`,
        animation: cs.animationName === 'none' ? null : `${cs.animationName} ${cs.animationDuration}`,
        hoverRule: matchesHover(el),
        isCanvas: el.tagName === 'CANVAS' || !!el.querySelector('canvas'),
        hasSvg: !!el.querySelector('svg'),
      };
    });
  });

  // ---- REAL POINTER PASS over the exact same candidate set (1:1 join)
  await page.evaluate(() => {
    const PROPS = ['transform', 'opacity', 'backgroundColor', 'color', 'borderTopColor', 'boxShadow', 'filter', 'textDecorationLine', 'fontVariationSettings', 'fill', 'borderBottomColor'];
    window.__snap = (el) => {
      const g = (pe) => { const cs = getComputedStyle(el, pe); return PROPS.map((p) => cs[p]).join('~'); };
      return g(null) + '||' + g('::before') + '||' + g('::after');
    };
  });
  for (let i = 0; i < res.length; i++) {
    await page.evaluate((k) => window.__cands[k].scrollIntoView({ block: 'center', behavior: 'instant' }), i);
    await page.mouse.move(3, 3);
    await page.waitForTimeout(90);
    const before = await page.evaluate((k) => window.__snap(window.__cands[k]), i);
    const box = await page.evaluate((k) => {
      const r = window.__cands[k].getBoundingClientRect();
      return { x: r.x + Math.min(r.width / 2, r.width - 3), y: r.y + Math.min(r.height / 2, 12), ok: r.width > 2 && r.y > 0 && r.y < innerHeight - 2 };
    }, i);
    if (!box.ok) { res[i].hoverResponds = null; continue; }
    await page.mouse.move(box.x, box.y);
    await page.waitForTimeout(450);
    const after = await page.evaluate((k) => window.__snap(window.__cands[k]), i);
    res[i].hoverResponds = before !== after;
    res[i].disabled = await page.evaluate((k) => !!window.__cands[k].disabled, i);
  }
  await page.mouse.move(3, 3);

  writeFileSync(`${OUT}staticboxes-${vp.tag}.json`, JSON.stringify(res, null, 1));
  const inert = res.filter((b) => !b.ownFx && !b.moved && !b.selfMut && !b.innerMut && !b.transition && !b.animation && !b.hoverRule && !b.isCanvas);
  console.log(`[${vp.tag}] candidates ${res.length}  inert ${inert.length}`);
  for (const b of inert) console.log(`   b${String(b.beat).padStart(2)} ${b.sel.padEnd(34)} ${String(b.w).padStart(4)}x${String(b.h).padStart(3)} @${String(b.pageTop).padStart(6)} fxAnc=${b.fxAncestor || '-'} :: ${b.text.slice(0, 46)}`);
  await ctx.close();
}
await browser.close();
console.log('static-box inventory done');
