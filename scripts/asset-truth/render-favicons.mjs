/**
 * Render the site mark — public/favicon.svg, drawn BY THE PAGE, to the two
 * rasters browsers still insist on.
 *
 * What shipped before this script: a Next-era `favicon.ico` holding a black
 * disc with a white triangle, and a `favicon.svg` that set "AY" as `<text>`
 * in a purple→fuchsia gradient on near-black. The SVG broke NO-LIST §A
 * three times over and never rendered in the face it named — `<text>` in a
 * favicon sets in whatever the host has — and nothing linked it from the
 * home page anyway, so every browser fell back to requesting `/favicon.ico`
 * and every tab showed the triangle. A drawn pilcrow replaced them on
 * 2026-10-06 and the owner read it as a reversed P. Three letterforms, three
 * losses; the mark is no longer a letter.
 *
 * THE SVG IS NOT AUTHORED HERE ANY MORE. It is `markSvg` in
 * src/run/index.html, beside the arc it draws from, and this script opens
 * the run in a browser and asks the page for it:
 * `window.__mark.still()`. The mark is live — Chromium and Firefox take a
 * redrawn SVG as the reader scrolls, and the tab follows the reader's wall
 * clock while it is hidden — so the file on disk is nothing more than that
 * same function at dawn, which is where a reader who has not scrolled yet
 * actually is. Deriving it rather than keeping a second copy is what makes
 * the handover invisible: there is one drawing, so the still a tab paints
 * before the page boots is the first frame the page would have drawn.
 *
 * Chromium draws the rasters because Chromium is where the SVG actually
 * ships: a mark judged in the engine that will paint it in the tab strip is
 * a mark judged honestly. `sharp` then re-encodes the raw screenshot pixels,
 * so the committed bytes depend on the pixels rather than on whatever PNG
 * encoder the browser build carries.
 *
 * The ICO container is assembled here in plain Node rather than pulled in
 * as a dependency. It is 6 bytes of header, 16 per entry, and the PNGs —
 * a dependency for that is a dependency for nothing. PNG-compressed
 * entries have been read since Windows Vista and by every browser in this
 * site's support matrix; the older uncompressed BMP form buys nothing here.
 *
 * THE MARK, and why it is this one (2026-10-07, every claim rasterised in
 * Chromium at 16, 32 and 48 before choosing). The field is the hour, the
 * seam is the path the page's sun travels across the day, and the disc IS
 * that sun, held still at the top of the arch with the seam threaded behind
 * it: the 48px entry of the ICO below is what a search row shows beside the
 * owner's name, and a row is recognised, not read, so the mark has to be one
 * silhouette rather than a scene. Why the arch has the proportions it has,
 * why there are seven stitches and not thirteen, why the pigment is picked
 * off the field's own luminance rather than off the night flag, and why the
 * still is the frame with the thread at rest, are all argued where the
 * drawing lives, with the rasters that decided each one.
 *
 * Colour: the still is the text clay #a03f20 on the dawn paper #fbf3e7,
 * measured on the icon's own ground at 5.91:1 / APCA Lc 74.9. There IS a
 * night variant now, but only in the SVG: `colorScheme: "light"` below keeps
 * it out of the rasters, because the ICO and the touch icon have no reader
 * and no scroll position, and a render host sitting in dark mode must never
 * be able to bake one hour of the day into a file that answers for all of
 * them.
 *
 * Usage:
 *   node scripts/asset-truth/render-favicons.mjs           # render
 *   node scripts/asset-truth/render-favicons.mjs --check   # verify only
 */
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const svgPath = path.join(publicDir, "favicon.svg");
const icoPath = path.join(publicDir, "favicon.ico");
const touchPath = path.join(publicDir, "apple-touch-icon.png");
const manifestPath = path.join(publicDir, "icons.manifest.json");
const CHECK_ONLY = process.argv.includes("--check");

const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

/**
 * The one XML mistake this file invites, caught without a parser.
 *
 * A tab fetches favicon.svg as image/svg+xml and reads it with an XML
 * parser. Two consecutive hyphens inside a comment are a well-formedness
 * error there, and the mark's comment has every reason to want them — it
 * documents CSS custom properties, which are spelled with exactly that.
 * The first draft of the mark carried one. Chromium's HTML parser forgave
 * it, so it rendered in every raster drawn here and in every local check,
 * and expat did not, so Firefox alone would have shown a blank tab. That
 * is the shape of loss this repo keeps meeting: a drawn asset can only be
 * wrong quietly. Node ships no XML parser, so this looks for the specific
 * fault rather than validating the document, and the renderer below also
 * decodes the file as an image, which is the parser a tab actually uses.
 */
