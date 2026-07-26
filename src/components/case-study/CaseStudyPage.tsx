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
 *   live demo ↗, system card ↗) → problem/constraints + fig. 1 (the plate)
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

import Link from "next/link";
import { ArtifactGallery } from "@/components/case-study/ArtifactGallery";
import { DossierThread } from "@/components/case-study/DossierThread";
import { EvidenceTable } from "@/components/case-study/EvidenceTable";
import { SystemDiagram } from "@/components/case-study/SystemDiagram";
import { AuditControl } from "@/components/paper/AuditRun";
import { breakable } from "@/components/paper/Breakable";
import { CitationInk } from "@/components/paper/CitationInk";
import { FileMemory } from "@/components/paper/FileMemory";
import { ValidationGlance } from "@/components/paper/ProofGlance";
import { RegistryRows } from "@/components/paper/RegistryRows";
import { ProjectPlateVisual } from "@/components/scenes/ProjectScene";
import { Project } from "@/lib/data/projects";
import {
  DOSSIER_TOTAL,
  ProjectCaseStudy,
  getCaseStudyProject,
  getNextCaseStudy,
  auditTallyClauses,
  receiptAuditCounts,
  receiptAuditState,
} from "@/lib/data/projectCaseStudies";
import { withBasePath } from "@/lib/utils";

interface CaseStudyPageProps {
  project: Project;
  study: ProjectCaseStudy;
}

/** The dossier column — mirrors the home wrap incl. the mobile thread gutter */
const WRAP =
  "relative mx-auto w-full max-w-[1240px] pl-9 pr-6 sm:px-12 xl:pr-16 xl:pl-36";

/**
 * The case-file counter, DELIBERATELY unpadded (fix round 3, N17).
 *
 * These were `String(n).padStart(2, "0")`, and the archive happens to
 * hold exactly as many case files as the story has chapters — so the
 * kicker printed `¶ case file 05 / 07`, the folio rule printed
 * `case file 05 / 07`, and the next-file teaser printed `¶ 06 / 07 ·
 * glyph — …`: the same digits, the same slash, the same seat and the
 * same mono as the home paper's `¶ 05 / 07 · how i work — after dark`.
 * A reader arriving from ¶05 read a chapter position on a page that is
 * not a chapter, and the teaser was indistinguishable from a chapter
 * link.
 *
 * Three differences now separate the two series, and each one is
 * legible on its own: the words "case file", unpadded digits, and `of`
 * for `/`. Chapters are a SEQUENCE you are partway through; case files
 * are a HOLDING you are looking at one of.
 */
const TOTAL = String(DOSSIER_TOTAL);

/** Dossier number — plain, so it can never read as a chapter position */
function fileNo(study: ProjectCaseStudy): string {
  return String(study.fileNo);
}

/* breakable() moved to components/paper/Breakable.tsx in fix round 5 —
   the eval-protocol slip, the receipts table and the meta ledger below
   all needed the same hand, and EvidenceTable cannot import from here
   (this file imports it). Behaviour is unchanged. */

/** Mono section heading — the dossier's inner kicker voice.
 *  W2 (friend transposition): the "[ section ] · § descriptor" form —
 *  a bracketed mono tag naming the section, the § sign carrying its
 *  working descriptor ("[ validation ] · § the receipts"). Section ids
 *  and anchors are untouched; only the printed head changed hands. */
function SectionKicker({ id, children }: { id?: string; children: string }) {
  return (
    <h2 id={id} className="label-mono text-ink-secondary">
      {children}
    </h2>
  );
}

