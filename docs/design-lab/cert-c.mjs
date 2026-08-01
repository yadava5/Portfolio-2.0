/* CERT pass C — print, subpages, /evidence, 404, case files, scenes,
   the stamp, the registry, the governor cap. REPORT ONLY. */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.CERT_BASE || "http://localhost:4488";
const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-cert";
fs.mkdirSync(OUT, { recursive: true });
const R = {};
const browser = await chromium.launch();

const lum = (c) => {
  const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* ── F04 · the paper edition ─────────────────────────────────── */
const routes = [
  ["home", "/"],
  ["evidence", "/evidence/"],
  ["case-automl", "/projects/automl/"],
  ["case-jobtracker", "/projects/jobtracker/"],
  ["notfound", "/404.html"],
];
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const printOut = {};
  for (const [name, url] of routes) {
    const p = await ctx.newPage();
    await p.goto(BASE + url, { waitUntil: "networkidle" });
    await p.waitForTimeout(2000);
    // read the whole document as a reader would before printing
    await p.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 800) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(1200);
    await p.emulateMedia({ media: "print" });
    await p.waitForTimeout(800);
    const probe = await p.evaluate(() => {
      const parse = (s) => {
        const m = s.match(/-?[\d.]+/g);
        if (!m) return null;
        const n = m.slice(0, 3).map(Number);
        return s.includes("srgb") || s.includes("color(") ? n : n.map((v) => v / 255);
      };
      const bad = [];
      const fixed = [];
      const faded = [];
      document.querySelectorAll("*").forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.position === "fixed" && cs.display !== "none" && el.getBoundingClientRect().height > 0)
          fixed.push(el.tagName + "." + String(el.className).slice(0, 30));
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!hasText) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (cs.display === "none" || cs.visibility === "hidden") return;
        const o = parseFloat(cs.opacity);
        if (o < 0.9 && el.matches("[data-tm], [data-tm-word], [data-tm-block]"))
          faded.push({ t: el.textContent.trim().slice(0, 40), o });
        if (o === 0) return;
        bad.push({ color: cs.color, t: el.textContent.trim().slice(0, 46) });
      });
      return { colors: bad, fixed: [...new Set(fixed)], faded };
    });
    const parse = (s) => {
      const m = s.match(/-?[\d.]+/g);
      if (!m) return null;
      const n = m.slice(0, 3).map(Number);
      return s.includes("srgb") || s.startsWith("color(") ? n : n.map((v) => v / 255);
    };
    const low = probe.colors
      .map((c) => ({ ...c, r: parse(c.color) ? +ratio(parse(c.color), [1, 1, 1]).toFixed(2) : null }))
      .filter((c) => c.r !== null && c.r < 4.5);
    const pdf = path.join(OUT, `print-${name}.pdf`);
    await p.pdf({ path: pdf, format: "Letter", printBackground: false, margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" } });
    const bytes = fs.statSync(pdf).size;
    printOut[name] = { lowContrastOnWhite: low.slice(0, 12), lowCount: low.length, fixedBoxes: probe.fixed, faded: probe.faded.length, pdfBytes: bytes };
    await p.close();
  }
  R.print = printOut;
  await ctx.close();
}

