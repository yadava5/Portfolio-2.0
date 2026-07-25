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
 * This file carries the shell — real copy (plan 3.10), real data
 * (lib/data) — plus, since Phase 2 · Step 1, the RED THREAD: each
 * section is `relative` and mounts a per-chapter ThreadSegment
 * (amendment A3) as its first child, under the (positioned) content
 * wrap. All content inherits body ink, which DayArc steps at the dusk
 * flip; chapters 06/07 mute via opacity (≥70%) instead of the day-only
 * secondary-ink token so every state holds AA (amendment A4).
 *
 * Phase 2 · Step 2 adds THE TEXT MOTION (plan 3.8) as inert data hooks
 * wired by TextMotion.tsx: `.hero-enter` (CSS load entrance),
 * `data-tm-bright` (line-mask rises), `data-tm="muted|muted-fade|
 * block|name"` (fade-rises), `data-tm-words` (the ch-02 manifesto
 * scrub), `data-tm-mantra`/`data-tm-receipt` (the ending litany), and
 * `data-breathe` (Fraunces weight breathing). Rule of the house:
 * elements that carry Red Thread geometry anchors ([data-thread-*])
 * are NEVER transformed — the thread measures their boxes — so motion
 * lives on inner wrappers, children, or siblings instead.
 */

import type { CSSProperties } from "react";
import Link from "next/link";
import { personalInfo, socialLinks, education } from "@/lib/data/personal";
import { experiences, formatDateRange } from "@/lib/data/experience";
import {
  getCaseStudyById,
  projectCaseStudies,
} from "@/lib/data/projectCaseStudies";
import { getProjectById } from "@/lib/data/projects";
import {
  ChapterKicker,
  FolioRule,
  PairHeadline,
  mutedClass,
} from "@/components/story/apparatus";
import { CHAPTERS } from "@/components/story/chapters";
import { ChapterRail } from "@/components/story/ChapterRail";
import { TextMotion } from "@/components/story/TextMotion";
import { ThreadSegment } from "@/components/thread/ThreadSegment";
import { HashRealign } from "@/components/story/HashRealign";
import { LenisAnchor } from "@/components/story/LenisAnchor";
import { LocalTime } from "@/components/story/LocalTime";
import { AwaitingStamp } from "@/components/story/ApprovedStamp";
import { ApprovedHello } from "@/components/paper/ApprovedHello";
import { OnFileManifest } from "@/components/paper/OnFileManifest";
import { PipelineRun } from "@/components/paper/PipelineRun";
import { RegistryRows } from "@/components/paper/RegistryRows";
import { VisitedMark } from "@/components/paper/VisitedMark";
import { ProjectRowScene } from "@/components/scenes/ProjectScene";

/** The real case-file ids (server-side): the manifest's allowlist —
 *  paperMemory entries outside this set are never rendered. */
const CASE_FILE_IDS = projectCaseStudies.map((study) => study.projectId);

/** Shared content column: the paper's measure */
/* The xl+ left padding is the paper's binding margin: it reserves the
   gutter the fixed chapter rail lives in (rail ≈ 8rem incl. active name).
   `relative` seats the content ABOVE each chapter's ThreadSegment svg
   (positioned boxes paint in source order; the svg comes first).
   Below sm the left padding is a TRUE reserved thread gutter (36px): the
   compact spine wanders 20±~4px, so the ink can never touch letterforms
   at 390 (journey-critique fix; probe-tested in dossier.spec.ts). */
const WRAP =
  "relative mx-auto w-full max-w-[1240px] pl-9 pr-6 sm:px-12 xl:pr-16 xl:pl-36";

const [ARRIVAL, WHO, PATH, AUTOML, WORK, VALUES, GATE] = CHAPTERS;

/**
 * Stagger index for the hero's CSS load entrance (60ms per slot —
 * globals.css multiplies `--hero-i`; retuned from plan 3.8's 110ms per
 * PERF-AUDIT fix 1). The two headline lines take seats 0 and 2 — a
 * double-width beat between the imperative and its payoff, so the dare
 * lands before the claim answers it — and carry the ink-settle beat
 * (W5 round B): each line lands and its ink deepens over 0.4s, so the
 * whole masthead is full-ink by ~520ms, same close as the old
 * three-line stack. The directives take seat 4 (240ms): the furniture
 * arrives only once the claim is on the page. Total intro: 240ms +
 * the 0.6s rise = 840ms.
 *
 * @param index - Zero-based entrance slot (fractional seats allowed)
 * @returns Inline style carrying the custom property
 */
function heroDelay(index: number): CSSProperties {
  return { "--hero-i": index } as CSSProperties;
}

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

/**
 * The ¶04 hold's running note (CRITIC-LEDGER F03).
 *
 * The pin costs the reader a viewport of scroll, and across it the left
 * column used to be pixel-identical — six colour steps and a travelling
 * dot, carrying no information the static frame did not already have.
 * So the hold now SAYS something, and every word of it is the case
 * file's own: these are `getCaseStudyById("automl").constraints`,
 * VERBATIM, each surfacing where it actually governs the run —
 * documents at ingest, auditable decisions at preprocess, containers at
 * train, browser checks at evaluate, and the approval rule at the halt.
 *
 * `phase` is the ladder index the note belongs to (0 = 1.0 ingest …
 * 6 = 7.0 deploy, the gated one — its note lands on the HALT, which is
 * the only thing the gate ever resolves to). 2.0 explore and 4.0
 * engineer have no honestly-sourced line of their own, so they hold the
 * previous note rather than invent one (brief D6). If a constraint ever
 * leaves the case file, its line leaves this figure with it — the
 * filter below is the whole enforcement mechanism.
 */
const AUTOML_RUN_NOTES = (() => {
  const constraints = getCaseStudyById("automl")?.constraints ?? [];
  return [
    { phase: 0, text: constraints[1] } /* domain documents → ingest */,
    { phase: 2, text: constraints[0] } /* auditable decisions → preprocess */,
    { phase: 4, text: constraints[3] } /* containerized runs → train */,
    { phase: 5, text: constraints[4] } /* browser-level checks → evaluate */,
    { phase: 6, text: constraints[2] } /* human approval → the halt */,
  ].filter((note): note is { phase: number; text: string } =>
    Boolean(note.text)
  );
})();

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
      "The tickets arrive without shape. A million-plus service records, and no two name their problem alike.",
    receipt: "1M+ operational records — high-volume python + sql transforms",
  },
  {
    dateline: "the fix",
    observation:
      "Python and SQL teach the records shape. The transforms feed OAS and Tableau, and the dashboards they fill are read across university departments.",
    receipt: "oas/tableau reporting — dashboards across departments",
  },
  {
    dateline: "the bot",
    observation:
      "A chatbot in Slack takes the routine questions — wired to Workday, Oracle Analytics, and Tableau, with access governed at every joint.",
    receipt: "governed data access — workday · oracle · tableau apis",
  },
  {
    dateline: "the assistant",
    observation:
      "A second assistant reads policy and answers with its sources cited — and drops the answers whose quotes it cannot verify.",
    receipt: "19/20 cited-source sweep — PolicyBot, the policy assistant",
    href: "/projects/policybot/#v-policybot-1",
  },
];

