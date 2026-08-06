import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * axe-core over the three surfaces the site actually has.
 *
 * KEPT THROUGH PHASE 4, DELIBERATELY, when twenty other specs were not. This
 * is the only automated accessibility coverage in the repository, and Phase 4
 * replaced every case-file DOM in the site — a rebuild is exactly when you
 * want the check, not when you want to lose it. The plan's spec triage did not
 * name this file either way; that is the ruling.
 *
 * WHAT WENT: the theme loop (one identity ships; `THEMES` was a one-element
 * fixture kept so the suite would compile), and a hand-written token-contrast
 * table. The table measured `#b04a28` and five intermediate waypoints —
 * measured on 2026-08-06, three of its twenty-one colours still appear in
 * `src/run/index.html` and the clay it spent most of its assertions on appears
 * nowhere on the site. A contrast gate over the run's own `:root` tokens is
 * worth building; a gate over a palette that has been retired is worse than
 * none, because it reports green about colours no reader sees.
 *
 * THE ROUTES ARE THE THREE SHAPES OF PAGE, not a sample: the run (one
 * hand-authored document, thirteen sections, its own inline CSS), a case file
 * (the generated template, seven times over), and the evidence index (the
 * generated ledger). 404.html is the fourth and is checked by the static SEO
 * gate for the things that can go wrong with it.
 *
 * `color-contrast` stays disabled. It was disabled here because Tailwind 4's
 * custom-property chain did not resolve headless; Tailwind is gone, but the
 * run paints its ink as a composite over a scroll-driven day arc, which axe
 * reads as a single frame and cannot judge. Contrast on the run is a
 * measurement problem, not a rule-engine one.
 */
const ROUTES = [
  { path: "/", what: "the run" },
  { path: "/projects/automl/", what: "a case file" },
  { path: "/evidence/", what: "the evidence index" },
];

test.describe("accessibility", () => {
  test.setTimeout(90000);

  for (const route of ROUTES) {
    test(`${route.what} (${route.path}) has no serious axe violations`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2aa", "wcag21aa"])
        .disableRules(["color-contrast"])
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );
      /* Printed before the assertion, so a red run names the element rather
         than a count. Moderate and minor are reported and not enforced —
         that was the standing posture and this rewrite does not change it. */
      for (const v of results.violations) {
        console.log(
          `  [${v.impact}] ${v.id}: ${v.description} — ${v.nodes.length} node(s)`
        );
        for (const node of v.nodes.slice(0, 3)) {
          console.log(`      ${node.target.join(" ")}`);
        }
      }
      expect(
        blocking.map((v) => v.id),
        `${route.path} must have no critical or serious violations`
      ).toEqual([]);
    });
  }

  /* THE SKIP LINK IS THE ONE THING THE REBUILD ADDED ON PURPOSE and nothing
     else gates. The archive's pages are generated now; the root layout that
     used to carry this is deleted, so it exists because `html.mjs` writes it,
     and a template edit could drop it without a single other check noticing.
     Asserted as behaviour — focused first, visible, and lands on the element
     it names — rather than as the presence of a string. */
  test("the archive's skip link is the first stop for a keyboard", async ({
    page,
  }) => {
    await page.goto("/projects/automl/");
    await page.waitForLoadState("domcontentloaded");

    await page.keyboard.press("Tab");
    const skip = page.locator("a.skip-link");
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await expect(skip).toHaveAttribute("href", "#main-content");
    await expect(page.locator("#main-content")).toHaveCount(1);
  });
});
