/**
 * @fileoverview TextGarnish — the pointer-driven half of the full-tier
 * cursor-feel layer (FABLE-VISUAL-BRIEF §F1a/§F3; the garnish rail in
 * globals.css is the CSS half).
 *
 * ONE job: the gate's giant name is a printing PLATE under the hand.
 * While the pointer rides `[data-tier-garnish="tilt"]`, the inner
 * `[data-garnish-plate]` presses INTO the paper toward the cursor —
 * rotateX/rotateY a couple of degrees plus a hair of scale-down, the
 * corner under the finger receding the way a plate takes pressure.
 * Transform-only, on an INNER wrapper (the h2 itself belongs to the
 * `data-tm="name"` entrance and to nothing else — house rule: elements
 * an engine holds by inline style are never a second writer's target),
 * so layout never moves and the Red Thread's ch07 marks (measured off
 * the stamp, not this heading) are untouched.
 *
 * Equity gates, in precedence order (§F2: motion gate → governor →
 * scene): the component renders null always and ATTACHES only when
 *   1. the engine is live (`useLenis()` non-null — reduced motion, the
 *      quiet toggle, print floor, hidden loads all report null);
 *   2. the governor has granted Full (`useTier()` — §F3 proof: capable
 *      desktop, ≥3s measured-smooth scrolling, ≥1024px, Data Saver off);
 *   3. the device actually has a hovering fine pointer (a touch screen
 *      in a desktop viewport never arms it).
 * A mid-session downshift (full → core/print) re-runs the effect: the
 * cleanup detaches every listener and `clearProps` the plate, and since
 * the tilt is transform-only the un-mount costs zero CLS. Hover is pure
 * garnish — no meaning rides it; touch, keyboard, reduced-motion and
 * print readers get byte-identical text.
 *
 * Cost discipline (D4): no rAF of its own — `gsap.quickTo` rides THE
 * one ticker, and only while a tween is live (pointer inside). The only
 * layout read is one getBoundingClientRect per pointerENTER (cached for
 * the ride; a scroll under a resting hover only means the next entry
 * re-measures). pointermove does arithmetic + two quickTo calls.
 * Measured under 4× CPU throttle in docs/design-lab/probe-textmicro.mjs.
 */

"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { useLenis } from "@/components/layout/SmoothScroll";
import { useTier } from "@/components/world/governor";

/** Max plate rotation about the horizontal axis (cursor north/south).
 *  Degrees — letterpress pressure, not a holo-card. Tuned against the
 *  shots-textmicro captures: 1.7/1.25 was near-invisible on a plate
 *  this wide; 2.2/1.6 is felt in the ride and still reads as pressure
 *  (edge depth ≈ ±15px at the 900px perspective, ~1.7% scale). */
const MAX_ROTATE_X = 2.2;
/** Max plate rotation about the vertical axis (cursor east/west). */
const MAX_ROTATE_Y = 1.6;
/** The press itself: the plate sits a hair deeper under the hand. */
const PRESS_SCALE = 0.9965;
/** Follow lag — the plate has mass; it settles behind the pointer. */
const FOLLOW_S = 0.4;

/**
 * Null-rendering pointer choreographer. Mount once inside StoryShell,
 * beside TextMotion.
 *
 * @returns null — the tilt is applied to the server-rendered markup
 */
export function TextGarnish() {
  const lenis = useLenis();
  const { tier } = useTier();

  useEffect(() => {
    if (!lenis || tier !== "full") return;
    /* The rail's own media gate, mirrored for the JS half: no hovering
       fine pointer, no tilt — a capable touch laptop never mounts
       listeners it can only mis-fire. */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const regions = Array.from(
      document.querySelectorAll<HTMLElement>('[data-tier-garnish="tilt"]')
    );
    const cleanups = regions.map((region) => {
      const plate = region.querySelector<HTMLElement>("[data-garnish-plate]");
      if (!plate) return () => {};

      const rotateX = gsap.quickTo(plate, "rotationX", {
        duration: FOLLOW_S,
        ease: "power2.out",
      });
      const rotateY = gsap.quickTo(plate, "rotationY", {
        duration: FOLLOW_S,
        ease: "power2.out",
      });
      const scale = gsap.quickTo(plate, "scale", {
        duration: FOLLOW_S,
        ease: "power2.out",
      });

      /* One layout read per entry, cached for the whole ride (D4). */
      let rect: DOMRect | null = null;

      const follow = (event: PointerEvent) => {
        rect ??= region.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        /* Normalized pointer seat in the plate, -1…1 each axis. */
        const nx = Math.min(
          1,
          Math.max(-1, ((event.clientX - rect.left) / rect.width) * 2 - 1)
        );
        const ny = Math.min(
          1,
          Math.max(-1, ((event.clientY - rect.top) / rect.height) * 2 - 1)
        );
        /* The edge under the cursor presses AWAY (into the paper):
           pointer north → top recedes (positive rotateX); pointer east
           → right edge recedes (positive rotateY). */
        rotateX(-ny * MAX_ROTATE_X);
        rotateY(nx * MAX_ROTATE_Y);
      };
      const enter = (event: PointerEvent) => {
        rect = region.getBoundingClientRect();
        scale(PRESS_SCALE);
        follow(event);
      };
      const leave = () => {
        rect = null;
        rotateX(0);
        rotateY(0);
        scale(1);
      };

      region.addEventListener("pointerenter", enter);
      region.addEventListener("pointermove", follow, { passive: true });
      region.addEventListener("pointerleave", leave);
      return () => {
        region.removeEventListener("pointerenter", enter);
        region.removeEventListener("pointermove", follow);
        region.removeEventListener("pointerleave", leave);
        gsap.killTweensOf(plate);
        /* Transform-only, so clearing costs zero CLS (§F3: downshift
           un-mounts garnish with no layout shift). */
        gsap.set(plate, { clearProps: "transform" });
      };
    });

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [lenis, tier]);

  return null;
}
