/**
 * /evidence/ — the master ledger, rendered whole.
 *
 * Contract §E, reproduced: fourteen numbered entries (`e-NN`, the count
 * printed live from the manifest's own length, never hardcoded), each a
 * deep-link target (`id={entry.id}`, data-receipt-row — the same
 * asked-for grammar as a case-file receipt), with the dl terms verbatim:
 * source: / date: / verification: / argued in: / boundary:. Eleven
 * entries crosswalk into a case-file receipt row; three say plainly that
 * the repository is the record.
 *
 * The `held` apparatus is not rendered: zero manifest entries carry it
 * today (the one that did was EARNED on 2026-07-27 and the stamp came
 * off in the data). Omitting the branch is a decision the report
 * records — when a held entry returns, this file grows the block back.
 */
import { esc, head, document_ } from "./html.mjs";
import {
  sitePath,
  auditGlyph,
  visibilityGlyph,
  VISIBILITY_LABEL,
  visitedMark,
  masthead,
  colophon,
  assetHead,
} from "./partials.mjs";

const PREFIX = "../";

const EVIDENCE_TITLE = "The Evidence Index | Ayush Yadav";
const EVIDENCE_DESCRIPTION =
  "The master ledger behind the portfolio: every claim, its source, how it was verified, its visibility, and its privacy boundary.";

/** The honest qualifier on a source's independence (F55) — verbatim. */
const SOURCE_KIND_NOTE = {
  "self-hosted": "[self-hosted — checked into this site’s repository]",
  "self-authored": "[self-authored — the author’s own documentation]",
};

/** URLs link out with ↗; checked-in `public/…` paths never left this
 *  origin, so they take ⟶ and a page-relative href (F41's glyph law). */
function sourceLink(source) {
  if (source.startsWith("http")) return { href: source, external: true };
  if (source.startsWith("public/"))
    return {
      href: sitePath(PREFIX, source.replace(/^public/, "")),
      external: false,
    };
  return null;
}

