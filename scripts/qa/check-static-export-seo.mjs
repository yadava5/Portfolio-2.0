import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const siteUrl = "https://yadava5.github.io/Portfolio-2.0";
const siteTitle = "Ayush Yadav | Software, Data, and ML Engineering";
const projectDir = path.join(outDir, "projects");
const projectRoutes = fs.existsSync(projectDir)
  ? fs
      .readdirSync(projectDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `/projects/${entry.name}/`)
      .sort()
  : [];
const requiredRoutes = ["/", "/resume.pdf", ...projectRoutes];

function fail(message) {
  console.error(`Static SEO check failed: ${message}`);
  process.exitCode = 1;
}

function htmlForRoute(route) {
  if (route === "/") return path.join(outDir, "index.html");
  return path.join(outDir, route.replace(/^\//, ""), "index.html");
}

for (const route of requiredRoutes) {
  const file =
    route === "/resume.pdf"
      ? path.join(outDir, "resume.pdf")
      : htmlForRoute(route);
  if (!fs.existsSync(file)) fail(`missing exported route ${route}`);
}

if (projectRoutes.length < 7) {
  fail(
    `expected at least 7 exported project routes, found ${projectRoutes.length}`
  );
}

const sitemapPath = path.join(outDir, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) fail("missing out/sitemap.xml");
const sitemap = fs.existsSync(sitemapPath)
  ? fs.readFileSync(sitemapPath, "utf8")
  : "";
for (const route of requiredRoutes.filter((route) => route !== "/resume.pdf")) {
  const expected = `${siteUrl}${route}`;
  if (!sitemap.includes(`<loc>${expected}</loc>`)) {
    fail(`sitemap missing ${expected}`);
  }
}

const robotsPath = path.join(outDir, "robots.txt");
if (!fs.existsSync(robotsPath)) fail("missing out/robots.txt");
const robots = fs.existsSync(robotsPath)
  ? fs.readFileSync(robotsPath, "utf8")
  : "";
if (!robots.includes(`${siteUrl}/sitemap.xml`)) {
  fail("robots.txt does not point at production sitemap");
}

const htmlFiles = requiredRoutes
  .filter((route) => route !== "/resume.pdf")
  .map((route) => [route, fs.readFileSync(htmlForRoute(route), "utf8")]);

for (const [route, html] of htmlFiles) {
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== `${siteUrl}${route}`) {
    fail(`bad canonical for ${route}: ${canonical ?? "missing"}`);
  }

  const imageUrls = [
    ...html.matchAll(
      /<meta (?:property|name)="(?:og:image|twitter:image)" content="([^"]+)"/g
    ),
  ].map((match) => match[1]);

  if (imageUrls.length === 0) {
    fail(`missing social image metadata for ${route}`);
  }

  for (const imageUrl of imageUrls) {
    if (!imageUrl.startsWith(`${siteUrl}/`)) {
      fail(
        `metadata image missing production base path for ${route}: ${imageUrl}`
      );
    }

    // CRITIC-LEDGER F25: four case studies pointed og:image at an
    // `*-architecture.svg`, declared 1200×630 — a format every major
    // platform rejects for Open Graph, so the flagship row shared as a
    // bare link. Two rules now hold: the card must be a raster, and it
    // must actually exist in the export.
    if (/\.svg($|\?)/i.test(imageUrl)) {
      fail(`social image for ${route} is an SVG (platforms reject it)`);
    }
    const assetPath = imageUrl.slice(siteUrl.length).replace(/^\//, "");
    if (!fs.existsSync(path.join(outDir, assetPath))) {
      fail(`social image for ${route} is not in the export: ${assetPath}`);
    }
  }

  // CRITIC-LEDGER F26: /evidence carried no openGraph block and
  // inherited the homepage's — og:url pointed at `/`. Every route's
  // og:url must be its own.
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  if (ogUrl && ogUrl.replace(/\/$/, "") !== `${siteUrl}${route}`.replace(/\/$/, "")) {
    fail(`og:url for ${route} points at ${ogUrl}`);
  }

  // CRITIC-LEDGER F23: no structured data anywhere, on a site whose
  // search surface is a name query.
  if (!html.includes('type="application/ld+json"')) {
    fail(`no JSON-LD on ${route}`);
  }
  if (!html.includes('"@type":"Person"')) {
    fail(`JSON-LD on ${route} carries no Person node`);
  }
}

