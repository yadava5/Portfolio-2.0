/* analyse.mjs — defects 1,2,3,5 and the whole of Part 2, from sweep-*.json. */
import { readFileSync, writeFileSync } from 'node:fs';
const DIR = process.env.OUT;
const LABELS = process.env.LABELS.split(',');
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const legible = (r) => r.o >= 0.5 && !r.clip && r.sec !== '_mast' && r.sec !== '_manifest' && r.px >= 7;
const R = {};
const say = [];
const P = (s) => { say.push(s); };

for (const L of LABELS) {
  let d;
  try { d = JSON.parse(readFileSync(`${DIR}/sweep-${L}.json`, 'utf8')); } catch { P(`## ${L}: MISSING`); continue; }
  const W = d.w, VH = d.vh;
  R[L] = { w: W, vh: VH, doc: d.doc0, mq: d.mq, sections: d.statics.sections, statics: d.statics };

  /* ── 1 · manifest overlap ───────────────────────────────── */
  const overlaps = [];
  for (const f of d.frames) {
    const m = f.manifest;
    if (m.o <= 0.05) continue;
    const covered = [];
    for (const r of f.runs) {
      if (r.sec === '_manifest' || r.sec === '_mast') continue;
      if (r.o < 0.35) continue;
      for (const [lx, ly, lw, lh] of r.lines) {
        if (lx < m.x + m.w && lx + lw > m.x && ly < m.y + m.h && ly + lh > m.y) {
          covered.push({ t: r.t.slice(0, 70), s: r.s, sec: r.sec, px: r.px, o: r.o });
          break;
        }
      }
    }
    if (covered.length) overlaps.push({ sy: f.sy, mcls: m.cls, mrect: [m.x, m.y, m.w, m.h], mo: +m.o.toFixed(2), covered });
  }
  R[L].manifestOverlaps = overlaps;
  R[L].manifestFramesVisible = d.frames.filter((f) => f.manifest.o > 0.05).length;
  R[L].manifestFrames = d.frames.length;

  /* ── 2 · thread through text ────────────────────────────── */
  const threadHits = [];
  for (const f of d.frames) {
    if (!f.ink.length || f.ink[0][0] === 'ERR') continue;
    const hits = [];
    for (const r of f.runs) {
      if (r.o < 0.35 || r.sec === '_mast' || r.sec === '_manifest') continue;
      if (r.f !== 'body' && r.f !== 'display') continue; // prose only
      for (const [lx, ly, lw, lh] of r.lines) {
        const rows = f.ink.filter((q) => q[0] >= ly - 2 && q[0] <= ly + lh + 2);
        const crossing = rows.filter((q) => q[1] < lx + lw && q[2] > lx);
        if (crossing.length) { hits.push({ t: r.t.slice(0, 60), s: r.s, sec: r.sec, box: [lx, ly, lw, lh], inkX: crossing.map((q) => [q[1], q[2]]) }); break; }
      }
    }
    if (hits.length) threadHits.push({ sy: f.sy, n: hits.length, hits: hits.slice(0, 8) });
  }
  R[L].threadHits = threadHits;
  /* face-agnostic twin: moving text off mono must not read as a thread regression */
  let anyN = 0;
  for (const f of d.frames) {
    if (!f.ink.length || f.ink[0][0] === 'ERR') continue;
    const hit = f.runs.some((r) => r.o >= 0.35 && r.sec !== '_mast' && r.sec !== '_manifest' && !r.svg &&
      r.lines.some(([lx, ly, lw, lh]) => f.ink.some((q) => q[0] >= ly - 2 && q[0] <= ly + lh + 2 && q[1] < lx + lw && q[2] > lx)));
    if (hit) anyN++;
  }
  R[L].threadAnyTextSteps = anyN;
  let lines = 0;
  for (const f of d.frames) {
    if (!f.ink.length || f.ink[0][0] === 'ERR') continue;
    for (const r of f.runs) {
      if (r.o < 0.35 || r.sec === '_mast' || r.sec === '_manifest' || r.svg) continue;
      for (const [lx, ly, lw, lh] of r.lines) if (f.ink.some((q) => q[0] >= ly - 2 && q[0] <= ly + lh + 2 && q[1] < lx + lw && q[2] > lx)) lines++;
    }
  }
  R[L].threadCrossedLines = lines;
  R[L].threadXbyFrame = d.frames.map((f) => ({ sy: f.sy, xs: f.ink.length && f.ink[0][0] !== 'ERR' ? [Math.min(...f.ink.map((q) => q[1])), Math.max(...f.ink.map((q) => q[2]))] : null }));

  /* ── 3 · dead screens ───────────────────────────────────── */
  const dens = d.frames.map((f) => {
    const good = f.runs.filter(legible);
    const pr = good.filter((r) => r.f === "body" || r.f === "display"); return { sy: f.sy, words: good.reduce((a, r) => a + words(r.t), 0), prose: pr.reduce((a, r) => a + words(r.t), 0), runs: good.length, beat: f.world.beat, bp: +(f.world.beatP || 0).toFixed(2) };
  });
  R[L].density = dens;
  R[L].dead = dens.filter((x) => x.prose <= 25 || x.words <= 20);

  /* ── 5 · small text (dedupe by selector) ────────────────── */
  const small = new Map();
  for (const f of d.frames) for (const r of f.runs) {
    if (!legible(r)) continue;
    if (r.px >= 12) continue;
    const k = r.s + '|' + r.px;
    if (!small.has(k)) small.set(k, { s: r.s, px: r.px, f: r.f, sec: r.sec, svg: r.svg, samples: new Set(), n: 0 });
    const e = small.get(k); e.n++; if (e.samples.size < 3) e.samples.add(r.t.slice(0, 70));
  }
  R[L].small = [...small.values()].map((e) => ({ ...e, samples: [...e.samples] })).sort((a, b) => a.px - b.px);

  /* ── Part 2 · census ────────────────────────────────────── */
  const uniq = new Map();
  for (const f of d.frames) for (const r of f.runs) {
    const k = r.sec + '|' + r.s + '|' + r.t;
    const prev = uniq.get(k);
    if (!prev || r.o > prev.o) uniq.set(k, r);
  }
  const vis = [...uniq.values()].filter((r) => r.o >= 0.5 && !r.clip);
  R[L].visibleRuns = vis.length;
  const census = {};
  for (const r of vis) {
    const sec = r.sec;
    census[sec] ||= { display: 0, body: 0, mono: 0, other: 0, total: 0, figcap: 0, runs: 0 };
    const n = words(r.t);
    const b = r.f.startsWith('other') ? 'other' : r.f;
    census[sec][b] += n; census[sec].total += n; census[sec].runs++;
    if (r.s.includes('figcaption')) census[sec].figcap += n;
  }
  R[L].census = census;

  // mono selectors
  const mono = new Map();
  for (const r of vis) {
    if (r.f !== 'mono') continue;
    if (!mono.has(r.s)) mono.set(r.s, { s: r.s, px: r.px, secs: new Set(), n: 0, samples: [] });
    const e = mono.get(r.s); e.n += words(r.t); e.secs.add(r.sec); if (e.samples.length < 2) e.samples.push(r.t.slice(0, 64));
  }
  R[L].monoSelectors = [...mono.values()].map((e) => ({ ...e, secs: [...e.secs] })).sort((a, b) => b.n - a.n);

  // dashes
  const IDENT = /[a-z0-9]-[a-z0-9]|[a-z]-[A-Z]|^-O3$|\.com|macro-f1|jetpack-compress|ayush-yadav|adler-32|dot-256|fast-mnist|-O3/;
  const dash = {};
  for (const r of vis) {
    const sec = r.sec;
    dash[sec] ||= { em: 0, en: 0, spacedHyphen: 0, words: 0 };
    dash[sec].words += words(r.t);
    dash[sec].em += (r.t.match(/—/g) || []).length;
    dash[sec].en += (r.t.match(/–/g) || []).length;
    dash[sec].spacedHyphen += (r.t.match(/(?:^|\s)-(?=\s)/g) || []).length;
  }
  R[L].dashes = dash;
  R[L].allVisible = vis.map((r) => ({ sec: r.sec, s: r.s, f: r.f, px: r.px, t: r.t }));
}

