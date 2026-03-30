/**
 * @fileoverview Root layout — global providers, fonts, and shell structure
 *
 * Wraps every page with:
 *   1. Geist font variables (sans + mono)
 *   2. Theme-specific font variables
 *   3. ThemeProvider  — multi-theme wrapper
 *   4. SmoothScroll   — Lenis smooth scrolling
 *   5. Header         — floating glass navigation
 *   6. Footer         — social links + quick nav
 *   7. CustomCursor   — holographic glow trail
 *   8. ThemeSwitcher  — floating theme picker
 *
 * SEO metadata is pulled from the data layer (`siteMetadata`).
 */

import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import ThemeSwitcher from "@/components/layout/ThemeSwitcher";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import { siteMetadata } from "@/lib/data/personal";

/* ──────────────────────────────────────────────
   Font configuration

   Fonts loaded dynamically at runtime via CSS
   @import with display=swap to avoid blocking
   ────────────────────────────────────────────── */

/* ──────────────────────────────────────────────
   SEO metadata
   ────────────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL("https://yadava5.github.io"),
  title: siteMetadata.title,
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: "Ayush Yadav" }],
  icons: {
    icon: "/portfolio/favicon.svg",
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.url,
    siteName: siteMetadata.title,
    images: [{ url: siteMetadata.ogImage, width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [siteMetadata.ogImage],
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
 * Provides theme context, smooth scrolling, header/footer chrome,
 * and the custom cursor overlay.
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts are now optimized via next/font/google */}
      </head>
      <body className="antialiased">
        <a href="#hero" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-[var(--accent-primary)] focus:text-[var(--background)] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium">
          Skip to main content
        </a>
        <ThemeProvider>
          <SmoothScroll>
            <ScrollProgress />
            <CustomCursor />
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <ThemeSwitcher />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
