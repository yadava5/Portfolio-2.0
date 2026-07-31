/**
 * @fileoverview TextMotion — the chapters' entrance/scrub choreography.
 *
 * Implements plan 3.8 + PREMIUM-FLOW item #1 ("composed section
 * choreography"), in the engine-mounted world ONLY (amendment A7:
 * `useLenis()` is null under reduced motion and the quiet toggle, so none
 * of this ever exists there — static worlds paint the finished page
 * straight from the server markup).
 *
 * THE SCROLL-COUPLED MODEL (round 11 — the long-run port's engine).
 * Every entrance used to be a `once: true` trigger: it played a single
 * time and froze, so the choreography ran exactly once per session and
 * scrolling back up met a finished, motionless page. The owner's
 * verdict on that was direct — "moving with the viewer and flowing
 * back as well if we go back … now the animations are just running
 * once" — and the round-6 prototype he means makes every element's
 * state a pure function of scroll position. This file now does the
 * same with ScrollTrigger's own grammar: each composed scene is ONE
 * timeline scrubbed across a bounded window of scroll (`SCRUB_SPAN`
 * viewport-% of travel, ending above the reading line), so a chapter
 * assembles WITH the reader on the way down, holds settled through the
 * middle of the viewport (the round-5 contract: stations assemble and
 * HOLD), and runs exactly backwards when the reader scrolls up. No
 * state, only position — which retires the past-start crash guard
 * outright (a `once:true` trigger created past its start fired and
 * SELF-KILLED inside the first refresh loop, corrupting GSAP's trigger
 * list mid-iteration; a scrubbed trigger never self-kills — it just
 * computes its progress).
 *
 * THE LANDING GRANT (CRITIC-LEDGER F01, narrowed, still load-bearing).
 * Position-coupling almost solves landings by itself: any jump — nav,
 * `/#hash`, Back/Forward, a deep-scroll reload — computes a correct
 * frame, so nothing can STRAND at opacity 0 the way a missed `once`
 * trigger did. But "correct frame" includes the entrance band, and
 * measured on this build a `/#gate` landing parked the mailto/resume/
 * github cluster at opacity 0 at 77% of the landed viewport — the
 * exact screener F01 was written for ("the contact cluster sits INSIDE
 * the gate's first viewport — a screener must never scroll for the
 * address"). So a LANDING keeps its old grant, narrowed:
 * settleArrived() finds every window whose trigger box is already
 * above the fold, retires its trigger and plays the authored cascade
 * to completion — content the reader ASKED to be at presents itself,
 * and only those windows give up their reversibility. Everything below
 * the fold keeps its choreography, both directions. The cue is
 * ARRIVAL_EVENT plus the deep-scroll reload check after the build's
 * refresh.
 *
 * PERF (NO-LIST §F3, the corrected claim): a scrubbed trigger computes
 * on scroll events and is DORMANT while the page is still — the same
 * contract the thread, the day arc and PipelineRun already honour. The
 * idle acceptance is not "zero rAF" (GSAP's keep-alive loops own ~734
 * callbacks/3s on every build of this site) but "no app work on an
 * idle frame": measured before and after this port at 0 idle style
 * writes (docs/design-lab/probe-idle-raf11.mjs).
 *
 * THE COMPOSED-SCENE MODEL (PREMIUM-FLOW #1) is unchanged in shape:
 * an ancestor marked `[data-tm-scene]` is the shared trigger for all
 * the `data-tm-*` elements beneath it, and those children play off ONE
 * scrubbed timeline with an internal stagger (DOM order, SCENE_STAGGER
 * apart — now scroll-distance, not seconds). Scene order falls out of
 * the markup: kicker (running head, adopted as slot 0 via
 * [data-tm-lead] — the Seam) → headline → deck → body blocks → figure.
 *
 * The per-element gesture vocabulary (all transform/opacity only,
 * small) is round 10's, unchanged: line-mask rises with the chapter
 * WINGS (even chapters from the left, odd from the right, offsets
 * clipped inside the SplitText masks), muted fades with the clamped
 * whole-element wing (wingMuted — the thread's lanes are measured, not
 * felt), PRESS marks (scale 1.035 → 1 + settling degree), RISEN
 * material (0.965 → 1 + 12px), block fades, the gate's unmasked NAME.
 * `muted-fade` and `kicker` stay opacity-only: the Red Thread MEASURES
 * those boxes.
 *
 * Dedicated paths that keep their own triggers:
 *   - THE MANIFESTO (`[data-tm-words]`, ch 02): word-by-word opacity
 *     MANIFESTO_REST→1 across ~60vh, scrub 0.7 — was already the
 *     page's one scrubbed text; now it simply has company.
 *   - THE ENDING LITANY (`[data-tm-mantra]`): the slowing stagger
 *     (litanyDelay) survives scrubbing as spatial rhythm — later lines
 *     take proportionally more scroll — with receipts 0.2 behind each
 *     mantra, all on one scrubbed timeline off one shared trigger.
 *   - EXIT BY DEPARTURE (`[data-tm-depart]`): round 10's scrubbed
 *     chapter exit (y −18, scale .988 behind the masthead), untouched —
 *     it was the one piece of the entrance grammar that already flowed
 *     both ways, and it is the model the rest now follows.
 *   - WEIGHT BREATHING (`[data-breathe]`): scrubbed quickSetter on
 *     `--tm-wght`, quantized to BREATHE_STEPS buckets (F75), untouched.
 *
 * THE PAPER EDITION (A7, the scrubbed world's sharpest edge): a
 * scrubbed page has no final frame until it is scrolled, so a fresh-
 * load Cmd+P finds every below-fold entrance holding its from-state.
 * The print block (globals.css §5) settles the TARGETS with
 * `!important`; the SplitText line fragments INSIDE the masked
 * headlines carry their own inline transforms, which element-level
 * rules cannot reach — measured on the one-shot build too (34
 * fragments printed displaced into their clip masks, i.e. blank
 * headlines). The print block now resets the fragments as well; this
 * component needs no print handler of its own.
 *
 * The hero entrance itself is pure CSS (globals.css `.hero-enter`,
 * gated by the `data-motion-ready` attribute a layout inline script
 * stamps pre-paint); this component's only hero duty is removing that
 * attribute once the entrance has played, so it is load-only forever —
 * re-enabling motion mid-session never replays it.
 *
 * Everything lives in one gsap.context riding the single native-scroll
 * ScrollTrigger loop (A1); cleanup reverts tweens, triggers, splits, and
 * the breathing vars, so the quiet toggle restores the untouched page.
 */

