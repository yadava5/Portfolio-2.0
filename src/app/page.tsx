/**
 * @fileoverview Homepage — the Daylight Study working paper.
 *
 * Mounts the world (LightField + DayArc), the rail (the motion world's
 * continuous Red Thread, round 12 — fixed canvas, between the light
 * field and the text in paint order), and the seven-chapter shell.
 */

import { DayArc } from "@/components/world/DayArc";
import { LightField } from "@/components/world/LightField";
import { RunRail } from "@/components/run/RunRail";
import { StoryShell } from "@/components/story/StoryShell";

export default function Home() {
  return (
    <>
      <LightField />
      <DayArc />
      {/* The ported rail replaces ThreadRail. It reads the chapter
          sections directly, so it draws the real route today — before the
          eleven-beat re-cut lands — and the difference is the whole point:
          ThreadRail was continuous, scroll-coupled and reversible at ONE x
          in the left gutter. This one crosses the page. */}
      <RunRail beatSelector="[data-chapter]" />
      <StoryShell />
    </>
  );
}
