// Turn the census into a per-element timing table + defect list.
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('./', import.meta.url).pathname;
const CRUISE = 750;      // px/s reading cruise
const PAUSE = 1.6;       // s pause at each beat reading anchor
const tag = process.argv[2] || 'desk';
const C = JSON.parse(readFileSync(`${OUT}census-${tag}.json`, 'utf8'));
const { world, spec, refined, peaks, activity } = C;
const vh = world.vh, vw = world.vw, maxY = world.maxY, beats = world.beats;

// ---------- reading-pace clock ----------
const pauseY = beats.map((b) => Math.max(0, Math.min(maxY, b.top + 0.5 * b.h - 0.62 * vh)));
const tAt = (y) => y / CRUISE + PAUSE * pauseY.filter((p) => p <= y).length;
const secs = (y0, y1) => (y0 == null || y1 == null ? null : +(tAt(y1) - tAt(y0)).toFixed(2));

// ---------- per-element crossings ----------
const byEl = new Map();
for (const r of refined) {
  if (!byEl.has(r.el)) byEl.set(r.el, []);
  byEl.get(r.el).push(r);
}
for (const v of byEl.values()) v.sort((a, b) => a.y - b.y);

const yAtP = (s, p) => s.top + p * (vh + s.h) - vh;   // invert (y+vh-top)/(vh+h)
const pAtY = (s, y) => (y + vh - s.top) / (vh + s.h);

const rows = spec.map((s) => {
  const cr = byEl.get(s.i) || [];
  const up = (t) => cr.find((c) => c.dir === 'up' && c.thr === t);
  const dn = (t) => [...cr].reverse().find((c) => c.dir === 'down' && c.thr === t);
  const pk = peaks.find((p) => p.i === s.i);

  const eStart = up(0.02), eDone = up(0.98);
  // exit start = the LAST fall through 0.98 (ignores quantisation chatter)
  const xStart = dn(0.98), gone = dn(0.02);

  const dwellPx = eDone && xStart ? +(xStart.y - eDone.y).toFixed(1) : null;
  const lifePx = eStart ? +((gone ? gone.y : maxY) - eStart.y).toFixed(1) : null;

  // beat frame: the page's own reading line sits at y + 0.62vh
  const b = beats[s.beat] || beats[0];
  const beatStart = b.top - 0.62 * vh;          // reading line enters the beat
  const beatEnd = b.top + b.h - 0.62 * vh;      // reading line leaves the beat
  const yDue = s.top + s.h / 2 - 0.62 * vh;     // element's own centre meets the reading line

  return {
    i: s.i, beat: s.beat, label: s.label, text: s.text, decl: s.decl, sync: s.sync,
    top: s.top, h: s.h,
    aIn: s.specIn.slice(0, 2).map((x) => +x.toFixed(4)),
    aOut: s.specOut.slice(0, 2).map((x) => +x.toFixed(4)),
    dx: s.specIn[2], dy: s.specIn[3], scale: s.specIn[5], drift: s.drift,
    // analytic
    yIn0: +yAtP(s, s.specIn[0]).toFixed(1), yIn1: +yAtP(s, s.specIn[1]).toFixed(1),
    yOut0: +yAtP(s, s.specOut[0]).toFixed(1), yOut1: +yAtP(s, s.specOut[1]).toFixed(1),
    // empirical
    eStartY: eStart ? eStart.y : null, eStartTop: eStart ? eStart.rectTop : null, eStartBot: eStart ? eStart.rectBot : null,
    eDoneY: eDone ? eDone.y : null, eDoneTop: eDone ? eDone.rectTop : null, eDoneBot: eDone ? eDone.rectBot : null,
    xStartY: xStart ? xStart.y : null, xStartTop: xStart ? xStart.rectTop : null, xStartBot: xStart ? xStart.rectBot : null,
    goneY: gone ? gone.y : null, goneTop: gone ? gone.rectTop : null,
    peak: pk.peak, peakY: pk.peakY,
    dwellPx, dwellS: dwellPx == null ? null : secs(eDone.y, xStart.y),
    lifePx, lifeS: eStart ? secs(eStart.y, gone ? gone.y : maxY) : null,
    beatStart: +beatStart.toFixed(1), beatEnd: +beatEnd.toFixed(1), yDue: +yDue.toFixed(1),
    parks: !gone,
  };
});

