/**
 * @fileoverview StoryShell — the seven working-paper chapters (Phase 1 · Step 4).
 *
 * The visible transformation: one continuous story on the living day-arc
 * canvas, replacing the Technical Operations Atlas. Seven `<section>`
 * chapters carry `data-chapter="01"`–`"07"` (the DayArc waypoint contract)
 * and stable anchors (#arrival … #gate), each set in the working-paper
 * grammar chosen in docs/design-lab/DECISION.md: ¶ kickers, folio rules,
 * datelines, bright/muted headline pairs, mono apparatus, vast whitespace.
 *
 * This is the SHELL: real copy (plan 3.10) and real data (lib/data), no
 * scroll-linked animation and no red thread yet — those are Phase 2/3.
 * All content inherits body ink, which DayArc steps at the dusk flip;
 * chapters 06/07 mute via opacity (≥70%) instead of the day-only
 * secondary-ink token so every state holds AA (amendment A4).
 */

import Link from "next/link";
import {
  personalInfo,
  socialLinks,
  education,
  getDeansListCount,
} from "@/lib/data/personal";
import { experiences, formatDateRange } from "@/lib/data/experience";
import { getProjectById } from "@/lib/data/projects";
import {
  ChapterKicker,
  FolioRule,
  PairHeadline,
  mutedClass,
} from "@/components/story/apparatus";
import { CHAPTERS } from "@/components/story/chapters";
import { ChapterRail } from "@/components/story/ChapterRail";
import { HashRealign } from "@/components/story/HashRealign";
import { LenisAnchor } from "@/components/story/LenisAnchor";
import { LocalTime } from "@/components/story/LocalTime";
import { AwaitingStamp } from "@/components/story/ApprovedStamp";

/** Shared content column: the paper's measure */
/* The xl+ left padding is the paper's binding margin: it reserves the
   gutter the fixed chapter rail lives in (rail ≈ 8rem incl. active name). */
const WRAP = "mx-auto w-full max-w-[1240px] px-6 sm:px-12 xl:pr-16 xl:pl-36";

const [ARRIVAL, WHO, PATH, AUTOML, WORK, VALUES, GATE] = CHAPTERS;

/** Ch-04 pipeline phases in decimal numbering (AUTOML-TRANSPOSITIONS #1) */
const AUTOML_PHASES = [
  "ingest",
  "explore",
  "preprocess",
  "engineer",
  "train",
  "evaluate",
  "deploy",
];

/** Fig 4.1 — registry excerpt, structural + private-safe: model families
 *  are transcribed from the real product capture; per-run metrics are
 *  withheld outright (no empty proof column — the caption says why),
 *  never invented. Exactly one run awaits its human. */
const AUTOML_REGISTRY_ROWS = [
  { run: "038", model: "log-reg", status: "approved" },
  { run: "039", model: "random forest", status: "approved" },
  { run: "040", model: "gbm", status: "approved" },
  { run: "041", model: "xgboost", status: "awaiting approval" },
];

/** Ch-03 field records — the Miami year retold in the paper's own voice.
 *  Every fact traces to src/lib/data/experience.ts (descriptions and
 *  achievements); receipts follow the #values claim→evidence grammar.
 *  Nothing here is invented — datelines beyond jun 2025 are labels, not
 *  dates, because the source data does not date individual efforts. */
const PATH_FIELD_RECORDS: {
  dateline: string;
  observation: string;
  receipt: string;
  href?: string;
}[] = [
  {
    dateline: "jun 2025",
    observation:
      "The tickets arrive without shape — a million-plus service records, and no two describe their problem alike.",
    receipt: "1M+ operational records — high-volume python + sql transforms",
  },
  {
    dateline: "the fix",
    observation:
      "Transforms feeding OAS and Tableau, then dashboards that university departments actually read to make decisions.",
    receipt: "oas/tableau reporting — dashboards across departments",
  },
  {
    dateline: "the bot",
    observation:
      "The questions start answering themselves — an AI chatbot in Slack, wired to Workday, Oracle Analytics, and Tableau, governed the whole way.",
    receipt: "governed data access — workday · oracle · tableau apis",
  },
  {
    dateline: "the assistant",
    observation:
      "A second assistant reads policy and answers with its sources cited, so documentation stops costing an afternoon.",
    receipt: "19/20 cited-source sweep — PolicyBot, the policy assistant",
    href: "/projects/policybot/#validation",
  },
];