/**
 * The private-file stamp — the page's single stamp (DOSSIER-SPEC pt 7):
 * a dashed clay frame in the wobbled hand of the gate stamp, carrying a
 * status from a closed set. Rendered only on private case files.
 *
 * The dash is the point and it stays: on this site an unsigned or
 * unearned STAMP is dashed (this one; HeldStamp), and nothing else is —
 * F20 took the dash off the gate stamp when it acquired a signature,
 * F46 took it off the last note box, and the certification round's N3
 * took it off the disclosure aside below. ("in the gate stamp's hand"
 * read as if that stamp were still dashed; it means the hand.)
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

/** One mono dot-leader row of the meta ledger (no pills, no cards)
 *
 *  wrap-anywhere, not break-words (fix round 5): this `dd` is a flex
 *  item, so its automatic minimum size is its min-content width, and
 *  `overflow-wrap: break-word` does not reduce that — a demo host like
 *  `agentic-automl-platform.vercel.app` kept the whole row 39px wider
 *  than a 320px column no matter how the text was allowed to break.
 *  `anywhere` is the value that reduces the contribution too. Where the
 *  break LANDS is still decided by the <wbr> hints breakable() seeds at
 *  the separators, so a host splits after a dot and a repo pin's sha is
 *  never cut in half. The leader and the right-aligned value are
 *  untouched at every width the row already fitted. */
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
      <dd className="label-mono text-ink max-w-[70%] text-right wrap-anywhere">
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
  /* Run-the-audit tallies, from the REAL rows (never hardcoded): the
     walk covers every row of the [ validation ] section — receipts then
     outcomes — and the settled line enumerates each disposition
     (pinned artifact / page capture / described / held) so its counts
     always match the DOM marks under an independent recount. */
  const auditCounts = receiptAuditCounts(study);
  /* CRITIC-LEDGER F57: does this file actually carry a local-only row? */
  const hasLocalOnlyRow = [...study.receipts, ...study.outcomes].some(
    (row) => row.visibility === "local-only"
  );

  return (
    <article data-dossier className="dossier-surface text-ink min-h-screen">
      <DossierThread />
      {/* W1 thread-as-citation: hover/focus strokes from receipts rows
          to the plates they cite (engine world, desktop only) */}
      <CitationInk />
      <div className={`${WRAP} pt-28 pb-16`}>
        {/* ── Opening: kicker with two dates + status word ─────────── */}
        <div className="label-mono text-ink-secondary flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          {/* N17 (fix round 3): the counter said `case file 1 / 8` in the
              same mono, the same seat and the same `N / M` shape as the
              home story's chapter counter (`¶ 01 / 07 · arrival …`) — two
              different countable series wearing one format, so a reader
              arriving from ¶05 read "1 / 8" as a chapter position in an
              eight-chapter paper that has seven. `of` is the whole fix:
              chapters are a SEQUENCE (you are 1 of the way through), case
              files are a HOLDING (this is one file out of eight on
              file), and the two words say which is which without a new
              glyph, a new size, or a new line. */}
          <p data-dossier-kicker>
            ¶ case file {fileNo(study)} of {TOTAL} ·{" "}
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
                  {breakable(
                    `${study.repoPin.repo} @ ${study.repoPin.sha}` +
                      (study.repoPin.branch ? ` · ${study.repoPin.branch}` : "")
                  )}
                </a>
              </LedgerRow>
            ) : (
              <LedgerRow term="repo">
                private — {breakable(study.privateRepoName ?? "")}
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
                  {liveHost ? breakable(liveHost) : null} ↗
                </a>
              </LedgerRow>
            ) : null}
            {/* The app's own documentation, seated with the other two
                terminals (2026-07-26). The placement model says this site
                is the hub linking landing · live app · booklet-as-
                documentation, and the third of those three had no link
                anywhere on the site. This ledger is where a reader
                already goes for "where does this thing live" — repo,
                then demo, then its card.

                It prints the PATH, not the host: the row directly above
                just printed the host, and repeating it would set the
                same 24 characters twice inside one dl. `/system-card`
                composes with the line above it — same building, that
                door — and it is the only row here whose value is a path,
                which is exactly what it is. The render condition keeps
                that composition honest: no liveUrl, no host printed
                above, no bare path underneath. (systemCardUrl is derived
                from liveUrl in the data anyway; this is belt and
                braces.) */}
            {project.liveUrl && project.systemCardUrl ? (
              <LedgerRow term="system card">
                <a
                  href={project.systemCardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-system-card
                  className="link-draw normal-case"
                >
                  /system-card ↗
                </a>
              </LedgerRow>
            ) : null}
          </dl>

          <div className="flex flex-col items-start gap-6 lg:items-end">
            {isPrivate ? <PrivateStamp /> : null}
            {/* CRITIC-LEDGER F20/F46, applied here (certification round,
                N3). This was a dashed box in 12px mono — the one grammar
                the home paper does not have, because F20 took it off the
                approval stamp ("a dashed box reads as content missing")
                and F46 took the last one off ¶02. It survived on the
                four case files that carry a disclosure, so the same
                register said two different things depending on which
                surface a reader was standing on.
                It now takes F46's exact replacement: a hairline rule and
                the label token — the apparatus grammar every other note
                on this site already uses. Dashed ink stays reserved for
                what it was reserved for: a STAMP that is not yet signed
                (PrivateStamp above, HeldStamp in the ledger). */}
            {study.evidenceDisclosure ? (
              <aside className="label-mono text-ink-secondary border-ink/15 max-w-[44ch] border-t pt-3 leading-6">
                {study.evidenceDisclosure.label} —{" "}
                {study.evidenceDisclosure.detail}
              </aside>
            ) : null}
          </div>
        </div>

        {/* ── Problem, constraints + fig. 1 (the one rotated plate) ── */}
        <div className="mt-20 grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
          <section id="problem">
            <SectionKicker>[ problem ] · § as found</SectionKicker>
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
            {/* The generic scene mount (living scenes, FABLE-VISUAL-BRIEF
                §B): a registered scene replaces the static fig. 1 image
                inside the same rotated plate; projects without one keep
                the exact prior Image + disclosure rendering. Registry:
                src/components/scenes/index.tsx — never edit here. */}
            <ProjectPlateVisual project={project} />
          </section>
        </div>

        {/* ── fig. 2 — architecture, inked ─────────────────────────── */}
        <section id="architecture" className="mt-20">
          <SectionKicker>[ architecture ] · § fig. 2, inked</SectionKicker>
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

        {/* ── Decisions as numbered ADR clauses ──────────────────────
            W5 round B (visitor #5): on the dossier grid's lg breakpoint
            the t-slips seat as TRUE right-margin sidenotes — each
            article becomes a two-column grid whose left column keeps
            the continuous 44rem measure (clause head + reason) while
            the tradeoff slip sits in the right margin beside ITS OWN
            decision (per-article grid = alignment by entry, top-seated
            with the d-head). The ¶ reads: reason cites t{n} in the
            text, the eye travels right, the slip is there — the
            marginalia the two-ink grid promised. DOM/reading order is
            untouched (head → reason → slip); below lg the stacked flow
            is exactly the old one. minmax(0,44rem) lets the measure
            give first at 1024 so the grid never overflows the wrap. */}
        <section id="decisions" className="mt-20 max-w-[44rem] lg:max-w-none">
          <SectionKicker>[ decisions ] · § as filed</SectionKicker>
          <div className="mt-2">
            {study.decisions.map((decision, index) => (
              <article
                key={decision.decision}
                className="border-ink/15 border-t py-6 lg:grid lg:grid-cols-[minmax(0,44rem)_minmax(200px,280px)] lg:gap-x-12"
              >
                <h3 className="label-mono text-ink lg:col-start-1">
                  d{index + 1} — {decision.decision.toLowerCase()} ·{" "}
                  {decision.status}
                </h3>
                <p className="text-body mt-3 max-w-[52ch] font-serif lg:col-start-1">
                  {decision.reason}
                  {/* Fix round 3, S10 — the house marker, at last. This
                      set `t1` in the FULL 13px label class with `ml-1`
                      of air in front of it, so a sidenote marker read as
                      a word: a 4px gap, then a letter, then a digit,
                      hanging off the end of a serif sentence. The
                      masthead's own ¹ is the grammar the paper already
                      has — a bare numeral in the mono hand, sized by the
                      same `max(0.14em, label)` expression, raised by
                      `align-super`, tucked against the preceding period
                      instead of spaced off it. The `t` is not lost: it
                      moved into the slip, which now opens with the
                      matching numeral and the word "tradeoff", so the
                      pairing is stated rather than encoded in a prefix
                      the reader had to decode. Numbering is unchanged —
                      marker n still points at slip n, and the `d`-head
                      series above is untouched. */}
                  <sup className="text-ink-secondary align-super font-mono text-[max(0.14em,0.8125rem)] leading-none tracking-normal">
                    {index + 1}
                  </sup>
                </p>
                <p
                  data-tradeoff-slip
                  className="label-mono text-ink-secondary border-ink/20 mt-3 ml-5 border-l pl-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:ml-0 lg:self-start"
                >
                  <sup className="align-super leading-none">{index + 1}</sup>{" "}
                  tradeoff — {decision.tradeoff}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Validation: method slip + the receipts table ─────────── */}
        <section id="validation" className="mt-20">
          <SectionKicker>[ validation ] · § the receipts</SectionKicker>

          {/* The glance strip (evviz round): the section's two-second
              read — one drawn verdict mark per receipt row in walk
              order, captioned with the SAME tally clauses the walked
              control settles into (auditTallyClauses — one composer,
              zero drift). Always-inked static figure: the scan layer,
              not the performance; the walk below still earns its marks
              row by row. */}
          <ValidationGlance
            states={[...study.receipts, ...study.outcomes].map(
              receiptAuditState
            )}
            clauses={auditTallyClauses(auditCounts)}
          />

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
            {/* Run-the-audit (friend transposition #3): the one control,
                seated at the receipts table's head. Activation walks
                every row below — receipts then outcomes — then the
                control itself settles into the honest ledger line (W5:
                no below-the-fold duplicate). */}
            <EvidenceTable
              projectId={study.projectId}
              title="validation"
              rows={study.receipts}
              startIndex={1}
              headSlot={
                <AuditControl
                  projectId={study.projectId}
                  counts={auditCounts}
                  nudgeRegistry={Boolean(study.registryFig)}
                />
              }
            />
            <EvidenceTable
              projectId={study.projectId}
              title="outcomes"
              rows={study.outcomes}
              startIndex={receiptsCount + 1}
            />
          </div>

          {/* Epoch-style provenance line: who ran what, in one sentence.

              CRITIC-LEDGER F57: the `[local — verified on request]`
              clause printed unconditionally. `local-only` visibility is
              used TWICE in 2,088 lines of case-study data, so five of
              seven case files explained a badge that never appears on
              them — an apparatus footnote for absent evidence, which
              reads as either boilerplate or a hint that something is
              being held back. The legend now renders where its badge
              does; the other two clauses are true of every file and
              stay. */}
          <p className="label-mono text-ink-secondary border-ink/15 mt-8 border-t pt-3">
            {hasLocalOnlyRow
              ? "rows marked [local — verified on request] were run by me on personal or demo data · "
              : null}
            ci rows link the public run · repo pins are the exact commits
            verified {study.verified}.
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
              {`[ ledger ] · § ${study.ledger.title} — checked in ${study.ledger.checkedIn}`}
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
          <SectionKicker>[ corrections ] · § the register</SectionKicker>
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
          <SectionKicker>[ appendix ] · § plates &amp; artifacts</SectionKicker>
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
              case file {fileNo(study)} of {TOTAL}
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
                {/* N17: the `¶` goes too. This is a link inside a
                    sentence, not a kicker, and `¶ 06 / 07 · glyph` was
                    the chapter counter's exact form on a case-file
                    footer. */}
                case file {fileNo(next)} of {TOTAL} ·{" "}
                {nextProject.title.toLowerCase()} — filed {next.filed} ⟶
              </Link>
            </p>
          ) : null}
        </footer>
      </div>
    </article>
  );
}
