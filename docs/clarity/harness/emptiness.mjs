/* emptiness.mjs: split near-empty screens into CORRIDOR (the rail between stations)
   and STARVED (inside a station's own content box but thin on words).
   A station's content box = page-y extent of every legible run of that section,
   over every frame. A near-empty frame is STARVED if >=40% of its viewport lies
   inside some station's content box, else CORRIDOR.
   OUT=<run dir> LABELS=w1512,w1440 node emptiness.mjs */
import { readFileSync, writeFileSync } from 'node:fs';
const DIR = process.env.OUT;
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const legible = (r) => r.o >= 0.5 && !r.clip && r.sec !== '_mast' && r.sec !== '_manifest' && r.px >= 7;
const out = {};
for (const L of process.env.LABELS.split(',')) {
  let d; try { d = JSON.parse(readFileSync(`${DIR}/sweep-${L}.json`, 'utf8')); } catch { continue; }
  const vh = d.vh, box = {};
  for (const f of d.frames) for (const r of f.runs) {
    if (!legible(r) || r.sec.startsWith('_')) continue;
    for (const [, ly, , lh] of r.lines) {
      const top = ly + f.sy, bot = top + lh;
      const b = (box[r.sec] ||= [Infinity, -Infinity]);
      b[0] = Math.min(b[0], top); b[1] = Math.max(b[1], bot);
    }
  }
  const boxes = Object.entries(box);
  const rows = d.frames.map((f) => {
    const w = f.runs.filter(legible).reduce((a, r) => a + words(r.t), 0);
    const a = f.sy, z = f.sy + vh;
    let inside = 0;
    for (const [, [t, b]] of boxes) inside += Math.max(0, Math.min(z, b) - Math.max(a, t));
    return { sy: f.sy, words: w, inside: Math.min(1, inside / vh) };
  });
  const ne = rows.filter((x) => x.words <= 60);
  out[L] = {
    nearEmpty: ne.length,
    corridor: ne.filter((x) => x.inside < 0.4).length,
    starved: ne.filter((x) => x.inside >= 0.4).length,
    starvedAt: ne.filter((x) => x.inside >= 0.4).map((x) => `${x.sy}:${x.words}w/${Math.round(x.inside * 100)}%`),
  };
}
writeFileSync(`${DIR}/emptiness.json`, JSON.stringify(out, null, 1));
for (const [L, v] of Object.entries(out)) console.log(L, `near-empty ${v.nearEmpty} = corridor ${v.corridor} + starved ${v.starved}`, v.starvedAt.join(' '));
