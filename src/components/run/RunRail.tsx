/**
 * @fileoverview The rail — one line from the name to the gate, painted.
 *
 * Ported from the prototype's drawThread / drawTokenAndTravellers. Three
 * things it does that production's rail did not:
 *
 *   1. It CROSSES THE PAGE. The path alternates side to side between
 *      stations (railGeometry). Production drew a straight line at one x
 *      in the left gutter — continuous, scroll-coupled, reversible, and
 *      still a margin rule rather than a route.
 *   2. The ink is SPLIT AT THE TOKEN. Solid behind, dashed ahead. The
 *      reader can see how far the run has come and that it continues.
 *   3. Everything is a function of `scrollY`. The token's arc length
 *      comes from the reading line's document position, so scrolling up
 *      un-draws the ink and walks the token backwards — not by a reverse
 *      path, but because there is no state to rewind.
 *
 * The canvas is fixed and viewport-sized; the path lives in document
 * space and the painter subtracts scroll. That split is the whole reason
 * one line can span a 14,000px document — the seven welded per-section
 * SVG segments this replaces each lived in their own section's
 * coordinates, which is why they could never flow.
 */

"use client";

import { useEffect, useRef } from "react";
import { READING_LINE, createRunLoop } from "./fxEngine";
import {
  buildRail,
  idxAtY,
  lenAtY,
  pointAtLen,
  type RailSample,
} from "./railGeometry";
import { drawTravellers } from "./railTravellers";

/** Read a CSS custom property off <html>, with a fallback. */
function ink(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

export interface RunRailProps {
  /** Selector for the beat sections, in document order. */
  beatSelector?: string;
  /** Optional element the line must terminate on (the gate's dock). */
  gateSelector?: string;
}

export function RunRail({
  beatSelector = "[data-beat]",
  gateSelector = "[data-gate-dock]",
}: RunRailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    /* A7 — the static worlds paint the settled page from markup and CSS;
       the rail is the motion world's and must not mount there. */
    const html = document.documentElement;
    if (html.dataset.tier === "print" || html.dataset.motionOff === "1") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let samples: RailSample[] = [];
    let boxes: { top: number; h: number }[] = [];

    let vw = 0;
    let vh = 0;
    let dpr = 1;
    const colors = {
      thread: ink("--thread", "#b4462a"),
      ahead: ink("--thread-ahead", "#c9b8a4"),
      dot: ink("--color-ink", "#26231c"),
      cargo: {
        ink: ink("--color-ink", "#26231c"),
        plate: ink("--plate-solid", "#fbf7ef"),
        clay: ink("--color-clay", "#b4462a"),
        muted: ink("--color-ink-secondary", "#6b6558"),
      },
    };

    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const beats = [...document.querySelectorAll<HTMLElement>(beatSelector)];
      if (!beats.length) {
        samples = [];
        return;
      }
      boxes = beats.map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, h: r.height };
      });
      const dock = document.querySelector<HTMLElement>(gateSelector);
      const gateAnchor = dock
        ? (() => {
            const r = dock.getBoundingClientRect();
            return {
              x: r.left + r.width / 2,
              y: r.top + window.scrollY + r.height / 2,
            };
          })()
        : undefined;
      const built = buildRail(boxes, vw, vw < 1024, gateAnchor);
      samples = built.samples;
    };

    /** Stroke the run [i0..i1] in viewport space, optionally clipped. */
    const strokeRun = (i0: number, i1: number, scroll: number) => {
      ctx.beginPath();
      let started = false;
      for (let i = i0; i <= i1; i++) {
        const s = samples[i];
        if (!started) {
          ctx.moveTo(s.x, s.y - scroll);
          started = true;
        } else {
          ctx.lineTo(s.x, s.y - scroll);
        }
      }
      if (started) ctx.stroke();
    };

    const paint = (scroll: number) => {
      ctx.clearRect(0, 0, vw, vh);
      if (!samples.length) return;

      /* The token sits where the reading line is — the same 0.62·vh the
         beat clock uses, so the ink's head and the reader's eye agree. */
      const tokenL = lenAtY(samples, scroll + vh * READING_LINE);
      const tp = pointAtLen(samples, tokenL);

      const i0 = Math.max(0, idxAtY(samples, scroll - 40) - 1);
      const i1 = Math.min(
        samples.length - 1,
        idxAtY(samples, scroll + vh + 40) + 1
      );
      if (i1 > i0) {
        /* where the token falls inside the visible run */
        let k = i0;
        while (k < i1 && samples[k].L < tokenL) k++;

        /* the future: dashed and faint, pattern anchored in path space so
           it does not crawl as the page scrolls */
        if (samples[i1].L > tokenL) {
          ctx.strokeStyle = colors.ahead;
          ctx.lineWidth = 1.4;
          ctx.setLineDash([2, 7]);
          ctx.lineDashOffset = -(samples[k]?.L ?? 0) % 9;
          strokeRun(k, i1, scroll);
          ctx.setLineDash([]);
        }
        /* the ink already laid down, behind the token */
        if (samples[i0].L < tokenL) {
          ctx.strokeStyle = colors.thread;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          strokeRun(i0, Math.max(i0, k - 1), scroll);
        }
      }

      /* the token itself */
      const ty = tp.y - scroll;
      if (ty > -30 && ty < vh + 30) {
        ctx.fillStyle = colors.dot;
        ctx.beginPath();
        ctx.arc(tp.x, ty, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      /* The cargo. This is what makes the line a RUN and not a drawn
         rule: every station produces something and it rides the corridor
         to the next one carrying a label saying what it is. Drawn after
         the token so a departing item passes in front of it. */
      drawTravellers({
        ctx,
        samples,
        beats: boxes,
        tokenY: scroll + vh * READING_LINE,
        scroll,
        vh,
        ink: colors.cargo,
        showLabels: vw >= 1024,
      });
    };

    const loop = createRunLoop((y) => paint(y));

    measure();
    paint(window.scrollY);
    loop.wake(true);

    const onScroll = () => loop.wake();
    let resizeT: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        measure();
        paint(window.scrollY);
        loop.wake(true);
      }, 120);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    /* The pin spacer and web fonts both move every beat box. */
    window.addEventListener("paper:layout-settled", onResize as EventListener);

    return () => {
      loop.stop();
      window.clearTimeout(resizeT);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener(
        "paper:layout-settled",
        onResize as EventListener
      );
      ctx.clearRect(0, 0, vw, vh);
    };
  }, [beatSelector, gateSelector]);

  return (
    <canvas
      ref={canvasRef}
      className="run-rail"
      aria-hidden="true"
      /* Behind the type, never in the way of a pointer. `print:hidden`
         keeps A7's paper edition free of it — the static world draws its
         own settled line. */
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
