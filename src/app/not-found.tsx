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
 * ledger uses (DOSSIER-SPEC pt 3). Chapter names and numbers are read
 * from `CHAPTERS`, the seven-chapter contract, so this page can never
 * name a chapter the story does not have. Links carry the house glyph
 * roles (F41): `⟶` goes deeper into this site, `⟵` returns — and every
 * one of them is a `next/link`, so the basePath a GitHub Pages deploy
 * needs is applied for us (F27's lesson, kept).
 *
 * ONE return affordance: the folio footer's "back to the front page ⟵".
 * The masthead wordmark above it is the site's identity, not a second
 * exit; nothing in this page's own body repeats the trip home. The
 * colophon underneath is the real `Footer` from the root layout.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { CHAPTERS } from "@/components/story/chapters";

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
    "That page is not on file. The seven chapters, the case files, and the evidence index are.",
  robots: null,
};

/**
 * One row of the index: a lowercase-mono affordance, the dotted leader,
 * and the plain mono note that says where the row lands.
 *
 * The leader is `aria-hidden` furniture — a screen reader hears the link
 * and its note, never a line of dots.
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
      <Link href={href} className="link-draw label-mono text-ink shrink-0">
        {label} ⟶
      </Link>
      <span aria-hidden="true" className="dot-leader" />
      <span className="label-mono text-ink-secondary shrink-0">{note}</span>
    </li>
  );
}

export default function NotFound() {
  /* Chapter 01 is `arrival` — the top of the front page, which is where
     the return affordance below already goes. Listing it would be the
     duplicate exit this page was rebuilt to remove. */
  const chapters = CHAPTERS.filter((chapter) => chapter.anchor !== "arrival");

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
            lost or moved. What this paper does hold is listed below: seven
            chapters of one workday, and the ledger that backs every number in
            them.
          </p>
        </header>

        <nav aria-labelledby="on-file" className="mt-14 max-w-[34rem]">
          <h2 id="on-file" className="label-mono text-ink-secondary">
            what is on file
          </h2>
          <ul className="mt-5 space-y-3.5">
            {chapters.map((chapter) => (
              <IndexRow
                key={chapter.anchor}
                href={`/#${chapter.anchor}`}
                label={chapter.name}
                note={`chapter ${chapter.id}`}
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
