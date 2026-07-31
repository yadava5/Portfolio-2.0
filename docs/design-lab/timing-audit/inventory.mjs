// Join the scroll-motion/mutation sweep with the real-hover probe into one
// inert-surface inventory.
import { readFileSync, writeFileSync } from 'node:fs';
const OUT = new URL('./', import.meta.url).pathname;
const tag = process.argv[2] || 'desk';
// staticboxes now carries hoverResponds inline, measured over the SAME candidate set
const rows = JSON.parse(readFileSync(`${OUT}staticboxes-${tag}.json`, 'utf8'))
  .map((b) => ({ ...b, hoverTested: b.hoverResponds !== null && b.hoverResponds !== undefined }));
const inert = rows.filter((b) =>
  !b.ownFx && !b.moved && !b.selfMut && !b.innerMut && !b.transition && !b.animation && !b.isCanvas && b.hoverResponds !== true);

const noAnc = inert.filter((b) => !b.fxAncestor);
const withAnc = inert.filter((b) => b.fxAncestor);
writeFileSync(`${OUT}inventory-${tag}.json`, JSON.stringify({ tag, total: rows.length, inert: inert.length, rows: inert }, null, 1));

console.log(`\n=== ${tag}: ${rows.length} box candidates -> ${inert.length} INERT surfaces ===`);
console.log(`   (inert = no data-fx of its own, transform/opacity never changes with scroll,`);
console.log(`    no DOM mutation of itself or its content, no CSS transition/animation, no canvas,`);
console.log(`    and no measured response to a real pointer hover)\n`);
console.log(`-- A. NO CHOREOGRAPHY AT ALL (${noAnc.length}) — never arrives, never moves, never answers --`);
for (const b of noAnc) console.log(`   b${String(b.beat).padStart(2)}  ${b.sel.padEnd(28)} ${String(b.w).padStart(4)}x${String(b.h).padStart(3)} @page ${String(b.pageTop).padStart(6)}  "${b.text.slice(0, 48)}"`);

console.log(`\n-- B. INHERITS ITS PARENT'S ONE ARRIVAL, NOTHING OF ITS OWN (${withAnc.length}) --`);
const g = {};
for (const b of withAnc) { const k = `b${String(b.beat).padStart(2)} | ${b.fxAncestor}`; (g[k] = g[k] || []).push(b); }
for (const [k, v] of Object.entries(g).sort()) {
  console.log(`   ${k}   (${v.length} inert child surface${v.length > 1 ? 's' : ''})`);
  const show = v.length > 8 ? v.slice(0, 3) : v;
  for (const b of show) console.log(`        ${b.sel.padEnd(24)} ${String(b.w).padStart(4)}x${String(b.h).padStart(3)} @${String(b.pageTop).padStart(6)}  "${b.text.slice(0, 44)}"`);
  if (v.length > 8) console.log(`        … +${v.length - 3} more identical (${v[0].sel} cells)`);
}
console.log(`\n-- responds to pointer (for contrast): ${rows.filter((b) => b.hoverResponds === true).length} of ${rows.filter((b) => b.hoverTested).length} tested --`);
for (const b of rows.filter((x) => x.hoverResponds === true)) console.log(`   b${String(b.beat).padStart(2)}  ${b.sel.padEnd(26)} "${b.text.slice(0, 40)}"`);
