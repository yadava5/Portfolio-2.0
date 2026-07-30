/**
 * @fileoverview The living-scene manifest — pure metadata, zero imports.
 *
 * One entry per project that owns a LIVING SCENE (FABLE-VISUAL-BRIEF §B):
 * the caption/disclosure strings the mounts print beside the figure, kept
 * separate from the component registry (index.tsx) so non-React consumers
 * (the Playwright fixtures) can read the honest strings without pulling
 * client components into a Node context.
 *
 * HONESTY CONTRACT (brief D6): every clause in these strings traces to
 * src/lib/data — the manifest may only RESTATE settled data, never add a
 * number. Provenance per entry is documented inline.
 *
 * BUILDER-2 CONTRACT: adding a scene = (1) a new Scene component in this
 * directory, (2) one entry here, (3) one line in index.tsx. No mount,
 * StoryShell, or CaseStudyPage edit is ever needed — the generic mounts
 * (ProjectScene.tsx) pick the scene up by project id on every surface
 * that renders project visuals (ch05 work rows + the case-file hero).
 */

export interface ProjectSceneMeta {
  /** Figure caption clause, lowercase mono voice ("fig. n — {caption}.") */
  caption: string;
  /**
   * Honest description for the case-file plate ("description: …") — must
   * say the figure is a drawing that runs, never a screenshot, and cite
   * where its numbers come from.
   */
  disclosure: string;
  /** One provenance line printed under the figure (lowercase mono). */
  provenance: string;
  /** Accessible name for the resting figure (role="img" aria-label). */
  alt: string;
}

/**
 * Scene metadata by project id (src/lib/data/projects.ts ids).
 *
 * ONE RIGHT ARROW (fix round 6). The home page set two different
 * right-arrow glyphs at the same 13px in the same Fragment Mono 61px
 * apart: the jetpack figure's control (`gzip this figure in your browser
 * ⟶`, U+27F6) and, directly beneath it, this file's caption (`split →
 * parallel → stitch`, U+2192). Two glyphs for one direction, at one
 * size, in one voice, inside one glance — which reads as a font
 * fallback, not as a distinction. The house glyph is `⟶`: it is what
 * SystemDiagram.tsx already rules its stage edges with, and what F41
 * reserved for "onward". Every painted flow arrow in the mono voice is
 * now that glyph — here, in the case-file value cells, and in the
 * corrections register. Arrows inside SOURCE COMMENTS are left as `→`;
 * nothing renders them.
 *
 * Number provenance:
 * - jobtracker: gates "rules ⟶ e5 similarity ⟶ gated SetFit" and the
 *   in-browser int8 ONNX 22.8 MB from projects.ts fullDescription;
 *   96 messages / 12 per label × 8 labels and the eval mix
 *   65 · 17 · 8 · 6 from projectCaseStudies.ts (jobtracker protocol);
 *   macro-F1 0.9791 from proofManifest jobtracker-macro-f1.
 * - fast-mnist-nn: 3.5x openmp+simd dot kernel vs -O3 (dot 256) from
 *   proofManifest fast-mnist-benchmark; the four instruction sets from
 *   projects.ts highlights. The forward-pass panel draws the MLP's
 *   mechanism only, as an axonometric figure — input plane, two
 *   receding hidden planes, far readout ribbon, depth drawn in ink —
 *   and claims no accuracy number (the ~97% claim is HELD in the
 *   manifest until a committed eval run earns it). The caption's
 *   "a drawn 7, answered" (F37) restates the figure's own drawn digit
 *   and its labeled readout — the case study's "you draw a digit and
 *   watch the network read it" — not a measured result.
 * - jetpack-compress: split ⟶ virtual threads ⟶ one byte-valid gzip
 *   member, ~6.5x vs single-threaded java.util.zip (±50%, quick
 *   benchmark) from projects.ts; 72 tests / 0 failures / JDK 25 @
 *   af2c4b1 from proofManifest jetpack-tests. "1f 8b" is the gzip
 *   member magic (RFC 1952 format notation, not a project metric).
 * - taskflow-calendar (Cadence): chrono-node + compromise and the
 *   Google Meet multi-attendee invite flow from projects.ts
 *   (fullDescription, highlights, metrics) + the case architecture's
 *   nlp node; 1,145 tests (634 frontend + 511 backend, vitest) from
 *   proofManifest taskflow-tests @ 69a59e7. The sentence in the figure
 *   ("lunch with sam and priya next tuesday at noon — add a meet") is
 *   an ILLUSTRATIVE example, labeled so in the figure and disclosure —
 *   never user data, and no parser runs in the card (brief B2).
 * - automl: the 7-phase lifecycle + LangGraph + MCP from projects.ts
 *   metrics and proofManifest automl-workflow-proof; default model
 *   GPT-5.4 from projects.ts fullDescription/highlights; the phase
 *   names + "the human gate — go / no-go" from the home fig 4.0 ladder
 *   (StoryShell AUTOML_PHASES, AUTOML-TRANSPOSITIONS #1); "generated
 *   actions hold at the approval edge until a human says go" verbatim
 *   from the case architecture annotation; run 041 · xgboost — awaiting
 *   approval from the case registryFig transcription. The figure NEVER
 *   resolves 7.0 deploy and never approves 041 (the flagship's honesty
 *   contract — approving stays the visitor's own press act).
 */
