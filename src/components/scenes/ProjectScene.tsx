/**
 * @fileoverview The generic scene mounts — the two surfaces that render
 * project visuals, both registry-driven (see index.tsx builder contract).
 *
 * ProjectRowScene — the ch05 work-row figure slot. A registered scene
 * renders as the row's editorial figure (fig 5.n grammar + a provenance
 * line, every clause data-traced via manifest.ts); a project without a
 * scene renders NOTHING, exactly as rows render today.
 *
 * ProjectPlateVisual — the case-file hero (#project-visual fig. 1). A
 * registered scene replaces the static image INSIDE the same rotated
 * plate frame, with an honest caption + description from the manifest;
 * projects without a scene keep the current Image rendering + data-layer
 * disclosure, byte-for-byte the markup CaseStudyPage shipped before.
 *
 * Server components on purpose: the settled frames arrive in the static
 * export's HTML (the "print edition"), and only the scenes themselves
 * are client islands.
 */

import Image from "next/image";
import { getProjectScene } from "@/components/scenes";
import type { Project } from "@/lib/data/projects";

/**
 * The ch05 work-row figure slot (spans the row grid).
 *
 * @param projectId - The row's project id
 * @param figNo - Chapter-figure number ("5.0", "5.1", …) from row order
 */
export function ProjectRowScene({
  projectId,
  figNo,
}: {
  projectId: string;
  figNo: string;
}) {
  const scene = getProjectScene(projectId);
  if (!scene) return null;
  const { Scene, meta } = scene;
  return (
    <figure data-scene="" className="mt-2 md:col-span-2">
      <Scene />
      {/* Muting is OPACITY on the inherited ink (amendment A4): this row
          can sit in near-dusk light, where the day-only secondary token
          would die on the ledger browns. */}
      <figcaption className="label-mono mt-4 space-y-1 opacity-70">
        <span className="block">
          fig. {figNo} — {meta.caption}.
        </span>
        <span className="block normal-case">{meta.provenance}</span>
      </figcaption>
    </figure>
  );
}

/**
 * The case-file hero: the scene when one is registered, else the exact
 * image plate the dossier shipped before (unchanged fallback).
 *
 * @param project - The case file's project record
 */
export function ProjectPlateVisual({ project }: { project: Project }) {
  const scene = getProjectScene(project.id);

  if (scene) {
    const { Scene, meta } = scene;
    return (
      <figure className="-rotate-[0.4deg]">
        {/* The paper plate (owner fix round): warm archive stock + baked
            grain, double hairline frame, breathing margins — a tipped-in
            monograph plate, never a stark bright card (globals.css
            .plate-paper). */}
        <div className="plate-paper border-ink/40 border p-2 sm:p-3">
          <div
            data-project-visual-frame
            data-scene=""
            className="plate-inner-rule relative min-h-[260px] px-4 py-10 sm:px-8"
          >
            <Scene />
          </div>
        </div>
        <figcaption className="label-mono mt-3">
          <p className="text-ink">fig. 1 — {meta.caption}.</p>
          <p className="text-ink-secondary mt-1 normal-case">
            description: {meta.disclosure}
          </p>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="-rotate-[0.4deg]">
      {/* Same paper-plate dressing as the scene branch — a raster capture
          is still a plate in the monograph, not a floating white card. */}
      <div className="plate-paper border-ink/40 border p-2 sm:p-3">
        <div
          data-project-visual-frame
          className="plate-inner-rule relative aspect-video min-h-[260px]"
        >
          {/* Raster captures carry intrinsic width/height (CLS
              regression hardening, PERF-AUDIT fix 4) — the
              absolute classes reproduce `fill` exactly, so the
              frame's aspect-video box still owns the layout.
              SVG diagrams keep `fill` (no fixed pixel size). */}
          {project.imageWidth && project.imageHeight ? (
            <Image
              src={project.image}
              alt={project.imageAlt}
              width={project.imageWidth}
              height={project.imageHeight}
              className="absolute inset-0 h-full w-full object-contain"
              loading="eager"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          ) : (
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              className="object-contain"
              loading="eager"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          )}
        </div>
      </div>
      <figcaption className="label-mono mt-3">
        <p className="text-ink">fig. 1 — {project.imageAlt.toLowerCase()}.</p>
        <p className="text-ink-secondary mt-1">
          description: {project.imageDisclosure}
        </p>
      </figcaption>
    </figure>
  );
}