"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useLenis } from "@/components/layout/SmoothScroll";
import {
  announceLayoutSettled,
  ARRIVAL_EVENT,
} from "@/components/story/arrival";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/** Entrance window start for in-place (orphan) reveals (plan 3.8's
 *  75% line, kept). clamp() keeps first/last-chapter triggers inside
 *  the reachable scroll span, mirroring the thread's contract. */
const ENTER_START = "clamp(top 75%)";

/** Composed-scene window start (PREMIUM-FLOW #1). Slightly earlier
 *  than a lone element (larger % = higher in the scroll) so the
 *  staggered beat STARTS just before the eye arrives. Overridable per
 *  scene via `data-tm-start` for the taller list chapters. */
const SCENE_START = "clamp(top 82%)";

/** How much viewport the entrance window spans, in viewport-% of
 *  scroll travel. 26% ≈ the prototype's own per-element in-window
 *  (its `in .06 .24` settles an element by ~76% of viewport): the
 *  gesture lives in the lower third and is DONE before the element
 *  reaches the reading line, so the settled middle stays settled
 *  (round 5) and a parked page never rests on a half-risen line
 *  anywhere the eye actually reads. */
const SCRUB_SPAN = 26;

/** Inter-child stagger inside one scene, in timeline seconds — under
 *  scrub these are UNITS OF SCROLL, not time: the whole timeline maps
 *  onto the SCRUB_SPAN window, so 0.07 keeps the same directed-cascade
 *  proportions the one-shot build had. */
const SCENE_STAGGER = 0.07;

/** The entrance-vocabulary hooks a scene composes (the manifesto scrub,
 *  the litany, and weight-breathing keep their own dedicated paths). */
const ENTRANCE_SELECTOR =
  "[data-tm-bright], [data-tm='muted'], [data-tm='muted-fade'], [data-tm='block'], [data-tm='name'], [data-tm='kicker'], [data-tm='press'], [data-tm='rise']";

/** Scrub smoothing (plan 3.9: 0.5–1; 0.7 matches THREAD_SCRUB so every
 *  scrubbed element shares one lag). */
