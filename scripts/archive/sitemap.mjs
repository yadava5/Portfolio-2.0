/**
 * sitemap.xml and robots.txt, from the same data the case files print.
 *
 * `lastModified` is each case file's OWN `verified` date — the field its
 * kicker prints as "last verified YYYY-MM" — so the two can never disagree
 * again. CRITIC-LEDGER F50: this was one hardcoded `new Date("2026-06-07")` on
 * all nine URLs, seven weeks stale, on a site whose pages each dated
 * themselves. The sitemap was contradicting the pages it indexes.
 *
 * `verified` is YYYY-MM, the precision on record, so it resolves to the first
 * of that month rather than inventing a day. The two index pages report the
 * newest of the files, which is exactly what they are: a view over them.
 */

const verifiedDate = (verified) => new Date(`${verified}-01T00:00:00Z`);

/** Next wrote `<lastmod>` as a full ISO instant; keep that shape. */
const stamp = (date) => date.toISOString();

export function sitemapXml({ studies, siteMetadata }) {
  const byId = new Map(studies.map((s) => [s.projectId, verifiedDate(s.verified)]));
  const newest = new Date(Math.max(...[...byId.values()].map((d) => d.getTime())));

  const entries = [
    { loc: `${siteMetadata.url}/`, mod: newest, freq: "monthly", pri: "1" },
    ...studies.map((s) => ({
      loc: `${siteMetadata.url}/projects/${s.projectId}/`,
      mod: byId.get(s.projectId) ?? newest,
      freq: "monthly",
      pri: "0.8",
    })),
    { loc: `${siteMetadata.url}/evidence/`, mod: newest, freq: "monthly", pri: "0.6" },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `<url><loc>${e.loc}</loc><lastmod>${stamp(e.mod)}</lastmod><changefreq>${e.freq}</changefreq><priority>${e.pri}</priority></url>`
  )
  .join("\n")}
</urlset>
`;
}

/**
 * `/world-preview/` is the day-arc test bench — 6,465px of stub chapters, no
 * `<h1>`. It carries noindex in its own metadata, but robots.txt said
 * `Allow: /` and nothing else, so the one file that tells a crawler where NOT
 * to go was silent about the only page on the site that is not for readers
 * (CRITIC-LEDGER F24).
 *
 * THE DISALLOW OUTLIVES THE ROUTE ONLY IF SOMEONE IS CARELESS. The bench is a
 * Next route and dies with the app in the next phase; this line goes in that
 * same change, never later. A robots.txt naming a path that has not existed
 * for a year is the same class of stale record as the sitemap above.
 */
export function robotsTxt({ siteMetadata }) {
  return `User-Agent: *
Allow: /
Disallow: /world-preview/

Sitemap: ${siteMetadata.url}/sitemap.xml
`;
}
