'use client';

/**
 * @fileoverview Error boundary for page errors
 *
 * Client component that catches errors in the app router
 * and displays a user-friendly error page with recovery options.
 */

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden py-8 px-4">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[var(--status-warning)] blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        {/* Error display */}
        <div className="space-y-4">
          <div className="text-6xl font-bold text-[var(--status-warning)] font-display">
            Oops!
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--foreground)] tracking-tight">
            Something went wrong
          </h1>
          <p className="text-lg text-[var(--foreground-muted)] max-w-xl mx-auto leading-relaxed">
            We encountered an unexpected error. The page has been temporarily disabled.
            Try refreshing or returning to the home page.
          </p>

          {/* Error message (only in development) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-6 p-4 rounded bg-[var(--surface-3)] border border-[var(--accent-primary)] text-left">
              <p className="text-sm font-mono text-[var(--foreground-muted)] break-words">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={reset}
            className="px-6 py-3 rounded font-medium text-[var(--background)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 rounded font-medium text-[var(--foreground)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors inline-block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Return Home
          </button>
        </div>

        {/* Footer text */}
        <p className="text-sm text-[var(--foreground-muted)] pt-4">
          Error ID: {error.digest || 'unknown'}
        </p>
      </div>
    </section>
  );
}
