/**
 * @fileoverview LocalTime — client-rendered clock for the approval gate.
 *
 * Renders the current time in Ayush's timezone (America/New_York),
 * client-only to stay hydration-safe on a static export. Ticks every
 * 30s — a text update, not motion, so it runs in every mode.
 */

"use client";

import { useEffect, useState } from "react";

interface LocalTimeProps {
  /** IANA timezone (defaults to Cincinnati, Ohio's zone — same Eastern zone) */
  timeZone?: string;
}

/**
 * Lowercase local-time readout, e.g. "4:12 pm".
 *
 * @param props - Component props
 * @returns The time span (em dash placeholder before hydration)
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
    const update = () => setTime(formatter.format(new Date()).toLowerCase());
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, [timeZone]);

  return <span suppressHydrationWarning>{time ?? "—:—"}</span>;
}