// The evidence index is the funnel's destination — it gets the same
// gate as the routes above, plus its own social card.
const evidenceHtmlPath = path.join(outDir, "evidence", "index.html");
if (!fs.existsSync(evidenceHtmlPath)) {
  fail("missing exported route /evidence/");
} else {
  const html = fs.readFileSync(evidenceHtmlPath, "utf8");
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  if (ogUrl !== `${siteUrl}/evidence/`) {
    fail(`evidence og:url is ${ogUrl ?? "missing"}`);
  }
  if (!html.includes(`${siteUrl}/og/evidence.png`)) {
    fail("evidence does not carry its own social card");
  }
  if (!html.includes('"@type":"CollectionPage"')) {
    fail("evidence carries no CollectionPage JSON-LD");
  }
}

// CRITIC-LEDGER F51: `404.html` shipped the homepage title and
// inherited `index: true` from the root layout.
//
// Certification round, N6: the fix left TWO authorities. Next emits its
// own `<meta name="robots" content="noindex">` for the not-found route,
// and `not-found.tsx` exported `robots: {index:false, follow:true}` on
// top of it, so all three 404 outputs shipped two robots tags. They
// agreed — this time. A page gets ONE robots directive.
for (const notFound of ["404.html", "404/index.html", "_not-found/index.html"]) {
  const notFoundPath = path.join(outDir, notFound);
  if (!fs.existsSync(notFoundPath)) continue;
  const html = fs.readFileSync(notFoundPath, "utf8");
  const robotsTags = [
    ...html.matchAll(/<meta name="robots" content="([^"]*)"/g),
  ].map((match) => match[1]);
  if (robotsTags.length === 0 || !robotsTags.some((tag) => /noindex/.test(tag))) {
    fail(`${notFound} is indexable`);
  }
  if (robotsTags.length > 1) {
    fail(
      `${notFound} carries ${robotsTags.length} robots directives (${robotsTags.join(" | ")}) — one authority`
    );
  }
  if (html.includes(`<title>${siteTitle}</title>`)) {
    fail(`${notFound} carries the homepage title`);
  }
}

/* ── The one URL on this site that cannot be clicked ───────────────
   Certification round, N1. The social cards draw a colophon URL into
   the PNG — it is the site's address as a reader would RETYPE it, and
   it read `yadava5.github.io/portfolio-2.0` on all nine cards while
   every canonical, `<loc>` and `og:url` above said `Portfolio-2.0`.
   GitHub Pages paths are case-sensitive: the printed one 404s.

   Nothing can read text back out of a PNG, so the gate holds the two
   places the drawn string comes from instead: the renderer must derive
   its folio from `siteMetadata.url` (never a literal), and no lowercase
   spelling of the address may survive anywhere in the export. Both
   fail on the lowercase variant, which is the point. */
const ogRendererPath = path.join(root, "scripts/asset-truth/render-og-cards.mjs");
if (!fs.existsSync(ogRendererPath)) {
  fail("missing scripts/asset-truth/render-og-cards.mjs");
} else {
  const renderer = fs.readFileSync(ogRendererPath, "utf8");
  const folioRoot = siteUrl.replace(/^https?:\/\//, "");
  const [host] = folioRoot.split("/");
  for (const match of renderer.matchAll(
    new RegExp(`${host.replace(/\./g, "\\.")}[^\\s"'\`)]*`, "gi")
  )) {
    if (!match[0].startsWith(folioRoot)) {
      fail(
        `og card renderer prints "${match[0]}" — the site is ${folioRoot} (paths are case-sensitive)`
      );
    }
  }
  const folios = [...renderer.matchAll(/folio:\s*([^,\n]+)/g)].map((m) => m[1]);
  if (folios.length === 0) fail("og card renderer declares no folio lines");
  for (const folio of folios) {
    if (!folio.includes("FOLIO_ROOT")) {
      fail(`og card folio ${folio} is not derived from siteMetadata.url`);
    }
  }
}

const exportedFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(html|txt|xml)$/.test(entry.name)) exportedFiles.push(full);
  }
})(outDir);
const lowercaseAddress = new RegExp(
  siteUrl.replace(/^https?:\/\//, "").replace(/\./g, "\\."),
  "i"
);
for (const file of exportedFiles) {
  for (const match of fs
    .readFileSync(file, "utf8")
    .matchAll(new RegExp(lowercaseAddress.source, "gi"))) {
    if (!match[0].startsWith(siteUrl.replace(/^https?:\/\//, ""))) {
      fail(
        `${path.relative(outDir, file)} prints "${match[0]}" — the site is ${siteUrl.replace(/^https?:\/\//, "")}`
      );
    }
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Static SEO check passed.");
