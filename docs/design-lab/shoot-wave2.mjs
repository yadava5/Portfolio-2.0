/**
 * Wave-2 fault-fix evidence shoot (CRITIC-LEDGER home-page P1/P2 sweep).
 *
 * Usage:
 *   PORT=3200 node tests/playwright/static-server.mjs &
 *   node docs/design-lab/shoot-wave2.mjs <tag>       # tag = "before" | "after"
 *
 * Writes PNGs + probe JSON into docs/design-lab/shots-wave2/.
 * Every number below is READ FROM THE LIVE EXPORT — nothing is assumed.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const TAG = process.argv[2] ?? "before";
const BASE = process.env.BASE ?? "http://127.0.0.1:3200";
const OUT = resolve("docs/design-lab/shots-wave2");
mkdirSync(OUT, { recursive: true });

const DESK = { width: 1440, height: 900 };
const MOB = { width: 390, height: 844 };

const shot = (page, name) =>
  page.screenshot({ path: resolve(OUT, `${TAG}-${name}.png`) });

/** Wait until scrollY holds still for 500ms (2.5s ceiling). */
async function settle(page) {
  await page.evaluate(
    () =>
      new Promise((done) => {
        let last = window.scrollY;
        let moved = false;
        let still = 0;
        let elapsed = 0;
        const iv = setInterval(() => {
          elapsed += 100;
          if (window.scrollY !== last) {
            moved = true;
            still = 0;
            last = window.scrollY;
            return;
          }
          still += 100;
          if ((moved && still >= 500) || elapsed >= 2500) {
            clearInterval(iv);
            done();
          }
        }, 100);
      })
  );
}

async function scrollTo(page, y) {
  await page.evaluate((target) => window.scrollTo(0, target), y);
  await settle(page);
  await page.waitForTimeout(400);
}

/* ── Probes ───────────────────────────────────────────────────── */

