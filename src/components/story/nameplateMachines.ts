/**
 * @fileoverview The nameplate's five letter-machines — framework-free.
 *
 * Split out of Nameplate.tsx so the run (vanilla HTML) and any React
 * surface share ONE source. Copying them would have produced two
 * nameplates drifting apart, which is the exact failure mode six rounds
 * of porting the scroll engine already demonstrated.
 *
 * Nothing here touches React. The cut was clean because the component was
 * only ever a thin shell: 2 effects, 0 state, 3 refs, against 32
 * `animate()` calls and 18 SVG builders. `performEnsemble` takes DOM
 * elements and returns a promise, which is all either caller needs.
 */

/**
 * @fileoverview Nameplate — the masthead's name as five letter-machines
 * (header round 9, candidate D "the ensemble", owner-approved).
 *
 * Ten characters; five of them are machines; five hold still so the five
 * can be read. Each machine is derived from its own letterform — built
 * out of clipped/masked copies of the REAL letter (SVG <text> in the
 * same face and axes, measured raster-identical to the span: 0px diff on
 * chromium, docs/design-lab probe-lock9), at geometry taken from pixel
 * scans of the render (scan-letterform9). The settled pose of every
 * machine IS the letterform by construction, so the dry is fill colour
 * alone (wet #4A382A → ink), never a crossfade papering over a mismatch:
 *
 *   A — a pair of dividers: the letter's own stems hinged at their
 *       measured centreline intersection, standing closed on their
 *       points, opening to the letter's stance; the crossbar ties it.
 *   s — a road: an ink bead runs the one continuous letter here and the
 *       real s is revealed behind it, thicks and thins and terminals.
 *   a — a dial: fine-rim bezel on the bowl's centreline, tapered needle,
 *       seven detents; twelve decaying clicks, a catch, and the letter
 *       inks on from its own bowl–stem junction.
 *   a — the runner: the whole real letter arrives at a run — four
 *       decaying bounds on its own foot, plants past upright, stands.
 *   v — a bird: fusiform body, articulated curved wings, asymmetric
 *       beats, banking; it flares and folds into the v's own strokes.
 *
 * THE PHRASE (round 10 — concurrent and unhurried, owner-directed):
 * all five machines run AT ONCE — every one is in motion from ~1.73s
 * to ~2.64s — and the landings sweep left → right across the name
 * 140ms apart (A ~2.64s, s ~2.78s, dial ~2.92s, runner ~3.06s, the
 * v's fold LAST at ~3.20s, the keystone). ONE shared drying wave then
 * resolves the five letters as a single event and the letterpress
 * press closes the line; total ≈ 4.5s. Every move keeps its round-9
 * duration — nothing meaningful under 350ms — only the queueing is
 * gone (round 9 serialized the payoffs and read as five things taking
 * turns; the owner asked for one thing being made). The reading
 * matter below still rises at ~2s, WHILE the whole shop is running.
 *
 * WORLDS AND TIERS. The base DOM state is the FINAL frame: full ink,
 * settled axes (A7 by construction — probe-header9 measured 0px
 * settled-vs-static across three seats). The machines are the CORE
 * hero entrance, exactly as the hero-rise entrance was: the governor's
 * own law is that Full is an upshift earned by ≥3s of smooth scrolling
 * and "everyone's first paint is Core (or Print) — never a Full flash"
 * (governor.ts §F3), so a load-time performance gated to Full would
 * simply never play. After the show the plate is LIVING in every motion
 * world, not a tier: `mountNameHand` (the end of this file) strings the
 * eleven spans as beads that answer the hand's speed. It replaced a
 * tier-gated hover that never ran on the run (it was handed the
 * geometry where it wanted a settled() function, and data-tier is
 * never "full" there). Print / reduced motion / the quiet toggle get the
 * finished nameplate with no machinery mounted; a mid-show downshift,
 * a print request or the toggle settles the plate to the final frame
 * instantly (never a paused animation).
 *
 * ENGINE: CSS animations (the still letters' opsz arrival — pure CSS,
 * playing from first paint under the same [data-motion-ready] gate as
 * the old hero entrance) + WAAPI (the machines) — both browser-
 * scheduled. No rAF loop of any kind (probe-header9: 0 idle rAF calls
 * in 3s). Deterministic variation comes from mulberry32 (the repo's
 * own PRNG), never Math.random. No new dependencies.
 *
 * MEASUREMENT DISCIPLINE (the round-9 lessons, both measured):
 *  - the machines aim at the SETTLED layout: geometry is read from a
 *    hidden animation-stripped clone, because the still letters' opsz
 *    arrival changes glyph advances mid-show and a live measure lands
 *    every machine to the right of the A short (caught as a doubled v);
 *  - mask wipes carry a dash gap sized past the path so round caps
 *    cannot pre-reveal the terminals (caught at 3× as grey patches).
 */

import { mulberry32 } from "@/components/thread/geometry";

/* The machines are authored to these ten characters (their clip
   polygons, hinge points and skeletons cite pixel scans of exactly
   this string in this face). Rename the author in the data layer and
   every machine draws the right shape onto the wrong letter — a bird
   folded into somebody else's v.

   THE CHECK IS AT BUILD TIME, IN `scripts/run/build-nameplate.mjs`, AND
   IT CANNOT BE HERE (C46/C44, measured 2026-08-07). This file imported
   `personalInfo` for nineteen commits to make that comparison and never
   made it. Wiring it at runtime was tried and reverted: `personal.ts`
   imports `withBasePath`, and `basePath.ts` reads `process.env`, which
   does not exist in a browser. TypeScript had been ELIDING the unused
   import, so the module graph never loaded it and nothing broke; using
   the value retains the import, and the whole dynamic import of this
   module then fails with `ReferenceError: process is not defined` — the
   nameplate silently stops performing, and check-nameplate goes red on
   four invariants at once.

   `personal.js` and `basePath.js` shipped into `out/run/` and were fetched
   by nothing — not because of this import, which TypeScript elided, but
   because `tsconfig.run.json` named `personal.ts` as a compile ROOT. Both
   are gone now: the import here, and the root there (C44). */
export const MACHINE_NAME = "Ayush Yadav";
/** character index → machine (see file header). */
const MACHINE: Record<number, string> = {
  0: "dividers",
  3: "road",
  7: "dial",
  9: "runner",
  10: "bird",
};

const NS = "http://www.w3.org/2000/svg";
const INK_WET = "#4A382A";
const INK = "#26231C";

type G = {
  fs: number;
  base: number;
  xH: number;
  capH: number;
  W: number;
  H: number;
  nameW: number;
  box: { x: number; w: number }[];
  sw: number;
  beadR: number;
  txtStyle: string;
};

type Machine = {
  /** Run the machine to its LANDED pose — letterform assembled, ink
   *  still wet. The shared drying wave (performEnsemble) owns the rest:
   *  round 10 moved the dry out of each machine so the five letters
   *  resolve as ONE event instead of five. */
  play: () => Promise<void>;
  /** What the shared dry needs: the text-bearing groups, the letter
   *  indices to restore, and any scaffold (boss, pin, bead) that fades
   *  with the drying ink. */
  settle: { parts: SVGElement[]; idxs: number[]; scaffold?: SVGElement[] };
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const deg = (r: number) => (r * 180) / Math.PI;

/**
 * The nameplate: server-renders the finished plate (one span per
 * character, full ink — every static world's first and only frame),
 * and mounts the machines in the motion world.
 *
 * @returns The h1 plate, its baseline rule, and nothing else — the
 *   dateline and claim stay in StoryShell where the copy lives.
 */

/* ════════════════════════════════════════════════════════════════════
   Geometry — measured, never asserted
   ════════════════════════════════════════════════════════════════════ */

/**
 * Restore the font's kern pairs (per-character spans defeat them):
 * pair width minus summed singles, measured at the settled axes,
 * applied in em so it survives the clamp. Layout truth — runs in
 * every JS world, motion or still (the port's first A7 diff caught
 * it applied by the machines only, and the static plate disagreed
 * with the settled one by a "Ya" pair's worth of ink).
 *
 * @param h1 - The nameplate
 * @param letters - The character spans
 */
/**
 * One em of `el`'s font, measured in the SAME space as
 * getBoundingClientRect. Under a CSS-zoom-like page zoom the computed
 * `font-size` stays in unzoomed px while rects come back zoomed, so a
 * ratio of the two is inflated by exactly the zoom: at 1.5x every kern
 * margin came out 1.5x too large and the name compressed by 7.5px, and
 * the inline margins kept that error after zooming back to 100%.
 * Measured, not assumed: a 1em-wide inline-block reports its own width
 * in whatever space the rects are in.
 *
 * @param el - An element carrying the font whose em is wanted
 * @returns The em in client-rect px
 */
function rectEm(el: HTMLElement): number {
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;visibility:hidden;display:inline-block;width:1em;height:0;font:inherit";
  el.appendChild(probe);
  const em = probe.getBoundingClientRect().width;
  probe.remove();
  return em || parseFloat(getComputedStyle(el).fontSize);
}

export function applyKern(h1: HTMLElement, letters: HTMLElement[]): void {
  const meter = document.createElement("span");
  meter.style.cssText =
    "position:absolute;visibility:hidden;white-space:pre;font:inherit;" +
    'letter-spacing:inherit;font-variation-settings:"opsz" 144, "SOFT" 50, "WONK" 0, "wght" 600;';
  h1.appendChild(meter);
  const w = (s: string) => {
    meter.textContent = s;
    return meter.getBoundingClientRect().width;
  };
  const fs = rectEm(h1); /* rect space, like w(): see rectEm */
  const text = letters.map((s) => s.textContent ?? "");
  for (let k = 1; k < text.length; k++) {
    const kern = w(text[k - 1] + text[k]) - (w(text[k - 1]) + w(text[k]));
    if (Math.abs(kern) > 0.25) {
      letters[k].style.marginLeft = `${(kern / fs).toFixed(4)}em`;
    }
  }
  meter.remove();
}

/**
 * Measure the SETTLED plate — from a hidden, animation-stripped clone
 * (inline styles, kern margins included, come along with cloneNode),
 * because the still letters' opsz arrival is changing glyph advances
 * on the live h1 for the show's first ~1.5s and a live measure lands
 * every machine to the right of the A short (the round-9 doubled-v).
 *
 * @param plate - The plate wrapper (overlay coordinate space)
 * @param h1 - The live nameplate
 * @param letters - The live character spans
 * @returns Plate-local geometry for the machines
 */
export function measureSettled(
  plate: HTMLDivElement,
  h1: HTMLElement,
  letters: HTMLElement[]
): G {
  const clone = h1.cloneNode(true) as HTMLElement;
  clone.setAttribute("data-np-probe", "");
  clone.removeAttribute("id");
  clone.style.cssText =
    "position:absolute;left:0;top:0;width:100%;visibility:hidden;pointer-events:none";
  plate.appendChild(clone);
  const cLetters = Array.from(clone.querySelectorAll<HTMLElement>(".np-ch"));
  cLetters.forEach((s) => {
    s.style.opacity = "1";
  });
  /* rect space, like every other length here; `zoom` carries the CSS px
     the SVG's inline font-size is written in over to that space */
  const fs = rectEm(h1);
  const zoom = fs / parseFloat(getComputedStyle(h1).fontSize) || 1;

  /* type metrics: x-height/cap from unit probes; baseline from a 0×0
     inline marker (its bottom is the true ink baseline — a 1em-tall
     probe extends its own line box and lies by ~30px). */
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit;";
  const capOK = CSS.supports("height", "1cap");
  probe.innerHTML =
    '<span data-m="ex" style="display:inline-block;width:0;height:1ex"></span>' +
    (capOK
      ? '<span data-m="cap" style="display:inline-block;width:0;height:1cap"></span>'
      : "");
  clone.appendChild(probe);
  const exH = probe
    .querySelector('[data-m="ex"]')!
    .getBoundingClientRect().height;
  const capH = capOK
    ? probe.querySelector('[data-m="cap"]')!.getBoundingClientRect().height
    : exH * 1.45;
  probe.remove();
  const seat = document.createElement("span");
  seat.style.cssText =
    "display:inline-block;width:0;height:0;visibility:hidden";
  clone.appendChild(seat);
  const pr = plate.getBoundingClientRect();
  const base = seat.getBoundingClientRect().bottom - pr.top;
  seat.remove();

  const box = cLetters.map((s) => {
    const r = s.getBoundingClientRect();
    return { x: r.left - pr.left, w: r.width };
  });
  const nameW = clone.getBoundingClientRect().width;

  /* the machines render the REAL letterform: same face, same axes,
     same seat (svgtext-align: raster-identical to the span). Read the
     settled style off a machine letter — machine letters never run
     the opsz arrival, so their computed axes are the final values. */
  const cs = getComputedStyle(letters[0]);
  const txtStyle =
    `font-family:${cs.fontFamily};font-size:${parseFloat(cs.fontSize) * zoom}px;` +
    `font-weight:${cs.fontWeight};letter-spacing:${
      cs.letterSpacing.endsWith("px")
        ? `${parseFloat(cs.letterSpacing) * zoom}px`
        : cs.letterSpacing
    };` +
    `font-variation-settings:${cs.fontVariationSettings};font-optical-sizing:none`;

  clone.remove();
  return {
    fs,
    base,
    xH: exH,
    capH,
    W: pr.width,
    H: pr.height,
    nameW,
    box,
    sw: fs * 0.072,
    beadR: fs * 0.052,
    txtStyle,
  };
}

/* ════════════════════════════════════════════════════════════════════
   SVG helpers — the letterform as material
   ════════════════════════════════════════════════════════════════════ */

let mid = 0;

function el<K extends keyof SVGElementTagNameMap>(
  nm: K,
  attrs: Record<string, string | number>,
  parent?: Element
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, nm);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(n);
  return n;
}

