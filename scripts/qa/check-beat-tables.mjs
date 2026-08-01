/**
 * The run's engine keeps several tables that are INDEXED BY BEAT. Insert a
 * station and the DOM grows by one; the tables do not. Nothing throws — the
 * short table just yields `undefined` at the last index, which becomes NaN,
 * and NaN spreads:
 *
 *   stx[11] === undefined
 *     → anchor x = NaN
 *     → Math.hypot(NaN, y) = NaN
 *     → pathLen = NaN
 *     → clamp(L, 0, NaN) = NaN          (Math.min(x, NaN) is NaN)
 *     → EVERY pointAtLen() returns NaN, for the whole page
 *
 * That is not a tail bug. The thread stops drawing partway down AND every
 * traveller — the cargo the line carries between stations — silently stops
 * rendering, leaving a blind line. It happened when ¶11 (the co-signers) was
 * added: twelve sections, eleven-entry tables.
 *
 * So this guard asserts every beat-indexed table against the DOM's own count,
 * and asserts the ladder's never-light rule is derived rather than numbered.
 */
import { readFileSync } from "node:fs";

const file = process.argv[2] ?? "src/run/index.html";
const src = readFileSync(file, "utf8");
const fail = [];
const pass = [];

/** the DOM's own count is the single source of truth */
const beats = [...src.matchAll(/<section[^>]*data-beat="(\d+)"/g)].map((m) => +m[1]);
const beatCount = beats.length;
const expected = [...Array(beatCount).keys()];
if (String(beats.slice().sort((a, b) => a - b)) !== String(expected)) {
  fail.push(`data-beat is not a dense 0..${beatCount - 1} range: got ${beats.join(",")}`);
} else {
  pass.push(`${beatCount} beats, numbered 0..${beatCount - 1} with no gaps or repeats`);
}

/** every table that is read with a beat index */
const numeric = (name, re) => {
  const m = src.match(re);
  if (!m) return fail.push(`${name}: not found — did it get renamed?`);
  const n = m[1].split(",").filter((s) => s.trim()).length;
  if (n !== beatCount) fail.push(`${name}: ${n} entries for ${beatCount} beats — beat ${n} reads undefined → NaN`);
  else pass.push(`${name}: ${n} entries, one per beat`);
};

numeric("stx (stacked)", /\?\s*\[([\d,\s.]+)\]\s*\n?\s*:/);
numeric("stx (wide)", /:\s*\[([\d,\s.]+)\];/);
numeric("CLOCKS", /const CLOCKS = \[([\d,\s]+)\]/);

const pn = src.match(/const PHASE_NAMES = \[([^\]]+)\]/);
if (!pn) fail.push("PHASE_NAMES: not found");
else {
  const n = (pn[1].match(/"/g) || []).length / 2;
  if (n !== beatCount) fail.push(`PHASE_NAMES: ${n} names for ${beatCount} beats — the masthead prints undefined at the last stop`);
  else pass.push(`PHASE_NAMES: ${n} names, one per beat`);
}

/** CLOCKS must climb: it is lerped between adjacent stops */
const ck = src.match(/const CLOCKS = \[([\d,\s]+)\]/);
if (ck) {
  const v = ck[1].split(",").map((s) => +s.trim());
  const bad = v.findIndex((x, i) => i > 0 && x <= v[i - 1]);
  if (bad > 0) fail.push(`CLOCKS is not monotonic at index ${bad} (${v[bad - 1]} → ${v[bad]}) — the clock would run backwards`);
  else pass.push(`CLOCKS climbs ${v[0]}→${v[v.length - 1]} min (${String(Math.floor(v[0] / 60)).padStart(2, "0")}:${String(v[0] % 60).padStart(2, "0")} → ${String(Math.floor(v.at(-1) / 60)).padStart(2, "0")}:${String(v.at(-1) % 60).padStart(2, "0")})`);
}

/** the ladder recaps the day; its last rung must never light on scroll */
const ladder = [...src.matchAll(/<li data-ph="(\d+)"/g)].map((m) => +m[1]);
if (ladder.length !== beatCount) {
  fail.push(`ladder has ${ladder.length} rungs for ${beatCount} beats`);
} else {
  pass.push(`ladder: ${ladder.length} rungs, one per beat`);
}
if (/if \(i === DEPLOY_PH\) return;/.test(src) && /const DEPLOY_PH = phases\.length - 1;/.test(src)) {
  pass.push("deploy rung derived from phases.length — cannot invert when a stop is inserted");
} else if (/if \(i === \d+\) return;/.test(src)) {
  fail.push("scrubGate hard-codes the deploy rung — insert a stop and it suppresses the wrong line and lights deploy");
} else {
  fail.push("scrubGate's never-light rule not found");
}

/** travellers: every corridor except the last should carry something */
const trav = [...src.matchAll(/\{ beat: (\d+), n: \d+, label:/g)].map((m) => +m[1]);
const bare = [];
for (let i = 0; i < beatCount - 1; i++) if (!trav.includes(i)) bare.push(i);
if (bare.length) pass.push(`corridors without cargo: ${bare.join(", ")} (deliberate: nothing has been produced yet)`);
if (!trav.includes(beatCount - 2)) {
  fail.push(`the corridor into the gate (beat ${beatCount - 2}) carries no cargo — the run's last stretch reads as a blind line`);
} else {
  pass.push(`the corridor into the gate (beat ${beatCount - 2}) carries cargo`);
}

for (const p of pass) console.log(`  · ${p}`);
if (fail.length) {
  console.error("\ncheck-beat-tables: FAILED");
  for (const f of fail) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`\ncheck-beat-tables: ${beatCount} beats, every beat-indexed table agrees`);
