/**
 * @fileoverview The closing "on file:" manifest — the visitor's own
 * audit trail, rendered as a margin note on ¶07.
 *
 * W5 round B (W4 visitor elevation): the paper's last spread hands the
 * reader a personalized receipt composed ONLY from what paperMemory
 * actually recorded on their device — case files opened, audits
 * walked, run 041 approved (with the stored date of the act). Nothing
 * is ever invented: an empty store renders nothing (no ceremony for a
 * first arrival), every count derives from the store at render time,
 * and ids that do not belong to a real case file (storage is
 * user-editable) are filtered out rather than dressed up. Live acts —
 * signing the stamp while on this page — update the line through the
 * store's subscribe channel.
 *
 * Composition grammar (segments joined by " · " after "on file: "):
 *   - visited files    → "N case file(s) opened"
 *   - walked audits    → one: "{id} audit walked" · two: "{a} + {b}
 *                        audits walked" · three+: "N audits walked"
 *                        (ids in the store's own walk order)
 *   - run 041 approved → "run 041 approved, {stored label}"
 *
 * SSR + hydration safety (the FileMemory/VisitedMark contract): the
 * server and first client render are neutral (empty, aria-hidden);
 * storage applies in an effect. The line's space is reserved (min-h ≈
 * three mono lines) so a returning visitor's manifest — or a live act
 * — never shifts the stamp above it. On load the ink is DRIED (static,
 * no performance); only a mid-session first appearance may fade ≤300ms
 * in the engine world (globals.css kills it in static worlds — A7).
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  readApproval,
  readFileAudits,
  readVisitedFiles,
  subscribePaperMemory,
} from "@/lib/paperMemory";

interface OnFileManifestProps {
  /** The real case-file ids — store entries outside this set never render */
  fileIds: string[];
}

/** The manifest's client state: the composed line + how it arrived */
interface ManifestState {
  text: string;
  /** True when the record was already on file at mount (dried ink) */
  dried: boolean;
}

/**
 * Compose the manifest line from the store, or null when nothing is
 * on file. Pure read — never writes, never invents.
 *
 * @param known - The real case-file ids
 * @returns The composed line, or null for an empty store
 */
function composeManifest(known: ReadonlySet<string>): string | null {
  const segments: string[] = [];

  const opened = Object.keys(readVisitedFiles()).filter((id) => known.has(id));
  if (opened.length > 0) {
    segments.push(
      `${opened.length} case file${opened.length === 1 ? "" : "s"} opened`
    );
  }

  const walked = Object.keys(readFileAudits()).filter((id) => known.has(id));
  if (walked.length === 1) {
    segments.push(`${walked[0]} audit walked`);
  } else if (walked.length === 2) {
    segments.push(`${walked[0]} + ${walked[1]} audits walked`);
  } else if (walked.length > 2) {
    segments.push(`${walked.length} audits walked`);
  }

  const approval = readApproval();
  if (approval) {
    segments.push(`run 041 approved, ${approval.label}`);
  }

  return segments.length > 0 ? `on file: ${segments.join(" · ")}` : null;
}

/**
 * The reserved margin-manifest line under the gate stamp.
 *
 * @param props - The real case-file ids
 * @returns The (space-reserved) manifest paragraph
 */
export function OnFileManifest({ fileIds }: OnFileManifestProps) {
  const [state, setState] = useState<ManifestState | null>(null);
  const known = useMemo(() => new Set(fileIds), [fileIds]);

  useEffect(() => {
    let atMount = true;
    const sync = () => {
      const settled = atMount;
      const text = composeManifest(known);
      setState((prev) => {
        /* A cleared store un-inks the line live — the visitor's right
           to a clean sheet (the useVisitedFiles/useRunApproval rule) */
        if (text === null) return prev === null ? prev : null;
        if (prev) return prev.text === text ? prev : { ...prev, text };
        return { text, dried: settled };
      });
    };
    sync();
    atMount = false;
    return subscribePaperMemory(sync);
  }, [known]);

  return (
    <p
      className={`on-file-manifest label-mono text-clay-night mt-6 min-h-[3.5rem] w-full max-w-[280px] ${
        state?.dried ? "is-dried" : ""
      }`}
      data-on-file={state ? "" : undefined}
      aria-hidden={state ? undefined : "true"}
    >
      {state ? state.text : null}
    </p>
  );
}
