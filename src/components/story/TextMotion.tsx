/**
 * @fileoverview TextMotion — the chapters' entrance/scrub choreography.
 *
 * Implements plan 3.8 + PREMIUM-FLOW item #1 ("composed section
 * choreography"), in the engine-mounted world ONLY (amendment A7:
 * `useLenis()` is null under reduced motion and the quiet toggle, so none
 * of this ever exists there — static worlds paint the finished page
 * straight from the server markup).
 *
 * THE COMPOSED-SCENE MODEL (PREMIUM-FLOW #1). Reveals used to fire
 * per-element, each on its OWN `top 75%` trigger, so a chapter arrived as
 * scattered pops instead of one authored beat. Now every chapter reveals
 * as a directed GROUP: an ancestor marked `[data-tm-scene]` is the shared
 * trigger for all the `data-tm-*` elements beneath it, and those children
 * play off ONE ScrollTrigger with an internal stagger (DOM order, 70ms
 * apart — the Linear pattern). Scene order falls out of the markup:
 * kicker (static running head) → headline → deck → body blocks → figure.
 * This is the litany's own mechanism (one trigger, staggered delays)
 * generalized to all seven chapters; it adds NO new visual vocabulary —
 * the ink-settle / line-mask / block-fade gestures are unchanged, only
 * their TRIGGER and TIMING are re-composed. Elements outside any scene
 * keep the original in-place reveal (safe fallback).
 *
 * The per-element gesture vocabulary (all transform/opacity only, small):
 *   - CHAPTER BRIGHT LINES (`[data-tm-bright]`): SplitText line-masks
 *     (overflow-clip wrappers), translateY 100%→0, 0.8s quart.out.
 *     `aria: "auto"` keeps the accessible name a single intact string
 *     (aria-label on the container, aria-hidden fragments), and
 *     `autoSplit` re-lines on reflow.
 *   - MUTED LINES (`data-tm="muted"`): fade + 10px rise, 0.7s cubic.out.
 *     `muted-fade` variants (the ch-03 line holding [data-thread-word])
 *     fade WITHOUT transform — the Red Thread measures that box.
 *   - BODY BLOCKS (`data-tm="block"`): whole-block fade + 16px rise,
 *     0.6s — never per-char, never per-word on prose.
 *   - THE TERMINAL NAME (`data-tm="name"`): the gate's giant name takes
 *     the hero's own fade + 14px rise (1.0s expo.out) — unmasked, since
 *     leading 0.95 would clip the y descenders inside an overflow mask.
 *   - THE MANIFESTO (`[data-tm-words]`, ch 02 deck pair): the page's ONE
 *     scrubbed text — word-by-word opacity 0.25→1 across ~60vh of
 *     chapter-02 scroll, scrub 0.7. NOT a one-shot; keeps its own trigger.
 *   - THE ENDING LITANY (`[data-tm-mantra]`): line-mask rises with a
 *     SLOWING stagger (0.12s → +0.2s → +0.3s), one shared trigger;
 *     receipts follow each mantra by 200ms. (The final line's WONK=1 is
 *     static typography, set in the markup — it holds in every world.)
 *   - WEIGHT BREATHING (`[data-breathe]`): Fraunces wght 360→420→360
 *     (±60 max) scroll-linked per headline — ONE quickSetter writing
 *     `--tm-wght`, composed into font-variation-settings by globals.css.
 *     No layout property is ever animated.
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
import { ARRIVAL_EVENT } from "@/components/story/arrival";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/** Entrance trigger position for in-place (orphan) reveals (plan 3.8:
 *  "at 75% viewport", once). clamp() keeps first/last-chapter triggers
 *  inside the reachable scroll span, mirroring the thread's contract. */
const ENTER_START = "clamp(top 75%)";

/** Composed-scene trigger position (PREMIUM-FLOW #1). Fires slightly
 *  earlier than a lone element (larger % = higher in the scroll) so the
 *  staggered beat STARTS just before the eye arrives and the settle lands
 *  as the reading path reaches it. Overridable per scene via
 *  `data-tm-start` for the taller list chapters. */
const SCENE_START = "clamp(top 82%)";

/** Inter-child stagger inside one scene (plan #1: children 40–90ms apart).
 *  70ms reads as a directed cascade without dragging — Linear restraint. */
const SCENE_STAGGER = 0.07;

/** The entrance-vocabulary hooks a scene composes (the manifesto scrub,
 *  the litany, and weight-breathing keep their own dedicated paths). */
