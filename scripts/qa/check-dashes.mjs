/**
 * G1 · No em dash, en dash or spaced hyphen in the VISIBLE text of any page.
 *
 * WHY THIS EXISTS. The owner's clarity ruling (PLAN.md § G) is a typographic
 * one: the run reached for a dash whenever a sentence needed a joint, 113 times
 * on the home page alone. A dash is a pause the reader has to price, and at
 * that density it stops being punctuation and becomes texture.
 *
 * WHY IT RENDERS THE PAGE instead of grepping the file. Half of this page's
 * text does not exist in the file. `#pathFig`, `#appliedFig`, `#jetFig`,
 * `#questFig` and `#amlFig` are built by script at scroll time, their labels
 * composed from arrays in the run's own JS, and the same is true of the
 * masthead phase readout and the network figure. A grep over `src/run/index.html`
 * sees the array literals but not the strings the reader gets, and a grep over
 * `out/index.html` sees exactly the same thing, because the builder copies the
 * file. So the check has to be a browser, scrolled far enough to make every
 * builder run.
 *
 * WHAT IS ALLOWED, AND WHY EACH ONE.
 *   · quotations — `blockquote`, `.endquote`, `.borrowed`, `.hero-poem`, and
 *     `[data-quote]` as an explicit opt-out. Eliot, Machado and Feynman are
 *     quoted verbatim or not at all; re-punctuating a quotation is a worse
 *     defect than the dash.
 *   · machine text — `code`, `pre`, `kbd`, `samp`. A dash inside a command or
 *     a flag is a character, not punctuation.
 *   · `#corrections` on the case files — the dated register. The owner forbids
 *     editing filed history; a correction is amended in public, never rewritten.
 *     New errata must be dash-free, which is a copy rule, not a gate rule.
 *
 * `/evidence` has no id'd register section of its own (render-evidence.mjs
 * emits no `<section id=…>` at all), so nothing is allowlisted there. If a
 * dated register is added to it later, give it `#corrections` or `[data-quote]`
 * rather than widening this list.
 *
 *   node scripts/qa/check-dashes.mjs                 out/, every page
 *   node scripts/qa/check-dashes.mjs --root <dir>    a throwaway copy
 *   node scripts/qa/check-dashes.mjs --only /        one page
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { join, extname, resolve, relative, sep } from "node:path";

const argv = process.argv.slice(2);
const argOf = (name) => {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : null;
};
const OUT = resolve(process.cwd(), argOf("--root") ?? "out");
const ONLY = argv.filter((a, i) => argv[i - 1] === "--only");

/* The two widths that build DIFFERENT text. The figures ship a wide edition
   and a tight (phone) edition, composed by separate branches of the same
   builder — `buildApplied(tight)` — so a label that only exists on the phone
   is only ever seen at 390. */
const WIDTHS = [
  { label: "1440", width: 1440, height: 900, mobile: false },
  { label: "390", width: 390, height: 844, mobile: true },
];

const ALLOW = [
  "blockquote",
  ".endquote",
  ".borrowed",
  ".hero-poem",
  "code",
  "pre",
  "kbd",
  "samp",
  "[data-quote]",
  "#corrections",
].join(",");

const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

async function serve() {
  const server = createServer(async (req, res) => {
    try {
      let p = join(OUT, decodeURIComponent(req.url.split("?")[0]));
      const s = await stat(p).catch(() => null);
      if (s?.isDirectory()) p = join(p, "index.html");
      const body = await readFile(p);
      res.writeHead(200, {
        "Content-Type": TYPES[extname(p)] ?? "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  await new Promise((r) => server.listen(0, r));
  return { server, port: server.address().port };
}

/** out/projects/policybot/index.html → /projects/policybot/ */
function pagePaths(root) {
  const found = [];
  (function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) found.push(p);
    }
  })(root);
  return found
    .map((p) => {
      const rel = relative(root, p).split(sep).join("/");
      if (rel === "index.html") return "/";
      if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"index.html".length);
      return "/" + rel;
    })
    .sort();
}

/* Runs in the page. Every text node that a reader can actually see: it has at
   least one painted rect, and nothing above it is display:none or
   visibility:hidden. Opacity is NOT used to exclude — the run fades prose in
   and out on scroll, so a paragraph at opacity 0 at this instant is still the
   page's text, and excluding it would make the gate's result depend on where
   the scroll happened to stop. */
const COLLECT = (allow) => {
  const DASH = /[\u2014\u2013]|[ \u00a0\u2009\u202f]-[ \u00a0\u2009\u202f]/g;
  const sel = (el) => {
    const parts = [];
    let n = el;
    while (n && n.nodeType === 1 && parts.length < 5) {
      let p = n.tagName.toLowerCase();
      if (n.id) {
        parts.unshift("#" + n.id);
        break;
      }
      if (n.classList.length) p += "." + [...n.classList].join(".");
      parts.unshift(p);
      n = n.parentElement;
    }
    return parts.join(">");
  };
  const hits = [];
  let scanned = 0;
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = tw.nextNode())) {
    const txt = node.nodeValue.replace(/\s+/g, " ").trim();
    if (!txt) continue;
    const el = node.parentElement;
    if (!el) continue;
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style" || tag === "title") continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    if (![...range.getClientRects()].some((r) => r.width > 0 && r.height > 0))
      continue;
    let hidden = false;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") {
        hidden = true;
        break;
      }
    }
    if (hidden) continue;
    scanned++;
    const found = txt.match(DASH);
    if (!found) continue;
    if (el.closest(allow)) continue;
    hits.push({ sel: sel(el), text: txt.slice(0, 120), n: found.length });
  }
  return { hits, scanned };
};

