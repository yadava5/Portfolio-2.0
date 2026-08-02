/**
 * @fileoverview Footer — the colophon (working-paper voice).
 *
 * Quiet print apparatus: the colophon line and social links. (The hero's
 * footnote resolves at the foot of chapter 01, on its own page — not
 * here.) It sits in nightfall: under motion it inherits the arc's dusk
 * ink; in the static worlds (reduced motion / motion off) `.site-footer`
 * paints waypoint-07 itself (globals.css).
 *
 * It also carries the PHONE seat of the quiet motion toggle
 * (certification round, N4). A colophon states how an edition is set —
 * this one already names its three faces — so "motion: on" belongs in
 * the same breath, and unlike the masthead the colophon has the width
 * to give it a real 44px target. The masthead keeps the `sm`+ seat;
 * MotionToggle.tsx holds the measurement behind the split.
 */

"use client";

import { MotionToggle } from "@/components/layout/MotionToggle";
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

        {/* The phone seat, exactly complementary to the masthead's
            (`hidden sm:inline-flex` there, `sm:hidden` here): one
            control is reachable at every width, never two. `-my-3`
            keeps the colophon's 8-unit rhythm while the button itself
            measures a full 44px. */}
        <MotionToggle className="-my-3 inline-flex h-11 w-fit items-center opacity-80 transition-opacity hover:opacity-100 sm:hidden" />

        {/* "thirteen stations", not "seven chapters". This colophon renders
            in the root layout, so it ships on /evidence and all seven case
            files — eleven indexable pages describing a home page that has
            had thirteen stations since the run replaced the chapter shell.
            Corrected by the 2026-08-02 provenance audit. The count is the
            run's own `data-beat="0".."12"`, which check-beat-tables already
            asserts is a dense range, so it cannot drift silently again. */}
        <p className="label-mono text-center tracking-[0.24em] opacity-70">
          two inks. one line. thirteen stations.
        </p>
      </div>
    </footer>
  );
}
