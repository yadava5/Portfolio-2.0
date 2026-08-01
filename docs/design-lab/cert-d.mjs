/* CERT pass D — the glyph plate (F37), the stamp seats (F20/F67),
   the type census (F32), the thread spine across xl (F63), scene text
   (F66), em dashes (F42), and a link sweep. REPORT ONLY. */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.CERT_BASE || "http://localhost:4488";
const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-cert";
const R = {};
const browser = await chromium.launch();

const sceneProbe = `() => {
  const out = [];
  document.querySelectorAll('svg').forEach((s, i) => {
    const vb = s.viewBox && s.viewBox.baseVal;
    const br = s.getBoundingClientRect();
    if (!br.width) return;
    const scale = vb && vb.width ? br.width / vb.width : 1;
    const texts = [...s.querySelectorAll('text')].map(t => ({
      t: (t.textContent||'').trim().slice(0,30),
      px: +(parseFloat(getComputedStyle(t).fontSize) * scale).toFixed(2)
    })).filter(x => x.t);
    if (texts.length) out.push({ i, scale: +scale.toFixed(3), w: Math.round(br.width), texts });
  });
  return out;
}`;

for (const [w, h, tag] of [[1440, 900, "desk"], [390, 844, "mob"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2400);
  // read whole page so every scene mounts and settles
  await p.evaluate(async () => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y < H; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
  });
  await p.waitForTimeout(1500);
  const scenes = await p.evaluate(eval("(" + sceneProbe + ")"));
  R[`scenes_${tag}`] = scenes;
  const all = scenes.flatMap((s) => s.texts.map((t) => ({ ...t, svg: s.i, scale: s.scale })));
  all.sort((a, b) => a.px - b.px);
  R[`sceneMin_${tag}`] = { min: all[0], under11: all.filter((x) => x.px < 10.9) };
  R[`glyphStages_${tag}`] = scenes
    .filter((s) => s.texts.some((t) => /input|hidden|readout|answer/i.test(t.t)))
    .map((s) => ({ i: s.i, labels: s.texts.map((t) => t.t) }));

  // type census (painted only)
  R[`type_${tag}`] = await p.evaluate(() => {
    const seen = new Map();
    const it = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = it.nextNode())) {
      const t = (n.textContent || "").trim();
      if (!t) continue;
      const el = n.parentElement;
      if (!el || el.closest("svg")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) continue;
      if (el.closest(".sr-only") || (el.className || "").toString().includes("sr-only")) continue;
      const k = `${parseFloat(cs.fontSize)}|${cs.fontFamily.split(",")[0].replace(/"/g, "")}`;
      seen.set(k, (seen.get(k) || 0) + 1);
    }
    return [...seen.entries()].map(([k, c]) => ({ k, c })).sort((a, b) => parseFloat(a.k) - parseFloat(b.k));
  });

  // the stamp, at its real seat
  await p.evaluate(() => document.getElementById("gate")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(1800);
  R[`stamp_${tag}`] = await p.evaluate(() => {
    const svgs = [...document.querySelectorAll("svg")].filter((s) => /press here to sign/i.test(s.textContent || ""));
    return svgs.map((s) => {
      const vb = s.viewBox.baseVal;
      const br = s.getBoundingClientRect();
      const scale = vb.width ? br.width / vb.width : 0;
      const texts = [...s.querySelectorAll("text")].map((t) => ({ t: t.textContent.trim().slice(0, 22), px: +(parseFloat(getComputedStyle(t).fontSize) * scale).toFixed(2) })).sort((a, b) => a.px - b.px);
      const dashed = [...s.querySelectorAll("path,rect,line")].map((n) => getComputedStyle(n).strokeDasharray).filter((d) => d && d !== "none");
      return { w: Math.round(br.width), scale: +scale.toFixed(3), min: texts[0], texts, dashedStrokes: dashed.length, dashedSample: dashed.slice(0, 3) };
    });
  });

  // em dash discipline
  R[`emdash_${tag}`] = await p.evaluate(() => {
    const t = document.body.innerText;
    const total = (t.match(/—/g) || []).length;
    const blocks = [...document.querySelectorAll("p, li, figcaption")];
    let over = 0;
    const offenders = [];
    blocks.forEach((b) => {
      const c = ((b.innerText || "").match(/—/g) || []).length;
      if (c > 1) { over++; offenders.push({ n: c, t: b.innerText.replace(/\s+/g, " ").slice(0, 70), tag: b.tagName }); }
    });
    return { total, blocks: blocks.length, over, offenders: offenders.slice(0, 12) };
  });

  await ctx.close();
}

