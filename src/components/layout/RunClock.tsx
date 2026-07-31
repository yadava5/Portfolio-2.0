/**
 * @fileoverview RunClock — the running head's advancing dateline
 * (round 12, Stage C).
 *
 * The prototype's masthead clock, rebuilt on production's day arc: the
 * paper's FIXED workday record (the ¶ kicker datelines, 06:12 → 22:41)
 * interpolated minute by minute as the reading line travels each
 * chapter — the clock advances with the token, because both ride the
 * same line (RAIL_HEAD_VH). It is the run's own record, never the
 * reader's time; the `run 041 ·` prefix DayMark seats it behind is
 * what names the fiction (see DayMark for the F28/F30 override note).
 *
 * Mechanics:
 *   - Motion world only for the tween: rides `gsap.ticker` behind a
 *     scroll-dirty flag (one loop, zero idle work — the rail's own
 *     discipline), writes `textContent` ONLY when the displayed
 *     minute changes (the prototype's "no idle layout" rule).
 *   - Chapter tops are measured on demand and re-measured on resize /
 *     `paper:layout-settled` / fonts-ready, coalesced to one rAF.
 *   - Static worlds render the active chapter's own dateline as plain
 *     text — the kicker record, stepped at crossings, zero machinery
 *     (A7: state, not motion).
 */

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLenis } from "@/components/layout/SmoothScroll";
import { LAYOUT_SETTLED_EVENT } from "@/components/story/arrival";
import {
  CHAPTERS,
  clockMinutes,
  minutesClock,
} from "@/components/story/chapters";
import type { ChapterMeta } from "@/components/story/chapters";
import { RAIL_HEAD_VH } from "@/components/thread/constants";

/** One chapter's scroll band + its minute span. */
interface ClockBand {
  top: number;
  height: number;
  /** Dateline at the chapter's head */
  m0: number;
  /** Dateline at the next chapter's head (the tween target) */
  m1: number;
}

/** Props for the running head's clock */
interface RunClockProps {
  /** The active chapter (the static worlds' stepped fallback) */
  chapter: ChapterMeta;
}

/**
 * The advancing dateline. Renders the active chapter's clock; the
 * motion world overwrites it minute by minute against scroll.
 *
 * @param props - Component props
 * @returns The clock text span
 */
export function RunClock({ chapter }: RunClockProps) {
  const lenis = useLenis();
  const ref = useRef<HTMLSpanElement>(null);

  /* Keyed on the chapter too: a crossing re-renders the span with the
     chapter's own dateline (React owns the child text), and whether
     the ticker's interpolated rewrite lands before or after that
     re-render is a race that read differently by scroll DIRECTION
     (measured: down showed 19:36, up 19:52, same y). Re-running the
     effect on every crossing starts `shown` empty and `dirty` true, so
     the next ticker frame — GSAP's keep-alive guarantees one — always
     re-asserts the interpolated truth over React's reset. */
  useEffect(() => {
    const el = ref.current;
    if (!lenis || !el) return;

    let disposed = false;
    let queued = 0;
    let dirty = true;
    let bands: ClockBand[] = [];
    let shown = "";

    const measure = () => {
      if (disposed) return;
      const minutes = CHAPTERS.map((c) => clockMinutes(c.clock));
      bands = [];
      for (let i = 0; i < CHAPTERS.length; i++) {
        const section = document.querySelector<HTMLElement>(
          `section[data-chapter="${CHAPTERS[i].id}"]`
        );
        if (!section) {
          bands = [];
          return; /* not the story surface */
        }
        const rect = section.getBoundingClientRect();
        bands.push({
          top: rect.top + window.scrollY,
          height: rect.height,
          m0: minutes[i],
          /* The last chapter holds its own dateline — nightfall is the
             record's end, not a tween toward anything */
          m1: minutes[Math.min(i + 1, minutes.length - 1)],
        });
      }
      dirty = true;
    };

    const schedule = () => {
      if (disposed || queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        measure();
      });
    };

    const onTick = () => {
      if (!dirty || disposed || !bands.length) return;
      dirty = false;
      const readLine =
        window.scrollY + document.documentElement.clientHeight * RAIL_HEAD_VH;
      /* The band under the reading line (the last one it has entered) */
      let band = bands[0];
      for (const candidate of bands) {
        if (readLine >= candidate.top) band = candidate;
        else break;
      }
      const p = Math.min(
        1,
        Math.max(0, (readLine - band.top) / Math.max(1, band.height))
      );
      const next = minutesClock(band.m0 + (band.m1 - band.m0) * p);
      /* Write only on minute change — no idle layout, no per-frame DOM */
      if (next !== shown) {
        shown = next;
        el.textContent = next;
      }
    };
    const markDirty = () => {
      dirty = true;
    };

    measure();
    gsap.ticker.add(onTick);
    window.addEventListener("scroll", markDirty, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener(LAYOUT_SETTLED_EVENT, schedule);
    document.fonts?.ready.then(schedule);

    return () => {
      disposed = true;
      if (queued) cancelAnimationFrame(queued);
      gsap.ticker.remove(onTick);
      window.removeEventListener("scroll", markDirty);
      window.removeEventListener("resize", schedule);
      window.removeEventListener(LAYOUT_SETTLED_EVENT, schedule);
    };
  }, [lenis, chapter.id]);

  /* The chapter's own dateline is the truthful frame everywhere the
     tween is absent — and the tween's own starting frame. */
  return (
    <span ref={ref} data-run-clock="">
      {chapter.clock}
    </span>
  );
}
