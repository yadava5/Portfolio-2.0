/**
 * @fileoverview The case file as working-paper dossier.
 *
 * The missing half of the concept (DOSSIER-SPEC 8 points + EVIDENCE-MODEL
 * receipts + FRONTEND-COMPLETION-MAP §2): the same paper as the homepage,
 * one stop older — flat archive cream (a document has fixed daylight, so
 * NO day-arc), contour and grain perceptible, ink + kiln clay as the only
 * accents. Reading order:
 *
 *   kicker (two dates + status) → title (thread underlines it) → deck →
 *   meta ledger (mono dot-leaders — role, timeframe, stack, repo @ sha,
 *   live demo ↗) → problem/constraints + fig. 1 (the one rotated plate)
 *   → fig. 2 architecture, inked → decisions as ADR clauses → method
 *   slip → VALIDATION as the receipts table (per-row anchors
 *   #v-<id>-<n>) → boundary rows → ledger (checked-in JSON, where one
 *   exists) → corrections register (permanent) → plates & artifacts →
 *   folio footer ("back to the work ⟵" → /#work · next-file teaser).
 *
 * Skeuomorph budget (DOSSIER-RESEARCH warning 1): one rotated plate,
 * ≤2 stamps (private files carry exactly one), and every apparatus item
 * carries a number, date, or status — nothing survives lorem ipsum.
 */

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArtifactGallery } from "@/components/case-study/ArtifactGallery";
import { DossierThread } from "@/components/case-study/DossierThread";
import { EvidenceTable } from "@/components/case-study/EvidenceTable";
import { SystemDiagram } from "@/components/case-study/SystemDiagram";
import { CitationInk } from "@/components/paper/CitationInk";
import { FileMemory } from "@/components/paper/FileMemory";
import { RegistryRows } from "@/components/paper/RegistryRows";
import { Project } from "@/lib/data/projects";
import {
  DOSSIER_TOTAL,
  ProjectCaseStudy,
  getCaseStudyProject,
  getNextCaseStudy,
} from "@/lib/data/projectCaseStudies";
import { withBasePath } from "@/lib/utils";

interface CaseStudyPageProps {
  project: Project;
  study: ProjectCaseStudy;
}

/** The dossier column — mirrors the home wrap incl. the mobile thread gutter */
const WRAP =
  "relative mx-auto w-full max-w-[1240px] pl-9 pr-6 sm:px-12 xl:pr-16 xl:pl-36";

const TOTAL = String(DOSSIER_TOTAL).padStart(2, "0");

/** Two-digit dossier number */
function fileNo(study: ProjectCaseStudy): string {
  return String(study.fileNo).padStart(2, "0");
}

/**
 * Soft break hints for command/path data: a <wbr> after each separator
 * so narrow columns wrap at token boundaries, never mid-word (the
 * "classif/ier" break from the rejudge round).
 *
 * @param value - A repro command, path, or filename
 * @returns The value with <wbr> after every . / _ - = separator
 */
function breakable(value: string): React.ReactNode {
  const parts = value.split(/(?<=[./_\-=])/);
  return parts.map((part, index) => (
    <Fragment key={`${index}-${part}`}>
      {index > 0 ? <wbr /> : null}
      {part}
    </Fragment>
  ));
}

/** Mono section heading — the dossier's inner kicker voice */
function SectionKicker({ id, children }: { id?: string; children: string }) {
  return (
    <h2 id={id} className="label-mono text-ink-secondary">
      {children}
    </h2>
  );
}

/**
 * The private-file stamp — the page's single stamp (DOSSIER-SPEC pt 7):
 * dashed clay frame in the gate stamp's hand, carrying a status from a
 * closed set. Rendered only on private case files.
 */
function PrivateStamp() {
  return (
    <div
      role="img"
      aria-label="Stamp: private repository — evidence on file"
      className="text-clay w-fit -rotate-3"
    >
      <svg
        viewBox="0 0 250 110"
        className="block h-auto w-[min(210px,60vw)]"
        aria-hidden="true"
      >
        <g fill="none" stroke="currentColor" opacity="0.9">
          <path
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
            d="M10 12 C 78 8, 172 10, 240 9 C 242 42, 241 74, 240 100 C 170 103, 80 101, 10 101 C 8 70, 9 40, 10 12 Z"
          />
          <text
            x="125"
            y="48"
            textAnchor="middle"
            fontSize="14"
            letterSpacing="2"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            private repository
          </text>
          <text
            x="125"
            y="72"
            textAnchor="middle"
            fontSize="10"
            letterSpacing="1.5"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            evidence on file — private-safe
          </text>
        </g>
      </svg>
    </div>
  );
}

