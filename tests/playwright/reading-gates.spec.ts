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
  { sel: "#mcount", why: "which stop of twelve, as a position" },
  { sel: "#mpeek i", why: "the run's closing time, in the first-scroll hint" },
  { sel: "#manifest .mt", why: "each stop's departure time in the timetable" },
  { sel: "#manifest .foot i", why: "the run's closing time" },
  { sel: ".ladder", why: "the gate timetable: each stop's departure time" },
  { sel: ".approvebar .lt", why: "the last stop's own departure time, 22:41" },
  { sel: ".figsvg text", why: "figure labels — annotation on a drawing" },
  { sel: "#net text", why: "the network figure's layer and class labels" },
  { sel: "#netwrap .verdictline", why: "the classifier's live readout" },
  { sel: ".bench .brow span", why: "a benchmark lane, its value and unit" },
  /* `#gatesFig .gname` and `#gatesFig .gtail span` were listed here until
     round 4. Fig. 10's gate names are now set in the text face — a
     thirty-character name did not fit a mono column at 230px — and its
     unsigned tail is an italic word on the drawing, not a mono label. Both
     entries are REMOVED rather than left standing: an allowlist entry
     nothing uses is an entry nobody is watching, and if either goes back to
     mono this gate should say so. */
  { sel: "#gatesFig .gword", why: "the gate register: its verdict, stamped" },
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

/** the manifest's rect vs every line box of main content, at this scroll stop.
 *
 *  `#mpeek` is measured as part of the manifest, deliberately. It is the
 *  one-time hint that appears on the reader's first scroll, it is the only
 *  piece of the manifest that shows itself UNINVITED, and so it is the piece
 *  this gate is most about. The open panel may cover prose — the positive
 *  control below depends on it — because the reader asked for it. Nothing
 *  that arrives on its own may. The two rects are tested SEPARATELY and the
 *  hits concatenated — their union would be a bounding box enclosing the gap
 *  between them, and a line of prose sitting in that gap touches neither. */
