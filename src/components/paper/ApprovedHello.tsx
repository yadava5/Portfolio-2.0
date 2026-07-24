/**
 * @fileoverview The mailto CTA's quiet approved state.
 *
 * W1 (Refinement Era, press-to-sign): once run no. 041 is approved —
 * by the gate stamp or the registry row — the email CTA gains one quiet
 * mono line in the decision ink: "run approved — say hello". The line's
 * space is reserved from first paint (visibility swap, never layout),
 * and the CTA itself never depends on it: email stays reachable without
 * approving, in every state, in every world.
 */

"use client";

import { useRunApproval } from "@/lib/paperMemory";

/**
 * Reserved quiet line above the email CTA; visible only once the run
 * is approved.
 *
 * @returns The mono echo line
 */
export function ApprovedHello() {
  const { approval } = useRunApproval();
  return (
    <p
      className="label-mono text-clay-night stamp-hello mb-3"
      data-approved-hello={approval ? "" : undefined}
    >
      run approved — say hello
    </p>
  );
}
