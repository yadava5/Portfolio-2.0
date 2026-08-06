/**
 * @fileoverview 404 — the notice page, set in the paper's own hand.
 *
 * Fix round 3, B1. The old 404 was the last SaaS page left standing on a
 * printed monograph: a 7xl clay "404", a Title Case "Page Not Found", a
 * six-chip button grid in `--surface-2` rounded rectangles, and the word
 * "About" — a chapter name this site retired with the Atlas layout (its
 * chapter is called `who`). Two of the six chips and the filled CTA all
 * pointed at `/`, so the one page whose whole job is "here is the way
 * back" offered the way back three times.
 *
 * It is now a NOTICE printed on the house stock: the ¶ kicker, a
 * Fraunces head, a serif deck, and the site's own vocabulary listed as a
 * mono dot-leader index — the same print furniture the case files' meta
 * ledger uses (DOSSIER-SPEC pt 3). Links carry the house glyph roles
 * (F41): `⟶` goes deeper into this site, `⟵` returns — and every one of
 * them is a `next/link`, so the basePath a GitHub Pages deploy needs is
 * applied for us (F27's lesson, kept).
 *
 * THE INDEX NOW READS `STATIONS`, NOT `CHAPTERS`. It used to list the
 * seven chapters of StoryShell — the React home page nobody is served —
 * and bridge them to the run with a one-entry rename map, because the two
 * files disagreed on what the tenth stop is called. That map is deleted
 * here: `src/lib/data/stations.ts` describes the page this site actually
 * ships, `scripts/qa/check-stations.mjs` asserts every string in it
 * appears verbatim in `src/run/index.html`, and `check-anchors` resolves
 * this page's hrefs through it. One file, checked against the artifact,
 * beats two files and a translation table — which is how five links here
 * came to be dead in the first place.
 *
 * Twelve rows for thirteen stops, and both omissions are deliberate. The
 * first stop is the front page, which the folio footer below already
 * offers — listing it would restore the duplicate exit this page was
 * rebuilt to remove. The last is the morning AFTER run 042, which the run
 * holds behind the approval gate; its id exists and resolves, but nothing
 * brings it into view until a reader signs, so a link to it would be a
 * link that appears to do nothing — the exact failure this index exists
 * to have stopped making.
 *
 * ONE return affordance: the folio footer's "back to the front page ⟵".
 * The masthead wordmark above it is the site's identity, not a second
 * exit; nothing in this page's own body repeats the trip home. The
 * colophon underneath is the real `Footer` from the root layout.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { STATIONS } from "@/lib/data/stations";

/* CRITIC-LEDGER F51: `out/404.html` shipped the HOMEPAGE title
   ("Ayush Yadav | Software, Data, and ML Engineering") and inherited
   `robots: {index: true}` from the root layout — while /world-preview,
   a debug bench, correctly carried noindex. The error page was being
   treated less carefully than the dev page, and an indexed 404 that
   claims to be the homepage is a duplicate-title signal on the one
   name query this site exists to win.

   Certification round, N6 — the title half of that fix stands; the
   robots half is now Next's job alone. Next emits its OWN
   `<meta name="robots" content="noindex">` for the not-found route, so
   the `robots: {index:false, follow:true}` that used to sit here put a
   SECOND robots tag on all three 404 outputs (`404.html`,
   `404/index.html`, `_not-found/index.html`). The two agreed, which is
   the only reason it never bit: a crawler reading two directives has to
   pick one, and nothing here decided which.

   `robots: null` is the fix rather than deleting the key: deleting it
   does not silence this page, it INHERITS the root layout's
   `index, follow` — which is how the duplicate then read
   "noindex | index, follow", two directives that disagree. `null`
   clears the inherited field and leaves Next's own noindex standing
   alone. `follow` was never load-bearing: it is the default, and this
   page links only to this site's own chapters. One page, one directive.
   scripts/qa/check-static-export-seo.mjs now fails on a second one. */
export const metadata: Metadata = {
  title: "Not on file | Ayush Yadav",
  description:
    "That page is not on file. The stations of the run, the case files, and the evidence index are.",
  robots: null,
};

