/**
 * Wave 4 (engine) probe — the measurements the engine faults are argued on.
 *
 * Answers, against the live static export, the questions CRITIC-LEDGER
 * F09/F63/F69/F71/F77/F79/F80 turn on:
 *
 *   headerHeight  — the measured masthead box at three widths (F69: four
 *                   constants claim 96 / 112 / 72 / 120 for one number)
 *   deepLinks     — every anchor loaded as `/#x`, sampled over 5s: where
 *                   it sits, and how far the target is from the reading
 *                   line at each sample (F09: `#values` sat 1,170px low
 *                   for 2.2s, then lurched)
 *   clickVsHash   — the same target reached by nav click and by hash
 *                   (F69: a figure anchor lands 16px off between them)
 *   spine         — the chapter-03 thread path's start x at a band of
 *                   widths around 1280 (F63: a 96.8px snap on one pixel)
 *   pinTail       — scroll distance after the run token stops moving
 *                   (F77: ~19vh of frozen screen)
 *   staticDom     — thread/pipeline geometry with JS disabled (F71: both
 *                   claim to hold with zero JS)
 *   dip           — `.thread-dip` nodes present vs painted (F79)
 *   tiers         — `[data-tier-garnish]` consumers + dead tokens (F80)
 *
 * Usage: PORT=3200 node docs/design-lab/probe-w4eng.mjs [tag]
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "before";
const PORT = process.env.PORT ?? "3200";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(process.cwd(), "docs/design-lab/shots-w4eng");
fs.mkdirSync(OUT, { recursive: true });

const server = spawn(process.execPath, ["tests/playwright/static-server.mjs"], {
  env: { ...process.env, PORT },
  stdio: "ignore",
});
await new Promise((r) => setTimeout(r, 2000));

const browser = await chromium.launch();
const report = {};

const ANCHORS = [
  "arrival",
  "who",
  "path",
  "automl",
  "work",
  "values",
  "gate",
];

/* ── The masthead's actual height (F69) ──────────────────────────── */
{
  report.headerHeight = {};
  for (const width of [390, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    report.headerHeight[width] = await page.evaluate(() => {
      const el = document.querySelector("header");
      const r = el?.getBoundingClientRect();
      const root = getComputedStyle(document.documentElement);
      return {
        header: r ? Math.round(r.height * 100) / 100 : null,
        scrollPaddingTop: root.scrollPaddingTop,
        sectionScrollMargin: getComputedStyle(
          document.querySelector("section[id]")
        ).scrollMarginTop,
        figScrollMargin: (() => {
          const fig = document.querySelector('[id^="fig-"]');
          return fig ? getComputedStyle(fig).scrollMarginTop : null;
        })(),
      };
    });
    await page.close();
  }
}

/* ── Deep links over time (F09) ──────────────────────────────────── */
{
  report.deepLinks = {};
  for (const anchor of ANCHORS) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.goto(`${BASE}/#${anchor}`, { waitUntil: "commit" });
    const samples = [];
    for (const at of [800, 1600, 2400, 3600, 5000]) {
      await page.waitForTimeout(at - (samples.at(-1)?.at ?? 0));
      samples.push(
        await page.evaluate(
          ([id, ms]) => {
            const el = document.getElementById(id);
            const top = el ? Math.round(el.getBoundingClientRect().top) : null;
            return { at: ms, scrollY: Math.round(window.scrollY), top };
          },
          [anchor, at]
        )
      );
    }
    await page.screenshot({ path: path.join(OUT, `${TAG}-deep-${anchor}.png`) });
    report.deepLinks[anchor] = samples;
    await page.close();
  }
}

/* ── The same target by click and by hash (F69) ──────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const byClick = {};
  for (const [label, name] of [
    ["work", "the work"],
    ["gate", "contact"],
  ]) {
    await page.getByRole("link", { name, exact: true }).first().click();
    await page.waitForTimeout(2200);
    byClick[label] = await page.evaluate(
      (id) => Math.round(document.getElementById(id).getBoundingClientRect().top),
      label
    );
  }
  report.clickVsHash = { byClick };

  /* A cited figure: reached by its in-page citation link, then by hash */
  const cite = await page.evaluate(() => {
    const a = document.querySelector('a[href^="#fig-"]');
    return a ? a.getAttribute("href") : null;
  });
  if (cite) {
    await page.evaluate((href) => {
      document.querySelector(`a[href="${href}"]`).click();
    }, cite);
    await page.waitForTimeout(2200);
    report.clickVsHash.figByClick = await page.evaluate(
      (href) =>
        Math.round(document.querySelector(href).getBoundingClientRect().top),
      cite
    );
    const fresh = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await fresh.goto(`${BASE}/${cite}`, { waitUntil: "networkidle" });
    await fresh.waitForTimeout(3000);
    report.clickVsHash.figByHash = await fresh.evaluate(
      (href) =>
        Math.round(document.querySelector(href).getBoundingClientRect().top),
      cite
    );
    report.clickVsHash.cite = cite;
    await fresh.close();
  }
  await page.close();
}