/** Census of every RENDERED font size on the page (F32/F33/F65). */
const typeCensus = () => {
  const seen = new Map();
  for (const el of document.querySelectorAll("body *")) {
    if (!el.textContent?.trim()) continue;
    const hasOwnText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim()
    );
    if (!hasOwnText) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const px = Math.round(parseFloat(cs.fontSize) * 100) / 100;
    const fam = cs.fontFamily.split(",")[0].replace(/["']/g, "");
    const key = `${px}|${fam}`;
    const row = seen.get(key) ?? { px, fam, n: 0, sample: "" };
    row.n += 1;
    if (!row.sample) row.sample = el.textContent.trim().slice(0, 48);
    seen.set(key, row);
  }
  return [...seen.values()].sort((a, b) => a.px - b.px);
};

/** Every hero directive link + whether its target is same-origin real. */
const heroLinks = () => {
  const hero = document.querySelector("#arrival");
  if (!hero) return [];
  return [...hero.querySelectorAll("a")].map((a) => {
    const r = a.getBoundingClientRect();
    const cs = getComputedStyle(a);
    return {
      text: a.textContent.trim(),
      href: a.getAttribute("href"),
      fontSize: Math.round(parseFloat(cs.fontSize) * 100) / 100,
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  });
};

/** Gap census: vertical runs of empty page inside the story column. */
const gapCensus = () => {
  const boxes = [];
  for (const el of document.querySelectorAll(
    "#arrival *, #who *, #path *, #automl *, #work *, #values *, #gate *"
  )) {
    if (!el.textContent?.trim() && el.tagName !== "svg") continue;
    const r = el.getBoundingClientRect();
    if (r.height <= 0 || r.width <= 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
    boxes.push([r.top + window.scrollY, r.bottom + window.scrollY]);
  }
  boxes.sort((a, b) => a[0] - b[0]);
  const gaps = [];
  let reach = 0;
  for (const [top, bottom] of boxes) {
    if (top - reach > 260) gaps.push({ from: Math.round(reach), to: Math.round(top), px: Math.round(top - reach) });
    reach = Math.max(reach, bottom);
  }
  return gaps.sort((a, b) => b.px - a.px).slice(0, 8);
};

/** Per-chapter heights (F18 pacing). */
const chapterHeights = () =>
  [...document.querySelectorAll("section[data-chapter]")].map((s) => ({
    id: s.id,
    px: Math.round(s.getBoundingClientRect().height),
  }));

/** Accessible-name + column shape of the registry gate (F21/F56). */
const gateRegistry = () => {
  const btn = document.querySelector("[data-registry-approve]");
  const rows = [...document.querySelectorAll("[data-registry-row]")].map((li) => ({
    text: li.textContent.trim(),
    cells: [...li.children].map((c) => c.textContent.trim()),
  }));
  return {
    buttonLabel: btn?.getAttribute("aria-label") ?? null,
    buttonText: btn?.textContent.trim() ?? null,
    rows,
  };
};

/** Glyph + word censuses over the visible text (F41/F42/F43). */
const copyCensus = () => {
  const text = document.body.innerText;
  const count = (re) => (text.match(re) ?? []).length;
  return {
    chars: text.length,
    arrowIn: count(/⟶/g),
    arrowOut: count(/↗/g),
    emDash: count(/—/g),
    gateWords: count(/\bgate(s|d)?\b/gi),
    arrival: count(/\barrival\b/gi),
    cincinnati: count(/cincinnati/gi),
    receipt: count(/receipts?\b/gi),
  };
};

/** Chapter-rail labels + accessible names (F13/F14). */
const railProbe = () => {
  const links = [...document.querySelectorAll("[data-chapter-rail] a, nav[aria-label*='hapter'] a")];
  return links.map((a) => {
    const r = a.getBoundingClientRect();
    const name = a.getAttribute("aria-label") ?? a.textContent.trim();
    const label = a.querySelector("[data-rail-name], span:last-child");
    return {
      name,
      w: Math.round(r.width),
      h: Math.round(r.height),
      labelOpacity: label ? Number(getComputedStyle(label).opacity) : null,
      visited: a.getAttribute("data-visited") ?? a.dataset?.visited ?? null,
    };
  });
};

/** Tap targets under the iOS 44px floor. */
const smallTargets = () =>
  [...document.querySelectorAll("a, button")]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { text: el.textContent.trim().slice(0, 34), w: Math.round(r.width), h: Math.round(r.height) };
    })
    .filter((t) => t.w > 0 && t.h > 0 && (t.h < 30 || t.w < 24));

/* ── Run ──────────────────────────────────────────────────────── */

const browser = await chromium.launch();
const probe = { tag: TAG, base: BASE, at: new Date().toISOString() };

/* Desktop walk */
{
  const page = await browser.newPage({ viewport: DESK });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);

  probe.desk = {
    docHeight: await page.evaluate(() => document.documentElement.scrollHeight),
    heroLinks: await page.evaluate(heroLinks),
    typeCensus: await page.evaluate(typeCensus),
    chapters: await page.evaluate(chapterHeights),
    rail: await page.evaluate(railProbe),
  };
  await shot(page, "desk-hero");

  await scrollTo(page, 900);
  await shot(page, "desk-who");

  await scrollTo(page, 2600);
  await shot(page, "desk-path");

  await scrollTo(page, 3600);
  await shot(page, "desk-automl-pin");
  probe.desk.registry = await page.evaluate(gateRegistry);

  await scrollTo(page, 5400);
  await shot(page, "desk-work-1");

  await scrollTo(page, 6400);
  await shot(page, "desk-work-2");

  await scrollTo(page, 8100);
  await shot(page, "desk-values");

  await scrollTo(page, 8900);
  await shot(page, "desk-gate");

  await scrollTo(page, 9700);
  await shot(page, "desk-endnotes");

  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page);
  probe.desk.gaps = await page.evaluate(gapCensus);
  probe.desk.copy = await page.evaluate(copyCensus);
  await page.close();
}

