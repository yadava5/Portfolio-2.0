import { expect, test, type Page } from "@playwright/test";

/**
 * The four gates the clarity redesign is accountable to, measured in a browser
 * on the page that ships. PLAN.md § G.
 *
 *   G2  · no HTML text under 12px EFFECTIVE at 390 and 1440
 *   G2b · the same floor for the tight (phone) SVG figure editions
 *   G3  · mono only on machine values
 *   G4  · the manifest never covers text involuntarily
 *   G9  · no interactive target under 24×24 on the phone
 *
 * EFFECTIVE is the whole point of G2 and G2b. The run scales type in two ways
 * that a computed `font-size` cannot see: `transform` on the station wrappers
 * (the scroll-fx `drift`/`y` chains all compose into a matrix), and the SVG
 * viewBox, where an 11px label on a 240-unit plate rendered into 276 CSS px
 * arrives at the reader as 12.65px. So the number asserted here is
 * `font-size × ancestor transform scale` for HTML and
 * `font-size × hypot(ctm.a, ctm.b)` for SVG — the same arithmetic
 * `docs/clarity/harness/sweep.mjs` uses, so the gate and the measurement that
 * motivated it cannot disagree.
 *
 * RUNS ONLY ON ONE PROJECT. Every assertion here is a geometric one about the
 * page as designed, not about engine differences, and the five-engine matrix
 * would multiply a ~4-minute sweep by five for no new information. The engine
 * differences that matter are atlas.spec.ts's and run-home.spec.ts's.
 *
 * Each gate was shown RED against the pre-redesign build (`out-original-index.html`,
 * sha b6ea15df) before it was shown green here; G2b had no violation on either
 * build and is therefore proven by injection, as is G4's overlap detector.
 */

/* ────────────────────────────────────────────────────────────────────────
   Browser-side probes, installed once per page.

   They live in an init script rather than inline in each `evaluate` because
   four gates need the same three primitives and a second, drifting copy of
   `scaleOf` is exactly how a gate ends up measuring something other than what
   the harness measured.
   ──────────────────────────────────────────────────────────────────────── */
declare global {
  interface Window {
    __gate: {
      /** product of every ancestor transform's scale, incl. the element's own */
      scaleOf(el: Element): number;
      /** 0 if anything above it is display:none / visibility:hidden */
      effOpacity(el: Element): number;
      /** a short, readable ancestor chain, stopping at the first id */
      sel(el: Element): string;
      /** every visible text node, with its effective px and its line boxes */
      texts(): {
        sel: string;
        text: string;
        px: number;
        svg: boolean;
        mono: boolean;
        lines: [number, number, number, number][];
      }[];
    };
  }
}

async function installProbes(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const scaleOf = (el: Element): number => {
      let s = 1;
      let n: Element | null = el;
      while (n && n.nodeType === 1) {
        const t = getComputedStyle(n).transform;
        if (t && t !== "none") {
          const m = t.match(/matrix\(([^)]+)\)/);
          if (m) {
            const p = m[1].split(",").map(Number);
            s *= Math.hypot(p[0], p[1]);
          }
        }
        n = n.parentElement;
      }
      return s;
    };
    const effOpacity = (el: Element): number => {
      let o = 1;
      let n: Element | null = el;
      while (n && n.nodeType === 1) {
        const cs = getComputedStyle(n);
        if (cs.display === "none" || cs.visibility === "hidden") return 0;
        const v = parseFloat(cs.opacity);
        if (!Number.isNaN(v)) o *= v;
        n = n.parentElement;
      }
      return o;
    };
    const sel = (el: Element): string => {
      const parts: string[] = [];
      let n: Element | null = el;
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
    const texts = () => {
      const out: {
        sel: string;
        text: string;
        px: number;
        svg: boolean;
        mono: boolean;
        lines: [number, number, number, number][];
      }[] = [];
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = tw.nextNode())) {
        const text = (node.nodeValue ?? "").replace(/\s+/g, " ").trim();
        if (!text) continue;
        const el = node.parentElement;
        if (!el) continue;
        const tag = el.tagName.toLowerCase();
        if (tag === "script" || tag === "style" || tag === "title") continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = [...range.getClientRects()].filter(
          (r) => r.width > 0 && r.height > 0
        );
        if (!rects.length) continue;
        /* 0.05, not 0: the run fades prose in and out on scroll and a run at
           0.02 is not being read by anybody. It is the same floor the harness
           and check-figures use. */
        if (effOpacity(el) <= 0.05) continue;
        const cs = getComputedStyle(el);
        const svg = el.namespaceURI === "http://www.w3.org/2000/svg";
        let px = parseFloat(cs.fontSize);
        if (svg) {
          try {
            const ctm = (el as unknown as SVGGraphicsElement).getScreenCTM?.();
            if (ctm) px *= Math.hypot(ctm.a, ctm.b);
          } catch {
            /* no layout box yet — leave the authored size */
          }
        } else {
          px *= scaleOf(el);
        }
        const ff = cs.fontFamily.toLowerCase();
        out.push({
          sel: sel(el),
          text: text.slice(0, 70),
          px: Math.round(px * 100) / 100,
          svg,
          mono:
            ff.includes("fragment mono") ||
            ff.includes("ui-monospace") ||
            ff.startsWith("monospace"),
          lines: rects.map((r) => [
            Math.round(r.left),
            Math.round(r.top),
            Math.round(r.width),
            Math.round(r.height),
          ]) as [number, number, number, number][],
        });
      }
      return out;
    };
    window.__gate = { scaleOf, effOpacity, sel, texts };
  });
}