const ENTRANCE_SELECTOR =
  "[data-tm-bright], [data-tm='muted'], [data-tm='muted-fade'], [data-tm='block'], [data-tm='name']";

/** Scrub smoothing for the manifesto + breathing (plan 3.9: 0.5–1;
 *  0.7 matches THREAD_SCRUB so every scrubbed element shares one lag). */
const TM_SCRUB = 0.7;

/** The manifesto's scroll span: ~60vh of chapter-02 scroll. */
const MANIFESTO_SPAN = "+=60%";

/** Litany delays — the slowing stagger: 0.12s to the first line, then
 *  +0.2s, then +0.3s (plan 3.8 "line-masks with slowing stagger"). */
const LITANY_DELAYS = [0.12, 0.32, 0.62];

/** Hero entrance settle: last delay (4 × 60ms, the directives' seat)
 *  + 0.6s run + margin (retuned for the two-line masthead — the byline
 *  stipple that used to close the intro at ~1.07s is retired). */
const HERO_SETTLE_MS = 1100;

/** Weight-breathing range (spec: 360→420 max, ±60): the headline sits
 *  at the token weight 420 mid-viewport and relaxes toward 360 at the
 *  edges — a sine over trigger progress. */
const BREATHE_MIN = 360;
const BREATHE_SPAN = 60;

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
 * Is a trigger ALREADY past its start line at build time? (The viewport
 * fraction is parsed from the "clamp(top N%)" convention.)
 *
 * Load-bearing crash guard: a `once:true` trigger created past-start
 * fires and SELF-KILLS synchronously inside whatever refresh loop first
 * touches it (another trigger's init, the pin's creation) — and killing
 * mutates GSAP's trigger list mid-iteration, which crashed hydration
 * with "reading 'end' of undefined" on a deep-scroll reload (browser
 * scroll restoration puts most of the paper past-start at once). Such
 * an element gets its entrance played DIRECTLY instead — visually
 * identical (the trigger fired at creation anyway), with no trigger to
 * corrupt the list.
 *
 * @param trigger - The trigger element
 * @param start - ScrollTrigger start string ("clamp(top 82%)")
 * @returns True when the start line is already above the viewport line
 */
function pastStart(trigger: Element, start: string): boolean {
  const pct = Number(/(\d+(?:\.\d+)?)%/.exec(start)?.[1] ?? "75") / 100;
  return trigger.getBoundingClientRect().top <= window.innerHeight * pct;
}

/**
 * One entrance still waiting on its scroll trigger.
 *
 * A trigger line is only crossed by SCROLLING. A landing — header nav,
 * an in-page anchor, a shared `/#hash`, Back/Forward — crosses nothing,
 * so every reveal whose start line sits below the landed viewport line
 * stays at `opacity: 0` forever (CRITIC-LEDGER F01). The engine keeps a
 * roster of the un-fired reveals so an arrival can settle the ones the
 * reader has demonstrably already reached.
 */
interface PendingReveal {
  /** The reveal target — its box decides whether an arrival settles it */
  readonly el: HTMLElement;
  /** Play the entrance now and retire its trigger (idempotent) */
  readonly force: () => void;
}

/**
 * Settle every pending reveal the reader has ALREADY arrived at.
 *
 * The rule is the reader's own frame: anything whose top is above the
 * fold — on screen, or scrolled past on the way in — is content they
 * have arrived at, so it presents itself. Anything still below the fold
 * keeps its trigger and its choreography, which is why scrolling
 * downward through the paper is completely unchanged by this pass.
 *
 * @param pending - The roster of un-fired reveals
 */
function reconcileArrival(pending: PendingReveal[]): void {
  const fold = window.innerHeight;
  for (const item of pending) {
    if (item.el.getBoundingClientRect().top < fold) item.force();
  }
}

/**
 * Enrol a triggered tween in the arrival roster.
 *
 * Forcing kills the trigger but KEEPS the animation (`kill(false, true)`)
 * and plays it from the top, so the gesture the reader sees is the same
 * authored one — only its cue changed from "you scrolled here" to "you
 * asked to be here".
 *
 * @param el - The reveal target
 * @param tween - The entrance tween ScrollTrigger is holding
 * @param pending - The roster to enrol in
 */
function armReveal(
  el: HTMLElement,
  tween: gsap.core.Tween,
  pending: PendingReveal[]
): void {
  let forced = false;
  pending.push({
    el,
    force: () => {
      if (forced || tween.progress() > 0 || tween.isActive()) return;
      forced = true;
      tween.scrollTrigger?.kill(false, true);
      tween.play(0);
    },
  });
}