/** The case file a receipt lands in — the visited ✓'s subject. */
const receiptFileId = (href) =>
  href.match(/^\/projects\/([^/]+)\//)?.[1] ?? null;

/** The glance caption, with the separator carrying the meaning: `·`
 *  joins the parts that sum to the total; an em dash introduces the
 *  held SUBSET, so the arithmetic reads (N5's ruling, ported). */
function ledgerCaption(entries) {
  const count = (v) => entries.filter((e) => e.visibility === v).length;
  const held = entries.filter((e) => e.held).length;
  const parts = [`${entries.length} entries`];
  if (count("public")) parts.push(`${count("public")} public`);
  if (count("private-safe"))
    parts.push(`${count("private-safe")} private-safe`);
  if (count("local-only"))
    parts.push(`${count("local-only")} local — verified on request`);
  const sum = parts.join(" · ");
  return held === 0 ? sum : `${sum} — ${held} of them held, not yet earned`;
}

function ledgerGlance(entries) {
  const marks = entries
    .map(
      (e) =>
        `<span data-glance-vis="${esc(e.visibility)}">${visibilityGlyph(e.visibility)}${e.held ? `<span data-glance-held class="heldmark">${auditGlyph("held")}</span>` : ""}</span>`
    )
    .join("");
  return `<figure class="glance ledger-glance" data-proof-glance>
          <div class="gmarks" aria-hidden="true">${marks}</div>
          <figcaption>at a glance — ${esc(ledgerCaption(entries))}</figcaption>
        </figure>`;
}

function entryRow(entry, index) {
  const link = sourceLink(entry.source);
  const source = link
    ? `<a href="${esc(link.href)}"${link.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(entry.sourceLabel)} ${link.external ? "↗" : "⟶"}</a>`
    : esc(entry.sourceLabel);
  const kind = entry.sourceKind
    ? `<span class="skind">${esc(SOURCE_KIND_NOTE[entry.sourceKind])}</span>`
    : "";
  const fileId = entry.receipt ? receiptFileId(entry.receipt.href) : null;
  const argued = entry.receipt
    ? `<a href="${esc(sitePath(PREFIX, entry.receipt.href))}">${esc(entry.receipt.label)} ⟶</a>&#x2009;${
        fileId
          ? visitedMark(
              fileId,
              "you opened this case file — your reading history"
            )
          : ""
      }`
    : "no case file — the repository is the record";
  return `<li id="${esc(entry.id)}" data-receipt-row>
            <div class="ehead"><p class="eno">e-${String(index + 1).padStart(2, "0")}</p>
              <p class="evis"><span class="sr-only">visibility: </span>${visibilityGlyph(entry.visibility)} ${esc(VISIBILITY_LABEL[entry.visibility])}</p></div>
            <div class="ebody">
              <div class="eclaim"><h2>${esc(entry.label)}</h2><p>${esc(entry.claim)}</p></div>
              <dl>
                <div><dt>source: </dt><dd>${source}${kind}</dd></div>
                <div><dt>date: </dt><dd>${entry.date ? esc(entry.date) : "not recorded"}</dd></div>
                <div><dt>verification: </dt><dd>${esc(entry.verification)}</dd></div>
                <div><dt>argued in: </dt><dd>${argued}</dd></div>
                <div><dt>boundary: </dt><dd>${esc(entry.privacyBoundary)}</dd></div>
              </dl>
            </div>
          </li>`;
}

export function renderEvidence({ entries, stations, seo, siteMetadata }) {
  const RUN = siteMetadata.url;
  /* The ledger belongs to the review, and now it is returned there.
     `back to the work ⟵` → /#work sent every reader of this page to ¶04 at
     08:47 — the same wrong-hour defect the case files' rejoin links just
     cured, left standing on the one page the review itself now links. ¶10 is
     where the litany cites these rows and where the run's own door into this
     index is. Read from stations.ts so the ¶ number, the name and the clock
     cannot drift from the page they name. */
  const review = stations.find((s) => s.id === "review");
  if (!review) throw new Error("renderEvidence: no review station in stations.ts");
  const reviewPara = String(review.beat + 1).padStart(2, "0");

  const body = `${masthead(RUN, "the record room · the evidence index")}
    <main id="main-content">
    <article class="dossier evidence" data-dossier>
      <div class="wrap">
        <p class="kickline">¶ the evidence index — every claim on file · ${entries.length} entries</p>
        <header class="filehead">
          <h1 data-thread-title>The evidence index</h1>
          <p class="deck">The master ledger behind every number on this site: the claim, the strongest artifact it terminates at, when it was recorded, and the case-file receipt that argues it in full. If a claim is not in this ledger or a case file, the site does not make it — apart from two registers that terminate in documents this site cannot publish. The biographical one (degree, dean’s list, GPA, certificates, the MUCAT grant) rests on the transcript and the awards themselves. The institutional one — the OAS and Tableau figures at ¶03 — is read off Miami’s own systems, and only the sanitised inventory ledger made it out. Both are verifiable on request; neither is dressed as if a link would settle it.</p>
        </header>
        ${ledgerGlance(entries)}
        <ol class="eledger">
          ${entries.map(entryRow).join("\n          ")}
        </ol>
        <footer class="folio">
          <div class="rule" aria-hidden="true"><span></span><span class="rlabel">the evidence index</span><span></span></div>
          <div class="folio-links">
            <a class="rejoin" href="${esc(RUN)}/#${esc(review.id)}">⟵ rejoin the line at ¶ ${reviewPara} · ${esc(review.name)} — ${esc(review.clock)}</a>
            <a class="onward folio-seat" href="${PREFIX}projects/automl/">first case file — agentic automl ⟶</a>
          </div>
        </footer>
      </div>
    </article>
    </main>
    ${colophon(RUN)}`;

  return document_({
    headHtml: head({
      seo,
      siteMetadata,
      route: "/evidence/",
      title: EVIDENCE_TITLE,
      description: EVIDENCE_DESCRIPTION,
      image: "/og/evidence.png",
      imageAlt: "The evidence index — Ayush Yadav’s proof ledger",
      ogType: "website",
      jsonLd: seo.evidenceGraph(entries.length),
      extraHead: assetHead(PREFIX),
    }),
    body,
    bodyClass: "archive evidence-page",
  });
}
