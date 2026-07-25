/**
 * CERTIFICATION-RESPONSE probe — the measurements behind this round.
 *
 * Answers, against the live static export (`NEXT_PUBLIC_BASE_PATH= next
 * build --webpack` → `out/` on :3200):
 *
 *   D7 · the tap-target census — every interactive box, sitewide, at 390
 *        and 1440, with the header cluster called out by name.
 *   N4 · the quiet motion toggle's measured box at 320…1440 (it read
 *        0×0 below `sm`, so a phone reader could not reach it).
 *   masthead fit · document vs viewport width at every supported step,
 *        320→1440, plus the wordmark's own box (it must never ellipsize).
 *   F63 · the Red Thread's x across a 1024→1440 sweep, 1px around the
 *        snap, so the status table can name the width it happens at.
 *   F42 · the em-dash census by PARAGRAPH KIND — the w4 row counted
 *        paragraphs but never said which register the offenders sit in.
 *
 * Usage:
 *   PORT=3200 node tests/playwright/static-server.mjs &
 *   node docs/design-lab/probe-certresp.mjs [--tag before|after]
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE = process.env.CERT_BASE || "http://localhost:3200";
const tagIndex = process.argv.indexOf("--tag");
const TAG = tagIndex > -1 ? process.argv[tagIndex + 1] : "after";
const OUT = path.join(process.cwd(), "docs/design-lab/shots-certresp");
fs.mkdirSync(OUT, { recursive: true });

const R = {};
const settle = (page, ms) => page.waitForTimeout(ms);

/** Every interactive box on the page, measured. */
const censusFn = () => {
  const rows = [];
  document
    .querySelectorAll("a,button,input,select,summary,[role=button]")
    .forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      rows.push({
        t: (n.innerText || n.getAttribute("aria-label") || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 34),
        w: Math.round(r.width),
        h: Math.round(r.height),
        header: !!n.closest("header"),
      });
    });
  return rows;
};

const browser = await chromium.launch();

/* ── 1. the sitewide census, 390 + 1440 ───────────────────────── */
for (const [w, h, tag] of [
  [390, 844, "mob"],
  [1440, 900, "desk"],
]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    ...(w < 500
      ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
      : {}),
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 2200);

  const rows = await page.evaluate(censusFn);
  /* "Skip to main content" is a 1×1 sr-only anchor that becomes a real
     box on focus — it is measured focused, not at rest. */
  const painted = rows.filter((row) => !(row.w <= 1 && row.h <= 1));
  R[`census_${tag}`] = {
    total: painted.length,
    under44: painted.filter((row) => row.h < 44 || row.w < 44).length,
    under30h_or_24w: painted.filter((row) => row.h < 30 || row.w < 24).length,
    header: painted.filter((row) => row.header),
  };

  await page.screenshot({ path: path.join(OUT, `${TAG}-${tag}-header.png`) });
  await ctx.close();
}