// ---------- flags ----------
const flags = [];
const F = (sev, kind, r, msg, num) => flags.push({ sev, kind, i: r.i, beat: r.beat, label: r.label, text: r.text, msg, num });

for (const r of rows) {
  // 1. exit window opens before entrance window closes (spec-level, hard)
  if (r.aOut[0] < r.aIn[1]) {
    const px = +((r.yIn1 - r.yOut0)).toFixed(0);
    F(1, 'exit-before-entrance', r,
      `out window opens at p=${r.aOut[0]} but in window closes at p=${r.aIn[1]} — exit starts ${px}px of scroll BEFORE the entrance would finish`, px);
  }
  // 2. never reaches full opacity
  if (r.peak < 0.98) F(1, 'never-settles', r, `peak rendered opacity ${r.peak} — never fully arrives`, r.peak);
  // 3. no settled window at all
  else if (r.dwellPx != null && r.dwellPx <= 0) F(1, 'zero-dwell', r, `settles and immediately starts leaving (dwell ${r.dwellPx}px)`, r.dwellPx);
  // 4. short dwell
  else if (r.dwellPx != null && r.dwellS != null && r.dwellS < 1.0) F(2, 'short-dwell', r, `settled for only ${r.dwellPx}px = ${r.dwellS}s at reading pace`, r.dwellS);
  // 5. entrance completes while still wholly below the fold
  if (r.eDoneY != null && r.eDoneTop > vh) F(2, 'arrives-offscreen', r, `entrance completes while element top is ${Math.round(r.eDoneTop)}px BELOW the fold (vh=${vh})`, Math.round(r.eDoneTop - vh));
  else if (r.eDoneY != null && r.eDoneBot > vh) F(3, 'arrives-partly-offscreen', r, `entrance completes with ${Math.round(r.eDoneBot - vh)}px of the element still below the fold`, Math.round(r.eDoneBot - vh));
  // 6. entrance still running after the reader's line has passed the element centre
  if (r.eDoneY != null && r.eDoneY > r.yDue) F(2, 'arrives-late', r, `entrance completes ${Math.round(r.eDoneY - r.yDue)}px AFTER the reading line passed the element centre`, Math.round(r.eDoneY - r.yDue));
  // 7. exit begins before the reading line reached the element centre
  if (r.xStartY != null && r.xStartY < r.yDue) F(1, 'leaves-early', r, `starts fading out ${Math.round(r.yDue - r.xStartY)}px BEFORE the reading line reaches the element centre`, Math.round(r.yDue - r.xStartY));
  // 8. fully gone before its own beat ends
  if (r.goneY != null && r.goneY < r.beatEnd - 0.15 * vh) F(3, 'gone-inside-beat', r, `fully invisible ${Math.round(r.beatEnd - r.goneY)}px before its beat ends`, Math.round(r.beatEnd - r.goneY));
  // 9. parks (never exits) — the file's stated contract is "nothing parks"
  if (r.parks && !/out 2 2\.5/.test(r.decl || '')) F(3, 'parks-undeclared', r, `never falls below op 0.02 before the page ends, without an explicit park declaration`, null);
}
flags.sort((a, b) => a.sev - b.sev || (Math.abs(b.num ?? 0) - Math.abs(a.num ?? 0)));

// ---------- collisions & dead air ----------
const coll = activity.filter((a) => a.trans >= 6).map((a) => a);
// group contiguous
const group = (arr, key) => {
  const out = []; let cur = null;
  for (const a of arr) {
    if (cur && a.y - cur.y1 <= C.coarseStep * 1.5) { cur.y1 = a.y; cur.peak = Math.max(cur.peak, key(a)); cur.n++; }
    else { if (cur) out.push(cur); cur = { y0: a.y, y1: a.y, peak: key(a), n: 1 }; }
  }
  if (cur) out.push(cur);
  return out;
};
const collisions = group(coll, (a) => a.trans).map((g) => ({ ...g, px: g.y1 - g.y0, s: secs(g.y0, g.y1) }));
const dead = activity.filter((a) => a.d < 0.02);
const deadAir = group(dead, () => 0)
  .map((g) => ({ ...g, px: g.y1 - g.y0, s: secs(g.y0, g.y1) }))
  .filter((g) => g.px >= 300);

