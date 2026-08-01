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

import {
  applyKern,
  measureSettled,
  mountHoverAnswers,
  performEnsemble,
} from "./nameplateMachines";

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

/* The machinery lives in nameplateMachines.ts so the run (vanilla HTML)
   and this component share ONE source. Copying it would have produced two
   nameplates drifting apart — the exact failure six rounds of porting the
   scroll engine already demonstrated. */
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
