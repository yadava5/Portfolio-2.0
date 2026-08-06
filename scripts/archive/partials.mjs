/**
 * The furniture every archive page shares — glyphs, chrome, path grammar.
 *
 * WHY LINKS COME IN TWO GRAMMARS, AND THE RULE THAT DECIDES. A link that
 * stays inside the record room is RELATIVE ("../../evidence/"), so the
 * staging tree previews byte-identically under any prefix — file://, a
 * bare localhost, or the /Portfolio-2.0 deploy. A link that crosses the
 * seam to the run is the full published URL, for two reasons that are the
 * same reason: the run itself cites the archive by its published address
 * (every ¶ handoff does), and `check-crosswalk.mjs` asserts the rejoin
 * href is EXACTLY `https://…/Portfolio-2.0/#<station.id>` — the seam is a
 * citation between two publications, not a path inside one.
 */
import { esc } from "./html.mjs";

/**
 * A site-absolute path from the data layer, re-addressed for one page.
 *
 * The data layer bakes `withBasePath()` in at compile time, and under
 * plain node that base is "" — so artifact hrefs arrive as "/images/…".
 * Served at the GitHub Pages subpath those would 404. Rather than depend
 * on the environment the data was compiled in, strip any base that is
 * present and go relative from the page's own depth, which is correct
 * under every prefix including none.
 */
export function sitePath(prefix, href) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const bare = href.startsWith("/Portfolio-2.0/")
    ? href.slice("/Portfolio-2.0".length)
    : href;
  return `${prefix}${bare.slice(1)}`;
}

/**
 * Soft break hints for apparatus data — the `breakable()` hand, as HTML.
 *
 * Same rule as src/components/paper/Breakable.tsx: a `<wbr>` after every
 * `. / _ - =` so repo pins and hosts wrap at their separators and a
 * seven-character sha is never cut in half. Escapes each token itself, so
 * callers hand this RAW data, never pre-escaped strings.
 */
export function breakable(value) {
  return value
    .split(/(?<=[./_\-=])/)
    .map(esc)
    .join("<wbr>");
}

/* ── The drawn verdict + visibility glyphs ─────────────────────────────
   Paths verbatim from src/components/paper/proofGlyphs.tsx — the walk's
   gutter, the glance strips and the /evidence ledger all draw from one
   wobbled hand, and that stays true across the rebuild: these strings
   are the only copy in the generator. All aria-hidden; the adjacent text
   is always the semantic carrier. */

const TICK =
  '<path d="M1.3 4.9 C2.8 6.4 3.6 7.1 4.3 6.9 C5.7 5 8.1 2.3 10.8 1.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>';
const RING =
  '<path d="M6.2 1.4 C8.4 1.2 9.9 2.4 9.8 4.4 C9.7 6.5 8 7.8 5.9 7.6 C3.9 7.4 2.3 6.2 2.4 4.3 C2.5 2.5 4.1 1.5 6.2 1.4 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
const DASH =
  '<path d="M1.6 5.4 C4.3 4.6 7.9 4.6 10.4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>';

/** The auditor's mark: tick (pinned artifact) / ring (capture) / dash. */
export function auditGlyph(state, cls = "ag") {
  const d = state === "artifact" ? TICK : state === "capture" ? RING : DASH;
  return `<svg viewBox="0 0 12 9" class="${cls}" aria-hidden="true">${d}</svg>`;
}

const VIS_DISC =
  "M6.1 1.6 C8.5 1.4 10.3 3.1 10.2 5.9 C10.1 8.6 8.2 10.4 5.9 10.3 C3.5 10.2 1.8 8.4 1.9 5.8 C2 3.2 3.8 1.8 6.1 1.6 Z";

/** The visibility grade as an ink scale: solid / half / open+dash. */
export function visibilityGlyph(visibility) {
  let body;
  if (visibility === "public") {
    body = `<path d="${VIS_DISC}" fill="currentColor"/>`;
  } else if (visibility === "private-safe") {
    body =
      `<path d="${VIS_DISC}" fill="none" stroke="currentColor" stroke-width="1.3"/>` +
      '<path d="M6 1.7 C3.8 1.9 2.1 3.3 2 5.9 C1.9 8.3 3.7 10.1 6 10.2 Z" fill="currentColor"/>';
  } else {
    body =
      `<path d="${VIS_DISC}" fill="none" stroke="currentColor" stroke-width="1.3"/>` +
      '<path d="M4 6.2 C4.8 5.9 7.2 5.9 8.1 6.1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>';
  }
  return `<svg viewBox="0 0 12 12" class="vg" aria-hidden="true">${body}</svg>`;
}

export const VISIBILITY_LABEL = {
  public: "[public]",
  "private-safe": "[private-safe]",
  "local-only": "[local — verified on request]",
};

/** The visited ✓ — reserved-width slot paper-memory.js unhides. */
export function visitedMark(fileId, title) {
  return (
    `<span class="visited-mark" data-visited-mark="${esc(fileId)}" hidden aria-hidden="true"` +
    `${title ? ` title="${esc(title)}"` : ""}>` +
    `<svg viewBox="0 0 12 9">${TICK.replace('stroke-width="1.7"', 'stroke-width="1.4"')}</svg></span>`
  );
}

/**
 * The masthead. Static, not fixed: the run's chrome tracks a moving day
 * and has to ride along; a record has one light, so its running head is
 * printed at the top of the sheet like any monograph's. The wordmark is
 * the way back to the line, at its published address.
 */
export function masthead(runUrl, state) {
  return `<header class="mast">
      <a class="wm" href="${esc(runUrl)}/">Ayush&#8202;·&#8202;Yadav</a>
      <span class="state">${state}</span>
    </header>`;
}

/**
 * The colophon. The strap is the site's own ("two inks. one line.
 * thirteen stations."), and the year is the year the edition was set —
 * baked at generation time, exactly as the React footer baked it at
 * build (CRITIC-LEDGER F48's ruling carries over unchanged).
 */
export function colophon(runUrl) {
  const year = new Date().getFullYear();
  return `<footer class="colophon">
      <p>© ${year} ayush yadav — set by hand · set in fraunces, newsreader &amp; fragment mono</p>
      <p class="strap">two inks. one line. thirteen stations.</p>
      <p><a href="${esc(runUrl)}/">the working paper ⟶</a></p>
    </footer>`;
}

/** The station that consigned a case file — or the review, which files
 *  the two no station sends (policybot, visual-assist: ¶10's receipts
 *  are their waybill). Same resolution rule as check-crosswalk.mjs. */
export function stationFor(stations, projectId) {
  return (
    stations.find((s) => s.dossier === projectId) ??
    stations.find((s) => s.id === "review")
  );
}

/** "¶ NN" for a station — the 404's own padding rule. */
export function stationNo(station) {
  return String(station.beat + 1).padStart(2, "0");
}

/** Stylesheet + the two scripts, for head()'s extraHead. `prefix` is the
 *  page's own depth ("../../" for a case file); the 404 passes the full
 *  published root instead, because a 404 is served at addresses it
 *  cannot predict and relative paths would resolve against all of them. */
export function assetHead(prefix) {
  return [
    `<link rel="stylesheet" href="${prefix}assets/archive.css">`,
    `<script defer src="${prefix}assets/paper-memory.js"></script>`,
    `<script defer src="${prefix}assets/archive.js"></script>`,
  ].join("\n    ");
}
