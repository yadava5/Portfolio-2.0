// SYSTEM-CARD placement probe — does the fourth link fit, measured.
//
// The round added one link in three places: the case-file meta ledger
// (`system card ↗`, four files), ¶05's jetpack cluster, and ¶05's
// LifeQuest index line. The certification round's D7 left ¶05's mono
// rail alone (it grew the masthead, "where navigation lives"), so the
// question this probe answers is not "is the target 44px" — no link in
// that rail is — it is the one the placement brief actually asked:
// **does the cluster crowd at 390?**
//
// It answers it by measuring the SAME built page twice: once as shipped,
// once with the new link `display:none`. A display:none flex item is
// removed from layout exactly as if it were absent, so the second pass
// is a faithful "before" without a second build.
//
// Reports, at 390 and 1440:
//   · ¶05 jetpack cluster — height, line count, every link box, and the
//     before/after delta on each
//   · ¶05 LifeQuest index line — both link boxes and the gap between
//   · case-file meta ledger — the system-card row on all four files
//   · horizontal integrity (scrollWidth ≤ innerWidth) on every page
//
// Serve the static export on :3200 first (tests/playwright/static-server.mjs).
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://127.0.0.1:3200";
const CASE_FILES = [
  "jobtracker",
  "automl",
  "taskflow-calendar",
  "fast-mnist-nn",
];

const browser = await chromium.launch();

/* Every link box inside ¶05's jetpack rail, plus the rail's own height.
   Runs in the page (page.evaluate serializes it), never in Node — the
   `document` reference below is the browser's. */
const READ_JETPACK_RAIL = `(() => {
  const rows = Array.from(document.querySelectorAll("#work [data-thread-row]"));
  const row = rows.find((r) => r.querySelector("h3")?.textContent?.includes("jetpack"));
  if (!row) return null;
  const rail = row.querySelector("div.label-mono");
  const links = Array.from(rail.querySelectorAll("a")).map((a) => {
    const r = a.getBoundingClientRect();
    return {
      text: a.textContent.trim(),
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  });
  /* The rail's real line count. Two traps, both hit on the first run:
     display:none children report top 0 and would each read as their own
     line (the before/after pass hides one), and items-baseline gives a
     2-line chip a different top from the 15px items beside it. So:
     visible children only, tops clustered within 8px. */
  const tops = Array.from(rail.children)
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.height > 0)
    .map((r) => r.top)
    .sort((a, b) => a - b);
  let lines = 0;
  let last = -Infinity;
  for (const top of tops) {
    if (top - last > 8) lines += 1;
    last = top;
  }
  /* The box height is the GRID ROW's at md+ (the rail stretches beside a
     taller text column), so it cannot see the rail growing. Content
     height — first visible top to last visible bottom — can. */
  const boxes = Array.from(rail.children)
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.height > 0);
  const content = boxes.length
    ? Math.round(
        Math.max(...boxes.map((r) => r.bottom)) -
          Math.min(...boxes.map((r) => r.top))
      )
    : 0;
  return {
    height: Math.round(rail.getBoundingClientRect().height),
    content,
    lines,
    links,
  };
})()`;

async function scrollWork(page) {
  await page.evaluate(() =>
    document.querySelector("#work")?.scrollIntoView({ block: "start" })
  );
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollBy(0, 3000));
  await page.waitForTimeout(1000);
}

for (const width of [390, 1440]) {
  const page = await browser.newPage({
    viewport: { width, height: 844 },
    ...(width === 390
      ? { deviceScaleFactor: 3, isMobile: true, hasTouch: true }
      : {}),
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await scrollWork(page);

  console.log(`\n══ home ¶05 @ ${width} ═══════════════════════════════`);

  const after = await page.evaluate(READ_JETPACK_RAIL);

  /* The "before": hide the rail's new link and let flex re-flow. Scoped
     to [data-thread-row] rails on purpose — the LifeQuest card lives in
     an <li> in the index below and is measured separately. */
  await page.evaluate(() => {
    for (const a of document.querySelectorAll("#work [data-thread-row] a")) {
      if (a.textContent.trim().startsWith("system card")) {
        a.closest("p").style.display = "none";
      }
    }
  });
  await page.waitForTimeout(250);
  const before = await page.evaluate(READ_JETPACK_RAIL);

  console.log(
    `  jetpack rail — box ${before.height} → ${after.height}px · ` +
      `content ${before.content} → ${after.content}px · ` +
      `lines ${before.lines} → ${after.lines}`
  );
  for (const link of after.links) {
    console.log(
      `    ${link.text.padEnd(42)} ${link.w}×${link.h} @ (${link.x},${link.y})`
    );
  }

  /* Restore, then measure the LifeQuest index line as shipped. */
  await page.evaluate(() => {
    for (const p of document.querySelectorAll("#work p")) {
      if (p.style.display === "none") p.style.display = "";
    }
  });
  await page.waitForTimeout(250);

  const lq = await page.evaluate(() => {
    const li = Array.from(document.querySelectorAll("#work li")).find((n) =>
      n.textContent.includes("LifeQuest")
    );
    if (!li) return null;
    const links = Array.from(li.querySelectorAll("a")).map((a) => {
      const r = a.getBoundingClientRect();
      return {
        text: a.textContent.trim(),
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    });
    return { height: Math.round(li.getBoundingClientRect().height), links };
  });
  console.log(`  lifequest index line — ${lq.height}px tall`);
  for (const link of lq.links) {
    console.log(
      `    ${link.text.padEnd(42)} ${link.w}×${link.h} @ (${link.x},${link.y})`
    );
  }
  if (lq.links.length === 2) {
    const [a, b] = lq.links;
    const sameLine = a.y === b.y;
    console.log(
      `    separation — ${
        sameLine
          ? `${b.x - (a.x + a.w)}px across, SAME line`
          : `${b.y - (a.y + a.h)}px down, different lines`
      }`
    );
  }

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  console.log(
    `  horizontal — scrollWidth ${overflow.scrollWidth} vs ${overflow.innerWidth} ` +
      `${overflow.scrollWidth <= overflow.innerWidth ? "OK" : "OVERFLOW"}`
  );

  /* ── the case-file rails ─────────────────────────────────────── */
  console.log(`\n══ case-file meta ledgers @ ${width} ══════════════════`);
  for (const id of CASE_FILES) {
    await page.goto(`${BASE}/projects/${id}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const rail = await page.evaluate(() => {
      const card = document.querySelector("a[data-system-card]");
      const demo = document.querySelector("a[data-live-demo]");
      const box = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          text: el.textContent.trim(),
          href: el.getAttribute("href"),
          w: Math.round(r.width),
          h: Math.round(r.height),
          y: Math.round(r.y),
        };
      };
      return {
        card: box(card),
        demo: box(demo),
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      };
    });
    console.log(
      `  ${id.padEnd(20)} ${rail.card ? rail.card.text : "— MISSING —"} ` +
        `${rail.card ? `${rail.card.w}×${rail.card.h}` : ""} · ` +
        `under demo by ${
          rail.card && rail.demo ? rail.card.y - rail.demo.y : "?"
        }px · ${rail.card?.href ?? ""}`
    );
    if (rail.scrollWidth > rail.innerWidth) {
      console.log(
        `    ! OVERFLOW ${rail.scrollWidth} > ${rail.innerWidth}`
      );
    }
  }

  await page.close();
}

await browser.close();
