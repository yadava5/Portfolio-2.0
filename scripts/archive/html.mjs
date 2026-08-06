/**
 * The archive's document shell — the head every generated page carries, and
 * the two escaping rules everything below it goes through.
 *
 * WHY THE HEAD IS HERE AND NOT IN THE PAGE TEMPLATES. `check-static-export-seo.mjs`
 * gates the production deploy on it, route by route: the canonical must be the
 * route's own, the social image must be a raster that actually exists in the
 * export, `og:url` must not be inherited from the home page (it was, on
 * /evidence, and that is CRITIC-LEDGER F26), and every route must carry a
 * Person node. Those are correctness, not design, so they live in one place
 * the page templates cannot get wrong by omission.
 *
 * The field set and its ORDER reproduce what Next emitted for these routes,
 * measured from out/ on 2026-08-06 — including `og:image:alt`, which only the
 * case files carry, and `article:published_time` / `article:modified_time`,
 * which are the `filed` and `verified` dates the kicker already prints.
 */

/**
 * React's escaping, which is what produced the bytes these pages replace.
 *
 * Curly quotes, em dashes and the ¶ are NOT in the set and stay literal — the
 * archive's prose is full of all three, and escaping them would be a visible
 * change to a page nobody asked to change.
 */
export const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

/** Text content — the same rules; kept separate so a caller has to choose. */
export const escText = esc;

/**
 * The full `<head>` for one route.
 *
 * @param {object} o
 * @param {object} o.seo          the compiled src/lib/seo.ts
 * @param {object} o.siteMetadata the compiled siteMetadata
 * @param {string} o.route        site-absolute, WITH its trailing slash
 * @param {string} o.title
 * @param {string} o.description
 * @param {string} o.image        site-absolute path to the social raster
 * @param {string} [o.imageAlt]
 * @param {"website"|"article"} o.ogType
 * @param {boolean} [o.noindex]
 * @param {string} [o.canonical]  override, for 404 (which canonicals to `/`)
 * @param {{published: string, modified: string}} [o.article]
 * @param {object} o.jsonLd       the graph object for this route
 * @param {string} [o.extraHead]  anything the page adds (stylesheet, script)
 */
export function head({
  seo,
  siteMetadata,
  route,
  title,
  description,
  image,
  imageAlt,
  ogType,
  noindex = false,
  canonical,
  article,
  jsonLd,
  extraHead = "",
}) {
  const url = `${siteMetadata.url}${route}`;
  const imageUrl = seo.absoluteSiteUrl(image);
  const tags = [
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${escText(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<meta name="author" content="Ayush Yadav">`,
    `<meta name="keywords" content="${esc(siteMetadata.keywords.join(","))}">`,
    /* ONE robots directive, never two. Next emitted its own noindex for the
       not-found route while not-found.tsx exported another on top of it, and
       both 404 outputs shipped a pair that happened to agree. The SEO gate
       fails on more than one. */
    `<meta name="robots" content="${noindex ? "noindex" : "index, follow"}">`,
    `<link rel="canonical" href="${esc(canonical ?? url)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:site_name" content="${esc(siteMetadata.title)}">`,
    `<meta property="og:image" content="${esc(imageUrl)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    ...(imageAlt ? [`<meta property="og:image:alt" content="${esc(imageAlt)}">`] : []),
    `<meta property="og:type" content="${ogType}">`,
    ...(article
      ? [
          `<meta property="article:published_time" content="${esc(article.published)}">`,
          `<meta property="article:modified_time" content="${esc(article.modified)}">`,
        ]
      : []),
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${esc(imageUrl)}">`,
    `<link rel="shortcut icon" href="${esc(seo.absoluteSiteUrl("/favicon.ico"))}">`,
    `<link rel="icon" href="${esc(seo.absoluteSiteUrl("/favicon.svg"))}">`,
    `<script type="application/ld+json">${seo.jsonLdHtml(jsonLd)}</script>`,
  ];
  return `${tags.join("\n    ")}${extraHead ? `\n    ${extraHead}` : ""}`;
}

/**
 * The whole document.
 *
 * THE SKIP LINK IS NOT DECORATION AND IT IS NOT THE PAGE'S TO OMIT. It came
 * from the root layout, so no case-file component ever mentioned it, and a
 * rebuild that walks the page components would lose every archive page's
 * keyboard entry without one line of diff to notice. It is set in Fragment
 * Mono deliberately (CRITIC-LEDGER F34): it is the FIRST thing a keyboard
 * reader sees, and it used to be the one element on the site rendering in
 * ui-sans-serif while the colophon claimed three faces.
 */
export function document_({ headHtml, body, bodyClass = "" }) {
  return `<!doctype html>
<html lang="en">
  <head>
    ${headHtml}
  </head>
  <body${bodyClass ? ` class="${bodyClass}"` : ""}>
    <a class="skip-link" href="#main-content">Skip to main content</a>
${body}
  </body>
</html>
`;
}