function mkOverlay(plate: HTMLElement, g: G, cls = "np-mech"): SVGSVGElement {
  const svg = el("svg", {
    class: cls,
    viewBox: `0 0 ${g.W.toFixed(1)} ${g.H.toFixed(1)}`,
    "aria-hidden": "true",
    focusable: "false",
  });
  el("defs", {}, svg);
  plate.appendChild(svg);
  return svg;
}

function stroke<T extends SVGElement>(n: T, w: number): T {
  n.setAttribute("fill", "none");
  n.setAttribute("stroke", INK_WET);
  n.setAttribute("stroke-width", String(w));
  n.setAttribute("stroke-linecap", "round");
  n.setAttribute("stroke-linejoin", "round");
  return n;
}

function mkText(parent: Element, g: G, letters: HTMLElement[], i: number) {
  const t = el(
    "text",
    { x: g.box[i].x.toFixed(2), y: g.base.toFixed(2), fill: INK_WET },
    parent
  );
  t.setAttribute("style", g.txtStyle);
  t.textContent = letters[i].textContent;
  return t;
}

/** A piece of the real letter, bounded by a polygon (letter-box
 *  fractions; fy 0 = cap/x line, 1 = baseline), free to transform. */
function clipped(
  svg: SVGSVGElement,
  g: G,
  letters: HTMLElement[],
  i: number,
  poly: [number, number][],
  unit: "cap" | "x"
) {
  const b = g.box[i];
  const h = unit === "cap" ? g.capH : g.xH;
  const top = g.base - h;
  const id = `npc${++mid}`;
  el(
    "path",
    {
      d:
        "M " +
        poly
          .map(
            ([fx, fy]) =>
              `${(b.x + fx * b.w).toFixed(1)} ${(top + fy * h).toFixed(1)}`
          )
          .join(" L ") +
        " Z",
    },
    el("clipPath", { id }, svg.querySelector("defs")!)
  );
  const gRot = el("g", {}, svg);
  const gCl = el("g", { "clip-path": `url(#${id})` }, gRot);
  return { gRot, gCl, text: mkText(gCl, g, letters, i) };
}

/** Reveal a piece along a skeleton with a masked stroke (the one
 *  sanctioned dash draw). The dash gap is sized past the path so round
 *  caps cannot pre-reveal the terminals (the round-9 3× finding). */
function wipe(
  svg: SVGSVGElement,
  g: G,
  target: SVGElement,
  dPath: string,
  widthPx: number
) {
  const id = `npm${++mid}`;
  const mask = el(
    "mask",
    {
      id,
      maskUnits: "userSpaceOnUse",
      x: 0,
      y: 0,
      width: g.W.toFixed(0),
      height: g.H.toFixed(0),
    },
    svg.querySelector("defs")!
  );
  const s = el(
    "path",
    {
      d: dPath,
      fill: "none",
      stroke: "#fff",
      "stroke-width": widthPx,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    mask
  );
  const L = s.getTotalLength();
  const L0 = L + widthPx / 2 + 1;
  s.style.strokeDasharray = `${L} ${L + widthPx + 2}`;
  s.style.strokeDashoffset = `${L0}`;
  target.setAttribute("mask", `url(#${id})`);
  return { s, L: L0 };
}

const fPath = (g: G, i: number, unit: "cap" | "x", pts: [number, number][]) => {
  const b = g.box[i];
  const h = unit === "cap" ? g.capH : g.xH;
  const top = g.base - h;
  return (
    "M " +
    pts
      .map(
        ([fx, fy]) =>
          `${(b.x + fx * b.w).toFixed(1)} ${(top + fy * h).toFixed(1)}`
      )
      .join(" L ")
  );
};

/** The dry: fill animates wet→ink on the machine's own text pieces
 *  (identical geometry beneath the span — nothing pulses), scaffold
 *  fades, then the invisible swap to the span. `delay` is the drying
 *  wave's seat (round 10): the ensemble dries all five letters in one
 *  left-to-right sweep, 90ms apart, so the name resolves as ONE piece
 *  coming together rather than five finishes. */
async function dry(
  letters: HTMLElement[],
  parts: SVGElement[],
  idxs: number[],
  scaffold: SVGElement[] = [],
  ms = 380,
  delay = 0
) {
  for (const p of parts)
    p.querySelectorAll("text").forEach((t) =>
      t.animate([{ fill: INK_WET }, { fill: INK }], {
        duration: ms,
        delay,
        fill: "both",
        easing: "ease",
      })
    );
  for (const p of scaffold)
    p.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: ms,
      delay,
      fill: "both",
      easing: "ease",
    });
  await sleep(delay + ms + 40);
  for (const i of idxs) {
    letters[i].style.opacity = "";
    letters[i].dataset.npDone = "";
  }
  for (const p of parts) p.remove();
}

/* ════════════════════════════════════════════════════════════════════
   The five machines (geometry cites scan-letterform9)
   ════════════════════════════════════════════════════════════════════ */

function mkDividers(
  svg: SVGSVGElement,
  g: G,
  letters: HTMLElement[],
  rnd: () => number
): Machine {
  const b = g.box[0];
  const capTop = g.base - g.capH;
  /* stem centrelines intersect at (.473, −.109·cap) — the hinge boss
     sits above the apex slab, as on the instrument */
  const px = b.x + 0.473 * b.w;
  const py = capTop - 0.109 * g.capH;
  const feet = { L: b.x + 0.101 * b.w, R: b.x + 0.861 * b.w };
  /* crossbar notches follow the stems' inner-edge slopes */
  const legL = clipped(
    svg,
    g,
    letters,
    0,
    [
      [-0.15, -0.3],
      [0.435, -0.3],
      [0.435, 0.578],
      [0.282, 0.578],
      [0.25, 0.686],
      [0.435, 0.686],
      [0.435, 1.12],
      [-0.15, 1.12],
    ],
    "cap"
  );
  const legR = clipped(
    svg,
    g,
    letters,
    0,
    [
      [0.435, -0.3],
      [1.2, -0.3],
      [1.2, 1.12],
      [0.435, 1.12],
      [0.435, 0.686],
      [0.625, 0.686],
      [0.59, 0.578],
      [0.435, 0.578],
    ],
    "cap"
  );
  const barP = clipped(
    svg,
    g,
    letters,
    0,
    [
      [0.24, 0.572],
      [0.635, 0.572],
      [0.635, 0.688],
      [0.24, 0.688],
    ],
    "cap"
  );
  const barW = wipe(
    svg,
    g,
    barP.gCl,
    fPath(g, 0, "cap", [
      [0.23, 0.63],
      [0.645, 0.63],
    ]),
    0.16 * g.capH
  );
  const gAll = el("g", {}, svg);
  gAll.appendChild(legL.gRot);
  gAll.appendChild(legR.gRot);
  gAll.appendChild(barP.gRot);
  const boss = stroke(
    el("circle", { cx: px, cy: py, r: g.fs * 0.058 }, gAll),
    g.sw * 0.55
  );
  const pin = el(
    "circle",
    { cx: px, cy: py, r: g.fs * 0.03, fill: INK_WET },
    gAll
  );
  gAll.style.transformBox = "view-box";
  const phi = (dx: number, dy: number) => deg(Math.atan2(-dx, dy));
  const dyF = g.base - py;
  const clL = -phi(feet.L - px, dyF);
  const clR = -phi(feet.R - px, dyF);
  const legLen = Math.max(
    Math.hypot(feet.L - px, dyF),
    Math.hypot(feet.R - px, dyF)
  );
  /* closed on its points, the assembly rides lower by the leg-length
     surplus — the true kinematics of dividers standing on paper */
  const cTy = legLen - dyF;
  for (const [p, cl] of [
    [legL, clL],
    [legR, clR],
  ] as const) {
    p.gRot.style.transformOrigin = `${px}px ${py}px`;
    p.gRot.style.transformBox = "view-box";
    p.gRot.style.transform = `rotate(${cl}deg)`;
  }
  gAll.style.transform = `translateY(${cTy.toFixed(1)}px)`;
  gAll.style.opacity = "0";
  const openKf = (cl: number, ov: number) => [
    { transform: `rotate(${cl}deg)`, easing: "cubic-bezier(.55,.08,.60,.35)" },
    {
      transform: `rotate(${(cl * 1.075).toFixed(2)}deg)`,
      offset: 0.09,
      easing: "cubic-bezier(.32,.55,.18,1)",
    },
    {
      transform: `rotate(${(-Math.sign(cl) * ov).toFixed(2)}deg)`,
      offset: 0.8,
      easing: "cubic-bezier(.36,.02,.30,1)",
    },
    {
      transform: `rotate(${(Math.sign(cl) * ov * 0.28).toFixed(2)}deg)`,
      offset: 0.92,
      easing: "cubic-bezier(.35,.10,.30,1)",
    },
    { transform: "rotate(0deg)" },
  ];
  return {
    settle: { parts: [gAll], idxs: [0], scaffold: [boss, pin] },
    async play() {
      gAll.animate(
        [
          { opacity: 0, transform: `translateY(${(cTy - 8).toFixed(1)}px)` },
          { opacity: 1, transform: `translateY(${cTy.toFixed(1)}px)` },
        ],
        { duration: 380, fill: "both", easing: "cubic-bezier(.25,.7,.3,1)" }
      );
      await sleep(440);
      const ov = 2.4 + rnd() * 1.6;
      /* the right (heavy) leg leads; the left follows 90ms later —
         the way a hand opens dividers, never a mirrored pair */
      legR.gRot.animate(openKf(clR, ov), { duration: 1250, fill: "both" });
      legL.gRot.animate(openKf(clL, ov * 0.9), {
        duration: 1160,
        delay: 90,
        fill: "both",
      });
      gAll.animate(
        [
          { transform: `translateY(${cTy.toFixed(1)}px)` },
          {
            transform: `translateY(${(cTy * 1.02).toFixed(1)}px)`,
            offset: 0.09,
          },
          { transform: "translateY(-0.5px)", offset: 0.8 },
          { transform: "translateY(0.2px)", offset: 0.92 },
          { transform: "translateY(0px)" },
        ],
        { duration: 1250, fill: "both" }
      );
      await sleep(1310);
      barW.s.animate([{ strokeDashoffset: barW.L }, { strokeDashoffset: 0 }], {
        duration: 450,
        fill: "both",
        easing: "cubic-bezier(.42,.05,.24,1)",
      });
      await sleep(500);
    },
  };
}