/** goto + fonts + the nameplate's ~3s performance. */
async function arrive(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
  await page.waitForTimeout(4200);
}

/** scrollTo instant, 700ms settle — the harness's cadence, so the numbers match. */
async function stepPage<T>(
  page: Page,
  height: number,
  read: () => Promise<T>,
  onEach: (value: T, y: number) => void
): Promise<number> {
  const doc = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(height / 2);
  let steps = 0;
  for (let y = 0; y <= doc - height + step; y += step) {
    const target = Math.max(0, Math.min(y, doc - height));
    await page.evaluate(
      (yy) => window.scrollTo({ top: yy, behavior: "instant" }),
      target
    );
    await page.waitForTimeout(700);
    onEach(await read(), target);
    steps++;
  }
  return steps;
}

/* ONE ENGINE. Every assertion in this file is a measurement of the page's own
   declared geometry — effective px, a rect, a font-family — and running the
   same measurement on five engines is not five measurements. It is also a
   ~6-minute sweep, which is most of `test:e2e:browser-smoke`'s budget on its
   own. The engine-dependent assertions live in atlas.spec.ts and the rest of
   run-home.spec.ts, and those still run everywhere. */
/* Playwright rejects a named first parameter here — "First argument must use
   the object destructuring pattern" — and refuses to load the FILE, which
   takes the whole `playwright test` invocation to "0 tests in 0 files" rather
   than to an error anyone would read as one. So the empty pattern stays and
   the lint rule yields, not the other way round. */
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  testInfo.skip(
    testInfo.project.name !== "chromium-desktop",
    "the reading gates measure geometry, not engines — chromium-desktop only"
  );
});

const FLOOR_PX = 12;

/* ══════════════════════════════════════════════════════════════════════
   G2 · the reading floor, HTML
   ══════════════════════════════════════════════════════════════════════ */
