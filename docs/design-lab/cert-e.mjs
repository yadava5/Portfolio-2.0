/* CERT pass E — dead-paper census, the ¶05→¶06 seam, chapter pacing,
   fig 5.3's settled frame, focus order, and the keyboard walk.
   REPORT ONLY. */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.CERT_BASE || "http://localhost:4488";
const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-cert";
const R = {};
const browser = await chromium.launch();

/* gap census + chapter pacing, motion + static */
for (const [reduced, tag] of [[false, "motion"], [true, "static"]]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  // read the whole page so every reveal has fired
  await p.evaluate(async () => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y < H; y += 450) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 110)); }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(1500);

  R[`pacing_${tag}`] = await p.evaluate(() => {
    const H = document.documentElement.scrollHeight;
    return [...document.querySelectorAll("[data-chapter]")].map((s) => {
      const r = s.getBoundingClientRect();
      const px = Math.round(r.height);
      return { ch: s.getAttribute("data-chapter"), px, vp: +(px / 900).toFixed(2), share: +((px / H) * 100).toFixed(1) };
    });
  });

  R[`gaps_${tag}`] = await p.evaluate(() => {
    // every painted box's vertical extent; find runs of empty document
    const boxes = [];
    document.querySelectorAll("body *").forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return;
      if (cs.position === "fixed") return;
      const hasInk =
        [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) ||
        el.tagName === "IMG" || el.tagName === "SVG" || el.tagName === "path" ||
        (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") ||
        parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0;
      if (!hasInk) return;
      const r = el.getBoundingClientRect();
      if (r.height <= 0 || r.width <= 0) return;
      boxes.push([Math.round(r.top + scrollY), Math.round(r.bottom + scrollY)]);
    });
    boxes.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const b of boxes) {
      if (!merged.length || b[0] > merged[merged.length - 1][1] + 1) merged.push([...b]);
      else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], b[1]);
    }
    const gaps = [];
    for (let i = 1; i < merged.length; i++) {
      const g = merged[i][0] - merged[i - 1][1];
      if (g > 150) gaps.push({ from: merged[i - 1][1], to: merged[i][0], px: g });
    }
    return gaps.sort((a, b) => b.px - a.px).slice(0, 8);
  });

  // the ¶05 → ¶06 seam, measured on the page as a reader sees it
  R[`seam_${tag}`] = await p.evaluate(() => {
    const folio = [...document.querySelectorAll("[data-thread-folio]")].find((n) => /05\s*\/\s*07/.test(n.innerText));
    const kicker = [...document.querySelectorAll("p,div")].find((n) => /¶\s*06\s*\/\s*07/.test(n.innerText || ""));
    if (!folio || !kicker) return null;
    const a = folio.getBoundingClientRect().bottom + scrollY;
    const b = kicker.getBoundingClientRect().top + scrollY;
    return { folioBottom: Math.round(a), kickerTop: Math.round(b), gap: Math.round(b - a) };
  });

  // fig 5.3 — does the settled frame carry the chips the caption promises?
  R[`fig53_${tag}`] = await p.evaluate(() => {
    const cap = [...document.querySelectorAll("figcaption")].find((n) => /fig\.\s*5\.3/.test(n.innerText));
    if (!cap) return null;
    const fig = cap.closest("figure");
    const svg = fig?.querySelector("svg");
    if (!svg) return null;
    const inkNodes = [...svg.querySelectorAll("*")].filter((n) => {
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && +cs.opacity > 0.05 && cs.visibility !== "hidden";
    });
    return {
      caption: cap.innerText.replace(/\s+/g, " ").slice(0, 120),
      texts: [...svg.querySelectorAll("text")].filter((t) => +getComputedStyle(t).opacity > 0.05).map((t) => t.textContent.trim()).filter(Boolean),
      inkNodes: inkNodes.length,
      totalNodes: svg.querySelectorAll("*").length,
      lowOpacity: [...svg.querySelectorAll("*")].filter((n) => +getComputedStyle(n).opacity < 0.05).length,
    };
  });
  await ctx.close();
}

/* focus order + keyboard walk */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2200);
  const trail = [];
  for (let i = 0; i < 24; i++) {
    await p.keyboard.press("Tab");
    await p.waitForTimeout(90);
    trail.push(
      await p.evaluate(() => {
        const a = document.activeElement;
        if (!a) return null;
        const r = a.getBoundingClientRect();
        const cs = getComputedStyle(a);
        return {
          tag: a.tagName,
          name: (a.getAttribute("aria-label") || a.innerText || "").replace(/\s+/g, " ").trim().slice(0, 34),
          box: [Math.round(r.width), Math.round(r.height)],
          onScreen: r.top >= -2 && r.bottom <= window.innerHeight + 2,
          outline: cs.outlineStyle !== "none" || cs.boxShadow !== "none",
        };
      })
    );
  }
  R.focusTrail = trail;
  await p.screenshot({ path: path.join(OUT, "focus-24.png") });
  await ctx.close();
}

fs.writeFileSync(path.join(OUT, "cert-e.json"), JSON.stringify(R, null, 2));
await browser.close();
console.log(JSON.stringify(R, null, 2).slice(0, 8000));