/** Ch-05 editorial rows: plan 3.10 pair lines + one honest metric each.
 *  Every number is proof-manifest/case-file-backed and each metric chip
 *  links its receipt (footnote 1's contract): 0.9791 macro-F1 on a
 *  96-sample gate, the committed openmp+simd 3.5x (the fast-mnist
 *  BENCHMARKS.md attribution — parallelism carries it, not SIMD alone),
 *  and jetpack's 72/0 suite on JDK 25 (the jetpack-tests manifest entry;
 *  no case file exists yet, so its chip cites the pinned README and the
 *  row's primary act is the live engine — external, never a 404).
 *  Third row swapped visual-assist → jetpack-compress (orchestrator
 *  ruling, 2026-07-24): the six live showcase projects hold the prime
 *  rows; visual-assist is retired (portfolioVisible: false) and its
 *  case file remains reachable from /evidence. */
const WORK_ROWS = [
  {
    projectId: "jobtracker",
    bright: "Your inbox already knows where you applied.",
    muted: "Applied reads it — and the classifier runs in your browser.",
    metric: "macro-f1 0.98 — 96-sample gate",
    metricHref: "/projects/jobtracker/#v-jobtracker-5",
  },
  {
    projectId: "fast-mnist-nn",
    bright: "No frameworks. Just math, memory, and C++.",
    muted: "Then OpenMP and SIMD together made it 3.5× faster.",
    metric:
      "openmp+simd dot kernel — 3.5x vs -O3 baseline, committed benchmarks",
    metricHref: "/projects/fast-mnist-nn/#v-fast-mnist-nn-2",
  },
  {
    /* Facts from src/lib/data/projects.ts (jetpack-compress): parallel
       gzip-compatible engine — split into blocks, compressed on virtual
       threads, stitched into one byte-valid member; 72 tests on JDK 25
       (proofManifest jetpack-tests @ af2c4b1). */
    projectId: "jetpack-compress",
    bright: "One gzip stream. Every core writing it.",
    muted:
      "jetpack-compress splits the bytes across virtual threads — and stitches one byte-valid member.",
    metric: "72 tests, 0 failures — jdk 25 @ af2c4b1",
    metricHref:
      "https://github.com/yadava5/jetpack-compress/blob/af2c4b1/README.md",
  },
  {
    /* Fourth row (orchestrator ruling, 2026-07-24): Cadence promotes
       from "also on file" to a prime row. Pair lines are projects.ts's
       own settled shortDescription split at its colon — no new claims;
       the metric chip is the taskflow-tests manifest entry (1,145 =
       634 frontend + 511 backend, vitest) citing its case receipt.
       CadenceScene (already registered) becomes fig 5.3 automatically
       via the row wrapper's generic scene mount. */
    projectId: "taskflow-calendar",
    bright: "A calendar and task app you drive in plain English.",
    muted:
      "Type a sentence and it files the event or task — and now schedules Google Meet meetings with multi-attendee invites.",
    metric: "1,145 automated tests — 634 frontend + 511 backend, vitest",
    metricHref: "/projects/taskflow-calendar/#v-taskflow-calendar-1",
  },
];

/** Quiet index of the remaining case files (plan 2.2: demote, don't
 *  delete). Dedupe ruling 2026-07-24: a project may appear ONCE on the
 *  home paper — automl left (it IS the ch04 flagship above) and
 *  taskflow-calendar left (promoted to the fourth #work row). */
const FURTHER_READING_IDS = ["master-inventory", "policybot"];

/** Ch-06 litany: each mantra carries a proof-manifest-backed receipt that
 *  links to the validation ledger of the case file that proves it. Every
 *  receipt is worded differently from its #work row on purpose — the
 *  same number should never read twice verbatim: the jobtracker line
 *  cites the case study's REAL 182-test backend suite (its 0.9791
 *  macro-F1 already carries the #work row). The litany's final line —
 *  "Make it honest." — takes the page's ONLY WONK=1 (plan 3.8): the
 *  quirk lands on the value he actually leads with. */
const VALUES_LINES = [
  {
    mantra: "Make it learn.",
    receipt: "182 backend tests — jobtracker validation ledger",
    href: "/projects/jobtracker/#v-jobtracker-4",
    wonk: false,
  },
  {
    /* "benchmarked in ci" was reworded 2026-07-18: the fast-mnist CI
       workflow does not run the benchmark suite (checked via gh run
       list); the honest terminal is the COMMITTED benchmark data the
       case-file receipt links (EVIDENCE-MODEL finding 4). Attribution
       honest per BENCHMARKS.md: the 3.5x is openmp+simd vs the -O3
       baseline — parallelism carries it, not SIMD alone. */
    mantra: "Make it fast.",
    receipt: "openmp+simd dot kernel — 3.5x over -O3, committed benchmarks",
    href: "/projects/fast-mnist-nn/#v-fast-mnist-nn-2",
    wonk: false,
  },
  {
    mantra: "Make it honest.",
    receipt: "19/20 cited-source sweep — policybot validation ledger",
    href: "/projects/policybot/#v-policybot-1",
    wonk: true,
  },
];

/** Fig 6.1 — the litany's right-hand counterpart in the fig-4.1 ledger
 *  grammar. Three REAL gates from the proof manifest / case files, each
 *  with its honest disposition: the jobtracker classifier gates passed
 *  (96 samples); the policybot sweep and the fast-mnist accuracy gate
 *  both REFUSED to sign automatically (19/20 with honest fallbacks; the
 *  ~97% stays HELD until a committed eval run earns it).
 *  W5 vocabulary fix (evidence #4): the gate-outcome word is "refused" —
 *  the figure's own legend defines it ("the gate stopped the run") —
 *  because on the case files HELD means "claim not yet earned", the
 *  opposite valence. "held" never names a gate outcome on the paper. */
