/* CERT pass B — navigation, history, deep links, the pin's payload,
   mobile reachability, the gate, the governor. REPORT ONLY. */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.CERT_BASE || "http://localhost:4488";
const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-cert";
fs.mkdirSync(OUT, { recursive: true });
const R = {};
const browser = await chromium.launch();

/* ── F05 · nav writes history? ───────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2200);
  const trail = [];
  for (const label of ["the work", "experience", "contact"]) {
    const link = p.locator(`header a:has-text("${label}")`).first();
    await link.click();
    await p.waitForTimeout(2600);
    trail.push({
      label,
      url: p.url(),
      scrollY: await p.evaluate(() => Math.round(window.scrollY)),
      histLen: await p.evaluate(() => history.length),
    });
  }
  // F01 · the contact destination
  R.navContact = await p.evaluate(() => {
    const gate = document.getElementById("gate");
    if (!gate) return null;
    const pick = (sel) => {
      const n = gate.querySelector(sel);
      if (!n) return null;
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      return { o: +parseFloat(cs.opacity).toFixed(2), top: Math.round(r.top), t: (n.innerText || "").replace(/\s+/g, " ").trim().slice(0, 40) };
    };
    const mail = pick('a[href^="mailto:"]');
    const links = [...gate.querySelectorAll("a")].map((a) => {
      const cs = getComputedStyle(a);
      const r = a.getBoundingClientRect();
      return { t: (a.innerText || "").replace(/\s+/g, " ").trim().slice(0, 26), o: +parseFloat(cs.opacity).toFixed(2), top: Math.round(r.top) };
    });
    const invite = [...gate.querySelectorAll("p,div,span")].find((n) => /Email me/i.test(n.textContent || ""));
    return {
      mail,
      invisibleLinks: links.filter((l) => l.o < 0.9),
      totalLinks: links.length,
      invite: invite ? { o: +parseFloat(getComputedStyle(invite).opacity).toFixed(2), top: Math.round(invite.getBoundingClientRect().top) } : null,
    };
  });
  await p.screenshot({ path: path.join(OUT, "nav-contact.png") });

  await p.goBack().catch(() => {});
  await p.waitForTimeout(1800);
  const afterBack = { url: p.url(), scrollY: await p.evaluate(() => Math.round(window.scrollY)) };
  await p.goForward().catch(() => {});
  await p.waitForTimeout(1800);
  const afterFwd = { url: p.url(), scrollY: await p.evaluate(() => Math.round(window.scrollY)) };
  R.navTrail = { trail, afterBack, afterFwd };
  await ctx.close();
}

/* ── F09/F69 · deep-link landings over time ──────────────────── */
{
  const anchors = ["#who", "#path", "#automl", "#work", "#values", "#gate"];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const land = {};
  for (const a of anchors) {
    const p = await ctx.newPage();
    await p.goto(BASE + "/" + a, { waitUntil: "domcontentloaded" });
    const samples = [];
    for (const t of [800, 1600, 2600, 4000, 5200]) {
      await p.waitForTimeout(t - (samples.length ? [800, 1600, 2600, 4000, 5200][samples.length - 1] : 0));
      samples.push(
        await p.evaluate((sel) => {
          const el = document.querySelector(sel);
          return el ? Math.round(el.getBoundingClientRect().top) : null;
        }, a)
      );
    }
    land[a] = samples;
    if (a === "#values") await p.screenshot({ path: path.join(OUT, "deeplink-values.png") });
    await p.close();
  }
  // a cited figure, no JS
  const noJs = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const np = await noJs.newPage();
  await np.goto(BASE + "/projects/automl/#fig-4", { waitUntil: "domcontentloaded" });
  await np.waitForTimeout(1200);
  land["nojs:#fig-4"] = [
    await np.evaluate(() => {
      const el = document.querySelector("#fig-4");
      return el ? Math.round(el.getBoundingClientRect().top) : null;
    }),
  ];
  await np.goto(BASE + "/#values", { waitUntil: "domcontentloaded" });
  await np.waitForTimeout(1000);
  land["nojs:#values"] = [await np.evaluate(() => { const el = document.querySelector("#values"); return el ? Math.round(el.getBoundingClientRect().top) : null; })];
  // F71 — thread + overlay with JS off
  R.noJs = await np.evaluate(() => ({
    threadSegments: document.querySelectorAll(".thread-segment").length,
    threadWithD: [...document.querySelectorAll(".thread-segment")].filter((n) => n.getAttribute("d")).length,
    pipelineChildren: document.querySelector(".pipeline-overlay, [class*=pipeline] svg")?.children.length ?? null,
  }));
  await np.screenshot({ path: path.join(OUT, "nojs-home.png"), fullPage: false });
  await noJs.close();
  R.headerH = await (async () => {
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    const v = await p.evaluate(() => {
      const h = document.querySelector("header");
      return { h: Math.round(h.getBoundingClientRect().height), scrollPad: getComputedStyle(document.documentElement).scrollPaddingTop };
    });
    await p.close();
    return v;
  })();
  R.deepLinks = land;
  await ctx.close();
}