/**
 * One row of the index: a lowercase-mono affordance, the dotted leader,
 * and the plain mono note that says where the row lands.
 *
 * The leader is `aria-hidden` furniture — a screen reader hears the link
 * and its note, never a line of dots.
 *
 * Fix round 6, the blocker: BOTH halves of this row used to carry
 * `shrink-0`, so nothing in it could give and nothing could wrap. The
 * row is a flex line of three items — affordance, leader, note — and
 * with two of the three frozen the only variable left was the document's
 * width. Measured `scrollWidth − innerWidth` on `/no-such-page/`: 104 at
 * 320, 84 at 340, 64 at 360, 49 at 375, 34 at 390, 10 at 414, 0 from 430
 * up. The `.notice-surface` paper stops at the viewport edge, so on
 * every phone narrower than 430 the ink printed onto raw canvas — and
 * the row that ran off is the ONLY one pointing at `/evidence/`, on the
 * one page whose whole job is to say where the reader can go instead.
 *
 * The cure is the grammar fix round 5 already wrote for the case files'
 * meta ledger, which is the same dot-leader furniture: `wrap-anywhere`
 * (`overflow-wrap: anywhere`) rather than `shrink-0`. `anywhere` is the
 * value that reduces a flex item's MIN-CONTENT contribution as well as
 * letting the text break — `break-word` does the second without the
 * first, which is exactly the trap FIX5 documented on the receipts
 * table. Both text halves get it and neither is frozen, so the line
 * shrinks the way a flex line is supposed to.
 *
 * `breakable()` — the other half of FIX5's ledger grammar — is still not
 * applied, but the reason has changed and the old one is worth recording
 * because it EXPIRED. It used to be that no string this row can print
 * contains a `.` `/` `_` `-` or `=`, so the helper would emit zero
 * `<wbr>`. Reading `STATIONS` instead of `CHAPTERS` brought in
 * `jetpack-compress`, which contains one — the case that comment
 * explicitly anticipated. It is still not needed: `wrap-anywhere` reduces
 * this item's min-content contribution AND lets the text break at any
 * point, so the hyphen needs no hint; `breakable()` would only bias WHERE
 * a break lands, on a 16-character token that fits at 320 anyway
 * (measured). The distinction FIX5 drew is the one that matters — `anywhere`
 * does the min-content half, `break-word` does not.
 *
 * `.dot-leader` is `flex: 1 1 2rem` with a 2rem floor, so the leader
 * keeps drawing at every width — the row folds, the print furniture
 * does not disappear.
 *
 * @param href - In-site destination (chapter anchor or route)
 * @param label - The site's own name for that place, lowercase
 * @param note - What a reader finds there
 * @returns The index row
 */
function IndexRow({
  href,
  label,
  note,
}: {
  href: string;
  label: string;
  note: string;
}) {
  return (
    <li className="flex items-baseline gap-3">
      <Link href={href} className="link-draw label-mono text-ink wrap-anywhere">
        {label} ⟶
      </Link>
      <span aria-hidden="true" className="dot-leader" />
      <span className="label-mono text-ink-secondary text-right wrap-anywhere">
        {note}
      </span>
    </li>
  );
}

export default function NotFound() {
  /* Derived from the ends of the line, not from a list of two names: add a
     stop to the run and this index picks it up; move the gate and the
     omissions move with it. See the file header for why these two. */
  const stops = STATIONS.slice(1, -1);

  return (
    <section id="not-found" className="notice-surface text-ink min-h-screen">
      <div className="relative mx-auto w-full max-w-[1240px] px-6 pt-28 pb-24 sm:px-12 xl:pr-16 xl:pl-36">
        <p className="label-mono text-ink-secondary">
          ¶ not on file — nothing at this address
        </p>

        <header className="mt-8">
          <h1 className="font-display fraunces-display max-w-[18ch] text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.015em]">
            Not on file
          </h1>
          <p className="text-body text-ink-secondary mt-6 max-w-[58ch] font-serif">
            The address you asked for was never filed here — nothing has been
            lost or moved. What this paper does hold is listed below: the
            stations of one workday, and the ledger that backs every number in
            them.
          </p>
        </header>

        <nav aria-labelledby="on-file" className="mt-14 max-w-[34rem]">
          <h2 id="on-file" className="label-mono text-ink-secondary">
            what is on file
          </h2>
          <ul className="mt-5 space-y-3.5">
            {stops.map((station) => (
              <IndexRow
                key={station.id}
                href={`/#${station.id}`}
                label={station.name}
                note={`¶ ${String(station.beat + 1).padStart(2, "0")} · ${station.clock}`}
              />
            ))}
            <IndexRow
              href="/evidence/"
              label="the evidence index"
              note="every claim on file"
            />
          </ul>
        </nav>

        <footer className="mt-16 max-w-[34rem]">
          <div
            aria-hidden="true"
            className="flex items-center gap-4 opacity-70"
          >
            <span className="h-px flex-1 bg-current" />
            <span className="label-mono tracking-[0.22em]">not on file</span>
            <span className="h-px flex-1 bg-current" />
          </div>
          <p className="mt-6">
            <Link href="/" className="link-draw label-mono text-ink">
              back to the front page ⟵
            </Link>
          </p>
        </footer>
      </div>
    </section>
  );
}
