/**
 * @fileoverview Root layout — global providers, fonts, and shell structure
 *
 * Wraps every page with:
 *   1. Geist font variables (sans + mono)
 *   2. ThemeProvider  — multi-theme wrapper
 *   3. SmoothScroll   — Lenis smooth scrolling
 *   4. Header         — floating glass navigation
 *   5. Footer         — social links + quick nav
 *   6. CustomCursor   — holographic glow trail
 *   7. ThemeSwitcher  — floating theme picker
 *
 * SEO metadata is pulled from the data layer (`siteMetadata`).
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import ThemeSwitcher from "@/components/layout/ThemeSwitcher";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";
import { siteMetadata } from "@/lib/data/personal";

/* ──────────────────────────────────────────────
   Font configuration
   ────────────────────────────────────────────── */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SmoothScroll>
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
