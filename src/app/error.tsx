"use client";

/**
 * @fileoverview Error boundary for page errors
 *
 * Client component that catches errors in the app router
 * and displays a user-friendly error page with recovery options.
 */

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error("App Error:", error);
  }, [error]);

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--status-warning)] blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 mx-auto max-w-2xl space-y-8 text-center">
        {/* Error display */}
        <div className="space-y-4">
          <div className="font-display text-6xl font-bold text-[var(--status-warning)]">
            Oops!
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Something went wrong
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-[var(--foreground-muted)]">
            We encountered an unexpected error. The page has been temporarily
            disabled. Try refreshing or returning to the home page.
          </p>

          {/* Error message (only in development) */}
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mt-6 rounded border border-[var(--accent-primary)] bg-[var(--surface-3)] p-4 text-left">
              <p className="font-mono text-sm break-words text-[var(--foreground-muted)]">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
          <button
            onClick={reset}
            className="rounded bg-[var(--accent-primary)] px-6 py-3 font-medium text-[var(--background)] transition-colors hover:bg-[var(--accent-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="inline-block rounded bg-[var(--surface-2)] px-6 py-3 font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Return Home
          </button>
        </div>

        {/* Footer text */}
        <p className="pt-4 text-sm text-[var(--foreground-muted)]">
          Error ID: {error.digest || "unknown"}
        </p>
      </div>
    </section>
  );
}
