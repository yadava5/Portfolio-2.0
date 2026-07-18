/**
 * @fileoverview TextMotion — the chapters' entrance/scrub choreography.
 *
 * Implements plan 3.8 exactly, in the engine-mounted world ONLY
 * (amendment A7: `useLenis()` is null under reduced motion and the
 * quiet toggle, so none of this ever exists there — static worlds
 * paint the finished page straight from the server markup):
 *
 *   - CHAPTER BRIGHT LINES (`[data-tm-bright]`): SplitText line-masks
 *     (overflow-clip wrappers), translateY 100%→0, 0.8s quart.out,
 *     once at 75% viewport. `aria: "auto"` keeps the accessible name a
 *     single intact string (aria-label on the container, aria-hidden
 *     fragments), and `autoSplit` re-lines on reflow.
 *   - MUTED LINES (`data-tm="muted"`): fade + 10px rise, 0.7s
 *     cubic.out, 200ms after the bright line. `muted-fade` variants
 *     (the ch-03 line holding [data-thread-word]) fade WITHOUT
 *     transform — the Red Thread measures that box.
 *   - BODY BLOCKS (`data-tm="block"`): whole-block fade + 16px rise,
 *     0.6s — never per-char, never per-word on prose.
 *   - THE MANIFESTO (`[data-tm-words]`, ch 02 deck pair): the page's
 *     ONE scrubbed text — word-by-word opacity 0.25→1 across ~60vh of
 *     chapter-02 scroll, scrub 0.7.
 *   - THE ENDING LITANY (`[data-tm-mantra]`): line-mask rises with a
 *     SLOWING stagger (0.12s → +0.2s → +0.3s); receipts follow each
 *     mantra by 200ms. (The final line's WONK=1 is static typography,
 *     set in the markup — it must hold in every world.)
 *   - THE TERMINAL NAME (`data-tm="name"`): the gate's giant name takes
 *     the hero's own fade + 14px rise (1.0s expo.out) — unmasked, since
 *     leading 0.95 would clip the y descenders inside an overflow mask.
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
 * Everything lives in one gsap.context riding the single Lenis+ticker
 * loop (A1); cleanup reverts tweens, triggers, splits, and the
 * breathing vars, so the quiet toggle restores the untouched page.
 */

"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useLenis } from "@/components/layout/SmoothScroll";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/** Entrance trigger position (plan 3.8: "at 75% viewport", once).
 *  clamp() keeps first/last-chapter triggers inside the reachable
 *  scroll span, mirroring the thread's contract (thread/constants). */
const ENTER_START = "clamp(top 75%)";

/** Scrub smoothing for the manifesto + breathing (plan 3.9: 0.5–1;
 *  0.7 matches THREAD_SCRUB so every scrubbed element shares one lag). */
const TM_SCRUB = 0.7;

/** The manifesto's scroll span: ~60vh of chapter-02 scroll. */
const MANIFESTO_SPAN = "+=60%";

/** Litany delays — the slowing stagger: 0.12s to the first line, then
 *  +0.2s, then +0.3s (plan 3.8 "line-masks with slowing stagger"). */
const LITANY_DELAYS = [0.12, 0.32, 0.62];

/** Hero entrance settle: last delay (6 × 60ms) + 0.6s run + margin
 *  (retuned with the entrance itself — PERF-AUDIT fix 1). */
const HERO_SETTLE_MS = 1200;

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
 * One chapter bright line: SplitText line-mask rise. Re-splits on
 * reflow (autoSplit); once played, later re-splits render the final
 * state instead of replaying.
 *
 * @param el - The bright headline element (plain text only)
 * @param trigger - Trigger element (defaults to el)
 * @param delay - Seconds after the trigger fires (litany stagger)
 * @returns The SplitText instance (for cleanup)
 */
function maskRise(
  el: HTMLElement,
  trigger: Element = el,
  delay = 0
): SplitText {
  let played = false;
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    aria: ariaModeOf(el),
    onSplit: (self) => {
      if (played) return gsap.set(self.lines, { yPercent: 0 });
      return gsap.from(self.lines, {
        yPercent: 100,
        duration: 0.8,
        ease: "power3.out" /* quart.out */,
        stagger: 0.1,
        delay,
        scrollTrigger: { trigger, start: ENTER_START, once: true },
        onComplete: () => {
          played = true;
        },
      });
    },
  });
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

    /* Split AFTER webfonts settle so line boxes are final (SplitText's
       autoSplit also re-lines if a straggler font lands later). */
    document.fonts?.ready.then(() => {
      if (disposed) return;

      ctx = gsap.context(() => {
        /* ── Chapter bright lines — line-mask rise ─────────────── */
        for (const el of q("[data-tm-bright]")) {
          splits.push(maskRise(el));
        }

        /* ── Muted lines — fade + 10px rise, 200ms later ───────── */
        for (const el of q("[data-tm='muted']")) {
          gsap.from(el, {
            opacity: 0,
            y: 10,
            duration: 0.7,
            ease: "power2.out" /* cubic.out */,
            delay: 0.2,
            scrollTrigger: { trigger: el, start: ENTER_START, once: true },
          });
        }
        /* Thread-anchored muted line: opacity only, no transform */
        for (const el of q("[data-tm='muted-fade']")) {
          gsap.from(el, {
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            delay: 0.2,
            scrollTrigger: { trigger: el, start: ENTER_START, once: true },
          });
        }

        /* ── Body blocks — whole-block fade + 16px rise ────────── */
        for (const el of q("[data-tm='block']")) {
          gsap.from(el, {
            opacity: 0,
            y: 16,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: ENTER_START, once: true },
          });
        }

        /* ── The terminal name — hero grammar, unmasked ────────── */
        for (const el of q("[data-tm='name']")) {
          gsap.from(el, {
            opacity: 0,
            y: 14,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: ENTER_START, once: true },
          });
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

        /* ── The ending litany — slowing line-mask cascade ─────── */
        const mantras = q("[data-tm-mantra]");
        const receipts = q("[data-tm-receipt]");
        if (mantras.length > 0) {
          const litanyTrigger = mantras[0].closest("figure") ?? mantras[0];
          mantras.forEach((mantra, index) => {
            const delay = LITANY_DELAYS[index] ?? 0;
            splits.push(maskRise(mantra, litanyTrigger, delay));
            const receipt = receipts[index];
            if (receipt) {
              gsap.from(receipt, {
                opacity: 0,
                y: 10,
                duration: 0.7,
                ease: "power2.out",
                delay: delay + 0.2,
                scrollTrigger: {
                  trigger: litanyTrigger,
                  start: ENTER_START,
                  once: true,
                },
              });
            }
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
    });

    return () => {
      disposed = true;
      window.clearTimeout(heroTimer);
      ctx?.revert();
      for (const split of splits) split.revert();
      splits.length = 0;
      for (const el of breatheEls) el.style.removeProperty("--tm-wght");
      breatheEls.length = 0;
    };
  }, [lenis]);

  return null;
}
