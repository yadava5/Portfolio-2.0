/**
 * @fileoverview Soft break hints for apparatus data — one hand, three
 * consumers.
 *
 * The site's densest furniture prints strings a reader is meant to be
 * able to RETYPE: repo pins (`yadava5/cadence @ 54c79e0`), artifact
 * paths (`lib/__tests__/rls.postgres.test.ts @ 54c79e0`), demo hosts
 * (`agentic-automl-platform.vercel.app`). Those runs carry no spaces,
 * so a narrow column has two bad options and one good one:
 *
 *   - shove the document sideways (what fix round 5 measured: 72px past
 *     a 320px viewport on the jobtracker case file, because a grid
 *     item's automatic minimum size is its min-content width and an
 *     unbreakable run's min-content width is the whole run);
 *   - break mid-token, which puts a line break inside a seven-character
 *     sha and destroys the one thing the label exists to carry;
 *   - break at a SEPARATOR, where the reader's eye already segments the
 *     string, and where a hyphenation-free wrap costs nothing.
 *
 * `<wbr>` buys the third: a real soft-wrap opportunity, so it both
 * reduces the min-content contribution (the overflow closes) and is
 * preferred by the line-breaker over any `overflow-wrap: anywhere`
 * fallback the cell carries (so a sha never splits while a slash is
 * available). It adds no glyph, no width, and no text to the
 * accessibility tree — copy/paste of a `<wbr>`-seeded string is the
 * original string.
 *
 * The rule came out of the rejudge round's "classif/ier" break on the
 * eval-protocol slip; fix round 5 lifted it out of CaseStudyPage so the
 * receipts table and the meta ledger break in the same hand.
 */

import { Fragment } from "react";

/**
 * Seed a command, path, host, or repo pin with `<wbr>` after every
 * separator, so narrow columns wrap at token boundaries and never
 * mid-word.
 *
 * @param value - A repro command, path, filename, host, or repo pin
 * @returns The value with a soft break opportunity after every . / _ - =
 *
 * @example
 * ```tsx
 * breakable("lib/__tests__/rls.postgres.test.ts @ 54c79e0")
 * // wraps after "lib/", "rls.", "postgres." … never inside "54c79e0"
 * ```
 */
export function breakable(value: string): React.ReactNode {
  const parts = value.split(/(?<=[./_\-=])/);
  return parts.map((part, index) => (
    <Fragment key={`${index}-${part}`}>
      {index > 0 ? <wbr /> : null}
      {part}
    </Fragment>
  ));
}