const MANIFEST_PROBE = () => {
  const panels: { el: Element; r: DOMRect }[] = [];
  for (const id of ["manifest", "mpeek"]) {
    const e = document.getElementById(id);
    if (!e) continue;
    const cs = getComputedStyle(e);
    if (window.__gate.effOpacity(e) <= 0.05) continue;
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    panels.push({ el: e, r });
  }
  if (!panels.length) return { visible: false, hits: [] as string[] };
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
    if (panels.some((p) => p.el.contains(el))) continue;
    if (window.__gate.effOpacity(el) <= 0.05) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    let hit = "";
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      /* 1px of tolerance: a line box that merely abuts the panel is not
         covered by it. */
      for (const { el: pe, r: m } of panels) {
        if (
          r.left < m.right - 1 &&
          r.right > m.left + 1 &&
          r.top < m.bottom - 1 &&
          r.bottom > m.top + 1
        ) {
          hit = `#${pe.id} over ${window.__gate.sel(el)}  "${text.slice(0, 60)}"`;
          break;
        }
      }
      if (hit) break;
    }
    if (hit) hits.push(hit);
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

  /* THE PEEK, WHICH IS THE PART OF THE MANIFEST THAT ARRIVES UNINVITED.

     This used to say the sweep above never raises the peek, so these three
     tests were the only ones that could see it. That was wrong, and the
     round-6 regression is what proved it: stepPage's FIRST teleport is
     h/2 — 491, 450, 400, 384 at 1512, 1440, 1280, 1024 — which is a
     qualifying scroll inside one viewport, and the peek came up on it and
     landed on the nameplate at 1280 and 1024. The sweep caught it; the
     wheel tests below did not, because 130px never reaches the band where
     the name passes through the corner.

     Both still run, and they no longer see the same thing. Measured at
     HEAD, the sweep now raises the peek at y=491 (1512), y=450 (1440),
     y=800 (1280) and y=768 (1024): at the two narrow widths the first
     teleport is covered and refused, and the second lands on exactly
     `scrollY === innerHeight`, which the retire rule admits by one pixel.
     So at 1280 and 1024 the sweep's sight of the peek hangs on a boundary,
     and the wheel tests below are the ones that raise it reliably. Keep
     both. They drive it the way a reader does: one short wheel from the
     top. */
  for (const w of [1512, 1440, 1280]) {
    test(`the first-scroll peek covers no text at ${w}`, async ({
      browser,
      baseURL,
    }, testInfo) => {
      testInfo.setTimeout(120_000);
      const h = w >= 1512 ? 982 : w >= 1440 ? 900 : 800;
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        deviceScaleFactor: 1,
        baseURL,
      });
      const p = await ctx.newPage();
      await installProbes(p);
      await arrive(p);
      await p.mouse.wheel(0, 130);
      await p.waitForTimeout(600);

      const shown = await p.evaluate(() =>
        document.getElementById("mpeek")?.classList.contains("on")
      );
      const { visible, hits } = await p.evaluate(MANIFEST_PROBE);
      await ctx.close();

      expect(shown, "the peek never appeared — this test proves nothing").toBe(
        true
      );
      expect(visible, "the probe saw no chrome at all").toBe(true);
      expect(
        hits,
        `the first-scroll peek covers main-content text at ${w}`
      ).toEqual([]);
    });
  }

  /* ITS CONTROL. The three tests above assert an empty array, which is also
     what a probe that cannot see #mpeek returns. Moving the peek onto the
     reading column is the only thing that tells those two apart, and it is
     the specific failure the union-versus-separate change above was about:
     a bounding box of #manifest and #mpeek would enclose the gap between
     them and could report a hit for either one. */
  test("positive control: the peek moved over prose is detected", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.setViewportSize({ width: 1512, height: 982 });
    await installProbes(page);
    await arrive(page);
    await page.mouse.wheel(0, 130);
    await page.waitForTimeout(600);
    /* DERIVED FROM A MEASURED RECT, NOT FROM 40%/50%. Those two literals
       were a description of where the reading column happened to be when
       this control was written. At HEAD they land in the gap between the
       nameplate and the epigraph — measured, the old placement puts the
       peek at [605,491,777,522] and the probe returns zero hits — so the
       control went RED, and it went red for a reason that has nothing to
       do with the thing it exists to prove. A control that fails because
       its own coordinates drifted is worse than no control: the next
       person reads a red G4 as a page defect and goes looking in the page.
       Place the peek on the first nameplate character that is actually on
       screen instead, 4px inside its left edge and centred on its height —
       the target moves with the page, so the control moves with it. */
    const target = await page.evaluate(() => {
      const e = document.getElementById("mpeek")!;
      const ch = [...document.querySelectorAll("h1.nameplate span.np-ch")].find(
        (s) => window.__gate.effOpacity(s) > 0.05
      );
      if (!ch) return null;
      const q = ch.getBoundingClientRect();
      e.style.setProperty("left", `${Math.round(q.left + 4)}px`, "important");
      e.style.setProperty("right", "auto", "important");
      e.style.setProperty(
        "top",
        `${Math.round(q.top + q.height / 2)}px`,
        "important"
      );
      return { text: ch.textContent, box: [q.left, q.top, q.right, q.bottom] };
    });
    expect(
      target,
      "no nameplate character was legible — the control had nothing to sit on"
    ).not.toBeNull();
    await page.waitForTimeout(300);

    const { visible, hits } = await page.evaluate(MANIFEST_PROBE);
    expect(visible, "the peek was not on screen — the control never ran").toBe(
      true
    );
    expect(
      hits.length,
      "the peek was moved onto the nameplate and the probe reported " +
        "nothing — the probe is broken, not the page"
    ).toBeGreaterThan(0);
    expect(hits.join(" "), "the hit was not attributed to #mpeek").toContain(
      "#mpeek"
    );
  });

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

/* ══════════════════════════════════════════════════════════════════════
   G10 · the Mac rail is never less smooth than the one the owner signed off

   2026-09-23. The clarity build shortened every station and the rail's
   swings got steeper and visibly segmented ("has segments that feel
   connected instead of smooth curve"), and a dip ghosted it under text
   ("don't mess with the opacity for the rail"). Gate H stayed green through
   both, because it measured screens and words, not the line. So the line
   itself is measured here, against CEILINGS TAKEN FROM THE PRE-REDESIGN
   BUILD (sha b6ea15df, main 035ab9b) at 1512×982, read the same way:
     max |dx/dy|                        1.58
     max heading change over 24px arc   24.1°
     max heading change, 2px chords     16.2°   (a corner, not a curve)
   and the thread canvas composites only source-over: nothing erases the
   line where it passes text.
   ══════════════════════════════════════════════════════════════════════ */
const RAIL_WIDTHS: [number, number][] = [
  [1512, 982],
  [1440, 900],
  /* 1375×800 joined the set with round 4's ending: it is the narrowest seat
     that still lays the gate out in two columns, so it is where the corridor
     into ¶12 swings furthest (about 43px) and where the ceilings are closest
     to being reached. Measured there at the time it was added: slope 1.55,
     bend24 19.6, kink2 4.3. */
  [1375, 800],
  [1280, 800],
  /* 1456×949 is the seat the owner actually reads the page at, and until
     round 14 no rail gate measured it. It joins the set with the route
     through figs. 10 and 11, because that route's widest swing — ¶10's spine
     to the dock — is a function of where `beat-inner` caps, and 1456 is the
     first width where the cap and the viewport disagree by a whole column. */
  [1456, 949],
];
const RAIL_CEIL = { maxSlope: 1.58, bend24: 24.1, kink2: 16.2 };

