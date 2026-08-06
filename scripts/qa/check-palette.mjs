/**
 * The palette gate — the run's own ink, over the run's own light.
 *
 * WHAT THIS REPLACES, AND WHY THE SOURCE CHANGED. `check-contrast.mjs` was
 * 589 lines of correct WCAG composition over a palette HAND-COPIED from
 * `src/app/globals.css`. Phase 4 retired it and measured why first: of the
 * twenty-one colours it mirrored, THREE appeared in `src/run/index.html`, and
 * `#b04a28` — the clay it spent most of its assertions on — appeared nowhere
 * on the site, because §3.7 ruled the archive adopts the run's clay and the
 * `#b04a28` family died with the React tree. A gate reporting green about
 * colours no reader sees is worse than no gate. Its defect was its SOURCE,
 * not its maths, so the maths is lifted out of its history and re-pointed:
 * `srgbToLin`, `luminance`, `contrast` and the alpha composite are that
 * file's, unchanged.
 *
 * WHERE THE COLOURS COME FROM NOW. Both shipped stylesheets, read as the
 * artifacts they are:
 *
 *   · `src/run/index.html` — the `:root` and `:root[data-night]` token
 *     blocks, plus the three OKLCH arrays that ARE the field a reader sees
 *     (`WAY`, `DUSK`, `DAWN_STOPS`) and the page's own `oklchToRgb`, which is
 *     extracted and run rather than re-implemented. A gate that re-implements
 *     the converter is measuring its own arithmetic against the page's; this
 *     one measures the page against itself. Two conversions are PINNED below
 *     so a bad extraction fails loudly instead of comparing garbage to
 *     garbage.
 *   · `scripts/archive/assets/archive.css` — one `:root`, no arc, and its
 *     `--plate` / `--plate-solid` composited over `--paper` the way a browser
 *     paints them.
 *
 * APCA. There was no APCA implementation in this repository and `culori` is
 * uninstalled, so the Lc maths is new — APCA-W3 0.98G-4g, the revision
 * `archive.css`'s own header names. It was validated BEFORE anything was
 * built on it: it reproduces all ten of that header's hand-measured pairs to
 * Δ0.00, which is why the header can now be bound rather than trusted.
 *
 * THE GRAMMAR, which is the point of the whole file. Any contrast number
 * written in a comment in either stylesheet must be spelled
 *
 *     measured: #<fg> on #<bg> — <ratio>:1 / Lc <lc>
 *
 * and every occurrence is recomputed here. That is the rule this gate exists
 * to enforce: WHAT MUST NOT COME BACK IS A TABLE NOTHING BINDS. Three of the
 * run's own palette comments were stale when this was written — the day
 * clay's cited Lc 61.3 is `#b04a28` on the golden waypoint, a colour that
 * stopped shipping in Phase 3 — and nothing could have said so.
 *
 * §5.4'S NIGHT-CONTRAST RULE IS HERE TOO, and this header used to disclaim
 * it. Figure strokes over a darkened field are a different pair from any
 * token pair — the dusk choreography was verified stop by stop FOR TEXT — and
 * figs. 09 and 10 are night stations that §5.4 redraws. The fields are read
 * from `arcColor`'s own model rather than from the arc's full range, and that
 * distinction is not pedantry: the first cut measured against the night-side
 * DUSK stops and reported `--hair-strong` under the floor at 2.53:1, on
 * grounds no figure ever renders over.
 *
 * WHAT THIS DOES NOT COVER, said out loud rather than left to be discovered:
 * the TIGHT figure editions are built in JavaScript and their viewBox is
 * written at run time, so the label-size arithmetic for them lives with the
 * redraw rather than here (`check-figures.mjs` covers the wide editions).
 * And `--clay-g`'s "graphics only, never text" law is NOT
 * checked statically: `color:` on an `aria-hidden` SVG wrapper is how the
 * archive hands `currentColor` to a drawn mark, so a rule forbidding
 * `color:var(--clay-g)` would red on correct CSS at `archive.css:363`. A
 * check that fires on the right answer is worse than the honest gap.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), "utf8");
const RUN = "src/run/index.html";
const ARCHIVE_CSS = "scripts/archive/assets/archive.css";
const runHtml = read(RUN);
const archCss = read(ARCHIVE_CSS);

const fails = [];
const notes = [];
const fail = (m) => fails.push(`  ✗ ${m}`);
const note = (m) => notes.push(`  · ${m}`);

/* ══════════════════════════════════════════════════════════════════
   The maths. WCAG and the composite are check-contrast.mjs's, lifted
   from 0a03b87^ unchanged. APCA is new and validated below.
   ══════════════════════════════════════════════════════════════════ */
