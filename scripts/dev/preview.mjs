/**
 * The preview server, whose ONE real job is the seam.
 *
 * `tests/playwright/static-server.mjs` already serves `out/` correctly — every
 * local asset in this site is relative and nothing 404s at a root mount. That
 * is not the problem this file exists for. The problem is that the seam between
 * the run and the archive is hard-coded to the PRODUCTION origin in both
 * directions: `out/index.html` alone carries 13 distinct clickable
 * `https://yadava5.github.io/Portfolio-2.0…` links, and every generated archive
 * page rejoins the line through the same origin. So under any local mount, the
 * first click out of a page LEAVES for the deployed site — which is `main`,
 * pre-migration, tens of commits behind whatever is being previewed. A reviewer
 * clicks into a case study and is silently reading a different site.
 *
 * This rewrites that origin to the preview's own, in the HTML it serves, at
 * serve time. NOTHING ON DISK CHANGES: `out/` stays byte-identical, the golden
 * hash is untouched, and the deploy artifact is whatever the build wrote.
 *
 * WHY NOT RELATIVISE THE HREFS IN SOURCE, which is the obvious fix and is
 * wrong: `check-links.mjs` defines `SITE` as that origin and enforces the
 * `↗` / `⟶` glyph contract as a rule ABOUT the link's origin, and
 * `check-crosswalk.mjs` resolves the same absolute URLs back to local files.
 * Relativising reopens the glyph contract and breaks two gates to fix a
 * problem that only exists before the first deploy.
 *
 * WHY NOT IMPORT static-server.mjs's RESOLVER: that file resolves
 * `process.cwd()/out` at module scope and calls `server.listen` at import — it
 * is a script, not a module, and `playwright.config`'s `webServer` depends on
 * it starting exactly that way. Importing it would start a second server on
 * port 3000 as a side effect. The resolver is ~25 lines and is copied here
 * deliberately rather than refactoring a file the test harness boots.
 *
 *   npm run preview            serve out/ on 4300
 *   PORT=5000 npm run preview  somewhere else
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.cwd(), "out");
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4300);

/** the origin the built site is hard-coded to, and the only string rewritten */
const PROD_ORIGIN = "https://yadava5.github.io/Portfolio-2.0";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".pdf", "application/pdf"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".wasm", "application/wasm"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const normalizedPath = normalize(decodedPath).replace(
    /^(\.\.(\/|\\|$))+/,
    ""
  );
  const filePath = join(root, normalizedPath);

  if (!filePath.startsWith(root + sep) && filePath !== root) return null;
  if (existsSync(filePath) && statSync(filePath).isDirectory())
    return join(filePath, "index.html");
  if (existsSync(filePath)) return filePath;

  const nestedIndex = join(filePath, "index.html");
  if (existsSync(nestedIndex)) return nestedIndex;

  const fallback404 = join(root, "404.html");
  return existsSync(fallback404) ? fallback404 : null;
}

if (!existsSync(join(root, "index.html"))) {
  console.error(
    "out/ not found. Run `NEXT_PUBLIC_BASE_PATH= npm run build` first. " +
      "The variable keeps its Next-era name and is still live — " +
      "src/lib/basePath.ts reads it; the framework is gone, the name is not."
  );
  process.exit(1);
}

/* Inline, because a preview that fetches its own banner is a preview that can
   fail to draw the one thing telling you it is a preview. `all: initial` so the
   site's own cascade — which styles bare elements freely — cannot reach it.
   BOTTOM-LEFT AND COMPACT, not a full-width bar: the run parks its `run 042 —
   manifest N / 6` panel bottom-RIGHT and the masthead runs across the top, so
   both of the obvious placements cover something the reader is here to read.
   This is the only corner the run leaves empty at every station. */
const banner = (origin) => `<div id="__preview-banner" role="status" style="\
all: initial; position: fixed; z-index: 2147483647; left: 10px; bottom: 10px;\
font: 11px ui-monospace, 'Fragment Mono', monospace; color: #f2e4c9;\
background: #2b2622; padding: 5px 9px; border-radius: 3px; opacity: .92;\
letter-spacing: .03em; max-width: 40vw;">\
preview · <b style="all: initial; font: inherit; color: #e0754a">${origin}</b>\
 — the deployed origin is rewritten in the response only</div>`;

const server = createServer((request, response) => {
  const filePath = resolveRequestPath(request.url ?? "/");

  if (!filePath) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const type =
    contentTypes.get(extname(filePath)) ?? "application/octet-stream";
  const status = filePath.endsWith("404.html") ? 404 : 200;

  /* HTML is rewritten; everything else streams untouched. Fonts, wasm and the
     proof JSON are bytes a reader may checksum — do not go near them. */
  if (extname(filePath) === ".html") {
    const origin = `http://${host}:${port}`;
    let html = readFileSync(filePath, "utf8").split(PROD_ORIGIN).join(origin);
    html = html.replace(/(<body[^>]*>)/i, `$1${banner(origin)}`);
    response.writeHead(status, {
      "Content-Type": type,
      "Cache-Control": "no-store",
    });
    response.end(html);
    return;
  }

  response.writeHead(status, { "Content-Type": type });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`preview: serving ${root} at http://${host}:${port}`);
  console.log(`preview: rewriting ${PROD_ORIGIN} → http://${host}:${port}`);
});