function sPathD(g: G): string {
  const b = g.box[3];
  const xT = g.base - g.xH;
  const p = (fx: number, fy: number) =>
    `${(b.x + fx * b.w).toFixed(1)} ${(xT + fy * g.xH).toFixed(1)}`;
  return (
    `M ${p(0.865, 0.115)} ` +
    `C ${p(0.8, 0.015)} ${p(0.66, -0.01)} ${p(0.55, 0.035)} ` +
    `C ${p(0.38, 0.1)} ${p(0.24, 0.16)} ${p(0.21, 0.27)} ` +
    `C ${p(0.19, 0.38)} ${p(0.3, 0.44)} ${p(0.46, 0.49)} ` +
    `C ${p(0.62, 0.54)} ${p(0.78, 0.6)} ${p(0.83, 0.7)} ` +
    `C ${p(0.875, 0.8)} ${p(0.82, 0.935)} ${p(0.6, 0.975)} ` +
    `C ${p(0.42, 1.005)} ${p(0.2, 0.95)} ${p(0.155, 0.815)}`
  );
}

function mkRoad(svg: SVGSVGElement, g: G, letters: HTMLElement[]): Machine {
  const d = sPathD(g);
  const gRd = el("g", {}, svg);
  const gT = el("g", {}, gRd);
  mkText(gT, g, letters, 3);
  /* .52·w covers the widest perpendicular stroke including the pocket
     under the top terminal ball; counters stay outside the half-width */
  const rw = wipe(svg, g, gT, d, 0.52 * g.box[3].w);
  const bead = el("circle", { r: g.beadR, fill: INK_WET }, gRd);
  bead.style.offsetPath = `path("${d}")`;
  bead.style.offsetRotate = "0deg";
  bead.style.opacity = "0";
  return {
    settle: { parts: [gRd], idxs: [3], scaffold: [bead] },
    async play() {
      bead.animate(
        [
          {
            opacity: 0,
            transform: `translateY(${(-0.1 * g.xH).toFixed(1)}px)`,
          },
          { opacity: 1, transform: "translateY(0px)" },
        ],
        { duration: 350, fill: "both", easing: "cubic-bezier(.3,.6,.25,1)" }
      );
      await sleep(400);
      const opt: KeyframeAnimationOptions = {
        duration: 1150,
        fill: "both",
        easing: "cubic-bezier(.40,.06,.16,1)",
      };
      rw.s.animate([{ strokeDashoffset: rw.L }, { strokeDashoffset: 0 }], opt);
      bead.animate([{ offsetDistance: "0%" }, { offsetDistance: "100%" }], opt);
      await sleep(1150 + 230);
    },
  };
}

function dialGeom(g: G, i: number) {
  const b = g.box[i];
  const xT = g.base - g.xH;
  return {
    cx: b.x + 0.475 * b.w,
    cy: xT + 0.755 * g.xH,
    rx: 0.285 * b.w,
    ry: 0.235 * g.xH,
    w: b.w,
    rest: -40,
    pt: (r: number, a: number): [number, number] => [
      b.x + 0.475 * b.w + r * 0.285 * b.w * Math.cos((a * Math.PI) / 180),
      xT + 0.755 * g.xH + r * 0.235 * g.xH * Math.sin((a * Math.PI) / 180),
    ],
  };
}

function needleD(g: G, d: ReturnType<typeof dialGeom>, a: number): string {
  const [x0, y0] = d.pt(0.12, a);
  const [x1, y1] = d.pt(0.8, a);
  const nx = -(y1 - y0);
  const ny = x1 - x0;
  const L = Math.hypot(nx, ny);
  const ux = nx / L;
  const uy = ny / L;
  const w0 = g.fs * 0.02;
  const w1 = g.fs * 0.006;
  return (
    `M ${(x0 + ux * w0).toFixed(1)} ${(y0 + uy * w0).toFixed(1)}` +
    ` L ${(x1 + ux * w1).toFixed(1)} ${(y1 + uy * w1).toFixed(1)}` +
    ` L ${(x1 - ux * w1).toFixed(1)} ${(y1 - uy * w1).toFixed(1)}` +
    ` L ${(x0 - ux * w0).toFixed(1)} ${(y0 - uy * w0).toFixed(1)} Z`
  );
}