/* ── The spine across the 1280 boundary (F63) ────────────────────── */
{
  report.spine = {};
  for (const width of [1200, 1240, 1279, 1280, 1300, 1360, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.addInitScript(() => localStorage.setItem("motion-off", "1"));
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    report.spine[width] = await page.evaluate(() => {
      const out = {};
      for (const seg of document.querySelectorAll(".thread-segment")) {
        const chapter = seg.closest("[data-chapter]")?.dataset.chapter;
        const d = seg.querySelector(".thread-past")?.getAttribute("d");
        if (!d || !chapter) continue;
        const m = d.match(/^M\s*([\d.-]+)[ ,]+([\d.-]+)/);
        const last = [...d.matchAll(/([\d.-]+)[ ,]+([\d.-]+)/g)].at(-1);
        out[chapter] = {
          startX: m ? Math.round(parseFloat(m[1]) * 10) / 10 : null,
          endX: last ? Math.round(parseFloat(last[1]) * 10) / 10 : null,
        };
      }
      return out;
    });
    await page.close();
  }
}

/* ── The pin's tail (F77) ────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  /* Find the pinned range, then walk it in 40px steps recording the
     token's transform and whether the plate is still pinned. */
  report.pinTail = await page.evaluate(async () => {
    const token = document.querySelector(".pipeline-token");
    if (!token) return { error: "no token" };
    const samples = [];
    const auto = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    const start = 2600;
    for (let y = start; y < start + 3200; y += 40) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => r()));
      await new Promise((r) => requestAnimationFrame(() => r()));
      const t = getComputedStyle(token).transform;
      const ty = t && t !== "none" ? Math.round(parseFloat(t.split(",")[5])) : 0;
      const pinned = !!document.querySelector("[data-pipeline-pinned]");
      const halted = token.classList.contains("is-halted");
      samples.push({ y, ty, pinned, halted });
    }
    document.documentElement.style.scrollBehavior = auto;
    return samples;
  });
  await page.close();
}

/* ── The static world with no JS at all (F71) ────────────────────── */
{
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  report.staticDom = await page.evaluate(() => {
    const seg = document.querySelectorAll(".thread-segment");
    const paths = [...document.querySelectorAll(".thread-past")].map((p) =>
      (p.getAttribute("d") ?? "").length
    );
    const overlay = document.querySelector("[data-pipeline-overlay]");
    return {
      threadSegments: seg.length,
      threadPathLengths: paths,
      pipelineOverlay: overlay
        ? {
            width: overlay.getAttribute("width"),
            height: overlay.getAttribute("height"),
            children: overlay.children.length,
          }
        : null,
      dips: document.querySelectorAll(".thread-dip").length,
    };
  });
  await page.screenshot({
    path: path.join(OUT, `${TAG}-nojs-home.png`),
    fullPage: false,
  });
  await context.close();
}

/* ── The dip, and the tiers (F79/F80) ────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  report.dip = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll(".thread-dip")];
    return {
      inDom: nodes.length,
      painted: nodes.filter((n) => getComputedStyle(n).display !== "none")
        .length,
      totalPathChars: nodes.reduce(
        (n, el) => n + (el.getAttribute("d") ?? "").length,
        0
      ),
    };
  });
  report.tiers = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const tokens = [
      "--text-hero",
      "--font-sans",
      "--color-pass",
      "--color-fail",
      "--color-surface-2",
    ];
    return {
      tier: document.documentElement.dataset.tier,
      garnishNodes: document.querySelectorAll("[data-tier-garnish]").length,
      tokenValues: Object.fromEntries(
        tokens.map((t) => [t, root.getPropertyValue(t).trim()])
      ),
    };
  });
  await page.close();
}

await browser.close();
server.kill();
fs.writeFileSync(
  path.join(OUT, `probe-${TAG}.json`),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