/**
 * One chapter bright line: SplitText line-mask rise. Re-splits on
 * reflow (autoSplit); once played, later re-splits render the final
 * state instead of replaying.
 *
 * @param el - The bright headline element (plain text only)
 * @param trigger - Trigger element (the scene, or el itself)
 * @param delay - Seconds after the trigger fires (the scene stagger slot)
 * @param start - ScrollTrigger start position
 * @param pending - Arrival roster (omit for reveals with no trigger)
 * @returns The SplitText instance (for cleanup)
 */
function maskRise(
  el: HTMLElement,
  trigger: Element = el,
  delay = 0,
  start: string = ENTER_START,
  pending?: PendingReveal[]
): SplitText {
  let played = false;
  let forced = false;
  /* The live tween: autoSplit re-lines on reflow, so the arrival roster
     must reach whichever tween the CURRENT split is holding. */
  let tween: gsap.core.Tween | null = null;
  /* Past-start at build (deep-scroll reload / already-read content):
     play directly, create NO trigger — see pastStart(). */
  const immediate = pastStart(trigger, start);
  const split = SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    aria: ariaModeOf(el),
    onSplit: (self) => {
      if (played) return gsap.set(self.lines, { yPercent: 0 });
      tween = gsap.from(self.lines, {
        yPercent: 100,
        duration: 0.8,
        ease: "power3.out" /* quart.out */,
        stagger: 0.1,
        delay,
        ...(immediate ? {} : { scrollTrigger: { trigger, start, once: true } }),
        onComplete: () => {
          played = true;
        },
      });
      return tween;
    },
  });
  if (!immediate && pending) {
    pending.push({
      el,
      force: () => {
        if (forced || played || !tween) return;
        forced = true;
        tween.scrollTrigger?.kill(false, true);
        tween.play(0);
      },
    });
  }
  return split;
}

/**
 * The per-hook entrance gesture. All transform/opacity only, all small.
 *   - `muted`      → fade + 10px rise, 0.7s cubic.out
 *   - `muted-fade` → fade only: the ch-03 line holding [data-thread-word]
 *                    is a box the Red Thread MEASURES, never transforms
 *   - `name`       → the gate's giant name takes the hero's own grammar
 *   - `block`      → whole-block fade + 16px rise (the prose default)
 *
 * @param el - The entrance element
 * @returns Tween vars for this element's vocabulary
 */
function entranceVars(el: HTMLElement): gsap.TweenVars {
  switch (el.getAttribute("data-tm")) {
    case "muted":
      return { opacity: 0, y: 10, duration: 0.7, ease: "power2.out" };
    case "muted-fade":
      return { opacity: 0, duration: 0.7, ease: "power2.out" };
    case "name":
      return { opacity: 0, y: 14, duration: 1, ease: "expo.out" };
    case "block":
    default:
      return { opacity: 0, y: 16, duration: 0.6, ease: "power2.out" };
  }
}

/**
 * Reveal one entrance element with its vocabulary gesture, off a shared
 * trigger at a staggered delay. Bright lines take the line-mask; every
 * other hook takes its `entranceVars` fade. `once:true`, killed after
 * play, and enrolled in the arrival roster until it fires.
 *
 * @param el - The entrance element
 * @param trigger - Shared scene trigger (or el itself for orphans)
 * @param start - ScrollTrigger start position
 * @param delay - Stagger slot in seconds
 * @param splits - Sink for SplitText instances (cleanup)
 * @param pending - Arrival roster (see reconcileArrival)
 */
