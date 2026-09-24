/**
 * The dawnscape gate — ¶13's ground and sky, measured in a browser.
 *
 * WHAT IT HOLDS. Round 8 drew a landscape under the morning's words and put
 * birds back in its sky, and every rule the owner and the plan set for that
 * is a measurement here rather than a sentence in a comment:
 *
 *   1. INK CLEARANCE. Every text node in .dawnwrap, taken as its own client
 *      rects (the ink, not the box), and the chrome's text (the nameplate,
 *      the run state, the stop chip), keeps clear air from every mark the
 *      drawing makes: the quote and its attribution 64px, everything else
 *      24. Round 9 drew the whole page, so a subject's bounding box is no
 *      longer a measure of anything (the tree's box wraps a corner and
 *      contains the quote): every <path> is SAMPLED along its length, every
 *      6px, through its screen matrix, and it is those points that keep
 *      their distance — plus what could move them: a roamer's ±30px home
 *      range, and for a swaying group the amplitude at that radius, so the
 *      wind cannot carry a leaf into a halo. Under the signature the grass
 *      is capped at 10px. At every one of the seven seats.
 *   2. THE WIND'S CENSUS. Once body.morninglive is on, the continuously
 *      animated groups inside .dawnscape are CSS animations (transitions are
 *      transients and are not counted), at most 14, exactly 13 at a desktop
 *      seat (the crown's two layers, the perch bough, two saplings, six
 *      tufts, two gull heads), and every duration is from the wind table:
 *      7.3s grass and saplings, 14.6s canopy and bough, 5.2 and 6.1s peck.
 *      Any other number is a new animation nobody agreed to. The doe's
 *      17s graze is gone: a solid doe changes pose by a swap, not a turn.
 *   3. REDUCED MOTION. The drawing is there, at opacity 1, with its paths;
 *      nothing inside it animates; the flock layer is display:none.
 *   4. PALETTE. The .dawnscape rules in the shipped page draw with --ink,
 *      --ink-2 and --hair-strong and nothing else. No --hair (a hard red for
 *      check-palette), no clay, no pine, no ember: the owner said no colour.
 *   5. THE SKY IS ALIVE AND IN FRAME. A pace-compressed sit at his seat: a
 *      bird at visible ink within 2s of landing, no empty-sky gap over 40s of
 *      the page's own clock, no bird box within 8px of a viewport edge while
 *      it is visible, never more than three far birds at once; and on the
 *      ground, no roamer further than 30px from where it was drawn, with the
 *      doe's computed transform agreeing with the log that claims it.
 *
 * SHOWN RED BEFORE GREEN, each on a temp copy of out/ (never on out/ itself),
 * with `--root <dir>`:
 *   · the capped tuft moved under the last line and raised, `tuft(W * 0.50,
 *     60, …)` for `tuft(W * 0.62, 10, …)` → (1) fails on "run 043" twice, the
 *     air and the cap. (The same tuft raised to 60px where it stands, at
 *     0.62 W, stays green, and correctly so: it is 95px east of the line.)
 *   · the wind's media query changed to `@media all` → the source check
 *     fails (8 of 8 selectors outside the query). A browser cannot see this
 *     one, see the note at the check; it was green there before.
 *   · an unguarded `.dawnscape .ds-head{animation:graze …}` rule → (3)
 *     fails, one animation under reduced motion
 *   · a `.dawnscape .ds-far{stroke:var(--hair)}` rule → (4) fails
 *   · `farTimer = setTimeout(spawnFar, at(1500))` removed → (5) fails, gap
 *   · the hop range 30 → 70 and hop size 4–8 → 40–48 → (5) fails, x_off
 *
 *   node scripts/qa/check-dawnscape.mjs [--root out] [--only 1456x949]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const argv = process.argv.slice(2);
const argOf = (name) => {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : null;
};
const OUT = resolve(process.cwd(), argOf("--root") ?? "out");
const ONLY = argOf("--only");

/** every seat the owner reads this page at, his own 1456×949 first */
const SEATS = [
  [1456, 949],
  [1512, 982],
  [1440, 900],
  [1375, 800],
  [1280, 800],
  [390, 844],
  [320, 720],
].filter(([w, h]) => !ONLY || ONLY === `${w}x${h}`);

