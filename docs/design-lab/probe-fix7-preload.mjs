/**
 * FIX ROUND 7 · N23 — the font preloads on `/no-such-page/`.
 *
 * The nitpicker measured FOUR "preloaded using link preload but not used
 * within a few seconds" warnings on `/no-such-page/` and on no other
 * route. This rig reads the same thing three ways so the claim can be
 * settled rather than argued: the console tail (8s, long past Chrome's
 * ~3s emission window), the network census of which `.woff2` the route
 * actually FETCHED, and `document.fonts` — which faces the route
 * actually PAINTED. A preload is unused iff it was fetched and its face
 * never reached `loaded`.
 *
 * Usage: PORT=3700 node docs/design-lab/probe-fix7-preload.mjs [tag]
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "before";
const PORT = process.env.PORT ?? "3700";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(process.cwd(), "docs/design-lab/shots-fix7");
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = ["/", "/evidence/", "/projects/automl/", "/no-such-page/"];
const notes = [];
const browser = await chromium.launch();

for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const console_ = [];
  const failed = [];
  const fonts = [];
  page.on("console", (m) => console_.push(`${m.type()}: ${m.text().slice(0, 150)}`));
  page.on("requestfailed", (r) => failed.push(r.url().slice(-70)));
  page.on("response", (r) => {
    if (/\.woff2?$/.test(r.url()))
      fonts.push({ f: r.url().split("/").pop(), status: r.status() });
  });
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(-70)}`);
  });

  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
  });
  /* Chrome emits the unused-preload warning ~3s after load; 8s is well
     past it and past every entrance this site runs. */
  await page.waitForTimeout(8000);

  const dom = await page.evaluate(async () => {
    await document.fonts.ready;
    const faces = [];
    document.fonts.forEach((f) =>
      faces.push(`${f.family}/${f.style}/${f.status}`)
    );
    return {
      preloads: [
        ...document.querySelectorAll('link[rel="preload"][as="font"]'),
      ].map((l) => l.getAttribute("href").split("/").pop()),
      faces: faces.sort(),
    };
  });

  const v = {
    route,
    preloadWarnings: console_.filter((c) => /preloaded using link preload/i.test(c)),
    consoleAll: console_,
    fontResponses: fonts,
    failed,
    ...dom,
  };
  notes.push(v);
  console.log(`\n[${route}]\n${JSON.stringify(v, null, 1)}`);
  await ctx.close();
}

fs.writeFileSync(
  `${OUT}/fix7-preload-${TAG}.json`,
  JSON.stringify(notes, null, 1)
);
await browser.close();
console.log("\n--- done ---");