/** Ch-05 editorial rows: plan 3.10 pair lines + one honest metric each.
 *  Every number is proof-manifest/case-file-backed: 0.9791 macro-F1 on a
 *  96-sample gate (jobtracker validation ledger), the committed 3.5x
 *  benchmark, and the audited 71 XCTest functions (no latency number
 *  exists for Visual Assist, so its real proof carries the row). */
const WORK_ROWS = [
  {
    projectId: "jobtracker",
    bright: "Your inbox already knows where you applied.",
    muted: "JobTracker reads it — and nothing ever leaves your device.",
    metric: "macro-f1 0.9791 — 96-sample gate",
  },
  {
    projectId: "fast-mnist-nn",
    bright: "No frameworks. Just math, memory, and C++.",
    muted: "Then SIMD made it 3.5× faster.",
    metric: "3.5x dot-kernel speedup — committed benchmarks",
  },
  {
    projectId: "visual-assist",
    bright: "LiDAR measures the room.",
    muted:
      "Visual Assist says it out loud, for the people who need to hear it.",
    metric: "71 xctest functions — on-device, voiceover-first",
  },
];

/** Quiet index of the remaining case files (plan 2.2: demote, don't delete) */
const FURTHER_READING_IDS = [
  "automl",
  "master-inventory",
  "policybot",
  "taskflow-calendar",
];

/** Ch-06 litany: each mantra carries a proof-manifest-backed receipt that
 *  links to the validation ledger of the case file that proves it. The
 *  mnist receipt is worded differently from the #work row on purpose —
 *  the same number should not read twice verbatim. */
const VALUES_LINES = [
  {
    mantra: "Make it learn.",
    receipt: "macro-F1 0.9791 — jobtracker classifier gates",
    href: "/projects/jobtracker/#validation",
  },
  {
    mantra: "Make it fast.",
    receipt: "simd dot kernel — 3.5x, benchmarked in ci",
    href: "/projects/fast-mnist-nn/#validation",
  },
  {
    mantra: "Make it honest.",
    receipt: "19/20 cited-source sweep — policybot validation ledger",
    href: "/projects/policybot/#validation",
  },
];

/** Fig 6.1 — the litany's right-hand counterpart in the fig-4.1 ledger
 *  grammar. Three REAL gates from the proof manifest / case files, each
 *  with its honest disposition: the jobtracker classifier gates passed
 *  (96 samples), the policybot sweep held at 19/20 with honest fallbacks,
 *  and the fast-mnist benchmark evidence is committed and held. */
const VALUES_GATES = [
  { gate: "classifier gate — jobtracker", status: "passed" },
  { gate: "cited-source sweep — policybot", status: "held" },
  { gate: "benchmark suite — fast-mnist", status: "held" },
];

/** Ch-07 endnotes — footnote 1's promise, kept in full: every receipt on
 *  the page, numbered and linked to its evidence. In-page targets (#path)
 *  route through Lenis; case-file targets are plain routes. */
const GATE_REFERENCES: {
  claim: string;
  source: string;
  href: string;
  inPage?: boolean;
}[] = [
  {
    claim: "macro-f1 0.9791, 96-sample gate",
    source: "jobtracker — validation",
    href: "/projects/jobtracker/#validation",
  },
  {
    claim: "3.5x dot-kernel speedup, benchmarked in ci",
    source: "fast-mnist-nn — validation",
    href: "/projects/fast-mnist-nn/#validation",
  },
  {
    claim: "19/20 cited-source sweep",
    source: "policybot — validation",
    href: "/projects/policybot/#validation",
  },
  {
    claim: "1M+ operational records transformed",
    source: "¶ 03 — the path, field records",
    href: "#path",
    inPage: true,
  },
  {
    claim: "7-phase gated lifecycle, human go/no-go",
    source: "automl — the case file",
    href: "/projects/automl/",
  },
];

