/* sweep.mjs <label> <w> <h> <mobile:0|1>
   One fresh context per viewport. Steps the page with scrollTo, waits 700ms,
   dumps every text node in the viewport with effective opacity, font bucket,
   effective px, page rect, plus the manifest rect and the #thread canvas ink. */
import { chromium } from '/Users/ayush/Documents/Projects/Portfolio-2.0/node_modules/@playwright/test/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const [label, W, H, MOB] = process.argv.slice(2);
const w = +W, h = +H, mobile = MOB === '1';
const DIR = process.env.OUT;
mkdirSync(`${DIR}/shots/${label}`, { recursive: true });

const COLLECT = () => {
  const scaleOf = (el) => {
    let s = 1, n = el;
    while (n && n.nodeType === 1) {
      const t = getComputedStyle(n).transform;
      if (t && t !== 'none') {
        const m = t.match(/matrix\(([^)]+)\)/);
        if (m) { const p = m[1].split(',').map(Number); s *= Math.hypot(p[0], p[1]); }
      }
      n = n.parentElement;
    }
    return s;
  };
  const effOpacity = (el) => {
    let o = 1, n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      const v = parseFloat(cs.opacity);
      if (!Number.isNaN(v)) o *= v;
      n = n.parentElement || (n.parentNode && n.parentNode.host) || null;
    }
    return o;
  };
  const clippedBy = (el, r) => {
    let n = el.parentElement;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.overflow !== 'visible' && cs.overflowY !== 'visible') {
        const nr = n.getBoundingClientRect();
        if (nr.height < 1 || r.bottom < nr.top - 1 || r.top > nr.bottom + 1) return true;
      }
      n = n.parentElement;
    }
    return false;
  };
  const sel = (el) => {
    const parts = [];
    let n = el;
    while (n && n.nodeType === 1 && parts.length < 5) {
      let p = n.tagName.toLowerCase();
      if (n.id) { parts.unshift('#' + n.id); break; }
      if (n.classList.length) p += '.' + [...n.classList].filter((c) => !['lit', 'stamped', 'on', 'open', 'compact', 'landed', 'filed', 'tracing', 'live', 'idle', 'stamp', 'gone'].includes(c)).join('.');
      parts.unshift(p);
      n = n.parentElement;
    }
    return parts.join('>');
  };
  const sectionOf = (el) => {
    let n = el;
    while (n && n.nodeType === 1) {
      if (n.tagName === 'SECTION' && n.parentElement && n.parentElement.tagName === 'MAIN') return n.id;
      n = n.parentElement;
    }
    return el.closest && el.closest('#mast') ? '_mast' : el.closest && el.closest('#manifest') ? '_manifest' : '_other';
  };
  const bucket = (ff) => {
    const f = (ff || '').toLowerCase();
    if (f.includes('fragment mono') || f.includes('ui-monospace') || f.includes('sf mono') || f.includes('monospace')) return 'mono';
    if (f.includes('fraunces')) return 'display';
    if (f.includes('newsreader')) return 'body';
    return 'other:' + f.split(',')[0];
  };

  const vw = innerWidth, vh = innerHeight, sy = scrollY;
  const runs = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = tw.nextNode())) {
    const txt = node.nodeValue.replace(/\s+/g, ' ').trim();
    if (!txt) continue;
    const el = node.parentElement;
    if (!el) continue;
    const tag = el.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'title') continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
    if (!rects.length) continue;
    const r = range.getBoundingClientRect();
    if (r.bottom < -2 || r.top > vh + 2 || r.right < -2 || r.left > vw + 2) continue;
    const cs = getComputedStyle(el);
    const isSvg = el.namespaceURI === 'http://www.w3.org/2000/svg';
    let px = parseFloat(cs.fontSize);
    if (isSvg) {
      const te = el.closest ? el : el;
      try {
        const ctm = (te.getScreenCTM && te.getScreenCTM()) || null;
        if (ctm) px = px * Math.hypot(ctm.a, ctm.b);
      } catch { /* no ctm */ }
    } else {
      px = px * scaleOf(el);
    }
    const ariaHidden = !!el.closest('[aria-hidden="true"]');
    runs.push({
      t: txt,
      s: sel(el),
      sec: sectionOf(el),
      px: Math.round(px * 100) / 100,
      f: bucket(cs.fontFamily),
      o: Math.round(effOpacity(el) * 1000) / 1000,
      clip: clippedBy(el, r),
      ah: ariaHidden,
      svg: isSvg,
      x: Math.round(r.left), y: Math.round(r.top), W: Math.round(r.width), Hh: Math.round(r.height),
      py: Math.round(r.top + sy),
      lines: rects.map((q) => [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]),
    });
  }

  // manifest + mast
  const mf = document.getElementById('manifest');
  const mr = mf.getBoundingClientRect();
  const manifest = { cls: [...mf.classList], o: effOpacity(mf), x: Math.round(mr.left), y: Math.round(mr.top), w: Math.round(mr.width), h: Math.round(mr.height), pe: getComputedStyle(mf).pointerEvents };
  const mt = document.getElementById('mtoggle');
  const toggle = { pe: getComputedStyle(mt).pointerEvents, aria: mt.getAttribute('aria-expanded'), r: (() => { const q = mt.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]; })() };

  // thread ink
  const cv = document.getElementById('thread');
  let ink = [];
  try {
    const cx = cv.getContext('2d', { willReadFrequently: true });
    const sc = cv.width / vw; // backing/css
    const d = cx.getImageData(0, 0, cv.width, cv.height).data;
    for (let yy = 0; yy < vh; yy += 4) {
      const by = Math.min(cv.height - 1, Math.round(yy * sc));
      const xs = [];
      for (let xx = 0; xx < vw; xx += 1) {
        const bx = Math.min(cv.width - 1, Math.round(xx * sc));
        const a = d[(by * cv.width + bx) * 4 + 3];
        if (a > 40) xs.push(xx);
      }
      if (xs.length) ink.push([yy, xs[0], xs[xs.length - 1], xs.length]);
    }
  } catch (e) { ink = [['ERR', String(e && e.message)]]; }

  return { sy, vw, vh, world: JSON.parse(JSON.stringify(window.__world || {})), doc: document.documentElement.scrollHeight, runs, manifest, toggle, ink };
};

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
  });
  const page = await ctx.newPage();
  const mq = [];
  await page.goto(process.env.URL || 'https://ayush-yadav.com/', { waitUntil: 'load', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(4000); // nameplate settle
  mq.push(await page.evaluate(() => ({
    hoverNone: matchMedia('(hover: none)').matches,
    pointerCoarse: matchMedia('(pointer: coarse)').matches,
    dpr: devicePixelRatio,
    ua: navigator.userAgent.includes('Mobile'),
    stacked: innerWidth <= 1249,
  })));

  const vh = await page.evaluate(() => innerHeight);
  const doc0 = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(vh / 2);
  const steps = [];
  for (let y = 0; y <= doc0 - vh + step; y += step) steps.push(Math.min(y, doc0 - vh));
  const out = { label, w, h, mobile, mq: mq[0], doc0, vh, step, frames: [] };

  for (let i = 0; i < steps.length; i++) {
    const y = steps[i];
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(700);
    const f = await page.evaluate(COLLECT);
    f.i = i; f.want = y;
    out.frames.push(f);
    if (i % 2 === 0) {
      await page.screenshot({ path: `${DIR}/shots/${label}/s${String(i).padStart(3, '0')}-y${f.sy}.jpg`, type: 'jpeg', quality: 72 });
    }
    process.stdout.write(`${label} ${i}/${steps.length} y=${f.sy} runs=${f.runs.length}\n`);
  }

  // static extras: aria-labels, figcaptions, full text
  out.statics = await page.evaluate(() => {
    const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
    const secOf = (el) => { let n = el; while (n) { if (n.tagName === 'SECTION' && n.parentElement && n.parentElement.tagName === 'MAIN') return n.id; n = n.parentElement; } return '_other'; };
    return {
      aria: [...document.querySelectorAll('[aria-label]')].map((e) => ({ s: e.id || e.tagName.toLowerCase() + '.' + e.className, sec: secOf(e), n: words(e.getAttribute('aria-label')), t: e.getAttribute('aria-label').slice(0, 90) })),
      figcaps: [...document.querySelectorAll('figcaption')].map((e) => ({ sec: secOf(e), n: words(e.innerText), t: e.innerText.replace(/\s+/g, ' ').slice(0, 160) })),
      quotes: [...document.querySelectorAll('blockquote, .epigraph, .endquote')].map((e) => ({ sec: secOf(e), n: words(e.innerText), t: e.innerText.replace(/\s+/g, ' ').slice(0, 160) })),
      sections: [...document.querySelectorAll('main > section')].map((e) => ({ id: e.id, top: e.offsetTop, h: e.offsetHeight, cls: e.className })),
    };
  });

  writeFileSync(`${DIR}/sweep-${label}.json`, JSON.stringify(out));
  await browser.close();
  console.log(`DONE ${label} frames=${out.frames.length}`);
};
run().catch((e) => { console.error('FAIL', label, e); process.exit(1); });
