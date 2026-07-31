// Beat coherence + mid-flight share from a census run.
//   node coherence.mjs [dir] [tag]     e.g. node coherence.mjs . desk
//                                           node coherence.mjs before-r5 desk
// coherent(y): every fx element intersecting the viewport renders op >= .98.
// Reproduces the round-4 audit's headline on before-r5/desk exactly:
// 1/11 beats (b9, 96px, 0.8%), median mid-flight 48%.
import { readFileSync } from 'node:fs';
const dir = process.argv[2] || '.';
const tag = process.argv[3] || 'desk';
const P = (f) => new URL(`./${dir}/${f}`, import.meta.url).pathname;
const C = JSON.parse(readFileSync(P(`census-${tag}.json`), 'utf8'));
const G = JSON.parse(readFileSync(P(`opgrid-${tag}.json`), 'utf8'));
const { spec, world, activity } = C;
const vh = world.vh;
const beatOfY = new Map(activity.map((a) => [a.y, a.beat]));
const perBeat = Array.from({ length: world.beats.length }, () => 0);
let total = 0;
for (let k = 0; k < G.ys.length; k++) {
  const y = G.ys[k];
  let ok = true, any = false;
  for (let i = 0; i < spec.length; i++) {
    const s = spec[i];
    if (s.top < y + vh && s.top + s.h > y) { any = true; if (G.ops[k][i] < 0.98) { ok = false; break; } }
  }
  if (ok && any) { perBeat[beatOfY.get(y) ?? 0] += C.coarseStep; total += C.coarseStep; }
}
const shares = [];
for (let i = 0; i < spec.length; i++) {
  const s = spec[i];
  let mid = 0, set = 0;
  for (let k = 0; k < G.ys.length; k++) {
    const y = G.ys[k];
    if (!(s.top < y + vh && s.top + s.h > y)) continue;
    const o = G.ops[k][i];
    if (o >= 0.98) set++; else if (o > 0.02) mid++;
  }
  if (mid + set > 0) shares.push(mid / (mid + set));
}
shares.sort((a, b) => a - b);
const list = perBeat.map((px, b) => ({ b, px })).filter((x) => x.px > 0);
console.log(`${dir}/${tag}: coherent beats ${list.length}/${world.beats.length} [${list.map((x) => `b${x.b}:${x.px}px`).join(' ')}] total ${total}px of ${world.maxY} (${(100 * total / world.maxY).toFixed(1)}%) · median mid-flight share ${(100 * shares[shares.length >> 1]).toFixed(0)}%`);