/**
 * Format a YYYY-MM date as "May 2026".
 *
 * @param yearMonth - date string in YYYY-MM form
 * @returns Long month + year
 */
function formatMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1));
}

/* ────────────────────────────────────────────────────────────────
   01 · Arrival — masthead-scale hero (candidate C grammar)
   ──────────────────────────────────────────────────────────────── */

function ArrivalChapter() {
  return (
    <section
      id={ARRIVAL.anchor}
      data-chapter={ARRIVAL.id}
      className="flex min-h-svh flex-col pt-28 pb-8"
    >
      <div className={`${WRAP} flex min-h-0 flex-1 flex-col`}>
        <ChapterKicker
          id={ARRIVAL.id}
          label="arrival — a working paper on trust & machinery"
          dateline="oxford, ohio — summer 2026"
        />

        <div className="my-auto py-16">
          <h1 className="font-display fraunces-hero text-[clamp(2.5rem,9vw,9.5rem)] leading-[0.95] font-normal tracking-[-0.015em]">
            {/* Forced break pattern: "machine learning" never splits */}
            <span className="block">I build</span>
            <span className="block whitespace-nowrap">machine learning</span>
            <span className="block">
              that shows its{" "}
              {/* The ¹ is kerned against the period: the size lives on the
                  <sup> (not the anchor) so align-super raises the small
                  glyph, not a hero-sized box, and a small negative margin
                  tucks it into the italic period's right bearing. */}
              <span className="whitespace-nowrap">
                <em className="font-serif italic">work.</em>
                <sup className="-ml-[0.15em] align-super text-[max(0.14em,0.8125rem)] leading-none">
                  <LenisAnchor
                    href="#footnote-1"
                    id="fnref-1"
                    aria-label="Footnote 1"
                    className="text-ink-secondary hover:text-ink font-mono tracking-normal underline-offset-4 transition-colors hover:underline"
                  >
                    1
                  </LenisAnchor>
                </sup>
              </span>
            </span>
          </h1>
          <p className="label-mono text-ink-secondary mt-10">
            ayush yadav — ml engineer, class of 2026
          </p>
        </div>

        {/* Three mono directives, three weights (one glance): the flagship
            teaser is PRIMARY (full ink + drawn underline), the skip
            affordance is SECONDARY (secondary ink + underline), and the
            scroll cue is the QUIETEST — smallest mono, no affordance. */}
        <div className="label-mono space-y-3">
          <p className="text-ink">
            <LenisAnchor href="#automl" className="link-draw">
              flagship — agentic automl: seven gated phases ⟶
            </LenisAnchor>
          </p>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="text-ink-secondary font-mono text-[0.6875rem] tracking-[0.08em] lowercase">
              scroll — the story starts here
            </p>
            <LenisAnchor
              href="#automl"
              className="link-draw text-ink-secondary"
            >
              skip to the work ↓
            </LenisAnchor>
          </div>
        </div>

        {/* The footnote payoff: the hero's ¹ resolves at the foot of its own
            page — short hairline (print's footnote separator), then the
            claim-discipline line. #fnref-1 ⇄ #footnote-1 round-trip. */}
        <div id="footnote-1" className="mt-10">
          <span aria-hidden="true" className="bg-ink/30 block h-px w-28" />
          <p className="label-mono text-ink-secondary mt-3">
            1. every claim on this page links to its evidence.{" "}
            <LenisAnchor
              href="#fnref-1"
              aria-label="Back to the headline"
              className="link-draw"
            >
              ↩
            </LenisAnchor>
          </p>
        </div>

        <div className="mt-6">
          <FolioRule id={ARRIVAL.id} />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   02 · Who — manifesto pair + bio
   ──────────────────────────────────────────────────────────────── */

function WhoChapter() {
  return (
    <section
      id={WHO.anchor}
      data-chapter={WHO.id}
      className="pt-[7vh] pb-[9vh]"
    >
      <div className={WRAP}>
        <ChapterKicker id={WHO.id} label="who — on trust & machinery" />

        <div className="mt-10">
          <PairHeadline
            bright="This is a story about learning machines."
            muted="And the person who doesn’t fully trust them yet."
          />

          {/* Compressed to one breath (fix round 4): deck pair, ONE short
              paragraph, and the n.b. aside — smaller, still seated against
              the bio column so it reads as a note ON the text. */}
          <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,34rem)_minmax(200px,280px)] md:gap-14">
            <p className="text-body max-w-[55ch] font-serif">
              I’m a computer-science graduate from Miami University, and I build
              the whole path — data pipelines, applied machine learning, and the
              software that carries them into real use — with evidence behind
              every claim and a person holding the final word.
            </p>

            <aside className="border-ink-secondary/60 text-ink-secondary self-end justify-self-start border border-dashed p-4 font-mono text-xs leading-6 tracking-[0.05em] lowercase">
              n.b. — nothing on this desk ships without a human pass. this page
              waited its turn too.
            </aside>
          </div>
        </div>

        <div className="mt-[7vh]">
          <FolioRule id={WHO.id} />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   03 · The Path — Miami ITSM + education, editorial rows
   ──────────────────────────────────────────────────────────────── */

function PathChapter() {
  const miami = experiences[0];
  const degree = education[0];
  const range = formatDateRange(miami.startDate, miami.endDate);
  const graduation = formatMonthYear(degree.endDate);
  const deansListCount = getDeansListCount();

  return (
    <section
      id={PATH.anchor}
      data-chapter={PATH.id}
      className="pt-[7vh] pb-[12vh]"
    >
      <div className={WRAP}>
        <ChapterKicker id={PATH.id} label="the path — field records" />

        <PairHeadline
          className="mt-10"
          bright="Thousands of service tickets. Zero structure."
          muted="Miami is where I learned that data work starts with mess."
        />

        <div className="mt-16 space-y-14">
          <article className="border-ink/15 grid gap-6 border-t pt-8 md:grid-cols-[280px_minmax(0,1fr)] md:gap-12">
            <div className="label-mono text-ink-secondary space-y-1">
              <p>{range}</p>
              <p>
                {miami.company} · {miami.location}
              </p>
            </div>
            <div>
              <h3 className="font-display fraunces-display text-2xl">
                {miami.title}
              </h3>
              {/* Field records, not résumé bullets: each dated observation
                  in the paper's voice, closed by a mono receipt in the
                  #values claim→evidence grammar (fix round 4). */}
              <div className="mt-7 space-y-8">
                {PATH_FIELD_RECORDS.map((record) => (
                  <div key={record.dateline}>
                    <p className="label-mono text-ink-secondary">
                      {record.dateline} —
                    </p>
                    <p className="text-body mt-1.5 max-w-[52ch] font-serif">
                      {record.observation}
                    </p>
                    <p className="label-mono text-ink-secondary mt-2">
                      {record.href ? (
                        <Link href={record.href} className="link-draw">
                          {record.receipt}
                        </Link>
                      ) : (
                        record.receipt
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="border-ink/15 grid gap-6 border-t pt-8 md:grid-cols-[280px_minmax(0,1fr)] md:gap-12">
            <div className="label-mono text-ink-secondary space-y-1">
              <p>aug 2022 - may 2026</p>
              <p>{degree.school}</p>
            </div>
            <div>
              <h3 className="font-display fraunces-display text-2xl">
                B.S. {degree.field}
              </h3>
              <p className="text-body mt-5 max-w-[55ch] font-serif">
                B.S. {degree.field}, {degree.school}, {graduation} — dean’s list
                ×{deansListCount}.
              </p>
            </div>
          </article>
        </div>

        <div className="mt-[10vh]">
          <FolioRule id={PATH.id} />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   04 · AutoML — the flagship beat (not pinned until Phase 3)
   ──────────────────────────────────────────────────────────────── */

function AutomlChapter() {
  const automl = getProjectById("automl");

  return (
    <section
      id={AUTOML.anchor}
      data-chapter={AUTOML.id}
      className="pt-[8vh] pb-[14vh]"
    >
      <div className={WRAP}>
        <ChapterKicker
          id={AUTOML.id}
          label="the flagship — senior design expo — spring 2026"
        />

        <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20">
          <div>
            <PairHeadline
              bright="The agent drafts the whole pipeline."
              muted="Nothing runs until a human says go."
            />
            <p className="text-body mt-12 max-w-[55ch] font-serif">
              Agentic AutoML turns a dataset and a goal into a structured,
              auditable ML workflow — planned, argued for, and executed by
              agents that still cannot press go. That button is human. It stays
              human.
            </p>
            {/* Honest stat strip — every clause is proof-manifest-backed */}
            <p className="label-mono border-ink/15 mt-9 inline-block border-t pt-3">
              7 phases · every one gated · langgraph + mcp orchestration
            </p>
            <p className="mt-8">
              <Link
                href="/projects/automl/"
                className="link-draw label-mono text-ink"
              >
                read the case file — {automl?.title} ⟶
              </Link>
            </p>
          </div>

          <div>
            <figure>
              <ul className="label-mono border-ink/15 space-y-3 border-l pl-6">
                {AUTOML_PHASES.map((phase, index) => (
                  <li key={phase}>
                    {index === AUTOML_PHASES.length - 1 ? (
                      <span className="text-ink mb-3 flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="bg-clay-graphic inline-block h-2 w-2"
                        />
                        the human gate — go / no-go
                      </span>
                    ) : null}
                    <span className="text-ink-secondary">
                      {index + 1}.0 {phase}
                    </span>
                  </li>
                ))}
              </ul>
              <figcaption className="label-mono text-ink-secondary mt-6 pl-6">
                fig. 4.0 — the 7-phase gated lifecycle, abridged.
              </figcaption>
            </figure>

            {/* Typeset registry excerpt in fig. 4.0's grammar (the real
                screenshot lives on the case-study page). Two-cell ledger
                rows: run/model left, status right. The metric column is
                withheld outright — a proof column must never dangle bare
                em-dashes — and the caption owns the redaction honestly. */}
            <figure className="mt-10">
              <ul className="label-mono border-ink/15 space-y-3 border-l pl-6">
                <li className="text-ink-secondary flex justify-between gap-x-3 opacity-80">
                  <span>run · model</span>
                  <span className="text-right">status</span>
                </li>
                {AUTOML_REGISTRY_ROWS.map((row) => (
                  <li
                    key={row.run}
                    className={`flex justify-between gap-x-3 ${
                      row.status === "awaiting approval"
                        ? "text-ink"
                        : "text-ink-secondary"
                    }`}
                  >
                    <span>
                      {row.run} · {row.model}
                    </span>
                    <span className="text-right">{row.status}</span>
                  </li>
                ))}
              </ul>
              <figcaption className="label-mono text-ink-secondary mt-6 space-y-1 pl-6">
                <span className="block">
                  fig. 4.1 — experiment registry, transcribed private-safe
                  excerpt.
                </span>
                <span className="block">
                  metrics withheld — private repository; see the case file.
                </span>
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="mt-[10vh]">
          <FolioRule id={AUTOML.id} />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   05 · The Work — three editorial rows + the quiet index
   ──────────────────────────────────────────────────────────────── */

function WorkChapter() {
  return (
    <section
      id={WORK.anchor}
      data-chapter={WORK.id}
      className="pt-[7vh] pb-[12vh]"
    >
      <div className={WRAP}>
        <ChapterKicker id={WORK.id} label="the work — three more systems" />
        <h2 className="sr-only">The work</h2>

        <div className="mt-10">
          {WORK_ROWS.map((row) => {
            const project = getProjectById(row.projectId);
            if (!project) return null;
            const caseHref = `/projects/${project.id}/`;
            return (
              <article
                key={project.id}
                className="border-ink/15 grid gap-6 border-t py-12 md:grid-cols-[minmax(0,1fr)_280px] md:gap-12"
              >
                <div>
                  {/* One underline affordance per row: the title is still a
                      link (big target) but carries no underline — "the case
                      file ⟶" is the row's drawn affordance. */}
                  <h3 className="font-display fraunces-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight">
                    <Link href={caseHref}>{project.title}</Link>
                  </h3>
                  <p className="mt-5 max-w-[34ch] font-serif text-[clamp(1.15rem,1.8vw,1.5rem)] leading-snug">
                    {row.bright}
                  </p>
                  <p className="text-ink-secondary mt-2 max-w-[38ch] font-serif text-[clamp(1.15rem,1.8vw,1.5rem)] leading-snug italic">
                    {row.muted}
                  </p>
                </div>
                <div className="label-mono text-ink-secondary flex flex-row flex-wrap items-baseline gap-x-8 gap-y-3 md:flex-col md:items-end md:justify-end md:text-right">
                  <p>{row.metric}</p>
                  <p>
                    <Link href={caseHref} className="link-draw text-ink">
                      the case file ⟶
                    </Link>
                  </p>
                  {project.githubUrl ? (
                    <p>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw"
                      >
                        source ⟶
                      </a>
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        <div className="border-ink/15 border-t pt-6">
          <p className="label-mono text-ink-secondary">also on file —</p>
          <ul className="label-mono mt-3 flex flex-wrap gap-x-8 gap-y-2">
            {FURTHER_READING_IDS.map((id) => {
              const project = getProjectById(id);
              if (!project) return null;
              return (
                <li key={id}>
                  <Link href={`/projects/${id}/`} className="link-draw">
                    {project.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-[10vh]">
          <FolioRule id={WORK.id} />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   06 · How I work — dusk territory, three manifesto lines
   ──────────────────────────────────────────────────────────────── */

function ValuesChapter() {
  return (
    <section
      id={VALUES.anchor}
      data-chapter={VALUES.id}
      className="flex min-h-svh flex-col pt-[7vh] pb-[10vh]"
    >
      <div className={`${WRAP} flex min-h-0 flex-1 flex-col`}>
        <ChapterKicker id={VALUES.id} label="how i work — after dark" dusk />
        <h2 className="sr-only">How I work</h2>

        {/* Two figures share the nightfall spread: the litany carries the
            left, and fig 6.1 — a small ledger in fig 4.1's grammar —
            holds the right column so the chapter is composed edge to
            edge instead of left-hugging a void (fix round 4). */}
        <div className="my-auto grid gap-x-20 gap-y-14 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <figure>
            <ul className="space-y-[4.5vh] border-l border-current/20 pl-6 sm:pl-8">
              {VALUES_LINES.map((line) => (
                <li key={line.mantra}>
                  <p className="font-display text-chapter fraunces-display leading-[1.05]">
                    {line.mantra}
                  </p>
                  {/* Each receipt is a quiet mono link into the validation
                      ledger that proves it */}
                  <p className="label-mono mt-2 opacity-70">
                    <Link href={line.href} className="link-draw">
                      {line.receipt}
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
            <figcaption className="label-mono mt-[4.5vh] pl-6 opacity-70 sm:pl-8">
              fig. 6.0 — the litany, with receipts.
            </figcaption>
          </figure>

          <figure className="w-full max-w-[340px]">
            <ul className="label-mono space-y-3 border-l border-current/20 pl-6">
              <li className="flex justify-between gap-x-3 opacity-60">
                <span>gate</span>
                <span className="text-right">disposition</span>
              </li>
              {VALUES_GATES.map((row) => (
                <li
                  key={row.gate}
                  className="flex justify-between gap-x-3 opacity-80"
                >
                  <span>{row.gate}</span>
                  <span className="text-right">{row.status}</span>
                </li>
              ))}
            </ul>
            <figcaption className="label-mono mt-6 pl-6 opacity-70">
              fig. 6.1 — the gates, kept.
            </figcaption>
          </figure>
        </div>

        <div>
          <FolioRule id={VALUES.id} dusk />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   07 · The Approval Gate — the ending
   ──────────────────────────────────────────────────────────────── */

function GateChapter() {
  const github = socialLinks.find((link) => link.name === "GitHub")?.url;
  const linkedIn = socialLinks.find((link) => link.name === "LinkedIn")?.url;
  const muted = mutedClass(true);

  return (
    <section
      id={GATE.anchor}
      data-chapter={GATE.id}
      className="flex min-h-svh flex-col justify-center py-[14vh]"
    >
      <div className={WRAP}>
        <ChapterKicker
          id={GATE.id}
          label="the approval gate — closing page"
          dusk
        />

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <div className="max-w-[28ch] font-serif text-[clamp(1.3rem,2.2vw,1.8rem)] leading-snug">
              <p>Every pipeline I build ends with a human decision.</p>
              <p className={`mt-2 italic ${muted}`}>
                This one ends with yours.
              </p>
            </div>

            <h2 className="font-display fraunces-hero mt-12 text-[clamp(3rem,8vw,8.5rem)] leading-[0.95] font-normal tracking-[-0.015em]">
              Ayush Yadav
            </h2>

            {/* Mobile seat: the stamp sits between the giant name and the
                email CTA (the lg+ world keeps it in the right column). */}
            <div className="mt-10 lg:hidden">
              <AwaitingStamp compact />
            </div>

            {/* Availability renders lowercase via .label-mono — the data
                file keeps its editorial case (transform in render only). */}
            <div className={`label-mono mt-10 space-y-2 ${muted}`}>
              <p>availability — {personalInfo.availability}</p>
              <p>
                oxford, ohio — <LocalTime /> local
              </p>
            </div>

            <p className="mt-12">
              <a
                href={`mailto:${personalInfo.email}`}
                className="link-draw font-display text-[clamp(1.5rem,2.4vw,2.2rem)] italic"
              >
                Email me — I read everything.
              </a>
            </p>

            <div
              className={`label-mono mt-8 flex flex-wrap gap-x-8 gap-y-2 ${muted}`}
            >
              {/* The address itself, in plain text (a recruiter should
                  never have to click to learn it) — and still a mailto. */}
              <a
                href={`mailto:${personalInfo.email}`}
                className="link-draw normal-case"
              >
                {personalInfo.email}
              </a>
              <a href={personalInfo.resumeUrl} className="link-draw">
                resume
              </a>
              {github ? (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw"
                >
                  github
                </a>
              ) : null}
              {linkedIn ? (
                <a
                  href={linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw"
                >
                  linkedin
                </a>
              ) : null}
            </div>
          </div>

          <div className="hidden lg:block lg:justify-self-end">
            <AwaitingStamp />
          </div>
        </div>

        {/* References — the endnotes that keep footnote 1's promise in
            full: every receipt on the page, numbered, linked to its
            evidence. Compact mono rows over hairline rules; it sits in
            nightfall, so muting is opacity, never day tokens (A4). */}
        <div className="mt-[12vh] max-w-[44rem]">
          <h2 className={`label-mono ${muted}`}>
            references — footnote 1, kept.
          </h2>
          <ol className="label-mono mt-4">
            {GATE_REFERENCES.map((reference, index) => (
              <li
                key={reference.href}
                className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t border-current/15 py-2.5"
              >
                <span className={muted}>
                  {index + 1}. {reference.claim}
                </span>
                {reference.inPage ? (
                  <LenisAnchor href={reference.href} className="link-draw">
                    {reference.source} ⟶
                  </LenisAnchor>
                ) : (
                  <Link href={reference.href} className="link-draw">
                    {reference.source} ⟶
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-[12vh]">
          <FolioRule id={GATE.id} dusk />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Shell
   ──────────────────────────────────────────────────────────────── */

/**
 * The seven-chapter working paper.
 *
 * Mount alongside LightField + DayArc; the wrapper is positioned so all
 * chapter content paints above the fixed light-field stack.
 *
 * @returns The chapter rail plus chapters 01–07
 */
export function StoryShell() {
  return (
    <div className="relative z-10">
      <HashRealign />
      <ChapterRail />
      <ArrivalChapter />
      <WhoChapter />
      <PathChapter />
      <AutomlChapter />
      <WorkChapter />
      <ValuesChapter />
      <GateChapter />
    </div>
  );
}
