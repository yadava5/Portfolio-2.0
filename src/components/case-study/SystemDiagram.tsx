/**
 * @fileoverview The architecture figure, inked (DOSSIER-SPEC pt 4).
 *
 * One component, topology-driven layouts — no photocopy look:
 *   - "linear" draws the true pipeline as a stage rail (sources ⟶
 *     classifier ⟶ store ⟶ dashboard) with off-spine edges listed as
 *     branches (jobtracker);
 *   - "loop" keeps the card grid but leans into the gated circuit: the
 *     approval edge carries the clay gate mark and the returning edge
 *     closes the loop (automl);
 *   - default is the card grid + flow list.
 *
 * Clay marks the gates — validation-kind nodes plus any node/edge the
 * data flags with `gate: true` (jobtracker's classifier is a true gate:
 * SetFit stays off until its training gates are met). The caption's clay
 * clause renders ONLY when a gate actually renders (no lying furniture),
 * and each variant may carry one bespoke inked annotation in the
 * thread's hand. Server component, static paint only.
 */

import { Fragment } from "react";
import { CaseStudyEdge, CaseStudyNode } from "@/lib/data/projectCaseStudies";

interface SystemDiagramProps {
  summary: string;
  nodes: CaseStudyNode[];
  edges: CaseStudyEdge[];
  variant?: "linear" | "loop";
  /** Linear only: node-id stages in true pipeline order */
  flow?: string[][];
  /** Bespoke inked margin note (text must trace to a receipt) */
  annotation?: string;
}

/** Clay marks the gate/decision nodes; everything else is ink. */
function isGateNode(node: CaseStudyNode): boolean {
  return node.kind === "validation" || node.gate === true;
}

/** The annotation's hand — a small inked stroke from the thread's pen */
function AnnotationNote({ text }: { text: string }) {
  return (
    <div className="mt-6 flex max-w-[46ch] items-start gap-3">
      <svg
        aria-hidden="true"
        viewBox="0 0 34 24"
        className="text-clay mt-0.5 h-[22px] w-[31px] shrink-0"
      >
        <path
          d="M2 22 C 9 19, 16 11, 29 4 M29 4 l-6.5 0.8 M29 4 l-1.2 6.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <p className="label-mono text-clay">{text}</p>
    </div>
  );
}

/** One node card — the shared hand across every variant */
function NodeCard({ node }: { node: CaseStudyNode }) {
  const gate = isGateNode(node);
  return (
    <div
      className={`border p-4 ${gate ? "border-clay-graphic" : "border-ink/35"}`}
    >
      <p className="label-mono flex items-baseline justify-between gap-3">
        <span className={gate ? "text-clay" : "text-ink"}>{node.label}</span>
        {gate ? (
          <span
            aria-hidden="true"
            className="bg-clay-graphic inline-block h-2 w-2 shrink-0 self-center"
          />
        ) : null}
      </p>
      <p className="label-mono text-ink-secondary mt-1.5">{node.detail}</p>
    </div>
  );
}

/** Dedupe the labels on edges joining stage k to stage k+1 */
function stageEdgeLabels(
  edges: CaseStudyEdge[],
  from: string[],
  to: string[]
): string[] {
  const labels = edges
    .filter((edge) => from.includes(edge.from) && to.includes(edge.to))
    .map((edge) => edge.label);
  return Array.from(new Set(labels));
}

/** Edges that never join two adjacent stages — drawn as branches */
function offSpineEdges(
  edges: CaseStudyEdge[],
  flow: string[][]
): CaseStudyEdge[] {
  return edges.filter((edge) => {
    for (let i = 0; i < flow.length - 1; i++) {
      if (flow[i].includes(edge.from) && flow[i + 1].includes(edge.to)) {
        return false;
      }
    }
    return true;
  });
}