async function railShape(page: Page) {
  return page.evaluate(() => {
    const s = (
      window as unknown as {
        __rail: () => { x: number; y: number; L: number }[];
      }
    ).__rail();
    let maxSlope = 0;
    for (let i = 1; i < s.length; i++) {
      const dy = s[i].y - s[i - 1].y;
      if (dy > 0)
        maxSlope = Math.max(maxSlope, Math.abs((s[i].x - s[i - 1].x) / dy));
    }
    const pts: [number, number][] = [];
    let j = 0;
    for (let L = 0; L <= s[s.length - 1].L; L += 2) {
      while (j < s.length - 2 && s[j + 1].L < L) j++;
      const a = s[j],
        c = s[j + 1],
        t = c.L > a.L ? (L - a.L) / (c.L - a.L) : 0;
      pts.push([a.x + (c.x - a.x) * t, a.y + (c.y - a.y) * t]);
    }
    const hd = (i: number) =>
      Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]);
    const turn = (a: number, b: number) => {
      const d = (Math.abs(a - b) * 180) / Math.PI;
      return d > 180 ? 360 - d : d;
    };
    let bend24 = 0,
      kink2 = 0;
    for (let i = 0; i + 13 < pts.length; i += 2)
      bend24 = Math.max(bend24, turn(hd(i + 12), hd(i)));
    for (let i = 0; i + 2 < pts.length; i++)
      kink2 = Math.max(kink2, turn(hd(i + 1), hd(i)));
    return { n: s.length, maxSlope, bend24, kink2 };
  });
}

/* every composite op ever set on the thread canvas's context */
async function watchComposite(page: Page) {
  await page.addInitScript(() => {
    const seen = new Set<string>();
    (window as unknown as { __compositeOps: Set<string> }).__compositeOps =
      seen;
    const d = Object.getOwnPropertyDescriptor(
      CanvasRenderingContext2D.prototype,
      "globalCompositeOperation"
    )!;
    Object.defineProperty(
      CanvasRenderingContext2D.prototype,
      "globalCompositeOperation",
      {
        get() {
          return d.get!.call(this);
        },
        set(v: string) {
          if ((this as CanvasRenderingContext2D).canvas?.id === "thread")
            seen.add(v);
          d.set!.call(this, v);
        },
      }
    );
  });
}

async function railRun(page: Page) {
  const doc = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < doc; y += 600) {
    await page.evaluate(
      (yy) => window.scrollTo({ top: yy, behavior: "instant" }),
      y
    );
    await page.waitForTimeout(60);
  }
  return page.evaluate(() => [
    ...(window as unknown as { __compositeOps: Set<string> }).__compositeOps,
  ]);
}

test.describe("G10 · the Mac rail stays as smooth and as solid as it was", () => {
  for (const [w, h] of RAIL_WIDTHS) {
    test(`at ${w}`, async ({ page }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: w, height: h });
      await watchComposite(page);
      await arrive(page);
      const r = await railShape(page);
      expect(r.n, "the rail was sampled").toBeGreaterThan(200);
      expect(r.maxSlope, `steepest swing at ${w}`).toBeLessThanOrEqual(
        RAIL_CEIL.maxSlope
      );
      expect(r.bend24, `tightest bend at ${w}`).toBeLessThanOrEqual(
        RAIL_CEIL.bend24
      );
      expect(r.kink2, `sharpest corner at ${w}`).toBeLessThanOrEqual(
        RAIL_CEIL.kink2
      );
      const ops = await railRun(page);
      expect(
        ops.filter((o) => o !== "source-over"),
        "the thread canvas erased part of the line"
      ).toEqual([]);
    });
  }

  /* THE CONTROLS. A ceiling nothing can reach and an op watcher that sees
     nothing both read green; these break the page on purpose. Coarse 40px
     chords are the segmented rail; a destination-out in drawThread is the dip. */
  test("positive control: a segmented rail is caught", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.setViewportSize({ width: 1512, height: 982 });
    await page.route(
      (u) => new URL(u).pathname === "/",
      async (route) => {
        const res = await route.fetch();
        const body = (await res.text()).replace(
          "const STEP = 4;",
          "const STEP = 60;"
        );
        await route.fulfill({ response: res, body });
      }
    );
    await arrive(page);
    const r = await railShape(page);
    expect(r.kink2, "60px chords must read as corners").toBeGreaterThan(
      RAIL_CEIL.kink2
    );
  });
  test("positive control: a line erased under text is caught", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.setViewportSize({ width: 1512, height: 982 });
    await watchComposite(page);
    await page.route(
      (u) => new URL(u).pathname === "/",
      async (route) => {
        const res = await route.fetch();
        const body = (await res.text()).replace(
          "  drawTokenAndTravellers(scroll, tokenY, tokenL, halted);\n}",
          "  drawTokenAndTravellers(scroll, tokenY, tokenL, halted);\n  tctx.save(); tctx.globalCompositeOperation = 'destination-out'; tctx.fillRect(0, 0, 40, 40); tctx.restore();\n}"
        );
        await route.fulfill({ response: res, body });
      }
    );
    await arrive(page);
    expect(await railRun(page)).toContain("destination-out");
  });
});

