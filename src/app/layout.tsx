/**
 * @fileoverview Root layout — fonts, SEO metadata, and shell structure
 *
 * Wraps every page with:
 *   1. Self-hosted variable fonts via `next/font/google`
 *      (Fraunces display, Newsreader prose, Fragment Mono labels)
 *   2. SmoothScroll   — Lenis smooth scrolling
 *   3. Header         — site navigation
 *   4. Footer         — social links + quick nav
 *   5. Skip link      — keyboard a11y
 *
 * SEO metadata is pulled from the data layer (`siteMetadata`).
 */

import type { Metadata } from "next";
import { Fraunces, Newsreader, Fragment_Mono } from "next/font/google";
import "./globals.css";

import { SmoothScroll } from "@/components/layout/SmoothScroll";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteMetadata } from "@/lib/data/personal";
import { absoluteSiteUrl, jsonLdHtml, siteGraph } from "@/lib/seo";

/* ──────────────────────────────────────────────
   Font configuration

   Self-hosted at build time by next/font (no render-blocking
   external @import, no layout-shift). Exposed as CSS variables
   and mapped to Tailwind font tokens in globals.css.
   ────────────────────────────────────────────── */

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

/* N23 (fix round 7) — the "unused font preload" report, settled here so
   it is not re-opened a fourth time.

   THE CLAIM: four preloads warn as unused on `/no-such-page/` and on no
   other route. MEASURED against the shipped artifact
   (`next build` → `out/`, served static, the GitHub Pages target) with
   docs/design-lab/probe-fix7-preload.mjs — 390px viewport, full-page
   scroll, an 8-second tail, well past Chrome's ~3s emission window,
   every console level captured: ZERO preload warnings on `/`,
   `/evidence/`, `/projects/automl/` AND `/no-such-page/`. The only
   console line on the 404 route is the document's own 404 status, which
   the static server is supposed to send.

   What IS real, read from `document.fonts` rather than from the console:
   `/no-such-page/` fetches four woff2 and activates three — Fraunces,
   Newsreader roman, Fragment Mono. `Newsreader italic` (23KB) is
   downloaded and never painted. So the number is ONE, not four — and it
   is not a 404 defect either: `/projects/automl/` sets no italic and
   carries the identical unused preload.

   NOT TRIMMED, deliberately. `next/font` preloads per CALL, and one
   `Newsreader()` call emits both style files. Splitting italic into a
   second call so it can carry `preload: false` gives it a DIFFERENT
   family name, and CSS font matching never falls through to a later
   family for a missing style — it takes the first family that has the
   glyph and SYNTHESIZES the oblique. That would trade 23KB on two
   routes for a synthetic slant on the prose italic voice, which this
   paper uses for every muted consequence line. The 23KB stays. */
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  // Static 400 roman + italic: prose runs at body weight only (plan 3.5), and
  // the full 200–800 variable range costs ~270KB latin vs ~90KB static.
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  // Roman only — the label voice is lowercase mono, never italic (plan 3.5).
  variable: "--font-fragment-mono",
  display: "swap",
});

/* ──────────────────────────────────────────────
   SEO metadata
   ────────────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.url),
  title: siteMetadata.title,
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: "Ayush Yadav" }],
  icons: {
    icon: absoluteSiteUrl("/favicon.svg"),
    shortcut: absoluteSiteUrl("/favicon.ico"),
  },
  alternates: {
    canonical: `${siteMetadata.url}/`,
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.url,
    siteName: siteMetadata.title,
    images: [
      { url: absoluteSiteUrl(siteMetadata.ogImage), width: 1200, height: 630 },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [absoluteSiteUrl(siteMetadata.ogImage)],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ──────────────────────────────────────────────
   Layout component
   ────────────────────────────────────────────── */

