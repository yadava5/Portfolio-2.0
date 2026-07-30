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
 *
 * The cursor-feel layer (FABLE brief §F1a) rides the same inert-hook
 * pattern: `data-tier-garnish="press|press-axis|wet|wet-line|tilt"` +
 * `.garnish-word` seats are styled ONLY inside `html[data-tier="full"]`
 * (the governor's earned tier — globals.css garnish rail), and
 * TextGarnish.tsx drives the one pointer-tracked piece (the gate
 * name's plate tilt) on an inner wrapper. Every other tier — core,
 * print, reduced motion, touch — renders these attributes as nothing.
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
import { proofManifest } from "@/lib/data/proofManifest";
import { getManagerTestimonial } from "@/lib/data/testimonials";
import {
  ChapterKicker,
  FolioRule,
  PairHeadline,
  mutedClass,
} from "@/components/story/apparatus";
import { CHAPTERS } from "@/components/story/chapters";
import { ChapterRail } from "@/components/story/ChapterRail";
import { TextMotion } from "@/components/story/TextMotion";
import { TextGarnish } from "@/components/story/TextGarnish";
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

/** The `jetpack-tests` proof-manifest entry's verification month — the
 *  source of the ¶05 jetpack row's `last verified` token (F39). Read
 *  from the manifest so the row can never claim a date the evidence
 *  ledger does not carry. */
const JETPACK_VERIFIED = proofManifest.find(
  (entry) => entry.id === "jetpack-tests"
)?.date;

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

/**
 * Seat index for the masthead's settle ripple (garnish rail §F1a): the
 * full-tier wet cascade travels `--garnish-i` × 50ms toward "real." —
 * the word being sworn to wets last, so the ripple lands ON the claim.
 * Inert everywhere the rail is dark (core/print/reduced/touch).
 *
 * @param index - Zero-based cascade seat
 * @returns Inline style carrying the custom property
 */
function garnishSeat(index: number): CSSProperties {
  return { "--garnish-i": index } as CSSProperties;
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
 *  case file remains reachable from /evidence.
 *
 *  TWO REGISTERS, one law (fix round 3, S3/S14) — the site has a serif
 *  PROSE voice and a lowercase-mono APPARATUS voice, and they spell
 *  things differently on purpose:
 *    · `bright` / `muted` are prose. Product names take their brand
 *      casing (Applied, Cadence, Glyph, jetpack-compress), sentences are
 *      sentence case, and a metric written out reads `macro-F1`.
 *    · `metric` is a CHIP — the apparatus voice. It is lowercase all the
 *      way down (`macro-f1`, `jdk 25`, `openmp+simd`), which is the
 *      register talking, not a second spelling of the term. Endnote
 *      claims (GATE_REFERENCES) and scene proof lines (scenes/manifest)
 *      are the same voice and stay lowercase with it.
 *  What is NOT register-dependent: the ratio glyph. Every "times" on the
 *  site is `×` (U+00D7) at the benchmark's own one-decimal precision —
 *  `3.5×` in the deck, the chip, /evidence, the case-file receipt, and
 *  the axis of the chart beside it (BENCHMARKS.md @ c6e5c0b writes
 *  "3.5× faster"; see docs/design-lab/one-times-sign.mjs). */
const WORK_ROWS: {
  projectId: string;
  bright: string;
  muted: string;
  metric: string;
  metricHref: string;
  /** Only for rows with no case file — see F39 */
  verifiedFallback?: string | null;
}[] = [
  {
    projectId: "jobtracker",
    bright: "Your inbox already knows where you applied.",
    /* 2026-07-26: the muted line read "…and the classifier runs in your
       browser." All three classifier layers DO run in a browser — in the
       Hugging Face Space, on the int8 ONNX export. But sitting under
       "Applied reads it", the sentence reads as a claim about what
       getapplied.vercel.app does, and there the hosted verdict is the
       rules layer alone (classifier/hybrid.py short-circuits on the
       serverless path; case-file receipt 09). The row now states what
       the product does end to end, which needs no asterisk. */
    muted: "Applied reads it — inbox in, a pipeline of real applications out.",
    metric: "macro-f1 0.98 — 96-sample gate",
    metricHref: "/projects/jobtracker/#v-jobtracker-5",
  },
  {
    projectId: "fast-mnist-nn",
    bright: "No frameworks. Just math, memory, and C++.",
    muted: "Then OpenMP and SIMD together made it 3.5× faster.",
    metric:
      "openmp+simd dot kernel — 3.5× vs -O3 baseline, committed benchmarks",
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
    /* The non-breaking space is deliberate (CRITIC-LEDGER F38): this
       chip right-aligns in the ¶05 rail, and `@ af2c4b1` used to break
       so the commit sha landed alone on its own line while every other
       chip set as one. The sha and its `@` now travel together. */
    metric: "72 tests, 0 failures — jdk 25 @ af2c4b1",
    metricHref:
      "https://github.com/yadava5/jetpack-compress/blob/af2c4b1/README.md",
    /* F39: no case file exists yet, so the row's `last verified` token
       comes from the SAME proof-manifest entry its metric chip cites —
       read from the manifest, never typed here. */
    verifiedFallback: JETPACK_VERIFIED,
  },
  {
    /* Fourth row (orchestrator ruling, 2026-07-24): Cadence promotes
       from the index below to a prime row (that index was headed "also
       on file" then; see FURTHER_READING_IDS). Pair lines are projects.ts's
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

/** The two case files ¶03 and ¶06 cite but ¶05 does not show (plan 2.2:
 *  demote, don't delete). Dedupe ruling 2026-07-24: a project may appear
 *  ONCE on the home paper — automl left (it IS the ch04 flagship above)
 *  and taskflow-calendar left (promoted to the fourth #work row).
 *
 *  Certification round, D6: both survivors are `portfolioVisible: false`
 *  — retired from recruiter-facing SHOWCASE lists (projects.ts) — and
 *  the heading over them read "also on file —", which is showcase
 *  grammar: two more projects, quieter. They are not that. They are the
 *  case files behind two claims this page already made in its own prose
 *  ("a million-plus service records" in ¶03; the 19/20 sweep in ¶03 and
 *  ¶06), which is exactly why the endnotes cite them and exactly what
 *  F22 meant by "an endnote is a receipt for a claim the page makes".
 *  The heading now says which of the two things this list is; the rows
 *  themselves are unchanged, and the files stay reachable. */
const FURTHER_READING_IDS = ["master-inventory", "policybot"];

/** ¶05's second index line (2026-07-26).
 *
 *  LifeQuest is `featured: true` in projects.ts and live at
 *  getlifequest.vercel.app, and it surfaced NOWHERE on this paper — no
 *  row, no mention, no case file. A page headed "selected work" that
 *  silently omits a live project is making a quiet claim about the set
 *  being complete, so the omission was the dishonest state.
 *
 *  The smallest honest fix is an index entry, not a scene and not a case
 *  file. There is nothing to argue in full yet: projects.ts calls it a
 *  concept and a working prototype, so the line says exactly that and
 *  links the running prototype rather than a page that would have to
 *  invent an argument for it. The gloss is projects.ts's own
 *  shortDescription — its head clause and its closing sentence, joined —
 *  so no claim is made here that the data layer does not already make.
 *
 *  It gets its own heading rather than joining "cited above, argued in
 *  full": those two entries are receipts for claims ¶03 and ¶06 print in
 *  their prose (F22). This one is not a receipt for anything. It is a
 *  project that exists, listed as what it is. */
const IN_PROGRESS_ENTRIES: { projectId: string; gloss: string }[] = [
  {
    projectId: "lifequest",
    gloss: "a social-good concept for job-seekers; a playable prototype",
  },
];

/** Ch-06 litany: each mantra carries a proof-manifest-backed receipt that
 *  links to the validation ledger of the case file that proves it. Every
 *  receipt is worded differently from its #work row on purpose — the
 *  same number should never read twice verbatim: the jobtracker line
 *  cites the case study's REAL backend suite (its 0.9791 macro-F1
 *  already carries the #work row). The litany's final line —
 *  "Make it honest." — takes the page's ONLY WONK=1 (plan 3.8): the
 *  quirk lands on the value he actually leads with.
 *  2026-07-26: 182 → 271. The Applied case file was re-pinned from
 *  3225eb4 to 36a2f54 and the suite was re-run at the new pin; this
 *  receipt reads the same row (#v-jobtracker-4) it always did, so the
 *  two must move together or the litany starts quoting a dead number. */
const VALUES_LINES = [
  {
    mantra: "Make it learn.",
    receipt: "271 backend tests — jobtracker validation ledger",
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
    receipt: "openmp+simd dot kernel — 3.5× over -O3, committed benchmarks",
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
/* `describedOnly` marks a reference whose destination row carries NO
   artifact — the honesty engine's own distinction, finally printed
   where the reader meets it.

   The fault it fixes: this list is the closing argument for the
   sentence the site's JSON-LD makes out loud — "every claim terminates
   at an artifact you can open." Six of these seven land on a GitHub
   blob at a pinned sha or a checked-in ledger row. The seventh, the
   1M+ operational records, lands on a receipt whose own data reads
   `artifacts: []`, `date: null`, `visibility: "local-only"`, and whose
   case file states in notClaiming: "role-scope work with no public
   artifact — verifiable in interview, not on this page."

   That was all true and all said — three clicks away. Here it was
   typographically IDENTICAL to its six honest neighbours: same
   `receipt NN`, same `⟶`, no mark. The biggest number on the page wore
   the strongest furniture and cashed out at nothing, on the one list
   whose whole job is that it never does that.

   Marked, not deleted (the errata rule): the claim is real role-scope
   work and stays. The reader now learns it is described-only BEFORE
   spending the click, in the site's existing visibility vocabulary. */
const GATE_REFERENCES: {
  claim: string;
  source: string;
  href: string;
  inPage?: boolean;
  describedOnly?: boolean;
}[] = [
  {
    claim: "macro-f1 0.9791, 96-sample gate",
    source: "jobtracker — receipt 05",
    href: "/projects/jobtracker/#v-jobtracker-5",
  },
  {
    claim: "3.5× — openmp+simd dot kernel vs -O3 baseline",
    source: "fast-mnist-nn — receipt 02",
    href: "/projects/fast-mnist-nn/#v-fast-mnist-nn-2",
  },
  /* CRITIC-LEDGER F22: reference 3 used to cite `visual-assist —
     receipt 01`. The link resolves, but projects.ts:213 marks that
     project `portfolioVisible: false` — "retired from recruiter-facing
     lists" — and after the hero stopped promoting it (F11) the project
     appeared NOWHERE else on this page. An endnote is a receipt for a
     claim the page makes; this one was a receipt for nothing.
     The two references below replace it with the two ¶05 rows the
     endnotes were missing, so footnote 1's promise now closes over
     every metric chip the page prints: Cadence's 1,145 tests and
     jetpack's 72. Both strings are the rows' own. */
  {
    claim: "1,145 automated tests — 634 frontend + 511 backend",
    source: "taskflow-calendar — receipt 01",
    href: "/projects/taskflow-calendar/#v-taskflow-calendar-1",
  },
  {
    claim: "72 tests, 0 failures on jdk 25",
    source: "jetpack-compress — readme @ af2c4b1",
    href: "https://github.com/yadava5/jetpack-compress/blob/af2c4b1/README.md",
  },
  {
    claim: "19/20 cited-source sweep",
    source: "policybot — receipt 01",
    href: "/projects/policybot/#v-policybot-1",
  },
  {
    claim: "1M+ operational records transformed",
    source: "master-inventory — described only",
    href: "/projects/master-inventory/#v-master-inventory-5",
    describedOnly: true,
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
          /* "printed" (the Seam): the masthead's running head is already
             on the page when it opens — the hero's CSS entrance is the
             arrival choreography here, and it must stay load-only. */
          arrive="printed"
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
          {/* CRITIC-LEDGER F64: this clamp used to be hand-rolled here
              (and re-declared its own leading/tracking) while the
              `--text-hero` token sat unused. Same rendered pixels — the
              token adopted these measured values — but the size now has
              exactly one source of truth. */}
          <h1
            aria-label="Scroll. It’s all real."
            className="font-display fraunces-hero text-hero"
          >
            {/* The masthead is the paper's dare: everything the scroll
                is about to show — figures, demos, approvals — is real,
                receipt-backed machinery, resolved when the visitor's own
                hand approves the run (¶07). The claim is *real*, and
                the footnote points straight at the evidence that earns
                it. Two beats: the imperative, then the payoff. */}
            {/* data-tier-garnish="press-axis" (garnish rail §F1a): the
                dare answers the hand — the site's ONE variable-axis
                hover. Under a full-tier cursor the glyphs press into the
                paper: wght +32, SOFT 50→78, a 1px settle, the ink bleed.
                Sanctioned exactly here because the word owns its block
                line: the axis reflow moves advances nothing else reads
                (the thread's measured line is the one BELOW). Inert
                outside html[data-tier="full"]. */}
            <span
              className="hero-enter hero-enter-headline block"
              style={heroDelay(0)}
              data-tier-garnish="press-axis"
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
                {/* data-tier-garnish="wet-line" (garnish rail §F1a): the
                    claim's ink re-wets under a full-tier cursor — the
                    entrance's own hero-ink-settle feather, re-summoned
                    by touch, cascading seat 0 → 1 → 2 so the wetting
                    lands ON "real." Paint-only (text-shadow on the
                    .garnish-word spans), so the [data-thread-name] box
                    outside never moves and the footnote ¹ keeps its own
                    ink. The spans are transparent to the accessible
                    name (the h1's aria-label owns it). */}
                <span
                  className="hero-enter hero-enter-headline hero-enter-inline"
                  style={heroDelay(2)}
                  data-tier-garnish="wet-line"
                >
                  {/* Fix round 3, S1: `It&apos;s` typed the ASCII
                      typewriter apostrophe (U+0027) into the largest
                      glyph run on the site — 100px of Fraunces, where a
                      vertical tick beside the curly quotes the rest of
                      the page sets (¶02 "I’ve", the dean’s list, every
                      case deck) is not a subtlety. U+2019 is the mark;
                      the aria-label above carries the same character so
                      the spoken name and the drawn name are one string. */}
                  <span className="garnish-word" style={garnishSeat(0)}>
                    It’s
                  </span>{" "}
                  <span className="garnish-word" style={garnishSeat(1)}>
                    all
                  </span>{" "}
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
                    <em
                      className="garnish-word font-serif italic"
                      style={garnishSeat(2)}
                    >
                      real.
                    </em>
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
          {/* data-tier-garnish="wet" (§F1a): the byline's one tasteful
              response — the whole line's ink freshens under a full-tier
              cursor, no cascade, no transform. Inert elsewhere. */}
          <p
            data-hero-standfirst
            data-tier-garnish="wet"
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
        {/* CRITIC-LEDGER F16 — THE PHONE GETS TWO AFFORDANCES, NOT SEVEN.
            Measured at 390 before this change: nine interactive elements
            inside ¶01, every one under the 44px bar, including three
            case-file names 16px apart on one 15px-tall line. The ledger's
            prescription is "below sm, collapse the hero to two
            affordances (the capstone, the resume) at 44px row height, and
            move the case-file index into ¶05 where it belongs".

            The index is ALREADY in ¶05 — all four work rows carry their
            own case-file link — so the hero's copy of it is a duplicate
            that costs a phone reader three sub-44px targets in the first
            frame. Below sm it goes, along with the three-link `in a
            hurry` run, and a single 44px resume row takes their place.
            Nothing is lost from the phone: the masthead already carries
            `the work` and a resume chip, and /evidence keeps its entries
            in ¶05's index line and the gate.

            At sm and up nothing changes at all — the desktop first frame
            is Wave 1's composition and is not this wave's to re-cut. */}
        <div className="label-mono hero-enter space-y-3" style={heroDelay(4)}>
          <p className="text-ink">
            <LenisAnchor
              href="#automl"
              className="link-draw inline-flex min-h-11 items-center sm:min-h-0"
            >
              the capstone — agentic automl: seven gated phases ⟶
            </LenisAnchor>
          </p>
          {/* Fix round 3, S6 — the escape hatch comes back to the phone,
              in the shape F16 allows.

              F16 removed the three-link `in a hurry` RUN from below `sm`
              and it was right to: three 15px targets 16px apart on one
              line is not an affordance, it is a dare. But the run
              carried the only first-frame route to /evidence, and
              deleting the run deleted the route — a phone reader who
              wanted the ledger had to scroll ¶05 or reach the gate,
              which is exactly the reader least likely to do either.

              So the hatch returns as a ROW, not a run: its own line, its
              own 44px box, 12px of `space-y-3` above and below it. Two
              phone affordances become three (capstone · evidence ·
              resume) against the nine F16 measured, and every one of
              them is a full target. The label is the ledger's own name,
              so it sets short: measured at 320 it holds one line inside
              the 272px column with room to spare — no wrap, no
              neighbour to crowd. */}
          <p className="text-ink-secondary sm:hidden">
            <Link
              href="/evidence/"
              className="link-draw inline-flex min-h-11 items-center"
            >
              the evidence index ⟶
            </Link>
          </p>
          {/* The phone's last affordance (F16). */}
          <p className="text-ink-secondary sm:hidden">
            <a
              href={personalInfo.resumeUrl}
              className="link-draw inline-flex min-h-11 items-center"
            >
              the resume ⟶
            </a>
          </p>
          {/* Quiet apparatus voice, no buttons: direct routes into the
              case files the #work chapter argues.
              CRITIC-LEDGER F11/F12: this line used to promote
              `jobtracker · fast-mnist · visual-assist` — two repository
              slugs the page never says again, and one project the data
              layer RETIRES (visual-assist, portfolioVisible: false). The
              first frame therefore advertised a trio that the paper does
              not argue, under names its own headings contradict.
              It now names the PRODUCTS, in the order ¶05 deals them:
              Applied · Glyph · Cadence — the three prime rows that have a
              case file to open (jetpack-compress has none, so it is not
              a "case file" and stays out of this line). The names are the
              same strings the ¶05 <h3>s and the case-file <h1>s carry, so
              one project now has exactly one public name on every surface;
              the slug survives only inside the href, where it belongs.
              `normal-case` on the links is the house pattern for proper
              nouns and data tokens inside apparatus voice.
              CRITIC-LEDGER F33/F65: this line (and the two below) used to
              override the enclosing .label-mono with an 11px/0.08em cut —
              the smallest type class on the page, on the two lines a
              screener is most likely to use. The overrides are gone; the
              lines inherit the 13px label token the design system says
              is the floor. */}
          <p className="text-ink-secondary hidden sm:block">
            case files:{" "}
            <Link
              href="/projects/jobtracker/"
              className="link-draw normal-case"
            >
              Applied
            </Link>{" "}
            ·{" "}
            <Link
              href="/projects/fast-mnist-nn/"
              className="link-draw normal-case"
            >
              Glyph
            </Link>{" "}
            ·{" "}
            <Link
              href="/projects/taskflow-calendar/"
              className="link-draw normal-case"
            >
              Cadence
            </Link>
          </p>
          {/* CRITIC-LEDGER F10: a `skip to the work ↓` affordance used to
              sit here pointing at #automl, 32px from the `in a hurry —
              the work` link that points at #work. Two links whose labels
              both read "the work", landing on different chapters, with
              the header nav's "the work" as a third reading. The skip
              function is not lost: the capstone directive above is the
              read-on path and the `in a hurry` line below is the screener
              path — both already say where they go. The scroll cue keeps
              its own quiet line. */}
          <p className="text-ink-secondary">scroll — the story starts here</p>
          {/* W5: the 90-second path — one quiet line for screeners who
              will not scroll 1,500vh (A8's spirit): the work index, the
              master ledger, the resume PDF. Apparatus voice, no new
              vocabulary — the same quiet mono as the case-files line. */}
          {/* CRITIC-LEDGER F41: these two `⟶` were SEPARATORS between
              three sibling links, not destination markers — the glyph
              doing punctuation's job. The paper already has a separator
              for a list of peers (·), and reserving `⟶` for "deeper
              into this argument" is what makes it mean anything when it
              does appear. */}
          <p className="text-ink-secondary hidden sm:block">
            in a hurry —{" "}
            <LenisAnchor href="#work" className="link-draw">
              the work
            </LenisAnchor>{" "}
            ·{" "}
            <Link href="/evidence/" className="link-draw">
              the evidence
            </Link>{" "}
            ·{" "}
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
        {/* "solo" (the Seam): the head takes its own once-trigger. The
            chapter's first scene is the bio grid a full manifesto below
            it — adopting the head there would hold the running head
            hostage to a trigger the reader meets much later. */}
        <ChapterKicker
          id={WHO.id}
          label="who — the short version"
          arrive="solo"
        />

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

            {/* F46, second half: `md:justify-between` pushed the n.b.
                note to the bottom of the column, ~130px clear of the
                dictionary entry it annotates, so the two apparatus
                blocks read as unrelated. They are one note stack now. */}
            <div className="flex flex-col gap-6">
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

              {/* CRITIC-LEDGER F46: this was the ONLY dashed container in
                  the day world — an orphan style whose one relative on
                  the whole site is the gate stamp, in clay, after dark.
                  A dashed box reads as "content missing" (the same
                  signifier F20 removed from the stamp), and it sat 130px
                  below the dictionary block it belongs with.
                  It is now a hairline rule and an indent — the apparatus
                  grammar every other note on the paper already uses (the
                  hero's footnote separator, the folio rules, the ¶05 row
                  rules) — and it sits directly under the entry it
                  annotates. F32: `text-xs` was also a 12px one-off; the
                  note takes the label token like every other aside. */}
              <aside
                className="label-mono text-ink-secondary border-ink/15 border-t pt-3 leading-6"
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
        {/* "lead" (the Seam): the head takes slot 0 of the headline
            pair's scene below — ¶03 arrives as one authored entrance. */}
        <ChapterKicker
          id={PATH.id}
          label="the path — field records"
          arrive="lead"
        />

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
              {/* Fix round 3, S13 — the en dash, matching the row 200px
                  above it (formatDateRange) and the case files. Three
                  date lines in one chapter had two grammars. */}
              <p>aug 2022 – may 2026</p>
            </div>
            <div data-tm="block">
              <h3 className="font-display fraunces-display text-2xl">
                B.S. {degree.field}
              </h3>
              {/* Biographical register, not a claim chip (evidence-rejudge
                  footnote-straggler ruling): prose keeps the fact while
                  exempting it from footnote 1's link contract. The GPA
                  and the named semesters are OWNER-CONFIRMED copy
                  (2026-07-24 directives: GPA once, semesters named) —
                  the stated boundary is the transcript, offered on
                  request. F53's ledger objection was reviewed and
                  overruled by the standing biographical ruling + the
                  owner's directive. Fall 2023 CONFIRMED 2026-07-25:
                  "Fall 2023 Dean's List" congratulations mail from
                  cca@miamioh.edu (2024-01-11) in the owner's Miami
                  inbox — all three personal.ts awards now print.

                  Certification round, N5: this line opened by repeating
                  the h3 above it verbatim — "B.S. Computer Science" set
                  twice, 20px apart, the second time as the run-in to its
                  own sentence. The heading names the degree, so the
                  prose starts at the first thing the heading does not
                  carry. The echo is all that left; every fact the line
                  stated, it still states, in the owner-confirmed
                  wording. */}
              {/* The spaces around the first em dash are an EXPRESSION,
                  not JSX text: with `{graduation}` promoted to the first
                  child, the transform trimmed the leading space off the
                  text node that followed it and the line rendered
                  "May 2026— dean’s list" (caught by atlas.spec's
                  identity contract, verified in the export). */}
              <p className="text-body mt-5 max-w-[55ch] font-serif">
                {graduation}
                {" — "}
                dean’s list, fall 2023 &amp; spring/fall 2025 — 3.65 GPA in
                major coursework (transcript on request).
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
        {/* "lead" (the Seam): the head opens the thesis column's scene —
            the flagship announces itself before the argument assembles. */}
        <ChapterKicker
          id={AUTOML.id}
          label="the capstone — senior design expo — spring 2026"
          arrive="lead"
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
        {/* The figure rail widens 340px → 400px (CRITIC-LEDGER F56): fig
            4.1 gains a third column (the redacted metric cell), and the
            340px rail could not hold it — after the ledger's own
            `border-l pl-6` the usable measure was 299px, while
            `039 · random forest` (165px) + the mark (29px) + `awaiting
            approval` (148px) + gaps needs ~358px. Every row wrapped.
            400px buys 359px of measure and the four rows rule up on one
            line each, with the mark and the status cell landing at the
            same x on every row.
            The cost, measured and accepted: the thesis column goes 592px
            → 552px at 1280+, so the ¶04 paragraph sets to a slightly
            narrower measure than its max-w-[55ch] (592px) allows. It
            still sets in three lines at every width ≥1280, and the
            trade buys the figure the reader is asked to ACT on an
            honest data column. */}
        <div
          data-pipeline-pin-wide
          className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-20"
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
                            className="text-ink mb-3 flex items-center"
                          >
                            {/* N8 (fix round 3) — the gate takes the number
                                column, unnumbered.

                                Every other row of fig. 4.0 sets as one mono
                                run, `N.0 phase`, so its label starts four
                                monospace characters in. The gate's clay
                                square + `gap-2` measured ~16px, which put
                                "the human gate" ~15px LEFT of "ingest",
                                "explore" and the five below it — a ragged
                                edge in the one figure whose whole subject
                                is an orderly sequence, and the row that
                                most needs to look deliberate.

                                It is not renumbered: the gate is not an
                                eighth phase, it is what stands BETWEEN 6.0
                                and 7.0, and giving it a number would make
                                the seven-phase claim false. It gets the
                                slot instead — the number column's own
                                width, with the clay square seated where
                                the digit would be. Empty on purpose, and
                                now visibly so.

                                `4ch + 0.2em`, not `4ch`: `.label-mono`
                                tracks at 0.05em, so four characters of
                                this row carry four tracking gaps the `ch`
                                unit knows nothing about. At a flat 4ch
                                the labels still sat 3px apart (measured);
                                with the tracking added they rule up. */}
                            <span
                              aria-hidden="true"
                              className="inline-flex w-[calc(4ch+0.2em)] shrink-0 items-center"
                            >
                              <span className="bg-clay-graphic inline-block h-2 w-2" />
                            </span>
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
              {/* CRITIC-LEDGER F56: the caption used to say metrics were
                  withheld while the table showed no column they could
                  have occupied. Now the column is drawn and redacted, so
                  the caption's job is to define the mark and give the
                  reason — both reasons are the automl case file's own
                  words: the repository is private, AND "a demo-data run
                  ledger with a complete metric trail has not shipped
                  yet". The second is why this figure does not print a
                  shaped f1: there may be no per-run number to withhold. */}
              <figcaption className="label-mono text-ink-secondary mt-6 space-y-1 pl-6">
                <span className="block">
                  fig. 4.1 — experiment registry, transcribed private-safe
                  excerpt.
                </span>
                <span className="block">
                  <span aria-hidden="true">▓▓▓</span> — not published: the
                  repository is private, and the demo-data metric trail has not
                  shipped. See the case file.
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
   05 · The Work — four editorial rows + the quiet index
   (CRITIC-LEDGER F60: this said "three". Cadence made it four two
   commits before the ledger was written, and the comment did not
   notice — the exact failure mode of a comment layer that out-writes
   the content layer.)
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
        {/* "lead" (the Seam): the head opens the first work row's scene,
            so the index's first deal and its running head are one beat. */}
        <ChapterKicker
          id={WORK.id}
          label="the work — four more systems"
          arrive="lead"
        />
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
            /* F39: the case file's verified month, or — for a row with
               no case file — the proof-manifest entry its metric chip
               already cites. Never a literal in this component. */
            const verified = study?.verified ?? row.verifiedFallback;
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
                    {/* data-tier-garnish="press" (§F1a): the title takes
                        the full-tier letterpress press (1px settle + ink
                        bleed, :focus-visible included — link parity with
                        link-draw). It rides the ANCHOR, not the h3: the
                        h3 is a data-tm block whose entrance leaves an
                        inline transform, and the thread only measures
                        the [data-thread-row] article, which an inner
                        transform never moves. Inert outside Full. */}
                    {study ? (
                      <Link href={titleHref} data-tier-garnish="press">
                        {project.title}
                      </Link>
                    ) : (
                      /* Fix round 3, S7: a row with no case file sends its
                         TITLE off-site (jetpack-compress → the live
                         engine), and the biggest link in ¶05 was the one
                         external link on the page wearing no `↗`. The
                         glyph is cut to 0.42em and raised so it reads as
                         the apparatus mark it is rather than a second
                         headline glyph — inside the anchor, so it is part
                         of the accessible name like every other one. */
                      <a
                        href={titleHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-tier-garnish="press"
                      >
                        {project.title}
                        <span className="align-super text-[0.42em] tracking-normal">
                          {" "}
                          ↗
                        </span>
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
                      already lowercase in source.
                      CRITIC-LEDGER F38: `line-clamp-2` is gone. It was a
                      SILENT truncation — any chip that grew past two mono
                      lines would have lost its tail with no indication,
                      on the one element that carries the row's number.
                      The column is capped instead (max-w-[38ch]), so a
                      long chip wraps honestly rather than disappearing. */}
                  <p className="max-w-[38ch] normal-case">
                    {/* Fix round 3, S7: an EXTERNAL metric chip terminates
                        at a README on GitHub, not at a receipt on this
                        site — the `↗` says which, and only the external
                        branch gets it. */}
                    {/* Lifted with the rest of the rail (fix round 6):
                        the chip carries the row's NUMBER and links the
                        receipt that argues it — the one target in this
                        column a screener reaches for first, and it was
                        15px tall on a phone. */}
                    {externalMetric ? (
                      <a
                        href={row.metricHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw tap-target-block"
                      >
                        {row.metric} ↗
                      </a>
                    ) : (
                      <Link
                        href={row.metricHref}
                        className="link-draw tap-target-block"
                      >
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
                  {/* D7 / fix round 6 — the 44px bar reaches ¶05.
                      Certification round D7 lifted every masthead
                      affordance to a 44px border box; S6 gave the hero's
                      phone affordances their own 44px rows. This rail —
                      the primary act of each work row, 8,000px further
                      into the read, where the reader is MORE committed —
                      was still handing a phone 15px-tall targets
                      (measured at 390: `the case file ⟶` 136×15, `the
                      live demo ↗` 130×15, `source ↗` 69×15, `system card
                      ↗` 113×15).

                      Header.tsx's technique, unchanged: the padding
                      grows the anchor's own border box and an equal
                      negative margin hands the growth straight back, so
                      the box a finger lands on and the box a census
                      reports are both 44 while the box that LAYS OUT the
                      rail is exactly what it was. These anchors are
                      inline inside their `<p>`, so block padding never
                      enters the line box and block margins do not apply
                      at all — the rail's rhythm is untouched at every
                      width. `.link-draw` already resolves its underline
                      against the CONTENT box (globals.css), so the drawn
                      ink stays welded to the baseline.

                      The stack's arithmetic, because a 44px box in a
                      31px-pitch stack necessarily meets its neighbour:
                      hit-testing resolves to the LAST painted box, and
                      these are in DOM order top→bottom, so the shared
                      band always belongs to the LOWER link. Each link's
                      EXCLUSIVE band is therefore one full pitch (31px at
                      390 — itself over the 24px WCAG 2.5.8 AA floor) and
                      it begins 15px ABOVE that link's own first glyph:
                      the upper link's visible text sits entirely inside
                      its own exclusive band, so no reader tapping ON a
                      link can reach the one below it. The bottom
                      affordance of each stack gets the full unshared 44
                      — there is 290px of paper under it. */}
                  {/* N21 (fix round 7) — the link says WHICH file.
                      Three rows printed the identical string
                      `the case file ⟶` at three different case files,
                      and two printed `system card ↗` at two different
                      products. In context that passes WCAG 2.4.4; read
                      as a link LIST — the rotor, the tab ring, a
                      screener skimming the affordances rather than the
                      prose — it fails 2.4.9, because the text alone
                      names no destination.

                      The cure is already printed on this page: ¶07's
                      reference list sets `automl — the case file ⟶`.
                      The row borrows that form rather than inventing
                      one. No sr-only twin: 2.4.9 is about the VISIBLE
                      text, so a hidden suffix would only move the
                      failure somewhere a sighted keyboard reader still
                      meets it.

                      `.label-mono` lowercases the rail, so the title
                      arrives in the apparatus voice (`applied — the
                      case file ⟶`) without a second type colour or a
                      `normal-case` exception. Measured at 390 before
                      choosing: the rail's own line box is 342px and
                      the longest of the three sets 227px on ONE line —
                      the row keeps its shape, and the 44px target the
                      D7 pass built stays exactly 44. */}
                  <p>
                    {study ? (
                      <Link
                        href={caseHref}
                        className="link-draw tap-target-block text-ink"
                      >
                        {project.title} — the case file ⟶
                      </Link>
                    ) : project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw tap-target-block text-ink"
                      >
                        the live demo ↗
                      </a>
                    ) : null}
                  </p>
                  {/* CRITIC-LEDGER F40: the same `the case file ⟶ /
                      source / demo ↗` triplet repeated verbatim on every
                      row — three identical clusters inside 3,027px, with
                      `source` and `demo ↗` rendering 52×15px and 8px
                      apart on a phone. One primary act per row now: the
                      secondary line only survives where the row has NO
                      case file to fold it into (jetpack-compress), and
                      there it carries `source` alone, because the repo
                      is otherwise unreachable from this page. Nothing is
                      lost for the other rows: the case file's own ledger
                      already prints `repo … @ sha` and `live demo ↗`
                      (CaseStudyPage LedgerRows). */}
                  {!study && project.githubUrl ? (
                    <p>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw tap-target-block"
                      >
                        {/* Fix round 3, S7 — `source` is a repository on
                            GitHub; it wears the leaving mark like its
                            neighbours `the live demo ↗` and
                            `system card ↗`, which it sat between. */}
                        source ↗
                      </a>
                    </p>
                  ) : null}
                  {/* The system card (2026-07-26) — the app's own hosted
                      documentation, on the SAME condition as `source`
                      above, and for the same reason F40 gave. A row with
                      a case file folds its terminals into that file, and
                      the case file's meta ledger now prints
                      `system card ↗` itself; a row without one
                      (jetpack-compress) has nowhere to fold, so the link
                      lives here or nowhere. Three rows are untouched:
                      this cluster does not grow on the page where F40
                      found three identical clusters inside 3,027px. */}
                  {!study && project.systemCardUrl ? (
                    <p>
                      <a
                        href={project.systemCardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw tap-target-block"
                      >
                        {/* N21: which product's card. The system card
                            takes a plain noun phrase rather than the
                            case file's em-dash form — this string also
                            has to work inside the "also live" index
                            line below, whose em-dash is already spent
                            parting a project from its gloss, and one
                            phrase printed two ways is the ambiguity
                            N21 was raised about. */}
                        {project.title} system card ↗
                      </a>
                    </p>
                  ) : null}
                  {/* The case file's own credibility token, echoed small
                      (recruiter-rejudge status-wording fix). Dimming is
                      the house mute — opacity on FULL ink (the dusk-
                      chapter pattern), which composites to ≥5:1 on the
                      golden-hour field; secondary ink at 0.7 would not.
                      CRITIC-LEDGER F33/F65: the 11px override is gone —
                      the token inherits from the column's .label-mono, so
                      the whole right rail is now one type size.
                      CRITIC-LEDGER F39: this token used to render on
                      three rows of four — the one row without a case
                      file (jetpack-compress) simply dropped it, so the
                      ledger's right rag went 5 lines / 5 / 3 / 5 and the
                      row that left the site was the one missing its
                      verification date. The fallback is NOT invented: it
                      is the `jetpack-tests` proof-manifest entry's own
                      `date`, the same field, the same month, read at
                      module scope so it can never drift from the ledger
                      that owns it. Every row now closes the same way. */}
                  {verified ? (
                    <p className="text-ink opacity-70">
                      last verified {verified}
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
          <p className="label-mono text-ink-secondary">
            cited above, argued in full —
          </p>
          {/* N12 (fix round 3) — the missing `·`.
              This index printed its peers on whitespace alone
              ("master inventory pipeline    policybot"), while every
              other peer list on the paper carries the middot: the hero's
              `Applied · Glyph · Cadence`, the ¶05 scene provenance
              lines, the gate's contact cluster, the /evidence record
              head, and the "also live" line 40px below this one. Two
              underlined links parted by a gap read as one wrapped title
              at a glance; the dot is what says "these are two things".
              The separator is aria-hidden — it is punctuation between
              list items, and a screen reader already hears them as
              separate `li`s. The gap tightens to 3 because the dot is
              now doing the parting. */}
          <ul className="label-mono mt-3 flex flex-wrap gap-x-3 gap-y-2">
            {FURTHER_READING_IDS.map((id) => getProjectById(id))
              .filter((project) => project !== undefined)
              .map((project, index, shown) => (
                <li key={project.id}>
                  <Link href={`/projects/${project.id}/`} className="link-draw">
                    {project.title}
                  </Link>
                  <VisitedMark fileId={project.id} />
                  {index < shown.length - 1 ? (
                    <span aria-hidden="true"> ·</span>
                  ) : null}
                </li>
              ))}
          </ul>

          {/* See IN_PROGRESS_ENTRIES. External link on purpose: there is
              no /projects/lifequest/ route — only case files get one —
              and a link to the running prototype is the honest terminal
              for a project whose whole claim is that it runs. */}
          <p className="label-mono text-ink-secondary mt-8">
            also live, without a case file —
          </p>
          <ul className="label-mono mt-3 flex flex-wrap gap-x-8 gap-y-2">
            {IN_PROGRESS_ENTRIES.map(({ projectId, gloss }) => {
              const project = getProjectById(projectId);
              if (!project?.liveUrl) return null;
              return (
                <li key={projectId}>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw"
                  >
                    {project.title} ↗
                  </a>
                  <span> — {gloss}</span>
                  {/* Its documentation, on the one line it has (2026-07-26).
                      LifeQuest has no case file to carry a link rail, so
                      the index line is the only place on this site the
                      card can be reached. The gloss sits BETWEEN the two
                      links on purpose — 55 characters of prose is the
                      separation that keeps two 15px targets from setting
                      8px apart on a phone (F40's actual complaint), and
                      at 390 the line wraps between them anyway. */}
                  {project.systemCardUrl ? (
                    <>
                      <span> · </span>
                      <a
                        href={project.systemCardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw"
                      >
                        {/* N21, the second of the pair. Adding the
                            product name repeats a word already on this
                            line — and that is the point: the line reads
                            fine either way, the LINK only reads as one
                            thing with it. */}
                        {project.title} system card ↗
                      </a>
                    </>
                  ) : null}
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
        {/* "solo" (the Seam): ch06 is deliberately UNWRAPPED — the
            litany's slowing cascade and the gates ledger keep their own
            coordinated triggers (see the scene note below), so the head
            arrives on its own cue just ahead of them. */}
        <ChapterKicker
          id={VALUES.id}
          label="how i work — after dark"
          dusk
          arrive="solo"
        />
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
        {/* CRITIC-LEDGER F17: `lg:items-end` bottom-aligned fig 6.1 into
            the corner of a 1250px frame — the gates ledger began at
            y≈733 and the entire upper-right quadrant (x 1230→1770,
            y 90→700) was empty paper. The chapter read as left-hugging
            with a figure dropped in the corner, which is the exact
            composition problem the old code comment claimed to have
            fixed. Top-aligning sets the ledger's first row against the
            first mantra, so the two figures start on the same line and
            the spread is composed edge to edge. */}
        <div className="my-auto grid gap-x-20 gap-y-14 py-10 lg:grid-cols-[minmax(0,1fr)_392px] lg:items-start">
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
              {/* Fix round 3, S11 — the key sits at the HEAD, where it is
                  read before it is needed. Two of the three rows say
                  "refused", and the sentence that makes that a virtue —
                  the gate did its job — sat in the figcaption BELOW the
                  ledger. A reader meeting "◼ refused · ◼ refused" first
                  reads a scoreboard with two losses on it, and only
                  afterwards learns the word means the machinery stopped
                  the run as designed. Nothing is softened: the rows still
                  say refused, twice, in the same ink. The definition just
                  arrives first. Its other half ("passed — human signed
                  off") stays in the caption; the word `passed` was never
                  the one at risk of being misread. */}
              <li className="opacity-60">
                <span className="flex justify-between gap-x-3">
                  <span>gate</span>
                  <span className="text-right">disposition</span>
                </span>
                <span className="mt-1 block text-right">
                  refused — the gate stopped the run
                </span>
              </li>
              {VALUES_GATES.map((row) => (
                <li
                  key={row.gate}
                  className="flex justify-between gap-x-2 opacity-80"
                >
                  <span>{row.gate}</span>
                  {/* CRITIC-LEDGER F44: `gap-x-1` is 4px, and the check
                      stroke's bounding box already fills its own width,
                      so fig 6.1 rendered `✓passed` with the glyph
                      touching the word. gap-x-2 puts a real space
                      between the mark and what it marks. */}
                  <span className="inline-flex items-baseline gap-x-2 text-right whitespace-nowrap">
                    <GateMark status={row.status} />
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
            <figcaption className="label-mono mt-6 space-y-1 pl-6 opacity-70">
              <span className="block">fig. 6.1 — the gates, kept.</span>
              <span className="block">passed — human signed off</span>
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
  /* CRITIC-LEDGER F58 — see the block below the endnotes. */
  const managerReference = getManagerTestimonial();

  return (
    /* CRITIC-LEDGER F08: py-[14vh] is 118px of empty brown at each end
       of the closing page on an 844-tall phone — measured from the 06/07
       folio rule to the ¶07 kicker, 52% of the viewport carried nothing.
       The desktop composition earns that air (the gate is a spread); a
       phone does not, so the padding is a mobile-first 6vh that opens
       back up at lg. */
    <section
      id={GATE.anchor}
      data-chapter={GATE.id}
      className="relative flex min-h-svh flex-col justify-center py-[6vh] lg:py-[14vh]"
    >
      <ThreadSegment id={GATE.id} />
      <div className={WRAP}>
        {/* "lead" (the Seam): the head opens the finale's composed beat —
            pledge → echo → the giant name follow it off one trigger. */}
        <ChapterKicker
          id={GATE.id}
          label="the approval gate — closing page"
          dusk
          arrive="lead"
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
              {/* CRITIC-LEDGER F64: the reprise's clamp was the second
                  hand-rolled "hero" scale (8vw / 8.5rem cap vs the
                  masthead's 9 / 9rem). It is a deliberately quieter cut,
                  so it now consumes its own declared token instead of
                  disagreeing with the masthead anonymously. */}
              {/* data-tier-garnish="tilt" (§F1a): under a full-tier
                  cursor the name is a printing plate under the hand —
                  TextGarnish drives rotateX/Y + a hair of press on the
                  INNER [data-garnish-plate] span (the h2 belongs to the
                  data-tm="name" entrance; two writers never share one
                  transform), with the rail's perspective + ink-wet on
                  hover. The block span reproduces the raw-text layout
                  exactly, so every other tier renders byte-identical. */}
              <h2
                className="font-display fraunces-hero text-hero-reprise mt-8"
                data-tm="name"
                data-tier-garnish="tilt"
              >
                <span data-garnish-plate className="block">
                  Ayush Yadav
                </span>
              </h2>
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
              {/* Fix round 3, S7: `↗` means "this leaves the site" (F41's
                  glyph contract), and it was the ONE rule the contact
                  cluster broke — `github` and `linkedin` opened new tabs
                  with nothing saying so, sitting two words from `resume`
                  and the mailto, which do not. The glyph rides inside the
                  link text, as it does on every other external link on
                  the site, so it is in the accessible name too. */}
              {github ? (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw"
                >
                  github ↗
                </a>
              ) : null}
              {linkedIn ? (
                <a
                  href={linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw"
                >
                  linkedin ↗
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

            {/* Mobile seat for the stamp (the lg+ world keeps it in the
                right column). The "on file:" manifest (W5 round B) sits
                under the seal on both seats — the reader's own trail,
                space reserved.
                CRITIC-LEDGER F08: this block used to sit between the
                giant name and the availability line, where its plate
                pushed `availability` to the fold edge and the email
                address off the phone screen entirely. The order now puts
                every contact affordance ABOVE the seal — a screener
                reaches the address without scrolling past a graphic —
                and the act the page asks for closes the column, which is
                also where it reads best. This is what buys the stamp its
                F67 size increase: it can be full-scale down here without
                costing the reader anything. */}
            <div className="mt-10 lg:hidden">
              <AwaitingStamp compact />
              <OnFileManifest fileIds={CASE_FILE_IDS} />
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
        {/* CRITIC-LEDGER F19: the references block was capped at 44rem
            inside a 1240px column, so it ended at x≈950 of 1770 and left
            ~700px of dead right margin under the most important content
            on the page. The cap is gone and the list sets in TWO columns
            at lg — the ledger's own fix, and the form a printed
            endnote apparatus actually takes. `break-inside: avoid` keeps
            a reference and its source on the same line of the same
            column. */}
        <div className="mt-[12vh]" data-tm="block">
          <h2 className={`label-mono ${muted}`}>
            references — footnote 1, kept.
          </h2>
          <ol className="label-mono mt-4 lg:columns-2 lg:gap-x-16 [&>li]:break-inside-avoid">
            {GATE_REFERENCES.map((reference, index) => (
              <li
                key={reference.href}
                className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t border-current/15 py-2.5"
              >
                {/* normal-case: claims quote data tokens (1M+, -O3).
                    The described-only mark rides INSIDE this span on
                    purpose: the row is the `flex-wrap` +
                    `justify-between` construct whose lone-wrapped-item
                    seating N19 repaired with `folio-seat`, and a third
                    flex child would re-open exactly that fault. As part
                    of the claim it also reads in the right order — the
                    reader learns the receipt is described-only while
                    still reading the claim, not after following it. */}
                <span className={`normal-case ${muted}`}>
                  {index + 1}. {reference.claim}
                  {/* NOT `whitespace-nowrap` — measured. Holding this
                      28-character mark on one line makes it an
                      unbreakable run, which becomes the span's
                      min-content contribution and blows the page out
                      horizontally: scrollWidth 392 against a 320
                      viewport (+72) and against 390 (+2), failing
                      atlas.spec's mobile-overflow assertions and the
                      dossier thread-gutter check in both chromium and
                      firefox. It is the same trap globals.css already
                      records — an unbreakable run does not reduce
                      min-content, so the flex item refuses to shrink.
                      The mark wraps with the claim it qualifies, which
                      is where it belongs anyway. */}
                  {reference.describedOnly ? (
                    <span> [local — verified on request]</span>
                  ) : null}
                </span>
                {/* N19 (fix round 7) — `folio-seat` is THE ORPHANED
                    FOLIO's cure, named and explained once in
                    globals.css. This row is the same `flex-wrap` +
                    `justify-between` construct fix round 6 diagnosed on
                    the ¶ kicker and the case file's status word, and it
                    was never swept for elsewhere: `justify-between`
                    seats a lone wrapped item at flex-START, so every
                    reference whose claim and receipt could not share a
                    line printed its receipt flush LEFT.

                    Measured on the closing page of the paper, swept
                    640 → 1920 in 40px steps (probe-fix7.mjs): MIXED at
                    26 of the 33 widths — at 1440 six of the seven rows
                    dropped their receipt to a second line flush left
                    while row 5, whose claim happened to be short
                    enough, kept its receipt on line 1 flush right. One
                    row out of alignment with six, at the reference
                    desktop width, under the heading that promises
                    footnote 1 is kept.

                    Paint-neutral where the two halves already shared a
                    line: an auto inline-start margin resolves before
                    `justify-content` and lands the receipt in the
                    identical seat. Re-swept after: uniform at all 33.

                    CRITIC-LEDGER F41: the glyph is load-bearing. `⟶`
                    means "deeper into this argument" (an in-page anchor
                    or a case file); `↗` means "leaves the site". A
                    reference that terminates at a public repo is the
                    second kind, and says so. */}
                {reference.inPage ? (
                  <LenisAnchor
                    href={reference.href}
                    className="link-draw folio-seat"
                  >
                    {reference.source} ⟶
                  </LenisAnchor>
                ) : reference.href.startsWith("http") ? (
                  <a
                    href={reference.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw folio-seat normal-case"
                  >
                    {reference.source} ↗
                  </a>
                ) : (
                  <Link href={reference.href} className="link-draw folio-seat">
                    {reference.source} ⟶
                  </Link>
                )}
              </li>
            ))}
          </ol>
          {/* CRITIC-LEDGER F58 — the reference that was on file and
              never on the page.

              src/lib/data/testimonials.ts held a ~180-word
              recommendation from the author's actual manager, with a
              LinkedIn URL, and had zero importers: on a site arguing
              that every claim should terminate at an artifact outside
              itself, the only third-party artifact in the repository
              was the one thing it did not show.

              It lands HERE, under a heading that already says
              "references", because that is the word a hiring reader
              means by it — the endnotes above are references to
              evidence, and this is a reference to a person. Same
              apparatus, one register warmer: the passage sets in the
              chapter's serif so it reads as someone else's voice, not
              the site's; everything around it stays in the mono hand.

              Honesty conditions, all four visible on the page: the
              passage is a contiguous verbatim excerpt (module-scope
              gate in testimonials.ts), it is DISCLOSED as an excerpt
              with the full text's location, the person is named with
              their own title, and the link goes to them rather than to
              a screenshot of them. One reference, not two — see the
              note on the second entry in testimonials.ts. */}
          {managerReference ? (
            <div className="mt-[8vh]" data-tm="block">
              <h2 className={`label-mono ${muted}`}>
                on file — references, the other kind.
              </h2>
              {/* Deliberately NOT a <figure>/<figcaption>: the print
                  tier draws its monograph outline around every
                  captioned figure in a chapter (globals.css
                  html[data-tier="print"]), and at outline-offset 14px
                  that rule boxed the quotation and struck through the
                  disclosure line under it. A blockquote with the
                  attribution as a following sibling is the other
                  pattern the HTML spec names for exactly this, and it
                  keeps the two worlds identical (A7). */}
              <div className="mt-4 border-t border-current/15 pt-4">
                {/* N18 (fix round 3): the one passage on this site
                    written by somebody else set WITHOUT quotation marks,
                    while fig 5.3 — an illustrative sentence the author
                    made up — sets its own words inside “ ”. That is the
                    marking backwards. The quotes are added in the markup,
                    never in the data: `testimonials.ts` runs a
                    module-scope gate asserting the excerpt is a
                    contiguous verbatim substring of the quote, and a
                    curly quote inside the string would be an edit to
                    someone else's sentence. The leading ellipsis stays —
                    the passage opens mid-letter — and the closing one
                    joins it, because it closes mid-letter too. */}
                <blockquote className="max-w-[54ch] font-serif text-[1.0625rem] leading-7">
                  <p>
                    &ldquo;&hellip;
                    {managerReference.excerpt ?? managerReference.quote}
                    &hellip;&rdquo;
                  </p>
                </blockquote>
                <p className="label-mono mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
                  {/* normal-case: a person's name and their own title
                      are data — the mono voice may lowercase the site's
                      words, never someone else's name. */}
                  <span className="normal-case">
                    {managerReference.linkedInUrl ? (
                      <a
                        href={managerReference.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw"
                      >
                        {managerReference.name} ↗
                      </a>
                    ) : (
                      managerReference.name
                    )}
                    {" — "}
                    <span className={muted}>{managerReference.title}</span>
                  </span>
                  {/* N19, second instance in this file (fix round 7).
                      Same construct, same fault: the standing-and-date
                      half is the FOLIO of this attribution line — it is
                      the provenance of somebody else's sentence — and
                      it wrapped flush LEFT at 8 of the 12 swept widths
                      (640, 768, 900, 1024, 1160, 1280, 1440, 1920),
                      which is every width at and above the one the
                      reference desktop uses. `folio-seat` (globals.css)
                      is the same cure, and moves nothing at the four
                      widths that were already right. */}
                  <span className={`folio-seat ${muted}`}>
                    {managerReference.standing ?? managerReference.relationship}{" "}
                    · recorded {managerReference.date}
                  </span>
                </p>
              </div>
              <p className={`label-mono mt-3 ${muted}`}>
                excerpted, not edited — the full recommendation is on the
                linkedin profile in the colophon.
              </p>
            </div>
          ) : null}

          {/* The master ledger: proofManifest rendered at /evidence */}
          <p className="label-mono mt-[8vh] border-t border-current/15 pt-3">
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
      <TextGarnish />
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
