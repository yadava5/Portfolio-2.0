/**
 * F04 print probe — does the paper edition carry the whole argument?
 *
 * Serves out/ and prints the home page (motion world AND the static
 * world, so both sides of the dusk contract are covered) plus every
 * subpage, with `printBackground: false` — the Cmd+P DEFAULT, which is
 * the condition F04 was measured under.
 *
 * The pass/fail is not the PDF, it is the DOM under `emulateMedia
 * print`: every text node's computed colour against the paper it will
 * actually land on (white), the count of fixed-position boxes that
 * would repeat on every sheet, and the presence of the seven strings
 * the ledger recorded as printing blank.
 *
 * Usage: PORT=3200 node docs/design-lab/shoot-w3print.mjs [tag]
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "after";
const PORT = process.env.PORT ?? "3200";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(process.cwd(), "docs/design-lab/shots-w3sub");
fs.mkdirSync(OUT, { recursive: true });

/* The strings F04 measured as printing on blank white pages. */
const MUST_PRINT = [
  "Make it learn",
  "Ayush Yadav",
  "aesh_1055@icloud.com",
  "the resume",
  "references",
];

function srgb(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function luminance([r, g, b]) {
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}
function contrastOnWhite(rgb) {
  return 1.05 / (luminance(rgb) + 0.05);
}

const server = spawn(
  process.execPath,
  ["tests/playwright/static-server.mjs"],
  { env: { ...process.env, PORT }, stdio: "inherit" }
);
await new Promise((r) => setTimeout(r, 2500));

const browser = await chromium.launch();
const report = {};

const ROUTES = [
  ["home", "/"],
  ["home-static", "/?motion=off"],
  ["evidence", "/evidence/"],
  ["case-automl", "/projects/automl/"],
  ["case-jobtracker", "/projects/jobtracker/"],
  ["notfound", "/404.html"],
];

for (const [name, route] of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  if (route.includes("motion=off")) {
    await page.addInitScript(() =>
      localStorage.setItem("motion-off", "1")
    );
  }
  await page.goto(`${BASE}${route.split("?")[0]}`, {
    waitUntil: "networkidle",
  });
  /* Walk the whole document first: the motion world only settles the
     later chapters once they have been scrolled through, and a real
     reader prints AFTER reading. */
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);

  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(250);

  const probe = await page.evaluate(() => {
    const parse = (c) => {
      const m = c.match(/-?[\d.]+/g);
      return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
    };
    const texts = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
    let node;
    while ((node = walker.nextNode())) {
      const t = node.textContent?.trim();
      if (!t) continue;
      const el = node.parentElement;
      if (!el) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      if (Number(cs.opacity) < 0.05) continue;
      const box = el.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;
      texts.push({ text: t.slice(0, 60), color: parse(cs.color) });
    }
    const fixed = [...document.querySelectorAll("*")]
      .filter((el) => getComputedStyle(el).position === "fixed")
      .filter((el) => getComputedStyle(el).display !== "none")
      .map((el) => el.tagName + "." + (el.className?.toString?.() ?? "").slice(0, 40));
    const faded = [...document.querySelectorAll("[data-tm],[data-tm-bright],[data-tm-mantra],[data-tm-receipt]")]
      .filter((el) => Number(getComputedStyle(el).opacity) < 0.9).length;
    return {
      texts,
      fixed,
      faded,
      bodyText: document.body.innerText,
      htmlBg: getComputedStyle(document.documentElement).backgroundColor,
    };
  });

  const lowContrast = probe.texts
    .map((t) => ({ ...t, ratio: contrastOnWhite(t.color) }))
    .filter((t) => t.ratio < 4.5);

  report[name] = {
    textNodes: probe.texts.length,
    lowContrastOnWhite: lowContrast.length,
    worst: lowContrast
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 6)
      .map((t) => `${t.ratio.toFixed(2)}:1 — ${t.text}`),
    fixedBoxes: probe.fixed,
    fadedRevealTargets: probe.faded,
    missingStrings:
      name === "home" || name === "home-static"
        ? MUST_PRINT.filter((s) => !probe.bodyText.includes(s))
        : [],
  };

  await page.pdf({
    path: path.join(OUT, `print-${TAG}-${name}.pdf`),
    format: "Letter",
    printBackground: false,
  });
  await page.close();
}

fs.writeFileSync(
  path.join(OUT, `print-${TAG}.json`),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));

await browser.close();
server.kill();