const CLEAR_PX = 24;
const RANGE_PX = 30;
const GRASS_CAP = 10;
const WIND_TABLE = new Set([7300, 14600, 5200, 6100]);
const MAX_GROUPS = 14;
const DESKTOP_GROUPS = 13;

const fails = [];
const notes = [];
const fail = (m) => fails.push(m);
const note = (m) => notes.push(m);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".bin": "application/octet-stream",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

async function serve() {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    let file = join(OUT, p);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, {
        "content-type": MIME[extname(file)] ?? "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, r));
  return { server, port: server.address().port };
}

/* ————— 4 · the palette, read off the shipped page ————— */
{
  const html = await readFile(join(OUT, "index.html"), "utf8");
  const rules = [...html.matchAll(/\.dawnscape[^{]*\{([^}]*)\}/g)].map(
    (m) => m[1]
  );
  const tokens = new Set();
  for (const body of rules)
    for (const m of body.matchAll(/var\(--([\w-]+)\)/g))
      tokens.add(`--${m[1]}`);
  const allowed = new Set(["--ink", "--ink-2", "--hair-strong"]);
  const off = [...tokens].filter((t) => !allowed.has(t));
  if (!rules.length)
    fail(
      "no .dawnscape rules in out/index.html: the ground is not styled, or the class moved"
    );
  if (off.length)
    fail(
      `the dawnscape draws with ${off.join(", ")} — only --ink, --ink-2 and --hair-strong may appear in its rules`
    );
  else
    note(
      `palette: ${rules.length} .dawnscape rules draw with ${[...tokens].join(", ")}`
    );
  /* THE WIND MUST LIVE INSIDE THE NO-PREFERENCE QUERY, and this has to be
     read off the source, because a browser cannot see it: under reduced
     motion the carry is instant, releaseScroll never runs, body.morninglive
     is never set, and a wind rule outside the query animates nothing an RM
     reader is shown. Shown green on exactly that negative before this
     check existed. So every body.morninglive .dawnscape selector is counted
     against the ones found inside a brace-matched no-preference block. */
  const live = [...html.matchAll(/body\.morninglive \.dawnscape/g)].length;
  let guarded = 0;
  const head = "@media (prefers-reduced-motion: no-preference){";
  for (let i = html.indexOf(head); i > -1; i = html.indexOf(head, i + 1)) {
    let depth = 1;
    let j = i + head.length;
    while (j < html.length && depth) {
      if (html[j] === "{") depth++;
      else if (html[j] === "}") depth--;
      j++;
    }
    guarded += [...html.slice(i, j).matchAll(/body\.morninglive \.dawnscape/g)]
      .length;
  }
  if (!live) fail("no body.morninglive .dawnscape rule: the wind is gone");
  else if (guarded < live)
    fail(
      `${live - guarded} of ${live} body.morninglive .dawnscape selectors sit outside a prefers-reduced-motion: no-preference block — a reduced-motion reader who gets the wind is not measurable in a browser, so this is held at the source`
    );
  else
    note(
      `${live} morninglive rule selectors, all inside a no-preference query`
    );
}

const { server, port } = await serve();
const base = `http://127.0.0.1:${port}/`;
let browser;
try {
  const { chromium } = await import("@playwright/test");
  browser = await chromium.launch();

  /* to the morning: scroll to the end, approve, wait for the carry to let go */
  async function land(page, pace) {
    await page.goto(`${base}?pace=${pace}`, { waitUntil: "load" });
    await page
      .waitForSelector("html[data-np-ready]", { timeout: 20000 })
      .catch(() => {});
    await page.waitForTimeout(400);
    await page.evaluate(() =>
      scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      })
    );
    await page.waitForTimeout(400);
    await page.click("#approve");
    await page.waitForFunction(
      () =>
        document.body.classList.contains("atmorning") &&
        !document.body.classList.contains("carrying") &&
        document.body.classList.contains("morninglive"),
      null,
      { timeout: 30000 }
    );
  }

  /* the measurement, in the page: text ink vs subject boxes, the grass cap,
     and the animation census */
  const MEASURE = ({ CLEAR_PX, RANGE_PX, GRASS_CAP }) => {
    const svg = document.querySelector(".dawnscape");
    const wrap = document.querySelector(".dawnwrap");
    const scape = window.__world.scape;
    /* the words: each text node's own rects with its halo, and the chrome */
    const texts = [];
    const walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      const halo = n.parentElement.closest(".endquote") ? 64 : CLEAR_PX;
      for (const r of rg.getClientRects())
        if (r.width && r.height)
          texts.push([
            r.left,
            r.top,
            r.right,
            r.bottom,
            halo,
            n.textContent.trim().slice(0, 20),
          ]);
    }
    for (const sel of ["#mast a", "#mast .state", "#mtoggle"]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width && r.height && getComputedStyle(el).visibility !== "hidden")
        texts.push([r.left, r.top, r.right, r.bottom, CLEAR_PX, sel]);
    }
    /* the ink: every path sampled along its length through its screen
       matrix, plus what could move the point: a roamer's range, a sway's
       amplitude at that radius */
    const pt = svg.createSVGPoint();
    let worst = { margin: Infinity, gap: 0, need: 0, text: "", sub: "" };
    let samples = 0;
    for (const p of svg.querySelectorAll("path")) {
      const L = p.getTotalLength();
      if (!L) continue;
      const m = p.getScreenCTM();
      const range = p.closest(".ds-deer, .ds-gull, .ds-hare") ? RANGE_PX : 0;
      const sw = p.closest("[class*=sway-]");
      let ox = 0,
        oy = 0,
        tanA = 0;
      if (sw) {
        const o = (sw.style.transformOrigin || "0px 0px")
          .split(" ")
          .map(parseFloat);
        ox = o[0];
        oy = o[1];
        const amp =
          parseFloat(getComputedStyle(sw).getPropertyValue("--amp")) || 0;
        tanA = Math.tan((amp * Math.PI) / 180);
      }
      const g = p.parentElement;
      const sub = (
        (g && g !== svg && g.className.baseVal) ||
        p.className.baseVal ||
        "path"
      ).trim();
      const step = L > 3000 ? 10 : 6;
      for (let s = 0; s <= L; s += step) {
        const q = p.getPointAtLength(s);
        pt.x = q.x;
        pt.y = q.y;
        const v = pt.matrixTransform(m);
        const sway = tanA ? Math.hypot(q.x - ox, q.y - oy) * tanA : 0;
        samples++;
        for (const t of texts) {
          /* the range is a roam, and a roam is along x only */
          const dx = Math.max(t[0] - v.x, v.x - t[2], 0) - range;
          const dy = Math.max(t[1] - v.y, v.y - t[3], 0);
          const gap = Math.max(dx, dy, 0);
          const need = t[4] + sway;
          if (gap - need < worst.margin)
            worst = {
              margin: +(gap - need).toFixed(1),
              gap: +gap.toFixed(1),
              need: +need.toFixed(1),
              text: t[5],
              sub,
            };
        }
      }
    }
    /* the grass under the signature: the rule exists so the tallest ink stays
       clear of the LAST line, so the column here is that line's own ink
       extent, "run 043 · not yet begun", wherever this seat puts it */
    const runRects = [];
    const rw = document.createTreeWalker(
      document.querySelector(".dawnrun"),
      NodeFilter.SHOW_TEXT
    );
    for (let n = rw.nextNode(); n; n = rw.nextNode()) {
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width) runRects.push(r);
    }
    const colL = Math.min(...runRects.map((r) => r.left)) - CLEAR_PX,
      colR = Math.max(...runRects.map((r) => r.right)) + CLEAR_PX;
    const tallUnder = [...svg.querySelectorAll(".ds-tuft")]
      .map((el) => ({ x: +el.dataset.x, h: el.getBoundingClientRect().height }))
      .filter((t) => t.x >= colL && t.x <= colR && t.h > GRASS_CAP + 1.5);
    const anims = document
      .getAnimations()
      .filter(
        (a) => a instanceof CSSAnimation && svg.contains(a.effect.target)
      );
    return {
      scape,
      paths: svg.querySelectorAll("path").length,
      worst,
      texts: texts.length,
      samples,
      tallUnder,
      census: anims.map((a) => [
        a.animationName,
        a.effect.getTiming().duration,
        a.playState,
      ]),
      flock: getComputedStyle(document.getElementById("flock")).display,
      op: getComputedStyle(svg).opacity,
      CLEAR_PX,
    };
  };

  /* ————— 1, 2 · every seat ————— */
  for (const [W, H] of SEATS) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H } });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    await land(page, 0.25);
    await page.waitForTimeout(300);
    const m = await page.evaluate(MEASURE, { CLEAR_PX, RANGE_PX, GRASS_CAP });
    const seat = `${W}×${H}`;
    if (errs.length) fail(`${seat}: page errors — ${errs.join(" | ")}`);
    if (!m.scape)
      fail(
        `${seat}: window.__world.scape is missing — buildDawnscape never ran`
      );
    else if (m.scape.room < 0) {
      /* no ground to draw on: the column already overflows the panel */
      if (m.paths !== 0)
        fail(
          `${seat}: ${m.paths} paths drawn with ${m.scape.free}px under the column — nothing may be drawn under 20px`
        );
      else
        note(
          `${seat}: ${m.scape.free}px under the column, nothing drawn (room ${m.scape.room})`
        );
    } else {
      if (m.paths < 5)
        fail(`${seat}: only ${m.paths} paths — the ground is not drawn`);
      if (m.worst.margin < 0)
        fail(
          `${seat}: "${m.worst.text}" is ${m.worst.gap}px from ${m.worst.sub} and needs ${m.worst.need}px (halo plus sway, the roam already taken off) — the words keep their air from every mark of the drawing`
        );
      else
        note(
          `${seat}: clearance margin ${m.worst.margin}px ("${m.worst.text}" vs ${m.worst.sub}, ${m.worst.gap}px of ${m.worst.need}px), ${m.texts} text rects vs ${m.samples} sampled points`
        );
      if (m.tallUnder.length)
        fail(
          `${seat}: grass under the column at ${m.tallUnder.map((t) => `${t.h.toFixed(1)}px @x${t.x}`).join(", ")} — capped at ${GRASS_CAP}px`
        );
      const n = m.census.length;
      const bad = m.census.filter(([, d]) => !WIND_TABLE.has(Math.round(d)));
      if (n > MAX_GROUPS)
        fail(
          `${seat}: ${n} groups animate continuously — the cap is ${MAX_GROUPS}`
        );
      if (W >= 760 && n !== DESKTOP_GROUPS)
        fail(
          `${seat}: ${n} groups animate — a desktop seat animates exactly ${DESKTOP_GROUPS}`
        );
      if (W < 760 && n < 1)
        fail(`${seat}: nothing animates on the phone's strip`);
      if (bad.length)
        fail(
          `${seat}: durations off the wind table — ${bad.map(([k, d]) => `${k} ${d}ms`).join(", ")}`
        );
      const idle = m.census.filter(([, , s]) => s !== "running");
      if (idle.length)
        fail(
          `${seat}: ${idle.length} animations not running (${idle.map(([k]) => k).join(", ")})`
        );
      if (!bad.length && n <= MAX_GROUPS)
        note(
          `${seat}: ${n} groups animate, all from the wind table, all running`
        );
    }
    await ctx.close();
  }

  /* ————— 3 · reduced motion, at his seat and on the phone ————— */
  for (const [W, H] of SEATS.filter(
    ([w, h]) => (w === 1456 && h === 949) || (w === 390 && h === 844)
  )) {
    const ctx = await browser.newContext({
      viewport: { width: W, height: H },
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base, { waitUntil: "load" });
    await page
      .waitForSelector("html[data-np-ready]", { timeout: 20000 })
      .catch(() => {});
    await page.waitForTimeout(400);
    await page.evaluate(() =>
      scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      })
    );
    await page.waitForTimeout(400);
    await page.click("#approve");
    await page.waitForTimeout(700);
    const m = await page.evaluate(MEASURE, { CLEAR_PX, RANGE_PX, GRASS_CAP });
    const rm = await page.evaluate(() => ({
      atmorning: document.body.classList.contains("atmorning"),
      live: document.body.classList.contains("morninglive"),
      settled: document.querySelector(".dawnscape").dataset.settled,
      scape: window.__world.marks.scape,
    }));
    const seat = `${W}×${H} reduced`;
    if (!rm.atmorning) fail(`${seat}: the page is not at the morning`);
    if (m.scape && m.scape.room >= 0 && m.paths < 5)
      fail(`${seat}: the ground is not drawn (${m.paths} paths)`);
    if (m.op !== "1")
      fail(
        `${seat}: the dawnscape is at opacity ${m.op} — it must simply be there`
      );
    if (m.census.length)
      fail(
        `${seat}: ${m.census.length} animations inside .dawnscape under reduced motion — the wind must be inside the no-preference query`
      );
    if (m.flock !== "none")
      fail(`${seat}: .flock is display:${m.flock} under reduced motion`);
    if (rm.scape === undefined)
      fail(
        `${seat}: mark("scape") never recorded — settleScape did not run on the reduced-motion path`
      );
    if (!fails.some((f) => f.startsWith(seat)))
      note(
        `${seat}: ground present at opacity 1 (${m.paths} paths), 0 animations, flock hidden, scape mark ${rm.scape}ms`
      );
    await ctx.close();
  }

  /* ————— 5 · the sky, at his seat, over a compressed sit ————— */
  if (SEATS.some(([w, h]) => w === 1456 && h === 949)) {
    const W = 1456,
      H = 949;
    const ctx = await browser.newContext({ viewport: { width: W, height: H } });
    const page = await ctx.newPage();
    await land(page, 0.25);
    const PACE = 0.25;
    const READ = () => {
      const out = [];
      for (const el of document.querySelectorAll(".bird")) {
        const svg = el.querySelector("svg");
        if (!svg) continue;
        const r = svg.getBoundingClientRect();
        let o = 1,
          n = el;
        while (n && n.nodeType === 1) {
          const v = parseFloat(getComputedStyle(n).opacity);
          if (!Number.isNaN(v)) o *= v;
          n = n.parentElement;
        }
        if (
          o < 0.05 ||
          r.width < 1 ||
          getComputedStyle(el).visibility === "hidden"
        )
          continue;
        out.push([
          el.classList.contains("far") ? 1 : 0,
          r.left,
          r.top,
          r.right,
          r.bottom,
        ]);
      }
      return { birds: out, t: performance.now() - window.__world.departure.t0 };
    };
    const SIT_MS = 30000; /* 30s of wall clock is two minutes of the page's own */
    let first = null,
      gapFrom = null,
      worstGap = 0,
      escapes = 0,
      maxFar = 0,
      samples = 0;
    const tLand = await page.evaluate(
      () => performance.now() - window.__world.departure.t0
    );
    for (let t = 0; t < SIT_MS; t += 1000) {
      const { birds, t: now } = await page.evaluate(READ);
      samples++;
      if (birds.length && first === null) first = now - tLand;
      const far = birds.filter((b) => b[0]).length;
      maxFar = Math.max(maxFar, far);
      for (const [, l, tp, r, bt] of birds)
        if (l < 8 || tp < 8 || r > W - 8 || bt > H - 8) escapes++;
      if (!birds.length) {
        if (gapFrom === null) gapFrom = now;
        worstGap = Math.max(worstGap, now - gapFrom + 1000);
      } else gapFrom = null;
      await page.waitForTimeout(1000);
    }
    const fin = await page.evaluate(() => ({
      sky: window.__world.sky,
      ground: window.__world.ground || [],
      tf: [
        ...document.querySelectorAll(
          ".dawnscape .ds-gull, .dawnscape .ds-deer"
        ),
      ].map((el) => [el.dataset.id || "deer", el.style.transform]),
    }));
    const seat = `sky 1456×949`;
    /* clocks: the sit is wall time; the page's own is PACE times shorter */
    const gapCode = worstGap / PACE;
    if (first === null)
      fail(`${seat}: no bird was ever visible in ${SIT_MS}ms of sitting`);
    else if (first > 2000 * PACE + 500)
      fail(
        `${seat}: first visible bird ${(first / PACE).toFixed(0)}ms after landing on the page's clock — the morning lands with birds in it (2s)`
      );
    if (gapCode > 40000)
      fail(
        `${seat}: empty sky for ${(gapCode / 1000).toFixed(1)}s of the page's clock — the cap is 40s`
      );
    if (escapes)
      fail(
        `${seat}: ${escapes} samples with a visible bird within 8px of the viewport's edge`
      );
    if (maxFar > 3)
      fail(`${seat}: ${maxFar} far birds at once — the cap is three`);
    if (!fin.sky || fin.sky.spawned < 2)
      fail(
        `${seat}: only ${fin.sky ? fin.sky.spawned : 0} far crossings in ${(SIT_MS / PACE / 1000).toFixed(0)}s of morning`
      );
    const maxOff = {};
    for (const g of fin.ground)
      maxOff[g.id] = Math.max(maxOff[g.id] || 0, Math.abs(g.x_off));
    for (const [id, off] of Object.entries(maxOff))
      if (off > RANGE_PX)
        fail(
          `${seat}: ${id} strayed ${off}px from where it was drawn — the home range is ±${RANGE_PX}px`
        );
    /* the log against the ink: one roamer's computed translate must be what
       the log says its offset is */
    for (const [id, tf] of fin.tf) {
      const last = [...fin.ground].reverse().find((g) => g.id === id);
      const shown = tf ? parseFloat(tf.replace(/^translate\(/, "")) : 0;
      if (last && Math.abs(shown - last.x_off) > 0.6)
        fail(
          `${seat}: ${id} is drawn at ${shown}px but the log says ${last.x_off}px`
        );
    }
    if (!fails.some((f) => f.startsWith(seat)))
      note(
        `${seat}: first bird ${first.toFixed(0)}ms after landing, worst gap ${(gapCode / 1000).toFixed(1)}s (page clock), 0 escapes in ${samples} samples, ` +
          `max ${maxFar} far at once, ${fin.sky.spawned} crossings (${fin.sky.entries.map((e) => e.entry).join("/")}), ${fin.ground.length} ground events, ` +
          `max |x_off| ${JSON.stringify(maxOff)}`
      );
    await ctx.close();
  }
} finally {
  if (browser) await browser.close();
  server.close();
}

for (const n of notes) console.log(`  · ${n}`);
if (fails.length) {
  console.error(`\ncheck-dawnscape FAILED — ${fails.length} finding(s):\n`);
  for (const f of fails) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(
  `\ncheck-dawnscape: the morning's ground keeps its air at ${SEATS.length} seat(s), the wind is thirteen groups from the table, reduced motion is still, and the sky stays alive and in frame.`
);
