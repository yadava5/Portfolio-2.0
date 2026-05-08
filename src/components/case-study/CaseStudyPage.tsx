import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { EvidenceTable } from "@/components/case-study/EvidenceTable";
import { SystemDiagram } from "@/components/case-study/SystemDiagram";
import { Project } from "@/lib/data/projects";
import { ProjectCaseStudy } from "@/lib/data/projectCaseStudies";

interface CaseStudyPageProps {
  project: Project;
  study: ProjectCaseStudy;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
      {children}
    </p>
  );
}

export function CaseStudyPage({ project, study }: CaseStudyPageProps) {
  return (
    <article className="min-h-screen bg-[#090b0d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-28 pb-20 md:px-8 lg:px-10">
        <Link
          href="/#projects"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to projects
        </Link>

        <header className="grid gap-8 border-b border-zinc-800 pb-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-amber-400 uppercase">
              {study.treatment.replace("-", " ")}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 md:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-400 md:text-lg">
              {study.summary}
            </p>
          </div>
          <div className="rounded border border-zinc-800 bg-zinc-950/75 p-5">
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-zinc-500">Role</dt>
                <dd className="mt-1 text-zinc-100">{study.role}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Timeframe</dt>
                <dd className="mt-1 text-zinc-100">{study.timeframe}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Stack</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech.name}
                      className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-400"
                    >
                      {tech.name}
                    </span>
                  ))}
                </dd>
              </div>
              {project.githubUrl ? (
                <div>
                  <dt className="text-zinc-500">Repository</dt>
                  <dd className="mt-1">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-200"
                    >
                      Source code
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </header>

        <div className="grid gap-8 py-10 lg:grid-cols-[0.75fr_1.25fr]">
          <section
            id="problem"
            className="rounded border border-zinc-800 bg-zinc-950/70 p-5"
          >
            <SectionLabel>Problem</SectionLabel>
            <p className="text-sm leading-7 text-zinc-300">{study.problem}</p>
            <div className="mt-6">
              <SectionLabel>Constraints</SectionLabel>
              <ul className="grid gap-3">
                {study.constraints.map((constraint) => (
                  <li
                    key={constraint}
                    className="text-sm leading-6 text-zinc-400"
                  >
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section
            id="artifacts"
            className="overflow-hidden rounded border border-zinc-800 bg-zinc-950/70"
          >
            <div className="relative min-h-[280px] bg-zinc-900">
              {project.image ? (
                <Image
                  src={project.image}
                  alt={`${project.title} screenshot`}
                  fill
                  className="object-cover opacity-90"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                />
              ) : null}
            </div>
          </section>
        </div>

        <section id="architecture" className="py-8">
          <SectionLabel>Architecture</SectionLabel>
          <SystemDiagram
            summary={study.architecture.summary}
            nodes={study.architecture.nodes}
            edges={study.architecture.edges}
          />
        </section>

        <section id="decisions" className="py-8">
          <SectionLabel>Decisions</SectionLabel>
          <div className="grid gap-4 md:grid-cols-3">
            {study.decisions.map((decision) => (
              <article
                key={decision.decision}
                className="rounded border border-zinc-800 bg-zinc-950/70 p-5"
              >
                <h2 className="text-lg font-semibold text-zinc-50">
                  {decision.decision}
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {decision.reason}
                </p>
                <p className="mt-4 border-t border-zinc-800 pt-4 text-xs leading-5 text-zinc-500">
                  Tradeoff: {decision.tradeoff}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="validation" className="grid gap-5 py-8 md:grid-cols-2">
          <EvidenceTable title="Validation" rows={study.validation} />
          <EvidenceTable title="Outcomes" rows={study.outcomes} />
        </section>

        <section className="py-8">
          <SectionLabel>Artifacts</SectionLabel>
          <div className="grid gap-3 md:grid-cols-3">
            {study.artifacts.map((artifact) => (
              <a
                key={`${artifact.type}-${artifact.label}`}
                href={artifact.href}
                target={artifact.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  artifact.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="rounded border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-300 transition hover:border-amber-400/50 hover:text-zinc-100"
              >
                <span className="block text-xs tracking-[0.2em] text-zinc-500 uppercase">
                  {artifact.type}
                </span>
                <span className="mt-2 inline-flex items-center gap-2">
                  {artifact.label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
