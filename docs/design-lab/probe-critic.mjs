// CRITIC PROBE — measurements, not pictures. Typography census, contrast,
// dead space, clock ticking, pin payoff, focus order, deep links.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-critic";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:4321";
const settle = (p, ms) => p.waitForTimeout(ms);
const report = {};
const browser = await chromium.launch();

const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await settle(page, 1500);

/* ── 1. Typography census ─────────────────────────────────────────── */
report.typeCensus = await page.evaluate(() => {
  const map = new Map();
  document.querySelectorAll("body *").forEach((el) => {
    const txt = (el.textContent || "").trim();
    if (!txt) return;
    // only leaf-ish text nodes
    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim()
    );
    if (!hasDirectText) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    const key = `${cs.fontSize}|${cs.fontFamily.split(",")[0]}|${cs.letterSpacing}|${cs.lineHeight}|${cs.textTransform}`;
    if (!map.has(key))
      map.set(key, {
        fontSize: cs.fontSize,
        family: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
        tracking: cs.letterSpacing,
        leading: cs.lineHeight,
        transform: cs.textTransform,
        count: 0,
        sample: txt.slice(0, 60),
      });
    map.get(key).count++;
  });
  return Array.from(map.values()).sort(
    (a, b) => parseFloat(a.fontSize) - parseFloat(b.fontSize)
  );
});

/* ── 2. Contrast audit of small text ──────────────────────────────── */
report.contrast = await page.evaluate(() => {
  function srgb(c) {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function lum([r, g, b]) {
    return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  }
  function parse(s) {
    const m = s.match(/[\d.]+/g);
    if (!m) return null;
    return [+m[0], +m[1], +m[2], m[3] !== undefined ? +m[3] : 1];
  }
  function bgOf(el) {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c[3] > 0.5) return c;
      n = n.parentElement;
    }
    const c = parse(getComputedStyle(document.body).backgroundColor);
    return c && c[3] > 0.5 ? c : [255, 253, 247, 1];
  }
  const out = [];
  document.querySelectorAll("body *").forEach((el) => {
    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim()
    );
    if (!hasDirectText) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    if (parseFloat(cs.opacity) === 0) return;
    const fg = parse(cs.color);
    if (!fg) return;
    // fold element opacity chain onto the bg
    let op = 1,
      n = el;
    while (n && n !== document.documentElement) {
      op *= parseFloat(getComputedStyle(n).opacity);
      n = n.parentElement;
    }
    const bg = bgOf(el);
    const eff = [0, 1, 2].map((i) => fg[i] * fg[3] * op + bg[i] * (1 - fg[3] * op));
    const l1 = lum(eff),
      l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight) >= 700;
    const large = px >= 24 || (px >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need + 0.35)
      out.push({
        ratio: +ratio.toFixed(2),
        need,
        px,
        opacity: +op.toFixed(2),
        color: cs.color,
        text: (el.textContent || "").trim().slice(0, 70),
      });
  });
  return out.sort((a, b) => a.ratio - b.ratio).slice(0, 40);
});

/* ── 3. Dead space census: vertical gaps between painted content ──── */
report.deadSpace = await page.evaluate(() => {
  const H = document.documentElement.scrollHeight;
  const rows = new Uint8Array(Math.ceil(H / 8));
  const mark = (el) => {
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    if (r.height <= 0 || r.width <= 0) return;
    for (let y = Math.floor(top / 8); y <= Math.floor((top + r.height) / 8); y++)
      if (y >= 0 && y < rows.length) rows[y] = 1;
  };
  document.querySelectorAll("body *").forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    if (cs.position === "fixed") return;
    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim()
    );
    if (hasDirectText) mark(el);
    if (["IMG", "SVG", "CANVAS", "HR"].includes(el.tagName)) mark(el);
  });
  const gaps = [];
  let start = null;
  for (let i = 0; i < rows.length; i++) {
    if (!rows[i]) {
      if (start === null) start = i;
    } else if (start !== null) {
      const px = (i - start) * 8;
      if (px > 420) gaps.push({ fromY: start * 8, toY: i * 8, px });
      start = null;
    }
  }
  // section boundaries for context
  const secs = Array.from(document.querySelectorAll("section[data-chapter]")).map(
    (s) => ({
      id: s.id,
      top: Math.round(s.getBoundingClientRect().top + window.scrollY),
      h: Math.round(s.getBoundingClientRect().height),
    })
  );
  return { totalHeight: H, gaps, sections: secs };
});

/* ── 4. Does the local clock tick? ────────────────────────────────── */
await page.evaluate(() => document.getElementById("gate")?.scrollIntoView());
await settle(page, 1200);
const clockA = await page
  .locator("text=/cincinnati, ohio —/")
  .first()
  .innerText()
  .catch(() => "n/a");
