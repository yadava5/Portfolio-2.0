/**
 * @fileoverview The living-scene registry (FABLE-VISUAL-BRIEF §B).
 *
 * Maps a project id (src/lib/data/projects.ts) to its scene component +
 * manifest metadata. This file is the ONLY wiring point:
 *
 * BUILDER-2 CONTRACT — to add a scene (Cadence, LifeQuest, the AutoML
 * card echo, …):
 *   1. add `src/components/scenes/<Name>Scene.tsx` (a "use client"
 *      component whose SERVER MARKUP is the settled frame; drive motion
 *      with useSceneRun — one-shot, no pin, transform/opacity/clip-path/
 *      stroke-dashoffset only);
 *   2. add its honest strings to manifest.ts (every number data-traced);
 *   3. add one entry to SCENE_COMPONENTS below.
 * Nothing else: the generic mounts (ProjectScene.tsx) already render a
 * registered scene in the ch05 work rows and the case-file hero, and
 * fall back to the current behavior (nothing / the disclosed image) for
 * projects without one. Do NOT touch StoryShell or CaseStudyPage.
 */

import type { ComponentType } from "react";
import { AppliedScene } from "@/components/scenes/AppliedScene";
import { GlyphScene } from "@/components/scenes/GlyphScene";
import { JetpackScene } from "@/components/scenes/JetpackScene";
import {
  PROJECT_SCENE_MANIFEST,
  type ProjectSceneMeta,
} from "@/components/scenes/manifest";

const SCENE_COMPONENTS: Record<string, ComponentType> = {
  jobtracker: AppliedScene,
  "fast-mnist-nn": GlyphScene,
  "jetpack-compress": JetpackScene,
};

export interface ProjectScene {
  Scene: ComponentType;
  meta: ProjectSceneMeta;
}

/**
 * The scene registered for a project, or null (fall back to the current
 * image/no-visual rendering).
 *
 * @param projectId - src/lib/data/projects.ts id
 * @returns The scene component + its honest metadata
 */
export function getProjectScene(projectId: string): ProjectScene | null {
  const Scene = SCENE_COMPONENTS[projectId];
  const meta = PROJECT_SCENE_MANIFEST[projectId];
  if (!Scene || !meta) return null;
  return { Scene, meta };
}
