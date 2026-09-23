/* metrics.mjs: one scorecard row per width from analysis.json.
   OUT=<dir> LABELS=w1512,w1440 node metrics.mjs
   The non-regression rule: every desktop number equal or better than baseline. */
import { readFileSync, writeFileSync } from 'node:fs';
const DIR = process.env.OUT;
const R = JSON.parse(readFileSync(`${DIR}/analysis.json`, 'utf8'));
const rows = {};
for (const L of process.env.LABELS.split(',')) {
  const a = R[L]; if (!a) continue;
  const d = a.density;
  const monoW = Object.values(a.census).reduce((s, c) => s + c.mono, 0);
  const allW = Object.values(a.census).reduce((s, c) => s + c.total, 0);
  const subProse = a.small.filter((s) => !s.svg).length;
  rows[L] = {
    screens: +(a.doc / a.vh).toFixed(2),
    steps: d.length,
    manifestOverlapSteps: a.manifestOverlaps.length,
    threadSerifSteps: a.threadHits.length,
    threadAnyTextSteps: a.threadAnyTextSteps,
    threadCrossedLines: a.threadCrossedLines,
    nearEmpty60: d.filter((x) => x.words <= 60).length,
    proseFree25: d.filter((x) => x.prose <= 25).length,
    blank: d.filter((x) => x.words === 0).length,
    meanWords: Math.round(d.reduce((s, x) => s + x.words, 0) / d.length),
    sub12HtmlPairs: subProse,
    visibleWords: allW,
    monoPct: +(100 * monoW / allW).toFixed(1),
  };
}
writeFileSync(`${DIR}/metrics.json`, JSON.stringify(rows, null, 1));
console.table(rows);
