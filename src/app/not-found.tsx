/**
 * @fileoverview Custom 404 Not Found page
 *
 * Server component that displays a theme-aware 404 error page
 * with quick navigation links and a home button.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <section
      id="not-found"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-8 text-[var(--foreground)]"
    >
      {/* Content container */}
      <div className="relative z-10 mx-auto max-w-2xl space-y-8 text-center">
        {/* 404 display */}
        <div className="space-y-4">
          <div className="font-display text-7xl font-bold text-[var(--accent-primary)] sm:text-8xl">
            404
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Page Not Found
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-[var(--foreground-muted)]">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let me help you find what you need.
          </p>
        </div>

        {/* Quick navigation links */}
        <nav className="mx-auto grid max-w-md grid-cols-2 gap-3 py-8 sm:grid-cols-3">
          <Link
            href="/"
            className="rounded bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Home
          </Link>
          {/* Anchors match the real chapter ids (the old #about/#projects/
              #experience/#skills anchors died with the Atlas layout). */}
          <Link
            href="/#who"
            className="rounded bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            About
          </Link>
          <Link
            href="/#work"
            className="rounded bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            The work
          </Link>
          <Link
            href="/#path"
            className="rounded bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Experience
          </Link>
          <Link
            href="/evidence/"
            className="rounded bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Evidence
          </Link>
          <Link
            href="/#gate"
            className="rounded bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Contact
          </Link>
        </nav>

        {/* Primary call-to-action */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block rounded bg-[var(--accent-primary)] px-8 py-3 font-medium text-[var(--background)] transition-colors hover:bg-[var(--accent-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Return to Home
          </Link>
        </div>

        {/* Footer text */}
        <p className="pt-4 text-sm text-[var(--foreground-muted)]">
          If you believe this is a mistake, please{" "}
          <Link
            href="/#gate"
            className="underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            contact me
          </Link>
        </p>
      </div>
    </section>
  );
}