/* F63 — the spine across xl */
{
  const ctx = await browser.newContext({ viewport: { width: 1279, height: 900 } });
  const p = await ctx.newPage();
  const spine = {};
  for (const w of [1180, 1279, 1280, 1300, 1360, 1440, 1600]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.waitForTimeout(2000);
    await p.evaluate(() => document.getElementById("path")?.scrollIntoView());
    await p.waitForTimeout(1400);
    spine[w] = await p.evaluate(() => {
      const segs = [...document.querySelectorAll(".thread-segment")];
      const out = {};
      segs.forEach((s) => {
        const d = s.getAttribute("d");
        if (!d) return;
        const m = d.match(/-?[\d.]+/g);
        const ch = s.closest("[data-chapter]")?.getAttribute("data-chapter") || s.getAttribute("data-chapter") || s.id || "?";
        if (m) out[ch] = +parseFloat(m[0]).toFixed(1);
      });
      const rail = [...document.querySelectorAll('[class*="rail-label"]')].map((n) => Math.round(n.getBoundingClientRect().right));
      return { starts: out, railRight: rail.length ? Math.max(...rail) : null };
    });
    if (w === 1279 || w === 1280 || w === 1360) await p.screenshot({ path: path.join(OUT, `spine-${w}.png`) });
  }
  R.spine = spine;
  await ctx.close();
}

/* link sweep — every href on every route resolves */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const pages = ["/", "/evidence/", "/projects/jobtracker/", "/projects/automl/", "/projects/fast-mnist-nn/", "/projects/taskflow-calendar/", "/404.html"];
  const hrefs = new Set();
  for (const r of pages) {
    await p.goto(BASE + r, { waitUntil: "networkidle" });
    await p.waitForTimeout(900);
    const list = await p.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
    list.forEach((h) => hrefs.add(h));
  }
  const results = [];
  for (const h of hrefs) {
    if (!h || h.startsWith("#") || h.startsWith("mailto:")) continue;
    if (/^https?:/.test(h)) { results.push({ h, status: "external" }); continue; }
    const url = BASE + h;
    const res = await p.request.get(url).catch(() => null);
    results.push({ h, status: res ? res.status() : "ERR" });
  }
  R.links = results.filter((r) => r.status !== 200 && r.status !== "external");
  R.linkTotal = results.length;
  R.external = results.filter((r) => r.status === "external").map((r) => r.h);
  await ctx.close();
}

fs.writeFileSync(path.join(OUT, "cert-d.json"), JSON.stringify(R, null, 2));
await browser.close();
console.log(JSON.stringify({
  glyphStages_desk: R.glyphStages_desk, glyphStages_mob: R.glyphStages_mob,
  sceneMin_desk: R.sceneMin_desk, sceneMin_mob: R.sceneMin_mob,
  stamp_desk: R.stamp_desk, stamp_mob: R.stamp_mob,
  typeDesk: R.type_desk.length, typeMob: R.type_mob.length,
  emdash_desk: { total: R.emdash_desk.total, blocks: R.emdash_desk.blocks, over: R.emdash_desk.over },
  spine: R.spine, badLinks: R.links, linkTotal: R.linkTotal,
}, null, 2));
