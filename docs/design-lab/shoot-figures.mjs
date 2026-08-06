/**
 * Every figure in the run, at both widths that matter — the "before".
 *
 * Phase 5 of the portfolio migration redraws fig 03 through fig 10 (congestion,
 * a chip covering the wrong day, text overlapping fields, and fig 06's bars,
 * which read as a live measurement while being a committed one). A redesign
 * without a before is an opinion, so this records the current state first.
 *
 * BOTH WIDTHS, DELIBERATELY. Most of the reported defects are collision and
 * overlap, which are width-dependent by definition — a caption that clears its
 * neighbour at 1440 can sit on top of it at 390. Judging a fix at one width is
 * how the other one ships broken.
 *
 * Writes to output/, which is gitignored (.gitignore:16). These are ~40 PNGs
 * regenerated from a committed script in one command; the script is the tracked
 * evidence and the render is not — the same call docs/design-lab/timing-audit
 * already makes for its stills.
 *
 *   node docs/design-lab/shoot-figures.mjs
 *   node docs/design-lab/shoot-figures.mjs --out output/figures-after
 */
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { chromium } from "@playwright/test";

const argv = process.argv.slice(2);
const outArg = argv.indexOf("--out");
const SHOTS = resolve(
  process.cwd(),
  outArg > -1 ? argv[outArg + 1] : "output/figures-before"
);
const OUT = resolve(process.cwd(), "out");
const WIDTHS = [1440, 390];

const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

const server = createServer(async (req, res) => {
  try {
    let p = join(OUT, decodeURIComponent(req.url.split("?")[0]));
    const s = await stat(p).catch(() => null);
    if (s?.isDirectory()) p = join(p, "index.html");
    const body = await readFile(p);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(p)] ?? "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

await mkdir(SHOTS, { recursive: true });
const browser = await chromium.launch();
let shot = 0;

for (const width of WIDTHS) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.locator('[data-beat="0"]').waitFor({ state: "attached" });

  /* The figures carry entrance transforms keyed to scroll (data-fx). A figure
     screenshotted before it has entered is captured mid-animation and is not
     the settled design. Scrolling each one to the middle of the viewport and
     letting it settle is what makes these comparable to a Phase 5 "after". */
  const figures = page.locator("figure");
  const n = await figures.count();

  for (let i = 0; i < n; i++) {
    const fig = figures.nth(i);
    await fig.scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);

    const caption =
      (await fig
        .locator("figcaption")
        .first()
        .textContent()
        .catch(() => "")) ?? "";
    const m = caption.match(/fig\.\s*(\d+)/);
    /* Named by the figure's own number where it has one. The unnumbered ones
       are the borrowed epigraphs and the cosign quotes — kept, because Phase 5
       must not silently restyle them either. */
    const name = m
      ? `fig-${m[1].padStart(2, "0")}`
      : `unnumbered-${String(i).padStart(2, "0")}`;

    const box = await fig.boundingBox();
    if (!box || box.height < 4) continue;

    await fig.screenshot({ path: join(SHOTS, `${name}@${width}.png`) });
    shot += 1;
  }
  await page.close();
  console.log(`  · ${width}px — ${n} figures walked`);
}

await browser.close();
server.close();
console.log(`shoot-figures: ${shot} captures in ${SHOTS}`);