const VALUES_GATES = [
  { gate: "classifier gate — jobtracker", status: "passed" },
  { gate: "cited-source sweep — policybot", status: "refused" },
  { gate: "benchmark suite — fast-mnist", status: "refused" },
];

/** Ch-07 endnotes — footnote 1's promise, kept in full: every receipt on
 *  the page, numbered and linked to its evidence. In-page targets (#path)
 *  route through Lenis; case-file targets are plain routes. */
/* Every footnote terminates OFF-page at a case-file receipt-row anchor
   (EVIDENCE-MODEL finding 4: footnote 4 used to link this same page and
   self-falsify the promise; "benchmarked in ci" linked no run — the
   fast-mnist CI does not benchmark, so the words changed to match the
   committed evidence). */
const GATE_REFERENCES: {
  claim: string;
  source: string;
  href: string;
  inPage?: boolean;
}[] = [
  {
    claim: "macro-f1 0.9791, 96-sample gate",
    source: "jobtracker — receipt 05",
    href: "/projects/jobtracker/#v-jobtracker-5",
  },
  {
    claim: "3.5x — openmp+simd dot kernel vs -O3 baseline",
    source: "fast-mnist-nn — receipt 02",
    href: "/projects/fast-mnist-nn/#v-fast-mnist-nn-2",
  },
  {
    claim: "71 xctest functions, models and utilities",
    source: "visual-assist — receipt 01",
    href: "/projects/visual-assist/#v-visual-assist-1",
  },
  {
    claim: "19/20 cited-source sweep",
    source: "policybot — receipt 01",
    href: "/projects/policybot/#v-policybot-1",
  },
  {
    claim: "1M+ operational records transformed",
    source: "master-inventory — receipt 05",
    href: "/projects/master-inventory/#v-master-inventory-5",
  },
  {
    claim: "7-phase gated lifecycle, human go/no-go",
    source: "automl — the case file",
    href: "/projects/automl/",
  },
];

/**
 * Fig 6.1's reviewer marks — the same hand that draws the thread ticked
 * the ledger: a check-stroke for a gate a human signed off ("passed"),
 * a short stop-bar for a gate that stopped the run ("refused"). Inline,
 * currentColor (dusk ink), decorative — the status word carries the
 * meaning; the legend line under the figure spells both out.
 *
 * @param props - The row's disposition
 * @returns A small aria-hidden ink mark
 */
