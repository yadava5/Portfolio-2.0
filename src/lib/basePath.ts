/**
 * @fileoverview Where this site is served from — and nothing else.
 *
 * WHY THIS FILE EXISTS, measured rather than supposed. `tsconfig.run.json`
 * compiles a small module graph for the run's nameplate, and the run is the
 * whole portfolio. That graph reaches `src/lib/data/personal.ts`, which
 * imported `withBasePath` from `@/lib/utils` — a module that imports `clsx`
 * and `tailwind-merge` at the top level for `cn()`. Run that project with
 * those two packages taken out of resolution and it does not degrade, it
 * stops:
 *
 *   src/lib/utils.ts(8,39): error TS2307: Cannot find module 'clsx' …
 *   src/lib/utils.ts(9,25): error TS2307: Cannot find module 'tailwind-merge' …
 *   tsc exit=2
 *
 * `scripts/run/build-nameplate.mjs` runs that project to build a piece of the
 * SHIPPED home page. So "prune the React toolchain", executed literally,
 * breaks the one artifact this migration exists to protect — and the entire
 * coupling was one exported constant. The surviving data layer was reaching
 * Tailwind through a URL prefix.
 *
 * ZERO IMPORTS IS THE CONTRACT, not a property of the current body. Anything
 * imported here joins the run build's dependency closure, which is the exact
 * mistake being undone. `src/lib/utils.ts` re-exports both names so the React
 * tree keeps working unchanged for the rest of its life.
 */

/**
 * The deploy prefix, resolved the way Next resolves it at build time.
 *
 * `??`, not `||`: the e2e scripts set `NEXT_PUBLIC_BASE_PATH=` (an EMPTY
 * string) deliberately, and that is a real configuration — the site served
 * from a domain root. `||` would silently promote it to `/Portfolio-2.0` and
 * every asset URL in the e2e artifact would diverge from the one deployed.
 */
const configuredBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.NODE_ENV === "production" ? "/Portfolio-2.0" : "");

export const basePath = configuredBasePath.replace(/\/$/, "");

/**
 * Prefix a site-absolute path with the deploy base path.
 *
 * Left alone: anything that is not site-absolute (already relative, so it is
 * resolved against the document) and anything protocol-relative (`//host/…`,
 * where a prefix would corrupt the host).
 */
export function withBasePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}