function mkDial(
  svg: SVGSVGElement,
  g: G,
  letters: HTMLElement[],
  rnd: () => number
): Machine {
  const d = dialGeom(g, 7);
  const gDl = el("g", {}, svg);
  const gF = el("g", {}, gDl);
  stroke(
    el("ellipse", { cx: d.cx, cy: d.cy, rx: d.rx, ry: d.ry }, gF),
    g.sw * 0.5
  );
  el("circle", { cx: d.cx, cy: d.cy, r: g.fs * 0.02, fill: INK_WET }, gF);
  const gN = el("g", {}, gF);
  el("path", { d: needleD(g, d, d.rest), fill: INK_WET }, gN);
  gN.style.transformOrigin = `${d.cx}px ${d.cy}px`;
  gN.style.transformBox = "view-box";
  for (let k = 0; k < 7; k++) {
    const a = (k * 360) / 7 + d.rest;
    const home = k === 0;
    const [xa, ya] = d.pt(1.2, a);
    const [xb, yb] = d.pt(home ? 1.46 : 1.32, a);
    stroke(
      el(
        "path",
        {
          d: `M ${xa.toFixed(1)} ${ya.toFixed(1)} L ${xb.toFixed(1)} ${yb.toFixed(1)}`,
        },
        gF
      ),
      home ? g.sw * 0.5 : Math.max(1, g.sw * 0.28)
    );
  }
  gF.style.transformOrigin = `${d.cx}px ${d.cy}px`;
  gF.style.transformBox = "view-box";
  gF.style.opacity = "0";
  const bowl = clipped(
    svg,
    g,
    letters,
    7,
    [
      [-0.08, 0.465],
      [0.72, 0.465],
      [0.72, 1.1],
      [-0.08, 1.1],
    ],
    "x"
  );
  const bowlSk: string[] = [];
  for (let k = 0; k <= 30; k++) {
    const [x, y] = d.pt(1.0, d.rest - (k * 360) / 30);
    bowlSk.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const bowlW = wipe(svg, g, bowl.gCl, "M " + bowlSk.join(" L "), 0.44 * d.w);
  const shoulder = clipped(
    svg,
    g,
    letters,
    7,
    [
      [-0.08, -0.1],
      [1.12, -0.1],
      [1.12, 0.475],
      [-0.08, 0.475],
    ],
    "x"
  );
  const shoulderW = wipe(
    svg,
    g,
    shoulder.gCl,
    fPath(g, 7, "x", [
      [0.759, 0.48],
      [0.757, 0.34],
      [0.75, 0.2],
      [0.715, 0.115],
      [0.62, 0.072],
      [0.5, 0.072],
      [0.385, 0.105],
      [0.29, 0.17],
      [0.24, 0.27],
      [0.218, 0.4],
    ]),
    0.3 * d.w
  );
  const stemP = clipped(
    svg,
    g,
    letters,
    7,
    [
      [0.575, 0.465],
      [1.12, 0.465],
      [1.12, 1.1],
      [0.575, 1.1],
    ],
    "x"
  );
  const stemW = wipe(
    svg,
    g,
    stemP.gCl,
    fPath(g, 7, "x", [
      [0.759, 0.47],
      [0.758, 0.62],
      [0.757, 0.76],
      [0.762, 0.86],
      [0.78, 0.925],
      [0.83, 0.955],
      [0.9, 0.955],
      [0.97, 0.935],
    ]),
    0.46 * d.w
  );
  gDl.appendChild(bowl.gRot);
  gDl.appendChild(shoulder.gRot);
  gDl.appendChild(stemP.gRot);
  const DET = 360 / 7;
  const STEPS = 12;
  return {
    settle: { parts: [gDl], idxs: [7] },
    async play() {
      gF.animate(
        [
          { opacity: 0, transform: "scale(.97)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 400, fill: "both", easing: "cubic-bezier(.25,.6,.3,1)" }
      );
      await sleep(650);
      /* twelve detents, decaying — a blur resolving into clicks; the
         last two hesitate; the catch overshoots and springs home */
      const kf: Keyframe[] = [
        { transform: `rotate(${-STEPS * DET}deg)`, offset: 0 },
      ];
      const ivs: number[] = [];
      let iv = 1;
      for (let k = 0; k < STEPS; k++) {
        ivs.push(iv);
        iv *= 1.26;
      }
      const T = ivs.reduce((a2, b2) => a2 + b2, 0);
      let acc = 0;
      for (let k = 1; k <= STEPS; k++) {
        acc += ivs[k - 1];
        const off = acc / T;
        const ang = -(STEPS - k) * DET;
        if (k >= STEPS - 2 && k < STEPS) {
          kf.push({
            transform: `rotate(${ang}deg)`,
            offset: Math.min(0.996, off),
          });
          kf.push({
            transform: `rotate(${ang}deg)`,
            offset: Math.min(0.998, off + 0.014),
          });
        } else if (k === STEPS) {
          const ov = 3.6 + rnd() * 1.8;
          kf.push({
            transform: `rotate(${ov.toFixed(2)}deg)`,
            offset: Math.max(0, off - 0.055),
          });
          kf.push({
            transform: `rotate(${(-ov * 0.22).toFixed(2)}deg)`,
            offset: Math.max(0, off - 0.02),
          });
          kf.push({ transform: "rotate(0deg)", offset: 1 });
        } else {
          kf.push({ transform: `rotate(${ang}deg)`, offset: off });
        }
      }
      gN.animate(kf, { duration: 1350, fill: "both", easing: "linear" });
      await sleep(1410);
      const ease = "cubic-bezier(.35,.05,.25,1)";
      bowlW.s.animate(
        [{ strokeDashoffset: bowlW.L }, { strokeDashoffset: 0 }],
        {
          duration: 550,
          fill: "both",
          easing: ease,
        }
      );
      shoulderW.s.animate(
        [{ strokeDashoffset: shoulderW.L }, { strokeDashoffset: 0 }],
        { duration: 500, delay: 60, fill: "both", easing: ease }
      );
      stemW.s.animate(
        [{ strokeDashoffset: stemW.L }, { strokeDashoffset: 0 }],
        {
          duration: 450,
          delay: 100,
          fill: "both",
          easing: ease,
        }
      );
      gF.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 400,
        delay: 120,
        fill: "both",
        easing: "ease",
      });
      await sleep(660);
    },
  };
}

function mkRunner(
  svg: SVGSVGElement,
  g: G,
  letters: HTMLElement[],
  rnd: () => number
): Machine {
  const b = g.box[9];
  const outer = el("g", {}, svg);
  const gait = el("g", {}, outer);
  mkText(gait, g, letters, 9);
  const runup = g.W - b.x + 40;
  gait.style.transformOrigin = `${(b.x + 0.77 * b.w).toFixed(1)}px ${g.base.toFixed(1)}px`;
  gait.style.transformBox = "view-box";
  outer.style.transform = `translate(${runup}px, 0)`;
  const bh = 0.055 * g.xH;
  return {
    settle: { parts: [outer], idxs: [9] },
    async play() {
      outer.animate(
        [
          { transform: `translate(${runup}px, 0)` },
          { transform: "translate(0px, 0)" },
        ],
        { duration: 1250, fill: "both", easing: "cubic-bezier(.16,.84,.22,1)" }
      );
      const j = (v: number) => v * (1 + (rnd() - 0.5) * 0.2);
      const G2 = (r: number, y: number, sy: number) =>
        `rotate(${r}deg) translateY(${y.toFixed(1)}px) scaleY(${sy})`;
      /* four bounds decaying; airborne stretch, landing squash ≤1.5%;
         plants PAST upright at .86 — momentum — rocks back, stands */
      gait.animate(
        [
          { transform: G2(-9.5, 0, 0.988) },
          { transform: G2(-8.6, -j(bh), 1.006), offset: 0.11 },
          { transform: G2(-7.4, 0, 0.985), offset: 0.22 },
          { transform: G2(-6.0, -j(bh * 0.72), 1.005), offset: 0.33 },
          { transform: G2(-4.6, 0, 0.987), offset: 0.44 },
          { transform: G2(-3.2, -j(bh * 0.45), 1.004), offset: 0.55 },
          { transform: G2(-1.9, 0, 0.99), offset: 0.66 },
          { transform: G2(-0.9, -j(bh * 0.22), 1.002), offset: 0.76 },
          { transform: G2(1.3, 0, 0.995), offset: 0.86 },
          { transform: G2(-0.4, 0, 1), offset: 0.94 },
          { transform: G2(0, 0, 1) },
        ],
        { duration: 1250, fill: "both", easing: "linear" }
      );
      await sleep(1330);
    },
  };
}

function birdGeom(g: G) {
  const b = g.box[10];
  const vx = b.x + 0.52 * b.w;
  const vy = g.base - 0.005 * g.xH;
  const up = (0.995 - 0.25) * g.xH;
  const tiltL = deg(Math.atan2((0.258 - 0.52) * b.w, up));
  const tiltR = deg(Math.atan2((0.881 - 0.52) * b.w, up));
  return { vx, vy, tiltL, tiltR };
}

function flightD(g: G, vx: number, vy: number): string {
  const capTop = g.base - g.capH;
  const yc = capTop - Math.min(0.42 * g.capH, 64);
  const W = g.W;
  const p = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  return (
    `M ${p(-70, yc + 4)} ` +
    `C ${p(W * 0.14, yc - 20)} ${p(W * 0.27, yc + 14)} ${p(W * 0.42, yc - 4)} ` +
    `C ${p(W * 0.56, yc - 24)} ${p(W * 0.68, yc - 6)} ${p(W * 0.78, yc + 6)} ` +
    `C ${p(vx - 170, vy - 190)} ${p(vx - 120, vy - 140)} ${p(vx - 58, vy - 64)} ` +
    `C ${p(vx - 30, vy - 30)} ${p(vx - 10, vy - 9)} ${p(vx, vy - 4)}`
  );
}

function mkBird(
  svg: SVGSVGElement,
  g: G,
  letters: HTMLElement[],
  rnd: () => number
): Machine {
  const bg = birdGeom(g);
  const fs = g.fs;
  const j = (v: number) => v * (1 + (rnd() - 0.5) * 0.14);

  /* the letter's own strokes, hinged at the vertex (the lock) */
  const gLock = el("g", {}, svg);
  const lockL = clipped(
    svg,
    g,
    letters,
    10,
    [
      [-0.2, -0.12],
      [0.622, -0.12],
      [0.622, 0.78],
      [0.74, 1.0],
      [0.74, 1.14],
      [-0.2, 1.14],
    ],
    "x"
  );
  const lockR = clipped(
    svg,
    g,
    letters,
    10,
    [
      [0.622, -0.12],
      [1.2, -0.12],
      [1.2, 1.14],
      [0.4, 1.14],
      [0.622, 0.78],
    ],
    "x"
  );
  gLock.appendChild(lockL.gRot);
  gLock.appendChild(lockR.gRot);
  const RAISE_L = -12 - bg.tiltL;
  const RAISE_R = 14 - bg.tiltR;
  for (const [p, r] of [
    [lockL, RAISE_L],
    [lockR, RAISE_R],
  ] as const) {
    p.gRot.style.transformOrigin = `${bg.vx}px ${bg.vy}px`;
    p.gRot.style.transformBox = "view-box";
    p.gRot.style.transform = `rotate(${r.toFixed(1)}deg)`;
  }
  gLock.style.opacity = "0";

  /* the drawn bird (flight only; retires at the cut) */
  const gB = el("g", {}, svg);
  const gAtt = el("g", {}, gB);
  for (const n of [gB, gAtt]) {
    n.style.transformBox = "view-box";
    n.style.transformOrigin = "0px 0px";
  }
  const bp = (x: number, y: number) =>
    `${(x * fs).toFixed(1)} ${(y * fs).toFixed(1)}`;
  const body = el(
    "path",
    {
      d:
        `M ${bp(0.105, -0.004)}` +
        ` C ${bp(0.098, -0.014)} ${bp(0.085, -0.021)} ${bp(0.07, -0.023)}` +
        ` C ${bp(0.052, -0.025)} ${bp(0.03, -0.02)} ${bp(0.006, -0.015)}` +
        ` C ${bp(-0.03, -0.008)} ${bp(-0.062, -0.003)} ${bp(-0.085, -0.004)}` +
        ` L ${bp(-0.106, -0.01)} L ${bp(-0.094, 0.0)} L ${bp(-0.104, 0.01)}` +
        ` C ${bp(-0.075, 0.014)} ${bp(-0.04, 0.018)} ${bp(-0.005, 0.018)}` +
        ` C ${bp(0.03, 0.017)} ${bp(0.06, 0.011)} ${bp(0.082, 0.003)}` +
        ` C ${bp(0.092, 0.0)} ${bp(0.1, -0.002)} ${bp(0.105, -0.004)} Z`,
      fill: INK_WET,
    },
    gAtt
  );
  body.style.transformBox = "view-box";
  body.style.transformOrigin = "0px 0px";
  const gWings = el("g", {}, gAtt);
  const wing = (mx: number, cs: number) => {
    const w = (x: number, y: number) =>
      `${(mx * cs * x * fs).toFixed(1)} ${(y * fs).toFixed(1)}`;
    const sh = el("g", {}, gWings);
    el(
      "path",
      {
        d:
          `M ${w(0.048, 0.01)}` +
          ` C ${w(0.058, -0.05)} ${w(0.054, -0.105)} ${w(0.04, -0.158)}` +
          ` L ${w(-0.03, -0.15)}` +
          ` C ${w(-0.038, -0.1)} ${w(-0.042, -0.048)} ${w(-0.037, 0.01)} Z`,
        fill: INK_WET,
      },
      sh
    );
    const wr = el("g", {}, sh);
    el(
      "path",
      {
        d:
          `M ${w(0.044, 0.02)}` +
          ` C ${w(0.03, -0.048)} ${w(0.013, -0.098)} ${w(-0.014, -0.141)}` +
          ` L ${w(-0.022, -0.134)} L ${w(-0.026, -0.116)}` +
          ` L ${w(-0.036, -0.122)} L ${w(-0.038, -0.102)}` +
          ` C ${w(-0.041, -0.062)} ${w(-0.04, -0.022)} ${w(-0.038, 0.02)} Z`,
        fill: INK_WET,
      },
      wr
    );
    for (const n of [sh, wr]) {
      n.style.transformBox = "view-box";
      n.style.transformOrigin = "0px 0px";
    }
    return { sh, wr };
  };
  const wLf = wing(-1, 1.0);
  const wRt = wing(1, 0.52);
  const WRIST = -0.152 * fs;

  const fd = flightD(g, bg.vx, bg.vy);
  const meas = el("path", { d: fd, fill: "none", stroke: "none" }, svg);
  const FL = meas.getTotalLength();
  const N = 56;
  const tKf: Keyframe[] = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const s = 1 - Math.pow(1 - t, 1.78);
    const pt = meas.getPointAtLength(s * FL);
    tKf.push({
      transform: `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px)`,
      offset: t,
    });
  }
  meas.remove();
  gB.style.transform = "translate(-70px, -70px)";

  const ATT_END = -5;
  const attKf: Keyframe[] = (
    [
      [0.0, 3, 0],
      [0.05, 6, -1.8],
      [0.1, -4, 1.2],
      [0.16, -7, -1.6],
      [0.24, 4, 1.0],
      [0.32, 7, -1.4],
      [0.42, -5, 0.8],
      [0.52, -2, -0.8],
      [0.62, 2, 0.4],
      [0.75, 4, 1.6],
      [0.86, -2, 0.6],
      [0.93, -19, -2.5],
      [0.97, -10, -0.8],
      [1.0, ATT_END, 0],
    ] as [number, number, number][]
  ).map(([o, r, y]) => ({
    offset: o,
    transform: `rotate(${r}deg) translateY(${y}px)`,
  }));

  const wF_L = ATT_END - -12;
  const wF_R = 14 - ATT_END;
  const FLAP: [number, number, number][] = [
    [0.0, 55, 12],
    [0.045, 96, 15],
    [0.075, 90, -7],
    [0.115, 30, -15],
    [0.15, 38, 5],
    [0.185, 99, 14],
    [0.215, 92, -7],
    [0.255, 34, -15],
    [0.29, 40, 4],
    [0.325, 94, 13],
    [0.36, 88, -6],
    [0.395, 40, -13],
    [0.43, 46, 4],
    [0.465, 86, 11],
    [0.5, 80, -5],
    [0.535, 48, -11],
    [0.6, 70, -4],
    [0.66, 73, -3],
    [0.76, 71, -4],
    [0.84, 67, -5],
    [0.88, 30, -12],
    [0.93, -4, -5],
    [0.965, 1.5, -1],
    [1.0, 0, 0],
  ];
  const flapKf = (s: number, lead: number, amp: number, wEnd: number) =>
    FLAP.map(([t, w2, r], i) => {
      const last3 = i >= FLAP.length - 3;
      const om = last3 ? w2 + wEnd : t < 0.6 ? j(w2 * amp) : w2;
      const o =
        i === 0 || i === FLAP.length - 1
          ? t
          : Math.min(0.999, Math.max(0.001, t + lead));
      return {
        offset: o,
        transform: `rotate(${(s * om).toFixed(1)}deg)`,
        rho: r,
      };
    });
  const wristKf = (kf: { offset: number; rho: number }[], s: number) =>
    kf.map(({ offset, rho }) => ({
      offset: Math.min(0.999, offset + 0.02),
      transform: `translate(0px, ${WRIST.toFixed(1)}px) rotate(${(s * rho).toFixed(1)}deg)`,
    }));

  return {
    settle: { parts: [gB, gLock], idxs: [10] },
    async play() {
      const DUR = 2000;
      gB.animate(tKf, { duration: DUR, fill: "both", easing: "linear" });
      gAtt.animate(attKf, { duration: DUR, fill: "both", easing: "linear" });
      const kL = flapKf(-1, -0.015, 1.0, wF_L);
      const kR = flapKf(1, 0.015, 0.88 + rnd() * 0.1, wF_R);
      wLf.sh.animate(
        kL.map(({ offset, transform }) => ({ offset, transform })),
        { duration: DUR, fill: "both", easing: "linear" }
      );
      wRt.sh.animate(
        kR.map(({ offset, transform }) => ({ offset, transform })),
        { duration: DUR, fill: "both", easing: "linear" }
      );
      wLf.wr.animate(wristKf(kL, -1), {
        duration: DUR,
        fill: "both",
        easing: "linear",
      });
      wRt.wr.animate(wristKf(kR, 1), {
        duration: DUR,
        fill: "both",
        easing: "linear",
      });
      await sleep(DUR);
      /* THE CUT — at the raised pose, minimum silhouette: the drawn
         bird retires and the letter's strokes fold to their stance;
         heavy left leads, hairline follows 80ms later. */
      gLock.style.opacity = "1";
      gWings.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 90,
        fill: "both",
        easing: "ease",
      });
      body.animate(
        [
          { opacity: 1, transform: "scaleY(1)" },
          { opacity: 0, transform: "scaleY(.78)" },
        ],
        { duration: 360, fill: "both", easing: "ease" }
      );
      const ovF = 2.8 + rnd() * 1.4;
      const foldKf = (from: number, ov: number): Keyframe[] => [
        {
          transform: `rotate(${from.toFixed(1)}deg)`,
          easing: "cubic-bezier(.42,.05,.28,1)",
        },
        {
          transform: `rotate(${(-Math.sign(from) * ov).toFixed(2)}deg)`,
          offset: 0.55,
          easing: "cubic-bezier(.35,.10,.30,1)",
        },
        {
          transform: `rotate(${(Math.sign(from) * ov * 0.32).toFixed(2)}deg)`,
          offset: 0.78,
          easing: "cubic-bezier(.35,.10,.30,1)",
        },
        { transform: "rotate(0deg)" },
      ];
      lockL.gRot.animate(foldKf(RAISE_L, ovF), { duration: 550, fill: "both" });
      lockR.gRot.animate(foldKf(RAISE_R, ovF * 0.8), {
        duration: 550,
        delay: 80,
        fill: "both",
      });
      await sleep(690);
    },
  };
}