export const PROJECT_SCENE_MANIFEST: Record<string, ProjectSceneMeta> = {
  jobtracker: {
    caption:
      "the sorting line — the 96-message eval set through rules ⟶ e5 similarity ⟶ gated setfit",
    disclosure:
      "A drawn figure that runs — not a screenshot. Geometry from the repository’s real 3-layer classifier path (rules ⟶ e5 similarity ⟶ gated SetFit); the four lanes and their counts are the committed eval set’s own mix (96 messages, 12 per label × 8 labels); macro-F1 0.9791 from the committed baseline.",
    provenance:
      "96 messages · 12 per label × 8 labels · macro-f1 0.9791 — committed eval baseline · ships in-browser: int8 onnx, 22.8 mb",
    alt: "The sorting line: the 96-message eval set flows through three classifier gates — rules, e5 similarity, and a gated SetFit model — and sorts into its four scenario lanes: 65 core-positive, 17 edge-noise, 8 historical-miss, 6 core-negative. Macro-F1 0.9791.",
  },
  "fast-mnist-nn": {
    caption:
      "the race — equal time, measured distance · the forward pass, drawn into depth — a drawn 7, answered",
    disclosure:
      "A drawn benchmark figure that runs — not a screenshot. Both race lanes draw for the same instant of time, so distance is measured speed: the 3.5× lane is the committed openmp+simd dot-256 kernel result vs the -O3 baseline (BENCHMARKS.md). The forward-pass panel draws the MLP’s mechanism as an axonometric figure — the drawn seven on a near input plane, two hidden layers receding as planes, a ten-slot readout on the far plane — and claims no accuracy number.",
    provenance:
      "3.5× — openmp+simd dot kernel vs -O3 baseline (dot 256), committed benchmarks · avx-512 · avx2 · neon · wasm-simd128",
    alt: "The race: two ink lanes drawn for the same instant of time — the -O3 scalar lane reaches 1× while the openmp+simd lane reaches 3.5× on the dot-256 kernel axis. Beside it, the forward pass drawn in axonometric depth: a stippled digit seven rides the near input plane, feeds two receding hidden planes, and on the far plane’s ten-slot readout, slot seven fills.",
  },
  "taskflow-calendar": {
    caption:
      "the parse — a plain-english sentence resolves into chips on the week grid + a google meet link",
    disclosure:
      "A drawn figure that runs — not a screenshot. The sentence is an illustrative example, never user data. The parse path is the app’s real one — chrono-node and compromise resolve plain English into events and tasks — and the clay Meet chip mirrors the shipped Google Meet flow: multi-attendee Gmail invites with Meet links. No parser runs in this card; the choreography is scripted.",
    provenance:
      "chrono-node + compromise · google meet — multi-attendee invites · 1,145 tests passing — taskflow-calendar @ 69a59e7",
    alt: "The parse: an illustrative plain-English sentence — lunch with sam and priya next tuesday at noon, add a meet — has its spans underlined and resolved into chips: tue 12:00 lunch, invites for sam and priya, and a Google Meet link chip. The event rests on a drawn week grid at tuesday noon with a small clay Meet mark. In the real app, chrono-node and compromise do this parse.",
  },
  automl: {
    caption:
      "the halt, echoed — the run crosses the 7-phase lifecycle and stops at the human gate",
    disclosure:
      "A drawn figure that runs — not a screenshot. A card-scale echo of the pinned home scene: the ink run token crosses the lifecycle’s first six phases and halts at the clay human gate — 7.0 deploy never resolves, because deploying is a person’s decision, not this card’s. The phases and the gate are the platform’s real 7-phase, LangGraph + MCP-orchestrated workflow (default model GPT-5.4); run 041 stays awaiting its human.",
    provenance:
      "7-phase lifecycle · langgraph + mcp · default model gpt-5.4 · registry run 041 — awaiting approval",
    alt: "The halt, echoed: an ink run token has crossed six lifecycle phases — ingest, explore, preprocess, engineer, train, evaluate — and rests in clay at the human gate. Past the gate, a quiet untraveled rail leads to 7.0 deploy, which stays unresolved. Generated actions hold at the approval edge until a human says go.",
  },
  "jetpack-compress": {
    caption:
      "split ⟶ parallel ⟶ stitch — virtual-thread gzip into one byte-valid member",
    disclosure:
      "A drawn figure that runs — not a screenshot. Geometry from the engine’s real path: the input stream splits into blocks, compresses concurrently on virtual threads, and stitches into one byte-valid gzip member. The optional in-card gzip runs your browser’s own CompressionStream and is labeled live — it is not jetpack’s JDK output.",
    provenance:
      "~6.5× vs single-threaded java.util.zip (±50%, quick benchmark) · 72 tests, 0 failures · jdk 25 @ af2c4b1",
    alt: "Split, compress in parallel, stitch: an input byte stream splits into blocks across virtual-thread lanes, each block compresses, and the lanes stitch back into one byte-valid gzip member marked with the 1f 8b gzip header.",
  },
};
