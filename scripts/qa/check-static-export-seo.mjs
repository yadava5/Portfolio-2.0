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
const notFoundPath = path.join(outDir, "404.html");
if (fs.existsSync(notFoundPath)) {
  const html = fs.readFileSync(notFoundPath, "utf8");
  if (!/<meta name="robots" content="[^"]*noindex/.test(html)) {
    fail("404.html is indexable");
  }
  if (html.includes(`<title>${siteTitle}</title>`)) {
    fail("404.html carries the homepage title");
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Static SEO check passed.");
