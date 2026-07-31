/* probe-rail12.mjs — the rail's first look (round 12, Stage A/B).
 *
 * Loads the home paper in the motion world and reads the canvas rail's
 * own probe: built count, path length, sample count, endpoints vs the
 * nameplate box and the gate stamp, dusk flip, head tracking at five
 * scroll depths (down THEN back up — the owner's reversibility is the
 * rail retracting, so the upward readings matter as much), and a
 * pixel census (does the canvas actually hold ink?).
 *
 * Usage:  node tests/playwright/static-server.mjs &
 *         node docs/design-lab/probe-rail12.mjs [url]
 */
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://127.0.0.1:3000/";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(3000); /* entrance + fonts + engine */

const read = () =>
  page.evaluate(() => {
    const canvas = document.querySelector("canvas[data-thread-rail]");
    if (!canvas) return { canvas: false };
    const rail = canvas.__rail;
    const cs = getComputedStyle(canvas);
    const name = document
      .querySelector("[data-thread-name]")
      ?.getBoundingClientRect();
    const stamp = Array.from(
      document.querySelectorAll("[data-thread-stamp]")
    ).find((el) => el.getBoundingClientRect().width > 0);
    const s = stamp?.getBoundingClientRect();
    const sy = window.scrollY;
    /* ink census: non-transparent pixels on the canvas */
    const ctx = canvas.getContext("2d");
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let inked = 0;
    for (let i = 3; i < img.length; i += 4) if (img[i] > 30) inked++;
    return {
      canvas: true,
      position: cs.position,
      z: cs.zIndex,
      pointer: cs.pointerEvents,
      cssW: canvas.clientWidth,
      cssH: canvas.clientHeight,
      built: rail?.built,
      pathLen: Math.round(rail?.pathLen ?? 0),
      sampleCount: rail?.sampleCount,
      duskL: Math.round(rail?.duskL ?? 0),
      headL: Math.round(rail?.headL() ?? -1),
      start: rail
        ? { x: Math.round(rail.start.x), y: Math.round(rail.start.y) }
        : null,
      end: rail
        ? { x: Math.round(rail.end.x), y: Math.round(rail.end.y) }
        : null,
      namePage: name
        ? {
            right: Math.round(name.right + window.scrollX),
            bottom: Math.round(name.bottom + sy),
          }
        : null,
      stampPage: s
        ? {
            l: Math.round(s.left),
            r: Math.round(s.right),
            t: Math.round(s.top + sy),
            b: Math.round(s.bottom + sy),
          }
        : null,
      inkedPx: inked,
      scrollY: sy,
      docH: document.documentElement.scrollHeight,
      svgSegments: document.querySelectorAll("svg[data-thread-segment]")
        .length,
      drawnSvgPaths: Array.from(
        document.querySelectorAll("svg[data-thread-segment] path.thread-past")
      ).filter((p) => (p.getAttribute("d") ?? "").length > 20).length,
    };
  });

const at = async (y) => {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(350);
  const r = await read();
  return { y, headL: r.headL, inkedPx: r.inkedPx };
};

const first = await read();
console.log("load:", JSON.stringify(first, null, 1));

const docH = first.docH ?? 12000;
const stops = [0, 0.25, 0.5, 0.75, 1].map((f) =>
  Math.round(f * (docH - 900))
);
const down = [];
for (const y of stops) down.push(await at(y));
const up = [];
for (const y of [...stops].reverse()) up.push(await at(y));
console.log("down:", JSON.stringify(down));
console.log("up:  ", JSON.stringify(up));

await browser.close();
