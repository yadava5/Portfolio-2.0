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
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteMetadata } from "@/lib/data/personal";
import { absoluteSiteUrl } from "@/lib/seo";

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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded focus:bg-[var(--accent-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--background)] focus:outline-none"
        >
          Skip to main content
        </a>
        <SmoothScroll>
          <ScrollProgress />
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
