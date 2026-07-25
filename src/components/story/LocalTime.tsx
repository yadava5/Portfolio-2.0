/**
 * @fileoverview LocalTime — the gate's LIVE clock, and the only one.
 *
 * The paper carries two kinds of clock and a reader could not tell them
 * apart (CRITIC-LEDGER F28): every ¶ kicker prints a fixed DATELINE from
 * the day the paper records (06:12 → 22:41 — a record, not a time), and
 * the gate prints the real hour in Cincinnati. Three lines apart, in the
 * same mono, one of them fiction. So this one says out loud that it is
 * live, in a sentence: "cincinnati, ohio · it's 11:51 pm here right now".
 *
 * It renders NOTHING until it has a real time (F29/F49): the component
 * used to ship the placeholder `—:—` into the prerendered HTML, which is
 * what a crawler, a no-JS reader and the first paint all saw — a clock
 * that looks broken. An absent clause is honest; a dead one is not. The
 * line it hangs off reads perfectly without it.
 *
 * It ticks on the MINUTE rather than on a fixed interval: each update
 * schedules the next one for the top of the next minute, so the readout
 * is never visibly stale (the old 30s interval could sit a half-minute
 * behind the rollover) and the page wakes once a minute instead of
 * twice. A text update, not motion — it runs in every world.
 */

"use client";

import { useEffect, useState } from "react";

interface LocalTimeProps {
  /** IANA timezone (defaults to Cincinnati, Ohio's zone — same Eastern zone) */
  timeZone?: string;
}

/** Milliseconds until the top of the next minute (+250ms of slack). */
function untilNextMinute(): number {
  const now = new Date();
  return 60_250 - (now.getSeconds() * 1000 + now.getMilliseconds());
}

/**
 * The gate's live clock, as a labelled clause.
 *
 * @param props - Component props
 * @returns The clause once a real time exists; null before that
 */
export function LocalTime({ timeZone = "America/New_York" }: LocalTimeProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    });
    let timer = 0;
    const update = () => {
      setTime(formatter.format(new Date()).toLowerCase());
      timer = window.setTimeout(update, untilNextMinute());
    };
    update();
    return () => window.clearTimeout(timer);
  }, [timeZone]);

  if (!time) return null;

  return <span> · it’s {time} here right now</span>;
}
