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
    /* data-tm="rise" (round 10, the relief port): the plate SURFACES
       from the paper — scale .965 → 1 with a 12px rise, the last slot
       of its row's composed cascade — while the scene's own one-shot
       run draws the ink inside it (useSceneRun, an independent
       trigger). Scale-based depth with s < 1 cannot escape its box,
       which is what the recorded plate-depth CUT requires; static
       worlds render the attribute inert like every data-tm hook. */
    <figure data-scene="" data-tm="rise" className="mt-2 md:col-span-2">
      <Scene />
      {/* Muting is OPACITY on the inherited ink (amendment A4): this row
          can sit in near-dusk light, where the day-only secondary token
          would die on the ledger browns.
          CRITIC-LEDGER F36: fig 5.1's provenance line runs ~120
          characters ("3.5x — openmp+simd dot kernel vs -O3 baseline,
          committed benchmarks · avx-512 · avx2 · neon · wasm-simd128")
          and set to ~1,400px unbounded — roughly twice the comfortable
          measure for 13px mono. max-w-[68ch] is the cap the ledger asks
          for; it binds only the captions that exceed it, so every
          shorter caption is unchanged. */}
      <figcaption className="label-mono mt-4 max-w-[68ch] space-y-1 opacity-70">
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
      /* id="fig-1": every plate on this site is citable by its number
         (ArtifactGallery has printed id="fig-N" since W1), and the case
         file's own first three figures were the ones that were not — so
         "see fig. 4" was a link and "fig. 1" was a dead reference to the
         plate directly above the sentence. Fix round 6. */
      <figure id="fig-1" className="-rotate-[0.4deg]">
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
          {/* Unlabelled, like the provenance line above it. The field is a
              DISCLOSURE — what the figure does and does not show — and the
              page called it "description:", which is the one place the site
              spoke in schema terms instead of English. The smaller secondary
              ink already separates it from the caption. */}
          <p className="text-ink-secondary mt-1 normal-case">
            {meta.disclosure}
          </p>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure id="fig-1" className="-rotate-[0.4deg]">
      {/* Same paper-plate dressing as the scene branch — a raster capture
          is still a plate in the monograph, not a floating white card. */}
      <div className="plate-paper border-ink/40 border p-2 sm:p-3">
        {/* No 260px floor here — removing it IS fix round 5's largest
            repair. `aspect-video` + a definite `min-height` transfers
            THROUGH the ratio in both directions: a box that must be
            260px tall at 16/9 must also be 462px wide, so the frame took
            a 462px used width no matter how narrow its column was. Below
            462px of column that width is both an overflow and a
            min-content contribution the grid item (min-width: auto)
            refuses to shrink under — which is why the three case files
            whose fig. 1 is a raster plate (master-inventory, policybot,
            visual-assist) ran 198px past a 320px viewport, were still
            104px over at 414, and — the part no earlier round measured —
            were 45px over at exactly 1024, where the dossier's two-column
            grid hands this plate a 384px track.
            The floor could never do its job anyway: it only bites when
            the column is under 462px, and that is precisely where it
            breaks the layout. A 16:9 plate in a 260px column is 146px
            tall, which is a plate, not a sliver. The one width where the
            floor was ever load-bearing is an accident of arithmetic —
            at 1440 the frame is 462.22px wide, whose ratio height is
            259.875px, so the floor was rounding the desktop plate up by
            one eighth of a pixel. That eighth is the whole desktop
            delta; the frame keeps its width, its outline and its
            aspect. */}
        <div
          data-project-visual-frame
          className="plate-inner-rule relative aspect-video"
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
          {project.imageDisclosure}
        </p>
      </figcaption>
    </figure>
  );
}
