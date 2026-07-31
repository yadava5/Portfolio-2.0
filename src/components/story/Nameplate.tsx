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
 * simply never play. What Full buys HERE is the living plate after the
 * show: the hover answers (a detent under the hand, a wing ruffle, one
 * hop) and the axes answering the pointer — garnish-rail vocabulary,
 * inert at core. Print / reduced motion / the quiet toggle get the
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

"use client";

import { useEffect, useRef } from "react";
import { mulberry32 } from "@/components/thread/geometry";
import { personalInfo } from "@/lib/data/personal";

/* The machines are authored to these ten characters (their clip
   polygons, hinge points and skeletons cite pixel scans of exactly
   this string in this face). If the data layer ever renames the
   author, the plate renders the new name still — machines withheld —
   rather than fold a bird into somebody else's v. */
const MACHINE_NAME = "Ayush Yadav";
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
export function Nameplate() {
  const plateRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const name = personalInfo.name;
  const machinesAuthored = name === MACHINE_NAME;
  const chars = [...name];

  useEffect(() => {
    const html = document.documentElement;
    const plate = plateRef.current;
    const h1 = h1Ref.current;
    if (!plate || !h1) return;
    const letters = Array.from(h1.querySelectorAll<HTMLElement>(".np-ch"));

    /* ——— the handoff: the running head does not repeat the author
       while the nameplate is on stage (a monograph's running head
       starts after the title page); it receives the name on
       scroll-out. Class-scoped so archive routes never hide theirs. */
    document.body.classList.add("has-nameplate");
    const io = new IntersectionObserver(
      ([e]) =>
        document.body.classList.toggle("nameplate-headed", !e.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" }
    );
    io.observe(h1);

    /* ——— the shop floor: ONE metric hairline at the ink baseline.
       Position is measurement (a 0×0 inline marker's bottom — a probe
       box cannot extend the line box, so its bottom is the true
       baseline); both worlds seat it, static included (A7). */
    const rule = plate.querySelector<HTMLElement>(".np-rule");
    const writeRule = () => {
      if (!rule) return;
      const seat = document.createElement("span");
      seat.style.cssText =
        "display:inline-block;width:0;height:0;visibility:hidden";
      h1.appendChild(seat);
      const y =
        seat.getBoundingClientRect().bottom - plate.getBoundingClientRect().top;
      seat.remove();
      rule.style.top = `${y.toFixed(1)}px`;
      rule.style.width = `${(h1.getBoundingClientRect().width + 12).toFixed(1)}px`;
      rule.dataset.npSeated = "";
    };
    writeRule();
    const ro = new ResizeObserver(writeRule);
    ro.observe(h1);

    const still = () =>
      html.hasAttribute("data-motion-off") || html.dataset.tier === "print";

    /* Load-only, like the hero entrance it replaces: the head script
       stamps [data-motion-ready] pre-paint only when the motion world
       is planned, and TextMotion retires it after the show — a client
       nav back to home gets the settled plate, not a replay. */
    const performs =
      machinesAuthored && !still() && html.hasAttribute("data-motion-ready");

    const settled = () => h1.hasAttribute("data-np-settled");

    /** The final frame, immediately — never a paused animation. */
    const settleNow = () => {
      plate.querySelectorAll(".np-mech").forEach((n) => n.remove());
      for (const s of letters) {
        s.getAnimations().forEach((a) => a.cancel());
        s.style.opacity = "";
        s.dataset.npDone = "";
      }
      h1.getAnimations().forEach((a) => a.cancel());
      h1.style.transformOrigin = "";
      h1.setAttribute("data-np-settled", "");
    };

    /* Interrupts: the quiet toggle / a governor downshift to print
       (both arrive as attribute writes on <html>), and the third
       world — print — which neither media query covers mid-show. */
    const mo = new MutationObserver(() => {
      if (still() && !settled()) settleNow();
    });
    mo.observe(html, {
      attributes: true,
      attributeFilter: ["data-motion-off", "data-tier"],
    });
    const onBeforePrint = () => settleNow();
    window.addEventListener("beforeprint", onBeforePrint);
    const printMedia = window.matchMedia("print");
    const onPrintMedia = (e: MediaQueryListEvent) => {
      if (e.matches) settleNow();
    };
    printMedia.addEventListener("change", onPrintMedia);

    let disposed = false;

    if (!performs) {
      settleNow();
    } else {
      /* Take the machine letters over from the CSS hold with inline
         styles before it can lapse (the CSS hold is only pre-hydration
         insurance; [data-motion-ready] retires at HERO_SETTLE_MS). */
      for (const [i] of Object.entries(MACHINE))
        letters[Number(i)].style.opacity = "0";
    }
    /* The kern pass runs in EVERY JS world once the face is in — it is
       layout truth, not motion. The port's first A7 diff caught it
       living inside the machines' measure: the motion world settled
       kerned, the static world never was, and the two plates disagreed
       by a "Ya" pair's worth of ink. */
    Promise.race([document.fonts.ready, sleep(900)]).then(async () => {
      if (disposed) return;
      applyKern(h1, letters);
      writeRule();
      if (!performs || still()) return;
      const g = measureSettled(plate, h1, letters);
      const done = await performEnsemble(plate, h1, letters, g, () => ({
        alive: !disposed && !still(),
      }));
      if (done && !disposed && !still()) settleNow();
    });

    /* ——— the living plate (Full only): the letters answer the hand
       with their own mechanisms. Garnish-rail vocabulary — inert at
       core/print, throttled, settled-only. */
    const answers = machinesAuthored
      ? mountHoverAnswers(plate, h1, letters, settled)
      : () => undefined;

    return () => {
      disposed = true;
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("beforeprint", onBeforePrint);
      printMedia.removeEventListener("change", onPrintMedia);
      answers();
      document.body.classList.remove("has-nameplate", "nameplate-headed");
      settleNow();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={plateRef} className="np-plate relative" data-nameplate>
      {/* aria-hidden furniture: the baseline the dividers stand on,
          the runner runs on, the bird lands at. Seated by measurement
          on mount; a whisper at rest; not printed. */}
      <div className="np-rule" aria-hidden="true" />
      <h1
        ref={h1Ref}
        aria-label={name}
        className="nameplate font-display"
        data-np-machines={machinesAuthored ? "" : undefined}
      >
        {chars.map((c, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={[
              "np-ch",
              c === " " ? "np-sp" : "",
              machinesAuthored && i in MACHINE ? "np-m" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ "--np-i": i } as React.CSSProperties}
          >
            {c === " " ? " " : c}
          </span>
        ))}
      </h1>
    </div>
  );
}

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
function applyKern(h1: HTMLElement, letters: HTMLElement[]): void {
  const meter = document.createElement("span");
  meter.style.cssText =
    "position:absolute;visibility:hidden;white-space:pre;font:inherit;" +
    'letter-spacing:inherit;font-variation-settings:"opsz" 144, "SOFT" 50, "WONK" 0, "wght" 600;';
  h1.appendChild(meter);
  const w = (s: string) => {
    meter.textContent = s;
    return meter.getBoundingClientRect().width;
  };
  const fs = parseFloat(getComputedStyle(h1).fontSize);
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
function measureSettled(
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
  const fs = parseFloat(getComputedStyle(h1).fontSize);

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
    `font-family:${cs.fontFamily};font-size:${cs.fontSize};` +
    `font-weight:${cs.fontWeight};letter-spacing:${cs.letterSpacing};` +
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

function mkOverlay(plate: HTMLElement, g: G): SVGSVGElement {
  const svg = el("svg", {
    class: "np-mech",
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
async function performEnsemble(
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
     bird 2690 — the sums of their round-9 move durations). The dial
     opens the floor at 0.2s; the runner, shortest, joins last and
     still has the whole middle in company: from 1.73s to 2.64s ALL
     FIVE are in motion at once. */
  const plan: { start: number; make: () => Machine }[] = [
    { start: 390, make: () => mkDividers(svg, g, letters, rnd) },
    { start: 1000, make: () => mkRoad(svg, g, letters) },
    { start: 200, make: () => mkDial(svg, g, letters, rnd) },
    { start: 1730, make: () => mkRunner(svg, g, letters, rnd) },
    { start: 510, make: () => mkBird(svg, g, letters, rnd) },
  ];
  const built: (Machine | null)[] = plan.map(() => null);
  try {
    await Promise.all(
      plan.map(async ({ start, make }, k) => {
        await guard(sleep(start));
        const m = make();
        built[k] = m;
        await guard(m.play());
      })
    );
    /* the wave: every machine has LANDED wet — one beat, then the name
       dries as one piece, left to right, scaffolds fading with it */
    await guard(sleep(120));
    await Promise.all(
      built.map((m, k) =>
        m
          ? dry(
              letters,
              m.settle.parts,
              m.settle.idxs,
              m.settle.scaffold,
              380,
              k * 90
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
   The living plate (Full tier): the letters answer the hand
   ════════════════════════════════════════════════════════════════════ */

/**
 * Hover answers — the same mechanisms, small, over the resting letter:
 * the dial turns one detent under the hand, the bird's strokes ruffle
 * at the vertex hinge, the runner takes one hop. Full tier only (the
 * governor's garnish rail), settled plate only, throttled per letter.
 * The axes answering the pointer (.np-hot/.np-warm) ride the same
 * events; their CSS is gated `html[data-tier="full"]`.
 *
 * @returns teardown
 */
function mountHoverAnswers(
  plate: HTMLDivElement,
  h1: HTMLElement,
  letters: HTMLElement[],
  settled: () => boolean
): () => void {
  const html = document.documentElement;
  const full = () =>
    html.dataset.tier === "full" &&
    !html.hasAttribute("data-motion-off") &&
    settled();
  const last: Record<string, number> = {};
  const can = (name: string) => {
    if (!full()) return false;
    const now = performance.now();
    if (last[name] && now - last[name] < 900) return false;
    last[name] = now;
    return true;
  };
  const measure = () => measureSettled(plate, h1, letters);

  const onMove = (e: PointerEvent) => {
    if (!full()) return;
    const t = (e.target as HTMLElement).closest?.(".np-ch");
    letters.forEach((s) => s.classList.remove("np-hot", "np-warm"));
    if (!t) return;
    const k = letters.indexOf(t as HTMLElement);
    letters[k].classList.add("np-hot");
    letters[k - 1]?.classList.add("np-warm");
    letters[k + 1]?.classList.add("np-warm");
  };
  const onLeave = () =>
    letters.forEach((s) => s.classList.remove("np-hot", "np-warm"));

  const onDial = () => {
    if (!can("dial")) return;
    const g = measure();
    const svg = mkOverlay(plate, g);
    const d = dialGeom(g, 7);
    const gN = el("g", {}, svg);
    el("path", { d: needleD(g, d, d.rest), fill: INK }, gN);
    gN.style.transformOrigin = `${d.cx}px ${d.cy}px`;
    gN.style.transformBox = "view-box";
    const a = gN.animate(
      [
        { transform: "rotate(0deg)", opacity: 0 },
        { transform: `rotate(${-360 / 7}deg)`, opacity: 1, offset: 0.4 },
        { transform: `rotate(${-360 / 7}deg)`, opacity: 1, offset: 0.55 },
        { transform: "rotate(0deg)", opacity: 0 },
      ],
      { duration: 460, easing: "ease-in-out" }
    );
    a.finished.then(() => svg.remove()).catch(() => svg.remove());
  };
  const onBird = () => {
    if (!can("bird")) return;
    const g = measure();
    const svg = mkOverlay(plate, g);
    const bg = birdGeom(g);
    const mkP = (poly: [number, number][]) => {
      const p = clipped(svg, g, letters, 10, poly, "x");
      p.gRot.style.transformOrigin = `${bg.vx}px ${bg.vy}px`;
      p.gRot.style.transformBox = "view-box";
      p.text.setAttribute("fill", INK);
      return p;
    };
    const pL = mkP([
      [-0.2, -0.12],
      [0.622, -0.12],
      [0.622, 0.78],
      [0.74, 1.0],
      [0.74, 1.14],
      [-0.2, 1.14],
    ]);
    const pR = mkP([
      [0.622, -0.12],
      [1.2, -0.12],
      [1.2, 1.14],
      [0.4, 1.14],
      [0.622, 0.78],
    ]);
    letters[10].style.opacity = "0";
    const flick = (grp: SVGElement, amp: number, delay: number) =>
      grp.animate(
        [
          { transform: "rotate(0deg)" },
          { transform: `rotate(${amp}deg)`, offset: 0.42 },
          { transform: "rotate(0deg)" },
        ],
        { duration: 380, delay, easing: "ease-in-out", fill: "both" }
      );
    flick(pL.gRot, -3, 40);
    const a = flick(pR.gRot, -8, 0);
    const done = () => {
      letters[10].style.opacity = "";
      svg.remove();
    };
    a.finished.then(done).catch(done);
  };
  const onRunner = () => {
    if (!can("runner")) return;
    letters[9].animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-5%)", offset: 0.35 },
        { transform: "translateY(0)", offset: 0.7 },
        { transform: "translateY(-1.5%)", offset: 0.85 },
        { transform: "translateY(0)" },
      ],
      { duration: 420, easing: "ease-out" }
    );
  };

  h1.addEventListener("pointermove", onMove);
  h1.addEventListener("pointerleave", onLeave);
  letters[7]?.addEventListener("pointerenter", onDial);
  letters[10]?.addEventListener("pointerenter", onBird);
  letters[9]?.addEventListener("pointerenter", onRunner);
  return () => {
    h1.removeEventListener("pointermove", onMove);
    h1.removeEventListener("pointerleave", onLeave);
    letters[7]?.removeEventListener("pointerenter", onDial);
    letters[10]?.removeEventListener("pointerenter", onBird);
    letters[9]?.removeEventListener("pointerenter", onRunner);
  };
}
