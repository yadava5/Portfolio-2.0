// NITPICK 3 — the fresh sweep. The angles three passes under-covered:
// reflow at 400% zoom, the 1.4.12 text-spacing override, the print
// sheet, the tab order and whether every stop shows a mark, forced
// colors, landscape phone, ambiguous link text, heading order, and the
// per-route head.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-nitpick3";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3601";
const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const want = (n) => flags.length === 0 || flags.includes(`--${n}`);
const notes = [];
const note = (k, v) => { notes.push({ k, v }); console.log(`\n[${k}]\n${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`); };

const ROUTES = [
  "/", "/evidence/", "/no-such-page/",
  "/projects/automl/", "/projects/fast-mnist-nn/", "/projects/jobtracker/",
  "/projects/master-inventory/", "/projects/policybot/",
  "/projects/taskflow-calendar/", "/projects/visual-assist/",
];

const browser = await chromium.launch();

// ---- 1. WCAG 1.4.10 reflow: 1280 at 400% == 320 CSS px, no 2-axis scroll
if (want("reflow")) {
  const out = [];
  for (const scale of [2, 4]) {
    const ctx = await browser.newContext({
      viewport: { width: Math.round(1280 / scale), height: Math.round(1024 / scale) },
      deviceScaleFactor: scale,
    });
    const page = await ctx.newPage();
    for (const r of ROUTES) {
      await page.goto(BASE + r, { waitUntil: "networkidle" });
      await page.waitForTimeout(700);
      const v = await page.evaluate(() => ({
        over: document.documentElement.scrollWidth - window.innerWidth,
        vw: window.innerWidth,
      }));
      out.push({ zoom: `${scale * 100}%`, route: r, cssPx: v.vw, hOverflow: v.over });
    }
    await ctx.close();
  }
  note("reflow", out);
}

