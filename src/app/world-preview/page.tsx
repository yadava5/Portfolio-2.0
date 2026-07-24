/**
 * @fileoverview /world-preview — the day-arc test bench (Phase 1 · Step 3).
 *
 * Seven 100vh stub chapters (`data-chapter="01"`–`"07"`) in working-paper
 * style so the light-field layers, the scrubbed day arc, and the dusk ink
 * flip are verifiable and screenshotable in isolation. LightField and
 * DayArc mount HERE ONLY until the Step-4 chapter shell replaces the
 * Atlas homepage.
 *
 * noindex: this is an internal bench, never a public page.
 */

import type { Metadata } from "next";
import { DayArc } from "@/components/world/DayArc";
import { LightField } from "@/components/world/LightField";
import { ARC_WAYPOINTS } from "@/components/world/waypoints.generated";

export const metadata: Metadata = {
  title: "world preview — day-arc bench",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Capitalize a waypoint name for the chapter headline.
 *
 * @param name - lowercase waypoint name ("warm afternoon")
 * @returns Title-case headline text ("Warm afternoon")
 */
function headline(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * The world-preview bench page.
 *
 * @returns Seven stub chapter sections under the light field
 */
export default function WorldPreviewPage() {
  return (
    <>
      <LightField />
      <DayArc />
      {ARC_WAYPOINTS.map((waypoint) => (
        <section
          key={waypoint.id}
          id={`chapter-${waypoint.id}`}
          data-chapter={waypoint.id}
          className="relative flex min-h-screen flex-col justify-center px-[clamp(3rem,10vw,11rem)]"
        >
          <p className="label-mono">
            ¶ {waypoint.id} / 07 · {waypoint.name}
          </p>
          <h2 className="font-display text-chapter fraunces-display mt-6">
            {headline(waypoint.name)}
          </h2>
          <p className="label-mono mt-5">waypoint {waypoint.hex}</p>
        </section>
      ))}
    </>
  );
}
