/**
 * @fileoverview PROBE ROUTE — the HELD apparatus, under test.
 *
 * NOT A PAGE OF THE SITE. `page.probe.tsx` is only a route when
 * `NEXT_PUBLIC_TEST_PROBES=1` puts `probe.tsx` in `pageExtensions`
 * (next.config.ts); in a normal build this file is an unimported module
 * and `/probe/held/` does not exist to be exported. `check-probe-routes.mjs`
 * asserts that from `out/` rather than from the config.
 *
 * WHY IT EXISTS. The HELD apparatus is the honesty engine's visible
 * mechanism for "this number is stated but not yet earned": the
 * reserved dashed-clay stamp, the Newsreader footnote naming the
 * release condition, the pointer into the corrections register, and
 * `receiptAuditState`'s `held` branch that keeps such a row marked with
 * an ink dash instead of the stamp-rust tick.
 *
 * On 2026-07-30 Glyph's `~97%` accuracy claim was earned by a committed
 * eval run, the stamp came off, and the site's LAST held row went with
 * it. Measured, not assumed — `grep -rn "held:" src/lib/data/` returns
 * three hits, none of them a live entry: a string quoted inside an
 * erratum, a counter's type, and that counter initialised to 0. So the
 * whole apparatus is now unreachable in the shipped site.
 *
 * That is a good problem (every claim is earned) with a bad
 * consequence: nothing renders these paths, so nothing would catch them
 * rotting, and the next claim that needs holding would be the thing
 * that discovers the breakage — on a case file, in front of a reader,
 * at exactly the moment the site is trying to be careful.
 *
 * WHAT IT DOES NOT DO. This renders the REAL `EvidenceTable` with a
 * fixture row, so the assertions land on production code. It does not
 * re-create that markup — a copy would only prove the copy still works,
 * which is the trap this repo has already walked into three times (the
 * contrast guard that matched its own comment, the proof guard that
 * passed on a comment naming the file, and the prototype probe that
 * read a source comment instead of the DOM).
 *
 * For the same reason it covers ONE of the three call sites.
 * `/evidence`'s variant (`data-held-entry` plus a `status: held — not
 * yet earned` row) is two inline fragments in two different grid cells
 * of that page, sharing only `HeldStamp` with this one; covering it
 * honestly would mean extracting and restructuring those cells, which
 * is a larger production change than the gap justifies. It is uncovered
 * and recorded as uncovered — see the note in `held-apparatus.spec.ts`.
 */

import { EvidenceTable } from "@/components/case-study/EvidenceTable";
import type { CaseReceipt } from "@/lib/data/projectCaseStudies";

export const metadata = {
  title: "probe — held apparatus",
  robots: { index: false, follow: false },
};

/**
 * Three rows chosen so the probe measures the held state BY CONTRAST
 * rather than in isolation: an earned row that must tick, a
 * described-only row that must dash for a different reason, and the
 * held row between them. A test that only ever sees a held row cannot
 * tell "the held branch works" from "every row renders a dash".
 */
const ROWS: CaseReceipt[] = [
  {
    claim: "An earned row — terminates in a pinned artifact, so it ticks.",
    method: "read at the pinned commit",
    artifacts: [
      { label: "probe-fixture.txt", href: "https://example.invalid/pinned" },
    ],
    date: "2026-07-30",
    visibility: "public",
  },
  {
    claim: "A held row — stated, not yet reproducible from a committed run.",
    method: "asserted in prose; no committed run reproduces it",
    artifacts: [],
    date: "2026-07-30",
    visibility: "public",
    /* The note is deliberately a string that CANNOT occur in production
       content. The first draft reused the real release condition
       ("held until a committed eval run earns it") and
       check-probe-routes.mjs immediately failed — not because the route
       leaked, but because that exact sentence is quoted inside Glyph's
       erratum and its manifest note, so the leak needle matched real
       prose on /projects/fast-mnist-nn/. The guard was right and the
       fixture was wrong; a probe-only sentinel is what makes the leak
       check able to mean anything. */
    held: { note: "probe fixture sentinel — held until a probe earns it" },
  },
  {
    claim: "A described-only row — no artifact, and no stamp either.",
    method: "described in the write-up",
    artifacts: [],
    date: null,
    visibility: "local-only",
  },
];

export default function HeldProbePage() {
  return (
    <main className="mx-auto max-w-[60rem] px-6 py-16">
      <EvidenceTable
        projectId="probe"
        title="held apparatus"
        rows={ROWS}
        startIndex={1}
      />
      {/* The footnote's pointer must resolve. On a real case file this
          anchor is the corrections register (CaseStudyPage); here it is
          the same id, so the spec can assert the link LANDS rather than
          merely that it was rendered — a dangling in-page link is the
          failure mode a rendering test would otherwise miss. */}
      <section id="corrections" className="mt-20">
        <h2 className="label-mono text-ink">corrections</h2>
      </section>
    </main>
  );
}
