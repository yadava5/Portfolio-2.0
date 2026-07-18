/**
 * @fileoverview "Run the audit" — the receipts walk themselves.
 *
 * Friend transposition #3 (FRIEND-PORTFOLIO-TRANSPOSITIONS (c)[3]) merged
 * with DOSSIER's stampable-registry elevation: his "run a sample" reads a
 * digit; ours checks its own evidence. One quiet mono control at the
 * validation table's head walks every receipt row top to bottom (~350ms
 * cadence — a deliberate auditor's pace, not a cascade), marking each row
 * with the auditor's stamp-rust pen: a tick where a pinned/checked-in
 * artifact resolves, a hollow ring where the trail ends in an on-page
 * poster/deck capture (W5 — a photo of evidence never ticks like a
 * repo-pinned JSON), an honest ink dash on described-only and HELD rows.
 * On the automl file only, the walk ends with a single 300ms underline
 * draw on the un-approved 041 registry row — pointing the reader to the
 * act that remains theirs. NEVER auto-approving: run 041 stays the
 * visitor's own signature.
 *
 * THE PAYOFF TRANSFORMS IN PLACE (W5, visitor #1): on settle — and on
 * every dried revisit — the control itself becomes the settled ledger
 * line at the table head ("audit walked · N of M terminate in pinned
 * artifacts · … · date", every count derived from the real rows via
 * auditSettledSentence, the date from paperMemory). The button never
 * unmounts (mid-walk keyboard focus survives); its two faces are
 * stacked in one grid cell, with the settled face acting as an
 * invisible ghost before the walk so the swap — including the dried
 * post-hydration swap — moves nothing (zero layout shift). There is no
 * separate below-the-tables settled line anymore.
 *
 * State: persisted per case file (paperMemory "paper-memory:v1:audits").
 * Walked is walked — revisits show dried ticks and the ORIGINAL walk
 * date, no re-walk, no re-run affordance.
 *
 * Worlds (amendment A7): activation works everywhere. Static worlds
 * (reduced-motion / quiet toggle) apply every tick instantly — the same
 * settled line, zero performance. The walk cadence is plain timers (no
 * rAF loop, no engine dependency); while walking in the desktop engine
 * world, each citing row asks CitationInk (reused, never duplicated) to
 * draw its pen stroke to the cited plate.
 *
 * Keyboard + SR: the control is a real <button> (Enter/Space native)
 * with aria-describedby explaining the act; every tick is aria-hidden
 * decoration; the settled result is announced once, politely, via a
 * separate role="status" node that only ever receives text at the
 * moment of a fresh walk — dried revisits announce nothing.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIT_CITE_EVENT } from "@/components/paper/CitationInk";
import {
  ReceiptAuditCounts,
  auditSettledSentence,
} from "@/lib/data/projectCaseStudies";
import {
  PaperDate,
  readFileAudits,
  recordFileAudit,
  subscribePaperMemory,
} from "@/lib/paperMemory";

/** Milliseconds between row ticks — the walk's deliberate cadence */
const TICK_CADENCE_MS = 350;

/** Extra beat after the last tick before the line settles */
const SETTLE_LAG_MS = 150;

/** How long the 041 nudge holds before the underline retracts */
const NUDGE_HOLD_MS = 1000;

/** Widest date the mono voice can print ("mmm 00, 0000" shape) — the
 *  ghost face reserves with this before a real walk date exists, so the
 *  settled swap can never grow the line. */
const GHOST_DATE = "mmm 00, 0000";

/** The walked-audit record for this file, read fresh from the store */
function storedAudit(projectId: string): PaperDate | null {
  return readFileAudits()[projectId] ?? null;
}

/** Every receipt row of this page's [ validation ] section, in order */
function auditRows(): HTMLElement[] {
  const section = document.getElementById("validation");
  if (!section) return [];
  return Array.from(
    section.querySelectorAll<HTMLElement>("[data-receipt-row]")
  );
}

/**
 * Apply the walked state without performance: every mark present, all
 * transitions killed via the section's dried attribute (set in the same
 * synchronous task, so no fade ever fires).
 */
function applyDriedTicks(): void {
  const section = document.getElementById("validation");
  if (!section) return;
  section.setAttribute("data-audit-dried", "");
  for (const row of auditRows()) {
    row.setAttribute("data-audit-ticked", "");
  }
}

/** Ask CitationInk (engine world only) to draw toward a row's plate */
function dispatchCite(rowId: string | null): void {
  window.dispatchEvent(
    new CustomEvent(AUDIT_CITE_EVENT, { detail: { rowId } })
  );
}

interface AuditControlProps {
  /** This case file's project id ("automl", "jobtracker", …) */
  projectId: string;
  /** Per-state tallies computed from the REAL rows (never hardcoded) */
  counts: ReceiptAuditCounts;
  /** True on the automl file: nudge the un-approved 041 row at the end */
  nudgeRegistry?: boolean;
}

/** The settled face's client state: the walk date + how it arrived */
interface SettledState {
  label: string;
  /** True when the walk was already on record at mount (dried ink) */
  dried: boolean;
}

