/**
 * @fileoverview Custom 404 Not Found page
 *
 * Server component that displays a theme-aware 404 error page
 * with quick navigation links and a home button.
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <section id="not-found" className="min-h-screen w-full flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden py-8 px-4">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[var(--accent-primary)] blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        {/* 404 display */}
        <div className="space-y-4">
          <div className="text-7xl sm:text-8xl font-bold text-[var(--accent-primary)] font-display drop-shadow-lg">
            404
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-[var(--foreground)] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-lg text-[var(--foreground-muted)] max-w-xl mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let me help you find what you need.
          </p>
        </div>

        {/* Quick navigation links */}
        <nav className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-8 max-w-md mx-auto">
          <Link
            href="/"
            className="px-4 py-3 rounded text-sm font-medium bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Home
          </Link>
          <Link
            href="/#about"
            className="px-4 py-3 rounded text-sm font-medium bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            About
          </Link>
          <Link
            href="/#projects"
            className="px-4 py-3 rounded text-sm font-medium bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Projects
          </Link>
          <Link
            href="/#experience"
            className="px-4 py-3 rounded text-sm font-medium bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Work
          </Link>
          <Link
            href="/#skills"
            className="px-4 py-3 rounded text-sm font-medium bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Skills
          </Link>
          <Link
            href="/#contact"
            className="px-4 py-3 rounded text-sm font-medium bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Contact
          </Link>
        </nav>

        {/* Primary call-to-action */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded font-medium text-[var(--background)] bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            Return to Home
          </Link>
        </div>

        {/* Footer text */}
        <p className="text-sm text-[var(--foreground-muted)] pt-4">
          If you believe this is a mistake, please{' '}
          <Link
            href="/#contact"
            className="underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            contact me
          </Link>
        </p>
      </div>
    </section>
  );
}
