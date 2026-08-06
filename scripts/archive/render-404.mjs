/**
 * 404.html — the notice page, set in the paper's own hand.
 *
 * GitHub Pages serves this file for EVERY unmatched path, at whatever
 * URL the reader mistyped — so unlike the other pages nothing here may
 * be relative: assets and links are the full published addresses,
 * because a page that cannot know where it is can only cite where
 * things are. Canonical goes to `/` and the robots directive is a
 * single noindex (html.mjs holds the one-directive rule).
 *
 * The wayfinding index reads STATIONS, ends-trimmed exactly as
 * not-found.tsx ruled: the first stop is the front page (the folio
 * already offers it — listing it would restore the duplicate exit) and
 * the last is the morning behind the approval gate (its id resolves,
 * but nothing brings it into view until a reader signs, so a link to it
 * would be a link that appears to do nothing). Both halves of every row
 * keep `wrap-anywhere` — the row was measured overflowing at every
 * width below 430px before that fix, and the fix travels with the row.
 */
import { esc, head, document_ } from "./html.mjs";
import { masthead, colophon, stationNo, assetHead } from "./partials.mjs";

function indexRow({ href, label, note }) {
  return `<li class="irow"><a class="wrap-any" href="${esc(href)}">${esc(label)} ⟶</a><span class="lead" aria-hidden="true"></span><span class="inote wrap-any">${esc(note)}</span></li>`;
}

export function renderNotFound({ stations, seo, siteMetadata }) {
  const RUN = siteMetadata.url;
  const stops = stations.slice(1, -1);

  const rows = [
    ...stops.map((station) =>
      indexRow({
        href: `${RUN}/#${station.id}`,
        label: station.name,
        note: `¶ ${stationNo(station)} · ${station.clock}`,
      })
    ),
    indexRow({
      href: `${RUN}/evidence/`,
      label: "the evidence index",
      note: "every claim on file",
    }),
  ].join("\n            ");

  const body = `${masthead(RUN, "the record room · not on file")}
    <main id="main-content">
    <section class="dossier notice" id="not-found">
      <div class="wrap">
        <p class="kickline">¶ not on file — nothing at this address</p>
        <header class="filehead">
          <h1>Not on file</h1>
          <p class="deck">The address you asked for was never filed here — nothing has been lost or moved. What this paper does hold is listed below: the stations of one workday, and the ledger that backs every number in them.</p>
        </header>
        <nav aria-labelledby="on-file" class="onfile">
          <h2 id="on-file" class="seckick">what is on file</h2>
          <ul>
            ${rows}
          </ul>
        </nav>
        <footer class="folio">
          <div class="rule" aria-hidden="true"><span></span><span class="rlabel">not on file</span><span></span></div>
          <p class="backhome"><a href="${esc(RUN)}/">back to the front page ⟵</a></p>
        </footer>
      </div>
    </section>
    </main>
    ${colophon(RUN)}`;

  return document_({
    headHtml: head({
      seo,
      siteMetadata,
      route: "/404.html",
      title: "Not on file | Ayush Yadav",
      description:
        "That page is not on file. The stations of the run, the case files, and the evidence index are.",
      image: "/og/home.png",
      ogType: "website",
      noindex: true,
      canonical: `${siteMetadata.url}/`,
      jsonLd: seo.siteGraph(),
      extraHead: assetHead(`${RUN}/`),
    }),
    body,
    bodyClass: "archive notfound",
  });
}
