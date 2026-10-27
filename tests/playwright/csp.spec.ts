import { expect, test, type Page } from "@playwright/test";
import { CASE_STUDY_IDS } from "./case-file-fixtures";

/**
 * Every page runs under its content security policy, and the policy is live.
 *
 * scripts/qa/check-csp.mjs proves the tag is there and that its hashes match
 * the page's inline scripts. Only a browser can prove the other two things:
 * that nothing the page actually loads is refused (a wasm compile, a dynamic
 * import, a data: ground in a stylesheet), and that the policy refuses what it
 * should. The second test is the control for the first: it shows the collector
 * sees a violation when there is one, so an empty list means none happened
 * rather than none were heard.
 *
 * THIS IS THE SPEC THAT FOUND THE ICONS. Every head links its favicons by
 * absolute https://ayush-yadav.com URL, and the first policy allowed only
 * 'self', so on this local server every route was refused its favicon. The
 * policy now names the site's origin; 404.html, whose stylesheet and scripts
 * are absolute for the same reason, is the route that proves it.
 */

const ROUTES = [
  "/",
  ...CASE_STUDY_IDS.map((id) => `/projects/${id}/`),
  "/evidence/",
  /* any unmatched path is served 404.html, as GitHub Pages does */
  "/no-such-page/",
];

/** Collect every violation from the first byte, before the page's own scripts. */
async function collectViolations(page: Page) {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __csp: string[] }).__csp = seen;
    document.addEventListener(
      "securitypolicyviolation",
      (e) =>
        seen.push(
          `${e.effectiveDirective} refused ${e.blockedURI || "inline"}`
        ),
      true
    );
  });
}

const violations = (page: Page) =>
  page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);

test.describe("content security policy", () => {
  for (const route of ROUTES) {
    test(`${route} loads with nothing refused`, async ({ page }) => {
      await collectViolations(page);
      await page.goto(route, { waitUntil: "load" });
      await expect(
        page.locator('meta[http-equiv="Content-Security-Policy"]')
      ).toHaveCount(1);
      if (route === "/") {
        /* The two things on the run a stricter policy would break first: the
           first inline script (it adds .js before <body> exists) and the
           Glyph station's wasm, which needs 'wasm-unsafe-eval' to compile.
           "awake · local" is the station's own report that it did. */
        await expect(page.locator("html")).toHaveClass(/\bjs\b/);
        await expect(page.locator("#glyphStatus")).toHaveText("awake · local", {
          timeout: 15_000,
        });
      }
      expect(await violations(page)).toEqual([]);
    });
  }

  test("an inline script the build did not write is refused", async ({
    page,
  }) => {
    await collectViolations(page);
    await page.goto("/projects/automl/", { waitUntil: "load" });
    const ran = await page.evaluate(async () => {
      const s = document.createElement("script");
      s.textContent = "window.__injected = true";
      document.head.append(s);
      await new Promise((r) => setTimeout(r, 250));
      return (
        (window as unknown as { __injected?: boolean }).__injected === true
      );
    });
    expect(ran, "the injected script must not run").toBe(false);
    const seen = await violations(page);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatch(/^script-src(-elem)? refused inline$/);
  });
});
