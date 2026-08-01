// NITPICK — does the evidence index add up? Count the entries and the badges.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-nitpick";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.NITPICK_BASE ?? "https://yadava5.github.io/Portfolio-2.0";
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(BASE + "/evidence/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1000);

const audit = await page.evaluate(() => {
  const body = document.body.innerText;
  const glance = body.match(/at a glance[^\n]*(\n[^\n]*)?/)?.[0] ?? null;
  // entry ids
  const ids = [...body.matchAll(/\be-(\d{2})\b/g)].map((m) => m[0]);
  // visibility badges
  const badges = [...body.matchAll(/\[(public|private-safe|held[^\]]*|local[^\]]*)\]/g)].map((m) => m[1]);
  const tally = {};
  for (const b of badges) tally[b] = (tally[b] ?? 0) + 1;
  // the dot row
  const dotRow = [...document.querySelectorAll("*")]
    .filter((e) => {
      const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
      return /^[●○◐◑◒◓•—-]{5,}$/.test(own.replace(/\s/g, ""));
    })
    .map((e) => ({ text: e.innerText.trim(), aria: e.getAttribute("aria-label") }));
  // svg/element based dot row
  const dotEls = [...document.querySelectorAll('[class*="glance"],[data-glance],[aria-label*="glance"]')].map((e) => ({
    cls: (e.className.baseVal ?? e.className ?? "").toString().slice(0, 60),
    aria: e.getAttribute("aria-label"),
    children: e.children.length,
    text: e.innerText.replace(/\s+/g, " ").slice(0, 80),
  }));
  return {
    glance,
    uniqueIds: [...new Set(ids)],
    idCount: new Set(ids).size,
    badgeTally: tally,
    badgeTotal: badges.length,
    dotRow,
    dotEls,
  };
});
note("evidenceAudit", audit);

// count the actual entry blocks in the DOM
const blocks = await page.evaluate(() => {
  const rows = [...document.querySelectorAll("article, li, section")].filter((e) => /^e-\d\d/.test(e.innerText.trim()));
  return rows.map((e) => {
    const t = e.innerText.replace(/\s+/g, " ");
    return {
      id: t.slice(0, 5),
      title: t.slice(5, 60),
      badge: t.match(/\[(public|private-safe|held[^\]]*|local[^\]]*)\]/)?.[1] ?? null,
    };
  });
});
note("evidenceBlocks", blocks);
note("evidenceBlocks.count", blocks.length);
const tal = {};
for (const b of blocks) tal[b.badge ?? "none"] = (tal[b.badge ?? "none"] ?? 0) + 1;
note("evidenceBlocks.byBadge", tal);

await page.screenshot({ path: `${OUT}/evidence-glance-zoom.png`, clip: { x: 320, y: 560, width: 900, height: 160 } });

// ---- the 3.5x / 3.5× / 3.50x census, located ----
for (const [name, path] of [["home", "/"], ["evidence", "/evidence/"], ["glyph", "/projects/fast-mnist-nn/"]]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  const hits = await page.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const t = n.textContent;
      if (/3\.5\s*[x×]|3\.50\s*[x×]|\b1x\b|6\.5x/.test(t)) {
        const el = n.parentElement;
        out.push({
          text: t.trim().slice(0, 80),
          form: (t.match(/\d+\.?\d*\s*[x×]/g) ?? []).join(","),
          tag: el.tagName,
          fontSize: getComputedStyle(el).fontSize,
          top: Math.round(el.getBoundingClientRect().top + window.scrollY),
        });
      }
    }
    return out;
  });
  note(`speedupGlyphs.${name}`, hits);
}

// ---- project naming: Applied vs jobtracker vs JobTracker ----
for (const [name, path] of [["home", "/"], ["evidence", "/evidence/"], ["jobtracker", "/projects/jobtracker/"]]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const names = await page.evaluate(() => {
    const t = document.body.innerText;
    const count = (re) => (t.match(re) ?? []).length;
    return {
      Applied: count(/\bApplied\b/g),
      applied_lower: count(/\bapplied\b/g),
      jobtracker: count(/\bjobtracker\b/g),
      JobTracker: count(/\bJobTracker\b/g),
      Glyph: count(/\bGlyph\b/g),
      fast_mnist: count(/\bfast-mnist-nn\b/g),
      Cadence: count(/\bCadence\b/g),
      taskflow: count(/\btaskflow-calendar\b/g),
    };
  });
  note(`projectNaming.${name}`, names);
}

writeFileSync(`${OUT}/count-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