/* Mobile walk */
{
  const page = await browser.newPage({ viewport: MOB });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  probe.mob = {
    docHeight: await page.evaluate(() => document.documentElement.scrollHeight),
    heroLinks: await page.evaluate(heroLinks),
    smallTargets: await page.evaluate(smallTargets),
  };
  await shot(page, "mob-hero");

  const gateY = await page.evaluate(
    () => (document.querySelector("#gate")?.getBoundingClientRect().top ?? 0) + window.scrollY
  );
  await scrollTo(page, gateY);
  await shot(page, "mob-gate");
  probe.mob.gateTop = Math.round(gateY);

  const workY = await page.evaluate(
    () => (document.querySelector("#work")?.getBoundingClientRect().top ?? 0) + window.scrollY
  );
  await scrollTo(page, workY + 300);
  await shot(page, "mob-work");

  /* Scene figure type at phone scale (F66) */
  probe.mob.sceneType = await page.evaluate(() => {
    const out = [];
    for (const svg of document.querySelectorAll("svg.scene-fig, .scene-fig svg, [class*='scene'] svg")) {
      const r = svg.getBoundingClientRect();
      const vb = svg.getAttribute("viewBox");
      if (!vb || r.width === 0) continue;
      const scale = r.width / parseFloat(vb.split(/\s+/)[2]);
      for (const t of svg.querySelectorAll("text")) {
        const fs = parseFloat(getComputedStyle(t).fontSize);
        out.push({
          authored: Math.round(fs * 100) / 100,
          rendered: Math.round(fs * scale * 100) / 100,
          text: t.textContent.trim().slice(0, 20),
        });
      }
    }
    return out.sort((a, b) => a.rendered - b.rendered).slice(0, 12);
  });

  /* Stamp type at phone scale (F67) */
  probe.mob.stampType = await page.evaluate(() => {
    const svg = document.querySelector("#gate svg[viewBox='0 0 300 190']");
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    const scale = r.width / 300;
    return {
      widthPx: Math.round(r.width),
      scale: Math.round(scale * 1000) / 1000,
      texts: [...svg.querySelectorAll("text")].map((t) => ({
        authored: parseFloat(getComputedStyle(t).fontSize),
        rendered: Math.round(parseFloat(getComputedStyle(t).fontSize) * scale * 100) / 100,
        text: t.textContent.trim().slice(0, 24),
      })),
    };
  });
  await page.close();
}

/* Reduced-motion / static world (F14, F15) */
{
  const ctx = await browser.newContext({ viewport: DESK, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const automlY = await page.evaluate(
    () => (document.querySelector("#automl")?.getBoundingClientRect().top ?? 0) + window.scrollY
  );
  await scrollTo(page, automlY);
  await shot(page, "static-automl");
  probe.static = {
    rail: await page.evaluate(railProbe),
    docHeight: await page.evaluate(() => document.documentElement.scrollHeight),
  };
  await ctx.close();
}

/* Thread lateral snap at the 1280 boundary (F63) */
{
  const readSpine = async (w) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const x = await page.evaluate(() => {
      const seg = document.querySelector("[data-chapter='03'] svg path, #path svg path");
      if (!seg) return null;
      const d = seg.getAttribute("d") ?? "";
      const m = d.match(/M\s*([\d.]+)/);
      return m ? Math.round(parseFloat(m[1]) * 10) / 10 : null;
    });
    await ctx.close();
    return x;
  };
  probe.thread = {
    at1279: await readSpine(1279),
    at1280: await readSpine(1280),
    at1320: await readSpine(1320),
  };
  if (probe.thread.at1279 != null && probe.thread.at1280 != null) {
    probe.thread.snapPx =
      Math.round(Math.abs(probe.thread.at1280 - probe.thread.at1279) * 10) / 10;
  }
}

await browser.close();
writeFileSync(resolve(OUT, `probe-${TAG}.json`), JSON.stringify(probe, null, 2));
console.log(`wave2 ${TAG}: shots + probe-${TAG}.json → ${OUT}`);
console.log(
  JSON.stringify(
    {
      docHeight: probe.desk?.docHeight,
      typeSizes: probe.desk?.typeCensus?.length,
      heroLinks: probe.desk?.heroLinks?.map((l) => `${l.text} → ${l.href}`),
      copy: probe.desk?.copy,
      thread: probe.thread,
      biggestGaps: probe.desk?.gaps?.slice(0, 3),
    },
    null,
    2
  )
);