test.describe("G2 · no HTML text under 12px effective", () => {
  for (const { w, h, mobile } of [
    { w: 390, h: 844, mobile: true },
    { w: 1440, h: 900, mobile: false },
  ]) {
    test(`at ${w}`, async ({ page, browser, baseURL }, testInfo) => {
      testInfo.setTimeout(240_000);
      const ctx = mobile
        ? await browser.newContext({
            viewport: { width: w, height: h },
            isMobile: true,
            hasTouch: true,
            deviceScaleFactor: 1,
            baseURL,
          })
        : null;
      const p = ctx ? await ctx.newPage() : page;
      if (!ctx) await p.setViewportSize({ width: w, height: h });
      await installProbes(p);
      await arrive(p);

      const small = new Map<
        string,
        { sel: string; text: string; px: number }
      >();
      let scanned = 0;
      const steps = await stepPage(
        p,
        h,
        () => p.evaluate(() => window.__gate.texts()),
        (runs) => {
          scanned += runs.length;
          for (const r of runs) {
            if (r.svg) continue; // G2b owns SVG; it has its own floor
            if (r.px >= FLOOR_PX) continue;
            const key = `${r.sel}|${r.text}`;
            if (!small.has(key))
              small.set(key, { sel: r.sel, text: r.text, px: r.px });
          }
        }
      );
      await ctx?.close();

      /* A sweep that read nothing would print the same green as a clean page. */
      expect(steps, "the page was stepped").toBeGreaterThan(8);
      expect(scanned, "text nodes were read at all").toBeGreaterThan(300);

      expect(
        [...small.values()].map((s) => `${s.px}px  ${s.sel}  "${s.text}"`),
        `HTML text below the ${FLOOR_PX}px reading floor at ${w}`
      ).toEqual([]);
    });
  }

  /* The gate must be able to fail. 9px is under the floor by enough that no
     rounding or transform can lift it over. */
  test("positive control: an injected 9px line is caught", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(90_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await installProbes(page);
    await arrive(page);
    await page.addStyleTag({
      content: ".kicker{font-size:9px !important}",
    });
    await page.waitForTimeout(400);
    const small = await page.evaluate(
      (floor) =>
        window.__gate
          .texts()
          .filter((r) => !r.svg && r.px < floor)
          .map((r) => `${r.px}px ${r.sel}`),
      FLOOR_PX
    );
    expect(
      small.length,
      "the reading-floor probe did not see a 9px line — the probe is broken, not the page"
    ).toBeGreaterThan(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   G2b · the reading floor, tight SVG editions

   check-figures' FLOOR_PX covers the WIDE editions only (see the note at
   src/run/index.html:2123). The tight editions author 11px in a 240-unit
   viewBox and the phone seat caps them at 276px, so the reader gets
   11 × 276/240 = 12.65px — over the floor, but by 0.65px, and nothing was
   holding it there.
   ══════════════════════════════════════════════════════════════════════ */
test.describe("G2b · the tight SVG editions clear the same floor", () => {
  test("at 390", async ({ browser, baseURL }, testInfo) => {
    testInfo.setTimeout(240_000);
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
      baseURL,
    });
    const p = await ctx.newPage();
    await installProbes(p);
    await arrive(p);

    const small = new Map<string, string>();
    let svgRuns = 0;
    let tightPlates = 0;
    await stepPage(
      p,
      844,
      async () => ({
        runs: await p.evaluate(() => window.__gate.texts()),
        tight: await p.evaluate(
          () => document.querySelectorAll(".figsvg.tight, #net.tight").length
        ),
      }),
      ({ runs, tight }) => {
        tightPlates = Math.max(tightPlates, tight);
        for (const r of runs) {
          if (!r.svg) continue;
          svgRuns++;
          if (r.px >= FLOOR_PX) continue;
          small.set(`${r.sel}|${r.text}`, `${r.px}px  ${r.sel}  "${r.text}"`);
        }
      }
    );
    await ctx.close();

    expect(
      tightPlates,
      "the tight editions are what this gate is for — none were built at 390"
    ).toBeGreaterThanOrEqual(5);
    expect(svgRuns, "SVG labels were read at all").toBeGreaterThan(100);
    expect(
      [...small.values()],
      `tight SVG labels below the ${FLOOR_PX}px effective floor at 390`
    ).toEqual([]);
  });

  /* Nothing on the page violates this today (12.65px is the tightest), so
     the only proof that the gate can fail is to make it fail. The injection
     is the real mechanism: authored px inside the tight plate. */
  test("positive control: an injected 8px tight label is caught", async ({
    browser,
    baseURL,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
      baseURL,
    });
    const p = await ctx.newPage();
    await installProbes(p);
    await arrive(p);
    await p.addStyleTag({
      content: ".figsvg.tight text{font-size:8px !important}",
    });
    /* the plates build on intersection — scroll to one and let it settle */
    await p.evaluate(() => {
      const fig = document.querySelector("#pathFig");
      fig?.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await p.waitForTimeout(900);
    const small = await p.evaluate(
      (floor) =>
        window.__gate
          .texts()
          .filter((r) => r.svg && r.px < floor)
          .map((r) => `${r.px}px ${r.sel}`),
      FLOOR_PX
    );
    await ctx.close();
    expect(
      small.length,
      "the tight-SVG floor probe did not see an 8px label — the probe is broken, not the page"
    ).toBeGreaterThan(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   G3 · mono is for machine values

   75.6% of the pre-redesign page's visible words were set in Fragment Mono.
   Mono had stopped meaning "this is a machine value" and become the default
   face, which is the owner's standing complaint about this repository.
   THE ALLOWLIST IS DERIVED FROM THE PAGE, not invented: every selector below
   was read off the shipped build and then judged one at a time.

   EVERY ENTRY IS A LEAF, NOT A CONTAINER, and that is the difference between
   an allowlist and a description. `#gatesFig` as a whole would have admitted
   `.gwhy` ("1 wrong in 96, above the 0.95 floor" — a sentence). `.prov` would
   have admitted the bare prose authored beside its values ("query logs, five
   years of dashboard use…"). `.bench` would have admitted `.bfoot` and
   `.shead`, `.engrows` the degree and languages rows, `.padbar` the clear
   button's label, and `#mast .state` would have admitted `#mphase`, which is
   now in the text face and would have been covered for nothing.
   None of those leaves is mono on the page today. The allowlist is written so
   that if one becomes mono, this goes red.

   Five entries were listed here as QUESTIONED rather than allowed, because
   marking a doubt is the only thing that stops an allowlist from becoming a
   description of whatever the page happens to do. Four of them have since
   moved to the text face and are gone from the list:

     · `.signs`              two people's names
     · `#mphase`             a station's title
     · `.endquote figcaption` the Eliot attribution
     · `#approve`            a control's verb

   One stays, and it is not a doubt. `.cue .a` is the "↓" under the
   nameplate: a GLYPH PIN, kept in Fragment Mono because that is the only
   one of the page's four faces that draws the arrow at all. Newsreader,
   Fraunces and the system stacks fall back to Apple Symbols for it, at a
   different advance, which is the drift the pin exists to prevent. It is
   one character and it is never prose.

   This gate's job is to make sure nothing NEW joins it.
   ══════════════════════════════════════════════════════════════════════ */
const MONO_ALLOW: { sel: string; why: string }[] = [
  { sel: ".uv", why: "the unit that belongs to the value beside it" },
  { sel: ".mv", why: "a machine value set inline in prose" },
  { sel: ".prov b", why: "the provenance line's values, not its prose" },
  { sel: ".kicker i", why: "the station clock" },
  { sel: "#mclock", why: "the run clock" },
  { sel: "#mast .st-run", why: "the run's serial" },
  { sel: "#mast .mdot", why: "the masthead's own separator" },
  { sel: "#mcount", why: "stations seen, as a count" },
  { sel: ".ladder", why: "the gate ladder: each station's time and verdict" },
  { sel: ".figsvg text", why: "figure labels — annotation on a drawing" },
  { sel: "#net text", why: "the network figure's layer and class labels" },
  { sel: "#netwrap .verdictline", why: "the classifier's live readout" },
  { sel: ".bench .brow span", why: "a benchmark lane, its value and unit" },
  { sel: "#gatesFig .gname", why: "the gate register: which rule ran" },
  { sel: "#gatesFig .gword", why: "the gate register: its verdict" },
  { sel: "#gatesFig .gtail span", why: "the register's unsigned row" },
  { sel: "#cadWeek .hd span", why: "the week grid's day columns" },
  { sel: "#slotWhen", why: "the slot the parse found, as a time" },
  { sel: ".chip", why: "the fields a parse produced" },
  { sel: ".engrows a", why: "the address on the identity card" },
  { sel: "#mail", why: "an email address" },
  { sel: ".padbar .st i", why: "the pad's status lamp" },
  { sel: "#stamp", why: "the stamp the gate prints" },
  { sel: "#glyphStatus", why: "the classifier's status" },
  { sel: "code", why: "code" },
  { sel: "pre", why: "code" },
  { sel: "kbd", why: "a key" },
  { sel: "samp", why: "machine output" },
  { sel: "[data-machine]", why: "an explicit opt-in for a machine value" },
  /* ── the one glyph pin; see the note above ─────────────────────────── */
  { sel: ".cue .a", why: "glyph pin: ↓ exists only in Fragment Mono" },
];

test.describe("G3 · mono only on machine values", () => {
  test("at 1440", async ({ page }, testInfo) => {
    testInfo.setTimeout(240_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await installProbes(page);
    await arrive(page);

    const allow = MONO_ALLOW.map((a) => a.sel).join(",");
    const offenders = new Map<string, string>();
    const usedSelectors = new Set<string>();
    let monoRuns = 0;

    await stepPage(
      page,
      900,
      () =>
        page.evaluate(
          ([allowSel, entries]) => {
            const used: string[] = [];
            const bad: { sel: string; text: string }[] = [];
            let mono = 0;
            /* walked here rather than read off `__gate.texts()` because the
               allowlist test is `el.closest(...)` and that needs the live
               element, not the serialised chain the probe returns */
            const tw = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT
            );
            let node: Node | null;
            while ((node = tw.nextNode())) {
              const text = (node.nodeValue ?? "").replace(/\s+/g, " ").trim();
              if (!text) continue;
              const el = node.parentElement;
              if (!el) continue;
              const tag = el.tagName.toLowerCase();
              if (tag === "script" || tag === "style" || tag === "title")
                continue;
              const range = document.createRange();
              range.selectNodeContents(node);
              if (
                ![...range.getClientRects()].some(
                  (q) => q.width > 0 && q.height > 0
                )
              )
                continue;
              if (window.__gate.effOpacity(el) <= 0.05) continue;
              const ff = getComputedStyle(el).fontFamily.toLowerCase();
              if (
                !(
                  ff.includes("fragment mono") ||
                  ff.includes("ui-monospace") ||
                  ff.startsWith("monospace")
                )
              )
                continue;
              mono++;
              if (el.closest(allowSel)) {
                for (const e of entries) if (el.closest(e)) used.push(e);
                continue;
              }
              bad.push({
                sel: window.__gate.sel(el),
                text: text.slice(0, 70),
              });
            }
            return { bad, used, mono };
          },
          [allow, MONO_ALLOW.map((a) => a.sel)] as const
        ),
      ({ bad, used, mono }) => {
        monoRuns += mono;
        for (const u of used) usedSelectors.add(u);
        for (const b of bad)
          offenders.set(`${b.sel}|${b.text}`, `${b.sel}  "${b.text}"`);
      }
    );

    expect(monoRuns, "mono text was found at all").toBeGreaterThan(100);
    expect(
      [...offenders.values()],
      "Fragment Mono outside the machine-value allowlist. Mono means " +
        "'this is a machine value'; prose, labels and captions get the text face."
    ).toEqual([]);

    /* An allowlist entry nothing uses is an allowlist entry nobody is
       checking. Reported, not failed: an entry can legitimately go quiet at
       one width before the selector is retired. */
    const unused = MONO_ALLOW.filter((a) => !usedSelectors.has(a.sel));
    if (unused.length) {
      console.log(
        `  ! G3 allowlist entries unused at 1440 (${unused.length}/${MONO_ALLOW.length}): ` +
          unused.map((u) => u.sel).join(", ")
      );
    }
  });

  test("positive control: mono on a prose paragraph is caught", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(90_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await installProbes(page);
    await arrive(page);
    await page.addStyleTag({
      content:
        '#who .prose p{font-family:"Fragment Mono",monospace !important}',
    });
    /* ¶02's prose is faded in by the scroll-fx, and the gate ignores anything
       at effective opacity ≤ 0.05 — so the control has to put the paragraph
       in front of a reader before it can claim the gate missed it. */
    await page.evaluate(() => {
      document
        .querySelector("#who")
        ?.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(900);
    const allow = MONO_ALLOW.map((a) => a.sel).join(",");
    const bad = await page.evaluate((allowSel) => {
      const out: string[] = [];
      for (const el of document.querySelectorAll("#who .prose p")) {
        const ff = getComputedStyle(el).fontFamily.toLowerCase();
        if (!ff.includes("fragment mono")) continue;
        if (el.closest(allowSel)) continue;
        if (window.__gate.effOpacity(el) <= 0.05) continue;
        out.push(window.__gate.sel(el));
      }
      return out;
    }, allow);
    expect(
      bad.length,
      "the mono probe did not see a prose paragraph forced into Fragment Mono"
    ).toBeGreaterThan(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   G4 · the manifest never covers text involuntarily

   The pre-redesign manifest was a standing rail: 8 steps at 1512, 9 at 1440,
   13 at 1280, 5 at 1024, 8 at 768, 13 at 390, 28 at 320 where it printed over
   the reader's own paragraph. The redesign closes it by default and opens it
   from the masthead, so the answer here is zero — but "zero" is also what a
   broken detector says, which is why the positive control below is not
   optional.
   ══════════════════════════════════════════════════════════════════════ */
const MANIFEST_WIDTHS = [1512, 1440, 1280, 1024, 768, 390, 320];

/** the manifest's rect vs every line box of main content, at this scroll stop */
const MANIFEST_PROBE = () => {
  const mf = document.getElementById("manifest");
  if (!mf) return { visible: false, hits: [] as string[] };
  const cs = getComputedStyle(mf);
  const o = window.__gate.effOpacity(mf);
  if (o <= 0.05 || cs.visibility === "hidden")
    return { visible: false, hits: [] as string[] };
  const m = mf.getBoundingClientRect();
  if (m.width < 1 || m.height < 1)
    return { visible: false, hits: [] as string[] };
  const main = document.querySelector("main");
  if (!main) return { visible: true, hits: [] as string[] };
  const hits: string[] = [];
  const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = tw.nextNode())) {
    const text = (node.nodeValue ?? "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el) continue;
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style") continue;
    if (mf.contains(el)) continue;
    if (window.__gate.effOpacity(el) <= 0.05) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      /* 1px of tolerance: a line box that merely abuts the panel is not
         covered by it. */
      if (
        r.left < m.right - 1 &&
        r.right > m.left + 1 &&
        r.top < m.bottom - 1 &&
        r.bottom > m.top + 1
      ) {
        hits.push(`${window.__gate.sel(el)}  "${text.slice(0, 60)}"`);
        break;
      }
    }
  }
  return { visible: true, hits };
};

test.describe("G4 · the manifest never covers text", () => {
  for (const w of MANIFEST_WIDTHS) {
    test(`at ${w}`, async ({ browser, baseURL }, testInfo) => {
      testInfo.setTimeout(240_000);
      const mobile = w <= 430;
      const h =
        w >= 1512
          ? 982
          : w >= 1440
            ? 900
            : w >= 1280
              ? 800
              : w >= 1024
                ? 768
                : w >= 768
                  ? 720
                  : w >= 390
                    ? 844
                    : 640;
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        isMobile: mobile,
        hasTouch: mobile,
        deviceScaleFactor: 1,
        baseURL,
      });
      const p = await ctx.newPage();
      await installProbes(p);
      await arrive(p);

      const covered = new Map<string, string>();
      let visibleSteps = 0;
      const steps = await stepPage(
        p,
        h,
        () => p.evaluate(MANIFEST_PROBE),
        ({ visible, hits }, y) => {
          if (visible) visibleSteps++;
          for (const hit of hits) covered.set(hit, `y=${y}  ${hit}`);
        }
      );
      await ctx.close();

      expect(steps, "the page was stepped").toBeGreaterThan(8);
      expect(
        [...covered.values()],
        `#manifest covers main-content text at ${w} ` +
          `(it was visible at ${visibleSteps}/${steps} stops)`
      ).toEqual([]);
    });
  }

  /* THE CONTROL. Zero overlaps is the right answer and also what a detector
     that reads nothing returns. Forcing the panel open over prose is the only
     thing that tells those two apart. */
  test("positive control: the open panel over prose is detected", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.setViewportSize({ width: 1280, height: 800 });
    await installProbes(page);
    await arrive(page);
    /* scroll into a paragraph-heavy station first, so there IS prose under it */
    await page.evaluate(() => {
      document
        .querySelector("#who")
        ?.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(700);

    const toggle = page.locator("#mtoggle");
    if (await toggle.count()) await toggle.first().click();
    else
      await page.evaluate(() => {
        const mf = document.getElementById("manifest");
        mf?.classList.add("open");
        mf?.setAttribute("aria-hidden", "false");
      });
    await page.waitForTimeout(900);

    const { visible, hits } = await page.evaluate(MANIFEST_PROBE);
    expect(visible, "the panel did not open — the control never ran").toBe(
      true
    );
    expect(
      hits.length,
      "the open manifest sat over a station's prose and the overlap probe " +
        "reported nothing — the probe is broken, not the page"
    ).toBeGreaterThan(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   G9 · tap targets, WCAG 2.5.8

   On the pre-redesign build 26 of the phone's interactive elements had a hit
   rect under 24×24, the address among them at 166×15: a 15px-tall target for
   the single most important action on the page.

   The box is `getBoundingClientRect`, which includes padding and border — the
   fix P7 specifies is padding, not type size, and a gate that measured the
   text would call the fix a no-op. `g.tracebtn` is in scope because the run
   gives it `role="button"` and `tabindex="0"`; its rect is the union of its
   transparent hit rect and its label, which is exactly the target a thumb
   gets.
   ══════════════════════════════════════════════════════════════════════ */
const TAP_MIN = 24;
const INTERACTIVE = "a, button, [role=button], [tabindex]";

const TAP_PROBE = ([sel, min]: [string, number]) => {
  const out: { sel: string; text: string; w: number; h: number }[] = [];
  for (const el of document.querySelectorAll(sel)) {
    if (window.__gate.effOpacity(el) <= 0.05) continue;
    const b = el.getBoundingClientRect();
    /* not laid out at all — a collapsed station's controls, not a target */
    if (b.width < 1 && b.height < 1) continue;
    if (getComputedStyle(el).pointerEvents === "none") continue;
    if (b.width >= min && b.height >= min) continue;
    out.push({
      sel: window.__gate.sel(el),
      text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40),
      w: Math.round(b.width * 10) / 10,
      h: Math.round(b.height * 10) / 10,
    });
  }
  return out;
};

test.describe("G9 · no tap target under 24×24 on the phone", () => {
  test("at 390", async ({ browser, baseURL }, testInfo) => {
    testInfo.setTimeout(240_000);
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
      baseURL,
    });
    const p = await ctx.newPage();
    await installProbes(p);
    await arrive(p);

    const small = new Map<string, string>();
    let seen = 0;
    const steps = await stepPage(
      p,
      844,
      async () => ({
        small: await p.evaluate(TAP_PROBE, [INTERACTIVE, TAP_MIN] as [
          string,
          number,
        ]),
        n: await p.evaluate(
          (s) => document.querySelectorAll(s).length,
          INTERACTIVE
        ),
      }),
      ({ small: bad, n }) => {
        seen = Math.max(seen, n);
        for (const b of bad)
          small.set(
            `${b.sel}|${b.text}`,
            `${b.w}×${b.h}  ${b.sel}  "${b.text}"`
          );
      }
    );
    await ctx.close();

    expect(steps, "the page was stepped").toBeGreaterThan(8);
    expect(
      seen,
      "interactive elements were found at all — the run carries dozens"
    ).toBeGreaterThan(20);
    expect(
      [...small.values()],
      `interactive targets under ${TAP_MIN}×${TAP_MIN} at 390 (WCAG 2.5.8). ` +
        "The fix is padding on the target, not a bigger type size."
    ).toEqual([]);
  });

  test("positive control: a shrunken target is caught", async ({
    browser,
    baseURL,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
      baseURL,
    });
    const p = await ctx.newPage();
    await installProbes(p);
    await arrive(p);
    await p.addStyleTag({
      content:
        "#mtoggle{padding:0 !important; min-height:0 !important; height:14px !important; line-height:14px !important; display:inline-block !important}",
    });
    await p.waitForTimeout(400);
    const bad = await p.evaluate(TAP_PROBE, [INTERACTIVE, TAP_MIN] as [
      string,
      number,
    ]);
    await ctx.close();
    expect(
      bad.map((b) => `${b.sel} ${b.w}×${b.h}`).join(", "),
      "the tap-target probe did not see a 14px-tall control"
    ).toContain("#mtoggle");
  });
});
