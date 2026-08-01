/**
 * @fileoverview The cargo — what each station sends down the line.
 *
 * Ported from the prototype's TRAV table and its travel maths. This is
 * the half of the rail that makes it a RUN rather than a drawn line: at
 * every station something is produced, and that something rides the
 * corridor to the next station carrying a label saying what it is and
 * where it is going. "sorted mail → manifest". "one valid gzip member →
 * manifest". "the held marks, carried as they are."
 *
 * The convoy is strung along the corridor rather than glued to the
 * token: the lead departs as the station's plate is still closing
 * overhead and is still fading in as the next station arrives, with the
 * rest trailing at reading distance. The prototype's own comment gives
 * the reason and it is a good one — ANY corridor the reader stops in has
 * cargo in frame, instead of a bare line between two busy places.
 *
 * Every item is drawn in the rail's own local frame: translated to the
 * point, ROTATED to face along the path, and alpha-faded at both ends of
 * its run. Because its progress derives from the token's document
 * position, scrolling back sends the cargo back up the line — the same
 * reason everything else here reverses, which is that nothing holds
 * state.
 */

import type { RailSample } from "./railGeometry";
import { lenAtY, pointAtLen } from "./railGeometry";

export interface Traveller {
  /** Beat index this cargo departs from. */
  beat: number;
  /** How many copies ride in convoy. */
  n: number;
  /** Extra spacing offset for a second item leaving the same station. */
  off?: number;
  /**
   * The waybill — what is in transit, and to where. Null draws no text.
   *
   * A FUNCTION when the cargo depends on what the reader has done. Only
   * one item needs this and it is the best one on the line: the digit
   * you drew at the Glyph station rides on as freight, so the waybill
   * has to be able to say `your "7", read locally → manifest`.
   */
  label: string | null | (() => string);
  /** Draw in the rail's local frame: origin at the point, +x along it. */
  draw: (c: CanvasRenderingContext2D, ink: RailInk) => void;
}

/**
 * What the visitor drew at the Glyph station, if anything.
 *
 * Module scope on purpose — the digit is a property of the page, like
 * the one scroll loop and the one rail, and the canvas painter reads it
 * without a React round trip. `null` means the pad is still blank, which
 * the waybill says out loud rather than hiding.
 */
let glyphDigit: string | null = null;

/** Called by the Glyph station when its network reads a drawn digit. */
export function setGlyphDigit(d: string | null): void {
  glyphDigit = d;
}

export function getGlyphDigit(): string | null {
  return glyphDigit;
}

export interface RailInk {
  ink: string;
  plate: string;
  clay: string;
  muted: string;
}

/* ── The drawn cargo ────────────────────────────────────────────────
   Each is a few strokes at ~22×14, sized to read at a glance without
   competing with the type it passes. The prototype's own shapes. */

const slip = (c: CanvasRenderingContext2D, k: RailInk) => {
  c.fillStyle = k.plate;
  c.strokeStyle = k.ink;
  c.lineWidth = 1.2;
  c.beginPath();
  c.roundRect(-11, -7, 22, 14, 2);
  c.fill();
  c.stroke();
  c.beginPath();
  c.moveTo(-7, -2.5);
  c.lineTo(4, -2.5);
  c.moveTo(-7, 2);
  c.lineTo(1, 2);
  c.stroke();
  c.strokeStyle = k.clay;
  c.beginPath();
  c.arc(7, 2, 2.4, 0, 7);
  c.stroke();
};

const firstLight = (c: CanvasRenderingContext2D, k: RailInk) => {
  c.strokeStyle = k.clay;
  c.lineWidth = 1.3;
  c.beginPath();
  c.arc(0, 1, 5, Math.PI, 2 * Math.PI);
  c.stroke();
  c.beginPath();
  c.moveTo(-10, 1);
  c.lineTo(10, 1);
  c.stroke();
  for (const a of [-2.2, -1.57, -0.94]) {
    c.beginPath();
    c.moveTo(Math.cos(a) * 7, 1 + Math.sin(a) * 7);
    c.lineTo(Math.cos(a) * 10, 1 + Math.sin(a) * 10);
    c.stroke();
  }
};

