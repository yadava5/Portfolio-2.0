/**
 * @fileoverview Footer — the colophon (working-paper voice).
 *
 * Quiet print apparatus: the colophon line and social links. (The hero's
 * footnote resolves at the foot of chapter 01, on its own page — not
 * here.) It sits in nightfall: under motion it inherits the arc's dusk
 * ink; in the static worlds (reduced motion / motion off) `.site-footer`
 * paints waypoint-07 itself (globals.css).
 */

"use client";

import { personalInfo } from "@/lib/data/personal";

/**
 * The colophon year, baked at BUILD time (CRITIC-LEDGER F48).
 *
 * `new Date().getFullYear()` used to run in the component body of a
 * client component in a STATIC export: the prerendered HTML carried the
 * build year, and on 1 January the client would render a different one
 * and React would log a hydration mismatch — a real error for a purely
 * decorative character. Reading it once at module scope means the value
 * is fixed when the page is generated, which is exactly what a printed
 * colophon date is: the year the edition was set.
 */
const EDITION_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer relative z-10 w-full border-t border-current/15 py-12">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-6 sm:px-12 xl:pr-16 xl:pl-36">
        {/* CRITIC-LEDGER F47: `github · linkedin · email` printed here
            AND in the gate's contact cluster ~400px above, in the same
            13px mono, in the same dusk field — the same three links
            twice on one screen. The ledger's split is the one this
            takes: the gate keeps the links (it is the contact section,
            and F01 made them the destination of the site's own
            "contact" nav), the footer keeps the colophon. */}
        <div className="label-mono flex flex-col justify-between gap-x-6 gap-y-2 opacity-80 md:flex-row md:items-baseline">
          <p>
            © {EDITION_YEAR} {personalInfo.name.toLowerCase()} — set by hand
          </p>
          <p>set in fraunces, newsreader &amp; fragment mono</p>
        </div>

        <p className="label-mono text-center tracking-[0.24em] opacity-70">
          two inks. one line. seven chapters.
        </p>
      </div>
    </footer>
  );
}
