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

import { personalInfo, socialLinks } from "@/lib/data/personal";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer relative z-10 w-full border-t border-current/15 py-12">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-6 sm:px-12 xl:pr-16 xl:pl-36">
        <div className="label-mono flex flex-col justify-between gap-x-6 gap-y-2 opacity-80 md:flex-row md:items-baseline">
          <p>
            © {currentYear} {personalInfo.name.toLowerCase()} — set by hand
          </p>
          <p className="flex flex-wrap gap-x-6 gap-y-2">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.url.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="link-draw"
              >
                {link.name.toLowerCase()}
              </a>
            ))}
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