/* ── 2. the masthead across every supported width ─────────────── */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  const fit = [];
  for (const w of [
    320, 340, 360, 375, 390, 414, 430, 480, 640, 768, 1024, 1280, 1440,
  ]) {
    await page.setViewportSize({ width: w, height: 844 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    /* The wordmark is set in a webfont: measured before it lands, the
       masthead reads a fallback's metrics and the row height lies. */
    await page.evaluate(() => document.fonts.ready);
    await settle(page, 1200);
    fit.push(
      await page.evaluate((width) => {
        const header = document.querySelector("header");
        const nav = header?.querySelector("nav");
        const wordmark = [...(nav?.querySelectorAll("a") ?? [])].find(
          (a) => a.textContent?.trim() === "ayush yadav"
        );
        const motion = [...(header?.querySelectorAll("button") ?? [])].find(
          (b) => /motion/.test(b.textContent || "")
        );
        const motionNote = [...(header?.querySelectorAll("span") ?? [])].find(
          (s) => /motion/.test(s.textContent || "")
        );
        const control = motion || motionNote;
        const box = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height) };
        };
        /* N4: the SAME control in its other seat. The two must be
           exactly complementary — one visible box at every width. */
        const colophon = [
          ...document.querySelectorAll(
            "footer.site-footer button, footer.site-footer span"
          ),
        ].find((n) => /motion/.test(n.textContent || ""));
        const colophonBox = colophon?.getBoundingClientRect();
        /* The pre-existing sub-360 overflow: name the widest element
           that crosses the viewport's right edge, so it is on record
           whether the masthead is the cause. */
        const overflow = [];
        if (document.documentElement.scrollWidth > window.innerWidth) {
          for (const el of document.querySelectorAll("body *")) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.right <= window.innerWidth + 0.5) continue;
            if (el.querySelector("*")) continue; /* deepest node only */
            overflow.push({
              tag: el.tagName.toLowerCase(),
              cls: el.className.toString().slice(0, 40),
              right: Math.round(r.right),
            });
          }
        }
        const cs = wordmark ? getComputedStyle(wordmark) : null;
        return {
          width,
          docW: document.documentElement.scrollWidth,
          winW: window.innerWidth,
          overflow: overflow.slice(0, 4),
          colophonMotion: colophonBox
            ? {
                w: Math.round(colophonBox.width),
                h: Math.round(colophonBox.height),
                visible: colophonBox.width > 0,
              }
            : null,
          navScrollW: nav?.scrollWidth ?? null,
          navClientW: nav?.clientWidth ?? null,
          headerH: Math.round(header?.getBoundingClientRect().height ?? 0),
          wordmark: box(wordmark),
          wordmarkClipped: wordmark
            ? wordmark.scrollWidth > wordmark.clientWidth + 1
            : null,
          wordmarkEllipsis: cs ? cs.textOverflow : null,
          motion: box(control),
          motionTag: control ? control.tagName.toLowerCase() : null,
        };
      }, w)
    );
  }
  R.mastheadFit = fit;
  await ctx.close();
}

/* ── 3. F63 — the Red Thread's spine x across the snap ────────────
   Same reading probe-w4eng.mjs took (the `.thread-past` path's own
   start x, static world), swept wide enough to catch a snap the 1280
   band never looked at, then bisected to the exact pixel. */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await ctx.addInitScript(() => localStorage.setItem("motion-off", "1"));
  const page = await ctx.newPage();

  const spineAt = async (width) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await settle(page, 800);
    return page.evaluate(() => {
      const out = {};
      for (const seg of document.querySelectorAll(".thread-segment")) {
        const chapter = seg.closest("[data-chapter]")?.dataset.chapter;
        const d = seg.querySelector(".thread-past")?.getAttribute("d");
        if (!d || !chapter) continue;
        const m = d.match(/^M\s*([\d.-]+)[ ,]+([\d.-]+)/);
        out[chapter] = m ? Math.round(parseFloat(m[1]) * 10) / 10 : null;
      }
      return out;
    });
  };

  const sweep = [];
  for (let w = 1024; w <= 1440; w += 16) {
    sweep.push({ width: w, spine: await spineAt(w) });
  }
  R.threadSweep = sweep;

  /* Bisect every step where chapter 03's spine RELOCATES. The spine
     tracks the viewport 1:1 below xl (startX = winW − 26), so a 16px
     step legitimately moves it 16px; only a ≥100px step is a jump
     rather than tracking. */
  const RELOCATION = 100;
  const jumps = [];
  for (let i = 1; i < sweep.length; i += 1) {
    const lo = sweep[i - 1];
    const hi = sweep[i];
    const a = lo.spine["03"];
    const b = hi.spine["03"];
    if (a == null || b == null || Math.abs(b - a) < RELOCATION) continue;
    let loW = lo.width;
    let hiW = hi.width;
    let loX = a;
    let hiX = b;
    while (hiW - loW > 1) {
      const mid = Math.round((loW + hiW) / 2);
      const midX = (await spineAt(mid))["03"];
      if (Math.abs(midX - loX) < RELOCATION) {
        loW = mid;
        loX = midX;
      } else {
        hiW = mid;
        hiX = midX;
      }
    }
    jumps.push({
      lastGoodWidth: loW,
      snapWidth: hiW,
      from: loX,
      to: hiX,
      dx: hiX - loX,
    });
  }
  R.threadJumps = jumps;
  await ctx.close();
}