/**
 * The one control at the validation table's head. Owns the walk:
 * applies row ticks (cadenced or instant per world), records the act,
 * announces the settled result once — then IS the settled ledger line.
 *
 * @param props - File id, real-row tallies, and the automl nudge flag
 * @returns The control + its sr-only description and status node
 */
export function AuditControl({
  projectId,
  counts,
  nudgeRegistry = false,
}: AuditControlProps) {
  const [settled, setSettled] = useState<SettledState | null>(null);
  const [announce, setAnnounce] = useState("");
  const walkedRef = useRef(false);
  const walkingRef = useRef(false);
  const selfActRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const descId = `audit-run-desc-${projectId}`;
  const sentence = auditSettledSentence(counts);
  const walked = settled !== null;

  /* Restore the dried walk + follow cross-tab acts. Direct storage reads
     (the FileMemory pattern) so a stored walk is unambiguously dried. */
  useEffect(() => {
    const sync = () => {
      const stored = storedAudit(projectId);
      if (!stored) return;
      if (!walkedRef.current) {
        walkedRef.current = true;
        /* A cross-tab (or stored) walk arrives without this document's
           own performance — dried ink, never a replay. */
        if (!selfActRef.current) applyDriedTicks();
        setSettled((prev) => prev ?? { label: stored.label, dried: true });
      }
    };
    sync();
    return subscribePaperMemory(sync);
  }, [projectId]);

  /* Clear a mid-walk teardown (navigation away): timers die with us */
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  /** The end of the walk: record, settle, announce, nudge (engine only) */
  const finish = useCallback(
    (instant: boolean) => {
      const { date } = recordFileAudit(projectId);
      walkedRef.current = true;
      setSettled((prev) => prev ?? { label: date.label, dried: false });
      setAnnounce(`${sentence} · ${date.label}`);
      /* The act that remains the reader's: one 300ms underline draw on
         the awaiting 041 row (automl only), never an approval. Static
         worlds skip the gesture — their transitions are none. */
      if (nudgeRegistry && !instant) {
        const row = document.querySelector<HTMLElement>(
          "[data-registry-approve]:not([data-approved])"
        );
        if (row) {
          row.classList.add("audit-nudge");
          timersRef.current.push(
            window.setTimeout(
              () => row.classList.remove("audit-nudge"),
              NUDGE_HOLD_MS
            )
          );
        }
      }
    },
    [projectId, sentence, nudgeRegistry]
  );

  /** Activation: walk the receipts (cadenced), or apply instantly (A7) */
  const walk = useCallback(() => {
    if (walkedRef.current || walkingRef.current) return;
    selfActRef.current = true;
    const rows = auditRows();
    const instant =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.hasAttribute("data-motion-off");

    if (instant || rows.length === 0) {
      for (const row of rows) row.setAttribute("data-audit-ticked", "");
      finish(true);
      return;
    }

    walkingRef.current = true;
    rows.forEach((row, index) => {
      timersRef.current.push(
        window.setTimeout(() => {
          row.setAttribute("data-audit-ticked", "");
          dispatchCite(row.id || null);
        }, index * TICK_CADENCE_MS)
      );
    });
    timersRef.current.push(
      window.setTimeout(
        () => {
          dispatchCite(null);
          walkingRef.current = false;
          finish(false);
        },
        rows.length * TICK_CADENCE_MS + SETTLE_LAG_MS
      )
    );
  }, [finish]);

  return (
    <span className="inline-flex max-w-full items-baseline">
      <button
        type="button"
        data-audit-run
        data-walked={walked ? "" : undefined}
        aria-disabled={walked || undefined}
        aria-describedby={descId}
        onClick={walked ? undefined : walk}
        className="audit-run label-mono text-ink max-w-full border-0 bg-transparent p-0 text-left md:text-right"
      >
        {/* Two faces, one grid cell: the resting act and the settled
            ledger line occupy the same box, so the transform-in-place
            (fresh OR dried) moves nothing below it. The inactive face
            is invisible AND aria-hidden — one voice at a time. */}
        <span className="grid max-w-full">
          <span
            aria-hidden={walked ? "true" : undefined}
            className={`col-start-1 row-start-1 ${walked ? "invisible" : ""}`}
          >
            <span className={walked ? "" : "link-draw"}>run the audit ⟶</span>
          </span>
          <span
            aria-hidden={walked ? undefined : "true"}
            data-audit-settled={walked ? "" : undefined}
            className={`audit-settled col-start-1 row-start-1 ${
              settled?.dried ? "is-dried" : ""
            }`}
          >
            {sentence} · {settled ? settled.label : GHOST_DATE}
          </span>
        </span>
      </button>
      <span id={descId} className="sr-only">
        walks the receipts below, top to bottom, and marks each row this page
        can verify: a check where a pinned artifact resolves, a ring where the
        trail ends in an on-page capture, a dash where a claim is described only
        or held. walked once, the result settles here and stays.
      </span>
      {/* Announced once, politely, at the moment of a fresh walk —
          dried revisits never speak. */}
      <span role="status" className="sr-only">
        {announce}
      </span>
    </span>
  );
}