function GateMark({ status }: { status: string }) {
  const passed = status === "passed";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 10"
      className="inline-block h-[0.55em] w-[0.77em] translate-y-[0.05em] self-center"
    >
      <path
        d={
          passed
            ? "M1.5 5.6 C3.2 7.4 4.2 8.2 5 8 C6.6 5.8 9.4 2.6 12.8 1.2"
            : "M1.2 5.8 C4.6 4.6 9.2 5.4 12.9 4.6"
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      className="relative flex min-h-svh flex-col pt-28 pb-8"
    >
      <ThreadSegment id={ARRIVAL.id} />
      <div className={`${WRAP} flex min-h-0 flex-1 flex-col`}>
        {/* The dateline keeps the season; the city moved to the
            standfirst below, where a masthead's place-line belongs —
            printed once instead of twice with different tails (F31). */}
        <ChapterKicker
          id={ARRIVAL.id}
          label="arrival — a working paper on what i’ve built"
          dateline="summer 2026"
        />

        {/* py-10 (was py-16): the masthead→flagship-teaser frame sagged
            at tall viewports — the centering budget tightens so the
            teaser enters the first frame (journey-critique fix). The
            byline is gone (owner ruling, 2026-07-24): the running head
            already signs the paper, so the masthead stands alone and
            the hero breathes. */}
        <div className="my-auto py-10">
          {/* Hero entrance (plan 3.8): per-line de-blur + 14px rise via the
              .hero-enter CSS animation (globals.css) — the page's ONLY
              blur, desktop-only, load-only. The two structural line
              spans ARE the animation lines: no splitting, text intact.
              hero-enter-headline (W5 round B, visitor #3): the masthead
              gets its own beat — the lines land, then their ink deepens
              secondary→full with a ≤1px drying feather (paint-only; the
              LCP line's opacity floor and layout are untouched).
              aria-label (PERF-AUDIT §4.3): the block-broken spans
              concatenate without spaces and glue the footnote ¹ onto the
              claim — the label keeps the accessible name one honest
              sentence; the footnote link keeps its own "Footnote 1".
              Type scale: the two-word dare earns a bigger cut than the
              old three-line sentence — clamp retuned 2.15→3.375rem
              floor (the closing line probes 219px wide in a 260px
              column at 320) and 7.25→9rem ceiling, same tight 0.98
              leading; verified no overflow 320→1680 and the closing
              line NEVER wraps, so the thread's measured box hugs one
              true line of text. */}
          <h1
            aria-label="Scroll. It's all real."
            className="font-display fraunces-hero text-[clamp(3.375rem,9vw,9rem)] leading-[0.98] font-normal tracking-[-0.015em]"
          >
            {/* The masthead is the paper's dare: everything the scroll
                is about to show — figures, demos, approvals — is real,
                receipt-backed machinery, resolved when the visitor's own
                hand approves the run (¶07). The claim is *real*, and
                the footnote points straight at the evidence that earns
                it. Two beats: the imperative, then the payoff. */}
            <span
              className="hero-enter hero-enter-headline block"
              style={heroDelay(0)}
            >
              Scroll.
            </span>
            {/* data-thread-name: the Red Thread originates as this
                closing line's trailing flick (ThreadSegment 01 measures
                it) — on an inline span so the measured box hugs the
                text, not the column: the thread leaves the footnote's
                heel, the claim's own receipt trail. The entrance rides
                the INNER inline-block wrapper: the measured span itself
                must never transform (descendant transforms do not move
                an ancestor's layout box, so the thread's origin stays
                true even if a re-measure lands mid-entrance). */}
            <span className="block">
              <span data-thread-name>
                <span
                  className="hero-enter hero-enter-headline hero-enter-inline"
                  style={heroDelay(2)}
                >
                  It&apos;s all{" "}
                  {/* The ¹ is kerned against the period: the size lives on
                      the <sup> (not the anchor) so align-super raises the
                      small glyph, not a hero-sized box. The negative
                      margin lives on a HERO-sized wrapper, so the tuck-in
                      scales with the italic period's right bearing at
                      every viewport (a sup-relative margin left the ¹
                      adrift at 1440). The em mirrors the old cut on
                      "trust." — the one italic word is the one being
                      sworn to. */}
                  <span className="whitespace-nowrap">
                    <em className="font-serif italic">real.</em>
                    <span className="-ml-[0.085em]">
                      <sup className="align-super text-[max(0.14em,0.8125rem)] leading-none">
                        <LenisAnchor
                          href="#footnote-1"
                          id="fnref-1"
                          aria-label="Footnote 1"
                          className="tap-target text-ink-secondary hover:text-ink font-mono tracking-normal underline-offset-4 transition-colors hover:underline"
                        >
                          1
                        </LenisAnchor>
                      </sup>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </h1>

          {/* THE STANDFIRST (CRITIC-LEDGER F02, the P0 identity fault).
              The masthead of a working paper carries its author; this one
              did not. "Ayush Yadav" appeared as 13px mono chrome in the
              header and then not again as a heading until document
              y≈9,750 of 10,560 — 92% scroll — so a screener who read the
              first frame learned a dare and seven links. One serif line,
              directly under the claim: name — discipline · city. Every
              token is the data layer's own (personalInfo.name /
              .location; the discipline is personalInfo.title without its
              "new-grad" qualifier, which the gate's availability line
              still carries) — no new claim enters the page.
              It also fills the ~200px hole the my-auto centring left
              under the masthead (F45), and takes the location OFF the ¶01
              dateline so the city is printed once (F31).
              19px is an existing step in the rendered type census — no
              new size. Full ink on dawn paper (12.1:1). Entrance seat 3:
              after the claim (seats 0/2), before the directives (seat 4),
              on the same load-only CSS beat, so every static world paints
              it finished (A7). */}
          <p
            data-hero-standfirst
            className="hero-enter text-ink mt-7 font-serif text-[1.1875rem] leading-snug"
            style={heroDelay(3)}
          >
            {personalInfo.name} — software engineer · {personalInfo.location}
          </p>
        </div>

        {/* Mono directives, weighted for one glance: the flagship teaser
            is PRIMARY (full ink + drawn underline); beneath it the three
            case-file links surface the work index from the first frame
            (recruiter-rejudge fix — the index used to live at 55%
            scroll); the skip affordance is SECONDARY, and the scroll cue
            is the QUIETEST — smallest mono, no affordance. */}
        <div className="label-mono hero-enter space-y-3" style={heroDelay(4)}>
          <p className="text-ink">
            <LenisAnchor href="#automl" className="link-draw">
              the capstone — agentic automl: seven gated phases ⟶
            </LenisAnchor>
          </p>
          {/* Quiet apparatus voice, no buttons: direct routes into the
              three case files the #work chapter argues. */}
          <p className="text-ink-secondary font-mono text-[0.6875rem] tracking-[0.08em] lowercase">
            case files:{" "}
            <Link href="/projects/jobtracker/" className="link-draw">
              jobtracker
            </Link>{" "}
            ·{" "}
            <Link href="/projects/fast-mnist-nn/" className="link-draw">
              fast-mnist
            </Link>{" "}
            ·{" "}
            <Link href="/projects/visual-assist/" className="link-draw">
              visual-assist
            </Link>
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
          {/* W5: the 90-second path — one quiet line for screeners who
              will not scroll 1,500vh (A8's spirit): the work index, the
              master ledger, the resume PDF. Apparatus voice, no new
              vocabulary — the same quiet mono as the case-files line. */}
          <p className="text-ink-secondary font-mono text-[0.6875rem] tracking-[0.08em] lowercase">
            in a hurry —{" "}
            <LenisAnchor href="#work" className="link-draw">
              the work
            </LenisAnchor>{" "}
            ⟶{" "}
            <Link href="/evidence/" className="link-draw">
              the evidence
            </Link>{" "}
            ⟶{" "}
            <a href={personalInfo.resumeUrl} className="link-draw">
              the resume
            </a>
          </p>
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
              className="link-draw tap-target"
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
      className="relative pt-[7vh] pb-[9vh]"
    >
      <ThreadSegment id={WHO.id} />
      <div className={WRAP}>
        <ChapterKicker id={WHO.id} label="who — the short version" />

        <div className="mt-10">
          {/* The MANIFESTO (plan 3.8): the page's ONE scrubbed text —
              TextMotion splits both deck lines to words and scrubs their
              opacity 0.25→1 across ~60vh of ch-02 scroll. */}
          <PairHeadline
            motion="manifesto"
            bright="This is a record of what I’ve built."
            muted="And how each piece was checked before I called it done."
          />

          {/* Compressed to one breath (fix round 4): deck pair, ONE short
              paragraph, and the right-hand apparatus column — the
              dictionary entry (W2, friend transposition: the word being
              defined IS the practice) above the n.b. aside, both seated
              against the bio so they read as notes ON the text.
              data-tm-scene (PREMIUM-FLOW #1): bio → dictionary → n.b.
              settle as one staggered beat below the scrubbed manifesto. */}
          <div
            data-tm-scene
            className="mt-10 grid gap-8 md:grid-cols-[minmax(0,34rem)_minmax(200px,280px)] md:gap-14"
          >
            <p className="text-body max-w-[55ch] font-serif" data-tm="block">
              I’m a recent computer-science graduate from Miami University. I
              build the whole path — the interface, the services behind it, the
              data they run on, and the machine learning when the problem calls
              for it. The claims on this paper carry receipts.
            </p>

            <div className="flex flex-col gap-10 md:justify-between">
              {/* The printed glossary block: serif headword, mono
                  pronunciation, Newsreader senses. One instance on the
                  whole paper; both senses are the thesis, not a claim.
                  The syllable dots are typography — an sr-only twin
                  keeps the accessible word whole. */}
              <div data-tm="block">
                <p className="font-display fraunces-display text-2xl leading-none">
                  <span aria-hidden="true">ap·prov·al</span>
                  <span className="sr-only">approval</span>
                </p>
                <p className="label-mono text-ink-secondary mt-2">
                  <span aria-hidden="true">/ əˈpruː·vəl / · </span>noun
                </p>
                <p className="text-ink-secondary mt-3 max-w-[26ch] font-serif text-[0.9375rem] leading-6 italic">
                  1. the moment a human signs for a machine’s work. 2. the step
                  I leave to a person.
                </p>
              </div>

              <aside
                className="border-ink-secondary/60 text-ink-secondary border border-dashed p-4 font-mono text-xs leading-6 tracking-[0.05em] lowercase"
                data-tm="block"
              >
                n.b. — every project below opens into its own case file, source,
                or live build.
              </aside>
            </div>
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

  return (
    <section
      id={PATH.anchor}
      data-chapter={PATH.id}
      className="relative pt-[7vh] pb-[12vh]"
    >
      <ThreadSegment id={PATH.id} />
      <div className={WRAP}>
        <ChapterKicker id={PATH.id} label="the path — field records" />

        <PairHeadline
          className="mt-10"
          scene
          bright="Thousands of service tickets. Zero structure."
          /* The muted line's entrance is opacity-only: it carries the
             thread's word anchor, and its box must never transform. */
          mutedFadeOnly
          muted={
            <>
              {/* data-thread-word: the Red Thread underlines this word —
                  chapter 03's one content gesture (geometry anchor) */}
              This is where I learned that the work starts in the{" "}
              <span data-thread-word>mess</span>.
            </>
          }
        />

        <div className="mt-16 space-y-14">
          {/* data-tm-scene (PREMIUM-FLOW #1): the field record reveals as
              a staggered TIMELINE — dateline → title → each observation in
              sequence — off one trigger, keyed a touch early (top 85%) so
              the first record settles as the eye arrives and the rest
              cascade just behind it. This is the "this is a timeline"
              signal the chapter was missing. */}
          <article
            data-tm-scene
            data-tm-start="clamp(top 85%)"
            className="border-ink/15 grid gap-6 border-t pt-8 md:grid-cols-[280px_minmax(0,1fr)] md:gap-12"
          >
            <div
              className="label-mono text-ink-secondary space-y-1"
              data-tm="block"
            >
              <p>{range}</p>
              <p>
                {miami.company} · {miami.location}
              </p>
            </div>
            <div>
              <h3
                className="font-display fraunces-display text-2xl"
                data-tm="block"
              >
                {miami.title}
              </h3>
              {/* Field records, not résumé bullets: each dated observation
                  in the paper's voice, closed by a mono receipt in the
                  #values claim→evidence grammar (fix round 4). */}
              <div className="mt-7 space-y-8">
                {PATH_FIELD_RECORDS.map((record) => (
                  <div key={record.dateline} data-tm="block">
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

          <article
            data-tm-scene
            data-tm-start="clamp(top 85%)"
            className="border-ink/15 grid gap-6 border-t pt-8 md:grid-cols-[280px_minmax(0,1fr)] md:gap-12"
          >
            <div
              className="label-mono text-ink-secondary space-y-1"
              data-tm="block"
            >
              <p>aug 2022 - may 2026</p>
            </div>
            <div data-tm="block">
              <h3 className="font-display fraunces-display text-2xl">
                B.S. {degree.field}
              </h3>
              {/* Biographical register, not a claim chip (evidence-rejudge
                  footnote-straggler ruling): the ×N grammar read as an
                  unlinked claim; prose + the transcript boundary keeps the
                  fact while exempting it from footnote 1's link contract. */}
              <p className="text-body mt-5 max-w-[55ch] font-serif">
                B.S. {degree.field}, {graduation} — dean’s list, spring & fall
                2025 — 3.65 GPA in major coursework (transcript on request).
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
      className="relative pt-[8vh] pb-[6vh]"
    >
      <ThreadSegment id={AUTOML.id} />
      <div className={WRAP}>
        <ChapterKicker
          id={AUTOML.id}
          label="the capstone — senior design expo — spring 2026"
        />

        {/* THE PINNED PLATE (lg+): data-pipeline-pin-wide is the pin
            target on two-column layouts, so the HELD viewport is the
            WHOLE flagship plate — thesis copy left, fig 4.0 + fig 4.1
            right — never a lone rail beside blank paper. (Pinning only
            the ladder stretched this grid row by the pin distance and
            left the prose column as ~1 viewport of empty page while the
            token scrubbed — the blank-paper report, fix round 3.) On
            stacked layouts the narrower [data-pipeline-pin] below pins
            instead; PipelineRun picks the target per breakpoint. */}
        <div
          data-pipeline-pin-wide
          className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20"
        >
          {/* data-tm-scene (PREMIUM-FLOW #1): the thesis column assembles
              as one beat — headline → body → gated-phases line → case-file
              link, staggered off a single trigger. */}
          <div data-tm-scene>
            <PairHeadline
              bright="The agent drafts the whole pipeline."
              muted="Nothing runs until a human says go."
            />
            <p
              className="text-body mt-12 max-w-[55ch] font-serif"
              data-tm="block"
            >
              Agentic AutoML turns a dataset and a goal into a structured,
              auditable ML workflow. The agents plan it and run it, then stop at
              the seventh phase and wait for a person.
            </p>
            {/* Honest stat strip — every clause is proof-manifest-backed */}
            <p
              className="label-mono border-ink/15 mt-9 inline-block border-t pt-3"
              data-tm="block"
            >
              7 phases · every one gated · langgraph + mcp orchestration
            </p>

            {/* THE RUNNING NOTE (CRITIC-LEDGER F03): the hold's payoff.
                Every note is stacked in ONE grid cell, so the block's
                height is reserved from first paint and the swap is pure
                opacity — no layout property is ever animated (D3), and
                nothing under the pin can reflow mid-hold. The last note
                is the resting frame: static worlds, and the motion world
                at the halt, both show the approval constraint, which is
                exactly what the halted token means (A7). */}
            {AUTOML_RUN_NOTES.length > 0 ? (
              <div className="mt-8" data-tm="block">
                <p className="label-mono text-ink-secondary">
                  what the run is held to — quoted from the case file
                </p>
                <div data-pipeline-notes className="mt-3 grid">
                  {AUTOML_RUN_NOTES.map((note) => (
                    <p
                      key={note.text}
                      data-pipeline-note={note.phase}
                      className="text-ink-secondary max-w-[46ch] font-serif text-[1.1875rem] leading-snug italic"
                    >
                      {note.text}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="mt-8" data-tm="block">
              <Link
                href="/projects/automl/"
                className="link-draw label-mono text-ink"
              >
                read the case file — {automl?.title} ⟶
              </Link>
            </p>
          </div>

          {/* data-tm-scene (PREMIUM-FLOW #1): the two figures — the phase
              ladder then the registry — settle in sequence as one beat
              (on lg beside the thesis column, on smaller screens below
              it), keyed off their own trigger so they land on the reading
              path rather than firing with the far-away headline.
              data-pipeline-pin: the STACKED-layout pin target — below lg
              the held beat is this whole rail (ladder + caption + the
              4.1 registry with its awaiting row), a full figure column
              rather than the ladder alone over blank paper. On lg the
              grid above ([data-pipeline-pin-wide]) pins instead. The
              wrapper still carries contain:paint (globals.css) — the
              scrubbed token, pulse, and registry all paint inside it. */}
          <div data-pipeline-pin data-tm-scene data-tm-start="clamp(top 85%)">
            {/* THE PINNED PIPELINE RUN (PREMIUM-FLOW ⭐#2, the flagship).
                The pin target is an ANCESTOR wrapper — never the figure
                the composed-scene reveal transforms ([data-tm='block'])
                — so the pin and the reveal never fight, and the
                pin-spacer grows chapter 04 INSIDE the Red Thread's
                measured region (the seam re-welds on the section resize;
                the thread spec stays green). PipelineRun scrubs an ink
                run-token down the ladder as the visitor scrolls the
                pinned range: each phase ink-settles as the token passes,
                an edge draws ahead, and at the human gate the token
                HALTS + pulses clay and HOLDS. It NEVER resolves 7.0
                deploy and NEVER approves run 041 — the halt is the
                payoff; approval stays the visitor's own press act (the
                registry row below + the ch07 stamp). pl-4 buys the
                rail-riding token + clay pulse room under the column's
                contain: paint. */}
            <div className="pl-4">
              <figure data-tm="block" data-pipeline-scope className="relative">
                <ul
                  data-pipeline-track
                  className="label-mono border-ink/15 space-y-3 border-l pl-6"
                >
                  {AUTOML_PHASES.map((phase, index) => {
                    const isDeploy = index === AUTOML_PHASES.length - 1;
                    return (
                      <li key={phase}>
                        {isDeploy ? (
                          <span
                            data-pipeline-gate
                            className="text-ink mb-3 flex items-center gap-2"
                          >
                            <span
                              aria-hidden="true"
                              className="bg-clay-graphic inline-block h-2 w-2"
                            />
                            the human gate — go / no-go
                          </span>
                        ) : null}
                        {/* Each phase's label ink-settles secondary→full as
                            the token passes ([data-pipeline-lit]); 7.0 deploy
                            is the GATED phase — it never lights on scroll,
                            because deploy is what a human authorises after
                            the gate, not what scrolling does. */}
                        <span
                          data-pipeline-phase={index}
                          data-pipeline-gated={isDeploy ? "" : undefined}
                          className="text-ink-secondary"
                        >
                          {index + 1}.0 {phase}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <figcaption className="label-mono text-ink-secondary mt-6 pl-6">
                  fig. 4.0 — the 7-phase gated lifecycle, abridged.
                </figcaption>
                <PipelineRun />
              </figure>
            </div>

            {/* Typeset registry excerpt in fig. 4.0's grammar (the real
                screenshot lives on the case-study page). Two-cell ledger
                rows: run/model left, status right. The metric column is
                withheld outright — a proof column must never dangle bare
                em-dashes — and the caption owns the redaction honestly.
                W1: the awaiting row is the press-to-approve control
                (RegistryRows) — the SAME run the gate stamp awaits. */}
            {/* pl-4 mirrors the pinned ladder's inset so the two ledgers'
                left rails stay aligned (the pin wrapper's padding buys the
                run-token its clay-pulse room under contain: paint). */}
            <figure className="mt-10 pl-4" data-tm="block">
              <ul className="label-mono border-ink/15 space-y-3 border-l pl-6">
                <RegistryRows rows={AUTOML_REGISTRY_ROWS} />
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

        {/* Seam tuned (CRITIC-LEDGER F07): the ¶04→¶05 hand-off stacked a
            10vh folio lead-in on a 12vh tail on a 7vh head — 29vh of
            pure padding, arriving on top of the pin's own tail. 6+6+5. */}
        <div className="mt-[6vh]">
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
      className="relative pt-[5vh] pb-[6vh]"
    >
      <ThreadSegment id={WORK.id} />
      <div className={WRAP}>
        <ChapterKicker id={WORK.id} label="the work — four more systems" />
        <h2 className="sr-only">The work</h2>

        <div className="mt-10">
          {WORK_ROWS.map((row, rowIndex) => {
            const project = getProjectById(row.projectId);
            if (!project) return null;
            const caseHref = `/projects/${project.id}/`;
            const study = getCaseStudyById(row.projectId);
            /* No case file yet (jetpack-compress): every act on the row
               goes to the real public surfaces instead — the title and
               primary act to the live engine, the metric chip to the
               pinned README the proof manifest cites. Never a 404. */
            const titleHref = study
              ? caseHref
              : (project.liveUrl ?? project.githubUrl ?? caseHref);
            const externalMetric = row.metricHref.startsWith("http");
            return (
              /* data-thread-row: the Red Thread ticks each row in the
                 binding margin as the line passes (geometry anchor) — the
                 box is MEASURED, never transformed, so motion lives on the
                 children only.
                 data-tm-scene (PREMIUM-FLOW #1): each row turns face-up as
                 one beat — title → tagline → consequence → metric chip —
                 off its own trigger (top 85%), so the three rows deal in
                 sequence as the thread's curl reaches each node.
                 THE ROW WRAPPER CONTRACT (living scenes): the ONE generic
                 scene mount (ProjectRowScene) renders last in the row —
                 a registered scene becomes the row's fig 5.n; projects
                 without one render exactly as before. Builders add scenes
                 via the registry (src/components/scenes/index.tsx) and
                 NEVER touch this wrapper again. */
              <article
                key={project.id}
                data-thread-row
                data-tm-scene
                data-tm-start="clamp(top 85%)"
                className="border-ink/15 grid gap-6 border-t py-12 md:grid-cols-[minmax(0,1fr)_280px] md:gap-12"
              >
                <div>
                  {/* One underline affordance per row: the title is still a
                      link (big target) but carries no underline — "the case
                      file ⟶" is the row's drawn affordance. The title
                      block-fades (it wraps a link, so it is never split —
                      fragmenting a link's text would hollow its
                      accessible name); the row's plan-3.10 pair takes the
                      chapter bright/muted grammar. */}
                  <h3
                    className="font-display fraunces-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight"
                    data-tm="block"
                  >
                    {study ? (
                      <Link href={titleHref}>{project.title}</Link>
                    ) : (
                      <a
                        href={titleHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {project.title}
                      </a>
                    )}
                    {/* The paper remembers (W1): a small ink ✓ once this
                        file has been opened — reserved width, decorative,
                        outside the link's accessible name. Only rows WITH
                        a case file can ever earn the mark. */}
                    {study ? <VisitedMark fileId={project.id} /> : null}
                  </h3>
                  {/* The row's bright line splits an aria-hidden inner
                      span (sr-only twin): aria-label is prohibited on
                      paragraph roles, so the <p> itself is never the
                      SplitText target. */}
                  <p className="mt-5 max-w-[34ch] font-serif text-[clamp(1.15rem,1.8vw,1.5rem)] leading-snug">
                    <span className="sr-only">{row.bright}</span>
                    <span
                      aria-hidden="true"
                      className="block"
                      data-tm-bright="lines"
                    >
                      {row.bright}
                    </span>
                  </p>
                  <p
                    className="text-ink-secondary mt-2 max-w-[38ch] font-serif text-[clamp(1.15rem,1.8vw,1.5rem)] leading-snug italic"
                    data-tm="muted"
                  >
                    {row.muted}
                  </p>
                </div>
                <div
                  className="label-mono text-ink-secondary flex flex-row flex-wrap items-baseline gap-x-8 gap-y-3 md:flex-col md:items-end md:justify-end md:text-right"
                  data-tm="block"
                >
                  {/* The metric chip keeps footnote 1's promise: it links
                      the case-file receipt row that argues it. normal-case
                      preserves data tokens (-O3); every metric string is
                      already lowercase in source. W5 hierarchy: capped at
                      two mono lines on every viewport — the ledger's
                      right rag stays quiet (visitor #4). */}
                  <p className="line-clamp-2 max-w-[38ch] normal-case">
                    {externalMetric ? (
                      <a
                        href={row.metricHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw"
                      >
                        {row.metric}
                      </a>
                    ) : (
                      <Link href={row.metricHref} className="link-draw">
                        {row.metric}
                      </Link>
                    )}
                  </p>
                  {/* W5 hierarchy (visitor #4): ONE primary act per row —
                      the case file at full ink (or, when no case file
                      exists, the live engine, honestly marked external);
                      source · demo fold into a single quiet secondary
                      line; the last-verified token stays (the recruiter's
                      differentiator) but dimmed, unlinked, on its own
                      line. Every href the row ever had is still in the
                      DOM. */}
                  <p>
                    {study ? (
                      <Link href={caseHref} className="link-draw text-ink">
                        the case file ⟶
                      </Link>
                    ) : project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw text-ink"
                      >
                        the live demo ↗
                      </a>
                    ) : null}
                  </p>
                  {project.githubUrl || (study && project.liveUrl) ? (
                    <p>
                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-draw"
                        >
                          source
                        </a>
                      ) : null}
                      {project.githubUrl && study && project.liveUrl
                        ? " · "
                        : null}
                      {study && project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-draw"
                        >
                          demo ↗
                        </a>
                      ) : null}
                    </p>
                  ) : null}
                  {/* The case file's own credibility token, echoed small
                      (recruiter-rejudge status-wording fix). Dimming is
                      the house mute — opacity on FULL ink (the dusk-
                      chapter pattern), which composites to ≥5:1 on the
                      golden-hour field; secondary ink at 0.7 would not. */}
                  {study ? (
                    <p className="text-ink font-mono text-[0.6875rem] tracking-[0.08em] opacity-70">
                      last verified {study.verified}
                    </p>
                  ) : null}
                </div>
                {/* The living scene (FABLE-VISUAL-BRIEF §B): the row's
                    figure, registry-driven — fig 5.n in chapter-figure
                    grammar. Rows without a registered scene render
                    nothing here, exactly as before. */}
                <ProjectRowScene
                  projectId={project.id}
                  figNo={`5.${rowIndex}`}
                />
              </article>
            );
          })}
        </div>

        <div className="border-ink/15 border-t pt-6" data-tm="block">
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
                  <VisitedMark fileId={id} />
                </li>
              );
            })}
          </ul>
        </div>

        {/* Seam tuned (CRITIC-LEDGER F62): the same 29vh stack sat at the
            ¶05→¶06 turn, so the reader's reward for finishing the work
            index was most of a screen of blank paper AT the dusk flip. */}
        <div className="mt-[6vh]">
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
  /* min-h tightened from svh (journey-critique viewport-sag fix): the
     litany's short content left a blank half-frame mid-chapter; at
     85svh the folio apparatus enters the frame with the figures. */
  return (
    <section
      id={VALUES.anchor}
      data-chapter={VALUES.id}
      className="relative flex min-h-[85svh] flex-col pt-[5vh] pb-[10vh]"
    >
      <ThreadSegment id={VALUES.id} />
      <div className={`${WRAP} flex min-h-0 flex-1 flex-col`}>
        <ChapterKicker id={VALUES.id} label="how i work — after dark" dusk />
        <h2 className="sr-only">How I work</h2>

        {/* Two figures share the nightfall spread: the litany carries the
            left, and fig 6.1 — a small ledger in fig 4.1's grammar —
            holds the right column so the chapter is composed edge to
            edge instead of left-hugging a void (fix round 4). 392px keeps
            every ledger row on one line beside its reviewer mark (W5:
            "refused" runs three characters longer than the old word).
            NOTE (PREMIUM-FLOW #1): ch06 is left UNWRAPPED on purpose — it
            is already the reference composed chapter. The litany performs
            its signature slowing cascade and the gates ledger follows it
            in (each fires at its own top 75%, the star leading); a scene
            wrapper here made the ledger pre-empt the litany, so the
            original coordinated timing is preserved untouched. */}
        <div className="my-auto grid gap-x-20 gap-y-14 py-10 lg:grid-cols-[minmax(0,1fr)_392px] lg:items-end">
          <figure>
            {/* The ending litany (plan 3.8): line-mask rises with a
                SLOWING stagger (TextMotion), each receipt fading in
                behind its mantra. Mantra leading is 1.05 and none of the
                three lines carries a descender glyph, so the overflow
                masks cannot clip. */}
            <ul className="space-y-[4.5vh] border-l border-current/20 pl-6 sm:pl-8">
              {VALUES_LINES.map((line) => (
                <li key={line.mantra}>
                  {/* The mask target is an aria-hidden inner span with an
                      sr-only twin (aria-label is prohibited on paragraph
                      roles); the axis voice + weight breathing live on
                      the <p>, which the split never touches. */}
                  <p
                    className={`font-display text-chapter leading-[1.05] ${
                      line.wonk ? "fraunces-wonk" : "fraunces-display"
                    }`}
                    data-breathe
                  >
                    <span className="sr-only">{line.mantra}</span>
                    <span aria-hidden="true" className="block" data-tm-mantra>
                      {line.mantra}
                    </span>
                  </p>
                  {/* Each receipt is a quiet mono link into the validation
                      ledger that proves it. normal-case: receipts carry
                      data tokens (-O3); source strings stay lowercase. */}
                  <p className="label-mono mt-2 opacity-70" data-tm-receipt>
                    <Link href={line.href} className="link-draw normal-case">
                      {line.receipt}
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
            <figcaption
              className="label-mono mt-[4.5vh] pl-6 opacity-70 sm:pl-8"
              data-tm="block"
            >
              fig. 6.0 — the litany, with receipts.
            </figcaption>
          </figure>

          <figure className="w-full max-w-[392px]" data-tm="block">
            <ul className="label-mono space-y-3 border-l border-current/20 pl-6">
              <li className="flex justify-between gap-x-3 opacity-60">
                <span>gate</span>
                <span className="text-right">disposition</span>
              </li>
              {VALUES_GATES.map((row) => (
                <li
                  key={row.gate}
                  className="flex justify-between gap-x-2 opacity-80"
                >
                  <span>{row.gate}</span>
                  <span className="inline-flex items-baseline gap-x-1 text-right whitespace-nowrap">
                    <GateMark status={row.status} />
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
            <figcaption className="label-mono mt-6 space-y-1 pl-6 opacity-70">
              <span className="block">fig. 6.1 — the gates, kept.</span>
              <span className="block">
                refused — the gate stopped the run · passed — human signed off
              </span>
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
      className="relative flex min-h-svh flex-col justify-center py-[14vh]"
    >
      <ThreadSegment id={GATE.id} />
      <div className={WRAP}>
        <ChapterKicker
          id={GATE.id}
          label="the approval gate — closing page"
          dusk
        />

        <div className="mt-10 grid items-center gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            {/* data-tm-scene (PREMIUM-FLOW #1): the finale's composed beat
                — closing pledge (line-mask) → its muted echo → the giant
                name — assembles off ONE shared trigger. ch07 is the bar
                the rest of the paper now meets. */}
            <div data-tm-scene>
              <div className="max-w-[28ch] font-serif text-[clamp(1.3rem,2.2vw,1.8rem)] leading-snug">
                {/* Bright line splits an aria-hidden inner span (sr-only
                  twin) — aria-label is prohibited on paragraph roles. */}
                <p>
                  <span className="sr-only">
                    Every pipeline I build ends with a human decision.
                  </span>
                  <span
                    aria-hidden="true"
                    className="block"
                    data-tm-bright="lines"
                  >
                    Every pipeline I build ends with a human decision.
                  </span>
                </p>
                <p className={`mt-2 italic ${muted}`} data-tm="muted">
                  This one ends with yours.
                </p>
              </div>

              {/* The terminal flourish rises unmasked (data-tm="name"): at
                leading 0.95 an overflow mask would clip the y descenders,
                so the giant name takes the hero's own fade + 14px rise
                instead — the entrance and the ending share one hand. */}
              <h2
                className="font-display fraunces-hero mt-8 text-[clamp(3rem,8vw,8.5rem)] leading-[0.95] font-normal tracking-[-0.015em]"
                data-tm="name"
              >
                Ayush Yadav
              </h2>
            </div>

            {/* Mobile seat: the stamp sits between the giant name and the
                email CTA (the lg+ world keeps it in the right column).
                The "on file:" manifest (W5 round B) sits under the seal
                on both seats — the reader's own trail, space reserved. */}
            <div className="mt-8 lg:hidden">
              <AwaitingStamp compact />
              <OnFileManifest fileIds={CASE_FILE_IDS} />
            </div>

            {/* Availability renders lowercase via .label-mono — the data
                file keeps its editorial case (transform in render only). */}
            <div
              className={`label-mono mt-8 space-y-2 ${muted}`}
              data-tm="block"
            >
              <p>availability — {personalInfo.availability}</p>
              {/* The live clock says so in words (F28): the ¶ kickers'
                  06:12→22:41 are the recorded day's datelines, and a
                  reader had no way to tell which of the two was fiction.
                  LocalTime renders nothing until it has a real time, so
                  the prerendered line is simply the place (F29/F49 — it
                  used to ship "—:—" to crawlers and first paint). */}
              <p>
                cincinnati, ohio
                <LocalTime />
              </p>
            </div>

            {/* The contact cluster sits with the plaintext address, INSIDE
                the gate's first viewport at 1440 (a screener must never
                scroll for LinkedIn or the address itself). */}
            <div
              className={`label-mono mt-5 flex flex-wrap gap-x-8 gap-y-2 ${muted}`}
              data-tm="block"
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

            {/* W1: once run 041 is approved (stamp or registry row) the
                CTA gains its quiet echo line — space reserved from first
                paint, and the mailto NEVER depends on approving. */}
            <div className="mt-10" data-tm="block">
              <ApprovedHello />
              <p>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="link-draw font-display text-[clamp(1.5rem,2.4vw,2.2rem)] italic"
                >
                  Email me — I read everything.
                </a>
              </p>
            </div>
          </div>

          <div className="hidden lg:block lg:justify-self-end">
            <AwaitingStamp />
            <OnFileManifest fileIds={CASE_FILE_IDS} />
          </div>
        </div>

        {/* References — the endnotes that keep footnote 1's promise in
            full: every receipt on the page, numbered, linked to its
            evidence. Compact mono rows over hairline rules; it sits in
            nightfall, so muting is opacity, never day tokens (A4). */}
        <div className="mt-[12vh] max-w-[44rem]" data-tm="block">
          <h2 className={`label-mono ${muted}`}>
            references — footnote 1, kept.
          </h2>
          <ol className="label-mono mt-4">
            {GATE_REFERENCES.map((reference, index) => (
              <li
                key={reference.href}
                className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t border-current/15 py-2.5"
              >
                {/* normal-case: claims quote data tokens (1M+, -O3) */}
                <span className={`normal-case ${muted}`}>
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
          {/* The master ledger: proofManifest rendered at /evidence */}
          <p className="label-mono mt-4 border-t border-current/15 pt-3">
            <Link href="/evidence/" className="link-draw">
              the evidence index — every claim on file ⟶
            </Link>
          </p>
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
      <TextMotion />
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
