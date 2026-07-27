// FIX ROUND 6 — the measuring rig behind the nitpicking viewer's three
// flip conditions, plus the four items that ride with them.
//
// Six probes, one process, one flag each. Every number this round claims
// in WAVE4-STATUS comes out of here, so a later round can re-run the
// claim rather than trust the sentence.
//
//   --overflow   scrollWidth − innerWidth for every route INCLUDING the
//                404 (which fix round 5's "every route" sweep did not
//                contain — the round-5 table has nine rows and the site
//                has ten surfaces), 320 → 2560. Per offender: the text,
//                the box, and overflow-wrap / word-break / min-width up
//                the ancestor chain, so a fix is attributed to a rule.
//   --leaders    the 404 index's dot leaders: every row's leader width
//                and every row's line count, at every narrow width. A
//                leader that has collapsed to a stub is the tell that
//                the row it belongs to has run off the paper, so this
//                is the acceptance half of the overflow fix — 0 overflow
//                with dead leaders is not the fix.
//   --dateline   the ¶ running head, 320 → 900 in 20px steps: line
//                count, height, and whether the folio (`summer 2026`)
//                is flush RIGHT or has been dropped flush left. A folio
//                is a folio because of where it sits.
//   --masthead   the B2 sweep re-run per ITEM: for every width, which
//                nav items are laid out, what the row needs, what it
//                has, and the slack. Fix round 3 swept the row as a
//                whole and found one stop; the lone `the work` marooned
//                at 640–879 is a per-item question, so this measures
//                per item.
//   --targets    the ≥44px census at 390 on every route: every
//                interactive box under 24px tall, its text, and its
//                nearest neighbour's gap — so a lifted box that now
//                overlaps its neighbour is reported as the trade it is.
//   --arc        the day arc sampled down the home page: the composed
//                canvas at each sample and the distinct-ground count,
//                which is the measurement item 7 (the design call) is
//                decided on.
//
// Usage:
//   BASE=http://localhost:3600 node docs/design-lab/probe-fix6.mjs --overflow
//   ... --leaders --dateline --masthead --targets --arc   (any subset;
//   none given runs them all)
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3600";
const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const want = (name) => flags.length === 0 || flags.includes(`--${name}`);

const CASE_IDS = [
  "automl",
  "fast-mnist-nn",
  "jobtracker",
  "master-inventory",
  "policybot",
  "taskflow-calendar",
  "visual-assist",
];
/* The 404 is a ROUTE. `/no-such-page/` is how a reader reaches it and
   how the static server serves it, so that is how it is swept. */
const ROUTES = [
  "/",
  "/evidence/",
  ...CASE_IDS.map((id) => `/projects/${id}/`),
  "/no-such-page/",
];
const OVERFLOW_WIDTHS = [
  320, 340, 360, 375, 390, 414, 430, 480, 540, 640, 768, 834, 1024, 1180, 1280,
  1440, 1600, 1920, 2560,
];

const browser = await chromium.launch();
let failed = false;

/** Open one page at one width, settled. */
async function at(width, path, height = 844) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  return { ctx, page };
}

/* ── 1 · overflow, every route, the 404 included ──────────────────── */
if (want("overflow")) {
  const table = {};
  const offenderLog = [];
  for (const path of ROUTES) {
    table[path] = {};
    for (const width of OVERFLOW_WIDTHS) {
      const { ctx, page } = await at(width, path);
      const measured = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const over = document.documentElement.scrollWidth - vw;
        const offenders = [];
        if (over > 0) {
          for (const el of document.querySelectorAll("body *")) {
            const b = el.getBoundingClientRect();
            if (!(b.width > 0 && b.right > vw + 0.5)) continue;
            const childOver = [...el.querySelectorAll("*")].some((c) => {
              const cb = c.getBoundingClientRect();
              return cb.width > 0 && cb.right > vw + 0.5;
            });
            if (childOver) continue;
            const cs = getComputedStyle(el);
            offenders.push({
              tag: el.tagName,
              cls: String(el.className?.baseVal ?? el.className ?? "").slice(
                0,
                70
              ),
              text: (el.textContent ?? "").trim().slice(0, 60),
              right: Math.round(b.right),
              over: Math.round(b.right - vw),
              wrap: cs.overflowWrap,
              wb: cs.wordBreak,
              minW: cs.minWidth,
              shrink: cs.flexShrink,
            });
          }
        }
        return { over, offenders };
      });
      table[path][width] = measured.over;
      if (measured.over > 0) {
        failed = true;
        offenderLog.push({ path, width, ...measured });
      }
      await ctx.close();
    }
  }
  console.log("\n=== overflow (scrollWidth − innerWidth) ===");
  console.log(
    "route".padEnd(26) +
      OVERFLOW_WIDTHS.map((w) => String(w).padStart(6)).join("")
  );
  for (const path of ROUTES) {
    console.log(
      path.padEnd(26) +
        OVERFLOW_WIDTHS.map((w) => String(table[path][w]).padStart(6)).join("")
    );
  }
  if (offenderLog.length)
    console.log("\n" + JSON.stringify(offenderLog, null, 1));
}

