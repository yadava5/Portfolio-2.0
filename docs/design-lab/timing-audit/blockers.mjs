// Which element is pinching each beat's coherent window?
//   node blockers.mjs [dir] [tag]      e.g. node blockers.mjs . mob
// For every census grid row inside a beat, coherence fails when any
// in-viewport element renders op < .98. This names those elements, split
// by phase (entering: op still rising toward its peak · exiting: op
// falling), so a thin window can be attributed to the declaration that
// caused it instead of guessed at.
import { readFileSync } from 'node:fs';
const dir = process.argv[2] || '.';
const tag = process.argv[3] || 'desk';
const P = (f) => new URL(`./${dir}/${f}`, import.meta.url).pathname;
const C = JSON.parse(readFileSync(P(`census-${tag}.json`), 'utf8'));
const G = JSON.parse(readFileSync(P(`opgrid-${tag}.json`), 'utf8'));
const { spec, world, activity } = C;
const vh = world.vh;
const beatOfY = new Map(activity.map((a) => [a.y, a.beat]));

// peak index per element (to classify rising vs falling at a given y)
const peakK = spec.map((_, i) => {
  let best = -1, k0 = 0;
  for (let k = 0; k < G.ys.length; k++) if (G.ops[k][i] > best) { best = G.ops[k][i]; k0 = k; }
  return k0;
});

const perBeat = new Map();
for (let k = 0; k < G.ys.length; k++) {
  const y = G.ys[k];
  const b = beatOfY.get(y) ?? 0;
  if (!perBeat.has(b)) perBeat.set(b, { rows: 0, blocked: 0, els: new Map() });
  const B = perBeat.get(b);
  B.rows++;
  let bad = [];
  for (let i = 0; i < spec.length; i++) {
    const s = spec[i];
    if (s.top < y + vh && s.top + s.h > y && G.ops[k][i] < 0.98) {
      bad.push({ i, phase: k < peakK[i] ? 'entering' : 'exiting' });
    }
  }
  if (bad.length) {
    B.blocked++;
    for (const x of bad) {
      const key = `${x.i}:${x.phase}`;
      B.els.set(key, (B.els.get(key) || 0) + C.coarseStep);
    }
  }
}

console.log(`\n=== ${dir}/${tag} ${world.vw}x${world.vh} — px of each beat blocked, by blocking element ===`);
for (const [b, B] of [...perBeat.entries()].sort((a, c) => a[0] - c[0])) {
  const win = (B.rows - B.blocked) * C.coarseStep;
  console.log(`\nb${b}: coherent ${win}px of ${B.rows * C.coarseStep}px`);
  const rows = [...B.els.entries()]
    .map(([key, px]) => {
      const [i, phase] = key.split(':');
      const s = spec[Number(i)];
      return { px, phase, i: Number(i), label: s.label, beat: s.beat, decl: s.decl, text: s.text.slice(0, 40) };
    })
    .sort((a, c) => c.px - a.px)
    .slice(0, 6);
  for (const r of rows) {
    console.log(`  ${String(r.px).padStart(5)}px ${r.phase.padEnd(8)} [b${r.beat} ${r.label}] "${r.text}" :: ${r.decl}`);
  }
}