const TM_SCRUB = 0.7;

/** The manifesto's scroll span: ~60vh of chapter-02 scroll. */
const MANIFESTO_SPAN = "+=60%";

/**
 * The manifesto's resting ink (CRITIC-LEDGER F06, a P0).
 *
 * The scrub used to rest at 0.25, which composites body ink #26231C onto
 * dawn paper #FAF6EF at **1.66:1** — so a reader who stopped on the
 * thesis sentence read "And how each piece was checked before ▓▓▓▓▓."
 * That is a WCAG 1.4.3 failure on text as displayed, and it is the
 * sentence the chapter exists to say.
 *
 * 0.60 composites to #7b7770 — **4.12:1**, which clears AA for the
 * manifesto's 64px setting (3:1 large text) with margin, and clears AAA
 * large (4.5:1) too. The gesture survives: the scrub still travels 0.60
 * → 1.00 word by word, it just starts from ink a reader can read.
 */
const MANIFESTO_REST = 0.6;

/**
 * THE WINGS (round 10 — the relief port's horizontal axis).
 *
 * Which side a chapter's type enters from: even chapters from the left,
 * odd from the right — the round-6 prototype's alternation, unchanged.
 * Chapter 01 never reaches this (the hero is complete at load, its
 * entrance is the nameplate + CSS rail).
 *
 * @param el - Any element inside a chapter section
 * @returns −1 (enters from the left) or +1 (from the right)
 */
function chapterSide(el: HTMLElement): number {
  const id = el
    .closest<HTMLElement>("[data-chapter]")
    ?.getAttribute("data-chapter");
  return id && Number(id) % 2 === 0 ? -1 : 1;
}

/**
 * The muted lines' wing amplitude, clamped per breakpoint AGAINST THE
 * THREAD'S LANES — measured, not felt (red-thread.spec's crossing
 * probe and dossier.spec's 390 gutter probe both read every from-state
 * box, opacity notwithstanding — and under scrub the from-states are
 * standing boxes at every scroll position above their window, so the
 * clamps below are MORE load-bearing than they were one-shot):
 *   - compact (<1024): the 36px left gutter is the thread's RESERVED
 *     lane (dossier.spec:662 holds ink ≥4px clear of every letterform
 *     box, from-states included — a −10 wing measured 26 against a
 *     reach bound of ~22 and failed on all five engines). So at
 *     compact widths every wing enters FROM THE RIGHT: direction
 *     survives on the phone, the gutter stays the thread's. 14 clears
 *     the viewport edge at 320 (296 + 14 = 310).
 *   - binding (≥1280): the spine tops out at textEdge − 48 (constants
 *     bindingLane), so ±22 keeps ≥24px of clear margin.
 *   - lg (1024–1279): the spine rides the RIGHT gutter and every muted
 *     line is max-w-capped ≥500px short of it; ±22 is safe both ways.
 *
 * @param side - The chapter's wing side (±1)
 * @param vw - Viewport width at build time
 * @returns Signed x offset in px for the from-state
 */
function wingMuted(side: number, vw: number): number {
  if (vw <= 1023) return 14;
  return side * 22;
}

/**
 * The masked lines' wing amplitude. These offsets live INSIDE the
 * SplitText overflow masks, so they are clipped, never probed and can
 * afford the full round-6 travel. At compact widths they follow the
 * muted wings rightward (wingMuted): one direction per chapter — a
 * headline entering left over an echo entering right reads as a
 * misprint, not a composition.
 *
 * @param side - The chapter's wing side (±1)
 * @param vw - Viewport width at build time
 * @returns Signed x offset in px for the line from-state
 */
function wingLine(side: number, vw: number): number {
  if (vw <= 1023) return 28;
  return side * 44;
}

/** Exit by departure (round 10): how far a finished station backs into
 *  the paper as its section leaves behind the masthead. Scale-based
 *  depth (s < 1 cannot escape its box — the recorded plate-depth CUT).
 *  The transform rides the chapter's content WRAP, which the Red
 *  Thread never measures (its anchors are measured children, and
 *  ThreadSegment re-measures only on section RESIZE — a transform is
 *  not one). The one exposure — a live window resize landing while a
 *  departure is mid-scrub — shifts a measured anchor by at most 18px
 *  down / 7px sideways for that build, the same class of exposure the
 *  entrance from-states have always had. */