/* ── 4. F42 — the em-dash census, by register ─────────────────── */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 2200);
  /* probe-w4copy.mjs's exact node set (`p, li, figcaption`, innerText),
     so the totals are comparable to the w4 row — plus the one thing that
     row never recorded: which REGISTER each offender is set in. */
  R.emdash = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll("p, li, figcaption")];
    const rows = [];
    for (const n of nodes) {
      const text = n.innerText ?? "";
      if (!text) continue;
      const count = (text.match(/—/g) ?? []).length;
      const cs = getComputedStyle(n);
      const mono = /mono/i.test(cs.fontFamily);
      const serif = !mono && /Newsreader|serif/i.test(cs.fontFamily);
      rows.push({
        count,
        kind: mono ? "apparatus (mono)" : serif ? "prose (serif)" : "other",
        text: text.replace(/\s+/g, " ").trim().slice(0, 96),
      });
    }
    const over = rows.filter((r) => r.count > 1);
    return {
      paragraphsTotal: rows.length,
      paragraphsWithMultipleDashes: over.length,
      overByKind: over.reduce((acc, r) => {
        acc[r.kind] = (acc[r.kind] || 0) + 1;
        return acc;
      }, {}),
      overSample: over.map((r) => ({
        kind: r.kind,
        count: r.count,
        text: r.text,
      })),
    };
  });
  await ctx.close();
}

/* ── 5. the surfaces this round rewrote, shot ──────────────────── */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();

  /* N3 — the disclosure aside, on a case file that carries one. Its
     "before" is the certifier's own docs/design-lab/shots-cert/
     case-policybot.png, taken against the same route. */
  await page.goto(`${BASE}/projects/policybot/`, { waitUntil: "networkidle" });
  await settle(page, 1500);
  R.disclosureAside = await page.evaluate(() => {
    const aside = [...document.querySelectorAll("aside")].find((n) =>
      /private-safe/i.test(n.textContent || "")
    );
    if (!aside) return null;
    const cs = getComputedStyle(aside);
    return {
      borderStyle: cs.borderTopStyle,
      borderWidths: [
        cs.borderTopWidth,
        cs.borderRightWidth,
        cs.borderBottomWidth,
        cs.borderLeftWidth,
      ],
      fontSize: cs.fontSize,
      padding: cs.padding,
    };
  });
  await page.screenshot({ path: path.join(OUT, `${TAG}-case-policybot.png`) });

  /* D1 — the ledger's rule sentence, with its exemption. */
  await page.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
  await settle(page, 1200);
  R.ledgerRule = await page.evaluate(() =>
    (document.querySelector("header p")?.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
  );
  await page.screenshot({ path: path.join(OUT, `${TAG}-evidence-top.png`) });

  /* D6 — the heading over the demoted index. */
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 2000);
  R.demotedIndexHeading = await page.evaluate(() => {
    const list = [...document.querySelectorAll("#work p")].find((p) =>
      /argued in full|also on file/.test(p.textContent || "")
    );
    return list ? list.textContent.trim() : null;
  });
  await ctx.close();

  /* N4 — the colophon seat, shot at a phone width. */
  const mob = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const mobPage = await mob.newPage();
  await mobPage.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
  await settle(mobPage, 1200);
  await mobPage
    .locator("footer.site-footer")
    .screenshot({ path: path.join(OUT, `${TAG}-mob-colophon.png`) });
  await mob.close();
}

await browser.close();
fs.writeFileSync(
  path.join(OUT, `certresp-${TAG}.json`),
  `${JSON.stringify(R, null, 2)}\n`
);
console.log(
  `probe-certresp (${TAG}) →`,
  path.join(OUT, `certresp-${TAG}.json`)
);
console.log(
  "census mob:",
  R.census_mob?.total,
  "under44:",
  R.census_mob?.under44,
  "| header boxes:",
  JSON.stringify(R.census_mob?.header)
);
console.log("thread jumps:", JSON.stringify(R.threadJumps));
console.log(
  "em-dash:",
  R.emdash?.paragraphsWithMultipleDashes,
  "of",
  R.emdash?.paragraphsTotal,
  JSON.stringify(R.emdash?.overByKind)
);
