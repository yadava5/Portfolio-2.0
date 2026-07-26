/**
 * FIX ROUND 3 — the Nitpicking Viewer's report, verified.
 *
 * Shoots the AFTER frame for every finding the round touched, and
 * re-measures the numbers the viewer measured so the claims in
 * WAVE4-STATUS §FIX3 are evidence, not assertion.
 *
 * Serve the export first:
 *   NEXT_PUBLIC_BASE_PATH= npx next build --webpack
 *   PORT=3200 node tests/playwright/static-server.mjs
 * Then:
 *   node docs/design-lab/shoot-fix3-nitpick.mjs
 *
 * Writes docs/design-lab/shots-fix3-nitpick/{*.png, fix3-notes.json}.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-fix3-nitpick";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3200";

const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};

const browser = await chromium.launch();

/* ── B2 · the 9-width masthead sweep, 768 included ─────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const width of [640, 700, 768, 819, 820, 900, 1000, 1100, 1240, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const row = await page.evaluate(() => {
      const nav = document.querySelector("header nav");
      if (!nav) return null;
      const kids = Array.from(nav.children);
      /* Baselines: distinct rounded tops among the row's direct children
         and the nav list's items — >1 means the row wrapped. */
      const items = [
        ...kids,
        ...Array.from(nav.querySelectorAll("ul > li")),
      ].filter((el) => el.getBoundingClientRect().width > 0);
      const tops = new Set(
        items.map((el) => Math.round(el.getBoundingClientRect().top))
      );
      return {
        headerHeight: Math.round(
          document.querySelector("header").getBoundingClientRect().height
        ),
        navHeight: Math.round(nav.getBoundingClientRect().height),
        baselines: tops.size,
        visibleNavItems: Array.from(nav.querySelectorAll("ul > li"))
          .filter((li) => li.getBoundingClientRect().width > 0)
          .map((li) => li.textContent.trim()),
        mailChip: Boolean(
          document
            .querySelector('header a[href^="mailto:"]')
            ?.getBoundingClientRect().width
        ),
      };
    });
    note(`B2.header@${width}`, row);
    await page.screenshot({
      path: `${OUT}/after-header-${width}.png`,
      clip: { x: 0, y: 0, width, height: 120 },
    });
  }
  await ctx.close();
}

/* ── 320 → 2560 · no horizontal overflow anywhere ──────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const width of [320, 360, 390, 480, 640, 768, 820, 1024, 1280, 1440, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const overflow = await page.evaluate(() => {
      const offenders = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > window.innerWidth + 1) {
          offenders.push(
            `${el.tagName}.${String(el.className.baseVal ?? el.className ?? "").split(" ")[0].slice(0, 28)}`
          );
        }
        if (offenders.length > 6) break;
      }
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        offenders,
      };
    });
    note(`sweep.overflow@${width}`, overflow);
  }
  await ctx.close();
}

/* ── B1 · the 404, in the site's own clothes ───────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/no-such-page/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const shape = await page.evaluate(() => {
    const section = document.querySelector("#not-found");
    const h1 = document.querySelector("#not-found h1");
    const links = Array.from(document.querySelectorAll("#not-found a")).map(
      (a) => ({ text: a.textContent.trim(), href: a.getAttribute("href") })
    );
    return {
      surface: section?.className,
      ground: getComputedStyle(section).backgroundColor,
      texture: getComputedStyle(section).backgroundImage.slice(0, 24),
      h1: h1?.textContent.trim(),
      h1Family: getComputedStyle(h1).fontFamily.split(",")[0],
      links,
      homeLinks: links.filter((l) => l.href === "/").length,
      straightApostrophes: (document.body.innerText.match(/'/g) ?? []).length,
      hasFooter: Boolean(document.querySelector("footer.site-footer")),
      title: document.title,
    };
  });
  note("B1.notFound", shape);
  await page.screenshot({ path: `${OUT}/after-404-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/after-404-mobile.png`, fullPage: true });
  await ctx.close();
}

/* ── S1 / S2 / S3 · the glyph census, per surface ──────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const routes = [
    ["home", "/"],
    ["evidence", "/evidence/"],
    ["automl", "/projects/automl/"],
    ["jobtracker", "/projects/jobtracker/"],
    ["glyph", "/projects/fast-mnist-nn/"],
    ["cadence", "/projects/taskflow-calendar/"],
    ["policybot", "/projects/policybot/"],
    ["master-inventory", "/projects/master-inventory/"],
    ["visual-assist", "/projects/visual-assist/"],
  ];
  for (const [label, url] of routes) {
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const census = await page.evaluate(() => {
      /* Rendered text only. `body.innerText` drags in the RSC flight
         payload and the JSON-LD block on this export, and both carry
         source strings no reader ever sees — a census that counts them
         is measuring the build, not the page. */
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const tag = node.parentElement?.tagName;
            if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );
      let text = "";
      while (walker.nextNode()) text += walker.currentNode.nodeValue + " ";
      const uniq = (re) => Array.from(new Set(text.match(re) ?? []));
      return {
        straightApos: uniq(/[A-Za-z0-9.]'[A-Za-z]|[A-Za-z]'\s/g),
        straightQuote: uniq(/"[^"]{1,40}"/g),
        curlyApos: (text.match(/’/g) ?? []).length,
        timesLetter: uniq(/\d(?:\.\d+)?x\b/g),
        timesSign: uniq(/\d(?:\.\d+)?×/g),
        overPrecise: uniq(/3\.50\s*[x×]/g),
        macroF1: uniq(/macro-[Ff]1/g),
        hyphenRange: uniq(/\b\w{3}\s\d{4}\s-\s/g),
      };
    });
    note(`glyphs.${label}`, census);
  }
  await ctx.close();
}

