// FIX ROUND 6 — the shot rig, before and after, on the same frames.
//
// Six of this round's items are things a table cannot settle: whether a
// folio LOOKS flush right, whether a masthead with two items reads as a
// masthead, whether a focus state on a tilted plate reads as focus or as
// misregistration. So every one of them is shot at the widths the
// nitpicking viewer named, with the geometry that matters recorded off
// the SAME frame as the picture (shots-fix6/fix6-geometry.json), so a
// later round can compare numbers rather than eyeball two PNGs.
//
// PHASE=before|after prefixes the filenames, so a `git checkout -- src`
// / build / shoot / restore / build / shoot cycle produces two named
// halves in one directory.
//
// Usage:
//   PHASE=after BASE=http://localhost:3600 node docs/design-lab/shoot-fix6.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3600";
const PHASE = process.env.PHASE ?? "after";
const OUT = process.env.OUT ?? "docs/design-lab/shots-fix6";
mkdirSync(OUT, { recursive: true });

const geometry = {};
const browser = await chromium.launch();

/** One settled page at one width. */
async function open(width, path, height = 900) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  return { ctx, page };
}

const shot = (page, name, opts) =>
  page.screenshot({ path: `${OUT}/${PHASE}-${name}.png`, ...opts });

/* ── 1 · the 404, at the three widths the blocker was measured at ──── */
for (const width of [320, 390, 430]) {
  const { ctx, page } = await open(width, "/no-such-page/", 1000);
  geometry[`404@${width}`] = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const rows = [...document.querySelectorAll("#not-found nav li")].map(
      (li) => {
        const link = li.querySelector("a");
        const leader = li.querySelector(".dot-leader");
        return {
          label: link.textContent.trim(),
          leaderW: Math.round(leader.getBoundingClientRect().width * 10) / 10,
          rowH: Math.round(li.getBoundingClientRect().height),
          right: Math.round(li.getBoundingClientRect().right),
        };
      }
    );
    return {
      over: document.documentElement.scrollWidth - vw,
      vw,
      rows,
    };
  });
  await shot(page, `404-${width}`, { fullPage: true });
  await ctx.close();
}

/* ── 2 · the ¶ running head, at the folio's three states ───────────── */
for (const width of [640, 768, 800]) {
  const { ctx, page } = await open(width, "/", 700);
  const box = await page.evaluate(() => {
    const kicker = document.querySelector("[data-thread-kicker]");
    const row = kicker.parentElement;
    const b = row.getBoundingClientRect();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  });
  geometry[`runninghead@${width}`] = await page.evaluate(() => {
    const kicker = document.querySelector("[data-thread-kicker]");
    const row = kicker.parentElement;
    /* `[data-kicker-folio]` is fix round 6's name for it; before the fix
       the folio is simply the row's other child, so the BEFORE phase can
       be shot with the same rig and compared field for field. */
    const folio =
      row.querySelector("[data-kicker-folio]") ??
      [...row.children].find((el) => el !== kicker);
    const rb = row.getBoundingClientRect();
    const fb = folio?.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(kicker).lineHeight) || 18;
    return {
      rowLines: Math.round(rb.height / lh),
      rowRight: Math.round(rb.right),
      folioRight: fb ? Math.round(fb.right) : null,
      folioFlush: fb
        ? Math.abs(fb.right - rb.right) <= 1
          ? "right"
          : "left"
        : "hidden",
    };
  });
  await shot(page, `runninghead-${width}`, {
    clip: {
      x: Math.max(0, box.x - 8),
      y: Math.max(0, box.y - 14),
      width: Math.min(width, box.width + 16),
      height: box.height + 28,
    },
  });
  await ctx.close();
}

