import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const siteUrl = "https://yadava5.github.io/Portfolio-2.0";
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
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Static SEO check passed.");