/* ── 2 · the 404 index's dot leaders ──────────────────────────────── */
if (want("leaders")) {
  console.log("\n=== 404 index rows: leader width + line count ===");
  console.log(
    "width".padStart(6) +
      "rows".padStart(6) +
      "minLeader".padStart(11) +
      "maxLines".padStart(10) +
      "  drawnAll  evidenceRowRight"
  );
  for (const width of [320, 340, 360, 375, 390, 414, 430, 480, 640, 1440]) {
    const { ctx, page } = await at(width, "/no-such-page/");
    const r = await page.evaluate(() => {
      const rows = [...document.querySelectorAll("#not-found nav li")];
      const read = rows.map((li) => {
        const link = li.querySelector("a");
        const leader = li.querySelector(".dot-leader");
        const note = li.querySelector("span:last-child");
        const lb = leader?.getBoundingClientRect();
        const lr = link?.getBoundingClientRect();
        const nr = note?.getBoundingClientRect();
        return {
          label: link?.textContent?.trim() ?? "",
          leaderW: lb ? Math.round(lb.width * 10) / 10 : 0,
          leaderDrawn: lb
            ? getComputedStyle(leader).borderBottomStyle === "dotted" &&
              lb.width >= 2
            : false,
          linkLines: lr && lr.height ? Math.round(lr.height / 18) : 0,
          rowRight: Math.round(Math.max(lr?.right ?? 0, nr?.right ?? 0)),
          rowH: Math.round(li.getBoundingClientRect().height),
        };
      });
      return {
        rows: read,
        vw: document.documentElement.clientWidth,
      };
    });
    const minLeader = Math.min(...r.rows.map((x) => x.leaderW));
    const maxLines = Math.max(...r.rows.map((x) => x.rowH / 18));
    const drawnAll = r.rows.every((x) => x.leaderDrawn);
    const ev = r.rows[r.rows.length - 1];
    console.log(
      String(width).padStart(6) +
        String(r.rows.length).padStart(6) +
        String(minLeader).padStart(11) +
        maxLines.toFixed(1).padStart(10) +
        "  " +
        (drawnAll ? "yes" : "NO ").padEnd(9) +
        String(ev.rowRight).padStart(6) +
        `  (${ev.label})`
    );
    if (!drawnAll) failed = true;
    await ctx.close();
  }
}

