/**
 * @fileoverview Homepage — the Daylight Study working paper.
 *
 * Mounts the world (LightField + DayArc) and the seven-chapter shell.
 */

import { DayArc } from "@/components/world/DayArc";
import { LightField } from "@/components/world/LightField";
import { StoryShell } from "@/components/story/StoryShell";

export default function Home() {
  return (
    <>
      <LightField />
      <DayArc />
      <StoryShell />
    </>
  );
}
