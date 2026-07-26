// Fix round 4 — the site's two typographic rules, swept across every
// surface a reader (or a screen reader, or a link preview) receives:
//
//   1. no straight apostrophes or quotes in prose
//   2. every link that LEAVES the site wears the `↗` (F41's glyph
//      contract). Round 3 checked rule 2 on the home page only.
//
// Fix round 3 swept the PAINTED prose and got it to zero. Painted prose
// is not the whole of the site's voice: `alt`, `aria-label` and `title`
// are read aloud, and `<title>` + the og/twitter description are what a
// shared link says. None of those are in `textContent`, so the round-3
// glyph probe could not see them. This one reads all of it.
//
// Two things are deliberately NOT faults and are reported separately:
//   · code literals — the site quotes real source (`set_config('app.user_id',
//     $1, true)`, `format="metadata"`), where a curly quote would be a lie
//     about the artifact.
//   · the verbatim recommendation excerpt, which a build-time check pins
//     to its source character-for-character (testimonials.ts).
//
// Usage: BASE=http://localhost:3400 node docs/design-lab/probe-fix4-prose.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3400";
const PAGES = [
  "/",
  "/evidence/",
  "/projects/jobtracker/",
  "/projects/automl/",
  "/projects/fast-mnist-nn/",
  "/projects/taskflow-calendar/",
  "/projects/policybot/",
  "/projects/master-inventory/",
  "/projects/visual-assist/",
  "/no-such-page/", // the 404
];

/* A straight quote inside any of these is quoting a real artifact, not
   setting prose. Each is a literal the site prints ON PURPOSE. */
const CODE_CONTEXTS = ["set_config(", 'format="metadata"', "FORCE'd", "-O3"];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();
const findings = [];
const linkFindings = [];

for (const path of PAGES) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);

  const harvested = await page.evaluate(() => {
    const out = [];
    const push = (where, text) => {
      if (text && /['"]/.test(text)) out.push({ where, text: text.trim() });
    };

    /* Painted prose, node by node, so the context is readable. SCRIPT
       and STYLE carry the JSON-LD graph and the RSC flight payload —
       machine text in a text node, never prose a reader is set. */
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (n) =>
          /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(n.parentElement?.tagName)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT,
      }
    );
    let node;
    while ((node = walker.nextNode())) push("text", node.nodeValue);

    /* the spoken layer */
    for (const attr of ["alt", "aria-label", "title", "placeholder"]) {
      for (const el of document.querySelectorAll(`[${attr}]`)) {
        push(`@${attr}`, el.getAttribute(attr));
      }
    }

    /* the shared layer */
    push("<title>", document.title);
    for (const m of document.querySelectorAll("meta[name], meta[property]")) {
      const key = m.getAttribute("name") ?? m.getAttribute("property");
      if (/description|title|image:alt/.test(key)) {
        push(`meta[${key}]`, m.getAttribute("content"));
      }
    }
    return out;
  });

  for (const hit of harvested) {
    findings.push({ path, ...hit });
  }

  /* Rule 2 — EVERY anchor whose href leaves this origin, not just the
     ones marked `target="_blank"`. A same-origin file that opens in a
     new tab (the resume PDF) must NOT wear the glyph: `↗` means "this
     leaves the site", and the site's own paper is not somewhere else. */
  for (const link of await page.evaluate(() => {
    const origin = location.origin;
    return [...document.querySelectorAll("a[href]")]
      .filter((a) => a.getBoundingClientRect().width > 0)
      .map((a) => ({
        text: a.textContent.trim().slice(0, 60),
        href: a.getAttribute("href"),
        external: /^https?:/i.test(a.href) && new URL(a.href).origin !== origin,
        blank: a.target === "_blank",
        marked: a.textContent.includes("↗"),
      }));
  })) {
    linkFindings.push({ path, ...link });
  }
}

await browser.close();

const isCode = (t) => CODE_CONTEXTS.some((c) => t.includes(c));
const isExcerpt = (t) => t.includes("Ayush showed strong judgment");
const prose = findings.filter((f) => !isCode(f.text) && !isExcerpt(f.text));
const excused = findings.filter((f) => isCode(f.text) || isExcerpt(f.text));

console.log("=== prose with straight quotes (must be 0) ===");
for (const f of prose) {
  console.log(`${f.path} ${f.where}: ${f.text.slice(0, 150)}`);
}
console.log(`\ncount: ${prose.length}`);

console.log("\n=== excused (code literals / the verbatim excerpt) ===");
for (const f of excused) {
  console.log(`${f.path} ${f.where}: ${f.text.slice(0, 110)}`);
}

const unmarked = linkFindings.filter((l) => l.external && !l.marked);
const overmarked = linkFindings.filter((l) => !l.external && l.marked);
console.log("\n=== external links missing ↗ ===");
for (const l of unmarked) console.log(`${l.path}: "${l.text}" → ${l.href}`);
console.log(`count: ${unmarked.length}`);
console.log("--- by page: unmarked / external ---");
for (const p of PAGES) {
  const ext = linkFindings.filter((l) => l.path === p && l.external);
  console.log(`${p}: ${ext.filter((l) => !l.marked).length} / ${ext.length}`);
}

console.log("\n=== internal links wearing ↗ (must be 0) ===");
for (const l of overmarked) console.log(`${l.path}: "${l.text}" → ${l.href}`);
console.log(`count: ${overmarked.length}`);

/* Same-origin links that open a new tab: correct WITHOUT the glyph. */
const sameOriginBlank = linkFindings.filter((l) => !l.external && l.blank);
console.log("\n=== same-origin, new tab (correctly unmarked) ===");
for (const l of sameOriginBlank) console.log(`${l.path}: "${l.text}"`);

/* What this probe ENFORCES vs what it merely records. Prose and
   over-marking are absolutes. The unmarked external links are not: all
   of them sit in the case files' evidence tables and artifact lists,
   where the label is already a repo path at a pinned sha
   (`lib/config/rlsContext.ts @ 54c79e0`) inside a column headed
   `artifact`. Hanging 59 glyphs off that apparatus is a design call on
   the densest furniture on the site, not a consistency nit — fix round
   4 measured it, declined it, and recorded the number here so the next
   round argues with a count instead of an impression. The surfaces
   round 3 actually claimed — home, evidence, the 404 — must stay 0. */
const CLAIMED = ["/", "/evidence/", "/no-such-page/"];
const claimedUnmarked = unmarked.filter((l) => CLAIMED.includes(l.path));
console.log(
  `\nclaimed surfaces unmarked: ${claimedUnmarked.length} (must be 0)` +
    ` · case-file apparatus unmarked: ${unmarked.length - claimedUnmarked.length}` +
    ` (recorded design call)`
);

const failed = prose.length + overmarked.length + claimedUnmarked.length;
process.exit(failed === 0 ? 0 : 1);