const chans = (hex) => {
  const n = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
};
function srgbToLin(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function luminance(hex) {
  const [r, g, b] = chans(hex).map(srgbToLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
/** Gamma-space alpha composite — how the browser paints an opacity mute. */
function blend(top, bottom, alpha) {
  const [t, b] = [chans(top), chans(bottom)];
  return `#${t
    .map((c, i) =>
      Math.round(c * alpha + b[i] * (1 - alpha))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

/* APCA-W3, constants 0.98G-4g. */
const APCA = {
  blkThrs: 0.022,
  blkClmp: 1.414,
  normBG: 0.56,
  normTXT: 0.57,
  revBG: 0.65,
  revTXT: 0.62,
  scale: 1.14,
  offset: 0.027,
  loClip: 0.1,
  deltaYmin: 0.0005,
};
function screenY(hex) {
  const [r, g, b] = chans(hex).map((v) => Math.pow(v / 255, 2.4));
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  return y < APCA.blkThrs ? y + Math.pow(APCA.blkThrs - y, APCA.blkClmp) : y;
}
/** Absolute Lc. Polarity is carried by which argument is the text. */
function lc(textHex, bgHex) {
  const Yt = screenY(textHex);
  const Yb = screenY(bgHex);
  if (Math.abs(Yb - Yt) < APCA.deltaYmin) return 0;
  let sapc;
  let out;
  if (Yb > Yt) {
    sapc =
      (Math.pow(Yb, APCA.normBG) - Math.pow(Yt, APCA.normTXT)) * APCA.scale;
    out = sapc < APCA.loClip ? 0 : sapc - APCA.offset;
  } else {
    sapc = (Math.pow(Yb, APCA.revBG) - Math.pow(Yt, APCA.revTXT)) * APCA.scale;
    out = sapc > -APCA.loClip ? 0 : sapc + APCA.offset;
  }
  return Math.abs(out * 100);
}

/* ══════════════════════════════════════════════════════════════════
   Read the run: tokens, the arc, and the page's own converter.
   ══════════════════════════════════════════════════════════════════ */
const rootBlocks = (text, wantNight) =>
  [...text.matchAll(/:root(\[data-night\])?\s*\{([^}]*)\}/g)].filter(
    (m) => Boolean(m[1]) === wantNight
  );
const tokens = (body) => {
  const out = {};
  for (const [, k, v] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))
    out[k] = v.trim();
  return out;
};
/* The run declares :root four times — the palette, --scrim-c, --plate-solid
   and a --pad-x media override. The palette is the one carrying --ink, and
   naming it that way is what stops a later split from silently reading the
   wrong block. */
const paletteBlock = (text, isNight, where) => {
  for (const m of rootBlocks(text, isNight)) {
    const t = tokens(m[2]);
    if (t["--ink"]) return t;
  }
  fail(
    `${where}: no :root${isNight ? "[data-night]" : ""} block declares --ink`
  );
  return {};
};
const DAY = paletteBlock(runHtml, false, RUN);
const NIGHT = paletteBlock(runHtml, true, RUN);
const ARCH = paletteBlock(archCss, false, ARCHIVE_CSS);

const oklchArray = (name) => {
  const m = runHtml.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`));
  if (!m) {
    fail(`${RUN}: could not read the ${name} array — the arc is unreadable`);
    return [];
  }
  return new Function(`return [${m[1]}];`)();
};
const WAY = oklchArray("WAY");
const DUSK = oklchArray("DUSK");
const DAWN_STOPS = oklchArray("DAWN_STOPS");

/* The page's own converter, run rather than re-implemented. */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
let oklchToRgb = null;
{
  const m = runHtml.match(/function oklchToRgb\(l, c, h\) \{[\s\S]*?\n\}/);
  if (!m) fail(`${RUN}: oklchToRgb is not where this gate reads it from`);
  else oklchToRgb = new Function("clamp", `${m[0]}; return oklchToRgb;`)(clamp);
}
const hexOf = (l, c, h) =>
  "#" +
  oklchToRgb(l, c, h)
    .map((x) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("");

/* ── PARSE FLOORS, counted AND named ──────────────────────────────────
   C33: a count that stays right while the contents rot prints the same
   green line as a clean file. So each length is paired with a value only
   the real array produces. */
const shape = [
  ["WAY", WAY, 7],
  ["DUSK", DUSK, 12],
  ["DAWN_STOPS", DAWN_STOPS, 16],
];
for (const [name, a, n] of shape)
  if (a.length !== n)
    fail(
      `${name} has ${a.length} stops, expected ${n} — a broken parse, not a palette`
    );
const REQUIRED_TOKENS = ["--ink", "--ink-2", "--clay", "--clay-g", "--pine"];
for (const [label, set, extra] of [
  ["run :root", DAY, ["--ink-inverse", "--thread", "--hair", "--ember"]],
  ["run :root[data-night]", NIGHT, ["--ink-inverse", "--thread", "--hair"]],
  ["archive :root", ARCH, ["--paper", "--plate", "--plate-solid"]],
]) {
  const missing = [...REQUIRED_TOKENS, ...extra].filter((t) => !set[t]);
  if (missing.length)
    fail(
      `${label} is missing ${missing.join(", ")} — ${Object.keys(set).length} tokens read`
    );
}
/* Two pinned conversions. If the extraction grabs the wrong function body, or
   the run refactors its converter, this fails rather than measuring garbage
   against garbage. Recorded 2026-08-06 from the arrays above. */
if (oklchToRgb) {
  const pins = [
    ["WAY[0], the dawn waypoint", WAY[0], "#fbf3e7"],
    ["DUSK[11], the settled night", DUSK[11]?.slice(1, 4), "#43372f"],
  ];
  for (const [what, oklch, expected] of pins) {
    const got = oklch ? hexOf(...oklch) : "(unreadable)";
    if (got !== expected)
      fail(
        `the run's oklchToRgb no longer converts ${what} to ${expected} — got ${got}.\n` +
          `      Every colour below is computed through it, so this is checked first.`
      );
  }
  if (!fails.length)
    note(`the run's own oklchToRgb, extracted and pinned on 2 conversions`);
}

/* ── THE ARC'S OWN GUARANTEE ──────────────────────────────────────────
   ¶13's dawn says in prose: "These are the page's own dusk choreography
   reversed … Reversing it inherits that guarantee rather than re-deriving
   it: the same jump, taken upward." That is a checkable claim about data,
   and until now it was a sentence. If the dusk is ever re-tuned and the dawn
   is not, the inheritance quietly stops being true and every contrast
   verified on the way down is unverified on the way up. */
if (DUSK.length === 12 && DAWN_STOPS.length === 16 && WAY.length === 7) {
  const duskReversed = [...DUSK].reverse().map((d) => d.slice(0, 4));
  const dawnHead = DAWN_STOPS.slice(0, 12);
  const dawnTail = DAWN_STOPS.slice(12);
  const wayTail = WAY.slice(0, 4)
    .reverse()
    .map((w) => [0, ...w]);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (!same(dawnHead, duskReversed))
    fail(
      `DAWN_STOPS' first 12 stops are NOT the dusk choreography reversed.\n` +
        `      The run says they are, and the whole contrast guarantee of ¶13 is\n` +
        `      inherited from that — including the deliberate luminance jump at the\n` +
        `      flip, which exists so ink never renders across the mid band.`
    );
  else if (!same(dawnTail, wayTail))
    fail(
      `DAWN_STOPS' last 4 stops are not WAY[3..0] — the dawn does not land on\n` +
        `      the day's own waypoints, so the next morning is a different light.`
    );
  else
    note(
      `¶13's dawn IS the dusk reversed, then WAY[3..0] — the inheritance the run claims`
    );
}

/* ══════════════════════════════════════════════════════════════════
   The fields a reader actually reads text on.

   NOT "every colour the field passes through". The run curtains all six
   dusk-contract elements to opacity 0 before the darkening starts — its own
   round-2 census caught per-element windows leaking op-1.0 text onto the
   sub-AA band at 768–2560 and fixed it — and the terminator is a deliberate
   luminance JUMP so the mid band is never rendered under ink at all. So the
   day ink set is read over the five DAY waypoints, and the night ink set
   over the two NIGHT ones. The one exception is the masthead, which is fixed
   chrome and therefore IS on screen at the flip stop; it gets its own check.
   ══════════════════════════════════════════════════════════════════ */
const DAY_FIELDS = WAY.slice(0, 5).map((w) => hexOf(...w));
const NIGHT_FIELDS = WAY.slice(5).map((w) => hexOf(...w));
const FLIP_STOP = DUSK[7] ? hexOf(DUSK[7][1], DUSK[7][2], DUSK[7][3]) : null;

/* Floors, each from a law this site already states rather than a round
   number picked here. Text: WCAG AA 4.5 and the Lc 60 dim floor that
   archive.css's header names. Graphics: WCAG 3.0, non-text contrast.
   `--ember` is a GRAPHIC by classification and it is the one classification
   worth arguing: it is a distressed ink impression behind a turbulence mask,
   and it is held to the graphics floor only because the sentence it stamps
   is also written beside it in body ink — which is asserted below, so the
   classification cannot quietly become an excuse. */
const TEXT = { wcag: 4.5, lc: 60, kind: "text" };
const GRAPHIC = { wcag: 3.0, lc: 0, kind: "graphic" };
/* Filled by the night-stroke block below and read again by the
   reduced-motion one, which draws the settled plates in the same tokens. */
let usedFigureTokens = [];
const PAIRS = [
  ["--ink", TEXT],
  ["--ink-2", TEXT],
  ["--clay", TEXT],
  ["--pine", TEXT],
  ["--clay-g", GRAPHIC],
  ["--thread", GRAPHIC],
];

function measureSet(label, set, fields) {
  if (!fields.length) return;
  for (const [token, floor] of PAIRS) {
    const fg = set[token];
    if (!fg || !/^#[0-9a-f]{6}$/i.test(fg)) continue;
    let worstLc = Infinity;
    let worstW = Infinity;
    let at = "";
    for (const bg of fields) {
      const l = lc(fg, bg);
      if (l < worstLc) {
        worstLc = l;
        worstW = contrast(fg, bg);
        at = bg;
      }
    }
    if (worstW < floor.wcag || worstLc < floor.lc)
      fail(
        `${label} ${token} ${fg} is ${worstW.toFixed(2)}:1 / Lc ${worstLc.toFixed(1)} on ${at}\n` +
          `      — below the ${floor.kind} floor of ${floor.wcag}:1 / Lc ${floor.lc}`
      );
  }
  note(
    `${label}: ${PAIRS.length} tokens hold their floors over ${fields.length} field colour${fields.length === 1 ? "" : "s"} (${fields.join(" ")})`
  );
}
measureSet("day", DAY, DAY_FIELDS);
measureSet("night", NIGHT, NIGHT_FIELDS);

/* The inked button: what text becomes when the ink fills it. */
if (DAY["--ink-inverse"] && DAY["--ink"]) {
  const w = contrast(DAY["--ink-inverse"], DAY["--ink"]);
  const l = lc(DAY["--ink-inverse"], DAY["--ink"]);
  if (w < TEXT.wcag || l < TEXT.lc)
    fail(
      `--ink-inverse on the ink fill is ${w.toFixed(2)}:1 / Lc ${l.toFixed(1)}`
    );
  else
    note(
      `--ink-inverse on the ink fill — ${w.toFixed(2)}:1 / Lc ${l.toFixed(1)}`
    );
}

/* ── THE FLIP STOP, AND THE LAW IT FORCED ─────────────────────────────
   The masthead is fixed chrome, so unlike every other element it IS on
   screen at DUSK[7] — the lightest night field, and the worst case for light
   ink. Measured there, night `--clay` is Lc 53.4, which is why the run
   carries `:root[data-night] #mast .state i{color:var(--ink)}`. That
   override is the mitigation for a measurement, and nothing has ever bound
   the two together: delete the override and the run silently goes back to
   clay text at Lc 53 with every gate green. */
if (FLIP_STOP && NIGHT["--ink"] && NIGHT["--ink-2"]) {
  for (const [what, token] of [
    ["#mast, #mast .state i at night", "--ink"],
    ["#mast's own body copy", "--ink-2"],
  ]) {
    const fg = NIGHT[token];
    const w = contrast(fg, FLIP_STOP);
    const l = lc(fg, FLIP_STOP);
    if (w < TEXT.wcag || l < TEXT.lc)
      fail(
        `at the flip stop ${FLIP_STOP}, ${what} draws ${token} ${fg} at ${w.toFixed(2)}:1 / Lc ${l.toFixed(1)}`
      );
  }
  const clayAtFlip = lc(NIGHT["--clay"], FLIP_STOP);
  const overridePresent =
    /:root\[data-night\]\s*#mast \.state i\{color:var\(--ink\)\}/.test(runHtml);
  if (clayAtFlip < TEXT.lc && !overridePresent)
    fail(
      `night --clay is Lc ${clayAtFlip.toFixed(1)} on the flip stop ${FLIP_STOP}, below the ${TEXT.lc} floor,\n` +
        `      and the run no longer carries the night masthead override that exists\n` +
        `      because of it. The measurement and its mitigation have to move together.`
    );
  else
    note(
      `the flip stop ${FLIP_STOP}: the masthead's night inks hold, and clay is kept off it (Lc ${clayAtFlip.toFixed(1)})`
    );
}

/* ══════════════════════════════════════════════════════════════════
   §5.4's NIGHT-CONTRAST RULE. Figure strokes are a different pair from any
   token pair above, and this file used to disclaim them.

   The dusk choreography's contrast was verified stop by stop FOR TEXT. A
   hair-weight rule drawn over a darkened field is not text and was measured
   by nobody, which matters because figs. 09 and 10 are night stations and
   §5.4 redraws both.

   THE FIELDS ARE arcColor's, NOT "every colour the arc passes through", and
   getting that wrong produces a false finding — the first cut of this
   measurement included the night-side DUSK stops and reported --hair-strong
   at 2.53:1, under the floor. Read from the source instead: beat 8 lerps
   WAY[5] → WAY[6], beats 9–11 hold WAY[6], and beat 7's plate is on the dusk
   curtain (`data-fx-sync="dusk"`) so it exits before the darkening opens.
   No figure ever renders over the crossing. The model is asserted below so
   the field set cannot drift away from the code that chooses it.

   Strokes are held to the WCAG 3.0 non-text floor; a `.figsvg text` label is
   text and gets 4.5 / Lc 60. The tightest pair is printed rather than passed
   silently: a redraw that darkens WAY[5] or thins a hair alpha puts the
   figure's own rule lines under the floor. Until 2026-08-06 that pair was
   `--hair-strong` clearing 3.0 by ONE HUNDREDTH; §4b's commit zero raised the
   night alpha to .45 for exactly that reason, and the printed margin is the
   live number.
   ══════════════════════════════════════════════════════════════════ */
if (NIGHT_FIELDS.length === 2 && WAY.length === 7) {
  /* The model, asserted from the source that implements it. */
  const beat8 =
    /if \(beat === 8\)[\s\S]{0,320}?WAY\[5\][\s\S]{0,40}?WAY\[6\]/.test(
      runHtml
    );
  const held =
    /if \(beat < 12\)[\s\S]{0,200}?WAY\[6\]\[0\], WAY\[6\]\[1\], WAY\[6\]\[2\]/.test(
      runHtml
    );
  const curtained = /<figure class="plate bare"[^>]*data-fx-sync="dusk"/.test(
    runHtml
  );
  if (!beat8 || !held || !curtained)
    fail(
      `the night fields below are read from arcColor's own model and it has changed:\n` +
        `      beat 8 lerps WAY[5]→WAY[6]: ${beat8 ? "yes" : "NO"} · beats 9–11 hold WAY[6]: ${held ? "yes" : "NO"} ·\n` +
        `      ¶08's plate is on the dusk curtain: ${curtained ? "yes" : "NO"}.\n` +
        `      If a figure now renders over the crossing, these strokes are measured against\n` +
        `      the wrong grounds and the numbers below mean nothing.`
    );

  /* What .figsvg rules actually draw with, read off the run's own CSS rather
     than listed by eye — a token added to a figure rule joins this set. */
  const figureCss = [...runHtml.matchAll(/\.figsvg[^{]*\{([^}]*)\}/g)]
    .map((m) => m[1])
    .join(";");
  const usedTokens = [
    ...new Set([...figureCss.matchAll(/var\(--([\w-]+)\)/g)].map((m) => m[1])),
  ]
    .map((t) => `--${t}`)
    .filter((t) => NIGHT[t] || DAY[t]);
  usedFigureTokens = usedTokens;
  const TEXT_TOKENS = new Set(["--ink-2"]);
  if (usedTokens.length < 6)
    fail(
      `read ${usedTokens.length} colour tokens out of the .figsvg rules, expected at least 6.\n` +
        `      Measured 2026-08-06: hair-strong, ink, ink-2, clay-g, pine, clay.`
    );
  let tightest = { margin: Infinity, token: "", w: 0, at: "" };
  for (const token of usedTokens) {
    const raw = NIGHT[token] ?? DAY[token];
    const floor = TEXT_TOKENS.has(token) ? TEXT : GRAPHIC;
    for (const bg of NIGHT_FIELDS) {
      /* A translucent stroke is what the eye receives after compositing, not
         the token. --hair-strong is rgba(…,.4) and reading it as opaque
         would overstate it by a factor. */
      const rgba = rgbaHex(raw);
      const fg = rgba ? blend(rgba[0], bg, rgba[1]) : raw;
      if (!/^#[0-9a-f]{6}$/i.test(fg)) continue;
      const w = contrast(fg, bg);
      const l = lc(fg, bg);
      if (w < floor.wcag || l < floor.lc)
        fail(
          `a figure stroke in ${token} draws at ${w.toFixed(2)}:1 / Lc ${l.toFixed(1)} on the night\n` +
            `      field ${bg} — below the ${floor.kind} floor of ${floor.wcag}:1 / Lc ${floor.lc}.\n` +
            `      figs. 09 and 10 are night stations; this is the pair a redraw changes.`
        );
      const margin = w - floor.wcag;
      if (margin < tightest.margin) tightest = { margin, token, w, at: bg };
    }
  }
  if (tightest.token)
    note(
      `night figure strokes: ${usedTokens.length} tokens hold over ${NIGHT_FIELDS.join(" ")} — ` +
        `tightest is ${tightest.token} at ${tightest.w.toFixed(2)}:1 on ${tightest.at}, ` +
        `${tightest.margin.toFixed(2)} over its floor`
    );
}

/* ══════════════════════════════════════════════════════════════════
   THE SECOND NIGHT WORLD, WHICH THIS GATE COULD NOT SEE.

   `paletteBlock()` matches `:root[data-night]{…}`, and that is not the only
   place the run declares a night palette. A reduced-motion reader never gets
   the arc at all: the run gives them `settleAll()` and four beats carrying
   their own resting grounds, with the night tokens RE-DECLARED inside
   `@media (prefers-reduced-motion: reduce)`. Every measurement above is blind
   to that block — so raising the night `--hair-strong` alpha in `:root` and
   not in the override would leave reduced-motion readers on the old hairline
   with this file printing green, which is precisely the drift the token was
   raised to end. It matters more after §4b than before it: the settle
   contract makes the settled state THE design of all six redrawn figures, and
   the settled state is what this audience reads.

   Two assertions, because measurement alone is not enough. The grounds are
   checked against NIGHT_FIELDS first — measuring the right tokens over the
   wrong field is the mistake this file's own header records making once — and
   the HAIR tokens are then asserted EQUAL to `:root[data-night]`'s, because a
   hair that drifts to a different-but-still-passing alpha is drift the floor
   cannot report. The hairs are singled out because they are the register the
   figures' structure is drawn in and nothing else re-derives them.

   ONE DECLARED DIVERGENCE, named rather than skipped (C35): `--ink-2` is
   `#d4cabb` here against `#d9d0c3` in `:root[data-night]`. Both hold the text
   floor on both grounds (7.10 / 9.21 against 7.54 / 9.83), and unlike the
   clay and pine overrides two lines above it, the run records no reason for
   it. It is permitted here and left visible rather than quietly equalised —
   equalising it moves the golden hash for a reason unrelated to any figure.
   ══════════════════════════════════════════════════════════════════ */
{
  /* The run carries FIVE `reduce` media queries, and the first cut of this
     read took the first one and reported a clean parse of the wrong block.
     Brace-match every one of them and select by the selector that is the
     subject; more than one carrying it is as much a defect as none. */
  const reduceBlocks = [];
  const OPEN = "@media (prefers-reduced-motion: reduce){";
  for (let i = runHtml.indexOf(OPEN); i > -1; i = runHtml.indexOf(OPEN, i + 1)) {
    let depth = 0;
    let j = i + OPEN.length - 1;
    for (; j < runHtml.length; j++) {
      if (runHtml[j] === "{") depth++;
      else if (runHtml[j] === "}" && --depth === 0) break;
    }
    reduceBlocks.push(runHtml.slice(i, j + 1));
  }
  const SETTLED = ".b6,.b7,.bhow,.b8{";
  const owning = reduceBlocks.filter((b) => b.includes(SETTLED));
  const rm = owning.length === 1 ? owning[0] : null;
  const body = rm?.match(/\.b6,\.b7,\.bhow,\.b8\{([^}]*)\}/)?.[1];
  const g1 = rm?.match(/\.b6\{background:(#[0-9a-f]{6})\}/)?.[1];
  const g2 = rm?.match(/\.b7,\.bhow,\.b8\{background:(#[0-9a-f]{6})\}/)?.[1];
  if (!rm || !body || !g1 || !g2) {
    fail(
      `could not read the reduced-motion night world out of ${RUN} — ${reduceBlocks.length} reduce blocks,\n` +
        `      ${owning.length} declaring "${SETTLED}…" (expected exactly 1), token override: ${body ? "yes" : "NO"},\n` +
        `      resting grounds: ${g1 && g2 ? "yes" : "NO"}.\n` +
        `      A broken parse here measures nothing and prints the same green line as a clean file.`
    );
  } else {
    const RM = tokens(body.endsWith(";") ? body : `${body};`);
    const grounds = [g1, g2];
    if (JSON.stringify(grounds) !== JSON.stringify(NIGHT_FIELDS))
      fail(
        `the reduced-motion beats rest on ${grounds.join(" ")} but the arc's night fields are\n` +
          `      ${NIGHT_FIELDS.join(" ")}. The override exists to reproduce the night world for a reader\n` +
          `      who never sees it arrive; on different grounds it reproduces something else, and every\n` +
          `      ratio below is measured against a field nobody renders.`
      );
    else {
      measureSet("reduced-motion night", RM, grounds);
      /* The figure strokes again, on the same grounds, through the override's
         own tokens — this is the set the settled plates are actually drawn
         in for this reader. */
      for (const token of usedFigureTokens) {
        const raw = RM[token];
        if (!raw) continue;
        const floor = token === "--ink-2" ? TEXT : GRAPHIC;
        for (const bg of grounds) {
          const rgba = rgbaHex(raw);
          const fg = rgba ? blend(rgba[0], bg, rgba[1]) : raw;
          if (!/^#[0-9a-f]{6}$/i.test(fg)) continue;
          const w = contrast(fg, bg);
          const l = lc(fg, bg);
          if (w < floor.wcag || l < floor.lc)
            fail(
              `a settled figure stroke in ${token} draws at ${w.toFixed(2)}:1 / Lc ${l.toFixed(1)} on the\n` +
                `      reduced-motion ground ${bg} — below the ${floor.kind} floor of ${floor.wcag}:1 / Lc ${floor.lc}.`
            );
        }
      }
      const HAIRS = ["--hair", "--hair-strong"];
      const drifted = HAIRS.filter((t) => RM[t] && NIGHT[t] && RM[t] !== NIGHT[t]);
      if (drifted.length)
        fail(
          `the reduced-motion override and :root[data-night] declare different hairs —\n` +
            drifted
              .map((t) => `      ${t}: ${RM[t]} here, ${NIGHT[t]} there`)
              .join("\n") +
            `\n      Both may clear the floor and still be two different night worlds. The hairs are the\n` +
            `      register the figures' structure is drawn in; a reduced-motion reader gets the settled\n` +
            `      plates and nothing else re-derives these.`
        );
      else
        note(
          `the reduced-motion night world: same hairs as :root[data-night], measured on its own grounds ${grounds.join(" ")}`
        );
    }
  }
}

/* The reserved stamp: a graphic, and only because its sentence is written. */
if (DAY["--ember"] && NIGHT_FIELDS.length) {
  const terminal = NIGHT_FIELDS[NIGHT_FIELDS.length - 1];
  const w = contrast(DAY["--ember"], terminal);
  const l = lc(DAY["--ember"], terminal);
  const noteWritten = /\.gatecard \.note\{[^}]*color:var\(--ink-2\)/.test(
    runHtml
  );
  if (w < GRAPHIC.wcag)
    fail(
      `--ember ${DAY["--ember"]} is ${w.toFixed(2)}:1 on the terminal field ${terminal}, under the graphics floor`
    );
  else if (!noteWritten)
    fail(
      `--ember is held to the GRAPHICS floor (${w.toFixed(2)}:1 / Lc ${l.toFixed(1)}) on the argument that\n` +
        `      the stamp's sentence is also written beside it in --ink-2. .gatecard .note no\n` +
        `      longer carries that ink, so the argument is gone and the classification with it.`
    );
  else
    note(
      `--ember, the reserved stamp — ${w.toFixed(2)}:1 / Lc ${l.toFixed(1)} on ${terminal}, a mark whose sentence is written in --ink-2 beside it`
    );
}

/* ══════════════════════════════════════════════════════════════════
   The archive: one lit room, three grounds, no arc.
   ══════════════════════════════════════════════════════════════════ */
/* A `function` and not a `const` arrow: the night-stroke check above also
   composites translucent tokens and would sit in this one's temporal dead
   zone otherwise. */
function rgbaHex(v) {
  const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return [
    "#" +
      [m[1], m[2], m[3]]
        .map((x) => Number(x).toString(16).padStart(2, "0"))
        .join(""),
    m[4] === undefined ? 1 : Number(m[4]),
  ];
}
let ARCHIVE_GROUNDS = {};
if (ARCH["--paper"] && ARCH["--plate"] && ARCH["--plate-solid"]) {
  const paper = ARCH["--paper"];
  const [pt, pa] = rgbaHex(ARCH["--plate"]) ?? [];
  const [st, sa] = rgbaHex(ARCH["--plate-solid"]) ?? [];
  ARCHIVE_GROUNDS = {
    paper,
    plate: blend(pt, paper, pa),
    "plate-solid": blend(st, paper, sa),
  };
  const ARCHIVE_PAIRS = [
    ["--ink", { ...TEXT, lc: 90 }],
    ["--ink-2", TEXT],
    ["--clay", TEXT],
    ["--pine", TEXT],
    ["--clay-g", GRAPHIC],
  ];
  for (const [token, floor] of ARCHIVE_PAIRS) {
    for (const [gname, bg] of Object.entries(ARCHIVE_GROUNDS)) {
      const fg = ARCH[token];
      const w = contrast(fg, bg);
      const l = lc(fg, bg);
      if (w < floor.wcag || l < floor.lc)
        fail(
          `archive ${token} ${fg} on ${gname} ${bg} is ${w.toFixed(2)}:1 / Lc ${l.toFixed(1)}` +
            ` — below the ${floor.kind} floor of ${floor.wcag}:1 / Lc ${floor.lc}`
        );
    }
  }
  note(
    `archive: 5 inks hold their floors on paper ${ARCHIVE_GROUNDS.paper}, plate ${ARCHIVE_GROUNDS.plate}, plate-solid ${ARCHIVE_GROUNDS["plate-solid"]}`
  );
}

/* ══════════════════════════════════════════════════════════════════
   THE GRAMMAR. Every contrast number written in a comment in either
   stylesheet, recomputed. This is the assertion the whole file is for.
   ══════════════════════════════════════════════════════════════════ */
/* The number groups are `\d+(\.\d+)?` and not `[\d.]+` on purpose: the loose
   form swallows the sentence-ending period after an Lc, `Number("53.4.")` is
   NaN, and the pair fails against itself with both sides printing the same
   figure. Caught by writing a claim that ended a sentence. */
const CLAIM =
  /measured: (#[0-9a-f]{6}) on (#[0-9a-f]{6}) — (\d+(?:\.\d+)?):1 \/ Lc (\d+(?:\.\d+)?)/g;
let claims = 0;
for (const [file, text] of [
  [RUN, runHtml],
  [ARCHIVE_CSS, archCss],
]) {
  for (const [whole, fg, bg, w, l] of text.matchAll(CLAIM)) {
    claims++;
    const gotW = contrast(fg, bg);
    const gotL = lc(fg, bg);
    if (
      gotW.toFixed(2) !== Number(w).toFixed(2) ||
      gotL.toFixed(1) !== Number(l).toFixed(1)
    )
      fail(
        `${file} states "${whole}"\n` +
          `      recomputed: ${gotW.toFixed(2)}:1 / Lc ${gotL.toFixed(1)}.\n` +
          `      A palette number in a comment is a table nothing binds — this is the\n` +
          `      one thing this gate exists to stop coming back.`
      );
  }
}
/* Floor measured 2026-08-06: 11 in the run, 15 in archive.css. A parse that
   silently found none would print the same green summary as a clean file. */
if (claims < 26)
  fail(
    `read ${claims} "measured:" claims out of the two stylesheets, expected at least 20.\n` +
      `      That is a broken parse or a table that has been quietly un-written.`
  );
else
  note(
    `${claims} "measured:" claims in the two stylesheets, every one recomputed`
  );

for (const n of notes) console.log(n);
if (fails.length) {
  console.error(`\ncheck-palette FAILED — the run's own ink does not hold:`);
  for (const f of fails) console.error(f);
  process.exit(1);
}
console.log(
  `\ncheck-palette: the palette is measured against the light it is read under`
);
