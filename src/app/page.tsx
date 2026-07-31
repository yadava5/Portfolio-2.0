/**
 * @fileoverview Homepage — the Daylight Study working paper.
 *
 * Mounts the world (LightField + DayArc), the rail (the motion world's
 * continuous Red Thread, round 12 — fixed canvas, between the light
 * field and the text in paint order), and the seven-chapter shell.
 */

import { DayArc } from "@/components/world/DayArc";
import { LightField } from "@/components/world/LightField";
import { ThreadRail } from "@/components/thread/ThreadRail";
import { StoryShell } from "@/components/story/StoryShell";

export default function Home() {
  return (
    <>
      <LightField />
      <DayArc />
      <ThreadRail />
      <StoryShell />
    </>
  );
}