const DEPART_Y = -18;
const DEPART_SCALE = 0.988;

/**
 * Litany delay — the slowing stagger (plan 3.8, "line-masks with
 * slowing stagger"): 0.12 to the first line, and each line after it
 * waits longer than the last. Under scrub these are scroll units: the
 * slowing survives as spatial rhythm — each mantra takes MORE scroll
 * than the one before it, which is the same authored deceleration
 * read against the reader's own hand.
 *
 * CRITIC-LEDGER F78: this was a three-entry magic array read as
 * `LITANY_DELAYS[index] ?? 0`, so a FOURTH mantra would take delay 0 and
 * play AHEAD of the three deliberately-slowed lines — silently
 * inverting the chapter's signature choreography, with nothing in the
 * build to catch it. Deriving the delay makes the stagger a rule
 * instead of a lookup: it holds for any number of lines, and the
 * quadratic term is what makes it SLOW rather than merely stagger
 * (gaps of 0.20, 0.30, 0.40 …, reproducing the original
 * 0.12 / 0.32 / 0.62 exactly for the three lines that ship).
 *
 * @param index - Zero-based mantra position
 * @returns Delay in timeline units
 */
function litanyDelay(index: number): number {
  return 0.12 + 0.2 * index + 0.05 * index * (index - 1);
}

/** Hero entrance settle: last delay (4 × 60ms, the directives' seat)
 *  + 0.6s run + margin (retuned for the two-line masthead — the byline
 *  stipple that used to close the intro at ~1.07s is retired). */
/* Round 9: 1100 → 3600. [data-motion-ready] must now outlive the
   nameplate's CSS layer — the still letters' opsz arrival ends ~1.5s
   and the retimed reading matter (claim seat 38 + 0.8s rise) ends
   ~3.4s; removing the attribute at 1100ms cut both mid-flight. The
   machines are not affected (they hold their letters with inline
   styles once hydrated), and the cost is only that the hero keeps its
   filter/compositing path ~2.5s longer on three elements. */
const HERO_SETTLE_MS = 3600;

/**
 * Weight-breathing range: the headline sits at the token weight 420
 * mid-viewport and relaxes toward BREATHE_MIN at the edges — a sine
 * over trigger progress.
 *
 * CRITIC-LEDGER F75 — two faults, both about the A7 rule that a motion
 * world must END where the static world RESTS:
 *  1. The floor was 360 against a static fallback of 420, so a motion
 *     reader saw a measurably LIGHTER headline everywhere except dead
 *     centre. The end state was not the static state. The floor is now
 *     396: the breath is still visible (it is a variable-weight axis,
 *     not a fade) but the extreme never drops a headline below the
 *     weight a static reader gets by more than half a step.
 *  2. `wght` changes glyph ADVANCE WIDTHS in Fraunces, so writing a new
 *     value every frame is a layout property in all but name — on
 *     several headlines at once, since apparatus.tsx puts data-breathe
 *     on most of them. BREATHE_STEPS quantizes the axis so the setter
 *     only writes when the value actually changes bucket: 4 discrete
 *     weights across the whole travel instead of ~60 distinct ones, and
 *     the quickSetter is skipped entirely between buckets.
 */
const BREATHE_MIN = 396;
const BREATHE_SPAN = 24;
/** Quantization buckets for the breath (see BREATHE_MIN, fault 2). */
const BREATHE_STEPS = 4;

/**
 * Typed element query.
 *
 * @param selector - CSS selector
 * @returns Matching elements
 */
function q(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(selector));
}

/**
 * SplitText aria mode for a target. Headings take `aria: "auto"`
 * (aria-label keeps the accessible name one intact string); targets the
 * markup already hides (the aria-hidden spans with sr-only twins —
 * aria-label is prohibited on paragraph roles) need nothing added.
 *
 * @param el - The split target
 * @returns The SplitText aria setting
 */
function ariaModeOf(el: HTMLElement): "auto" | "none" {
  return el.getAttribute("aria-hidden") === "true" ? "none" : "auto";
}

/**
 * One scrubbed entrance window awaiting the reader.
 *
 * The landing grant (see the header): a landing settles every window
 * whose trigger box is already above the fold.
 */