const card = (c: CanvasRenderingContext2D, k: RailInk) => {
  c.fillStyle = k.plate;
  c.strokeStyle = k.ink;
  c.lineWidth = 1.2;
  c.beginPath();
  c.roundRect(-10, -7, 20, 14, 2);
  c.fill();
  c.stroke();
  c.beginPath();
  c.arc(-4, -1.5, 2.6, 0, 7);
  c.stroke();
  c.beginPath();
  c.moveTo(1, -3);
  c.lineTo(7, -3);
  c.moveTo(1, 0.5);
  c.lineTo(7, 0.5);
  c.stroke();
  c.strokeStyle = k.clay;
  c.beginPath();
  c.moveTo(-7, 4.5);
  c.lineTo(7, 4.5);
  c.stroke();
};

const crate = (c: CanvasRenderingContext2D, k: RailInk) => {
  c.fillStyle = k.plate;
  c.strokeStyle = k.ink;
  c.lineWidth = 1.2;
  c.beginPath();
  c.roundRect(-9, -6.5, 18, 13, 1.5);
  c.fill();
  c.stroke();
  c.beginPath();
  c.moveTo(-9, -1.5);
  c.lineTo(9, -1.5);
  c.moveTo(0, -6.5);
  c.lineTo(0, 6.5);
  c.stroke();
};

const envelope = (c: CanvasRenderingContext2D, k: RailInk) => {
  c.fillStyle = k.plate;
  c.strokeStyle = k.ink;
  c.lineWidth = 1.2;
  c.beginPath();
  c.roundRect(-10, -6.5, 20, 13, 1.5);
  c.fill();
  c.stroke();
  c.beginPath();
  c.moveTo(-10, -6.5);
  c.lineTo(0, 1);
  c.lineTo(10, -6.5);
  c.stroke();
};

const spool = (c: CanvasRenderingContext2D, k: RailInk) => {
  c.strokeStyle = k.ink;
  c.lineWidth = 1.2;
  c.beginPath();
  c.arc(0, 0, 6.5, 0, 7);
  c.stroke();
  c.beginPath();
  c.arc(0, 0, 2.2, 0, 7);
  c.stroke();
  c.strokeStyle = k.muted;
  c.beginPath();
  c.moveTo(-10, 0);
  c.lineTo(-6.5, 0);
  c.moveTo(6.5, 0);
  c.lineTo(10, 0);
  c.stroke();
};

const heldMark = (c: CanvasRenderingContext2D, k: RailInk) => {
  /* dashed, because a held claim is not yet earned — the same grammar
     the HELD stamp uses on the case files. */
  c.strokeStyle = k.clay;
  c.lineWidth = 1.3;
  c.setLineDash([3, 3]);
  c.beginPath();
  c.roundRect(-9, -6, 18, 12, 2);
  c.stroke();
  c.setLineDash([]);
};

const drawnDigit = (c: CanvasRenderingContext2D, k: RailInk) => {
  if (glyphDigit !== null) {
    /* the sample, boxed as the 28x28 it actually is */
    c.strokeStyle = k.muted;
    c.lineWidth = 1;
    c.strokeRect(-9, -9, 18, 18);
    c.fillStyle = k.ink;
    c.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(glyphDigit, 0, 1);
  } else {
    /* awaiting a sample — dashed, because nothing has been produced yet */
    c.strokeStyle = k.muted;
    c.lineWidth = 1;
    c.setLineDash([3, 3]);
    c.strokeRect(-8, -8, 16, 16);
    c.setLineDash([]);
  }
};

const report = (c: CanvasRenderingContext2D, k: RailInk) => {
  c.fillStyle = k.plate;
  c.strokeStyle = k.ink;
  c.lineWidth = 1.2;
  c.beginPath();
  c.roundRect(-9, -7.5, 18, 15, 2);
  c.fill();
  c.stroke();
  c.beginPath();
  for (let i = 0; i < 3; i++) {
    c.moveTo(-5.5, -3.5 + i * 3.5);
    c.lineTo(5.5, -3.5 + i * 3.5);
  }
  c.stroke();
};

