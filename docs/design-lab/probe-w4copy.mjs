/**
 * Wave 4 design-call evidence — F16, F18, F32, F42, F43.
 *
 * Four of these are decisions, not defects, and a decision taken
 * without a current measurement is just a preference. Waves 1–3 changed
 * section heights (F07, F62), the type scale (F33/F35/F64/F65) and the
 * copy (F41, F43 on /evidence), so every number the ledger recorded in
 * these five rows is now stale.
 *
 *   pacing     — F18: per-chapter scroll height and its share of the page
 *   typeCensus — F32: distinct rendered (size × family) pairs, with the
 *                node count behind each, so a one-off is visible as one
 *   emDashes   — F42: em dashes in visible text, and how many paragraphs
 *                carry more than one
 *   vocabulary — F43: the overloaded nouns, counted in visible text
 *   mobileHero — F16: every interactive element in the ¶01 hero at 390,
 *                with its hit box, against the 44px bar
 *
 * Usage: PORT=3200 node docs/design-lab/probe-w4copy.mjs [tag]
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

/* ── Desktop: pacing, type census, vocabulary ────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => localStorage.setItem("motion-off", "1"));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  report.pacing = await page.evaluate(() => {
    const sections = [...document.querySelectorAll("[data-chapter]")];
    const total = document.documentElement.scrollHeight;
    const rows = sections.map((s) => {
      const h = Math.round(s.getBoundingClientRect().height);
      return {
        chapter: s.dataset.chapter,
        px: h,
        viewports: Math.round((h / window.innerHeight) * 100) / 100,
        share: Math.round((h / total) * 1000) / 10,
      };
    });
    const heights = rows.map((r) => r.px);
    return {
      documentHeight: total,
      rows,
      ratio:
        Math.round((Math.max(...heights) / Math.min(...heights)) * 100) / 100,
    };
  });

  report.typeCensus = await page.evaluate(() => {
    const counts = new Map();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || el.closest("svg")) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const family = cs.fontFamily.split(",")[0].replace(/["']/g, "");
      const key = `${Math.round(parseFloat(cs.fontSize) * 100) / 100}px · ${family}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return {
      distinctPairs: counts.size,
      pairs: [...counts.entries()]
        .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
        .map(([k, n]) => `${k} × ${n}`),
      oneOffs: [...counts.entries()].filter(([, n]) => n === 1).length,
    };
  });

  report.vocabulary = await page.evaluate(() => {
    const text = document.body.innerText;
    const count = (word) =>
      (text.match(new RegExp(`\\b${word}\\b`, "gi")) ?? []).length;
    const paragraphs = [...document.querySelectorAll("p, li, figcaption")]
      .map((el) => el.innerText ?? "")
      .filter(Boolean);
    return {
      gate: count("gate"),
      gates: count("gates"),
      gated: count("gated"),
      gateFamily: count("gate") + count("gates") + count("gated"),
      receipt: count("receipt") + count("receipts"),
      file: count("file") + count("files"),
      emDashes: (text.match(/—/g) ?? []).length,
      paragraphsWithMultipleDashes: paragraphs.filter(
        (p) => (p.match(/—/g) ?? []).length > 1
      ).length,
      paragraphsTotal: paragraphs.length,
      arrows: (text.match(/⟶/g) ?? []).length,
    };
  });
  await page.close();
}

/* ── Mobile: the ¶01 hero's affordances (F16) ────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => localStorage.setItem("motion-off", "1"));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  report.mobileHero = await page.evaluate(() => {
    const hero = document.querySelector("#arrival");
    if (!hero) return null;
    const items = [...hero.querySelectorAll("a, button")].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        text: (el.textContent ?? "").trim().slice(0, 40),
        y: Math.round(r.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
        under44: r.height < 44,
      };
    });
    return {
      count: items.length,
      under44: items.filter((i) => i.under44).length,
      items,
    };
  });
  /* Sitewide tap-target census, the ledger's other F16 number */
  report.tapTargets = await page.evaluate(() => {
    const all = [...document.querySelectorAll("a, button")];
    const small = all.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.height < 30 || r.width < 24);
    });
    return { total: all.length, under30hOr24w: small.length };
  });
  await page.screenshot({ path: path.join(OUT, `${TAG}-mob-hero.png`) });
  await page.close();
}

await browser.close();
server.kill();
fs.writeFileSync(
  path.join(OUT, `probe-copy-${TAG}.json`),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
