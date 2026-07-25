/**
 * F82 audit — the load-bearing comments, checked against the running build.
 *
 * The ledger lists nine assertions in file headers that a reviewer would
 * trust and ship a bug on. Four were closed by earlier waves or by this
 * one; the rest are measured here, plus the claim the wave brief adds
 * (SmoothScroll's header still describing a Lenis instance the engine
 * has not held since it moved to native scroll).
 *
 *   lightFieldLayers  — "Four static-paint layers" (LightField.tsx:5)
 *   folioHairline     — "Hairlines run at 70% ink … ~3:1 decorative
 *                        contrast on every waypoint" (apparatus.tsx:88),
 *                        measured in BOTH registers, because the dusk
 *                        variant multiplies two opacities
 *   stampPress        — "~600ms inking animation" (ApprovedStamp.tsx:14)
 *   editorialRows     — "three editorial rows" (StoryShell.tsx)
 *   breatheRange      — "wght 360→420→360 (±60 max)" (TextMotion.tsx:47)
 *
 * Usage: PORT=3200 node docs/design-lab/probe-w4claims.mjs [tag]
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
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => localStorage.setItem("motion-off", "1"));
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const report = await page.evaluate(() => {
  const parse = (s) => {
    const n = (s.match(/[\d.]+/g) ?? []).map(Number);
    if (!s.startsWith("color(")) return n;
    return [n[0] * 255, n[1] * 255, n[2] * 255, ...n.slice(3)];
  };
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = ([r, g, b]) =>
    0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => {
    const [hi, lo] = lum(a) >= lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)];
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };
  const paperUnder = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg.length >= 3 && (bg[3] === undefined || bg[3] > 0.9)) {
        return bg.slice(0, 3);
      }
      node = node.parentElement;
    }
    return [250, 246, 239];
  };

  /* Every folio rule, with its composed hairline ink. */
  const folios = [];
  for (const rule of document.querySelectorAll(".folio-rule")) {
    const hair = rule.querySelector("span");
    if (!hair) continue;
    const chapter = rule.closest("[data-chapter]")?.dataset.chapter;
    /* The composed alpha is the hairline's own opacity times every
       ancestor opacity up to the section. */
    let alpha = Number(getComputedStyle(hair).opacity);
    let node = hair.parentElement;
    while (node && node !== document.documentElement) {
      alpha *= Number(getComputedStyle(node).opacity);
      if (node.hasAttribute?.("data-chapter")) break;
      node = node.parentElement;
    }
    const ink = parse(getComputedStyle(hair).backgroundColor).slice(0, 3);
    const paper = paperUnder(rule);
    const composite = [0, 1, 2].map((i) =>
      Math.round(ink[i] * alpha + paper[i] * (1 - alpha))
    );
    folios.push({
      chapter,
      composedAlpha: Math.round(alpha * 100) / 100,
      ratio: ratio(composite, paper),
    });
  }

  const stamp = document.querySelector("[data-stamp]");
  return {
    lightFieldLayers:
      document.querySelector("[data-light-field]")?.children.length ?? null,
    folioHairline: folios,
    worstFolioRatio: folios.length
      ? Math.min(...folios.map((f) => f.ratio))
      : null,
    editorialRows: document.querySelectorAll("[data-thread-row]").length,
    stampPresent: !!stamp,
    breatheNodes: document.querySelectorAll("[data-breathe]").length,
  };
});

/* The press animation's real duration, read off the keyframe rules. */
const cssDurations = await page.evaluate(() => {
  const out = {};
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    const walk = (list) => {
      for (const rule of list) {
        if (rule.cssRules) walk(rule.cssRules);
        const anim = rule.style?.animation ?? "";
        if (anim.includes("stamp-press") || anim.includes("stamp-ink-in")) {
          out[rule.selectorText] = anim;
        }
      }
    };
    walk(rules);
  }
  return out;
});

await browser.close();
server.kill();
const full = { ...report, cssDurations };
fs.writeFileSync(
  path.join(OUT, `probe-claims-${TAG}.json`),
  JSON.stringify(full, null, 2)
);
console.log(JSON.stringify(full, null, 2));
