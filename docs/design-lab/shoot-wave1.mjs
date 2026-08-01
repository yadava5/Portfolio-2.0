/**
 * Wave-1 fault-fix evidence shoot (CRITIC-LEDGER F01/F05/F02/F06/F62/F61/F03).
 *
 * Usage:
 *   PORT=3200 node tests/playwright/static-server.mjs &
 *   node docs/design-lab/shoot-wave1.mjs <tag>        # tag = "before" | "after"
 *
 * Writes PNGs + a probe JSON into docs/design-lab/shots-wave1/.
 * Every measurement is read from the LIVE static export — no assumptions.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const TAG = process.argv[2] ?? "before";
const BASE = process.env.BASE ?? "http://127.0.0.1:3200";
const OUT = resolve("docs/design-lab/shots-wave1");
mkdirSync(OUT, { recursive: true });

const DESK = { width: 1440, height: 900 };

/** Wait until scrollY holds still for 500ms (or 2.5s of no movement). */
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

/** Opacity + on-screen box of the gate's contact affordances. */
const readGate = () => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      opacity: Number(getComputedStyle(el).opacity),
      top: Math.round(r.top),
      onScreen: r.top < window.innerHeight && r.bottom > 0,
    };
  };
  return {
    scrollY: Math.round(window.scrollY),
    mailto: pick('#gate a[href^="mailto:"]'),
    resume: pick('#gate a[href*="resume"]'),
    github: pick('#gate a[href*="github.com"]'),
    cta: pick('#gate a[href^="mailto:"].font-display'),
    name: pick('#gate h2[data-tm="name"]'),
    availability: pick('#gate [data-tm="block"]'),
  };
};