interface EntranceWindow {
  /** The window's trigger element — its box decides "arrived at" */
  readonly el: Element;
  /** The scrubbed timeline riding that trigger */
  readonly tl: gsap.core.Timeline;
}

/**
 * Settle every entrance window the reader has ALREADY arrived at.
 *
 * The rule is the reader's own frame: any window whose trigger box
 * tops above the fold is content they asked to be at, so its trigger
 * retires and the authored cascade plays to completion from wherever
 * the scrub had carried it. Windows below the fold are untouched —
 * scrolling onward through the paper keeps its full two-way
 * choreography, which is why this pass is invisible to a reader who
 * only ever scrolls. Idempotent: a settled window has no trigger left
 * to retire.
 *
 * @param windows - The scrubbed entrance windows
 */
function settleArrived(windows: EntranceWindow[]): void {
  const fold = window.innerHeight;
  for (const { el, tl } of windows) {
    if (!tl.scrollTrigger) continue;
    if (el.getBoundingClientRect().top >= fold) continue;
    if (tl.progress() === 1) continue;
    tl.scrollTrigger.kill(false, true);
    tl.play();
  }
}

/**
 * The scrubbed window's end line for a given start.
 *
 * Both ends stay inside the reachable scroll span via clamp(), same as
 * the start (a window whose clamp collapses it to a point degrades to
 * an instant settle at that scroll — the pre-scrub behavior — rather
 * than to an unreachable trigger).
 *
 * @param start - ScrollTrigger start string ("clamp(top 82%)")
 * @returns The matching end string, SCRUB_SPAN viewport-% later
 */
function scrubEnd(start: string): string {
  const pct = Number(/(\d+(?:\.\d+)?)%/.exec(start)?.[1] ?? "75");
  return `clamp(top ${pct - SCRUB_SPAN}%)`;
}

/**
 * One scrubbed entrance timeline: the shared spine every composed
 * scene, orphan and litany rides. State is a pure function of scroll —
 * dormant when the page is still, backwards when the reader is.
 *
 * @param trigger - The window's trigger element
 * @param start - ScrollTrigger start position
 * @returns The timeline (add children at their stagger slots)
 */
function scrubTimeline(trigger: Element, start: string): gsap.core.Timeline {
  return gsap.timeline({
    scrollTrigger: {
      trigger,
      start,
      end: scrubEnd(start),
      scrub: TM_SCRUB,
    },
  });
}

/**
 * One chapter bright line: SplitText line-mask rise, added to its
 * scene's scrubbed timeline at its stagger slot. autoSplit re-lines on
 * reflow: SplitText reverts the returned tween, onSplit builds its
 * replacement into the same slot, and the scrubbed trigger re-renders
 * the position-correct frame on the next update — no `played` state,
 * because there is no state.
 *
 * @param el - The bright headline element (plain text only)
 * @param tl - The scene's scrubbed timeline
 * @param position - Timeline slot (the scene stagger)
 * @returns The SplitText instance (for cleanup)
 */
function maskRise(
  el: HTMLElement,
  tl: gsap.core.Timeline,
  position: number
): SplitText {
  /* The wing (round 10): each line slides INTO its own mask from the
     chapter's side while it rises — the offset is clipped by the
     overflow wrapper, so the element's probe box never moves. */
  const wing = wingLine(chapterSide(el), document.documentElement.clientWidth);
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    aria: ariaModeOf(el),
    onSplit: (self) => {
      /* The TWEEN is created standalone and then seated in the
         timeline: `tl.from()` returns the TIMELINE, and returning that
         here would hand SplitText the whole scene to revert on every
         reflow re-split. Returning the tween keeps the contract to one
         headline's lines. */
      const tween = gsap.from(self.lines, {
        yPercent: 100,
        x: wing,
        duration: 0.8,
        ease: "power3.out" /* quart.out */,
        stagger: 0.1,
      });
      tl.add(tween, position);
      return tween;
    },
  });
}