/* ── S4 · the asked-for row, and how it settles ────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/projects/jobtracker/#v-jobtracker-5`, {
    waitUntil: "networkidle",
  });
  const read = async () =>
    page.evaluate(() => {
      const el = document.querySelector("#v-jobtracker-5");
      const cs = getComputedStyle(el, "::before");
      const r = el.getBoundingClientRect();
      return {
        target: el.matches(":target"),
        top: Math.round(r.top),
        clearsHeader:
          r.top >=
          document.querySelector("header").getBoundingClientRect().height,
        washColor: cs.backgroundColor,
        washOpacity: cs.opacity,
        marginRule: cs.borderInlineStartWidth + " " + cs.borderInlineStartColor,
        scrollMarginTop: getComputedStyle(el).scrollMarginTop,
      };
    });
  await page.waitForTimeout(350);
  note("S4.target.t350", await read());
  await page.screenshot({ path: `${OUT}/after-target-t350.png`, clip: { x: 0, y: 60, width: 1440, height: 300 } });
  await page.waitForTimeout(2400);
  note("S4.target.settled", await read());
  await page.screenshot({ path: `${OUT}/after-target-settled.png`, clip: { x: 0, y: 60, width: 1440, height: 300 } });
  await ctx.close();
}

/* ── S4 · the static world keeps the mark ──────────────────────────── */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/projects/jobtracker/#v-jobtracker-5`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(2600);
  note(
    "S4.target.reducedMotion",
    await page.evaluate(() => {
      const cs = getComputedStyle(
        document.querySelector("#v-jobtracker-5"),
        "::before"
      );
      return { opacity: cs.opacity, background: cs.backgroundColor };
    })
  );
  await ctx.close();
}