/* ════════════════════════════════════════════════════════════════════
   Choreography
   ════════════════════════════════════════════════════════════════════ */

/**
 * The arrival ensemble — round 10: CONCURRENT AND UNHURRIED.
 *
 * The owner's direction reversed round 9's relay ("they are working by
 * timing — I want them to come altogether at the same time"): all five
 * machines now run AT ONCE — by ~1.75s every one of them is visibly
 * working — and the piece comes together at the end like a machine
 * shop closing a job, not five operations taking turns.
 *
 * Every move keeps its round-9 duration (nothing meaningful under
 * ~350ms — the fix he did not complain about); only the queueing is
 * gone. Start offsets are DERIVED from each machine's own length so
 * the LANDINGS sweep left → right across the name, 140ms apart —
 * A ~2.64s, s ~2.78s, dial ~2.92s, runner ~3.06s, and the v's fold
 * LAST at ~3.20s, the keystone. Then ONE shared drying wave (90ms per
 * letter, left → right) resolves all five letters as a single event,
 * and the letterpress press closes the line at ~4.5s total.
 *
 * @param plate - Overlay coordinate space
 * @param h1 - The nameplate (press target)
 * @param letters - The character spans
 * @param g - Settled geometry (measured pre-show)
 * @param alive - Abort probe (motion toggle, downshift, unmount)
 * @returns true if the performance ran to the end
 */
export async function performEnsemble(
  plate: HTMLDivElement,
  h1: HTMLElement,
  letters: HTMLElement[],
  g: G,
  alive: () => { alive: boolean }
): Promise<boolean> {
  const svg = mkOverlay(plate, g);
  const rnd = mulberry32(0x8ead + 9);
  let aborted = false;
  const guard = async (p: Promise<unknown>) => {
    await p;
    if (!alive().alive) {
      aborted = true;
      throw new Error("np-abort");
    }
  };
  /* Letter order, with each start = target landing − the machine's own
     played length (dividers 2250, road 1780, dial 2720, runner 1330,
     bird 2690 — the sums of their round-9 move durations).
 
     THE STARTS ARE PHASED TO THE ARRIVALS, and that is what they are for.
     The name has eleven slots and they fill from two sources: six letters
     the CSS sweep sets, and five their machine carries home. Measured from
     screencast pixels rather than from the DOM, no single configuration of
     the plate may stand for more than 0.6s — a held partial name reads as
     a bug, and a cold critic said so.
 
     Landings are laid into the gaps the sweep leaves, not bunched after
     it: road 1.95s, runner 2.20s, dividers 2.45s, dial 2.72s, bird 2.90s,
     against sweep arrivals at 0.57 / 0.72 / 1.02 / 1.32 / 1.62s. The
     largest gap in the whole assembly is 0.33s.
 
     No machine's own played length changed — the choreography is the
     owner's and this only decides when each one sets out. The ensemble
     moment is longer for it: ALL FIVE are in motion from 0.87s to 1.95s,
     against 1.73s to 2.64s before. */
  const plan: { start: number; make: () => Machine }[] = [
    { start: 0, make: () => mkDividers(svg, g, letters, rnd) },
    { start: 170, make: () => mkRoad(svg, g, letters) },
    { start: 0, make: () => mkDial(svg, g, letters, rnd) },
    { start: 640, make: () => mkRunner(svg, g, letters, rnd) },
    { start: 0, make: () => mkBird(svg, g, letters, rnd) },
  ];
  const built: (Machine | null)[] = plan.map(() => null);
  try {
    await Promise.all(
      plan.map(async ({ start, make }, k) => {
        await guard(sleep(start));
        const m = make();
        built[k] = m;
        /* THE APPARATUS LEAVES WHEN ITS WORK IS DONE, OR BY 2.2s, WHICHEVER
           COMES FIRST. Scaffolding used to be retired by the shared wave,
           which does not start until every machine has landed — so the
           dividers' pivot, a ring and a pin, stood over a finished "A" for
           more than a second and all three of one critic's personas read the
           first word as "Åyush". A machine that has set its letter down has
           nothing left to hold it with.

           The deadline is here because `play()` is not the letter landing:
           measured, the dividers place the "A" well before their play
           resolves, so awaiting it alone still left the ring on a legible
           name until 3.0s. It is PAGE time, not ensemble time — the first
           draft subtracted the ensemble's own start and so fired 2.2s after
           a clock that itself began near 0.8s, which is the 3.0s it was
           meant to fix. 2400 is read against the same origin as the rest of
           this file's measurements, and the floor keeps 600ms of apparatus
           on screen however late a cold load starts the run. Only the
           hardware goes early; the ink still dries as one piece. */
        let retired = false;
        const retire = () => {
          if (retired) return;
          retired = true;
          for (const sc of m.settle.scaffold ?? [])
            sc.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 260,
              fill: "both",
              easing: "ease",
            });
        };
        void sleep(Math.max(600, 2400 - performance.now())).then(retire);
        await guard(m.play());
        retire();
      })
    );
    /* THE WAVE IS A BARRIER, and that is what it costs. Nothing dries until
       every machine has landed, so the two long machines — the dial and the
       bird — deliver their letters together at the end and the plate stands
       on one partial name while it waits. Measured from screencast pixels:
       a[7] and v[10] arrived in the same frame, and the state before them
       held 672ms.

       The barrier stays, because drying as one piece left to right is the
       flourish the whole ensemble is built toward. What widens is the
       SWEEP across it: 190ms a letter instead of 90ms, which spends about
       400ms of tail to break one long hold into four short ones. The beat
       shortens to 70ms to pay most of that back. */
    await guard(sleep(70));
    await Promise.all(
      built.map((m, k) =>
        m
          ? dry(
              letters,
              m.settle.parts,
              m.settle.idxs,
              /* the scaffold has already gone, above; handing it to the wave
                 again would animate it from opacity 1 and flash it back */
              [],
              380,
              k * 190
            )
          : Promise.resolve()
      )
    );
    /* the press: one letterpress settle once the line is full —
       origin at the keystone's landing */
    h1.style.transformOrigin = "82% 78%";
    const press = h1.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(.995)", offset: 0.45 },
        { transform: "scale(1)" },
      ],
      { duration: 420, easing: "ease-out" }
    );
    await press.finished.catch(() => undefined);
  } catch {
    /* aborted: the settle path owns the cleanup */
  }
  svg.remove();
  h1.style.transformOrigin = "";
  return !aborted;
}

/* ════════════════════════════════════════════════════════════════════
   The living plate: the name answers the hand
   ════════════════════════════════════════════════════════════════════ */

/** The run's `stir` (src/run/index.html, "THE HAND"): the engine calls
 *  the stepper on every frame, scrolled or not, for as long as it returns
 *  true, and drops it on the frame it returns false. One rAF loop (F3). */
export type Stir = (step: (now: number) => boolean) => void;

/** Cheap, read-only state for the run's `__world.name()` probe. */
export type HandProbe = {
  live: boolean;
  steps: number;
  kicks: number;
  presses: number;
  /** the largest lift any bead has reached since mount, em */
  peak: number;
  /** each bead's lift and soak level this frame */
  lift: number[];
  level: number[];
  /** every span's style attribute is byte-for-byte its pre-mount self */
  rest: boolean;
  /** answers fired, by machine, and the most overlays ever live at once */
  fired: Record<string, number>;
  answering: number;
  maxLive: number;
};

/* THE NAME IS A STRING OF BEADS (v4, 2026-10-08).
   After the show the eleven spans are beads on one thread, the baseline:
   each is held to its seat by a spring and tied to its neighbours. The
   hand puts energy in by its SPEED, never by where it rests, so a parked
   cursor moves nothing and a page scrolled under one moves nothing, while
   a swoosh throws a wave that runs ahead of the hand. Each bead rides the
   wave (a lift, a turn that follows the string's local slope, a swell at
   the crest) and its ink soaks with its energy: SOFT rises and the optical
   size falls, so the hairlines thicken the way ink spreads into damp
   paper, and the ink goes wet (the machines' own #4A382A) and dries again
   behind the hand. That is the opening's wet → dry, answered by the hand.
   The owner asked for "not just get bold": weight moves least of all.

   The units are em and seconds, so the same gesture reads the same at
   every seat; the integration runs in fixed 1/240 s substeps, so a 60 Hz
   and a 120 Hz display move the beads identically.

   WHAT THE CASCADE DOES NOT LET THROUGH, each one measured on this page:
    · np-settype holds `transform` AND `font-variation-settings` on the six
      free letters forever (fill: both), and an animation outranks a plain
      inline style, so an inline axis write is dead on 6 of 11 letters.
      Motion therefore goes through the individual `translate` / `rotate` /
      `scale` properties, which no keyframe names, and the axes go in with
      `!important`, which outranks an animation in Chromium and WebKit both
      (probed: the computed axes follow the write in each). The plan's other
      route, `animation: none` on the letters while live, drops the six to
      the withholding rule's opacity 0, and taking it off again restarts
      the sweep from the first frame.
    · Every axis moves the advance: at 166.4px the name is 823.3px wide at
      rest, 839.0 at SOFT 100, 837.2 at wght 645 and 898.0 at opsz 76. So
      while a bead is live its width is pinned to its rest width and the
      glyph's growth is re-centred with a translate from a table measured at
      mount. The h1 box never moves; check-nameplate holds it to that.
    · WebKit fires trusted pointermoves with zero movement when the page
      scrolls under a still cursor (Chromium fires only pointerover). The
      hand's speed is therefore read in CLIENT space, where a scroll moves
      nothing, and any input within 150ms of a scroll is ignored outright. */