/**
 * The per-hook entrance gesture. All transform/opacity only, all small.
 *   - `muted`      → fade + rise + the chapter-side wing (round 10):
 *                    the echo line follows its headline in from the
 *                    same side, amplitude clamped per breakpoint so
 *                    its from-state box clears the thread's lanes
 *   - `muted-fade` → fade only: the ch-03 line holding [data-thread-word]
 *                    is a box the Red Thread MEASURES, never transforms
 *   - `kicker`     → fade only, a beat quicker: the running head prints
 *                    FIRST at a chapter seam (slot 0 of the composed
 *                    entrance — see the lead pass), and
 *                    [data-thread-kicker] is another measured box, so
 *                    the head never transforms either
 *   - `name`       → the gate's giant name takes the hero's own grammar
 *   - `press`      → a mark arriving from the reader's side (round 10):
 *                    scale 1.035 pressing down to 1, an optional
 *                    `data-tm-deg` settling out — the stamp's rhyme
 *   - `rise`       → material surfacing from the paper (round 10):
 *                    scale 0.965 → 1 with a 12px rise; s < 1 depth
 *                    cannot escape its box (the plate-depth CUT)
 *   - `block`      → whole-block fade + 16px rise (the prose default)
 *
 * @param el - The entrance element
 * @returns Tween vars for this element's vocabulary
 */
function entranceVars(el: HTMLElement): gsap.TweenVars {
  switch (el.getAttribute("data-tm")) {
    case "muted":
      return {
        opacity: 0,
        x: wingMuted(chapterSide(el), document.documentElement.clientWidth),
        y: 8,
        duration: 0.7,
        ease: "power2.out",
      };
    case "muted-fade":
      return { opacity: 0, duration: 0.7, ease: "power2.out" };
    case "kicker":
      return { opacity: 0, duration: 0.6, ease: "power2.out" };
    case "name":
      return { opacity: 0, y: 14, duration: 1, ease: "expo.out" };
    case "press":
      return {
        opacity: 0,
        scale: 1.035,
        rotation: parseFloat(el.getAttribute("data-tm-deg") ?? "0") || 0,
        /* Compact widths pivot on the LEFT edge: a centred 1.035 grows
           a full-column mark ~6px into the thread's reserved 390
           gutter (dossier.spec:662's ≥4px clearance), while a left
           pivot grows rightward only — the gutter never hears it. */
        transformOrigin:
          document.documentElement.clientWidth <= 1023 ? "0% 30%" : "50% 30%",
        duration: 0.7,
        ease: "power3.out",
      };
    case "rise":
      return {
        opacity: 0,
        scale: 0.965,
        y: 12,
        transformOrigin: "50% 62%",
        duration: 0.9,
        ease: "power2.out",
      };
    case "block":
    default:
      return { opacity: 0, y: 16, duration: 0.6, ease: "power2.out" };
  }
}

/**
 * Add one entrance element to a scrubbed timeline at its stagger slot.
 * Bright lines take the line-mask; every other hook takes its
 * `entranceVars` gesture. `.from()` renders the from-state at build
 * (the pre-hide hand-off below depends on that), and the trigger's
 * first update then renders whatever frame the reader's position has
 * already earned.
 *
 * @param el - The entrance element
 * @param tl - The scrubbed timeline (scene, orphan, or litany)
 * @param position - Stagger slot in timeline units
 * @param splits - Sink for SplitText instances (cleanup)
 */
function addEntrance(
  el: HTMLElement,
  tl: gsap.core.Timeline,
  position: number,
  splits: SplitText[]
): void {
  if (el.hasAttribute("data-tm-bright")) {
    splits.push(maskRise(el, tl, position));
    return;
  }
  tl.from(el, entranceVars(el), position);
}

/**
 * Null-rendering choreographer. Mount once inside StoryShell.
 *
 * @returns null — all motion is applied to the server-rendered markup
 */