/* ── S5 · the paper edition's chrome ───────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 1400 } });
  const page = await ctx.newPage();
  for (const [label, url] of [
    ["home", "/"],
    ["case", "/projects/jobtracker/"],
    ["evidence", "/evidence/"],
  ]) {
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.waitForTimeout(700);
    note(
      `S5.print.${label}`,
      await page.evaluate(() => {
        const vis = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return "absent";
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return cs.display === "none" || r.width === 0 ? "hidden" : "visible";
        };
        return {
          header: vis("header"),
          headerWordmark: vis('header a[href="/"], header a[href$="/"]'),
          headerNavList: vis("header nav ul"),
          dayMark: vis("header [data-day-mark]"),
          mailChip: vis('header a[href^="mailto:"]'),
          motionToggle: vis("[data-motion-toggle]"),
          footerColophon: vis("footer.site-footer"),
          bodyBg: getComputedStyle(document.body).backgroundColor,
          receiptBreak: (() => {
            const row = document.querySelector("[data-receipt-row]");
            return row ? getComputedStyle(row).breakInside : "absent";
          })(),
          dlRowBreak: (() => {
            const row = document.querySelector("dl > div");
            return row ? getComputedStyle(row).breakInside : "absent";
          })(),
        };
      })
    );
    await page.emulateMedia({ media: "screen" });
  }
  await ctx.close();
}

/* ── S6 · the phone's escape hatch ─────────────────────────────────── */
{
  for (const width of [320, 360, 390]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1400);
    note(
      `S6.hero@${width}`,
      await page.evaluate(() => {
        const rows = Array.from(
          document.querySelectorAll("#arrival .label-mono a")
        )
          .filter((a) => a.getBoundingClientRect().width > 0)
          .map((a) => {
            const r = a.getBoundingClientRect();
            return {
              text: a.textContent.trim(),
              w: Math.round(r.width),
              h: Math.round(r.height),
              wraps: a.getClientRects().length > 1,
            };
          });
        return {
          rows,
          under44: rows.filter((r) => r.h < 44).map((r) => r.text),
          anyWrap: rows.some((r) => r.wraps),
        };
      })
    );
    if (width === 320) {
      await page.screenshot({ path: `${OUT}/after-hero-320.png` });
    }
    await ctx.close();
  }
}

/* ── S7 · every external link wears the leaving glyph ──────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  note(
    "S7.externalLinks",
    await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[target="_blank"]'))
        .filter((a) => a.getBoundingClientRect().width > 0)
        .map((a) => ({
          text: a.textContent.trim().slice(0, 60),
          marked: a.textContent.includes("↗"),
        }))
    )
  );
  await ctx.close();
}

/* ── S8 · widows, re-measured on the viewer's own rule ─────────────── */
{
  for (const [label, width] of [
    ["1440", 1440],
    ["390", 390],
  ]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    for (const [name, url] of [
      ["home", "/"],
      ["evidence", "/evidence/"],
      ["cadence", "/projects/taskflow-calendar/"],
    ]) {
      await page.goto(BASE + url, { waitUntil: "networkidle" });
      await page.waitForTimeout(1600);
      note(
        `S8.widows.${label}.${name}`,
        await page.evaluate(() => {
          const out = [];
          for (const p of document.querySelectorAll("p")) {
            const rects = Array.from(p.getClientRects());
            if (rects.length < 2) continue;
            const last = rects[rects.length - 1];
            const widest = Math.max(...rects.map((r) => r.width));
            const pct = (last.width / widest) * 100;
            if (pct < 25) {
              out.push({
                pct: Math.round(pct * 10) / 10,
                lines: rects.length,
                text: p.innerText.slice(0, 60),
              });
            }
          }
          return { count: out.length, worst: out.slice(0, 8) };
        })
      );
    }
    await ctx.close();
  }
}

