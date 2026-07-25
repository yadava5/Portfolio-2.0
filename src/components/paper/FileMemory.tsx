/**
 * @fileoverview The dossier's opened-note — "you opened this file · date".
 *
 * W1 (Refinement Era, "the paper remembers"): mounting this on a case
 * file records the visit (paperMemory — the FIRST opening is the one
 * remembered) and sets a one-time mono margin note near the kicker. On
 * the first visit the note simply appears settled (≤300ms fade; instant
 * in static worlds); on revisits it is static — dried ink carrying the
 * ORIGINAL date, never today's. Addressed to the reader, kept quiet:
 * reading history on the reader's own device, never surveillance.
 *
 * The line's height is reserved in the layout (`min-h`), so its arrival
 * never shifts the title beneath it (zero-layout-shift contract).
 */

"use client";

import { useEffect, useState } from "react";
import { recordFileVisit } from "@/lib/paperMemory";

interface FileMemoryProps {
  /** This case file's project id ("automl", "jobtracker", …) */
  fileId: string;
}

/** The note's client state: the remembered date + how it arrived */
interface MemoryState {
  label: string;
  /** True when this mount CREATED the record (the settled fade) */
  firstVisit: boolean;
}

/**
 * Record the visit and render the margin note.
 *
 * @param props - The case-file id
 * @returns The reserved margin-note line
 */
export function FileMemory({ fileId }: FileMemoryProps) {
  const [memory, setMemory] = useState<MemoryState | null>(null);

  useEffect(() => {
    /* CRITIC-LEDGER F81. This is NOT the mirror pattern the rule is
       aimed at, and it is not what SmoothScroll's quiet-toggle read was
       (that one is now a `useSyncExternalStore` subscription).
       `recordFileVisit` WRITES — it stamps this visit into the paper's
       memory — and returns what it wrote. A write must not happen
       during render or in a snapshot getter, both of which React may
       call more than once; an effect is the only correct place for it.
       The state that follows is the write's receipt, not a copy of an
       external value. */
    const { date, firstVisit } = recordFileVisit(fileId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMemory({ label: date.label, firstVisit });
  }, [fileId]);

  return (
    <p
      className={`label-mono text-ink-secondary file-memory mt-2 min-h-[1.15rem] ${
        memory && !memory.firstVisit ? "is-dried" : ""
      }`}
      data-file-memory={memory ? "" : undefined}
      aria-hidden={memory ? undefined : "true"}
    >
      {memory ? <>you opened this file · {memory.label}</> : null}
    </p>
  );
}