/* ── F03 · does the pin develop? ─────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2400);
  const anchor = await p.evaluate(() => Math.round(document.getElementById("automl").getBoundingClientRect().top + window.scrollY));
  const frames = [];
  for (let y = anchor - 100; y < anchor + 2000; y += 50) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(160);
    const s = await p.evaluate(() => {
      const vis = (n) => {
        const r = n.getBoundingClientRect();
        const cs = getComputedStyle(n);
        return r.height > 0 && r.top < innerHeight && r.bottom > 0 && cs.visibility !== "hidden" && +cs.opacity > 0.05;
      };
      const notes = [...document.querySelectorAll("[data-pipeline-note]")].filter(vis).map((n) => n.innerText.replace(/\s+/g, " ").trim().slice(0, 70));
      const rows = [...document.querySelectorAll("[data-registry-row]")].filter(vis).length;
      const tok = document.querySelector('.pipeline-token, [class*="pipeline-token"], .pipeline-bead');
      const phases = [...document.querySelectorAll("#automl [data-phase]")].map((n) => getComputedStyle(n).color);
      const left = document.querySelector("#automl");
      const leftTxt = left ? left.innerText.replace(/\s+/g, " ").trim() : "";
      return {
        notes,
        rows,
        tokenTop: tok ? Math.round(tok.getBoundingClientRect().top) : null,
        litPhases: new Set(phases).size,
        leftHash: leftTxt.length,
        leftHead: leftTxt.slice(0, 120),
      };
    });
    frames.push({ y, ...s });
  }
  R.pinFrames = frames;
  await ctx.close();
}

/* ── mobile reachability ─────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2400);
  R.mobLinks = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("a[href]").forEach((a) => {
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      const visible = r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
      out.push({ href: a.getAttribute("href"), t: (a.innerText || a.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 34), visible, w: Math.round(r.width), h: Math.round(r.height) });
    });
    return out;
  });
  R.mobEvidenceReachable = R.mobLinks.filter((l) => /evidence/.test(l.href || "") && l.visible);
  R.mobHeader = await p.evaluate(() =>
    [...document.querySelectorAll("header a, header button")].map((n) => {
      const r = n.getBoundingClientRect();
      return { t: (n.innerText || "").replace(/\s+/g, " ").trim().slice(0, 24), aria: n.getAttribute("aria-label"), w: Math.round(r.width), h: Math.round(r.height), visible: r.width > 0 };
    })
  );
  // hero gap
  R.mobHeroGap = await p.evaluate(() => {
    const sf = [...document.querySelectorAll("p")].find((n) => /software engineer/.test(n.textContent || ""));
    const cap = [...document.querySelectorAll("a")].find((n) => /the capstone/.test(n.textContent || ""));
    if (!sf || !cap) return null;
    return { standfirstBottom: Math.round(sf.getBoundingClientRect().bottom), capstoneTop: Math.round(cap.getBoundingClientRect().top), gap: Math.round(cap.getBoundingClientRect().top - sf.getBoundingClientRect().bottom) };
  });
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2200);
  R.deskHeroGap = await p.evaluate(() => {
    const sf = [...document.querySelectorAll("p")].find((n) => /software engineer/.test(n.textContent || ""));
    const cap = [...document.querySelectorAll("a")].find((n) => /the capstone/.test(n.textContent || ""));
    if (!sf || !cap) return null;
    const s = sf.getBoundingClientRect(), c = cap.getBoundingClientRect();
    return { standfirst: { top: Math.round(s.top), bottom: Math.round(s.bottom), fs: getComputedStyle(sf).fontSize }, capstoneTop: Math.round(c.top), gap: Math.round(c.top - s.bottom) };
  });
  // F79 dip in motion world
  R.dipMotion = await p.evaluate(() => document.querySelectorAll(".thread-dip").length);
  // F74 governor harness
  R.governorHarness = await p.evaluate(() => typeof window.__frameGovernor);
  R.tier = await p.evaluate(() => document.documentElement.getAttribute("data-tier"));
  await ctx.close();
}

/* ── reduced motion tier check ───────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1800);
  R.reducedTier = await p.evaluate(() => ({
    tier: document.documentElement.getAttribute("data-tier"),
    motionOff: document.documentElement.hasAttribute("data-motion-off"),
  }));
  await ctx.close();
}

fs.writeFileSync(path.join(OUT, "cert-b.json"), JSON.stringify(R, null, 2));
await browser.close();
console.log(JSON.stringify({
  navTrail: R.navTrail, navContact: R.navContact, deepLinks: R.deepLinks,
  headerH: R.headerH, noJs: R.noJs, mobEvidenceReachable: R.mobEvidenceReachable,
  mobHeader: R.mobHeader, mobHeroGap: R.mobHeroGap, deskHeroGap: R.deskHeroGap,
  dipMotion: R.dipMotion, governorHarness: R.governorHarness, tier: R.tier,
  reducedTier: R.reducedTier,
}, null, 2));