/* ── S9 · one copy, not two ────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  note(
    "S9.selection",
    await page.evaluate(() => {
      const p = Array.from(document.querySelectorAll("#work p")).find(
        (el) => el.querySelector(".sr-only") && el.querySelector("[aria-hidden]")
      );
      if (!p) return "no paired paragraph found";
      const range = document.createRange();
      range.selectNodeContents(p);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      const copied = sel.toString();
      const visible = p.querySelector("[aria-hidden]").innerText.trim();
      sel.removeAllRanges();
      return {
        srOnlyUserSelect: getComputedStyle(p.querySelector(".sr-only"))
          .userSelect,
        copied: copied.trim().slice(0, 90),
        duplicated: copied.trim().startsWith(visible + visible.slice(0, 4)),
        occurrences: copied.split(visible.slice(0, 18)).length - 1,
      };
    })
  );
  await ctx.close();
}

/* ── S10 / S11 / S12 / N5 / N8 / N12 / N16 / N17 / N18 · the words ── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/projects/taskflow-calendar/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  note(
    "S10.footnoteMarkers",
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("#decisions sup")).map((s) => {
        const cs = getComputedStyle(s);
        return {
          text: s.textContent,
          fontSize: cs.fontSize,
          marginLeft: cs.marginLeft,
          family: cs.fontFamily.split(",")[0],
          verticalAlign: cs.verticalAlign,
        };
      })
    )
  );
  note(
    "N17.kicker",
    await page.evaluate(
      () => document.querySelector("[data-dossier-kicker]")?.innerText
    )
  );

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  note(
    "S11.gatesLedger",
    await page.evaluate(() => {
      const fig = Array.from(document.querySelectorAll("#values figure")).pop();
      return {
        rows: Array.from(fig.querySelectorAll("li")).map((li) =>
          li.innerText.replace(/\s+/g, " ").trim()
        ),
        caption: fig.querySelector("figcaption")?.innerText,
      };
    })
  );
  note(
    "S12.redaction",
    await page.evaluate(() => {
      const list = document
        .querySelector("[data-pipeline-track]")
        ?.parentElement?.parentElement?.querySelectorAll("ul");
      const reg = document.querySelector("[data-registry-row]")?.parentElement;
      return {
        head: reg ? Array.from(reg.querySelectorAll("li")).slice(0, 2).map((li) => li.innerText.replace(/\s+/g, " ").trim()) : "absent",
        blocksIntact: (document.body.innerText.match(/▓▓/g) ?? []).length,
        lists: list ? list.length : 0,
      };
    })
  );
  note(
    "N8.gateRow",
    await page.evaluate(() => {
      const gate = document.querySelector("[data-pipeline-gate]");
      const phase = document.querySelector("[data-pipeline-phase='0']");
      if (!gate || !phase) return "absent";
      /* The label's left edge on each row: for the gate that is the text
         node after the marker slot; for a numbered phase it is the
         character after "N.0 " in the row's single text run. */
      const textLeft = (node, from) => {
        const range = document.createRange();
        range.setStart(node, from);
        range.setEnd(node, node.length);
        return Math.round(range.getBoundingClientRect().left);
      };
      /* React splits `{n}.0 {phase}` into three text nodes, so the phase
         NAME is simply the last one; the gate's label is likewise its
         last text node, after the marker slot. */
      const lastText = (el) =>
        Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3 && n.nodeValue.trim().length > 0)
          .pop();
      const gateText = lastText(gate);
      const phaseText = lastText(phase);
      const lead = (n) =>
        n.nodeValue.length - n.nodeValue.trimStart().length;
      return {
        gateLabelLeft: gateText ? textLeft(gateText, lead(gateText)) : null,
        phaseLabelLeft: phaseText ? textLeft(phaseText, lead(phaseText)) : null,
        gateLabel: gateText?.nodeValue.trim().slice(0, 24),
        phaseLabel: phaseText?.nodeValue.trim().slice(0, 24),
        gateRowLeft: Math.round(gate.getBoundingClientRect().left),
        phaseRowLeft: Math.round(phase.getBoundingClientRect().left),
      };
    })
  );
  note(
    "N12.indexSeparators",
    await page.evaluate(() => {
      const ul = Array.from(document.querySelectorAll("#work ul")).find((el) =>
        el.previousElementSibling?.innerText?.includes("cited above")
      );
      return ul ? ul.innerText.replace(/\s+/g, " ").trim() : "absent";
    })
  );
  note(
    "N18.testimonial",
    await page.evaluate(() => {
      const q = document.querySelector("#gate blockquote");
      return q ? q.innerText.slice(0, 40) + " … " + q.innerText.slice(-40) : "absent";
    })
  );
  await page.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  note(
    "N5.glance",
    await page.evaluate(
      () => document.querySelector("[data-proof-glance] figcaption")?.innerText
    )
  );
  await ctx.close();
}