/** One mono dot-leader row of the meta ledger (no pills, no cards) */
function LedgerRow({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="label-mono text-ink-secondary shrink-0">{term}</dt>
      <span aria-hidden="true" className="dot-leader" />
      <dd className="label-mono text-ink max-w-[70%] text-right break-words">
        {children}
      </dd>
    </div>
  );
}

export function CaseStudyPage({ project, study }: CaseStudyPageProps) {
  const next = getNextCaseStudy(study);
  const nextProject = getCaseStudyProject(next);
  const isPrivate = study.repoPin === null;
  const liveHost = project.liveUrl ? new URL(project.liveUrl).hostname : null;
  /* Figure count before the plates: fig 1 hero + fig 2 architecture
     (+ fig 3 registry excerpt on the flagship) */
  const figStart = study.registryFig ? 4 : 3;
  const receiptsCount = study.receipts.length;

  return (
    <article data-dossier className="dossier-surface text-ink min-h-screen">
      <DossierThread />
      {/* W1 thread-as-citation: hover/focus strokes from receipts rows
          to the plates they cite (engine world, desktop only) */}
      <CitationInk />
      <div className={`${WRAP} pt-28 pb-16`}>
        {/* ── Opening: kicker with two dates + status word ─────────── */}
        <div className="label-mono text-ink-secondary flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p data-dossier-kicker>
            ¶ case file {fileNo(study)} / {TOTAL} ·{" "}
            {project.title.toLowerCase()} — filed {study.filed} · last verified{" "}
            {study.verified}
          </p>
          <p data-dossier-status>
            status: {study.status}
            {study.statusDetail ? ` — ${study.statusDetail}` : ""}
          </p>
        </div>

        {/* The paper remembers (W1): records this opening and carries
            the one-time margin note — reserved height, zero shift. */}
        <FileMemory fileId={study.projectId} />

        <header className="mt-8">
          <h1
            data-thread-title
            className="font-display fraunces-display max-w-[16ch] text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[1.05] tracking-[-0.015em]"
          >
            {project.title}
          </h1>
          <p className="text-body text-ink-secondary mt-6 max-w-[58ch] font-serif">
            {study.summary}
          </p>
        </header>

        {/* ── Meta as ledger: mono dot-leaders, hairline rules ─────── */}
        <div className="mt-12 grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
          <dl className="border-ink/20 space-y-2.5 border-t pt-4">
            <LedgerRow term="role">{study.role.toLowerCase()}</LedgerRow>
            <LedgerRow term="timeframe">
              {study.timeframe.toLowerCase()}
            </LedgerRow>
            <LedgerRow term="stack">
              {project.techStack.map((tech) => tech.name).join(" · ")}
            </LedgerRow>
            {study.repoPin ? (
              <LedgerRow term="repo">
                {/* normal-case: repo names/shas are case-sensitive data */}
                <a
                  href={study.repoPin.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw normal-case"
                >
                  {study.repoPin.repo} @ {study.repoPin.sha}
                  {study.repoPin.branch ? ` · ${study.repoPin.branch}` : ""}
                </a>
              </LedgerRow>
            ) : (
              <LedgerRow term="repo">
                private — {study.privateRepoName}
              </LedgerRow>
            )}
            {project.liveUrl ? (
              <LedgerRow term="live demo">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-live-demo
                  className="link-draw"
                >
                  {liveHost} ↗
                </a>
              </LedgerRow>
            ) : null}
          </dl>

          <div className="flex flex-col items-start gap-6 lg:items-end">
            {isPrivate ? <PrivateStamp /> : null}
            {study.evidenceDisclosure ? (
              <aside className="border-ink-secondary/60 text-ink-secondary max-w-[44ch] border border-dashed p-4 font-mono text-xs leading-6 tracking-[0.05em] lowercase">
                {study.evidenceDisclosure.label} —{" "}
                {study.evidenceDisclosure.detail}
              </aside>
            ) : null}
          </div>
        </div>

        {/* ── Problem, constraints + fig. 1 (the one rotated plate) ── */}
        <div className="mt-20 grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
          <section id="problem">
            <SectionKicker>the problem —</SectionKicker>
            <p className="text-body mt-4 max-w-[52ch] font-serif">
              {study.problem}
            </p>
            <h3 className="label-mono text-ink-secondary mt-8">
              constraints —
            </h3>
            <ul className="mt-3">
              {study.constraints.map((constraint) => (
                <li
                  key={constraint}
                  className="border-ink/15 label-mono border-t py-2.5"
                >
                  {constraint}
                </li>
              ))}
            </ul>
          </section>

          <section id="project-visual">
            <figure className="-rotate-[0.4deg]">
              <div className="border-ink/35 bg-canvas border p-3 sm:p-4">
                <div
                  data-project-visual-frame
                  className="relative aspect-video min-h-[260px]"
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
                <p className="text-ink">
                  fig. 1 — {project.imageAlt.toLowerCase()}.
                </p>
                <p className="text-ink-secondary mt-1">
                  description: {project.imageDisclosure}
                </p>
              </figcaption>
            </figure>
          </section>
        </div>

        {/* ── fig. 2 — architecture, inked ─────────────────────────── */}
        <section id="architecture" className="mt-20">
          <SectionKicker>the architecture — fig. 2</SectionKicker>
          <div className="mt-6">
            <SystemDiagram
              summary={study.architecture.summary}
              nodes={study.architecture.nodes}
              edges={study.architecture.edges}
              variant={study.architecture.variant}
              flow={study.architecture.flow}
              annotation={study.architecture.annotation}
            />
          </div>
        </section>

        {/* ── fig. 3 — registry excerpt (flagship only) ──────────────
            W1: the same stampable rows as home fig 4.1 — approving the
            041 row HERE approves it everywhere (one run, one act). */}
        {study.registryFig ? (
          <section className="mt-16 max-w-[26rem]">
            <figure>
              <ul className="label-mono border-ink/15 space-y-3 border-l pl-6">
                <RegistryRows rows={study.registryFig.rows} />
              </ul>
              <figcaption className="label-mono text-ink-secondary mt-5 space-y-1 pl-6">
                {study.registryFig.caption.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </figcaption>
            </figure>
          </section>
        ) : null}

        {/* ── Decisions as numbered ADR clauses ────────────────────── */}
        <section id="decisions" className="mt-20 max-w-[44rem]">
          <SectionKicker>decisions — as filed</SectionKicker>
          <div className="mt-2">
            {study.decisions.map((decision, index) => (
              <article
                key={decision.decision}
                className="border-ink/15 border-t py-6"
              >
                <h3 className="label-mono text-ink">
                  d{index + 1} — {decision.decision.toLowerCase()} ·{" "}
                  {decision.status}
                </h3>
                <p className="text-body mt-3 max-w-[52ch] font-serif">
                  {decision.reason}
                  <sup className="label-mono text-ink-secondary ml-1">
                    t{index + 1}
                  </sup>
                </p>
                <p className="label-mono text-ink-secondary border-ink/20 mt-3 ml-5 border-l pl-4">
                  t{index + 1}. tradeoff — {decision.tradeoff}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Validation: method slip + the receipts table ─────────── */}
        <section id="validation" className="mt-20">
          <SectionKicker>validation — the receipts</SectionKicker>

          {study.protocol ? (
            <aside className="border-clay-graphic/70 mt-6 max-w-[44rem] border-l-2 pl-5">
              <h3 className="label-mono text-ink">
                method slip — eval protocol
              </h3>
              {study.protocol.documented ? (
                <dl className="mt-3 space-y-1.5">
                  {study.protocol.lines.map((line) => (
                    <div key={line.label} className="label-mono">
                      <dt className="text-ink-secondary inline">
                        {line.label}:{" "}
                      </dt>
                      {/* normal-case: filenames + commands are data.
                          breakable() adds <wbr> hints so narrow columns
                          wrap at separators, never mid-word. */}
                      <dd className="text-ink inline break-words normal-case">
                        {breakable(line.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="label-mono text-ink-secondary mt-3">
                  protocol: not yet documented — see corrections.
                </p>
              )}
            </aside>
          ) : null}

          <div className="mt-10 space-y-12">
            <EvidenceTable
              projectId={study.projectId}
              title="validation"
              rows={study.receipts}
              startIndex={1}
            />
            <EvidenceTable
              projectId={study.projectId}
              title="outcomes"
              rows={study.outcomes}
              startIndex={receiptsCount + 1}
            />
          </div>

          {/* Epoch-style provenance line: who ran what, in one sentence */}
          <p className="label-mono text-ink-secondary border-ink/15 mt-8 border-t pt-3">
            rows marked [local — verified on request] were run by me on personal
            or demo data · ci rows link the public run · repo pins are the exact
            commits verified {study.verified}.
          </p>

          {/* Boundary rows — the file's honest edges */}
          <div className="mt-10 max-w-[44rem]">
            <h3 className="label-mono text-ink">
              what i&rsquo;m NOT claiming —
            </h3>
            <ul className="mt-2">
              {study.notClaiming.map((line) => (
                <li
                  key={line}
                  className="border-ink/15 label-mono text-ink-secondary border-t py-3"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Checked-in ledger (private files): HTML table + raw JSON ── */}
        {study.ledger ? (
          <section id="ledger" className="mt-20 max-w-[44rem]">
            <SectionKicker>
              {`${study.ledger.title} — checked in ${study.ledger.checkedIn}`}
            </SectionKicker>
            <table className="mt-4 w-full border-collapse">
              <thead>
                <tr className="border-ink/25 border-b">
                  <th
                    scope="col"
                    className="label-mono text-ink-secondary py-2 pr-4 text-left font-normal"
                  >
                    entry
                  </th>
                  <th
                    scope="col"
                    className="label-mono text-ink-secondary py-2 pr-4 text-left font-normal"
                  >
                    value
                  </th>
                  <th
                    scope="col"
                    className="label-mono text-ink-secondary hidden py-2 text-left font-normal sm:table-cell"
                  >
                    note
                  </th>
                </tr>
              </thead>
              <tbody>
                {study.ledger.rows.map((row) => (
                  <tr key={row.label} className="border-ink/15 border-b">
                    <td className="label-mono text-ink-secondary py-2.5 pr-4 align-top">
                      {row.label}
                    </td>
                    <td className="label-mono text-ink py-2.5 pr-4 align-top">
                      {row.value}
                    </td>
                    <td className="label-mono text-ink-secondary hidden py-2.5 align-top sm:table-cell">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="label-mono mt-4">
              <a
                href={withBasePath(study.ledger.jsonPath)}
                className="link-draw"
                download
              >
                download the raw ledger (json) ⟶
              </a>
            </p>
            <p className="label-mono text-ink-secondary mt-2">
              {study.ledger.boundary}. the svg plate in the appendix is this
              same ledger, demoted to thumbnail.
            </p>
          </section>
        ) : null}

        {/* ── Corrections register — permanent, never deleted ──────── */}
        <section id="corrections" className="mt-20 max-w-[44rem]">
          <SectionKicker>corrections — the register</SectionKicker>
          {study.corrections.length > 0 ? (
            <ul className="mt-2">
              {study.corrections.map((correction) => (
                <li
                  key={correction.text}
                  className="border-ink/15 border-t py-4"
                >
                  <p className="label-mono text-clay">
                    {correction.kind} · {correction.date}
                  </p>
                  {/* normal-case: errata quote exact names (AVX-512) */}
                  <p className="label-mono text-ink mt-1.5 normal-case">
                    {correction.text}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="label-mono text-ink-secondary border-ink/15 mt-2 border-t pt-4">
              no corrections on file. when a number changes, it is amended here
              in public — never deleted.
            </p>
          )}
        </section>

        {/* ── Plates & artifacts — the appendix ────────────────────── */}
        <section id="artifacts" className="mt-20">
          <SectionKicker>plates &amp; artifacts — the appendix</SectionKicker>
          <div className="mt-6">
            <ArtifactGallery artifacts={study.artifacts} figStart={figStart} />
          </div>
        </section>

        {/* ── Folio footer: continuity ─────────────────────────────── */}
        <footer className="mt-24">
          <div
            aria-hidden="true"
            className="flex items-center gap-4 opacity-70"
          >
            <span className="h-px flex-1 bg-current" />
            <span className="label-mono tracking-[0.22em]">
              case file {fileNo(study)} / {TOTAL}
            </span>
            <span className="h-px flex-1 bg-current" />
          </div>
          <div className="label-mono mt-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <Link href="/#work" className="link-draw text-ink">
              back to the work ⟵
            </Link>
            <Link href="/evidence/" className="link-draw text-ink-secondary">
              the evidence index ⟶
            </Link>
          </div>
          {nextProject ? (
            <p className="label-mono text-ink-secondary mt-6">
              next file —{" "}
              <Link
                href={`/projects/${next.projectId}/`}
                className="link-draw text-ink"
              >
                ¶ {fileNo(next)} / {TOTAL} · {nextProject.title.toLowerCase()} —
                filed {next.filed} ⟶
              </Link>
            </p>
          ) : null}
        </footer>
      </div>
    </article>
  );
}