/* ══════════════════════════════════════════════════════════════════════
   G10b · the rail ends ON the socket, and it never touches the timetable

   G10 measures the line's SHAPE and would stay green if the whole rail
   moved 40px left, or if it stopped 30px short of the mark it is drawn to,
   or if it ran straight down a column of type. Round 4 put the terminus
   inside the timetable's own lane, so all three became possible in one
   change, and all three are things the owner judges by eye and I cannot.

   The four claims:
     · the last 40px of the line are the socket's x, to within half a pixel
       (the wobble is tapered to zero there by `steady`, and LOCK is that
       stretch. The spec asked for 96px; 96 is where the TAPER begins, and
       between 96 and 40 the line is still wandering by design, which is
       what makes it look drawn. 40 is the part that is actually straight.)
     · the last sample is the socket's centre
     · nothing carries on past it (measured: the line's own y comes from
       layout and the socket's from a client rect, so the two agree to about
       a pixel and the guard is set at 1.5 rather than 0)
     · no sample comes within 16px of any word in the timetable

   The control injects the old behaviour — beat 11's x taken from stx as a
   percentage of the viewport instead of from the dock — and the lane
   assertion has to go red, because 24% of 1512 lands the envelope inside
   the stop-name column.
   ══════════════════════════════════════════════════════════════════════ */
const RAIL_LANE_MIN = 16; /* px · envelope to any timetable word */

async function railTerminus(page: Page) {
  return page.evaluate(() => {
    const s = (
      window as unknown as {
        __rail: () => { x: number; y: number; L: number }[];
      }
    ).__rail();
    const sq = document.querySelector("#gateDock i")!.getBoundingClientRect();
    const cx = sq.left + sq.width / 2;
    const cy = sq.top + window.scrollY + sq.height / 2;
    let lock = 0,
      beyond = 0;
    for (const p of s) {
      if (p.y > cy - 40) lock = Math.max(lock, Math.abs(p.x - cx));
      /* 1.5px, for the same reason the y assertion below carries it: the
         line's terminus is a layout measurement and the socket's centre is a
         client rect, and at 1512 they disagree by 0.94px on a square whose
         height is an odd number of device pixels. Anything that overruns the
         dock overruns it by the length of a sample step, which is 4. */
      if (p.y > cy + 1.5) beyond++;
    }
    /* the lane: every word in the timetable against every sample that shares
       its band of the page. Boxes, not glyph runs — a box is the conservative
       reading and the grid's columns are what the lane was measured against. */
    let nearest = Infinity;
    let who = "";
    for (const el of document.querySelectorAll(".ladder li > span")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !(el.textContent || "").trim()) continue;
      const a = r.top + window.scrollY - 4;
      const b = r.bottom + window.scrollY + 4;
      for (const p of s) {
        if (p.y < a || p.y > b) continue;
        const dx =
          p.x < r.left ? r.left - p.x : p.x > r.right ? p.x - r.right : 0;
        if (dx < nearest) {
          nearest = dx;
          who = (el.textContent || "").trim().slice(0, 24);
        }
      }
    }
    const last = s[s.length - 1];
    return {
      cx,
      cy,
      lastX: last.x,
      lastY: last.y,
      lock,
      beyond,
      nearest: nearest === Infinity ? -1 : nearest,
      who,
      n: s.length,
    };
  });
}