/**
 * What each station sends on.
 *
 * The labels are the story of the run, and every one of them mirrors a
 * claim the page already prints — never a new assertion invented for the
 * rail (D6: the visual states what the page states, or it states nothing).
 * Beat 5 carries the digit the reader drew at the Glyph station — the
 * one cargo whose waybill is a function, because until a hand has drawn
 * something the honest label is that nothing has been produced yet.
 */
export const TRAVELLERS: Traveller[] = [
  { beat: 0, n: 1, label: "run dispatched — operator aboard", draw: slip },
  { beat: 0, n: 1, off: 0.3, label: null, draw: firstLight },
  { beat: 1, n: 1, label: "the engineer’s credentials → manifest", draw: card },
  {
    beat: 2,
    n: 2,
    label: "five years of logs, given shape → the line",
    draw: crate,
  },
  { beat: 3, n: 3, label: "sorted mail → manifest", draw: envelope },
  { beat: 4, n: 1, label: "the committed plan → manifest", draw: card },
  {
    beat: 5,
    n: 1,
    label: () =>
      glyphDigit !== null
        ? `your “${glyphDigit}”, read locally → manifest`
        : "a blank 28×28 — the run wants your hand",
    draw: drawnDigit,
  },
  { beat: 6, n: 2, label: "one valid gzip member → manifest", draw: spool },
  {
    beat: 7,
    n: 2,
    label: "the held marks, carried as they are",
    draw: heldMark,
  },
  { beat: 8, n: 1, label: "the report → the review", draw: report },
  { beat: 9, n: 1, label: "reviewed → the human gate", draw: report },
];

export interface DrawTravellersArgs {
  ctx: CanvasRenderingContext2D;
  samples: RailSample[];
  beats: { top: number; h: number }[];
  /** Document-space y of the token (the reading line). */
  tokenY: number;
  scroll: number;
  vh: number;
  ink: RailInk;
  /** Waybill text is desktop-only: on a stacked seat the rail crosses the
   *  prose and canvas text under DOM text prints through it. */
  showLabels: boolean;
}

/** Ride every station's cargo down its corridor. */
export function drawTravellers({
  ctx,
  samples,
  beats,
  tokenY,
  scroll,
  vh,
  ink,
  showLabels,
}: DrawTravellersArgs): void {
  if (!samples.length || !beats.length) return;

  for (const t of TRAVELLERS) {
    const b = beats[t.beat];
    if (!b) continue;
    /* Cargo leaves WHILE the station's plate is still closing overhead,
       so the corridor that follows always has the departure in frame. */
    const exitY = b.top + b.h * 0.74;
    const nb = beats[Math.min(t.beat + 1, beats.length - 1)];
    const span = nb.top + nb.h * 0.4 - exitY;
    if (span <= 0) continue;

    const tp = (tokenY - exitY) / span;
    if (tp <= 0) continue;

    for (let j = 0; j < t.n; j++) {
      const prog = 0.1 + tp * 0.78 - (j + (t.off ?? 0)) * 0.26;
      if (prog <= 0 || prog >= 1) continue;

      const L = lenAtY(samples, exitY + prog * span);
      const pt = pointAtLen(samples, L);
      const ahead = pointAtLen(samples, L + 8);
      const y = pt.y - scroll;
      if (y < -30 || y > vh + 30) continue;

      /* fade in over the first 12% of the corridor, out over the last 15 */
      const alpha =
        prog < 0.12 ? prog / 0.12 : prog > 0.85 ? (1 - prog) / 0.15 : 1;

      ctx.save();
      ctx.translate(pt.x, y);
      ctx.rotate(Math.atan2(ahead.y - pt.y, ahead.x - pt.x));
      ctx.globalAlpha = alpha;
      t.draw(ctx, ink);
      ctx.restore();

      /* The waybill rides the LEAD item only: what is in transit, and to
         where. One line per corridor — the convoy behind it is the same
         cargo, and labelling each would be noise. */
      if (showLabels && j === 0 && t.label) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = ink.muted;
        ctx.font =
          '11px ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace';
        ctx.textBaseline = "middle";
        const text = typeof t.label === "function" ? t.label() : t.label;
        ctx.fillText(text, pt.x + 18, y);
        ctx.restore();
      }
    }
  }
}
