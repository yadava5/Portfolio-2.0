/**
 * Render the site mark — public/favicon.svg to the two rasters browsers
 * still insist on.
 *
 * What shipped before this script: a Next-era `favicon.ico` holding a black
 * disc with a white triangle, and a `favicon.svg` that set "AY" as `<text>`
 * in a purple→fuchsia gradient on near-black. The SVG broke NO-LIST §A
 * three times over and never rendered in the face it named — `<text>` in a
 * favicon sets in whatever the host has — and nothing linked it from the
 * home page anyway, so every browser fell back to requesting `/favicon.ico`
 * and every tab showed the triangle. Both are replaced by one authored
 * mark; this script only derives the rasters from it.
 *
 * Chromium draws them because Chromium is where the SVG actually ships: a
 * mark judged in the engine that will paint it in the tab strip is a mark
 * judged honestly. `sharp` then re-encodes the raw screenshot pixels, so
 * the committed bytes depend on the pixels rather than on whatever PNG
 * encoder the browser build carries.
 *
 * The ICO container is assembled here in plain Node rather than pulled in
 * as a dependency. It is 6 bytes of header, 16 per entry, and the PNGs —
 * a dependency for that is a dependency for nothing. PNG-compressed
 * entries have been read since Windows Vista and by every browser in this
 * site's support matrix; the older uncompressed BMP form buys nothing here.
 *
 * THE MARK, and why it is this one (2026-10-06, every claim rasterised in
 * Chromium at 16, 32 and 48 before choosing). It is the pilcrow: the glyph
 * that opens all thirteen stations and the OG card's kicker, so the icon is
 * the page's own station mark rather than initials. Four other directions
 * were drawn and lost at 16 px: a clay thread with one knot became a
 * smudge, a sun on a horizon collapsed to a dot over a line, a bleed crop
 * lost the silhouette, and a Fraunces "A" read as a triangle with a counter,
 * which is the shape the owner had just rejected. The cut is the masthead's
 * own axes (opsz 40, SOFT 30, src/run/index.html) with the weight at 900,
 * because the masthead's 400 closes the counter between the stems at 16 px;
 * opsz 144 thins to a bar there and opsz 9 muddies. The site sets its
 * pilcrows in Fragment Mono, and the mark is re-cut in Fraunces on purpose:
 * mono is for machine values, not for an identity.
 *
 * Colour: clay as text, #a03f20, on the dawn paper #fbf3e7, measured on the
 * icon's own ground at 5.91:1 / APCA Lc 74.9. The graphic clay #c4532e
 * (4.13:1 / Lc 64.2) visibly washes at 16 px, and ink #26231c, though Lc 96,
 * is a black glyph on cream, which is every reading app; clay's antialias
 * also stays warm where ink's goes neutral grey. No night variant: the night
 * field #43372f against Chrome's dark tab strip #202124 is 1.40:1 / Lc 0.0,
 * so a flip would dissolve the one thing that makes the icon findable in a
 * row of dark ones, the paper card (14.62:1 against that strip).
 *
 * Usage:
 *   node scripts/asset-truth/render-favicons.mjs           # render
 *   node scripts/asset-truth/render-favicons.mjs --check   # verify only
 */
import crypto from "node:crypto";
import fs from "node:fs";
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
           the mark and forget to re-render, and the rasters on disk argue
           a logo the site no longer has. This is the DRIFT check, and it
           is the one that matters: a drawn asset can only be wrong
           quietly.
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
    fail("missing public/favicon.svg — the mark itself is the source");
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

const svg = fs.readFileSync(svgPath, "utf8");
const fault = xmlCommentFault(svg);
if (fault) {
  console.error(`public/favicon.svg is not well-formed XML — ${fault}.`);
  process.exit(1);
}
const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;

const browser = await chromium.launch();
/* `colorScheme: "light"` is not belt and braces. The mark carries no night
   variant today, but a render host sitting in dark mode must never be able
   to bake one into a raster: the ICO and the touch icon are the day paper
   by construction, and only the SVG is ever free to answer the reader's
   scheme. */
const page = await browser.newPage({
  colorScheme: "light",
  deviceScaleFactor: 1,
});

/**
 * One raster, drawn at exactly its own pixel size — never downsampled.
 *
 * The mark is loaded as an `<img>` rather than inlined into the document,
 * and that is the whole point: an inlined SVG is parsed by the HTML parser,
 * which forgives malformed XML, while an `<img>` goes through the same
 * image pipeline a tab uses and `decode()` rejects anything the XML parser
 * will not take. Inlining is how the first draft of the mark passed every
 * raster here while being unreadable to Firefox.
 */
async function raster(size) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!doctype html><meta charset="utf-8">` +
      `<style>html,body{margin:0;padding:0}img{display:block}</style>` +
      `<img id="mark" width="${size}" height="${size}" src="${svgDataUri}">`
  );
  await page.evaluate(() => document.getElementById("mark").decode());
  return page.screenshot({ type: "png" });
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
   onto black, which would put a clay pilcrow on a black tile — the exact
   near-black default NO-LIST §F5 rules out. The ground is paper or it is
   nothing. */
const touchPng = await sharp(touchShot)
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toBuffer();

await browser.close();

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
  `public/favicon.svg — ${kb(fs.statSync(svgPath).size)} (the source; not rewritten)`
);
console.log("Rendered the site mark + public/icons.manifest.json.");
