// NITPICK ROUND 2 — the last sweep: the delight list, the honesty
// apparatus, the mobile affordance stack, and the odd bits the deep
// probe turned up (three copies of one poster, the lone peach focus ring).
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-nitpick2";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3600";
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};

const browser = await chromium.launch();

// ---------- 1. which control wears the peach focus ring ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("a[href],button,[tabindex]")) {
      if (!el.getBoundingClientRect().width) continue;
      el.focus();
      const cs = getComputedStyle(el);
      if (!/rgb\(38, 35, 28\)/.test(cs.outlineColor)) {
        // find the composited ground behind it
        let bg = "transparent",
          n = el;
        while (n && bg === "transparent") {
          const c = getComputedStyle(n).backgroundColor;
          if (c && c !== "rgba(0, 0, 0, 0)") bg = c;
          n = n.parentElement;
        }
        out.push({
          t: (el.innerText ?? "").trim().slice(0, 34),
          ring: cs.outlineColor,
          ground: bg,
          own: getComputedStyle(el).backgroundColor,
        });
      }
    }
    return out;
  });
  note("focusRing.nonDefault", r);
  await ctx.close();
}

// ---------- 2. the honesty apparatus — where the redaction lives ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const path of [
    "/",
    "/evidence/",
    "/projects/automl/",
    "/projects/master-inventory/",
    "/projects/policybot/",
  ]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const t = document.body.innerText;
      return {
        blocks: (t.match(/▓/g) ?? []).length,
        held: (t.match(/\bHELD\b/g) ?? []).length,
        refused: (t.match(/\brefused\b/g) ?? []).length,
        withheld: /withheld/i.test(t),
        glance: (t.match(/\d+ entries[\s\S]{0,140}/) ?? [])[0]?.replace(/\n/g, " ⏎ ") ?? null,
        dispositionKeyAboveRows: (() => {
          const key = [...document.querySelectorAll("*")].find(
            (e) =>
              /refused/.test(e.textContent) &&
              e.children.length === 0 &&
              e.textContent.length < 200,
          );
          return key ? key.textContent.trim().slice(0, 120) : null;
        })(),
      };
    });
    note(`honesty${path}`, r);
  }
  await ctx.close();
}

// ---------- 3. the mobile affordance stack in the work chapter ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  // hero escape hatch (S6)
  const hero = await page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll("a[href],button")) {
      const b = a.getBoundingClientRect();
      const abs = b.top + window.scrollY;
      if (abs < 1200 && b.width) {
        out.push({
          t: (a.innerText ?? "").trim().slice(0, 40),
          w: Math.round(b.width),
          h: Math.round(b.height),
          top: Math.round(abs),
        });
      }
    }
    return out;
  });
  note("mobile.heroAffordances@390", hero);

  // the demo / source / system-card stack in the work chapter
  const stack = await page.evaluate(async () => {
    const H = document.body.scrollHeight;
    for (let y = 0; y < H; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    await new Promise((r) => setTimeout(r, 500));
    const cand = [...document.querySelectorAll("a[href]")].filter((a) =>
      /the live demo|source ↗|system card|the case file/.test(a.innerText ?? ""),
    );
    return cand.map((a) => {
      const b = a.getBoundingClientRect();
      return {
        t: a.innerText.trim().slice(0, 30),
        w: Math.round(b.width),
        h: Math.round(b.height),
        top: Math.round(b.top + window.scrollY),
      };
    });
  });
  // vertical pitch between consecutive stacked affordances
  const sorted = [...stack].sort((a, b) => a.top - b.top);
  const pitches = [];
  for (let i = 1; i < sorted.length; i++) {
    const d = sorted[i].top - sorted[i - 1].top;
    if (d > 0 && d < 60) pitches.push({ from: sorted[i - 1].t, to: sorted[i].t, pitch: d });
  }
  note("mobile.workStack@390", { stack: sorted, pitches });
  await page.screenshot({ path: `${OUT}/mobile-390-full.png`, fullPage: true });
  await ctx.close();
}

