/**
 * @fileoverview RunManifest — the corner manifest: a ledger that fills
 * as the run travels (round 12, Stage C).
 *
 * The prototype's bottom-right aside (`run 042 — manifest 0 / 6`,
 * stamping a line per station as the token passes) rebuilt on
 * production's chapters and production's WORDS: every cargo line is a
 * string this page already prints — the footnote, a kicker label, the
 * ¶03 receipt, the ¶04 provenance strip, the ¶05 metric chip, the ¶06
 * litany receipt — so the manifest makes no claim the paper has not
 * already made and cited (brief D6: mirror, never invent). What it
 * adds is the RECORD: the reader accumulates where they have been,
 * which is the thing the GAP audit named third ("the corner manifest —
 * a ledger that fills as you go").
 *
 * Mechanics:
 *   - State, not motion: stamping keys off useActiveChapter's crossing
 *     signal (the ChapterRail contract — IntersectionObserver, no
 *     scroll listeners, nothing on the one loop). A chapter is stamped
 *     once the reading line has moved PAST it (its index < active).
 *   - Motion world: reversible — scroll back and stamps lift (the same
 *     both-ways law the rail obeys). Static worlds: banked — marks
 *     accumulate and never retreat, exactly like the ChapterRail's
 *     static marks (text-motion.spec's own contract).
 *   - xl+ only (the same width that affords the ChapterRail; below it
 *     the ¶ kickers and folios carry the record). Hidden in print with
 *     the other fixed chrome. aria-hidden with one sr-only summary —
 *     every line here is content the page already speaks properly.
 *   - At the gate the count resolves 6 / 6 beside the ledger it fed.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/layout/SmoothScroll";
import { CHAPTERS, RUN_NO } from "@/components/story/chapters";
import { useActiveChapter } from "@/hooks/useActiveChapter";

/** The cargo each chapter hands the manifest — VERBATIM strings from
 *  the chapter's own apparatus (see fileoverview; no new claims). */
const CARGO: { id: string; line: string }[] = [
  { id: "01", line: "every claim on this page links to its evidence" },
  { id: "02", line: "who — the short version" },
  {
    id: "03",
    line: "1M+ operational records — high-volume python + sql transforms",
  },
  { id: "04", line: "7 phases · every one gated · langgraph + mcp" },
  { id: "05", line: "macro-f1 0.98 — 96-sample gate" },
  { id: "06", line: "19/20 cited-source sweep — policybot ledger" },
];

/**
 * The corner manifest. Mount once on the story surface (StoryShell).
 *
 * @returns The fixed aside, or null off the story surface
 */
export function RunManifest() {
  const active = useActiveChapter(true);
  const lenis = useLenis();
  /* Static worlds bank their marks (never retreat) — the highest
     chapter index the reading line has reached this visit. The
     during-render adjustment is React's own documented pattern for
     derived state with history (no effect, no extra commit). */
  const [banked, setBanked] = useState(0);
  /* THE FOLD (the prototype's own corner discipline: "at a stop it
     folds to a pill so the work owns the corner"). Expanded, the slip
     can occlude the one thing the reader is reading — measured over
     fig 4.1's registry mid-pin and over the gate stamp itself. So the
     ledger EXPANDS for a beat when its count changes (a line stamps,
     or lifts on the way back) and folds to the head-only pill while a
     station is being read. Static worlds hold the pill: state, not
     time (A7) — their record is the count. */
  const [open, setOpen] = useState(false);
  const lastStamp = useRef<number | null>(null);

  const activeIndex = active
    ? CHAPTERS.findIndex((c) => c.id === active.id)
    : 0;
  if (!lenis && activeIndex > banked) setBanked(activeIndex);

  const stampedNow = Math.min(
    lenis ? activeIndex : Math.max(banked, activeIndex),
    CARGO.length
  );
  useEffect(() => {
    if (!lenis) return;
    if (lastStamp.current === null) {
      /* First sight (mount or deep-link landing) is not a stamping
         event — the corner starts folded. */
      lastStamp.current = stampedNow;
      return;
    }
    if (stampedNow === lastStamp.current) return;
    lastStamp.current = stampedNow;
    /* A stamping beat: show the ledger, then hand the corner back.
       Timer-based UI state is the AuditRun precedent; the fold is a
       display step at a discrete event, never a scrubbed motion. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
    const fold = setTimeout(() => setOpen(false), 2600);
    return () => clearTimeout(fold);
  }, [lenis, stampedNow]);

  if (!active) return null;

  const stamped = stampedNow;
  const landed = active.id === CHAPTERS[CHAPTERS.length - 1].id;

  return (
    <aside
      className="run-manifest"
      data-run-manifest
      data-open={open ? "" : undefined}
      data-landed={landed ? "" : undefined}
    >
      <span className="sr-only">
        {`run ${RUN_NO} manifest — ${stamped} of ${CARGO.length} stations passed`}
      </span>
      <div aria-hidden="true">
        <p className="run-manifest-head">
          run {RUN_NO} — manifest{" "}
          <span data-manifest-count>
            {stamped} / {CARGO.length}
          </span>
        </p>
        <ol className="run-manifest-lines">
          {CARGO.map((cargo, i) => (
            <li
              key={cargo.id}
              className="run-manifest-line"
              data-stamped={i < stamped ? "" : undefined}
            >
              <span className="run-manifest-no">{cargo.id}</span> {cargo.line}
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
