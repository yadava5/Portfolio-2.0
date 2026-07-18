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
import { VisitedMark } from "@/components/paper/VisitedMark";
import { proofManifest, ProofVisibility } from "@/lib/data/proofManifest";
import { siteMetadata } from "@/lib/data/personal";
import { withBasePath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Evidence Index | Ayush Yadav",
  description:
    "The master ledger behind the portfolio: every claim, its source, how it was verified, its visibility, and its privacy boundary.",
  alternates: {
    canonical: `${siteMetadata.url}/evidence/`,
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

export default function EvidencePage() {
  return (
    <article data-dossier className="dossier-surface text-ink min-h-screen">
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
          <p className="text-body text-ink-secondary mt-6 max-w-[58ch] font-serif">
            The master ledger behind every number on this site: the claim, the
            strongest artifact it terminates at, when it was recorded, and the
            case-file receipt that argues it in full. If a claim is not in this
            ledger or a case file, the site does not make it.
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
                </div>
                <dl className="label-mono space-y-1.5">
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
                          {entry.sourceLabel} ↗
                        </a>
                      ) : (
                        entry.sourceLabel
                      )}
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
                    <dt className="text-ink-secondary inline">receipt: </dt>
                    <dd className="inline">
                      {entry.receipt ? (
                        <>
                          <Link href={entry.receipt.href} className="link-draw">
                            {entry.receipt.label} ⟶
                          </Link>
                          {/* The paper remembers (W1): ✓ once the cited
                              case file has been opened */}
                          {receiptFileId(entry.receipt.href) ? (
                            <VisitedMark
                              fileId={receiptFileId(entry.receipt.href)!}
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