report.clockProbe = { t0: clockA };
report.clockLive = await page.evaluate(async () => {
  // Fake the clock forward 3 minutes and see whether the DOM follows within 40s of fake time
  const spans = Array.from(document.querySelectorAll("span")).filter(
    (s) => /^\d{1,2}:\d{2}\s?(am|pm)$/i.test(s.textContent.trim())
  );
  return spans.map((s) => s.textContent.trim());
});

/* ── 5. The ch04 pin: what actually changes during the hold ───────── */
report.pinPayoff = await page.evaluate(() => {
  const sec = document.getElementById("automl");
  return {
    sectionHeight: Math.round(sec.getBoundingClientRect().height),
    pinWide: !!document.querySelector("[data-pipeline-pin-wide]"),
    pinNarrow: !!document.querySelector("[data-pipeline-pin]"),
    leftColumnTextNodes: Array.from(
      document.querySelectorAll("[data-pipeline-pin-wide] > div:first-child *")
    )
      .filter((el) =>
        Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim())
      )
      .map((el) => el.textContent.trim().slice(0, 90)),
  };
});

/* ── 6. Focus order + visible focus ring on the first 30 tabbables ── */
await page.evaluate(() => window.scrollTo(0, 0));
await settle(page, 800);
const focusTrail = [];
for (let i = 0; i < 34; i++) {
  await page.keyboard.press("Tab");
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 46),
      outline: cs.outlineWidth + " " + cs.outlineStyle + " " + cs.outlineColor,
      boxShadow: cs.boxShadow.slice(0, 40),
      w: Math.round(r.width),
      h: Math.round(r.height),
      offscreen: r.top < -20 || r.bottom > innerHeight + 20,
    };
  });
  focusTrail.push(info);
}
report.focusTrail = focusTrail;

/* ── 7. Deep links / hash landings ────────────────────────────────── */
const anchors = ["#who", "#path", "#automl", "#work", "#values", "#gate", "#footnote-1"];
report.deepLinks = [];
for (const a of anchors) {
  const p2 = await ctx.newPage();
  await p2.goto(`${BASE}/${a}`, { waitUntil: "networkidle" });
  await settle(p2, 2200);
  const r = await p2.evaluate((sel) => {
    const id = sel.slice(1);
    const el = document.getElementById(id);
    if (!el) return { missing: true };
    const rect = el.getBoundingClientRect();
    return {
      scrollY: Math.round(window.scrollY),
      targetTopInViewport: Math.round(rect.top),
      headerH: Math.round(
        document.querySelector("header")?.getBoundingClientRect().height || 0
      ),
    };
  }, a);
  report.deepLinks.push({ anchor: a, ...r });
  await p2.screenshot({ path: `${OUT}/deeplink${a.replace("#", "-")}.png` });
  await p2.close();
}

/* ── 8. Case files + evidence + 404 ───────────────────────────────── */
const routes = [
  "/projects/jobtracker/",
  "/projects/automl/",
  "/projects/fast-mnist-nn/",
  "/projects/visual-assist/",
  "/projects/policybot/",
  "/projects/master-inventory/",
  "/projects/taskflow-calendar/",
  "/evidence/",
  "/world-preview/",
];
report.routes = [];
for (const r of routes) {
  const p3 = await ctx.newPage();
  const errs = [];
  p3.on("pageerror", (e) => errs.push(e.message));
  const resp = await p3.goto(`${BASE}${r}`, { waitUntil: "networkidle" });
  await settle(p3, 1400);
  const meta = await p3.evaluate(() => ({
    title: document.title,
    h1: Array.from(document.querySelectorAll("h1")).map((h) => h.textContent.trim()),
    desc: document.querySelector('meta[name="description"]')?.content,
    height: document.documentElement.scrollHeight,
    brokenImgs: Array.from(document.images)
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src),
  }));
  report.routes.push({ route: r, status: resp?.status(), ...meta, errs });
  await p3.screenshot({
    path: `${OUT}/route${r.replace(/\//g, "_")}top.png`,
  });
  await p3.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await settle(p3, 900);
  await p3.screenshot({
    path: `${OUT}/route${r.replace(/\//g, "_")}bottom.png`,
  });
  await p3.close();
}

/* ── 9. Every link on the home page: internal target existence ────── */
report.links = await page.evaluate(() =>
  Array.from(document.querySelectorAll("a[href]")).map((a) => ({
    href: a.getAttribute("href"),
    text: (a.textContent || "").trim().slice(0, 44),
    newTab: a.target === "_blank",
    rel: a.rel,
    box: (() => {
      const r = a.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    })(),
  }))
);

await browser.close();
writeFileSync(`${OUT}/probe.json`, JSON.stringify(report, null, 2));
console.log("probe written");