const run = async () => {
  const browser = await chromium.launch();
  const report = { tag: TAG, base: BASE, at: new Date().toISOString() };

  /* ── F01 — nav "contact" landing ───────────────────────────────── */
  {
    const ctx = await browser.newContext({ viewport: DESK });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    await page.locator("header").getByRole("link", { name: "contact" }).click();
    await settle(page);
    await page.waitForTimeout(1800);
    report.navContact = await page.evaluate(readGate);
    await page.screenshot({ path: `${OUT}/f01-nav-contact-${TAG}.png` });

    /* history trail (F05) */
    const trail = { afterContact: page.url() };
    await page.goBack().catch(() => {});
    await page.waitForTimeout(1200);
    trail.afterBack = page.url();
    trail.afterBackScrollY = await page.evaluate(() => Math.round(scrollY));
    await ctx.close();
    report.navTrail = trail;
  }

  /* ── F01b — deep link /#gate ───────────────────────────────────── */
  {
    const ctx = await browser.newContext({ viewport: DESK });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/#gate`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2600);
    report.deepGate = await page.evaluate(readGate);
    await page.screenshot({ path: `${OUT}/f01-deeplink-gate-${TAG}.png` });
    await ctx.close();
  }

  /* ── F01c — every chapter, landed on three ways ─────────────────
     A reveal that never fires reads as blank paper, so the census is
     "what is on screen and still faded?" — measured as EFFECTIVE
     opacity (the product down the ancestor chain), because the reveal
     tweens animate the CONTAINER, not the link inside it. */
  const censusFn = () => {
    const h = window.innerHeight;
    const effective = (el) => {
      let o = 1;
      let node = el;
      while (node && node !== document.documentElement) {
        o *= Number(getComputedStyle(node).opacity);
        node = node.parentElement;
      }
      return o;
    };
    const hidden = [];
    for (const el of document.querySelectorAll(
      "[data-tm], [data-tm-bright], [data-tm-mantra], [data-tm-receipt]"
    )) {
      const r = el.getBoundingClientRect();
      if (r.top >= h || r.bottom <= 0 || r.width === 0) continue;
      const o = effective(el);
      /* 0.7 is the gate/values chapters' authored mute (opacity-70) */
      if (o < 0.69) {
        hidden.push({
          tm: el.getAttribute("data-tm") ?? el.tagName.toLowerCase(),
          text: (el.textContent ?? "").trim().slice(0, 44),
          opacity: Number(o.toFixed(2)),
          top: Math.round(r.top),
        });
      }
    }
    return { scrollY: Math.round(scrollY), hidden };
  };

  {
    const anchors = ["who", "path", "automl", "work", "values", "gate"];
    const deepLink = {};
    for (const anchor of anchors) {
      const ctx = await browser.newContext({ viewport: DESK });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/#${anchor}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(2800);
      deepLink[anchor] = await page.evaluate(censusFn);
      await ctx.close();
    }
    report.deepLinkLandings = deepLink;

    /* Hash landings from a page already loaded at the top (same-document
       navigation — no reload), then a Back to each. */
    const ctx = await browser.newContext({ viewport: DESK });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    const hashLanding = {};
    for (const anchor of anchors) {
      await page.evaluate((a) => {
        window.location.hash = a;
      }, anchor);
      await settle(page);
      await page.waitForTimeout(1900);
      hashLanding[anchor] = await page.evaluate(censusFn);
    }
    report.hashLandings = hashLanding;
    await ctx.close();
  }

  /* ── F01d — nav click, then scroll BACK UP through the paper ───── */
  {
    const ctx = await browser.newContext({ viewport: DESK });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    await page.locator("header").getByRole("link", { name: "contact" }).click();
    await settle(page);
    await page.waitForTimeout(1800);
    const back = [];
    for (const anchor of ["values", "work", "automl", "path", "who"]) {
      await page.evaluate((a) => {
        const el = document.querySelector(`#${a}`);
        window.scrollTo({
          top: window.scrollY + el.getBoundingClientRect().top - 96,
          behavior: "instant",
        });
      }, anchor);
      await page.waitForTimeout(900);
      back.push({ anchor, ...(await page.evaluate(censusFn)) });
    }
    report.scrollBackUp = back;
    await ctx.close();
  }

  /* ── F02 — the hero masthead's first frame ─────────────────────── */
  {
    const ctx = await browser.newContext({ viewport: DESK });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1800);
    report.hero = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const stand = document.querySelector("[data-hero-standfirst]");
      const box = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          text: (el.textContent ?? "").trim().slice(0, 80),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          fontSize: cs.fontSize,
          fontFamily: cs.fontFamily.split(",")[0],
          color: cs.color,
          opacity: Number(cs.opacity),
        };
      };
      return { h1: box(h1), standfirst: box(stand) };
    });
    await page.screenshot({ path: `${OUT}/f02-hero-${TAG}.png` });
    await ctx.close();
  }

  /* ── F06 — the ¶02 manifesto at rest ───────────────────────────── */
  {
    const ctx = await browser.newContext({ viewport: DESK });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      const el = document.querySelector("#who");
      window.scrollTo({
        top: window.scrollY + el.getBoundingClientRect().top - 96,
        behavior: "instant",
      });
    });
    await page.waitForTimeout(2600);
    report.manifestoRest = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("#who [data-tm-words] *")) {
        if (el.children.length === 0) {
          out.push({
            word: (el.textContent ?? "").trim(),
            opacity: Number(Number(getComputedStyle(el).opacity).toFixed(2)),
          });
        }
      }
      return out;
    });
    await page.screenshot({ path: `${OUT}/f06-manifesto-rest-${TAG}.png` });
    await ctx.close();
  }

  /* ── F62 / F61 — the ¶05→¶06 seam + the chrome flip ────────────── */
  {
    const ctx = await browser.newContext({ viewport: DESK });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    report.seams = await page.evaluate(() => {
      const sections = {};
      for (const el of document.querySelectorAll("section[data-chapter]")) {
        const r = el.getBoundingClientRect();
        sections[el.id] = {
          top: Math.round(r.top + window.scrollY),
          bottom: Math.round(r.bottom + window.scrollY),
          height: Math.round(r.height),
        };
      }
      return { docHeight: document.documentElement.scrollHeight, sections };
    });
    const sweep = [];
    for (const frac of [0.68, 0.72, 0.745, 0.7775, 0.8, 0.83]) {
      await page.evaluate((f) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: Math.round(max * f), behavior: "instant" });
      }, frac);
      await page.waitForTimeout(700);
      sweep.push(
        await page.evaluate((f) => {
          const header = document.querySelector("header");
          const root = document.documentElement;
          return {
            frac: f,
            scrollY: Math.round(scrollY),
            chrome: root.dataset.arcChrome ?? null,
            phase: root.dataset.arcPhase ?? null,
            arcL: getComputedStyle(root).getPropertyValue("--arc-l").trim(),
            headerBg: getComputedStyle(header).backgroundColor,
            bodyBg: getComputedStyle(document.body).backgroundColor,
          };
        }, frac)
      );
      await page.screenshot({
        path: `${OUT}/f61-chrome-${String(frac).replace(".", "")}-${TAG}.png`,
      });
    }
    report.chromeSweep = sweep;
    await page.evaluate(() => {
      const el = document.querySelector("#values");
      window.scrollTo({
        top: window.scrollY + el.getBoundingClientRect().top - 700,
        behavior: "instant",
      });
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/f62-seam-${TAG}.png` });
    await ctx.close();
  }

  /* ── F03 — the ch04 pin, sampled across the hold ───────────────── */
  {
    const ctx = await browser.newContext({ viewport: DESK });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    const pin = await page.evaluate(() => {
      const el = document.querySelector("#automl");
      const r = el.getBoundingClientRect();
      return {
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
      };
    });
    const frames = [];
    for (let i = 0; i <= 8; i += 1) {
      const y = pin.top + Math.round((pin.height * i) / 8);
      await page.evaluate(
        (top) => window.scrollTo({ top, behavior: "instant" }),
        y
      );
      await page.waitForTimeout(450);
      frames.push(
        await page.evaluate(() => ({
          scrollY: Math.round(scrollY),
          lit: document.querySelectorAll("[data-pipeline-lit]").length,
          registry: Array.from(
            document.querySelectorAll("#automl figure li")
          ).map((li) => ({
            text: (li.textContent ?? "").trim().slice(0, 50),
            opacity: Number(
              Number(getComputedStyle(li).opacity).toFixed(2)
            ),
          })),
          phaseNote:
            document
              .querySelector("[data-pipeline-note]")
              ?.textContent?.trim() ?? null,
        }))
      );
      await page.screenshot({
        path: `${OUT}/f03-pin-${String(i).padStart(2, "0")}-${TAG}.png`,
      });
    }
    report.pin = { section: pin, frames };
    await ctx.close();
  }

  /* ── clock — prerendered gate time ─────────────────────────────── */
  {
    const html = await fetch(`${BASE}/`).then((r) => r.text());
    report.prerender = {
      hasEmDashClock: html.includes("—:—"),
      localTimeSnippet: html.match(/.{60}cincinnati, ohio.{200}/s)?.[0] ?? null,
    };
  }

  await browser.close();
  writeFileSync(
    `${OUT}/probe-${TAG}.json`,
    JSON.stringify(report, null, 2),
    "utf8"
  );
  console.log(JSON.stringify(report, null, 2).slice(0, 6000));
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