/* ── 3 · the ¶ running head, 320 → 900 in 20px steps ──────────────── */
if (want("dateline")) {
  console.log("\n=== ¶ running head (ch01 kicker) ===");
  console.log(
    "width".padStart(6) +
      "lines".padStart(7) +
      "h".padStart(5) +
      "folio".padStart(20) +
      "folioRight".padStart(12) +
      "boxRight".padStart(10) +
      "  flush"
  );
  for (let width = 320; width <= 900; width += 20) {
    const { ctx, page } = await at(width, "/");
    const r = await page.evaluate(() => {
      const kicker = document.querySelector("[data-thread-kicker]");
      const row = kicker?.parentElement;
      /* `[data-kicker-folio]` is this round's name for it; before the fix
         the folio is simply the row's other <p>, so both are read. */
      const folio =
        row?.querySelector("[data-kicker-folio]") ??
        [...(row?.children ?? [])].find((el) => el !== kicker);
      const box = row?.getBoundingClientRect();
      const kb = kicker?.getBoundingClientRect();
      const fb = folio?.getBoundingClientRect();
      const lineH = kicker
        ? parseFloat(getComputedStyle(kicker).lineHeight) || 18
        : 18;
      return {
        rowH: box ? Math.round(box.height) : 0,
        rowRight: box ? Math.round(box.right) : 0,
        kickerLines: kb ? Math.round(kb.height / lineH) : 0,
        rowLines: box ? Math.round(box.height / lineH) : 0,
        folioText: folio?.textContent?.trim() ?? "(hidden)",
        folioRight: fb ? Math.round(fb.right) : -1,
        folioLeft: fb ? Math.round(fb.left) : -1,
        visible: !!fb && fb.width > 0,
      };
    });
    const flush = !r.visible
      ? "hidden"
      : Math.abs(r.folioRight - r.rowRight) <= 1
        ? "RIGHT"
        : "left!";
    console.log(
      String(width).padStart(6) +
        String(r.rowLines).padStart(7) +
        String(r.rowH).padStart(5) +
        r.folioText.slice(0, 18).padStart(20) +
        String(r.folioRight).padStart(12) +
        String(r.rowRight).padStart(10) +
        "  " +
        flush
    );
    if (r.visible && flush === "left!") failed = true;
    await ctx.close();
  }
}

/* ── 4 · the masthead, per item ───────────────────────────────────── */
if (want("masthead")) {
  console.log("\n=== masthead: per-item fit (B2 sweep, re-run per item) ===");
  console.log(
    "width".padStart(6) +
      "navH".padStart(6) +
      "items".padStart(7) +
      "needs".padStart(7) +
      "content".padStart(9) +
      "slack".padStart(7) +
      "  laid out"
  );
  for (let width = 320; width <= 1024; width += 20) {
    const { ctx, page } = await at(width, "/");
    const r = await page.evaluate(() => {
      const nav = document.querySelector("header nav");
      const navBox = nav.getBoundingClientRect();
      const cs = getComputedStyle(nav);
      const contentW =
        navBox.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      /* What the row NEEDS: every direct child's outer width plus the
         gaps between them, measured off the live row. */
      const kids = [...nav.children];
      const gap = parseFloat(cs.columnGap) || 0;
      const needs =
        kids.reduce((sum, k) => sum + k.getBoundingClientRect().width, 0) +
        gap * Math.max(0, kids.length - 1);
      const items = [...nav.querySelectorAll("ul > li")]
        .filter((li) => li.getBoundingClientRect().width > 0)
        .map((li) => li.textContent.trim());
      const rowH = nav.querySelector("ul").getBoundingClientRect().height;
      return {
        navH: Math.round(rowH),
        contentW: Math.round(contentW),
        needs: Math.round(needs),
        items,
      };
    });
    console.log(
      String(width).padStart(6) +
        String(r.navH).padStart(6) +
        String(r.items.length).padStart(7) +
        String(r.needs).padStart(7) +
        String(r.contentW).padStart(9) +
        String(r.contentW - r.needs).padStart(7) +
        "  " +
        r.items.join(" · ")
    );
    await ctx.close();
  }
}