/**
 * Root layout wrapping every page in the application
 *
 * Provides self-hosted fonts, smooth scrolling, and header/footer chrome.
 *
 * @param props - Layout props containing the page content
 * @returns The full-page layout shell
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${newsreader.variable} ${fragmentMono.variable}`}
    >
      <body className="antialiased">
        {/* CRITIC-LEDGER F23: the site shipped ZERO structured data —
            no Person, no sameAs to the GitHub/LinkedIn URLs already in
            personal.ts — on a portfolio whose search surface is a name
            query. Person + WebSite ride every route from here; the case
            files and /evidence add their own page-level node on top.
            Composed in src/lib/seo.ts from the data layer, so nothing
            in it can drift from what the page prints. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(siteGraph()) }}
        />
        {/* First-paint world stamp (plan 3.8 + FOUC discipline + governor
            §F2). Synchronous by design: it must beat the hero's paint.
            1. `data-tier` — the frame governor's edition for THIS load:
               "print" under reduced motion, the quiet toggle, or a
               STILL-STANDING sessionStorage "study-tier-cap" of print
               (the lowest tier a previous page of this session reached);
               otherwise "core". NEVER "full" at load — Full garnish only
               mounts later once the governor has proof (§F3), so the
               universal first paint is Core and nothing ever collapses.
               "Still standing" is `study-tier-cap-until`, an EXPIRY
               INSTANT the governor writes beside the cap
               (CRITIC-LEDGER F73: the cap used to be permanent, so four
               slow frames in one scroll demoted every page in the tab
               for the rest of the session). Comparing an instant means
               the TTL itself lives in exactly one place — governor.ts —
               and this critical-path script carries no copy of it.
               A cap with no expiry is honoured as set deliberately.
            2. `data-motion-ready` — the text-motion gate (amendment A7):
               stamped ONLY when the tier is core, i.e. the same gates
               SmoothScroll checks before mounting the engine plus the
               governor's ceiling. The hero's hidden entrance state
               exists only under this attribute, so static worlds and
               JS-dead loads always paint the finished page; TextMotion
               removes it after the entrance plays (load-only, once).
            3. A document that LOADS hidden (background tab, embedded
               preview pane, prerender) starts at the print floor too:
               hidden documents get no rAF, so engine-held motion could
               never play there — yet such surfaces are read and
               screenshotted. SmoothScroll re-opens the gate (print →
               core, engine mounts) at the first visibilitychange to
               visible, so a real reader who foregrounds the tab still
               gets the full motion world. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              /* data-tm-prehide (CRITIC-LEDGER F76) rides the SAME
                 condition as data-motion-ready: it exists only when the
                 motion world is actually planned, so a reduced-motion
                 reader, the quiet toggle, the governor's print floor, a
                 hidden load, and a JS-dead load all paint the finished
                 page (A7). TextMotion drops it the instant it starts
                 building tweens. */
              /* THE PROTOTYPE HAS ONE MOTION GATE, AND SO DO WE NOW.
                 Counted in the approved prototype's engine:
                 prefers-reduced-motion 1 · visibilityState 0 ·
                 data-tier 0 · governor 0 · jank 0 · downshift 0.
                 It carries no tier system at all and it is the design
                 that works, so the three production-only caps are gone:
                 the sessionStorage tier cap, the jank floor it wrote,
                 and `visibilityState === "hidden"`.
                 The hidden cap is the one that could actually be seen.
                 A document that LOADS in a background tab — a cmd-click,
                 a restored session, a link opened and read a minute later
                 — started at the print floor, and although SmoothScroll
                 re-opens the gate on the first visibilitychange, a reader
                 who never triggers one (the tab was already open behind
                 the current one) gets a page with no motion and no reason
                 given. The prototype simply has no such state to be stuck
                 in. Reduced motion and the quiet toggle stay: the first is
                 accessibility and the prototype honours it too (`const RM =
                 matchMedia("(prefers-reduced-motion: reduce)").matches`),
                 the second is the reader's own switch. */
              'try{var d=document.documentElement,p=matchMedia("(prefers-reduced-motion: reduce)").matches||localStorage.getItem("motion-off")==="1";d.setAttribute("data-tier",p?"print":"core");if(!p){d.setAttribute("data-motion-ready","");d.setAttribute("data-tm-prehide","")}}catch(e){}',
          }}
        />
        {/* CRITIC-LEDGER F34: a fourth typeface leaked in here. The
            colophon reads "set in fraunces, newsreader & fragment mono",
            and the one element that broke it was the skip link — the
            FIRST thing a keyboard reader ever sees, rendering in
            ui-sans-serif. It is now set in Fragment Mono at the label
            token's own size — the apparatus voice the rest of the chrome
            uses. (`font-mono` rides the element unconditionally rather
            than behind `focus:`: .label-mono is a plain rule, not a
            Tailwind utility, so it takes no variant — and the family is
            free while the link is sr-only.) */}
        <a
          href="#main-content"
          className="sr-only font-mono text-[length:var(--text-label)] tracking-[0.05em] focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded focus:bg-[var(--accent-primary)] focus:px-4 focus:py-2 focus:text-[var(--background)] focus:outline-none"
        >
          Skip to main content
        </a>
        <SmoothScroll>
          <Header />
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