test.describe("G10b · the rail docks, and it keeps out of the timetable", () => {
  for (const [w, h] of RAIL_WIDTHS) {
    test(`at ${w}`, async ({ page }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: w, height: h });
      await arrive(page);
      const r = await railTerminus(page);
      expect(r.n, "the rail was sampled").toBeGreaterThan(200);
      expect(
        r.lock,
        `the last 40px hold the socket's x at ${w}`
      ).toBeLessThanOrEqual(0.5);
      expect(
        Math.abs(r.lastX - r.cx),
        `the last sample's x is the socket's at ${w}`
      ).toBeLessThanOrEqual(0.5);
      /* 1.5, not 0.5, and the difference is a measurement and not a slack:
         the rail's y comes from absTop (layout) and the socket's from a
         client rect, and the two round subpixel heights differently. */
      expect(
        Math.abs(r.lastY - r.cy),
        `the last sample's y is the socket's at ${w}`
      ).toBeLessThanOrEqual(1.5);
      expect(r.beyond, `nothing is drawn past the socket at ${w}`).toBe(0);
      expect(
        r.nearest,
        `the rail's nearest approach to "${r.who}" at ${w}`
      ).toBeGreaterThanOrEqual(RAIL_LANE_MIN);
    });
  }

  test("positive control: a rail that ignores the dock is caught", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.setViewportSize({ width: 1512, height: 982 });
    /* the pre-round-4 behaviour: beat 11's x is stx[11] percent of the
       viewport, and the final two anchors still snap to the dock — so the
       line arrives in the right place having crossed the wrong column.
       ROUND 14 MOVED THE TARGET. `beatX` is now two functions: the phone's
       single lane, and `deskX`, which answers dockX for ¶11 and ¶12 and fig.
       10's own plate left for ¶10. Injecting the percentage over `deskX(i)`
       reproduces the same defect — every beat back on stx, including the two
       that now ride measurements — and it is one line, so a later reformat of
       `deskX` cannot silently stop matching.
       WHETHER IT MATCHED IS ASSERTED, and outside the handler: a replace that
       finds nothing fulfils the UNMODIFIED page, the control passes, and a
       positive control that passes is the gate reporting that it works. An
       `expect` thrown inside a route handler surfaces as a navigation that
       never resolves, which names the wrong defect. */
    const TARGET = "mobile ? RAIL_X_MOBILE : deskX(i)";
    let injected = false;
    await page.route(
      (u) => new URL(u).pathname === "/",
      async (route) => {
        const res = await route.fetch();
        const src = await res.text();
        injected = src.includes(TARGET);
        await route.fulfill({
          response: res,
          body: src.replace(
            TARGET,
            "mobile ? RAIL_X_MOBILE : (stx[i] / 100) * vw"
          ),
        });
      }
    );
    await arrive(page);
    expect(
      injected,
      `the control's injection point "${TARGET}" is still in the run — if buildThread's ` +
        `beatX was rewritten, this control silently serves the real page and proves nothing`
    ).toBe(true);
    const r = await railTerminus(page);
    expect(
      r.nearest,
      "a rail down the stop-name column must be caught"
    ).toBeLessThan(RAIL_LANE_MIN);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   G10c · THE LINE DOES NOT STRIKE THROUGH THE NOTES.

   The owner's round-2 ruling, made a number. Round 14 runs the day's rail
   down both night plates, so for the first time the line and the words share
   a column, and the distance between them is the whole question. Round 15
   added ¶08, where he found the line inside the words rather than beside
   them.

   IT IS NOT A WHOLE-PAGE GATE, and the omission is deliberate rather than
   unfinished. Measured on ink at these eight seats, the rail strikes the
   prose of every station from ¶02 to ¶09, because each hold is a percentage
   of the viewport while every column is half of a 1180px cap. The three
   stations here are the three whose hold was MOVED off the words and can
   therefore hold a floor; asserting the floor at the other six would assert
   that the page has a different design, since the only x's clear of both
   columns are a 72px gutter and the outer margin, and putting every station
   in one of them either flattens the sweep from 533px to 140 or takes the
   whole rail past its slope ceiling. The full table is in buildThread's
   round-15 erratum.

   MEASURED ON INK, NOT ON BOXES, and that is main's ruling after both were
   measured. A paragraph's box runs to the column's edge; its last line does
   not. At 779098b's successor the box reading put seven of eight two-column
   seats under the floor on pages a reader would call clean — the rail sitting
   in the right margin, past the end of every line — while the ink reading
   found the one seat where it genuinely crossed the words. A gate that fires
   on the right answer is worse than the honest gap. So: one rect per line
   box, from `Range.getClientRects()` over every text node a `TreeWalker`
   finds, and the minimum distance from any of them to any rail sample.

   TRANSFORMS ARE NEUTRALISED AND THE NEUTRALISATION IS ASSERTED. `__rail()`
   lives in layout space; a client rect plus scrollY only equals layout space
   if nothing above the node carries a transform, and both stations' prose and
   plates carry entrance transforms. The residual count is checked to be 0, so
   a stylesheet that stopped taking cannot quietly move every number.

   TWO-COLUMN SEATS ONLY, and that is not a convenience: below 1250 the
   stations stack, the rail necessarily shares the single column, and the
   floor is unsatisfiable by construction. The stacked seats read 0 and always
   will; asserting there would be asserting that the design is different.
   ══════════════════════════════════════════════════════════════════════════ */
const G10C_SEATS: [number, number][] = [
  [1512, 982],
  [1456, 949],
  [1440, 900],
  [1375, 800],
  [1366, 768],
  [1280, 800],
  [1280, 720],
  [1250, 800],
];
const G10C_FLOOR = 16; /* px · the same envelope G10b holds at the timetable */
/* [selector, fewest line boxes it must yield, what its text must begin with]
   The floor is a guard against an EMPTY walk, not a count of the lines a
   container holds: 2 for the prose and the plates (a redraw that moved a
   row's words into the svg would empty it), 1 for a caption. It does not
   notice a container losing most of its ink; the text pin and the
   positive control below are what bind the captions. The pin exists
   because `querySelector` takes the first match, and "#cosigners figure
   figcaption" first matched a quote's attribution at 480px while fig. 11's
   own caption sat at 31px, unread. */
const G10C_BOXES: [string, number, RegExp | null][] = [
  /* ¶08 joined in round 15. The owner read the line through its heading and
     down its italic paragraph at 1440×900; `stx[7]` was 33% of the viewport
     against a column capped at 1180, so the hold stood 135px inside the
     words. The heading is its own entry rather than part of the prose walk so
     a failure names which of the two it is — the display line and the body
     fail for different reasons and take different fixes. */
  ["#lifequest .prose", 2, null],
  ["#lifequest h2", 1, /^LifeQuest/],
  ["#review .prose", 2, null],
  ["#cosigners .prose", 2, null],
  ["#gatesFig", 2, null],
  ["#signsFig", 2, null],
  ["#review figure.plate > figcaption", 1, /^fig\. 10 /],
  ["#cosigners figure.plate > figcaption", 1, /^fig\. 11 /],
];
const G10C_SELS = G10C_BOXES.map(([sel]) => sel);

async function inkClearance(page: Page, selectors: string[]) {
  return page.evaluate((sels) => {
    const st = document.createElement("style");
    st.textContent =
      "#lifequest,#lifequest *,#review,#review *,#cosigners,#cosigners *" +
      "{transform:none !important}";
    document.head.appendChild(st);
    const dirty = [
      ...document.querySelectorAll("#lifequest *,#review *,#cosigners *"),
    ].filter((e) => {
      const t = getComputedStyle(e).transform;
      return t && t !== "none";
    }).length;
    const rail = (
      window as unknown as { __rail: () => { x: number; y: number }[] }
    ).__rail();
    const out = sels.map((sel) => {
      const host = document.querySelector(sel);
      if (!host)
        return {
          sel,
          found: false,
          text: "",
          nodes: 0,
          rects: 0,
          min: -1,
          worst: "",
        };
      const tw = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      for (let n = tw.nextNode(); n; n = tw.nextNode())
        if (n.textContent && n.textContent.trim()) nodes.push(n as Text);
      let min = Infinity,
        worst = "",
        rects = 0;
      for (const n of nodes) {
        const r = document.createRange();
        r.selectNodeContents(n);
        for (const lr of r.getClientRects()) {
          if (!lr.width || !lr.height) continue;
          rects++;
          const L = lr.left,
            R = lr.right,
            T = lr.top + scrollY,
            B = lr.bottom + scrollY;
          for (const p of rail) {
            const dx = p.x < L ? L - p.x : p.x > R ? p.x - R : 0;
            const dy = p.y < T ? T - p.y : p.y > B ? p.y - B : 0;
            const d = Math.hypot(dx, dy);
            if (d < min) {
              min = d;
              worst = (n.textContent || "").trim().slice(0, 34);
            }
          }
        }
      }
      return {
        sel,
        found: true,
        text: (host.textContent || "").trim().slice(0, 40),
        nodes: nodes.length,
        rects,
        min: min === Infinity ? -1 : +min.toFixed(2),
        worst,
      };
    });
    st.remove();
    return { dirty, out };
  }, selectors);
}

test.describe("G10c · the rail keeps clear of every line of ink it passes", () => {
  for (const [w, h] of G10C_SEATS) {
    test(`${w}x${h}: no rail sample within ${G10C_FLOOR}px of ¶08's, ¶10's or ¶11's ink`, async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: w, height: h });
      await arrive(page);
      const { dirty, out } = await inkClearance(page, G10C_SELS);
      expect(
        dirty,
        "the transform override took: a residual matrix means every rect below is in the wrong space"
      ).toBe(0);
      for (const [i, r] of out.entries()) {
        const [, fewest, starts] = G10C_BOXES[i];
        expect(r.found, `${r.sel} exists at ${w}`).toBe(true);
        if (starts)
          expect(r.text, `${r.sel} is the element it names`).toMatch(starts);
        /* A CONTAINER THAT YIELDS NO LINE BOXES IS A GATE THAT CANNOT FAIL.
           Both plates build their line work in an svg with no text in it, so
           a redraw that moved a row's words into the drawing would empty this
           walk and pass. The floor is the plate's own smallest reading: two
           lines for ¶11's two names, four for ¶10's three rows plus its
           close. */
        expect(
          r.rects,
          `${r.sel} yields line boxes to measure at ${w} (${r.nodes} text nodes)`
        ).toBeGreaterThanOrEqual(fewest);
        expect(
          r.min,
          `the rail's nearest approach to "${r.worst}" in ${r.sel} at ${w}x${h}`
        ).toBeGreaterThanOrEqual(G10C_FLOOR);
      }
    });
  }
});