/* ── 3 · the masthead at 768 — the lone item, or not ───────────────── */
{
  const { ctx, page } = await open(768, "/", 700);
  geometry["masthead@768"] = await page.evaluate(() => {
    const nav = document.querySelector("header nav");
    const cs = getComputedStyle(nav);
    const gap = parseFloat(cs.columnGap) || 0;
    const kids = [...nav.children].filter(
      (k) => k.getBoundingClientRect().width > 0
    );
    return {
      items: [...nav.querySelectorAll("ul li")]
        .filter((li) => li.getBoundingClientRect().width > 0)
        .map((li) => li.textContent.trim()),
      navH: Math.round(nav.querySelector("ul").getBoundingClientRect().height),
      needs: Math.round(
        kids.reduce((s, k) => s + k.getBoundingClientRect().width, 0) +
          gap * Math.max(0, kids.length - 1)
      ),
      content: Math.round(
        nav.getBoundingClientRect().width -
          parseFloat(cs.paddingLeft) -
          parseFloat(cs.paddingRight)
      ),
    };
  });
  await shot(page, "masthead-768", {
    clip: { x: 0, y: 0, width: 768, height: 80 },
  });
  await ctx.close();
}

/* ── 4 · ¶05's affordance rail at 390 — the 15px targets ───────────── */
{
  const { ctx, page } = await open(390, "/", 900);
  const box = await page.evaluate(async () => {
    /* the jetpack-compress row: the one carrying all three terminals */
    const rows = [...document.querySelectorAll("[data-thread-row]")];
    const row = rows.find((r) => /jetpack/i.test(r.textContent ?? ""));
    row.scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 1200));
    const b = row.getBoundingClientRect();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  });
  geometry["ch05rail@390"] = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("[data-thread-row]")];
    const row = rows.find((r) => /jetpack/i.test(r.textContent ?? ""));
    return [...row.querySelectorAll("a")].map((a) => {
      const b = a.getBoundingClientRect();
      return {
        t: a.textContent.trim().slice(0, 34),
        w: Math.round(b.width),
        h: Math.round(b.height),
      };
    });
  });
  await shot(page, "ch05-affordances-390", {
    clip: {
      x: 0,
      y: Math.max(0, box.y),
      width: 390,
      height: Math.min(900, box.height),
    },
  });
  await ctx.close();
}

/* ── 5 · the gate stamp at 1440, unfocused then focused ────────────── */
{
  const { ctx, page } = await open(1440, "/", 900);
  const box = await page.evaluate(async () => {
    const stamps = [...document.querySelectorAll("[data-stamp]")];
    const stamp = stamps.find((s) => s.getBoundingClientRect().width > 0);
    stamp.scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 1400));
    const b = stamp.getBoundingClientRect();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  });
  const clip = {
    x: Math.max(0, box.x - 40),
    y: Math.max(0, box.y - 40),
    width: box.width + 80,
    height: box.height + 80,
  };
  await shot(page, "stamp-1440-rest", { clip });
  await page.evaluate(() => {
    const stamps = [...document.querySelectorAll("[data-stamp]")];
    const stamp = stamps.find((s) => s.getBoundingClientRect().width > 0);
    /* :focus-visible needs a keyboard-ish focus; Playwright's focus()
       counts as programmatic, so Tab into it from the previous control. */
    stamp.focus();
  });
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(700);
  geometry["stampFocus@1440"] = await page.evaluate(() => {
    const stamps = [...document.querySelectorAll("[data-stamp]")];
    const stamp = stamps.find((s) => s.getBoundingClientRect().width > 0);
    const cs = getComputedStyle(stamp);
    const reg = stamp.querySelector(".stamp-register");
    return {
      focused: document.activeElement === stamp,
      outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
      registerOpacity: reg ? getComputedStyle(reg).opacity : "(no register)",
      ink: cs.color,
      /* Tailwind v4 tilts with the INDIVIDUAL `rotate` property, not
         `transform` — a rig reading `transform` reports "none" on a
         plate that is visibly turned. Both are recorded. */
      transform: cs.transform,
      rotate: cs.rotate,
      seat: stamp.className.includes("-rotate-6") ? "lg" : "compact",
    };
  });
  await shot(page, "stamp-1440-focus", { clip });
  await ctx.close();
}

await browser.close();
writeFileSync(
  `${OUT}/${PHASE}-geometry.json`,
  JSON.stringify(geometry, null, 1)
);
console.log(`[${PHASE}] shots + geometry written to ${OUT}`);
console.log(JSON.stringify(geometry, null, 1));
