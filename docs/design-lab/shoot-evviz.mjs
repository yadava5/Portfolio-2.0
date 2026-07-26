// EVVIZ SHOOT — before/after evidence-surface shots (proof-glance round).
// The proof surfaces (/evidence + case-file [ validation ]) get the
// scannable receipt-card / glance-strip treatment; this rig captures
// every changed surface at desktop 1440, mobile 390, and print
// emulation, so the before/ and after/ trees diff cleanly.
//
//   node tests/playwright/static-server.mjs   (PORT=4331, out/ built with
//   NEXT_PUBLIC_BASE_PATH=)                   …or any static serve of out/
//   node docs/design-lab/shoot-evviz.mjs before   → shots-evviz/before/
//   node docs/design-lab/shoot-evviz.mjs after    → shots-evviz/after/
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const phase = process.argv[2];
if (phase !== "before" && phase !== "after") {
  console.error("usage: node docs/design-lab/shoot-evviz.mjs <before|after>");
  process.exit(1);
}
const OUT = `docs/design-lab/shots-evviz/${phase}`;
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://127.0.0.1:4331";

/** The proof surfaces this round touches. */
const SURFACES = [
  { id: "evidence", path: "/evidence/" },
  { id: "case-jobtracker", path: "/projects/jobtracker/", clip: "#validation" },
  {
    id: "case-fast-mnist",
    path: "/projects/fast-mnist-nn/",
    clip: "#validation",
  },
  { id: "case-automl", path: "/projects/automl/", clip: "#validation" },
];

const browser = await chromium.launch();

async function shoot(surface, world, viewport, media) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    reducedMotion: "reduce", // settled resting frames — the honest still
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${surface.path}`, { waitUntil: "networkidle" });
  if (media === "print") await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(700);

  await page.screenshot({
    path: `${OUT}/${surface.id}-${world}-full.png`,
    fullPage: true,
  });

  if (surface.clip && media !== "print") {
    const section = page.locator(surface.clip);
    if ((await section.count()) > 0) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await section.screenshot({
        path: `${OUT}/${surface.id}-${world}-validation.png`,
      });
    }
  }
  await ctx.close();
}

try {
  for (const surface of SURFACES) {
    await shoot(surface, "desktop", { width: 1440, height: 900 }, "screen");
    await shoot(surface, "mobile", { width: 390, height: 844 }, "screen");
    await shoot(surface, "print", { width: 1120, height: 1400 }, "print");
    console.log(`shot ${surface.id} (desktop · mobile · print)`);
  }
} finally {
  await browser.close();
}
console.log(`wrote ${OUT}`);