/* THE NUMBERS ARE NOT THE PLAN'S, and the filmstrips are why. Its 2.2 Hz
   beads under a 2500 s⁻² coupling, simulated with the code below and then
   filmed on the page (the two agreed to the millesimal), lifted each WORD
   as a block: 5.5 of the ten glyphs sat above half the crest at once, the
   crest trailed the hand by ~100ms, and a 1.6px/ms pass drove every
   letter to the soft ceiling. A bead that slow needs a quarter of its
   period to rise, so the lift lands behind the hand and piles up. Faster,
   better-damped beads keep the crest LOCAL (three letters: o O # O o),
   and the hand's reach is centred a little ahead of it, in proportion to
   its velocity, the way a moving hand pushes air: the crest arrives at
   each letter 20 to 40ms before the hand does, so the wave runs ahead of
   the hand. Above the reference speed the push grows with the root of
   speed, so a flung swoosh throws a longer wave, not a taller one. */
const BEAD = {
  /** the hand's reach along the line: Gaussian σ, and a hard cut (em) */
  sigma: 0.42,
  cut: 1.3,
  /** how far above the cap line and below the descenders it reaches (em) */
  band: 0.35,
  /** each bead's own spring (4 Hz) and its damping ratio */
  w0: 2 * Math.PI * 4,
  zeta: 0.6,
  /** neighbour coupling (s⁻²) and neighbour damping (s⁻¹) */
  k: 600,
  kd: 0,
  /** impulse per (em/s of hand speed × em of field swept); the speed
   *  under which a hand is only reading, not sweeping; the reference
   *  speed (1.6px/ms at 166.4px) above which the push goes as its root */
  gain: 0.7,
  vmin: 0.6,
  vref: 9.6,
  vmax: 60,
  /** the bow wave: the reach leads the hand by this × its velocity (s),
   *  never by more than `leadMax` (em) */
  lead: 0.07,
  leadMax: 0.9,
  /** a press: the struck bead is pushed down at this speed (em/s), and
   *  the push runs out both ways at `rc` em/s, losing `rho` a letter */
  press: 4,
  rc: 18,
  rho: 0.8,
  /** the lift that counts as a full soak (em), and the soft ceiling */
  full: 0.06,
  ceil: 0.12,
  /** the turn's ceiling (deg) and the crest's swell */
  rot: 5,
  swell: 0.035,
  /** rest: below these the chain snaps to exactly zero */
  restY: 0.001,
  restV: 0.012,
  dt: 1 / 240,
};

/* THE SOAK IS QUANTISED to nine levels, so a bead re-shapes its glyph at
   most when its level changes, and so the width table is nine columns.
   Its ceiling was chosen on the page, not in the plan: at the plan's
   opsz 76 / SOFT 100 / wght +40 with the full wet ink the whole word read
   as a different, chunkier face going brown (filmed: every letter at the
   ceiling at once), which is exactly "it just gets bold". At opsz 104 and
   SOFT 100 the hairlines thicken and the terminals round the way ink
   spreads into damp paper and it is still this face. Weight never moves. */
const SOAK = 8;
const WET = 0.6;
const soakAxes = (l: number) => {
  const t = l / SOAK;
  return (
    `"opsz" ${Math.round(144 - 40 * t)}, "SOFT" ${Math.round(50 + 50 * t)}, ` +
    `"WONK" 0, "wght" 600`
  );
};
const AXES = Array.from({ length: SOAK + 1 }, (_, l) => soakAxes(l));

/** Every property the hand writes, so rest removes exactly these. */
const OWN = [
  "opacity",
  "translate",
  "rotate",
  "scale",
  "width",
  "text-align",
  "transform-origin",
  "font-variation-settings",
  "color",
];

const rgbOf = (css: string): number[] => {
  const m = css.match(/[\d.]+/g);
  return m ? m.slice(0, 3).map(Number) : [0x26, 0x23, 0x1c];
};

/* The answers cut the letters along the SAME polygons the opening uses
   (scan-letterform9), so a machine answers in its own pieces. */
const LEG_L: [number, number][] = [[-0.15, -0.3], [0.435, -0.3], [0.435, 0.578], [0.282, 0.578], [0.25, 0.686], [0.435, 0.686], [0.435, 1.12], [-0.15, 1.12]];
const LEG_R: [number, number][] = [[0.435, -0.3], [1.2, -0.3], [1.2, 1.12], [0.435, 1.12], [0.435, 0.686], [0.625, 0.686], [0.59, 0.578], [0.435, 0.578]];
const BAR: [number, number][] = [[0.24, 0.572], [0.635, 0.572], [0.635, 0.688], [0.24, 0.688]];
const BOWL: [number, number][] = [[-0.08, 0.465], [0.72, 0.465], [0.72, 1.1], [-0.08, 1.1]];
const SHOULDER: [number, number][] = [[-0.08, -0.1], [1.12, -0.1], [1.12, 0.475], [-0.08, 0.475]];
const STEM: [number, number][] = [[0.575, 0.465], [1.12, 0.465], [1.12, 1.1], [0.575, 1.1]];
const V_L: [number, number][] = [[-0.2, -0.12], [0.622, -0.12], [0.622, 0.78], [0.74, 1.0], [0.74, 1.14], [-0.2, 1.14]];
const V_R: [number, number][] = [[0.622, -0.12], [1.2, -0.12], [1.2, 1.14], [0.4, 1.14], [0.622, 0.78]];

/**
 * Mount the hand on a settled nameplate.
 *
 * @param plate - The overlay coordinate space
 * @param h1 - The nameplate
 * @param letters - The character spans
 * @param g0 - The settled geometry the performance measured
 * @param stir - The run's stepper hook
 * @returns unmount (synchronous: every span back to its pre-mount style)
 *   and the probe
 */