writeFileSync(`${DIR}/analysis.json`, JSON.stringify(R, null, 1));

/* ── printed summary ───────────────────────────────────────── */
for (const L of LABELS) {
  const a = R[L]; if (!a) continue;
  P(`\n================ ${L} (${a.w}×${a.vh}) doc=${a.doc} mq=${JSON.stringify(a.mq)}`);
  P(`manifest visible in ${a.manifestFramesVisible}/${a.manifestFrames} frames; overlapping frames: ${a.manifestOverlaps.length}`);
  for (const o of a.manifestOverlaps.slice(0, 40)) P(`  y=${o.sy} m=${JSON.stringify(o.mrect)} o=${o.mo} cls=${o.mcls.join('.')} covers ${o.covered.length}: ` + o.covered.map((c) => `[${c.sec}|${c.s}] "${c.t}"`).join(' ~ '));
  P(`thread crosses prose in ${a.threadHits.length} frames`);
  for (const t of a.threadHits.slice(0, 40)) P(`  y=${t.sy} n=${t.n}: ` + t.hits.map((h) => `[${h.sec}] "${h.t}" box=${JSON.stringify(h.box)} ink=${JSON.stringify(h.inkX)}`).join(' ~ '));
  P(`dead frames (<=12 legible words) ${a.dead.length}/${a.density.length}:`);
  for (const dd of a.dead) P(`  y=${dd.sy}..${dd.sy + a.vh} words=${dd.words} prose=${dd.prose} runs=${dd.runs} beat=${dd.beat}`);
  P(`density profile: ` + a.density.map((x) => `${x.sy}:${x.words}/${x.prose}`).join(' '));
  P(`sub-12px selectors (${a.small.length}):`);
  for (const s of a.small) P(`  ${s.px}px ${s.f}${s.svg ? ' svg' : ''} [${s.sec}] ${s.s} :: ${JSON.stringify(s.samples)}`);
  P(`visible runs ${a.visibleRuns}`);
}
writeFileSync(`${DIR}/analysis.txt`, say.join('\n'));
console.log(say.join('\n'));
