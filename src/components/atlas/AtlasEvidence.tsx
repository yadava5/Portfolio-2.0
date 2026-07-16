import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, LucideIcon } from "lucide-react";
import { Project } from "@/lib/data/projects";
import { ProjectCaseStudy } from "@/lib/data/projectCaseStudies";

interface AtlasSectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function AtlasSectionHeading({
  eyebrow,
  title,
  description,
}: AtlasSectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:mb-10">
      <p className="text-xs font-semibold tracking-[0.28em] text-sky-300 uppercase">
        {eyebrow}
      </p>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-xl text-sm leading-6 text-zinc-400 md:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  detail: string;
}

export function MetricCard({
  icon: Icon,
  value,
  label,
  detail,
}: MetricCardProps) {
  return (
    <div className="min-w-0 rounded border border-zinc-800 bg-zinc-950/70 p-2.5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-sky-400/35 bg-sky-400/10 text-cyan-300 sm:h-10 sm:w-10">
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="max-w-full">
        <span className="block font-mono text-3xl leading-none font-semibold whitespace-nowrap text-emerald-400 sm:text-2xl 2xl:text-3xl">
          {value}
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-100">{label}</p>
      <p className="mt-1 hidden text-xs leading-5 text-zinc-400 2xl:block">
        {detail}
      </p>
    </div>
  );
}

interface ActionLinkProps {
  href: string;
  label: string;
  primary?: boolean;
}

export function ActionLink({ href, label, primary = false }: ActionLinkProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  const className = `inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded border px-4 text-center text-sm font-semibold whitespace-normal transition ${
    primary
      ? "border-sky-400 bg-sky-400 text-zinc-950 hover:bg-sky-300"
      : "border-zinc-700 bg-zinc-950/70 text-zinc-100 hover:border-zinc-400 hover:bg-zinc-900"
  }`;

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <span className="min-w-0 break-all">{label}</span>
        <ArrowUpRight className="shrink-0" size={16} aria-hidden="true" />
      </a>
    );
  }

  return (
    <a href={href} className={className}>
      <span className="min-w-0 break-all">{label}</span>
      <ArrowUpRight className="shrink-0" size={16} aria-hidden="true" />
    </a>
  );
}

interface PipelineStep {
  label: string;
  detail: string;
  icon: LucideIcon;
}

export function PipelineMap({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-950/80 p-4 md:p-5">
      <div className="mb-5 flex flex-col gap-3 border-b border-zinc-800 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-[0.24em] text-sky-300 uppercase">
            Operational Atlas
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            End-to-end data to model to product proof
          </p>
        </div>
        <p className="text-xs leading-5 text-emerald-400 lg:text-right">
          All public claims sourced from repo data
        </p>
      </div>
      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.label}
              className="relative min-w-0 rounded border border-zinc-800 bg-zinc-900/60 p-3 xl:p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <Icon size={20} className="text-cyan-300" aria-hidden="true" />
                <span className="font-mono text-xs text-zinc-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="text-sm leading-5 font-semibold break-words text-zinc-100">
                {step.label}
              </p>
              <p className="mt-1 text-xs leading-5 break-words text-zinc-400">
                {step.detail}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

interface ProjectEvidenceCardProps {
  project: Project;
  study?: ProjectCaseStudy;
  index: number;
  className?: string;
}

function getVisualDisclosureLabel(project: Project) {
  if (project.imageKind === "real-screenshot") return "Project visual:";
  if (project.imageKind === "diagram") return "Architecture diagram:";
  return "Representative visual:";
}

export function ProjectEvidenceCard({
  project,
  study,
  index,
  className = "",
}: ProjectEvidenceCardProps) {
  const metrics = project.metrics ?? [];
  const hasCaseStudy = Boolean(study);
  const projectImageClassName =
    project.imageKind === "representative-visual"
      ? "object-cover opacity-80 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
      : "object-contain p-3 opacity-90 transition duration-500 group-hover:opacity-100";
  const proofLabels =
    study?.featuredProofLabels && study.featuredProofLabels.length > 0
      ? study.featuredProofLabels
      : (study?.artifacts.slice(0, 2).map((artifact) => artifact.label) ?? []);

  return (
    <article
      className={`group grid overflow-hidden rounded border border-zinc-800 bg-zinc-950/75 transition hover:border-sky-400/50 md:grid-cols-[0.9fr_1.1fr] ${className}`}
    >
      <div className="border-b border-zinc-800 bg-zinc-900 md:border-r md:border-b-0">
        <div className="relative min-h-[220px] sm:min-h-[260px]">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              className={projectImageClassName}
              sizes="(min-width: 768px) 40vw, 100vw"
            />
          ) : null}
          <div className="absolute top-4 left-4 rounded border border-sky-400/40 bg-zinc-950/90 px-3 py-2 font-mono text-xs text-cyan-300">
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>
        <p className="border-t border-zinc-800 bg-zinc-950/90 px-4 py-3 text-xs leading-5 text-zinc-400">
          <span className="font-semibold text-zinc-200">
            {getVisualDisclosureLabel(project)}
          </span>{" "}
          {project.imageDisclosure}
        </p>
      </div>
      <div className="flex flex-col p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase">
              {project.category.replace("-", " ")}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-50 md:text-2xl">
              {project.title}
            </h3>
          </div>
          <span className="rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-300">
            {project.isPrivate ? "Private proof" : "Public project"}
          </span>
        </div>
        <p className="text-sm leading-6 text-zinc-400">
          {project.shortDescription}
        </p>
        {metrics.length > 0 ? (
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {metrics.slice(0, 2).map((metric) => (
              <div key={metric.label} className="border-l border-zinc-700 pl-3">
                <dt className="text-xs tracking-[0.18em] text-zinc-400 uppercase">
                  {metric.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-emerald-300">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {proofLabels.length > 0 ? (
          <div className="mt-5 rounded border border-zinc-800 bg-zinc-900/45 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs tracking-[0.2em] text-sky-300 uppercase">
                Proof path
              </p>
              <p className="text-xs font-medium text-zinc-400">
                {project.isPrivate
                  ? "Private-safe artifacts"
                  : "Inspectable artifacts"}
              </p>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {proofLabels.slice(0, 2).map((label) => (
                <li
                  key={label}
                  className="flex min-h-10 items-start gap-2 rounded border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs leading-5 text-zinc-300"
                >
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {project.techStack.slice(0, 5).map((tech) => (
            <span
              key={tech.name}
              className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-400"
            >
              {tech.name}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {hasCaseStudy ? (
            <Link
              href={`/projects/${project.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition hover:text-sky-200"
            >
              Case study
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ) : null}
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-zinc-100"
            >
              Source
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ) : null}
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-zinc-100"
            >
              Live
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function EvidenceChecklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-400"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