export function mountNameHand(
  plate: HTMLDivElement,
  h1: HTMLElement,
  letters: HTMLElement[],
  g0: G,
  stir: Stir
): { unmount: () => void; probe: () => HandProbe } {
  const N = letters.length;
  const bead = letters.map((l) => !l.classList.contains("np-sp"));
  const snap = letters.map((l) => l.style.cssText);
  let g = g0;

  /* geometry, plate-local, em */
  let fs = g.fs;
  let cx: number[] = [];
  let bandTop = 0;
  let bandBot = 0;
  let pin: string[] = [];
  let origin: string[] = [];
  let shift: number[][] = [];
  let ink: string[] = [];
  const measure = () => {
    fs = g.fs;
    cx = g.box.map((b) => (b.x + b.w / 2) / fs);
    bandTop = (g.base - g.capH) / fs - BEAD.band;
    bandBot = g.base / fs + 0.24 + BEAD.band;
    /* one batch of reads, no writes in between: the rest boxes and one
       hidden cell per (letter, level) for the width table */
    const box = document.createElement("span");
    box.setAttribute("aria-hidden", "true");
    box.style.cssText =
      "position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;pointer-events:none";
    const cells = letters.map((l, i) =>
      bead[i]
        ? AXES.map((ax) => {
            const s = document.createElement("span");
            s.style.cssText = `display:inline-block;font-variation-settings:${ax}`;
            s.textContent = l.textContent;
            box.appendChild(s);
            return s;
          })
        : []
    );
    h1.appendChild(box);
    const pr = plate.getBoundingClientRect();
    const rects = letters.map((l) => l.getBoundingClientRect());
    const w = cells.map((row) => row.map((s) => s.getBoundingClientRect().width));
    box.remove();
    /* +0.004px before the em: Blink and WebKit truncate a length to 1/64px,
       and an em that lands a hair under the rest width would shed one */
    pin = rects.map((r) => `${((r.width + 0.004) / fs).toFixed(6)}em`);
    origin = rects.map(
      (r) => `50% ${((g.base - (r.top - pr.top)) / fs).toFixed(4)}em`
    );
    shift = w.map((row) => row.map((x) => -(x - row[0]) / 2 / fs));
    const dry = rgbOf(getComputedStyle(h1).color);
    const wet = [0x4a, 0x38, 0x2a];
    ink = AXES.map((_, l) => {
      const t = (l / SOAK) * WET;
      return `rgb(${dry.map((c, k) => Math.round(c + (wet[k] - c) * t)).join(",")})`;
    });
  };
  measure();
  let stale = false;

  /* the chain */
  const y = new Float64Array(N);
  const v = new Float64Array(N);
  const a = new Float64Array(N);
  const kick = new Float64Array(N);
  /** a press's pushes, each due when its ripple reaches the bead */
  let due: { t: number; i: number; dv: number }[] = [];
  let live = false;
  let dead = false;
  let pinned = false;
  let last = 0;
  let acc = 0;
  let steps = 0;
  let kicks = 0;
  let presses = 0;
  let peak = 0;
  const level = new Int8Array(N);
  const lift = new Float64Array(N);
  const wrote = letters.map(() => ({ tr: "", rot: "", sc: "", lv: 0 }));

  /* ── THE MACHINES ANSWER ─────────────────────────────────────────────
     The crest reaching a machine letter fires that letter's machine, in
     the opening's own vocabulary and pieces: the A's dividers open and
     close on their hinge, the s is re-run by its bead, the dial takes the
     a's bowl and spins with the hand's speed down its detents to a catch,
     the runner hops, the v's strokes beat once as wings. Each answer is
     an overlay (class np-ans, never np-mech: check-nameplate counts
     np-mech as performances) whose outer group is moved EVERY FRAME from
     the same pose the letter gets, while WAAPI drives only the pieces
     inside it, so the machine rides the string with its letter. Its text
     carries the letter's current soak, so the swap in and out is
     invisible. One live answer per machine: a scribble cannot stack
     them, and a machine re-arms only once its letter has calmed. */
  type Answer = {
    svg: SVGSVGElement;
    outer: SVGGElement;
    texts: SVGTextElement[];
    end: number;
    lv: number;
  };
  const answers: (Answer | null)[] = letters.map(() => null);
  const armed = letters.map(() => true);
  const fired: Record<string, number> = {};
  let maxLive = 0;
  let hop = { t0: -1, dir: 1, h: 0 };
  let handSpeed = 0;
  let handDir = 1;
  const FIRE = 0.7;
  const REARM = 0.25;
  const HOP_MS = 440;

  type Made = { ms: number; texts: SVGTextElement[] };
  const hinge = (n: SVGElement, x: number, yy: number) => {
    n.style.transformOrigin = `${x}px ${yy}px`;
    n.style.transformBox = "view-box";
  };
  /** the dividers: the stems open on their hinge, the heavy leg first,
   *  the crossbar lets go while they are apart and ties them again */
  const answerDividers = (svg: SVGSVGElement, outer: SVGGElement, k: number): Made => {
    const b = g.box[0];
    const px = b.x + 0.473 * b.w;
    const py = g.base - g.capH - 0.109 * g.capH;
    const legL = clipped(svg, g, letters, 0, LEG_L, "cap");
    const legR = clipped(svg, g, letters, 0, LEG_R, "cap");
    const bar = clipped(svg, g, letters, 0, BAR, "cap");
    for (const q of [legL, legR, bar]) outer.appendChild(q.gRot);
    const boss = stroke(el("circle", { cx: px, cy: py, r: g.fs * 0.058 }, outer), g.sw * 0.55);
    const pin = el("circle", { cx: px, cy: py, r: g.fs * 0.03, fill: INK_WET }, outer);
    hinge(legL.gRot, px, py);
    hinge(legR.gRot, px, py);
    const ov = 5 + 3 * k;
    const open = (sg: number, f: number): Keyframe[] => [
      { transform: "rotate(0deg)", easing: "cubic-bezier(.3,.7,.3,1)" },
      { transform: `rotate(${(sg * ov * f).toFixed(2)}deg)`, offset: 0.36, easing: "cubic-bezier(.45,.05,.3,1)" },
      { transform: `rotate(${(-sg * ov * f * 0.18).toFixed(2)}deg)`, offset: 0.74, easing: "cubic-bezier(.35,.1,.3,1)" },
      { transform: "rotate(0deg)" },
    ];
    legR.gRot.animate(open(-1, 1), { duration: 640, fill: "both" });
    legL.gRot.animate(open(1, 0.9), { duration: 600, delay: 50, fill: "both" });
    bar.gRot.animate(
      [{ opacity: 1 }, { opacity: 0, offset: 0.14 }, { opacity: 0, offset: 0.6 }, { opacity: 1, offset: 0.84 }, { opacity: 1 }],
      { duration: 650, fill: "both" }
    );
    for (const n of [boss, pin])
      n.animate(
        [{ opacity: 0 }, { opacity: 1, offset: 0.16 }, { opacity: 1, offset: 0.58 }, { opacity: 0 }],
        { duration: 650, fill: "both" }
      );
    return { ms: 700, texts: [legL.text, legR.text, bar.text] };
  };
  /** the road: the s is run again by its bead and inks on behind it,
   *  over a ghost of its old ink. Filmed without the ghost, the s simply
   *  vanished for the run and the word read "Ayu h". */
  const answerRoad = (svg: SVGSVGElement, outer: SVGGElement): Made => {
    const d = sPathD(g);
    const gG = el("g", {}, outer);
    const ghost = mkText(gG, g, letters, 3);
    gG.animate([{ opacity: 1 }, { opacity: 0.3, offset: 0.12 }, { opacity: 0.3 }], { duration: 430, fill: "both" });
    const gT = el("g", {}, outer);
    const t = mkText(gT, g, letters, 3);
    const rw = wipe(svg, g, gT, d, 0.52 * g.box[3].w);
    const bead = el("circle", { r: g.beadR, fill: INK_WET }, outer);
    bead.style.offsetPath = `path("${d}")`;
    bead.style.offsetRotate = "0deg";
    const run: KeyframeAnimationOptions = { duration: 430, fill: "both", easing: "cubic-bezier(.4,.06,.2,1)" };
    rw.s.animate([{ strokeDashoffset: rw.L }, { strokeDashoffset: 0 }], run);
    bead.animate([{ offsetDistance: "0%" }, { offsetDistance: "100%" }], run);
    bead.animate(
      [{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.84 }, { opacity: 0 }],
      { duration: 480, fill: "both" }
    );
    return { ms: 500, texts: [ghost, t] };
  };
  /** the dial: the bowl gives way to the dial, the needle spins with the
   *  hand's speed down its seven detents to a catch, and the bowl inks
   *  back on from its own bowl–stem junction */
  const answerDial = (svg: SVGSVGElement, outer: SVGGElement, k: number, dir: number): Made => {
    const d = dialGeom(g, 7);
    const bowl = clipped(svg, g, letters, 7, BOWL, "x");
    const sk: string[] = [];
    for (let q = 0; q <= 30; q++) {
      const [x, yy] = d.pt(1.0, d.rest - (q * 360) / 30);
      sk.push(`${x.toFixed(1)} ${yy.toFixed(1)}`);
    }
    const bowlW = wipe(svg, g, bowl.gCl, "M " + sk.join(" L "), 0.44 * d.w);
    const shoulder = clipped(svg, g, letters, 7, SHOULDER, "x");
    const stemP = clipped(svg, g, letters, 7, STEM, "x");
    for (const q of [bowl, shoulder, stemP]) outer.appendChild(q.gRot);
    const gF = el("g", {}, outer);
    stroke(el("ellipse", { cx: d.cx, cy: d.cy, rx: d.rx, ry: d.ry }, gF), g.sw * 0.5);
    el("circle", { cx: d.cx, cy: d.cy, r: g.fs * 0.02, fill: INK_WET }, gF);
    for (let q = 0; q < 7; q++) {
      const a = (q * 360) / 7 + d.rest;
      const [xa, ya] = d.pt(1.2, a);
      const [xb, yb] = d.pt(q === 0 ? 1.46 : 1.32, a);
      stroke(
        el("path", { d: `M ${xa.toFixed(1)} ${ya.toFixed(1)} L ${xb.toFixed(1)} ${yb.toFixed(1)}` }, gF),
        q === 0 ? g.sw * 0.5 : Math.max(1, g.sw * 0.28)
      );
    }
    const gN = el("g", {}, gF);
    el("path", { d: needleD(g, d, d.rest), fill: INK_WET }, gN);
    hinge(gN, d.cx, d.cy);
    hinge(gF, d.cx, d.cy);
    /* detents, decaying: the faster the hand, the more of them */
    const DET = 360 / 7;
    const n = Math.max(4, Math.min(14, Math.round(4 + 9 * k)));
    const ivs: number[] = [];
    let iv = 1;
    for (let q = 0; q < n; q++) {
      ivs.push(iv);
      iv *= 1.2;
    }
    const T = ivs.reduce((x, z) => x + z, 0);
    const kf: Keyframe[] = [{ transform: `rotate(${-dir * n * DET}deg)`, offset: 0 }];
    let acc2 = 0;
    for (let q = 1; q <= n; q++) {
      acc2 += ivs[q - 1];
      const off = acc2 / T;
      const ang = -dir * (n - q) * DET;
      if (q === n) {
        kf.push({ transform: `rotate(${(dir * 4.2).toFixed(2)}deg)`, offset: Math.max(0, off - 0.05) });
        kf.push({ transform: `rotate(${(-dir * 0.9).toFixed(2)}deg)`, offset: Math.max(0, off - 0.02) });
        kf.push({ transform: "rotate(0deg)", offset: 1 });
      } else if (q >= n - 2) {
        kf.push({ transform: `rotate(${ang}deg)`, offset: Math.min(0.99, off) });
        kf.push({ transform: `rotate(${ang}deg)`, offset: Math.min(0.995, off + 0.012) });
      } else kf.push({ transform: `rotate(${ang}deg)`, offset: off });
    }
    /* bounded: the intervals decay geometrically, so a length read off
       them grew to 1.75s at thirteen detents and held the loop open */
    const spin = 380 + 40 * n;
    gF.animate([{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "scale(1)" }], {
      duration: 90,
      fill: "both",
      easing: "ease-out",
    });
    gN.animate(kf, { duration: spin, delay: 50, fill: "both", easing: "linear" });
    gF.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, delay: 50 + spin, fill: "forwards", easing: "ease" });
    bowlW.s.animate([{ strokeDashoffset: bowlW.L }, { strokeDashoffset: 0 }], {
      duration: 360,
      delay: 20 + spin,
      fill: "both",
      easing: "cubic-bezier(.35,.05,.25,1)",
    });
    return { ms: 50 + spin + 400, texts: [bowl.text, shoulder.text, stemP.text] };
  };
  /** the bird: the v's strokes, hinged at the vertex, beat once, down
   *  and out into open wings, a short upstroke past the stance, and fold
   *  back to the v. Up-first was filmed: at the raised pose the two
   *  strokes close into one solid wedge. */
  const answerBird = (svg: SVGSVGElement, outer: SVGGElement, k: number): Made => {
    const bg = birdGeom(g);
    const lockL = clipped(svg, g, letters, 10, V_L, "x");
    const lockR = clipped(svg, g, letters, 10, V_R, "x");
    for (const q of [lockL, lockR]) {
      outer.appendChild(q.gRot);
      hinge(q.gRot, bg.vx, bg.vy);
    }
    const up = 1 + 0.4 * k;
    const down = 10 + 6 * k;
    const beat = (raise: number, sg: number): Keyframe[] => [
      { transform: "rotate(0deg)", easing: "cubic-bezier(.25,.7,.3,1)" },
      { transform: `rotate(${(sg * down).toFixed(2)}deg)`, offset: 0.34, easing: "cubic-bezier(.45,.05,.3,1)" },
      { transform: `rotate(${(raise * 0.35 * up).toFixed(2)}deg)`, offset: 0.66, easing: "cubic-bezier(.35,.1,.3,1)" },
      { transform: "rotate(0deg)" },
    ];
    lockL.gRot.animate(beat(-12 - bg.tiltL, -1), { duration: 640, fill: "both" });
    lockR.gRot.animate(beat(14 - bg.tiltR, 1), { duration: 640, delay: 30, fill: "both" });
    return { ms: 700, texts: [lockL.text, lockR.text] };
  };
  /** the letter's last pose, so an answer that fires between frames is
   *  placed on it at once rather than at the letter's rest */
  const pose = letters.map(() => ({ tx: 0, ty: 0, th: 0, sc: 1 }));
  const track = (i: number) => {
    const a = answers[i];
    if (!a) return;
    const b = g.box[i];
    const ox = b.x + b.w / 2;
    const oy = g.base;
    const q = pose[i];
    a.outer.setAttribute(
      "transform",
      `translate(${(ox + q.tx * fs).toFixed(2)} ${(oy + q.ty * fs).toFixed(2)}) ` +
        `rotate(${q.th.toFixed(2)}) scale(${q.sc.toFixed(4)}) translate(${(-ox).toFixed(2)} ${(-oy).toFixed(2)})`
    );
    if (a.lv !== level[i]) {
      a.lv = level[i];
      for (const t of a.texts) {
        t.style.setProperty("font-variation-settings", AXES[a.lv]);
        t.setAttribute("fill", ink[a.lv]);
      }
    }
  };
  const fire = (i: number, k: number, now: number) => {
    const kind = MACHINE[i];
    if (!kind || answers[i] || stale || dead) return;
    armed[i] = false;
    fired[kind] = (fired[kind] ?? 0) + 1;
    if (kind === "runner") {
      if (hop.t0 < 0) hop = { t0: now, dir: handDir, h: 0.045 + 0.03 * k };
      return;
    }
    const svg = mkOverlay(plate, g, "np-ans");
    const outer = el("g", {}, svg);
    const made =
      kind === "dividers"
        ? answerDividers(svg, outer, k)
        : kind === "road"
          ? answerRoad(svg, outer)
          : kind === "dial"
            ? answerDial(svg, outer, k, handDir)
            : answerBird(svg, outer, k);
    answers[i] = { svg, outer, texts: made.texts, end: now + made.ms, lv: -1 };
    letters[i].style.setProperty("opacity", "0");
    track(i);
    maxLive = Math.max(maxLive, answers.filter(Boolean).length);
  };
  /** the runner's one hop, on top of the string: up and forward, a
   *  landing squash, a small second bound, planted past upright */
  const hopPose = (now: number) => {
    const u = (now - hop.t0) / HOP_MS;
    if (hop.t0 < 0 || u >= 1) return { ty: 0, th: 0, sy: 1 };
    const AIR = 0.58;
    if (u < AIR) {
      const a = u / AIR;
      return { ty: -hop.h * 4 * a * (1 - a), th: hop.dir * 6 * Math.sin(Math.PI * a), sy: 1 };
    }
    const w = (u - AIR) / (1 - AIR);
    const squash = w < 0.3 ? 1 - 0.018 * Math.sin((Math.PI * w) / 0.3) : 1;
    const b = w > 0.3 && w < 0.8 ? (w - 0.3) / 0.5 : -1;
    return {
      ty: b >= 0 ? -hop.h * 0.2 * 4 * b * (1 - b) : 0,
      th: -hop.dir * 1.4 * Math.sin(Math.PI * w) * (1 - w),
      sy: squash,
    };
  };

  const sub = (dt: number) => {
    const c0 = 2 * BEAD.zeta * BEAD.w0;
    const w2 = BEAD.w0 * BEAD.w0;
    for (let i = 0; i < N; i++) {
      /* free ends: the thread runs on past the name, so an end bead swings */
      const yl = i > 0 ? y[i - 1] : y[i];
      const yr = i < N - 1 ? y[i + 1] : y[i];
      const vl = i > 0 ? v[i - 1] : v[i];
      const vr = i < N - 1 ? v[i + 1] : v[i];
      a[i] =
        -w2 * y[i] -
        c0 * v[i] +
        BEAD.k * (yl - 2 * y[i] + yr) +
        BEAD.kd * (vl - 2 * v[i] + vr);
    }
    for (let i = 0; i < N; i++) {
      v[i] += a[i] * dt;
      y[i] += v[i] * dt;
    }
  };

  const clearAll = () => {
    for (let i = 0; i < N; i++) {
      answers[i]?.svg.remove();
      answers[i] = null;
      armed[i] = true;
      for (const p of OWN) letters[i].style.removeProperty(p);
      wrote[i].tr = wrote[i].rot = wrote[i].sc = "";
      wrote[i].lv = 0;
      level[i] = 0;
      lift[i] = 0;
    }
    hop.t0 = -1;
    pinned = false;
  };

  const settle = () => {
    y.fill(0);
    v.fill(0);
    kick.fill(0);
    due = [];
    acc = 0;
    last = 0;
    live = false;
    clearAll();
    if (stale) {
      stale = false;
      g = measureSettled(plate, h1, letters);
      measure();
    }
  };

  const draw = (now: number) => {
    if (!pinned) {
      pinned = true;
      for (let i = 0; i < N; i++) {
        if (!bead[i]) continue;
        const st = letters[i].style;
        st.setProperty("width", pin[i]);
        st.setProperty("text-align", "left");
        st.setProperty("transform-origin", origin[i]);
      }
    }
    const shown = (i: number) => BEAD.ceil * Math.tanh(y[i] / BEAD.ceil);
    for (let i = 0; i < N; i++) {
      const yd = shown(i);
      lift[i] = yd;
      if (!bead[i]) continue;
      const l = i > 0 ? i - 1 : i;
      const r = i < N - 1 ? i + 1 : i;
      const slope = (shown(r) - shown(l)) / (cx[r] - cx[l] || 1);
      const th = Math.max(-BEAD.rot, Math.min(BEAD.rot, (Math.atan(slope) * 180) / Math.PI));
      const e = Math.min(1, Math.hypot(v[i] / BEAD.w0, y[i]) / BEAD.full);
      /* the soak answers the root of the energy, the lift answers it
         linearly: a hand only reading across the name barely moves it
         (0.35px/ms filmed at under 2px of lift) but leaves a soft bloom
         of ink under itself, and only a swoosh throws the wave */
      const lv = Math.round(Math.sqrt(e) * SOAK);
      level[i] = lv;
      const hp = i === 9 ? hopPose(now) : null;
      const q = pose[i];
      q.tx = shift[i][lv];
      q.ty = yd + (hp ? hp.ty : 0);
      q.th = th + (hp ? hp.th : 0);
      q.sc = 1 + BEAD.swell * e;
      const tr = `${q.tx.toFixed(4)}em ${q.ty.toFixed(4)}em`;
      const rot = `${q.th.toFixed(2)}deg`;
      const sc =
        hp && hp.sy !== 1
          ? `${q.sc.toFixed(4)} ${(q.sc * hp.sy).toFixed(4)}`
          : q.sc.toFixed(4);
      const w = wrote[i];
      const st = letters[i].style;
      if (tr !== w.tr) st.setProperty("translate", (w.tr = tr));
      if (rot !== w.rot) st.setProperty("rotate", (w.rot = rot));
      if (sc !== w.sc) st.setProperty("scale", (w.sc = sc));
      if (lv !== w.lv) {
        w.lv = lv;
        if (lv === 0) {
          st.removeProperty("font-variation-settings");
          st.removeProperty("color");
        } else {
          st.setProperty("font-variation-settings", AXES[lv], "important");
          st.setProperty("color", ink[lv]);
        }
      }
      track(i);
    }
  };

  const step = (now: number): boolean => {
    if (dead) return false;
    steps++;
    const dtF = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : BEAD.dt;
    last = now;
    if (due.length) {
      for (const q of due) if (q.t <= now) v[q.i] += q.dv;
      due = due.filter((q) => q.t > now);
    }
    for (let i = 0; i < N; i++) {
      v[i] += kick[i];
      kick[i] = 0;
    }
    acc += dtF;
    let n = 0;
    while (acc >= BEAD.dt && n < 16) {
      sub(BEAD.dt);
      acc -= BEAD.dt;
      n++;
    }
    if (n === 16) acc = 0;
    let my = 0;
    let mv = 0;
    for (let i = 0; i < N; i++) {
      my = Math.max(my, Math.abs(y[i]));
      mv = Math.max(mv, Math.abs(v[i]));
    }
    peak = Math.max(peak, my);
    let busy = hop.t0 >= 0 && now - hop.t0 < HOP_MS;
    if (!busy) hop.t0 = -1;
    for (let i = 0; i < N; i++) {
      const a = answers[i];
      if (a && now >= a.end) {
        a.svg.remove();
        letters[i].style.removeProperty("opacity");
        answers[i] = null;
      }
      if (answers[i]) busy = true;
      if (!MACHINE[i]) continue;
      /* fire on the RISING crest only, so a press's dip never sets off
         the neighbours; re-arm once the letter has calmed */
      const e = Math.hypot(v[i] / BEAD.w0, y[i]) / BEAD.full;
      if (e < REARM) armed[i] = true;
      else if (armed[i] && e > FIRE && y[i] < 0 && v[i] < 0 && !answers[i]) {
        fire(i, Math.min(1, Math.max(0, (handSpeed - 4) / 16)), now);
        if (answers[i] || hop.t0 >= 0) busy = true;
      }
    }
    if (my < BEAD.restY && mv < BEAD.restV && !due.length && !busy) {
      settle();
      return false;
    }
    draw(now);
    return true;
  };

  const go = () => {
    if (live || dead) return;
    live = true;
    last = 0;
    stir(step);
  };

  /* ── the hand ─────────────────────────────────────────────────────── */
  let lastScroll = -1e9;
  let prev: { x: number; y: number; t: number } | null = null;
  const onScroll = () => {
    lastScroll = performance.now();
    prev = null;
  };
  /** plate-local em from client px, through the plate's live box */
  const local = (pr: DOMRect, x: number, yy: number) => {
    const k = g.W / (pr.width || g.W);
    return { x: ((x - pr.left) * k) / fs, y: ((yy - pr.top) * k) / fs };
  };
  const bandW = (py: number) => {
    const edge = 0.12;
    if (py < bandTop || py > bandBot) return 0;
    return Math.min(1, (py - bandTop) / edge, (bandBot - py) / edge);
  };
  const deposit = (
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    dt: number
  ) => {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-4 || dt <= 0) return;
    handSpeed = Math.min(BEAD.vmax, len / dt);
    if (Math.abs(dx) > 1e-3) handDir = dx > 0 ? 1 : -1;
    let speed = handSpeed - BEAD.vmin;
    if (speed <= 0) return;
    if (speed > BEAD.vref) speed = BEAD.vref * Math.sqrt(speed / BEAD.vref);
    const ahead = Math.max(-BEAD.leadMax, Math.min(BEAD.leadMax, (BEAD.lead * dx) / dt));
    const n = Math.min(40, Math.ceil(len / 0.08));
    const ds = len / n;
    const s2 = 2 * BEAD.sigma * BEAD.sigma;
    let any = false;
    for (let i = 0; i < N; i++) {
      let W = 0;
      for (let j = 0; j < n; j++) {
        const f = (j + 0.5) / n;
        const d = p0.x + dx * f + ahead - cx[i];
        if (Math.abs(d) > BEAD.cut) continue;
        const b = bandW(p0.y + dy * f);
        if (b) W += Math.exp(-(d * d) / s2) * b * ds;
      }
      if (W > 0) {
        kick[i] -= BEAD.gain * speed * W;
        any = true;
      }
    }
    if (any) {
      kicks++;
      go();
    }
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (performance.now() - lastScroll < 150) {
      prev = null;
      return;
    }
    const pr = plate.getBoundingClientRect();
    const list = e.getCoalescedEvents?.() ?? [];
    for (const ev of list.length ? list : [e]) {
      const t = ev.timeStamp;
      /* the previous sample is kept in CLIENT px, and both ends go through
         the same live box, so a box that moved between them adds nothing */
      if (prev && t > prev.t && t - prev.t <= 100)
        deposit(
          local(pr, prev.x, prev.y),
          local(pr, ev.clientX, ev.clientY),
          (t - prev.t) / 1000
        );
      prev = { x: ev.clientX, y: ev.clientY, t };
    }
  };
  const strike = (x: number, yy: number) => {
    const p = local(plate.getBoundingClientRect(), x, yy);
    if (!bandW(p.y)) return;
    let best = -1;
    let bd = Infinity;
    for (let i = 0; i < N; i++) {
      const d = Math.abs(p.x - cx[i]);
      if (bead[i] && d < bd) {
        bd = d;
        best = i;
      }
    }
    if (best < 0 || bd > 0.8) return;
    /* THE PRESS RUNS BOTH WAYS AT ONCE, and it is scheduled rather than
       left to the coupling. The coupling that keeps a swoosh's crest
       local is too soft to carry a single push: simulated, the dip died
       two letters out. So each bead takes its share of the push when the
       ripple reaches it, at `rc`, losing `rho` a letter. */
    const t0 = performance.now();
    for (let i = 0; i < N; i++)
      if (bead[i])
        due.push({
          t: t0 + (Math.abs(cx[i] - cx[best]) / BEAD.rc) * 1000,
          i,
          dv: BEAD.press * Math.pow(BEAD.rho, Math.abs(i - best)),
        });
    presses++;
    if (MACHINE[best]) fire(best, 0.25, t0);
    go();
  };
  /* a mouse or pen presses on the way down; a finger presses only once it
     has tapped, so a scroll that starts on the name never plucks it */
  let touched = false;
  const onDown = (e: PointerEvent) => {
    touched = e.pointerType === "touch";
    if (!touched && e.button === 0) strike(e.clientX, e.clientY);
  };
  const onClick = (e: MouseEvent) => {
    if (touched) strike(e.clientX, e.clientY);
    touched = false;
  };
  const onPrint = () => {
    if (live) settle();
  };
  /* not the h1 alone: the hand's band reaches past the type's box */
  const scope: HTMLElement = plate.closest("section") ?? document.body;
  scope.addEventListener("pointermove", onMove, { passive: true });
  h1.addEventListener("pointerdown", onDown, { passive: true });
  h1.addEventListener("click", onClick);
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("beforeprint", onPrint);
  /* observing fires once at once, which only marks the geometry for a
     re-measure that is a no-op here; skip that first delivery */
  let first = true;
  const ro = new ResizeObserver(() => {
    if (first) {
      first = false;
      return;
    }
    stale = true;
    if (!live) settle();
  });
  ro.observe(plate);

  return {
    unmount() {
      dead = true;
      scope.removeEventListener("pointermove", onMove);
      h1.removeEventListener("pointerdown", onDown);
      h1.removeEventListener("click", onClick);
      removeEventListener("scroll", onScroll);
      removeEventListener("beforeprint", onPrint);
      ro.disconnect();
      y.fill(0);
      v.fill(0);
      kick.fill(0);
      due = [];
      live = false;
      clearAll();
    },
    probe: () => ({
      live,
      steps,
      kicks,
      presses,
      peak: +peak.toFixed(4),
      lift: Array.from(lift, (x) => +x.toFixed(4)),
      level: Array.from(level),
      rest: letters.every((l, i) => l.style.cssText === snap[i]),
      fired: { ...fired },
      answering: answers.filter(Boolean).length + (hop.t0 >= 0 ? 1 : 0),
      maxLive,
    }),
  };
}