// ---------- beat table ----------
const beatRows = beats.map((b, i) => {
  const bs = b.top - 0.62 * vh, be = b.top + b.h - 0.62 * vh;
  const mine = rows.filter((r) => r.beat === i);
  return {
    beat: i, top: b.top, h: b.h, readStart: +bs.toFixed(0), readEnd: +be.toFixed(0),
    spanS: secs(Math.max(0, bs), Math.min(maxY, be)), n: mine.length,
    medDwellPx: median(mine.map((r) => r.dwellPx).filter((x) => x != null)),
  };
});
function median(a) { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return +s[s.length >> 1].toFixed(0); }

const report = { tag, vw, vh, maxY, cruise: CRUISE, pause: PAUSE, pauseY: pauseY.map(Math.round), totalS: +tAt(maxY).toFixed(1), rows, flags, collisions, deadAir, beatRows };
writeFileSync(`${OUT}analysis-${tag}.json`, JSON.stringify(report, null, 1));

// ---------- CSV for the design pass ----------
const cols = ['i', 'beat', 'label', 'text', 'decl', 'top', 'h', 'eStartY', 'eStartTop', 'eDoneY', 'eDoneTop', 'eDoneBot', 'xStartY', 'xStartTop', 'goneY', 'peak', 'dwellPx', 'dwellS', 'lifePx', 'lifeS', 'yDue', 'beatStart', 'beatEnd'];
const csv = [cols.join(',')].concat(rows.map((r) => cols.map((c) => {
  const v = r[c]; if (v == null) return '';
  return typeof v === 'string' ? '"' + v.replace(/"/g, "'") + '"' : v;
}).join(','))).join('\n');
writeFileSync(`${OUT}census-${tag}.csv`, csv);

// ---------- console summary ----------
console.log(`\n=== ${tag} ${vw}x${vh} · doc ${maxY + vh}px · scrollable ${maxY}px · ${report.totalS}s at ${CRUISE}px/s + ${PAUSE}s/beat ===`);
console.log(`elements: ${rows.length}   flags: ${flags.length}`);
const kinds = {};
for (const f of flags) kinds[f.kind] = (kinds[f.kind] || 0) + 1;
console.log('by kind:', kinds);
console.log('\n--- SEV1 ---');
for (const f of flags.filter((f) => f.sev === 1)) console.log(`  b${f.beat} ${f.kind.padEnd(22)} [${f.label}] "${f.text.slice(0, 44)}" :: ${f.msg}`);
console.log('\n--- dwell distribution (px) ---');
const dw = rows.map((r) => r.dwellPx).filter((x) => x != null).sort((a, b) => a - b);
console.log(`  n=${dw.length} min=${dw[0]} p25=${dw[dw.length >> 2]} med=${dw[dw.length >> 1]} max=${dw[dw.length - 1]}`);
console.log(`  parks (never exit): ${rows.filter((r) => r.parks).length}`);
console.log('\n--- collisions (>=6 elements mid-transition) ---');
for (const g of collisions.slice(0, 14)) console.log(`  y ${g.y0}-${g.y1} (${g.px}px, ${g.s}s) peak ${g.peak} simultaneous`);
console.log(`  total windows: ${collisions.length}`);
console.log('\n--- dead air (>=300px with no opacity change) ---');
for (const g of deadAir) console.log(`  y ${g.y0}-${g.y1} (${g.px}px, ${g.s}s)`);
console.log('\n--- beats ---');
for (const b of beatRows) console.log(`  b${String(b.beat).padStart(2)} read ${String(b.readStart).padStart(6)}..${String(b.readEnd).padStart(6)}  ${String(b.spanS).padStart(5)}s  n=${String(b.n).padStart(2)}  medDwell=${b.medDwellPx}px`);