/* ── N13 / N16 · fig 5.3's geometry ────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  /* fig 5.3 is the HOME paper's ¶05 Cadence row — scroll it into view and
     let its one-shot settle before measuring. */
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const fig = Array.from(document.querySelectorAll("figure[data-scene]")).find(
      (f) => f.innerText.includes("fig. 5.3")
    );
    fig?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(2600);
  const cadence = await page.evaluate(() => {
    const fig = Array.from(document.querySelectorAll("figure[data-scene]")).find(
      (f) => f.innerText.includes("fig. 5.3")
    );
    const svg = fig?.querySelector(".scene-plate-wide");
    if (!svg || svg.getBoundingClientRect().width === 0) return "no wide plate";
    const chip = svg.querySelector("[data-sc-chip='who']");
    const rect = chip.querySelector("rect");
    const text = chip.querySelector("text");
    const snap = svg.querySelector("[data-sc-snap]");
    const days = Array.from(
      svg.querySelectorAll("[data-sc-grid-labels] text")
    ).map((t) => t.textContent);
    const rb = rect.getBoundingClientRect();
    const tb = text.getBoundingClientRect();
    const sb = snap.getBoundingClientRect();
    return {
      chipRight: Math.round(rb.right),
      textRight: Math.round(tb.right),
      textInsideBy: Math.round(rb.right - tb.right),
      overlapsBorder: tb.right > rb.right - 2,
      snapStartsRightOfChip: Math.round(sb.left - rb.right),
      days: days.slice(0, 7),
      dayAmbiguity: new Set(days.slice(0, 7)).size,
    };
  });
  note("N13.N16.cadence", cadence);
  const box = await page
    .locator("figure[data-scene]", { hasText: "fig. 5.3" })
    .locator(".scene-plate-wide")
    .first()
    .boundingBox();
  if (box) {
    await page.screenshot({
      path: `${OUT}/after-fig53-cadence.png`,
      clip: {
        x: Math.max(0, box.x - 8),
        y: Math.max(0, box.y - 8),
        width: box.width + 16,
        height: box.height + 16,
      },
    });
  }
  await ctx.close();
}

/* ── N1 · the flagship's plates, in citation order ─────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  note(
    "N1.figOrder",
    await page.evaluate(() => ({
      plateIds: Array.from(document.querySelectorAll("[id^='fig-']")).map(
        (el) => el.id
      ),
      firstCitations: Array.from(document.querySelectorAll("[data-cites]")).map(
        (el) => el.getAttribute("data-cites")
      ),
      captions: Array.from(document.querySelectorAll("figcaption, [id^='fig-']"))
        .map((el) => (el.innerText.match(/fig\.\s*[\d.]+[^\n]{0,34}/) ?? [])[0])
        .filter(Boolean),
    }))
  );
  await ctx.close();
}

/* ── S15 · the rail follows the column ─────────────────────────────── */
{
  for (const width of [1280, 1440, 1920, 2560]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo({ top: 2400, behavior: "instant" }));
    await page.waitForTimeout(1200);
    note(
      `S15.rail@${width}`,
      await page.evaluate(() => {
        const rail = document.querySelector('nav[aria-label="Chapters"]');
        const body = document.querySelector("#who p.font-serif, #who p");
        if (!rail || !body) return "absent";
        const rr = rail.getBoundingClientRect();
        const br = body.getBoundingClientRect();
        return {
          railLeft: Math.round(rr.left),
          railRight: Math.round(rr.right),
          contentLeft: Math.round(br.left),
          gutter: Math.round(br.left - rr.right),
        };
      })
    );
    if (width === 2560 || width === 1440) {
      await page.screenshot({ path: `${OUT}/after-rail-${width}.png` });
    }
    await ctx.close();
  }
}

/* ── S5 · the paper edition, re-rendered ───────────────────────────
   printBackground FALSE on purpose: that is the Cmd+P default, and the
   whole reason F04 exists. Three routes, the same three the viewer
   printed. */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1600 } });
  const page = await ctx.newPage();
  for (const [label, url] of [
    ["home", "/"],
    ["case", "/projects/jobtracker/"],
    ["evidence", "/evidence/"],
  ]) {
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    /* Settle the whole document first: a print taken mid-entrance is a
       print of the entrance, not of the page. */
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 90));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForTimeout(900);
    await page.pdf({
      path: `${OUT}/print-${label}.pdf`,
      format: "Letter",
      printBackground: false,
    });
    console.log(`[S5.pdf.${label}] ${OUT}/print-${label}.pdf`);
  }
  await ctx.close();
}

writeFileSync(`${OUT}/fix3-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
console.log(`\nwrote ${OUT}/fix3-notes.json`);