export function TextMotion() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    /* Hero entrance bookkeeping: the CSS animation (globals.css) has
       been running since first paint; once it settles, drop the
       readiness attribute so (a) the blur(0) filter leaves the hero
       compositing path and (b) the entrance can never replay. */
    const heroTimer = window.setTimeout(() => {
      document.documentElement.removeAttribute("data-motion-ready");
    }, HERO_SETTLE_MS);

    let disposed = false;
    let ctx: gsap.Context | null = null;
    const splits: SplitText[] = [];
    const breatheEls: HTMLElement[] = [];
    /* The scrubbed windows, and the landing signal that settles the
       arrived-at ones (the F01 grant, narrowed — see the header). */
    const windows: EntranceWindow[] = [];
    const onArrival = () => settleArrived(windows);
    window.addEventListener(ARRIVAL_EVENT, onArrival);

    /* Split AFTER webfonts settle so line boxes are final (SplitText's
       autoSplit also re-lines if a straggler font lands later). */
    document.fonts?.ready.then(() => {
      if (disposed) return;

      /* THE PRE-HIDE HAND-OFF (CRITIC-LEDGER F76).
         The CSS pre-hide (globals.css, `html[data-tm-prehide]`) holds
         every reveal target at opacity 0 from first paint, so chapter
         content can no longer flash visible → hidden → re-entering
         while the webfonts settle. It must come OFF right here, one
         statement before the tweens are built: `gsap.from()` reads the
         element's CURRENT computed style as its END state, so a tween
         created while the pre-hide still matched would animate from 0
         to 0 and strand the content invisible forever. Probed: leaving
         the attribute up stranded 43 elements on this page.
         The removal is unconditional and synchronous with tween
         creation, so there is no window in which the page is hidden and
         nothing is coming to reveal it. */
      document.documentElement.removeAttribute("data-tm-prehide");

      ctx = gsap.context(() => {
        /* ── Composed scenes: one scrubbed timeline per chapter ─────
           Every entrance element under a [data-tm-scene] rides that
           ONE shared window, in DOM order (kicker→headline→deck→body→
           figure), each slot SCENE_STAGGER later — the section
           assembles as one authored beat that the reader's own hand
           drives, forward and back.

           THE LEAD PASS (the Seam, stage 1). A chapter's running head
           sits OUTSIDE every scene wrapper (the kicker is the seam's own
           furniture), so it used to be either static or a second,
           independent trigger — and the chapter arrived in parts.
           An element marked [data-tm-lead] is ADOPTED by the FIRST
           scene of its own [data-chapter] section: it takes slot 0 of
           that scene's cascade and the scene's children shift one slot
           later, so head → headline → deck → body play as ONE authored
           entrance off ONE window. Later scenes in the section adopt
           nothing, and a lead whose section has no scene falls through
           to the orphan pass below — its own window, never dropped
           (ch06 stays unwrapped on purpose; its head arrives solo). */
        const scenes = q("[data-tm-scene]");
        const firstSceneOf = new Map<HTMLElement, HTMLElement>();
        for (const scene of scenes) {
          const section = scene.closest<HTMLElement>("[data-chapter]");
          if (section && !firstSceneOf.has(section)) {
            firstSceneOf.set(section, scene);
          }
        }
        const adopted = new Set<HTMLElement>();
        for (const scene of scenes) {
          const start = scene.getAttribute("data-tm-start") || SCENE_START;
          const section = scene.closest<HTMLElement>("[data-chapter]");
          const leads =
            section && firstSceneOf.get(section) === scene
              ? Array.from(
                  section.querySelectorAll<HTMLElement>("[data-tm-lead]")
                ).filter((el) => !el.closest("[data-tm-scene]"))
              : [];
          const children = Array.from(
            scene.querySelectorAll<HTMLElement>(ENTRANCE_SELECTOR)
          ).filter((el) => el.closest("[data-tm-scene]") === scene);
          const tl = scrubTimeline(scene, start);
          windows.push({ el: scene, tl });
          [...leads, ...children].forEach((el, index) => {
            addEntrance(el, tl, index * SCENE_STAGGER, splits);
          });
          for (const lead of leads) adopted.add(lead);
        }

        /* ── Orphan entrance elements — reveal in place (fallback) ───
           Anything not inside a scene keeps a per-element window, so no
           reveal is ever silently dropped. (Adopted leads are not
           orphans: they already ride their scene's timeline.) */
        for (const el of q(ENTRANCE_SELECTOR)) {
          if (el.closest("[data-tm-scene]") || adopted.has(el)) continue;
          const tl = scrubTimeline(el, ENTER_START);
          windows.push({ el, tl });
          addEntrance(el, tl, 0, splits);
        }

        /* ── The manifesto — the original scrubbed text ──────────── */
        const deckLines = q("[data-tm-words]");
        if (deckLines.length > 0) {
          const wordSplits = deckLines.map((el) =>
            SplitText.create(el, { type: "words", aria: ariaModeOf(el) })
          );
          splits.push(...wordSplits);
          const words = wordSplits.flatMap((split) => split.words);
          gsap.set(words, { opacity: MANIFESTO_REST });
          gsap.to(words, {
            opacity: 1,
            duration: 0.3,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: deckLines[0],
              start: ENTER_START,
              end: MANIFESTO_SPAN,
              scrub: TM_SCRUB,
            },
          });
        }

        /* ── The ending litany — slowing line-mask cascade ─────────
           One scrubbed timeline off one shared trigger; the slowing
           stagger (litanyDelay) becomes spatial — each mantra takes
           more scroll than the last — and receipts follow each mantra
           by 0.2 of the same window. */
        const mantras = q("[data-tm-mantra]");
        const receipts = q("[data-tm-receipt]");
        if (mantras.length > 0) {
          const litanyTrigger = mantras[0].closest("figure") ?? mantras[0];
          const tl = scrubTimeline(litanyTrigger, ENTER_START);
          windows.push({ el: litanyTrigger, tl });
          mantras.forEach((mantra, index) => {
            const delay = litanyDelay(index);
            splits.push(maskRise(mantra, tl, delay));
            const receipt = receipts[index];
            if (!receipt) return;
            tl.from(
              receipt,
              { opacity: 0, y: 10, duration: 0.7, ease: "power2.out" },
              delay + 0.2
            );
          });
        }

        /* ── Exit by departure (round 10, the relief port) ─────────
           One scrubbed trigger per marked chapter: as the section's
           tail crosses the upper third, the finished station backs
           into the paper — y −18, scale .988 from the top edge — and
           rides off behind the masthead instead of dissolving in
           place. Chapters mark their content WRAP with
           [data-tm-depart] (02, 03, 05, 06 — never the pinned 04, the
           hero, or the parked ending), so the picture leaves as ONE
           assembled piece, which is what makes it a finished picture
           in the first place (round-5 grammar). Scrubbed, so scrolling
           back re-assembles it; no opacity is touched — legibility is
           never traded mid-frame, the mast scrim does the occluding. */
        for (const wrap of q("[data-tm-depart]")) {
          const section = wrap.closest<HTMLElement>("[data-chapter]");
          if (!section) continue;
          gsap.to(wrap, {
            y: DEPART_Y,
            scale: DEPART_SCALE,
            transformOrigin: "50% 0%",
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "clamp(bottom 45%)",
              end: "clamp(bottom 12%)",
              scrub: TM_SCRUB,
            },
          });
        }

        /* ── Weight breathing — one quickSetter per headline ───── */
        for (const el of q("[data-breathe]")) {
          breatheEls.push(el);
          const setWght = gsap.quickSetter(el, "--tm-wght");
          const proxy = { p: 0 };
          /* F75: the last written bucket. `wght` moves glyph advance
             widths, so the setter must fire only when the quantized
             value actually changes — not on every frame of every
             breathing headline. */
          let lastWght = -1;
          gsap.to(proxy, {
            p: 1,
            ease: "none",
            onUpdate: () => {
              const bucket =
                Math.round(Math.sin(proxy.p * Math.PI) * BREATHE_STEPS) /
                BREATHE_STEPS;
              const wght = Math.round(BREATHE_MIN + BREATHE_SPAN * bucket);
              if (wght === lastWght) return;
              lastWght = wght;
              setWght(wght);
            },
            scrollTrigger: {
              trigger: el,
              start: "clamp(top bottom)",
              end: "clamp(bottom top)",
              scrub: TM_SCRUB,
            },
          });
        }
      });

      /* Splitting nudges line boxes; settle every trigger's position.
         The scrubbed windows then render whatever frame the current
         scroll has earned. */
      ScrollTrigger.refresh();
      /* A refresh moves the page under a hash landing by the pin
         distance — tell the landing contract it may re-assert (F09). */
      announceLayoutSettled();

      /* The reader may already BE somewhere: a shared `/#chapter`, a
         reload the browser restored deep in the paper, a Back that
         landed before the fonts did. Whatever is above the fold has
         been arrived at — it presents itself settled rather than
         holding the entrance band's frame (the F01 grant). */
      if (window.scrollY > 0) settleArrived(windows);
    });

    return () => {
      disposed = true;
      window.clearTimeout(heroTimer);
      window.removeEventListener(ARRIVAL_EVENT, onArrival);
      windows.length = 0;
      ctx?.revert();
      for (const split of splits) split.revert();
      splits.length = 0;
      for (const el of breatheEls) el.style.removeProperty("--tm-wght");
      breatheEls.length = 0;
    };
  }, [lenis]);

  return null;
}
