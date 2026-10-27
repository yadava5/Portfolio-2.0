/**
 * @fileoverview Every page ships the content security policy, seated where it
 * governs, and it allows exactly the inline scripts that page carries.
 *
 * WHY THIS IS NOT LEFT TO THE BROWSER SPEC. tests/playwright/csp.spec.ts proves
 * the policy breaks nothing and blocks what it should, but it runs in CI's
 * browser smoke, and the deploy runs verify:portfolio with --no-e2e. This is
 * the half that runs on the path to production.
 *
 * THE HASHES ARE RECOMPUTED HERE, NOT IMPORTED. Reading them through
 * scripts/archive/csp.mjs would make the gate agree with the builder by
 * construction, whatever the builder got wrong. A hash the page lacks means a
 * script the browser refuses; a hash with no script is an allowance nobody
 * needs. Both fail.
 *
 *   node scripts/qa/check-csp.mjs out                  what ships
 *   node scripts/qa/check-csp.mjs .build/gate-probe    a doctored copy
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join, relative } from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const SITE = resolve(root, process.argv[2] ?? "out");

const failures = [];
const fail = (msg) => failures.push(msg);

if (!existsSync(join(SITE, "index.html"))) {
  console.error(`check-csp: no index.html under ${relative(root, SITE) || "."}/ — did the build run?`);
  process.exit(1);
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

/* What a browser executes: a <script> with no src whose type is absent, a
   JavaScript MIME type or "module". JSON-LD and other data blocks never run. */
function runsInline(openTag) {
  if (/\bsrc\s*=/i.test(openTag)) return false;
  const type = /\btype\s*=\s*"([^"]*)"/i.exec(openTag)?.[1].trim().toLowerCase() ?? "";
  return type === "" || type === "module" || type === "text/javascript" || type === "application/javascript";
}

const pages = htmlFiles(SITE);
let hashed = 0;
for (const path of pages) {
  const rel = relative(SITE, path);
  const html = readFileSync(path, "utf8");

  const metas = [...html.matchAll(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/g)];
  if (metas.length !== 1) {
    fail(`${rel}: ${metas.length} policy tags, expected exactly 1`);
    continue;
  }
  const [meta] = metas;
  const firstScript = html.search(/<script\b/i);
  if (firstScript !== -1 && firstScript < meta.index) {
    fail(`${rel}: a <script> precedes the policy, and a meta policy governs only what follows it`);
  }

  const directives = new Map(
    meta[1].split(";").map((d) => {
      const [name, ...sources] = d.trim().split(/\s+/);
      return [name, sources];
    })
  );
  const want = {
    "default-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'none'"],
    "form-action": ["'none'"],
  };
  for (const [name, sources] of Object.entries(want)) {
    if (directives.get(name)?.join(" ") !== sources.join(" ")) {
      fail(`${rel}: ${name} is ${directives.get(name)?.join(" ") ?? "missing"}, expected ${sources.join(" ")}`);
    }
  }
  for (const ignored of ["frame-ancestors", "report-uri", "sandbox"]) {
    if (directives.has(ignored)) fail(`${rel}: ${ignored} is ignored in a meta policy and must not pretend to apply`);
  }

  const scriptSrc = directives.get("script-src") ?? [];
  if (scriptSrc[0] !== "'self'") fail(`${rel}: script-src must start from 'self', got ${scriptSrc.join(" ") || "nothing"}`);
  for (const loose of ["'unsafe-inline'", "'unsafe-eval'", "*", "data:", "blob:", "http:", "https:"]) {
    if (scriptSrc.includes(loose)) fail(`${rel}: script-src allows ${loose}`);
  }
  const wasm = scriptSrc.includes("'wasm-unsafe-eval'");
  if (wasm !== (rel === "index.html")) {
    fail(`${rel}: 'wasm-unsafe-eval' belongs on the run alone, found ${wasm ? "here" : "missing"}`);
  }

  const allowed = new Set(scriptSrc.filter((s) => s.startsWith("'sha256-")));
  const present = new Set();
  for (const m of html.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script>/gi)) {
    if (!runsInline(m[1])) continue;
    present.add(`'sha256-${createHash("sha256").update(m[2], "utf8").digest("base64")}'`);
  }
  for (const h of present) {
    if (!allowed.has(h)) fail(`${rel}: an inline script hashes to ${h}, which the policy does not allow, so it will not run`);
  }
  for (const h of allowed) {
    if (!present.has(h)) fail(`${rel}: the policy allows ${h}, and no inline script on the page has that hash`);
  }
  hashed += present.size;
}

if (failures.length) {
  console.error(`check-csp FAILED — ${failures.length} problem${failures.length === 1 ? "" : "s"}:\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(
  `check-csp: ${pages.length} pages carry the policy, ${hashed} inline scripts allowed by hash, against ${process.argv[2] ?? "out"}/`
);