test("G10c control · a caption pushed onto the rail is read, and fails", async ({
  page,
}, testInfo) => {
  /* The two caption entries were added after the plates, and the first
     version of them measured the wrong element and could not fail. This
     moves fig. 11's own caption onto the line (a `left` offset, not a
     transform, since inkClearance strips transforms) and asserts that the
     gate's measurement of THAT element falls under the floor. */
  testInfo.setTimeout(120_000);
  await page.setViewportSize({ width: 1456, height: 949 });
  await arrive(page);
  await page.addStyleTag({
    content:
      "#cosigners figure.plate > figcaption{position:relative; left:-240px}",
  });
  const { out } = await inkClearance(page, [
    "#cosigners figure.plate > figcaption",
  ]);
  expect(out[0].text).toMatch(/^fig\. 11 /);
  expect(
    out[0].min,
    "fig. 11's caption, moved onto the rail, reads under the floor"
  ).toBeLessThan(G10C_FLOOR);
});

/* ══════════════════════════════════════════════════════════════════════════
   G10d · EVERY JUNCTION STUB REACHES THE LINE IT CLAIMS TO JOIN.

   Both night plates hang their tracks off the rail, and the rail wobbles:
   the hand's two sines put it up to 1.5 x amp either side of the anchor, so a
   stub drawn at the spine instead of at the measured x misses the line by up
   to 24px and the figure reads as three tracks floating beside it.

   THE RAIL'S X IS RECOMPUTED HERE, from `__rail()` at the stub's own y, and
   compared to the DRAWN path. It is deliberately not read from
   `window.__world.junctions`: that record is what `seatFigures` believed, and
   a gate that checks a belief against itself passes when the seating pass is
   skipped entirely. The stub's y comes from the drawn line too, for the same
   reason.

   THE COUNT IS ASSERTED FIRST. Three stubs in fig. 10 and two in fig. 11; a
   seating pass that did nothing leaves zero, and zero stubs all agree with
   the rail vacuously.
   ══════════════════════════════════════════════════════════════════════════ */