/* ── 4b · what the masthead could AFFORD, item by item ────────────── */
//
// The B2 sweep above measures the row AS BUILT. The lone `the work`
// marooned at 640–879 is a question the as-built row cannot answer:
// what would a second item cost, and where does it start to fit? So
// this forces each candidate visible in the live DOM and re-measures —
// including the complementary swap (revealing `contact` retires the
// mail chip, because contact must be reachable at every width and never
// twice at any width).
if (want("navfit")) {
  console.log("\n=== masthead: what each candidate WOULD cost ===");
  console.log(
    "width".padStart(6) +
      "content".padStart(9) +
      "  1 item".padEnd(10) +
      "+experience".padEnd(14) +
      "+exp+contact(−mail)".padEnd(22) +
      " wraps?"
  );
  for (let width = 640; width <= 900; width += 20) {
    const { ctx, page } = await at(width, "/");
    const r = await page.evaluate(() => {
      const nav = document.querySelector("header nav");
      const cs = getComputedStyle(nav);
      const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const gap = parseFloat(cs.columnGap) || 0;
      const content = nav.getBoundingClientRect().width - pad;
      const need = () => {
        const kids = [...nav.children].filter(
          (k) => k.getBoundingClientRect().width > 0
        );
        return (
          kids.reduce((s, k) => s + k.getBoundingClientRect().width, 0) +
          gap * Math.max(0, kids.length - 1)
        );
      };
      const ulH = () =>
        Math.round(nav.querySelector("ul").getBoundingClientRect().height);
      const items = [...nav.querySelectorAll("ul > li")];
      const byText = (t) =>
        items.find((li) => li.textContent.trim().startsWith(t));
      const exp = byText("experience");
      const con = byText("contact");
      const mail = nav.querySelector("a[aria-label='Contact']");
      const show = (el) => el && (el.style.display = "list-item");
      const base = { need: Math.round(need()), h: ulH() };
      show(exp);
      const withExp = { need: Math.round(need()), h: ulH() };
      show(con);
      if (mail) mail.style.display = "none";
      const withBoth = { need: Math.round(need()), h: ulH() };
      return { content: Math.round(content), base, withExp, withBoth };
    });
    const cell = (m) => `${m.need}/${r.content - m.need}`.padEnd(11);
    console.log(
      String(width).padStart(6) +
        String(r.content).padStart(9) +
        "  " +
        cell(r.base).padEnd(8) +
        cell(r.withExp).padEnd(12) +
        cell(r.withBoth).padEnd(20) +
        ` h ${r.base.h}/${r.withExp.h}/${r.withBoth.h}`
    );
    await ctx.close();
  }
  console.log("cells read: needs/slack (slack = content − needs)");
}

/* ── 5 · the ≥44px census at 390 ──────────────────────────────────── */
if (want("targets")) {
  console.log("\n=== interactive boxes under 24px tall @390 ===");
  for (const path of ROUTES) {
    const { ctx, page } = await at(390, path);
    const r = await page.evaluate(() => {
      const sel = "a[href], button, [role='button'], input, select, textarea";
      const boxes = [...document.querySelectorAll(sel)]
        .map((el) => ({ el, b: el.getBoundingClientRect() }))
        .filter((x) => x.b.width > 2 && x.b.height > 2);
      const small = boxes
        .filter((x) => x.b.height < 24)
        .map((x) => ({
          t: (x.el.textContent ?? "").trim().slice(0, 40),
          w: Math.round(x.b.width),
          h: Math.round(x.b.height),
        }));
      /* Overlap census: two grown boxes whose rects intersect. A lifted
         target that eats its neighbour's box is a trade, not a fix. */
      let overlaps = 0;
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i].b;
          const b = boxes[j].b;
          if (
            a.left < b.right &&
            b.left < a.right &&
            a.top < b.bottom &&
            b.top < a.bottom
          )
            overlaps++;
        }
      }
      return { total: boxes.length, small, overlaps };
    });
    console.log(
      `${path.padEnd(28)} ${String(r.small.length).padStart(3)} under 24 / ${String(
        r.total
      ).padStart(3)} · ${r.overlaps} overlapping pairs`
    );
    for (const s of r.small) console.log(`      ${s.w}×${s.h}  ${s.t}`);
    await ctx.close();
  }
}

