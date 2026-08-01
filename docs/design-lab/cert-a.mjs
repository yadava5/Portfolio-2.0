/* CERT pass A — the home walk, both viewports, both worlds.
   Re-verifies F01-F08, F13-F19, F30, F35, F41, F45, F58, F62, F77.
   REPORT ONLY. */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.CERT_BASE || "http://localhost:4488";
const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-cert";
fs.mkdirSync(OUT, { recursive: true });

const R = {};
const shot = async (p, name, opts = {}) =>
  p.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });

async function settle(p, ms = 1200) {
  await p.waitForTimeout(ms);
}

async function walk(p, tag, step) {
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  const vh = p.viewportSize().height;
  const shots = [];
  for (let y = 0; y < h - vh + step; y += step) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(650);
    const n = `${tag}-y${String(Math.round(y)).padStart(5, "0")}`;
    await shot(p, n);
    shots.push(n);
  }
  return { height: h, shots: shots.length };
}

const browser = await chromium.launch();

/* ── 1. desktop motion ───────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const consoleErrors = [];
  p.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") consoleErrors.push(m.text().slice(0, 300));
  });
  p.on("pageerror", (e) => consoleErrors.push("PAGEERROR " + String(e).slice(0, 300)));
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await settle(p, 2500);

  R.consoleDesk = consoleErrors;

  // F45/F02 — the hero's first frame
  await shot(p, "desk-hero");
  R.standfirst = await p.evaluate(() => {
    const el = [...document.querySelectorAll("p,div,span")].find((n) =>
      /Ayush Yadav\s*—\s*software engineer/.test(n.textContent || "")
    );
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { text: el.textContent.trim().slice(0, 90), top: Math.round(r.top), fs: cs.fontSize, opacity: cs.opacity, family: cs.fontFamily.split(",")[0] };
  });
  R.h1 = await p.evaluate(() => {
    const h = document.querySelector("h1");
    return h ? { text: h.innerText.replace(/\s+/g, " ").trim(), aria: h.textContent.replace(/\s+/g, " ").trim() } : null;
  });

  // page geometry
  R.deskHeight = await p.evaluate(() => document.documentElement.scrollHeight);
  R.horizOverflowDesk = await p.evaluate(() => ({
    docW: document.documentElement.scrollWidth,
    winW: window.innerWidth,
  }));

  // F06 — #who at rest
  await p.evaluate(() => document.getElementById("who")?.scrollIntoView());
  await settle(p, 2800);
  R.whoRest = await p.evaluate(() => {
    const sec = document.getElementById("who");
    const out = [];
    sec?.querySelectorAll("[data-tm-word], .tm-word, span").forEach((n) => {
      const cs = getComputedStyle(n);
      const o = parseFloat(cs.opacity);
      const t = (n.textContent || "").trim();
      if (t && t.length < 25 && o < 0.55 && n.getBoundingClientRect().height > 0)
        out.push({ t, o: +o.toFixed(2) });
    });
    return out.slice(0, 25);
  });
  await shot(p, "desk-who-rest");

  // F13 — rail labels + accessible names
  R.rail = await p.evaluate(() => {
    const links = [...document.querySelectorAll('[class*="rail"] a, nav[aria-label*="hapter"] a')];
    return links.map((a) => {
      const label = a.querySelector('[class*="rail-label"], span:last-child');
      const cs = label ? getComputedStyle(label) : null;
      return {
        aria: a.getAttribute("aria-label") || a.textContent.replace(/\s+/g, " ").trim(),
        labelOpacity: cs ? +parseFloat(cs.opacity).toFixed(2) : null,
        box: (() => { const r = a.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })(),
      };
    });
  });

  // F35 — bright vs muted headline sizes
  R.brightMuted = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("[data-chapter]").forEach((sec) => {
      const b = sec.querySelector("h2");
      const m = sec.querySelector('[class*="muted"], em, i');
      if (b) out.push({
        ch: sec.getAttribute("data-chapter"),
        bright: { fs: getComputedStyle(b).fontSize, fam: getComputedStyle(b).fontFamily.split(",")[0], t: b.innerText.slice(0, 40) },
        muted: m ? { fs: getComputedStyle(m).fontSize, fam: getComputedStyle(m).fontFamily.split(",")[0], t: m.innerText.slice(0, 40) } : null,
      });
    });
    return out;
  });

  // F03/F77 — pin cost + travel tail
  await p.evaluate(() => window.scrollTo(0, 0));
  await settle(p, 800);
  const pinSamples = [];
  {
    const auto = await p.evaluate(() => document.getElementById("automl")?.getBoundingClientRect().top + window.scrollY);
    for (let y = Math.max(0, auto - 200); y < auto + 1600; y += 60) {
      await p.evaluate((yy) => window.scrollTo(0, yy), y);
      await p.waitForTimeout(140);
      const s = await p.evaluate(() => {
        const tok = document.querySelector('[class*="pipeline-token"], [class*="run-token"], .pipeline-bead');
        const left = document.querySelector("#automl h2");
        const note = document.querySelector("[data-pipeline-note]");
        return {
          tokenY: tok ? Math.round(tok.getBoundingClientRect().top + window.scrollY) : null,
          leftText: left ? left.innerText.slice(0, 30) : null,
          note: note ? (note.innerText || "").replace(/\s+/g, " ").trim().slice(0, 60) : null,
          lit: document.querySelectorAll('#automl [data-phase][data-lit="true"], #automl .is-lit').length,
        };
      });
      pinSamples.push({ y, ...s });
    }
  }
  R.pinSamples = pinSamples;

  // F41 — arrow census
  R.arrows = await p.evaluate(() => {
    const t = document.body.innerText;
    return { deeper: (t.match(/⟶/g) || []).length, external: (t.match(/↗/g) || []).length };
  });

  // F58 — testimonial
  R.testimonial = await p.evaluate(() => {
    const el = [...document.querySelectorAll("blockquote, [data-testimonial], section, div")].find((n) =>
      /recommend/i.test(n.textContent || "") && (n.textContent || "").length < 3000
    );
    return el ? el.innerText.replace(/\s+/g, " ").trim().slice(0, 400) : null;
  });

  // F19 — endnote column geometry
  R.endnotes = await p.evaluate(() => {
    const ol = [...document.querySelectorAll("ol, ul")].filter((n) => /footnote|reference|endnote/i.test(n.className + " " + (n.id || "")));
    const target = ol[0] || [...document.querySelectorAll("ol")].pop();
    if (!target) return null;
    const r = target.getBoundingClientRect();
    return { cols: getComputedStyle(target).columnCount, w: Math.round(r.width), right: Math.round(r.right), winW: window.innerWidth };
  });

  // full desktop walk
  await p.evaluate(() => window.scrollTo(0, 0));
  await settle(p, 1000);
  R.deskWalk = await walk(p, "desk", 900);

  // F16/tap targets sitewide
  R.tapDesk = await p.evaluate(() => {
    const bad = [];
    document.querySelectorAll("a,button,input,select,[role=button]").forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.height < 30 || r.width < 24)
        bad.push({ t: (n.innerText || n.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
    });
    return { count: bad.length, sample: bad.slice(0, 20) };
  });

  await ctx.close();
}

/* ── 2. desktop, motion off (static world) ───────────────────── */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await settle(p, 2200);
  R.staticHeight = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.evaluate(() => document.getElementById("automl")?.scrollIntoView());
  await settle(p, 1500);
  await shot(p, "static-automl");
  R.railStaticTop = await p.evaluate(() => {
    window.scrollTo(0, 0);
    return null;
  });
  await settle(p, 900);
  R.railMarksAtTop = await p.evaluate(() =>
    [...document.querySelectorAll('[class*="rail-mark"]')].map((n) => (n.textContent || "").trim() || getComputedStyle(n, "::before").content)
  );
  await shot(p, "static-top");
  // F15 — figure outlines in static world
  R.figOutlines = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("figure").forEach((f) => {
      const cs = getComputedStyle(f);
      if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0)
        out.push({ outline: cs.outline, offset: cs.outlineOffset, tier: document.documentElement.getAttribute("data-tier") });
    });
    return { count: out.length, sample: out.slice(0, 3), tier: document.documentElement.getAttribute("data-tier") };
  });
  R.dipStatic = await p.evaluate(() => document.querySelectorAll(".thread-dip").length);
  await ctx.close();
}