function xmlCommentFault(source) {
  for (const [, body] of source.matchAll(/<!--([\s\S]*?)-->/g)) {
    if (body.includes("--")) {
      return `a comment contains a double hyphen: "…${body.slice(Math.max(0, body.indexOf("--") - 30), body.indexOf("--") + 10).replace(/\s+/g, " ")}…"`;
    }
  }
  if (/<!--(?![\s\S]*?-->)/.test(source)) return "a comment is never closed";
  return null;
}

/* 16 is the tab strip and the bookmark bar — the size the mark was drawn
   for. 32 is the retina tab and the Windows taskbar, 48 the desktop
   shortcut. No 256 entry: anything larger than 48 is served by the SVG in
   every browser that takes one, and by the touch icon on iOS. */
const ICO_SIZES = [16, 32, 48];
/* 180 is the iPhone Retina home-screen tile and the largest size iOS asks
   for; everything smaller it downsamples itself. */
const TOUCH_SIZE = 180;

/* ── The drift gate ───────────────────────────────────────────────────
   Two halves, the same pair the OG cards carry (see render-og-cards.mjs):

     svg — sha256 of public/favicon.svg, recomputed on every check. Edit
           the SVG and forget to re-render, and the rasters on disk argue
           a logo the site no longer has. This is the DRIFT check, and it
           is the one that matters: a drawn asset can only be wrong
           quietly.
           WHAT IT NO LONGER COVERS, now the SVG is derived from the page:
           it hashes the OUTPUT, so editing `markSvg` — or WAY[0], which is
           the dawn field it draws on — without re-rendering leaves this
           green over a stale file. Closing that would mean running the
           drawing, which means a browser, which is the one thing this
           half must not need (below). The rebuild is the renderer's job
           and the run's own golden hash is what moves when the drawing does.
     ico / png — sha256 of the committed rasters. If either is replaced,
           truncated or run through an optimizer, this moves.

   The check re-hashes rather than re-renders deliberately, and that is
   what keeps it browserless: proof-manifest installs no browsers, and a
   gate that needs one would either be skipped there or would fail on a
   Chromium version bump that changed nothing a reader can see. ── */

if (CHECK_ONLY) {
  let failed = false;
  const fail = (message) => {
    console.error(`Site mark check failed: ${message}`);
    failed = true;
  };

  let manifest = null;
  if (!fs.existsSync(manifestPath)) {
    fail(
      "missing public/icons.manifest.json — run `npm run assets:render-favicons`"
    );
  } else {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (error) {
      fail(`public/icons.manifest.json is not readable JSON (${error})`);
    }
  }

  if (!fs.existsSync(svgPath)) {
    fail("missing public/favicon.svg — rerun the renderer; markSvg draws it");
  } else {
    const fault = xmlCommentFault(fs.readFileSync(svgPath, "utf8"));
    if (fault) {
      fail(
        `public/favicon.svg is not well-formed XML — ${fault}. ` +
          "Every tab parses this file as XML; Chromium's HTML parser does not."
      );
    }
  }
  if (fs.existsSync(svgPath) && manifest) {
    const svg = sha256(fs.readFileSync(svgPath));
    if (manifest.svg !== svg) {
      fail(
        `public/favicon.svg has moved since the rasters were drawn ` +
          `(${String(manifest.svg).slice(0, 12)} → ${svg.slice(0, 12)}). ` +
          "Run `npm run assets:render-favicons` and commit the result."
      );
    }
  }

  for (const [file, target] of [
    ["favicon.ico", icoPath],
    ["apple-touch-icon.png", touchPath],
  ]) {
    if (!fs.existsSync(target)) {
      fail(`missing public/${file}`);
      continue;
    }
    const recorded = manifest?.outputs?.[file];
    if (!recorded) {
      if (manifest) fail(`${file} has no entry in icons.manifest.json`);
      continue;
    }
    const actual = sha256(fs.readFileSync(target));
    if (recorded !== actual) {
      fail(
        `public/${file} bytes do not match the manifest ` +
          `(${recorded.slice(0, 12)} → ${actual.slice(0, 12)}) — ` +
          "the file was changed by something other than the renderer."
      );
    }
  }

  const known = new Set(["favicon.ico", "apple-touch-icon.png"]);
  for (const file of Object.keys(manifest?.outputs ?? {})) {
    if (!known.has(file)) {
      fail(`icons.manifest.json lists ${file}, which this renderer never writes`);
    }
  }

  if (failed) process.exit(1);
  console.log(
    `Site mark check passed — favicon.svg, a ${ICO_SIZES.join("/")} ICO and ` +
      `the ${TOUCH_SIZE}px touch icon all agree with the manifest.`
  );
  process.exit(0);
}