test.describe("G10d · the junction stubs land on the rail", () => {
  for (const [w, h] of G10C_SEATS.slice(0, 4)) {
    test(`${w}x${h}: 3 + 2 stubs, each within 0.5px of the rail at its own y`, async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: w, height: h });
      await arrive(page);
      const r = await page.evaluate(() => {
        const rail = (
          window as unknown as { __rail: () => { x: number; y: number }[] }
        ).__rail();
        const xAt = (y: number) => {
          if (y <= rail[0].y) return rail[0].x;
          if (y >= rail[rail.length - 1].y) return rail[rail.length - 1].x;
          let lo = 0,
            hi = rail.length - 1;
          while (hi - lo > 1) {
            const m = (lo + hi) >> 1;
            if (rail[m].y <= y) lo = m;
            else hi = m;
          }
          const a = rail[lo],
            b = rail[lo + 1];
          const t = b.y > a.y ? (y - a.y) / (b.y - a.y) : 0;
          return a.x + (b.x - a.x) * t;
        };
        const read = (host: string) =>
          [
            ...document.querySelectorAll<SVGPathElement>(`#${host} [data-j]`),
          ].map((p) => {
            const svg = p.ownerSVGElement!;
            const box = svg.getBoundingClientRect();
            /* the drawn path's own first point, in page space */
            const m = (p.getAttribute("d") || "").match(
              /M(-?[\d.]+) (-?[\d.]+)/
            );
            const x = box.left + scrollX + parseFloat(m?.[1] ?? "NaN");
            const y = box.top + scrollY + parseFloat(m?.[2] ?? "NaN");
            return { x, y, railX: xAt(y), gap: Math.abs(x - xAt(y)) };
          });
        return { g: read("gatesFig"), s: read("signsFig") };
      });
      expect(r.g.length, `fig. 10 draws one stub per row at ${w}`).toBe(3);
      expect(r.s.length, `fig. 11 draws one stub per branch at ${w}`).toBe(2);
      for (const [fig, list] of [
        ["10", r.g],
        ["11", r.s],
      ] as const)
        list.forEach((j, i) => {
          expect(
            j.gap,
            `fig. ${fig} junction ${i} at ${w}: stub starts at x ${j.x.toFixed(2)}, the rail is at ${j.railX.toFixed(2)}`
          ).toBeLessThanOrEqual(0.5);
        });
    });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   THE CONTROLS FOR G10c AND G10d.

   Each one puts back a defect the round actually had and asserts the gate
   sees it. They inject through `page.route`, which is the pattern G10b's own
   control uses: the served `out/` is never edited, so a control can never
   leave the owner's preview broken — the failure mode
   `never-break-the-served-artifact` records. Every one asserts its injection
   point was FOUND before drawing a conclusion, because a replace that matches
   nothing fulfils the real page and a control that passes on the real page is
   a control reporting that it works.
   ══════════════════════════════════════════════════════════════════════════ */
/* One handler, N edits, each reporting whether it matched. Two `page.route`
   calls would NOT compose: handlers stack, and the later one re-fetches the
   pristine document, so the earlier edit is thrown away. */