// ---- 2. WCAG 1.4.12 text spacing — the user stylesheet a low-vision
//         reader applies. Nothing may be clipped or lost.
if (want("spacing")) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const out = [];
  for (const r of ROUTES) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.addStyleTag({
      content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important; }
        p, li, h1, h2, h3, h4 { margin-bottom: 2em !important; }`,
    });
    await page.waitForTimeout(900);
    const v = await page.evaluate(() => {
      const clipped = [];
      for (const el of document.querySelectorAll("p,li,h1,h2,h3,h4,span,a,button,td,th")) {
        const cs = getComputedStyle(el);
        if (cs.overflow === "hidden" || cs.overflowY === "hidden") {
          if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0)
            clipped.push({ t: (el.textContent ?? "").trim().slice(0, 44), sh: el.scrollHeight, ch: el.clientHeight });
        }
      }
      return { over: document.documentElement.scrollWidth - window.innerWidth, clipped: clipped.slice(0, 8), nClipped: clipped.length };
    });
    out.push({ route: r, ...v });
  }
  note("textSpacing@390", out);
  await ctx.close();
}

// ---- 3. tab order + does every stop paint a mark
if (want("tab")) {
  const out = [];
  for (const r of ["/", "/evidence/", "/projects/automl/", "/no-such-page/"]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    const stops = [];
    let last = "";
    for (let i = 0; i < 120; i++) {
      await page.keyboard.press("Tab");
      const s = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const b = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const reg = el.querySelector?.(".stamp-register");
        const hasMark =
          (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) ||
          (reg && getComputedStyle(reg).opacity !== "0") ||
          cs.boxShadow !== "none";
        return {
          t: (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().replace(/\s+/g, " ").slice(0, 46),
          tag: el.tagName.toLowerCase(),
          w: Math.round(b.width), h: Math.round(b.height),
          offscreen: b.width === 0 && b.height === 0,
          ring: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
          hasMark: !!hasMark,
          fv: el.matches(":focus-visible"),
        };
      });
      if (!s) break;
      const key = s.t + s.tag + s.w;
      if (key === last && i > 0) break;
      last = key;
      stops.push(s);
    }
    const inks = {};
    for (const s of stops) inks[s.ring] = (inks[s.ring] ?? 0) + 1;
    out.push({
      route: r, n: stops.length,
      inks,
      noMark: stops.filter((s) => !s.hasMark).map((s) => s.t),
      invisible: stops.filter((s) => s.offscreen).map((s) => s.t),
      notFocusVisible: stops.filter((s) => !s.fv).map((s) => s.t),
      order: stops.map((s) => s.t),
    });
    await ctx.close();
  }
  note("tabOrder", out);
}

// ---- 4. ambiguous link text + heading order + per-route head
if (want("copy")) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const out = [];
  for (const r of ROUTES) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1600);
    const v = await page.evaluate(() => {
      const links = [...document.querySelectorAll("a[href]")].filter((a) => a.getBoundingClientRect().width);
      const byText = {};
      for (const a of links) {
        const t = (a.getAttribute("aria-label") || a.textContent || "").trim().replace(/\s+/g, " ");
        (byText[t] ??= new Set()).add(a.getAttribute("href"));
      }
      const ambiguous = Object.entries(byText)
        .filter(([, hrefs]) => hrefs.size > 1)
        .map(([t, hrefs]) => ({ text: t, n: hrefs.size, hrefs: [...hrefs].slice(0, 5) }));
      const heads = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => ({
        lvl: +h.tagName[1], t: (h.textContent ?? "").trim().slice(0, 46),
      }));
      const jumps = [];
      for (let i = 1; i < heads.length; i++)
        if (heads[i].lvl > heads[i - 1].lvl + 1) jumps.push(`${heads[i - 1].lvl}→${heads[i].lvl} @ "${heads[i].t}"`);
      const imgs = [...document.querySelectorAll("img")].map((i) => ({
        alt: i.getAttribute("alt"), src: (i.getAttribute("src") ?? "").split("/").pop(),
        loading: i.getAttribute("loading"), w: i.naturalWidth, h: i.naturalHeight,
        dw: Math.round(i.getBoundingClientRect().width),
      }));
      return {
        title: document.title,
        desc: document.querySelector('meta[name=description]')?.content ?? null,
        h1: heads.filter((h) => h.lvl === 1).map((h) => h.t),
        nHeads: heads.length,
        jumps,
        ambiguous,
        nLinks: links.length,
        imgNoAlt: imgs.filter((i) => i.alt === null).map((i) => i.src),
        imgOversized: imgs.filter((i) => i.dw && i.w > i.dw * 2.4).map((i) => `${i.src} nat=${i.w} disp=${i.dw}`),
        imgEager: imgs.filter((i) => i.loading !== "lazy").length,
        newTabNoWarn: [...document.querySelectorAll('a[target=_blank]')]
          .filter((a) => !/↗|new tab|new window/i.test((a.textContent ?? "") + (a.getAttribute("aria-label") ?? "")))
          .map((a) => (a.textContent ?? "").trim().slice(0, 34)),
      };
    });
    out.push({ route: r, ...v });
  }
  note("copyAudit", out);
  await ctx.close();
}

// ---- 5. print
if (want("print")) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const r of ["/", "/projects/automl/"]) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.waitForTimeout(900);
    const v = await page.evaluate(() => ({
      bodyBg: getComputedStyle(document.body).backgroundColor,
      bodyColor: getComputedStyle(document.body).color,
      headerDisplay: getComputedStyle(document.querySelector("header") ?? document.body).display,
      hasPrintRule: [...document.styleSheets].some((s) => {
        try { return [...s.cssRules].some((r) => r.conditionText?.includes("print")); } catch { return false; }
      }),
      urlsShown: /content:\s*" \("/.test([...document.styleSheets].map((s) => { try { return [...s.cssRules].map((x) => x.cssText).join(""); } catch { return ""; } }).join("")),
    }));
    note(`print${r}`, v);
    await page.pdf({ path: `${OUT}/n3-print${r.replace(/\//g, "_")}.pdf`, format: "A4" }).catch((e) => note("pdfErr", String(e).slice(0, 120)));
    await page.emulateMedia({ media: "screen" });
  }
  await ctx.close();
}

// ---- 6. forced colors + reduced motion + landscape phone
if (want("modes")) {
  for (const mode of ["forced", "reduced", "landscape"]) {
    const ctx = await browser.newContext({
      viewport: mode === "landscape" ? { width: 844, height: 390 } : { width: 1440, height: 900 },
      forcedColors: mode === "forced" ? "active" : "none",
      reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
      colorScheme: "dark",
    });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${OUT}/n3-mode-${mode}-top.png` });
    const v = await page.evaluate(() => {
      const el = [...document.querySelectorAll("a[href]")].find((a) => a.getBoundingClientRect().width);
      el?.focus();
      const cs = el ? getComputedStyle(el) : null;
      return {
        htmlColorScheme: getComputedStyle(document.documentElement).colorScheme,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        firstLinkRing: cs ? `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}` : null,
        motionAttr: document.documentElement.getAttribute("data-motion-off"),
        over: document.documentElement.scrollWidth - window.innerWidth,
      };
    });
    note(`mode.${mode}`, v);
    if (mode === "landscape") {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2400);
      await page.screenshot({ path: `${OUT}/n3-mode-landscape-gate.png` });
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      note("mode.landscape.gateOverflow", over);
    }
    await ctx.close();
  }
}

writeFileSync(`${OUT}/fresh-notes.json`, JSON.stringify(notes, null, 1));
await browser.close();
console.log("\n--- done ---");
