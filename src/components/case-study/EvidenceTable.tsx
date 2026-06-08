import { CaseStudyEvidence } from "@/lib/data/projectCaseStudies";

interface EvidenceTableProps {
  title: string;
  rows: CaseStudyEvidence[];
}

export function EvidenceTable({ title, rows }: EvidenceTableProps) {
  return (
    <div className="overflow-hidden rounded border border-zinc-800 bg-zinc-950/70">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h3 className="text-sm font-semibold tracking-[0.18em] text-sky-300 uppercase">
          {title}
        </h3>
      </div>
      <dl className="divide-y divide-zinc-800">
        {rows.map((row) => (
          <div
            key={`${title}-${row.label}`}
            className="grid gap-2 p-4 md:grid-cols-[0.32fr_0.68fr]"
          >
            <dt className="font-mono text-sm text-emerald-300">{row.label}</dt>
            <dd className="text-sm leading-6 text-zinc-400">{row.evidence}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
