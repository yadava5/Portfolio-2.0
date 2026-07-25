/**
 * @fileoverview /evidence — the master ledger, as a real crosswalk.
 *
 * proofManifest.ts rendered as the third surface (FRONTEND-COMPLETION-MAP
 * §1), upgraded from manifest to LEDGER per the rejudge round: numbered
 * entries (e-01 …), a recorded date per entry, named artifact links with
 * ↗ (the URL lives in the href, never on the page), a receipt crosswalk
 * into the case-file row (`#v-` anchor) that argues each claim in full,
 * and the dossier thread running down the margin — the same stock, the
 * same hand as the case files.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { DossierThread } from "@/components/case-study/DossierThread";
import { HeldStamp } from "@/components/paper/HeldStamp";
import { VisitedMark } from "@/components/paper/VisitedMark";
import { proofManifest, ProofVisibility } from "@/lib/data/proofManifest";
import { siteMetadata } from "@/lib/data/personal";
import { absoluteSiteUrl, evidenceGraph, jsonLdHtml } from "@/lib/seo";
import { withBasePath } from "@/lib/utils";

const EVIDENCE_URL = `${siteMetadata.url}/evidence/`;
const EVIDENCE_TITLE = "The Evidence Index | Ayush Yadav";
const EVIDENCE_DESCRIPTION =
  "The master ledger behind the portfolio: every claim, its source, how it was verified, its visibility, and its privacy boundary.";
const EVIDENCE_IMAGE = absoluteSiteUrl("/og/evidence.png");

/* CRITIC-LEDGER F26: this page had a title, a description and a
   canonical — and no `openGraph` block at all. Next fell back to the
   root layout's, so the funnel's DESTINATION shared as the homepage:
   og:title, og:description and og:url all pointed at `/`. The one link
   worth pasting into a recruiter thread — "here is the ledger behind
   every number" — unfurled as the front door. */