/* Below this line a browser is required, so the imports sit here rather than
   at the top: `--check` above must run on a host that has none. */
const { chromium } = await import("@playwright/test");
const { default: sharp } = await import("sharp");

/**
 * The ICO container. Header, one 16-byte directory entry per size, then the
 * PNGs end to end.
 *
 * `bitCount` is declared 32 and the entries keep their alpha channel to
 * match — the ground is opaque paper, so the channel compresses to nothing
 * and the directory stays truthful about what follows it. A directory that
 * lies about its own payload is the kind of thing that works in three
 * browsers and not the fourth.
 */
function assembleIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(entries.length, 4);

  const directory = [];
  let offset = header.length + entries.length * 16;
  for (const { size, png } of entries) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // width  (0 would mean 256)
    entry.writeUInt8(size, 1); // height
    entry.writeUInt8(0, 2); // palette colours — 0 for truecolour
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    directory.push(entry);
  }
  return Buffer.concat([
    header,
    ...directory,
    ...entries.map((entry) => entry.png),
  ]);
}

/**
 * The run, served so the page can draw its own icon.
 *
 * `markSvg` lives inside src/run/index.html and the page reaches its fonts
 * and its wasm by relative path, so the file cannot be opened over `file://`
 * and cannot be read in with `setContent` either — both leave those requests
 * resolving against the wrong root, and a page that threw while booting is a
 * page whose `window.__mark` may never appear. An ephemeral port, because
 * nothing else about this script owns a port and a fixed one would collide
 * with whatever the reviewer has open.
 *
 * The content types are the short list this one page actually asks for.
 * `.wasm` and `.woff2` are the two that matter: served as anything else they
 * fail in the fetch rather than in the parse, which surfaces as a request
 * failure and not as an exception — hence the listener on both below.
 */
const RUN_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".bin", "application/octet-stream"],
  [".wasm", "application/wasm"],
  [".woff2", "font/woff2"],
]);
const runRoot = path.join(root, "src", "run");
const runServer = http.createServer((req, res) => {
  const rel = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const file = path.join(runRoot, path.normalize(rel) === "/" ? "index.html" : path.normalize(rel));
  if (!file.startsWith(runRoot + path.sep) || !fs.existsSync(file)) {
    res.writeHead(404).end("not here");
    return;
  }
  res.writeHead(200, {
    "content-type": RUN_TYPES.get(path.extname(file)) ?? "application/octet-stream",
  });
  fs.createReadStream(file).pipe(res);
});
await new Promise((ready) => runServer.listen(0, "127.0.0.1", ready));
const runOrigin = `http://127.0.0.1:${runServer.address().port}`;

const browser = await chromium.launch();
/* `colorScheme: "light"` is not belt and braces. The SVG has a night half
   now, and a render host sitting in dark mode must never be able to bake an
   hour of the day into the rasters: the ICO and the touch icon are the dawn
   paper by construction, and only the SVG is ever free to answer the reader.
   It is also what the run itself reads for its reduced-motion night world,
   so the page below boots into the day. */
const page = await browser.newPage({
  colorScheme: "light",
  deviceScaleFactor: 1,
});

/* A page that throws on the way to `window.__mark` would otherwise be a
   timeout with no cause in it, and a font or wasm the server above cannot
   find never throws at all. Both are collected and reported together.

   THREE LISTENERS, NOT TWO, and the third is the one that does the work. A
   file missing under this server comes back as a perfectly successful HTTP
   exchange carrying 404 — `requestfailed` only fires for aborts and network
   errors, so on its own it watches for the failure mode this server cannot
   produce. The status listener is what would actually catch a font or a wasm
   that moved.

   ONE PATH IS EXPECTED TO MISS, and it is named rather than tolerated by a
   silent catch: `/run/components/…` is the nameplate's machinery, which
   `build-nameplate.mjs` compiles into the SITE root at build time and which
   therefore does not exist under src/run/ at all. The run imports it
   dynamically inside the masthead's own boot, long after the inline script
   that defines the mark has run, and the import failing changes nothing the
   mark is drawn from. Anything else missing does. */