export function SystemDiagram({
  summary,
  nodes,
  edges,
  variant,
  flow,
  annotation,
}: SystemDiagramProps) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const gateCount =
    nodes.filter(isGateNode).length +
    edges.filter((edge) => edge.gate === true).length;
  const figureName =
    variant === "linear"
      ? "the pipeline"
      : variant === "loop"
        ? "the gated loop"
        : "the system";
  const caption =
    gateCount > 0
      ? `fig. 2 — ${figureName}, inked. clay marks ${
          gateCount === 1 ? "the gate" : "the gates"
        }: where a check can stop the run.`
      : `fig. 2 — ${figureName}, inked.`;

  /* ── linear: the stage rail ──────────────────────────────────── */
  if (variant === "linear" && flow) {
    const branches = offSpineEdges(edges, flow);
    return (
      <figure>
        <p className="text-body max-w-[55ch] font-serif">{summary}</p>

        <div className="mt-8 flex flex-col gap-y-3 lg:flex-row lg:items-center lg:gap-y-0">
          {flow.map((stage, index) => (
            <Fragment key={stage.join("-")}>
              {index > 0 ? (
                <div className="label-mono text-ink-secondary flex items-center gap-2 pl-4 lg:min-w-0 lg:shrink-0 lg:flex-col lg:gap-1 lg:px-3 lg:pl-3 lg:text-center">
                  <span aria-hidden="true" className="hidden lg:block">
                    ⟶
                  </span>
                  <span aria-hidden="true" className="lg:hidden">
                    ↓
                  </span>
                  <span>
                    {stageEdgeLabels(edges, flow[index - 1], stage).join(" · ")}
                  </span>
                </div>
              ) : null}
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                {stage.map((id) => {
                  const node = nodeById.get(id);
                  return node ? <NodeCard key={id} node={node} /> : null;
                })}
              </div>
            </Fragment>
          ))}
        </div>

        {branches.length > 0 ? (
          <div className="border-ink/20 mt-6 border-t pt-4">
            <p className="label-mono text-ink-secondary">off the spine —</p>
            <ul className="mt-2 space-y-1.5">
              {branches.map((edge) => (
                <li
                  key={`${edge.from}-${edge.to}-${edge.label}`}
                  className="label-mono"
                >
                  <span className="text-ink">
                    {nodeById.get(edge.from)?.label ?? edge.from}
                  </span>
                  <span aria-hidden="true" className="text-ink-secondary mx-2">
                    ⟶
                  </span>
                  {/* fix round 5: JSX eats the whitespace between these
                      spans, so the whole edge was ONE unbreakable inline
                      run held apart by margins — no space, no wrap, and
                      the off-spine list ran past a 320px column. <wbr />
                      restores the break opportunities the layout always
                      read as being there (after the arrow, before the
                      edge's label). Inert wherever the row fits. */}
                  <wbr />
                  <span className="text-ink">
                    {nodeById.get(edge.to)?.label ?? edge.to}
                  </span>
                  <wbr />
                  <span className="text-ink-secondary ml-3">{edge.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {annotation ? <AnnotationNote text={annotation} /> : null}

        <figcaption className="label-mono text-ink-secondary border-ink/20 mt-6 border-t pt-3">
          {caption}
        </figcaption>
      </figure>
    );
  }

  /* ── loop + default: the card grid; the loop's circuit marks the
        approval edge in clay and hooks the returning edge ─────────── */
  const firstNodeId = nodes[0]?.id;
  return (
    <figure>
      <p className="text-body max-w-[55ch] font-serif">{summary}</p>

      <div className="mt-8 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>

      <div className="border-ink/20 mt-7 border-t pt-5">
        <p className="label-mono text-ink-secondary">
          {variant === "loop" ? "the circuit —" : "flow —"}
        </p>
        <ol className="mt-3 space-y-2">
          {edges.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            const closesLoop = variant === "loop" && edge.to === firstNodeId;
            return (
              <li
                key={`${edge.from}-${edge.to}-${edge.label}`}
                className="label-mono"
              >
                {edge.gate ? (
                  <span
                    aria-hidden="true"
                    className="bg-clay-graphic mr-2 inline-block h-2 w-2"
                  />
                ) : null}
                <span className="text-ink">{from?.label ?? edge.from}</span>
                <span aria-hidden="true" className="text-ink-secondary mx-2">
                  ⟶
                </span>
                {/* the same soft breaks as the off-spine list above —
                    see the note there (fix round 5) */}
                <wbr />
                <span className="text-ink">{to?.label ?? edge.to}</span>
                <wbr />
                <span
                  className={`ml-3 ${edge.gate ? "text-clay" : "text-ink-secondary"}`}
                >
                  {edge.label}
                </span>
                {closesLoop ? (
                  <span className="text-ink-secondary ml-3">
                    <span aria-hidden="true">↺ </span>closes the loop
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      {annotation ? <AnnotationNote text={annotation} /> : null}

      <figcaption className="label-mono text-ink-secondary border-ink/20 mt-6 border-t pt-3">
        {caption}
      </figcaption>
    </figure>
  );
}