/* ── 3. mobile 390 ───────────────────────────────────────────── */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 200)));
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await settle(p, 2500);
  R.consoleMob = errs;
  await shot(p, "mob-hero");
  R.mobHeight = await p.evaluate(() => document.documentElement.scrollHeight);
  R.horizOverflowMob = await p.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: window.innerWidth }));

  // F16 — hero affordances in the first frame
  R.mobHeroAffordances = await p.evaluate(() => {
    const hero = document.getElementById("arrival") || document.body;
    const out = [];
    hero.querySelectorAll("a,button").forEach((n) => {
      const r = n.getBoundingClientRect();
      const cs = getComputedStyle(n);
      if (r.width === 0 || r.height === 0 || cs.visibility === "hidden" || cs.display === "none") return;
      out.push({ t: (n.innerText || n.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) });
    });
    return out;
  });

  // F66/F67 — smallest painted text at 390
  R.mobSmallText = await p.evaluate(() => {
    const seen = [];
    const walkNodes = (root) => {
      const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = it.nextNode())) {
        const t = (n.textContent || "").trim();
        if (!t) continue;
        const el = n.parentElement;
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue;
        if (el.closest(".sr-only, [aria-hidden=true][hidden]")) continue;
        // rendered size = font-size * accumulated scale (SVG viewBox)
        let scale = 1;
        const svg = el.closest("svg");
        if (svg) {
          const vb = svg.viewBox?.baseVal;
          const br = svg.getBoundingClientRect();
          if (vb && vb.width) scale = br.width / vb.width;
        }
        const px = parseFloat(cs.fontSize) * scale;
        seen.push({ px: +px.toFixed(2), t: t.slice(0, 28), svg: !!svg });
      }
    };
    walkNodes(document.body);
    seen.sort((a, b) => a.px - b.px);
    return { min: seen[0], under11: seen.filter((s) => s.px < 10.9).slice(0, 15), count: seen.length };
  });

  R.tapMob = await p.evaluate(() => {
    const bad = [];
    document.querySelectorAll("a,button,input,select,[role=button]").forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.height < 30 || r.width < 24) bad.push({ t: (n.innerText || n.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
    });
    return { count: bad.length, sample: bad.slice(0, 25) };
  });

  await walk(p, "mob", 844);

  // F08 — mobile gate
  await p.evaluate(() => document.getElementById("gate")?.scrollIntoView());
  await settle(p, 1800);
  await shot(p, "mob-gate");
  await ctx.close();
}

fs.writeFileSync(path.join(OUT, "cert-a.json"), JSON.stringify(R, null, 2));
await browser.close();
console.log(JSON.stringify({
  h1: R.h1, standfirst: R.standfirst,
  deskHeight: R.deskHeight, staticHeight: R.staticHeight, mobHeight: R.mobHeight,
  horizDesk: R.horizOverflowDesk, horizMob: R.horizOverflowMob,
  whoRest: R.whoRest.length, rail: R.rail.length,
  arrows: R.arrows, mobHeroAffordances: R.mobHeroAffordances.length,
  tapDesk: R.tapDesk.count, tapMob: R.tapMob.count,
  minMobText: R.mobSmallText.min, under11: R.mobSmallText.under11.length,
  consoleDesk: R.consoleDesk.length, consoleMob: R.consoleMob.length,
}, null, 2));
