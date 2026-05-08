import { CaseStudyEdge, CaseStudyNode } from "@/lib/data/projectCaseStudies";

interface SystemDiagramProps {
  summary: string;
  nodes: CaseStudyNode[];
  edges: CaseStudyEdge[];
}

const kindClass: Record<CaseStudyNode["kind"], string> = {
  client: "border-sky-400/40 bg-sky-400/10 text-sky-100",
  api: "border-amber-400/40 bg-amber-400/10 text-amber-100",
  data: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  ml: "border-violet-300/40 bg-violet-300/10 text-violet-100",
  system: "border-zinc-500/50 bg-zinc-800/60 text-zinc-100",
  validation: "border-lime-400/40 bg-lime-400/10 text-lime-100",
};

export function SystemDiagram({ summary, nodes, edges }: SystemDiagramProps) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-950/70 p-5">
      <p className="mb-5 text-sm leading-6 text-zinc-400">{summary}</p>
      <div className="grid gap-3 md:grid-cols-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`rounded border p-4 ${kindClass[node.kind]}`}
          >
            <p className="font-semibold">{node.label}</p>
            <p className="mt-1 text-xs leading-5 opacity-75">{node.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-zinc-800 pt-5">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          Data flow
        </p>
        <ol className="grid gap-2">
          {edges.map((edge) => (
            <li
              key={`${edge.from}-${edge.to}-${edge.label}`}
              className="text-sm text-zinc-400"
            >
              <span className="font-mono text-zinc-200">{edge.from}</span>
              <span className="mx-2 text-amber-300">-&gt;</span>
              <span className="font-mono text-zinc-200">{edge.to}</span>
              <span className="ml-2 text-zinc-500">{edge.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