// ---------- 4. three copies of one poster on /projects/automl ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/projects/automl/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const H = document.body.scrollHeight;
    for (let y = 0; y < H; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 70));
    }
  });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    return [...document.querySelectorAll("img")].map((i) => {
      const b = i.getBoundingClientRect();
      const cs = getComputedStyle(i);
      let hidden = false,
        n = i;
      while (n) {
        const c = getComputedStyle(n);
        if (c.display === "none" || c.visibility === "hidden") hidden = true;
        n = n.parentElement;
      }
      return {
        src: (i.currentSrc || i.src).split("/").pop(),
        alt: i.getAttribute("alt"),
        w: Math.round(b.width),
        h: Math.round(b.height),
        top: Math.round(b.top + window.scrollY),
        hidden,
        display: cs.display,
        inDialog: !!i.closest("[role='dialog']"),
        parentTag: i.parentElement?.tagName,
      };
    });
  });
  note("automl.images", r);
  await ctx.close();
}

// ---------- 5. delight list ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);

  // day-arc light — does the ground shift as chapters pass?
  const arc = [];
  for (const y of [0, 1600, 3200, 4800, 6400, 8000, 9400]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(900);
    arc.push(
      await page.evaluate(() => ({
        y: Math.round(window.scrollY),
        chapter: document.documentElement.dataset.chapter ?? document.body.dataset.chapter ?? null,
        bg: getComputedStyle(document.body).backgroundColor,
        canvas: getComputedStyle(document.documentElement)
          .getPropertyValue("--color-canvas")
          .trim(),
        dayVar: getComputedStyle(document.documentElement).getPropertyValue("--day-t").trim(),
      })),
    );
  }
  note("delight.dayArc", arc);

  // rail check-marks accumulate
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  const railStart = await page.evaluate(() => {
    const rail = [...document.querySelectorAll("nav")].find((n) =>
      /arrival/.test(n.textContent ?? ""),
    );
    return rail ? rail.innerText.replace(/\n+/g, " | ") : null;
  });
  await page.evaluate(() => window.scrollTo(0, 6000));
  await page.waitForTimeout(1400);
  const railMid = await page.evaluate(() => {
    const rail = [...document.querySelectorAll("nav")].find((n) =>
      /arrival/.test(n.textContent ?? ""),
    );
    return rail ? rail.innerText.replace(/\n+/g, " | ") : null;
  });
  note("delight.rail", { railStart, railMid });
  await page.screenshot({ path: `${OUT}/delight-rail-mid.png` });

  // the stamp — press to sign
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /awaiting|approval|sign/i.test(x.innerText ?? ""),
    );
    if (b) b.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/delight-stamp-before.png` });
  const pressed = await page.evaluate(async () => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /awaiting|approval|sign/i.test(x.innerText ?? ""),
    );
    if (!b) return null;
    b.click();
    await new Promise((r) => setTimeout(r, 2600));
    return {
      label: b.innerText.trim().slice(0, 60),
      pressed: b.getAttribute("aria-pressed"),
      disabled: b.disabled,
      helloVisible: [...document.querySelectorAll("*")].some(
        (e) => /say hello/i.test(e.textContent ?? "") && Number(getComputedStyle(e).opacity) > 0.5,
      ),
    };
  });
  note("delight.stamp", pressed);
  await page.screenshot({ path: `${OUT}/delight-stamp-after.png` });

  // colophon
  const colo = await page.evaluate(() => {
    const f = document.querySelector("footer");
    return f ? f.innerText.replace(/\n+/g, " | ").slice(0, 220) : null;
  });
  note("delight.colophon", colo);

  // back-button scroll restore
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 5200));
  await page.waitForTimeout(900);
  const beforeNav = await page.evaluate(() => Math.round(window.scrollY));
  await page.click("a[href='/projects/jobtracker/']").catch(async () => {
    await page.evaluate(() => {
      const a = document.querySelector("a[href*='jobtracker']");
      a?.click();
    });
  });
  await page.waitForTimeout(1600);
  const onCase = page.url();
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const afterBack = await page.evaluate(() => Math.round(window.scrollY));
  note("delight.backRestore", { beforeNav, onCase, afterBack, delta: afterBack - beforeNav });
  await ctx.close();
}

writeFileSync(`${OUT}/final-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
console.log("done");