async function inject(page: Page, edits: [string, string][]) {
  const marks = edits.map(() => ({ hit: false }));
  await page.route(
    (u) => new URL(u).pathname === "/",
    async (route) => {
      const res = await route.fetch();
      let src = await res.text();
      edits.forEach(([from, to], i) => {
        marks[i].hit = src.includes(from);
        src = src.replace(from, to);
      });
      await route.fulfill({ response: res, body: src });
    }
  );
  return marks;
}

test.describe("G10c / G10d · positive controls", () => {
  test("control: the round-13 tail puts the rail back in ¶10's paragraph", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    /* 1375x800 and not his own seat: the clearance is not monotonic in width
       and this is where the measured minimum was 10.47px.

       BOTH MEASUREMENTS ARE REVERTED, and that is not belt and braces — it is
       what the red was measured on. Put back one at a time and 1375x800 is
       green either way: the waypoint alone reads 49.76px and ¶11's
       blockquote-derived hold alone reads 26.63px, because a later hold makes
       the corridor longer and the line is further right when it passes the
       paragraph's foot. Revert both and it is 10.47px again, to the hundredth
       of labrat's own reading of the same geometry. The two do different
       work: the waypoint clears the words, the hold buys back the corridor
       length that clearing them would otherwise cost. */
    await page.setViewportSize({ width: 1375, height: 800 });
    const VIA = "if (i !== 9 || stacked || !prose10) return null;";
    const HOLD = "return i === 10 && !stacked && lead11";
    const marks = await inject(page, [
      [VIA, "if (i !== 9 || stacked || !prose10 || 1) return null;"],
      [HOLD, "return i === 10 && !stacked && !lead11"],
    ]);
    await arrive(page);
    expect(
      marks.every((m) => m.hit),
      `both injection points are still in the run: "${VIA}" / "${HOLD}"`
    ).toBe(true);
    const { out } = await inkClearance(page, ["#review .prose"]);
    expect(
      out[0].min,
      "a corridor that crosses the paragraph must be caught"
    ).toBeLessThan(G10C_FLOOR);
  });

  test("control: beat 9 back on the percentage table is caught", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.setViewportSize({ width: 1456, height: 949 });
    const TARGET = "i === 9 && !stacked && gatesPlate";
    const [mark] = await inject(page, [
      [TARGET, "i === 9 && !stacked && !gatesPlate"],
    ]);
    await arrive(page);
    expect(
      mark.hit,
      `deskX's fig. 10 branch "${TARGET}" is still in the run`
    ).toBe(true);
    /* ¶10'S PROSE, NOT THE DOCKET. At 30% of 1456 the rail is x 437, inside a
       prose column running 138 to 618 — which is `779098b`'s own geometry and
       where its clearance measured 0.00. The plate is then 230px away and
       reads perfectly clean, so asserting on #gatesFig would assert that the
       control does nothing. */
    const { out } = await inkClearance(page, ["#review .prose"]);
    expect(
      out[0].min,
      "a rail holding its column inside the paragraph must be caught"
    ).toBeLessThan(G10C_FLOOR);
  });

  test("control: beat 7 back on the percentage table is caught", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    /* 1440×900, because that is the seat the defect was reported at: the
       hold stood at x 475 in a column running 130..610 and the rail struck
       53 samples of the paragraph over 352px of descent, the heading 23 over
       59. Reverting the branch puts `(stx[7] / 100) * vw` back and with it
       exactly that geometry. Both entries are asserted, because the heading
       and the body are separate G10c rows and a fix that saved only one of
       them would otherwise read as a whole fix. */
    await page.setViewportSize({ width: 1440, height: 900 });
    const TARGET = "i === 7 && !stacked && prose8";
    const [mark] = await inject(page, [
      [TARGET, "i === 7 && !stacked && !prose8"],
    ]);
    await arrive(page);
    expect(mark.hit, `deskX's ¶08 branch "${TARGET}" is still in the run`).toBe(
      true
    );
    const { out } = await inkClearance(page, [
      "#lifequest .prose",
      "#lifequest h2",
    ]);
    expect(
      out[0].min,
      "a rail holding its column inside ¶08's paragraph must be caught"
    ).toBeLessThan(G10C_FLOOR);
    expect(
      out[1].min,
      "a rail through ¶08's display heading must be caught"
    ).toBeLessThan(G10C_FLOOR);
  });

  test("control: a seating pass that does nothing leaves no stubs", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.setViewportSize({ width: 1456, height: 949 });
    const TARGET = "function seatFigures() {";
    const [mark] = await inject(page, [
      [TARGET, "function seatFigures() { if (1) return;"],
    ]);
    await arrive(page);
    expect(mark.hit, `"${TARGET}" is still in the run`).toBe(true);
    const n = await page.evaluate(
      () =>
        document.querySelectorAll("#gatesFig [data-j], #signsFig [data-j]")
          .length
    );
    expect(
      n,
      "no seating means no stubs, and G10d's count is what sees it"
    ).toBe(0);
  });
});