function revealEntrance(
  el: HTMLElement,
  trigger: Element,
  start: string,
  delay: number,
  splits: SplitText[],
  pending: PendingReveal[]
): void {
  if (el.hasAttribute("data-tm-bright")) {
    splits.push(maskRise(el, trigger, delay, start, pending));
    return;
  }
  /* Past-start at build → play directly, no trigger (see pastStart). */
  const immediate = pastStart(trigger, start);
  const tween = gsap.from(el, {
    ...entranceVars(el),
    delay,
    ...(immediate ? {} : { scrollTrigger: { trigger, start, once: true } }),
  });
  if (!immediate) armReveal(el, tween, pending);
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
    /* The un-fired reveals, and the landing signal that settles them. */
    const pending: PendingReveal[] = [];
    const onArrival = () => reconcileArrival(pending);
    window.addEventListener(ARRIVAL_EVENT, onArrival);

    /* Split AFTER webfonts settle so line boxes are final (SplitText's
       autoSplit also re-lines if a straggler font lands later). */
    document.fonts?.ready.then(() => {
      if (disposed) return;

      ctx = gsap.context(() => {
        /* ── Composed scenes: one staggered timeline per chapter ────
           Every entrance element under a [data-tm-scene] fires off that
           ONE shared trigger, in DOM order (kicker→headline→deck→body→
           figure), each slot SCENE_STAGGER later — the section assembles
           as one authored beat instead of scattered pops. */
        for (const scene of q("[data-tm-scene]")) {
          const start = scene.getAttribute("data-tm-start") || SCENE_START;
          const children = Array.from(
            scene.querySelectorAll<HTMLElement>(ENTRANCE_SELECTOR)
          ).filter((el) => el.closest("[data-tm-scene]") === scene);
          children.forEach((el, index) => {
            revealEntrance(
              el,
              scene,
              start,
              index * SCENE_STAGGER,
              splits,
              pending
            );
          });
        }

        /* ── Orphan entrance elements — reveal in place (fallback) ───
           Anything not inside a scene keeps the original per-element
           trigger, so no reveal is ever silently dropped. */
        for (const el of q(ENTRANCE_SELECTOR)) {
          if (el.closest("[data-tm-scene]")) continue;
          revealEntrance(el, el, ENTER_START, 0, splits, pending);
        }

        /* ── The manifesto — the page's ONE scrubbed text ──────── */
        const deckLines = q("[data-tm-words]");
        if (deckLines.length > 0) {
          const wordSplits = deckLines.map((el) =>
            SplitText.create(el, { type: "words", aria: ariaModeOf(el) })
          );
          splits.push(...wordSplits);
          const words = wordSplits.flatMap((split) => split.words);
          gsap.set(words, { opacity: 0.25 });
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
           The original composed scene (one shared trigger, staggered
           delays); this is the pattern the rest of the page now shares. */
        const mantras = q("[data-tm-mantra]");
        const receipts = q("[data-tm-receipt]");
        if (mantras.length > 0) {
          const litanyTrigger = mantras[0].closest("figure") ?? mantras[0];
          /* Past-start at build → play directly, no trigger. */
          const litanyImmediate = pastStart(litanyTrigger, ENTER_START);
          mantras.forEach((mantra, index) => {
            const delay = LITANY_DELAYS[index] ?? 0;
            splits.push(
              maskRise(mantra, litanyTrigger, delay, ENTER_START, pending)
            );
            const receipt = receipts[index];
            if (!receipt) return;
            const tween = gsap.from(receipt, {
              opacity: 0,
              y: 10,
              duration: 0.7,
              ease: "power2.out",
              delay: delay + 0.2,
              ...(litanyImmediate
                ? {}
                : {
                    scrollTrigger: {
                      trigger: litanyTrigger,
                      start: ENTER_START,
                      once: true,
                    },
                  }),
            });
            if (!litanyImmediate) armReveal(receipt, tween, pending);
          });
        }

        /* ── Weight breathing — one quickSetter per headline ───── */
        for (const el of q("[data-breathe]")) {
          breatheEls.push(el);
          const setWght = gsap.quickSetter(el, "--tm-wght");
          const proxy = { p: 0 };
          gsap.to(proxy, {
            p: 1,
            ease: "none",
            onUpdate: () => {
              setWght(
                Math.round(
                  BREATHE_MIN + BREATHE_SPAN * Math.sin(proxy.p * Math.PI)
                )
              );
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

      /* Splitting nudges line boxes; settle every trigger's position. */
      ScrollTrigger.refresh();

      /* The reader may already BE somewhere: a shared `/#chapter`, a
         reload the browser restored deep in the paper, a Back that
         landed before the fonts did. Everything above the fold has been
         arrived at, so settle it now rather than leaving it holding for
         a trigger line the reader will never cross. */
      if (window.scrollY > 0) reconcileArrival(pending);
    });

    return () => {
      disposed = true;
      window.clearTimeout(heroTimer);
      window.removeEventListener(ARRIVAL_EVENT, onArrival);
      pending.length = 0;
      ctx?.revert();
      for (const split of splits) split.revert();
      splits.length = 0;
      for (const el of breatheEls) el.style.removeProperty("--tm-wght");
      breatheEls.length = 0;
    };
  }, [lenis]);

  return null;
}
