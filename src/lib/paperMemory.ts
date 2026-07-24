/**
 * @fileoverview The paper's memory — localStorage-backed, SSR-safe.
 *
 * One namespaced store behind the W1 interactions (Refinement Era):
 *
 *   - THE APPROVAL of run no. 041 (the press-to-sign gate + the
 *     stampable registry row). Approving EITHER surface approves the
 *     run everywhere — home fig 4.1, the gate stamp, and the automl
 *     case-file registry echo — because they are THE SAME RUN.
 *   - VISITED CASE FILES (the paper remembers): which dossiers the
 *     visitor has opened, and when — the reader's journey becomes the
 *     audit trail (rail ✓, work-row ✓, the one-time "you opened this
 *     file" margin note, the /evidence crosswalk marks).
 *   - WALKED AUDITS ("run the audit", friend transposition #3): which
 *     case files' receipts the visitor has walked, and when. Walked is
 *     walked — revisits show dried ticks and the ORIGINAL walk date.
 *
 * Contract (SSR + hydration safety): every read happens in effects via
 * the hooks below — the server render and the first client render are
 * both neutral (unapproved, unvisited), and the stored state applies
 * post-hydration as a class/attribute swap. Approval and visit dates
 * are captured ONCE at the moment of the act and never re-derived, so
 * revisits show dried ink — the original date, never today's.
 *
 * Nothing here gates anything: the mailto stays reachable without
 * approving, and clearing localStorage resets the paper completely.
 */

"use client";

import { useCallback, useEffect, useState } from "react";

/** Namespaced storage keys (versioned so a schema change can migrate) */
const APPROVAL_KEY = "paper-memory:v1:approved";
const VISITED_KEY = "paper-memory:v1:visited";
const AUDITS_KEY = "paper-memory:v1:audits";

/** Same-document change signal (the `storage` event is cross-tab only) */
const CHANGE_EVENT = "paper-memory:change";

/** One remembered act: when it happened, in both machine and page voice */
export interface PaperDate {
  /** ISO date (YYYY-MM-DD), local to the visitor */
  iso: string;
  /** The page's mono voice: "jul 18, 2026" */
  label: string;
}

/**
 * Today, in the visitor's own calendar, formatted for the mono voice.
 *
 * @returns The visitor-local date pair
 */
function todayLocal(): PaperDate {
  const now = new Date();
  const label = now
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toLowerCase();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
  return { iso, label };
}

/**
 * Guarded JSON read (storage may be unavailable or hold garbage).
 *
 * @param key - Storage key
 * @returns Parsed value, or null
 */
function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Guarded JSON write + same-document notification.
 *
 * @param key - Storage key
 * @param value - Serializable value
 */
function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the act still holds for this page via the
       change event; it simply won't persist */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Validate a stored date shape (defensive: storage is user-editable).
 *
 * @param value - Candidate value
 * @returns The date, or null when malformed
 */
function asPaperDate(value: unknown): PaperDate | null {
  if (
    value &&
    typeof value === "object" &&
    typeof (value as PaperDate).iso === "string" &&
    typeof (value as PaperDate).label === "string"
  ) {
    return value as PaperDate;
  }
  return null;
}

/**
 * The stored approval of run no. 041, if the visitor has signed.
 *
 * @returns The approval date, or null while the run awaits
 */
export function readApproval(): PaperDate | null {
  return asPaperDate(readJson<unknown>(APPROVAL_KEY));
}

/**
 * Approve run no. 041 (idempotent — the ink dries once). The date is
 * captured at the moment of the act.
 *
 * @returns The approval date now on record
 */
export function approveRun(): PaperDate {
  const existing = readApproval();
  if (existing) return existing;
  const date = todayLocal();
  writeJson(APPROVAL_KEY, date);
  return date;
}

/**
 * Read a stored id → date record, dropping malformed entries.
 *
 * @param key - Storage key holding a Record<string, PaperDate>
 * @returns id → date (possibly empty, never null)
 */
function readDateRecord(key: string): Record<string, PaperDate> {
  const stored = readJson<Record<string, unknown>>(key);
  const out: Record<string, PaperDate> = {};
  if (stored && typeof stored === "object") {
    for (const [id, value] of Object.entries(stored)) {
      const date = asPaperDate(value);
      if (date) out[id] = date;
    }
  }
  return out;
}

/**
 * Every case file the visitor has opened, keyed by project id.
 *
 * @returns id → first-opened date (possibly empty, never null)
 */
export function readVisitedFiles(): Record<string, PaperDate> {
  return readDateRecord(VISITED_KEY);
}

/**
 * Record that a case file was opened (idempotent: the FIRST opening is
 * the one the paper remembers).
 *
 * @param fileId - Case-file project id ("automl", "jobtracker", …)
 * @returns The visit date on record + whether this call created it
 */
export function recordFileVisit(fileId: string): {
  date: PaperDate;
  firstVisit: boolean;
} {
  const visited = readVisitedFiles();
  const existing = visited[fileId];
  if (existing) return { date: existing, firstVisit: false };
  const date = todayLocal();
  writeJson(VISITED_KEY, { ...visited, [fileId]: date });
  return { date, firstVisit: true };
}

/**
 * Every case file whose receipts the visitor has walked ("run the
 * audit"), keyed by project id.
 *
 * @returns id → walk date (possibly empty, never null)
 */
export function readFileAudits(): Record<string, PaperDate> {
  return readDateRecord(AUDITS_KEY);
}

/**
 * Record that a case file's audit was walked (idempotent: walked is
 * walked — the FIRST walk's date is the one the settled line keeps).
 *
 * @param fileId - Case-file project id ("automl", "jobtracker", …)
 * @returns The walk date on record + whether this call created it
 */
export function recordFileAudit(fileId: string): {
  date: PaperDate;
  firstWalk: boolean;
} {
  const audits = readFileAudits();
  const existing = audits[fileId];
  if (existing) return { date: existing, firstWalk: false };
  const date = todayLocal();
  writeJson(AUDITS_KEY, { ...audits, [fileId]: date });
  return { date, firstWalk: true };
}

/**
 * Subscribe to paper-memory changes (same-document acts + cross-tab
 * storage events).
 *
 * @param listener - Called after any change
 * @returns Unsubscribe function
 */
export function subscribePaperMemory(listener: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * The approval of run no. 041 as React state. Neutral (unapproved) on
 * the server and at hydration; the stored act applies in an effect.
 *
 * @returns Approval date (null while awaiting) + the approve act
 */
export function useRunApproval(): {
  approval: PaperDate | null;
  approve: () => void;
} {
  const [approval, setApproval] = useState<PaperDate | null>(null);

  useEffect(() => {
    const sync = () => setApproval(readApproval());
    sync();
    return subscribePaperMemory(sync);
  }, []);

  const approve = useCallback(() => {
    setApproval(approveRun());
  }, []);

  return { approval, approve };
}

/**
 * The set of visited case-file ids as React state (empty on the server
 * and at hydration; storage applies in an effect).
 *
 * @returns Ready-only set of project ids the visitor has opened
 */
export function useVisitedFiles(): ReadonlySet<string> {
  const [visited, setVisited] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const sync = () => setVisited(new Set(Object.keys(readVisitedFiles())));
    sync();
    return subscribePaperMemory(sync);
  }, []);

  return visited;
}