const buildTimeOnly = (url) => new URL(url).pathname.startsWith("/run/");
const pageFaults = [];
page.on("pageerror", (error) => pageFaults.push(`threw: ${error.message}`));
page.on("requestfailed", (request) => {
  if (buildTimeOnly(request.url())) return;
  pageFaults.push(`${request.url()} failed: ${request.failure()?.errorText}`);
});
page.on("response", (response) => {
  if (response.status() < 400 || buildTimeOnly(response.url())) return;
  pageFaults.push(`${response.url()} answered ${response.status()}`);
});

await page.goto(`${runOrigin}/index.html`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => typeof window.__mark?.still === "function");
const drawn = await page.evaluate(() => window.__mark.still());
if (pageFaults.length) {
  console.error(`the run would not draw its own mark:\n  ${pageFaults.join("\n  ")}`);
  await browser.close();
  runServer.close();
  process.exit(1);
}

/* ONE comment, and it is the provenance. No double hyphen anywhere in it —
   `xmlCommentFault` above is the reason, and the reason that check exists is
   a comment that only Firefox refused. */
const svg = `<!-- generated by scripts/asset-truth/render-favicons.mjs from markSvg in src/run/index.html: the live mark at dawn -->\n${drawn}\n`;
const fault = xmlCommentFault(svg);
if (fault) {
  console.error(`the drawn favicon.svg is not well-formed XML — ${fault}.`);
  await browser.close();
  runServer.close();
  process.exit(1);
}
fs.writeFileSync(svgPath, svg);
const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;

/**
 * One raster, drawn at exactly its own pixel size — never downsampled.
 *
 * The mark is loaded as an `<img>` rather than inlined into the document,
 * and that is the whole point: an inlined SVG is parsed by the HTML parser,
 * which forgives malformed XML, while an `<img>` goes through the same
 * image pipeline a tab uses and `decode()` rejects anything the XML parser
 * will not take. Inlining is how the first draft of the mark passed every
 * raster here while being unreadable to Firefox.
 *
 * It gets its OWN page. Navigating the run's page to this one tears the run's
 * DOM out from under its own queued boot callbacks, and the exceptions that
 * produces are the harness's rather than the page's — on a listener that
 * exists to report exactly that, a false one is worse than none.
 */
const sheet = await browser.newPage({ colorScheme: "light", deviceScaleFactor: 1 });
async function raster(size) {
  await sheet.setViewportSize({ width: size, height: size });
  await sheet.setContent(
    `<!doctype html><meta charset="utf-8">` +
      `<style>html,body{margin:0;padding:0}img{display:block}</style>` +
      `<img id="mark" width="${size}" height="${size}" src="${svgDataUri}">`
  );
  await sheet.evaluate(() => document.getElementById("mark").decode());
  return sheet.screenshot({ type: "png" });
}

const icoEntries = [];
for (const size of ICO_SIZES) {
  const shot = await raster(size);
  /* Re-encoded through sharp so the committed bytes are a function of the
     pixels, not of the browser build's PNG encoder. */
  const png = await sharp(shot)
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
  icoEntries.push({ size, png });
}

const touchShot = await raster(TOUCH_SIZE);
/* `removeAlpha` is load-bearing: iOS composites a transparent touch icon
   onto black, which would put the dawn seam on a black tile — the exact
   near-black default NO-LIST §F5 rules out. The ground is the hour's field
   or it is nothing. */
const touchPng = await sharp(touchShot)
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toBuffer();

await browser.close();
runServer.close();

const ico = assembleIco(icoEntries);
fs.writeFileSync(icoPath, ico);
fs.writeFileSync(touchPath, touchPng);

/* No timestamp: a manifest that churns on every render is a manifest nobody
   reviews — the OG cards' note, and it holds here for the same reason. */
fs.writeFileSync(
  manifestPath,
  `${JSON.stringify(
    {
      note: "Written by scripts/asset-truth/render-favicons.mjs. `npm run assets:check-favicons` fails when public/favicon.svg has moved since these were drawn, or when either raster was touched by something else.",
      svg: sha256(fs.readFileSync(svgPath)),
      outputs: {
        "apple-touch-icon.png": sha256(touchPng),
        "favicon.ico": sha256(ico),
      },
    },
    null,
    2
  )}\n`
);

const kb = (bytes) => `${(bytes / 1024).toFixed(2)}KB`;
console.log(
  `public/favicon.ico — ${kb(ico.length)} (${icoEntries
    .map((entry) => `${entry.size}px ${entry.png.length}B`)
    .join(", ")})`
);
console.log(`public/apple-touch-icon.png — ${kb(touchPng.length)}`);
console.log(
  `public/favicon.svg — ${svg.length}B, drawn by the page at dawn ` +
    `(markSvg, src/run/index.html)`
);
console.log("Rendered the site mark + public/icons.manifest.json.");