const { server, port } = await serve();
const pages = pagePaths(OUT).filter((p) => !ONLY.length || ONLY.includes(p));
const report = new Map(); // page -> Map(key -> hit)
let scannedTotal = 0;
let browser;

try {
  const { chromium } = await import("@playwright/test");
  browser = await chromium.launch();

  for (const path of pages) {
    const seen = new Map();
    for (const v of WIDTHS) {
      const ctx = await browser.newContext({
        viewport: { width: v.width, height: v.height },
        isMobile: v.mobile,
        hasTouch: v.mobile,
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      await page.goto(`http://127.0.0.1:${port}${path}`, {
        waitUntil: "load",
        timeout: 60000,
      });
      await page.evaluate(() => document.fonts.ready);
      /* The nameplate performs for ~3s on home and the figure builders are
         wired to IntersectionObserver, so the page is scrolled end to end
         before anything is read off it. */
      await page.waitForTimeout(2500);
      const doc = await page.evaluate(
        () => document.documentElement.scrollHeight
      );
      const step = Math.max(200, Math.round(v.height * 0.6));
      for (let y = 0; y <= doc; y += step) {
        await page.evaluate(
          (yy) => window.scrollTo({ top: yy, behavior: "instant" }),
          y
        );
        await page.waitForTimeout(140);
        const { hits, scanned } = await page.evaluate(COLLECT, ALLOW);
        scannedTotal += scanned;
        for (const h of hits) {
          const key = `${h.sel}|${h.text}`;
          if (!seen.has(key)) seen.set(key, { ...h, width: v.label });
        }
      }
      await ctx.close();
    }
    if (seen.size) report.set(path, seen);
  }
} finally {
  await browser?.close();
  server.close();
}

/* A gate that scanned nothing prints the same green line as a gate that
   scanned everything. Both floors are deliberately far below the real
   numbers (10 pages, ~3,400 visible text nodes at the time of writing) —
   they are there to catch a broken serve or a selector that stopped
   matching, not to track the page's size. */
if (pages.length < (ONLY.length || 8)) {
  console.error(
    `check-dashes FAILED — only ${pages.length} page(s) under ${OUT}. That is a broken root, not a clean site.`
  );
  process.exit(1);
}
if (scannedTotal < 200) {
  console.error(
    `check-dashes FAILED — only ${scannedTotal} visible text node(s) scanned across ${pages.length} pages. The traversal is broken.`
  );
  process.exit(1);
}

if (report.size) {
  const total = [...report.values()].reduce((s, m) => s + m.size, 0);
  console.error(
    `\ncheck-dashes FAILED — ${total} dash${total === 1 ? "" : "es"} in visible text across ${report.size} page(s):\n`
  );
  for (const [path, seen] of report) {
    console.error(`  ${path}`);
    for (const h of seen.values()) {
      console.error(`    ✗ ${h.sel}  [@${h.width}]`);
      console.error(`        ${h.text}`);
    }
  }
  console.error(
    "\n  — and – are the clarity ruling's; \" - \" reads as one too. Rewrite the\n" +
      "  sentence: a colon, a full stop, or two sentences. Quotations, code and the\n" +
      "  dated corrections register are already exempt by selector; widen the copy,\n" +
      "  not the allowlist."
  );
  process.exit(1);
}

console.log(
  `check-dashes: no em dash, en dash or spaced hyphen in visible text — ` +
    `${pages.length} pages × ${WIDTHS.map((v) => v.label).join("/")}, ${scannedTotal} text nodes read`
);
