/**
 * @fileoverview "Run the audit" — the receipts walk themselves.
 *
 * Friend transposition #3 (FRIEND-PORTFOLIO-TRANSPOSITIONS (c)[3]) merged
 * with DOSSIER's stampable-registry elevation: his "run a sample" reads a
 * digit; ours checks its own evidence. One quiet mono control at the
 * validation table's head walks every receipt row top to bottom (~350ms
 * cadence — a deliberate auditor's pace, not a cascade): rows whose
 * artifact resolves (public link, checked-in file, on-page fig) gain a
 * small PINE tick beside their number; described-only and HELD rows get
 * an honest ink dash — the audit ticks only what it can verify. It ends
 * on a settled mono line ("audit walked · N of M receipts terminate in
 * artifacts · date", N/M computed from the real rows) and, on the automl
 * file only, a single 300ms underline draw on the un-approved 041
 * registry row — pointing the reader to the act that remains theirs.
 * NEVER auto-approving: run 041 stays the visitor's own signature.
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
 *
 * Zero layout shift: marks are absolutely positioned in the row-number
 * gutter (EvidenceTable renders them opacity-0 from SSR); the settled
 * line's height is reserved (`min-h`) like FileMemory's note.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIT_CITE_EVENT } from "@/components/paper/CitationInk";
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
  /** Rows whose artifact resolves (computed from the real rows) */
  verified: number;
  /** All rows the walk visits (receipts + outcomes) */
  total: number;
  /** True on the automl file: nudge the un-approved 041 row at the end */
  nudgeRegistry?: boolean;
}

/**
 * The quiet mono control at the validation table's head. Owns the walk:
 * applies row ticks (cadenced or instant per world), records the act,
 * and announces the settled result once.
 *
 * @param props - File id, real-row counts, and the automl nudge flag
 * @returns The control + its sr-only description and status node
 */
export function AuditControl({
  projectId,
  verified,
  total,
  nudgeRegistry = false,
}: AuditControlProps) {
  const [walked, setWalked] = useState(false);
  const [announce, setAnnounce] = useState("");
  const walkedRef = useRef(false);
  const walkingRef = useRef(false);
  const selfActRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const descId = `audit-run-desc-${projectId}`;

  /* Restore the dried walk + follow cross-tab acts. Direct storage reads
     (the FileMemory pattern) so a stored walk is unambiguously dried. */
  useEffect(() => {
    const sync = () => {
      if (!storedAudit(projectId)) return;
      if (!walkedRef.current) {
        walkedRef.current = true;
        /* A cross-tab (or stored) walk arrives without this document's
           own performance — dried ink, never a replay. */
        if (!selfActRef.current) applyDriedTicks();
        setWalked(true);
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
      setWalked(true);
      setAnnounce(
        `audit walked · ${verified} of ${total} receipts terminate in artifacts · ${date.label}`
      );
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
    [projectId, verified, total, nudgeRegistry]
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
    <span className="inline-flex items-baseline">
      <button
        type="button"
        data-audit-run
        data-walked={walked ? "" : undefined}
        aria-disabled={walked || undefined}
        aria-describedby={descId}
        onClick={walked ? undefined : walk}
        className="audit-run link-draw label-mono text-ink border-0 bg-transparent p-0 text-left"
      >
        run the audit ⟶
      </button>
      <span id={descId} className="sr-only">
        walks the receipts below, top to bottom, and marks each row this page
        can verify: a check where the artifact resolves, a dash where a claim is
        described only or held. walked once, the result stays.
      </span>
      {/* Announced once, politely, at the moment of a fresh walk —
          dried revisits never speak. */}
      <span role="status" className="sr-only">
        {announce}
      </span>
    </span>
  );
}

interface AuditSettledProps {
  /** This case file's project id */
  projectId: string;
  /** Rows whose artifact resolves (computed from the real rows) */
  verified: number;
  /** All rows the walk visits */
  total: number;
}

/** The settled line's client state: the walk date + how it arrived */
interface SettledState {
  label: string;
  /** True when the walk was already on record at mount (dried ink) */
  dried: boolean;
}

/**
 * The settled mono line under the receipts tables. Height reserved from
 * SSR (zero layout shift): one mono line at md+, two below it — the
 * full sentence wraps once inside the narrow column (measured at 390:
 * an unreserved second line shifted everything below by 18px). Text
 * appears when the walk completes — or immediately, dried, when the
 * paper already remembers it. Keeps the ORIGINAL walk date forever.
 *
 * @param props - File id and the real-row counts
 * @returns The reserved settled line
 */
export function AuditSettled({
  projectId,
  verified,
  total,
}: AuditSettledProps) {
  const [settled, setSettled] = useState<SettledState | null>(null);

  useEffect(() => {
    const initial = storedAudit(projectId);
    if (initial) {
      /* The one sanctioned read-then-set (the FileMemory pattern):
         storage applies post-hydration, dried — no performance. */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettled({ label: initial.label, dried: true });
    }
    const sync = () => {
      const now = storedAudit(projectId);
      if (!now) return;
      /* First record wins: a fresh act settles once and never re-dates */
      setSettled((prev) => prev ?? { label: now.label, dried: false });
    };
    return subscribePaperMemory(sync);
  }, [projectId]);

  return (
    <p
      className={`label-mono text-ink-secondary audit-settled mt-6 min-h-[2.3rem] md:min-h-[1.15rem] ${
        settled?.dried ? "is-dried" : ""
      }`}
      data-audit-settled={settled ? "" : undefined}
      aria-hidden={settled ? undefined : "true"}
    >
      {settled ? (
        <>
          audit walked · {verified} of {total} receipts terminate in artifacts ·{" "}
          {settled.label}
        </>
      ) : null}
    </p>
  );
}