/* ── 5b · the hover response, read where the house actually draws it ─ */
//
// The nitpick-2 rig reported the masthead wordmark as "the only link
// with no hover response" — it diffed `color`, `text-decoration` and
// `border-bottom` on hover. This paper's ONE hover move is none of
// those: `.link-draw` / `.link-draw-quiet` grow a linear-gradient's
// `background-size` from 0% to 100% of a 1px band (globals.css). A probe
// blind to background-size is blind to every hover on the site, and the
// wordmark — which carries `.link-draw-quiet`, the same move minus the
// resting hairline — is where that blindness first showed. This reads
// the property the ink is actually drawn with.
if (want("hover")) {
  console.log("\n=== hover response (background-size is the house move) ===");
  const { ctx, page } = await at(1440, "/", 900);
  const targets = await page.evaluate(() =>
    [...document.querySelectorAll("header a, header button")].map((el, i) => ({
      i,
      t:
        (el.textContent ?? "").trim().slice(0, 24) ||
        el.getAttribute("aria-label") ||
        "(icon)",
    }))
  );
  for (const { i, t } of targets) {
    /* Read the anchor AND its first element child: three masthead
       affordances (avatar plate, mail chip, resume chip) are `group-hover`
       controls whose response lives on the inner span's border or fill, so
       an anchor-only reading calls them dead in exactly the way the
       nitpick rig called the wordmark dead. */
    const read = () =>
      page.evaluate((n) => {
        const el = [...document.querySelectorAll("header a, header button")][n];
        const of = (node) => {
          const cs = getComputedStyle(node);
          return [
            cs.backgroundSize,
            cs.color,
            cs.backgroundColor,
            cs.borderColor,
            cs.textDecorationLine,
          ].join(" | ");
        };
        return {
          bg: getComputedStyle(el).backgroundSize,
          self: of(el),
          child: el.firstElementChild ? of(el.firstElementChild) : "",
        };
      }, i);
    const before = await read();
    await page
      .evaluate((n) => {
        const el = [...document.querySelectorAll("header a, header button")][n];
        el.scrollIntoView({ block: "center" });
      }, i)
      .catch(() => {});
    const box = await page
      .evaluate((n) => {
        const el = [...document.querySelectorAll("header a, header button")][n];
        const b = el.getBoundingClientRect();
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      }, i)
      .catch(() => null);
    if (box) await page.mouse.move(box.x, box.y);
    await page.waitForTimeout(420);
    const after = await read();
    const moved = ["self", "child"].filter(
      (k) => before[k] !== "" && before[k] !== after[k]
    );
    await page.mouse.move(0, 0);
    await page.waitForTimeout(320);
    console.log(
      `  ${t.padEnd(26)} ${moved.length ? moved.join("+") : "NOTHING"}` +
        `   bg ${before.bg} → ${after.bg}`
    );
    if (moved.length === 0) failed = true;
  }
  await ctx.close();
}

/* ── 6 · the day arc down the home page ───────────────────────────── */
if (want("arc")) {
  console.log("\n=== day arc: composed canvas by scroll position ===");
  const { ctx, page } = await at(1440, "/", 900);
  const samples = await page.evaluate(async () => {
    const out = [];
    const chapters = [...document.querySelectorAll("[data-chapter]")].map(
      (el) => ({
        id: el.dataset.chapter,
        top: Math.round(el.getBoundingClientRect().top + window.scrollY),
        h: Math.round(el.getBoundingClientRect().height),
      })
    );
    const max = document.documentElement.scrollHeight - window.innerHeight;
    for (let y = 0; y <= max; y += 350) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 260));
      const field = document.querySelector("[data-light-field]");
      const cs = field ? getComputedStyle(field) : null;
      out.push({
        y,
        l: field?.style.getPropertyValue("--arc-l") || "",
        c: field?.style.getPropertyValue("--arc-c") || "",
        h: field?.style.getPropertyValue("--arc-h") || "",
        bg: cs ? cs.backgroundColor : "",
        phase: document.documentElement.getAttribute("data-arc-phase") ?? "-",
      });
    }
    return { chapters, out, max };
  });
  console.log(
    "chapters: " +
      samples.chapters.map((c) => `${c.id}@${c.top}+${c.h}`).join("  ")
  );
  let prev = null;
  let distinct = 0;
  for (const s of samples.out) {
    const key = `${s.l}|${s.c}|${s.h}`;
    const changed = key !== prev;
    if (changed) distinct++;
    prev = key;
    console.log(
      String(s.y).padStart(7) +
        "  L " +
        (s.l || "—").padEnd(7) +
        " C " +
        (s.c || "—").padEnd(7) +
        " H " +
        (s.h || "—").padEnd(7) +
        " " +
        s.phase.padEnd(5) +
        (changed ? "" : "  = same as previous")
    );
  }
  console.log(`distinct arc states across the read: ${distinct}`);
  await ctx.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