export const metadata: Metadata = {
  title: EVIDENCE_TITLE,
  description: EVIDENCE_DESCRIPTION,
  alternates: {
    canonical: EVIDENCE_URL,
  },
  openGraph: {
    title: EVIDENCE_TITLE,
    description: EVIDENCE_DESCRIPTION,
    url: EVIDENCE_URL,
    siteName: siteMetadata.title,
    images: [
      {
        url: EVIDENCE_IMAGE,
        width: 1200,
        height: 630,
        alt: "The evidence index — Ayush Yadav's proof ledger",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: EVIDENCE_TITLE,
    description: EVIDENCE_DESCRIPTION,
    images: [EVIDENCE_IMAGE],
  },
};

const VISIBILITY_LABEL: Record<ProofVisibility, string> = {
  public: "[public]",
  "private-safe": "[private-safe]",
  "local-only": "[local — verified on request]",
};

/**
 * The case file a receipt crosswalk link lands in ("the paper
 * remembers": its ✓ marks entries whose file the visitor has opened).
 *
 * @param href - Receipt href ("/projects/<id>/#v-…")
 * @returns The project id, or null for non-case-file receipts
 */
function receiptFileId(href: string): string | null {
  const match = href.match(/^\/projects\/([^/]+)\//);
  return match ? match[1] : null;
}

/** Manifest sources are either URLs or checked-in public asset paths. */
function sourceLink(
  source: string
): { href: string; external: boolean } | null {
  if (source.startsWith("http")) {
    return { href: source, external: true };
  }
  if (source.startsWith("public/")) {
    return {
      href: withBasePath(source.replace(/^public/, "")),
      external: false,
    };
  }
  return null;
}

/**
 * The honest qualifier on a source's independence (CRITIC-LEDGER F55).
 *
 * The manifest's own rule (proofManifest.ts:4-6) is that `source` is
 * the strongest artifact OUTSIDE this site's rendering. Three entries
 * pointed at `public/…` paths that `sourceLink()` rewrites to this very
 * origin, and printed them behind `↗` — the glyph this site reserves
 * for "leaves the site". Two more terminate in the author's own README.
 * Neither is dishonest evidence; both are weaker than a committed run,
 * and the page now says which is which instead of dressing all five as
 * the same thing.
 */
const SOURCE_KIND_NOTE = {
  "self-hosted": "[self-hosted — checked into this site's repository]",
  "self-authored": "[self-authored — the author's own documentation]",
} as const;

export default function EvidencePage() {
  return (
    <article data-dossier className="dossier-surface text-ink min-h-screen">
      {/* CRITIC-LEDGER F23: the ledger as a CollectionPage. Its
          numberOfItems is the manifest's own length, so the graph can
          never claim more entries than the page renders. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(evidenceGraph(proofManifest.length)),
        }}
      />
      <DossierThread />
      <div className="relative mx-auto w-full max-w-[1240px] pt-28 pr-6 pb-16 pl-9 sm:px-12 xl:pr-16 xl:pl-36">
        <p className="label-mono text-ink-secondary">
          ¶ the evidence index — every claim on file · {proofManifest.length}{" "}
          entries
        </p>

        <header className="mt-8">
          <h1
            data-thread-title
            className="font-display fraunces-display max-w-[18ch] text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.015em]"
          >
            The evidence index
          </h1>
          {/* Certification round, D1: the closing sentence stated a rule
              the site's own biographical register does not keep. The
              degree, the dean's list and the GPA are printed in ¶03 as
              prose and are deliberately NOT manifest entries — a
              transcript offered on request is not a public artifact, so
              it cannot enter a ledger whose every row terminates at one.
              The rule was right about claims; it was silent about the
              one register that is exempt, and silence read as a
              contradiction. It now names the exemption and its boundary
              in the same breath, which is what the ¶03 line already
              says. */}
          <p className="text-body text-ink-secondary mt-6 max-w-[58ch] font-serif">
            The master ledger behind every number on this site: the claim, the
            strongest artifact it terminates at, when it was recorded, and the
            case-file receipt that argues it in full. If a claim is not in this
            ledger or a case file, the site does not make it — apart from the
            biographical register (degree, dean’s list, GPA), which the
            transcript on request backs.
          </p>
        </header>

        <ol className="mt-14">
          {proofManifest.map((entry, index) => {
            const link = sourceLink(entry.source);
            return (
              <li
                key={entry.id}
                id={entry.id}
                className="border-ink/20 grid gap-x-10 gap-y-3 border-t py-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,2fr)]"
              >
                <div>
                  <p className="label-mono text-ink-secondary">
                    e-{String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="label-mono text-ink mt-1.5">{entry.label}</h2>
                  <p className="text-ink mt-2 max-w-[46ch] font-serif text-[1.0625rem] leading-6">
                    {entry.claim}
                  </p>
                  {/* W5: an unearned number wears the same HELD apparatus
                      as its case-file row — dashed clay, never a tick —
                      with the footnote naming when the stamp lifts. */}
                  {entry.held ? (
                    <div className="mt-3" data-held-entry>
                      <HeldStamp />
                      <p className="text-ink-secondary mt-2 max-w-[44ch] font-serif text-[0.9375rem] leading-6 italic">
                        {entry.held.note}.
                      </p>
                    </div>
                  ) : null}
                </div>
                <dl className="label-mono space-y-1.5">
                  {entry.held ? (
                    <div>
                      <dt className="text-ink-secondary inline">status: </dt>
                      <dd className="text-clay inline">
                        held — not yet earned
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-ink-secondary inline">source: </dt>
                    {/* normal-case: artifact names are case-sensitive data;
                        the URL lives in the href, never as text */}
                    <dd className="inline break-words normal-case">
                      {link ? (
                        <a
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={
                            link.external ? "noopener noreferrer" : undefined
                          }
                          className="link-draw"
                        >
                          {/* F41's glyph contract, applied to the one
                              place that broke it: ↗ leaves the site, ⟶
                              goes deeper into this argument. A
                              `public/…` source is served from this
                              origin — it never left. */}
                          {entry.sourceLabel} {link.external ? "↗" : "⟶"}
                        </a>
                      ) : (
                        entry.sourceLabel
                      )}
                      {entry.sourceKind ? (
                        <span className="text-ink-secondary block">
                          {SOURCE_KIND_NOTE[entry.sourceKind]}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-secondary inline">date: </dt>
                    <dd className="inline">{entry.date ?? "not recorded"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-secondary inline">
                      verification:{" "}
                    </dt>
                    <dd className="inline">{entry.verification}</dd>
                  </div>
                  <div>
                    {/* CRITIC-LEDGER F43: "receipt" ran 23 times on a
                        12-entry page — the dt said it, then the value
                        said it again two words later ("receipt:
                        jobtracker case file · receipt 04"). The term
                        the reader needs here is not the artifact's
                        name, it is the RELATION: where this claim is
                        argued at length. The receipt numbers stay —
                        they are the anchors. */}
                    <dt className="text-ink-secondary inline">argued in: </dt>
                    <dd className="inline">
                      {entry.receipt ? (
                        <>
                          <Link href={entry.receipt.href} className="link-draw">
                            {entry.receipt.label} ⟶
                          </Link>
                          {/* CRITIC-LEDGER F44: the crosswalk arrow and
                              the reading-history ✓ set flush against
                              each other — `receipt 02 ⟶✓`, one glyph
                              reading as a ligature of the other. A thin
                              space (U+2009) parts them without opening
                              a word space inside the value. */}
                          {"\u2009"}
                          {/* The paper remembers (W1): ✓ once the cited
                              case file has been opened. Item 5 — where
                              this reading-history ✓ sits beside a HELD
                              entry's receipt, a hasty eye could read it as
                              a verification tick; the visited-only tooltip
                              says plainly what it is. Perceptual only: no
                              count, no claim, no HeldStamp touched. */}
                          {receiptFileId(entry.receipt.href) ? (
                            <VisitedMark
                              fileId={receiptFileId(entry.receipt.href)!}
                              title={
                                entry.held
                                  ? "you opened this case file — your reading history, not a verification of this held claim"
                                  : "you opened this case file — your reading history"
                              }
                            />
                          ) : null}
                        </>
                      ) : (
                        "no case file — the repository is the record"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-secondary inline">visibility: </dt>
                    <dd className="inline">
                      {VISIBILITY_LABEL[entry.visibility]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-secondary inline">boundary: </dt>
                    <dd className="text-ink-secondary inline">
                      {entry.privacyBoundary}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ol>

        <footer className="mt-20">
          <div
            aria-hidden="true"
            className="flex items-center gap-4 opacity-70"
          >
            <span className="h-px flex-1 bg-current" />
            <span className="label-mono tracking-[0.22em]">
              the evidence index
            </span>
            <span className="h-px flex-1 bg-current" />
          </div>
          <div className="label-mono mt-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <Link href="/#work" className="link-draw text-ink">
              back to the work ⟵
            </Link>
            <Link
              href="/projects/automl/"
              className="link-draw text-ink-secondary"
            >
              first case file — agentic automl ⟶
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}