/* ── /evidence, case files, 404 on screen ────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/evidence/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: path.join(OUT, "evidence-top.png") });
  R.evidence = await p.evaluate(() => {
    const t = document.body.innerText;
    return {
      entries: (t.match(/\be-\s?\d\d/g) || []).length,
      receipt: (t.match(/receipt/gi) || []).length,
      arguedIn: (t.match(/argued in/gi) || []).length,
      arrowsExternal: (t.match(/↗/g) || []).length,
      arrowsDeeper: (t.match(/⟶/g) || []).length,
      sameOriginExternalArrow: [...document.querySelectorAll("a")].filter((a) => {
        const href = a.getAttribute("href") || "";
        const isSame = href.startsWith("/") || href.includes(location.host);
        return isSame && /↗/.test(a.textContent || "");
      }).length,
      noDate: (t.match(/not recorded/gi) || []).length,
      selfHosted: (t.match(/self-hosted/gi) || []).length,
      selfAuthored: (t.match(/self-authored/gi) || []).length,
      h1: document.querySelector("h1")?.innerText,
      glyphTouching: /⟶✓|✓passed/.test(t),
    };
  });
  await p.close();

  const legends = {};
  for (const id of ["jobtracker", "automl", "visual-assist", "taskflow-calendar", "master-inventory", "policybot", "fast-mnist-nn"]) {
    const q = await ctx.newPage();
    const errs = [];
    q.on("pageerror", (e) => errs.push(String(e).slice(0, 150)));
    await q.goto(`${BASE}/projects/${id}/`, { waitUntil: "networkidle" });
    await q.waitForTimeout(1400);
    legends[id] = await q.evaluate(() => {
      const t = document.body.innerText;
      return {
        legend: /local — verified on request/i.test(t),
        badge: /\[local\]|\[local —/i.test(t),
        h1: document.querySelector("h1")?.innerText.slice(0, 60),
        title: document.title,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    legends[id].errors = errs;
    await q.screenshot({ path: path.join(OUT, `case-${id}.png`) });
    await q.close();
  }
  R.caseFiles = legends;

  const nf = await ctx.newPage();
  await nf.goto(BASE + "/404.html", { waitUntil: "networkidle" });
  await nf.waitForTimeout(1200);
  await nf.screenshot({ path: path.join(OUT, "404.png") });
  R.notFound = await nf.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.innerText,
    homeHref: [...document.querySelectorAll("a,button")].map((n) => ({ t: (n.innerText || "").replace(/\s+/g, " ").trim().slice(0, 30), href: n.getAttribute("href") })),
  }));
  await nf.close();
  await ctx.close();
}

/* ── F37/F66 · the scenes; F20/F67 · the stamp; F56 · registry ─ */
{
  for (const [w, h, tag] of [[1440, 900, "desk"], [390, 844, "mob"]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(2400);
    await p.evaluate(() => document.getElementById("work")?.scrollIntoView());
    await p.waitForTimeout(1600);
    const glyph = await p.evaluate(() => {
      const svgs = [...document.querySelectorAll("svg")].filter((s) => /glyph|mnist|forward/i.test(s.outerHTML.slice(0, 4000)));
      const s = svgs[0];
      if (!s) return null;
      const texts = [...s.querySelectorAll("text")].map((t) => t.textContent.trim()).filter(Boolean);
      return { labels: texts, hasStages: ["input", "hidden", "readout", "answer"].filter((k) => texts.some((t) => t.toLowerCase().includes(k))) };
    });
    // scroll to the glyph row for a shot
    await p.evaluate(() => {
      const el = [...document.querySelectorAll("h3,h2")].find((n) => /glyph/i.test(n.textContent || ""));
      el?.scrollIntoView({ block: "center" });
    });
    await p.waitForTimeout(1400);
    await p.screenshot({ path: path.join(OUT, `${tag}-glyph.png`) });
    R[`glyph_${tag}`] = glyph;

    await p.evaluate(() => document.getElementById("automl")?.scrollIntoView());
    await p.waitForTimeout(1600);
    await p.screenshot({ path: path.join(OUT, `${tag}-registry.png`) });
    R[`registry_${tag}`] = await p.evaluate(() => {
      const fig = [...document.querySelectorAll("figure,table,div")].find((n) => /awaiting approval/i.test(n.textContent || ""));
      const btn = [...document.querySelectorAll("button")].find((b) => /approv/i.test(b.textContent + (b.getAttribute("aria-label") || "")));
      return {
        text: fig ? fig.innerText.replace(/\s+/g, " ").trim().slice(0, 260) : null,
        approveAria: btn ? btn.getAttribute("aria-label") || btn.innerText.trim() : null,
        redaction: /▓/.test(document.body.innerText),
      };
    });

    await p.evaluate(() => document.getElementById("gate")?.scrollIntoView());
    await p.waitForTimeout(1800);
    await p.screenshot({ path: path.join(OUT, `${tag}-gate.png`) });
    R[`stamp_${tag}`] = await p.evaluate(() => {
      const svg = [...document.querySelectorAll("svg")].find((s) => /press here to sign|run no\./i.test(s.textContent || ""));
      if (!svg) return null;
      const vb = svg.viewBox.baseVal;
      const br = svg.getBoundingClientRect();
      const scale = vb.width ? br.width / vb.width : 1;
      const texts = [...svg.querySelectorAll("text")].map((t) => ({
        t: t.textContent.trim().slice(0, 24),
        px: +(parseFloat(getComputedStyle(t).fontSize) * scale).toFixed(2),
      }));
      texts.sort((a, b) => a.px - b.px);
      const frames = [...svg.querySelectorAll("path,rect")].map((n) => getComputedStyle(n).strokeDasharray).filter((d) => d && d !== "none");
      return { min: texts[0], all: texts, dashed: frames, scale: +scale.toFixed(3) };
    });
    await ctx.close();
  }
}

/* ── F73 · the print cap expires ─────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await p.evaluate(() => {
    sessionStorage.setItem("study-tier-cap", "print");
    sessionStorage.setItem("study-tier-cap-until", String(Date.now() - 1000));
  });
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  R.capExpired = await p.evaluate(() => ({
    tier: document.documentElement.getAttribute("data-tier"),
    motionOff: document.documentElement.hasAttribute("data-motion-off"),
    capLeft: sessionStorage.getItem("study-tier-cap"),
  }));
  await p.evaluate(() => {
    sessionStorage.setItem("study-tier-cap", "print");
    sessionStorage.removeItem("study-tier-cap-until");
  });
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  R.capNoExpiry = await p.evaluate(() => ({ tier: document.documentElement.getAttribute("data-tier") }));
  await ctx.close();
}

fs.writeFileSync(path.join(OUT, "cert-c.json"), JSON.stringify(R, null, 2));
await browser.close();
console.log(JSON.stringify(R, null, 2).slice(0, 9000));
