import { expect, test } from "@playwright/test";

/**
 * The HELD apparatus — the honesty engine's mechanism for a number the
 * site states but cannot yet reproduce from a committed artifact.
 *
 * WHY THIS FILE EXISTS. On 2026-07-30 Glyph's accuracy claim was earned,
 * its stamp came off, and the site's last held row went with it. The
 * apparatus is therefore unreachable from production data — measured,
 * `grep -rn "held:" src/lib/data/` returns three hits and none is a live
 * entry. Nothing rendered these paths, so nothing would have caught them
 * rotting, and the next claim needing to be held would have discovered
 * the breakage on a case file in front of a reader.
 *
 * It runs against `/probe/held/`, which is a route ONLY under
 * `NEXT_PUBLIC_TEST_PROBES=1` (see next.config.ts `pageExtensions`), and
 * which renders the real `EvidenceTable` with a fixture row rather than
 * a copy of its markup.
 *
 * THE FIXTURE IS THREE ROWS ON PURPOSE — earned, held, described-only —
 * because a test that only ever sees a held row cannot distinguish "the
 * held branch works" from "every row renders a dash". Two of the
 * assertions below are about the OTHER two rows for exactly that reason.
 *
 * KNOWN GAP, recorded rather than glossed: `/evidence` carries a second
 * variant of this apparatus (`data-held-entry` plus a `status: held —
 * not yet earned` row) which shares only `HeldStamp` with the case-file
 * one. Its two fragments live in two different grid cells of that page;
 * covering them honestly means extracting and restructuring those cells,
 * a larger production change than the gap warrants. It is uncovered.
 */

const PROBE = "/probe/held/";

test.describe("the HELD apparatus", () => {
  test("the held row wears the dashed stamp, and only the held row does", async ({
    page,
  }) => {
    await page.goto(PROBE);

    const rows = page.locator("[data-receipt-row]");
    await expect(rows).toHaveCount(3);

    /* receiptAuditState's four-way branch, all of it reachable here */
    await expect(rows.nth(0)).toHaveAttribute("data-audit", "artifact");
    await expect(rows.nth(1)).toHaveAttribute("data-audit", "held");
    await expect(rows.nth(2)).toHaveAttribute("data-audit", "described");

    /* The stamp is singular — a page-wide count, not a per-row one, so
       a stamp leaking onto a neighbouring row fails here too. */
    const stamps = page.getByRole("img", {
      name: /stamp: held — not yet earned/i,
    });
    await expect(stamps).toHaveCount(1);
    await expect(rows.nth(1).getByRole("img")).toHaveCount(1);
  });

  test("the stamp is dashed clay and never a tick", async ({ page }) => {
    await page.goto(PROBE);

    /* Dashed, measured off the rendered SVG rather than the class name:
       the design law reserves the dashed outline for a gate that has NOT
       signed, and a solid stroke here would read as approval.

       Scoped to the STAMP, not to the row. `[data-audit='held'] svg
       path` first-match returns the AuditGlyph at the number's
       shoulder — a held row carries two SVGs, and the mark comes first
       in DOM order. The first cut of this assertion read that one and
       failed on a null dasharray, which is the locator being wrong
       rather than the site. */
    const stroke = await page
      .getByRole("img", { name: /stamp: held — not yet earned/i })
      .locator("svg path")
      .first()
      .evaluate((el) => ({
        dash: el.getAttribute("stroke-dasharray"),
        fill: getComputedStyle(el).fill,
      }));
    expect(stroke.dash).toBe("5 5");
    expect(stroke.fill).toBe("none");

    /* Clay, not ink. The colour carries the meaning (clay is reserved
       for decisions and gates), so assert the resolved channel — a
       refactor that kept the class and lost the token would pass a
       class-name check and fail a reader. */
    const colour = await page
      .getByRole("img", { name: /stamp: held/i })
      .evaluate((el) => getComputedStyle(el).color);
    const clay = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--clay")
        .trim()
    );
    expect(colour).not.toBe("");
    if (clay) {
      const resolved = await page.evaluate((raw) => {
        const probe = document.createElement("span");
        probe.style.color = raw.startsWith("--") ? `var(${raw})` : raw;
        document.body.appendChild(probe);
        const c = getComputedStyle(probe).color;
        probe.remove();
        return c;
      }, clay);
      expect(colour).toBe(resolved);
    }

    /* The held row carries the ink DASH mark, never the stamp-rust tick
       that a pinned artifact earns. */
    await expect(
      page.locator("[data-receipt-row][data-audit='held'] .audit-mark-dash")
    ).toHaveCount(1);
    await expect(
      page.locator("[data-receipt-row][data-audit='held'] .audit-mark-tick")
    ).toHaveCount(0);
    await expect(
      page.locator("[data-receipt-row][data-audit='artifact'] .audit-mark-tick")
    ).toHaveCount(1);
  });

  test("the footnote names the release condition and its pointer resolves", async ({
    page,
  }) => {
    await page.goto(PROBE);

    const held = page.locator("[data-receipt-row][data-audit='held']");
    await expect(held).toContainText(
      "probe fixture sentinel — held until a probe earns it"
    );

    /* A stamp without a stated release condition is decoration; a
       footnote whose pointer dangles is worse than none. Assert the
       anchor LANDS, not merely that a link was rendered — dangling
       in-page links are exactly what a render-only test misses. */
    const link = held.getByRole("link", { name: /see corrections/i });
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute("href");
    expect(href).toBe("#corrections");
    await expect(page.locator("#corrections")).toHaveCount(1);
  });

  test("the stamp is legible — it is text, and it survives print", async ({
    page,
  }) => {
    await page.goto(PROBE);

    /* The stamp's words are real SVG <text>, not a path or an image, so
       a reader zooming or a machine reading the page gets the words. */
    const words = await page
      .locator("[data-receipt-row][data-audit='held'] svg text")
      .allTextContents();
    expect(words.map((w) => w.trim())).toEqual(["HELD", "not yet earned"]);

    /* A7: the static world must state the same thing as the live one.
       A held claim that silently loses its stamp on paper would print a
       bare unearned number — the single worst failure this apparatus
       can have. */
    await page.emulateMedia({ media: "print" });
    await expect(
      page.getByRole("img", { name: /stamp: held — not yet earned/i })
    ).toBeVisible();
    await expect(
      page.locator("[data-receipt-row][data-audit='held']")
    ).toContainText("probe fixture sentinel — held until a probe earns it");
  });

  test("reduced motion changes nothing — the stamp never moves", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(PROBE);

    const stamp = page.getByRole("img", { name: /stamp: held/i });
    await expect(stamp).toBeVisible();

    /* HeldStamp's own docstring promises "no motion in any world".
       Assert it rather than trusting it. */
    const motion = await stamp.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        animation: s.animationName,
        transition: s.transitionProperty,
      };
    });
    expect(motion.animation).toBe("none");
    expect(["none", "all"]).toContain(motion.transition);
  });
});
