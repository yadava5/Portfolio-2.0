import { test, expect } from "@playwright/test";

// The seven working-paper chapters. In-page anchors (`a[href="#…"]`) come
// from the chapter rail (xl+) and the hero's "skip to the work" affordance;
// clicks route through Lenis (which keeps the URL hash clean by design), so
// navigation is asserted by landing the target chapter in the viewport.
const NAV_SECTIONS = [
  { id: "arrival", label: "Arrival" },
  { id: "who", label: "Who" },
  { id: "path", label: "The Path" },
  { id: "automl", label: "AutoML" },
  { id: "work", label: "The Work" },
  { id: "values", label: "How I work" },
  { id: "gate", label: "The Approval Gate" },
];

/**
 * Test user interactions: single identity, navigation, forms, and skip link.
 */
test.describe("User Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
  });

  test.describe("Single Identity", () => {
    test.setTimeout(30000);

    test("no public theme selector is rendered", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /select theme/i })
      ).toHaveCount(0);
    });
  });

  test.describe("Navigation", () => {
    test.setTimeout(60000);

    for (const section of NAV_SECTIONS) {
      test(`can navigate to #${section.id} section`, async ({ page }) => {
        // Click on section navigation
        const navLink = page.locator(`a[href="#${section.id}"]`).first();

        // Check if a visible in-page anchor exists at this viewport
        const linkExists = await navLink.count();
        if (linkExists === 0 || !(await navLink.isVisible())) {
          test.skip();
        }

        await navLink.click();

        // Verify the chapter landed in the viewport (Lenis-handled scroll)
        await expect(page.locator(`#${section.id}`)).toBeInViewport({
          timeout: 5000,
        });
      });
    }

    test("anchor navigation works for all sections in sequence", async ({
      page,
    }) => {
      for (const section of NAV_SECTIONS) {
        const navLink = page.locator(`a[href="#${section.id}"]`).first();
        const linkExists = await navLink.count();

        if (linkExists > 0 && (await navLink.isVisible())) {
          await navLink.click();
          await expect(page.locator(`#${section.id}`)).toBeInViewport({
            timeout: 5000,
          });
        }
      }
    });
  });

  test.describe("Contact Form", () => {
    test.setTimeout(30000);

    test("contact form fields are fillable without errors", async ({
      page,
    }) => {
      // Find contact form elements
      const nameInput = page
        .locator(
          'input[name="name"], input[placeholder*="Name" i], input[id*="name" i]'
        )
        .first();
      const emailInput = page
        .locator(
          'input[name="email"], input[type="email"], input[placeholder*="Email" i]'
        )
        .first();
      const messageInput = page
        .locator('textarea[name="message"], textarea[placeholder*="Message" i]')
        .first();

      // Check if form elements exist
      const nameExists = await nameInput.count();
      const emailExists = await emailInput.count();
      const messageExists = await messageInput.count();

      if (nameExists === 0 || emailExists === 0 || messageExists === 0) {
        test.skip();
      }

      // Track console errors
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      // Fill form fields
      if (nameExists > 0) {
        await nameInput.fill("Test User");
      }
      if (emailExists > 0) {
        await emailInput.fill("test@example.com");
      }
      if (messageExists > 0) {
        await messageInput.fill("Test message for contact form");
      }

      await page.waitForTimeout(300);

      // Verify no error alerts appeared
      const alertLocator = page.locator("alert, [role='alert']");
      const alertCount = await alertLocator.count();
      expect(alertCount).toBe(0);

      // Verify no console errors related to form input
      const formErrors = errors.filter(
        (e) =>
          !e.includes("404") &&
          !e.includes("favicon") &&
          !e.includes("Failed to load resource")
      );
      expect(formErrors.length).toBe(0);
    });
  });

  test.describe("Skip Link", () => {
    test.setTimeout(30000);

    test("skip link exists and is accessible via Tab key", async ({ page }) => {
      // Press Tab to focus skip link
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);

      // Find skip link
      const skipLink = page.locator(
        'a[href*="#main"], a[href*="#content"], a[href*="#skip"]'
      );

      const skipLinkCount = await skipLink.count();
      if (skipLinkCount === 0) {
        test.skip();
      }

      // Verify skip link is focused or findable
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      // Skip link should be an anchor tag
      expect(focusedElement).toBe("A");
    });

    test("skip link targets main-content or similar", async ({ page }) => {
      const skipLink = page.locator(
        'a[href*="#main"], a[href*="#content"], a[href*="#skip"]'
      );

      const skipLinkCount = await skipLink.count();
      if (skipLinkCount === 0) {
        test.skip();
      }

      // Get href attribute
      const href = await skipLink.first().getAttribute("href");
      expect(href).toBeTruthy();

      // Should target something meaningful (contains "main", "content", etc.)
      const isValidTarget =
        href?.includes("main") ||
        href?.includes("content") ||
        href?.includes("skip");
      expect(isValidTarget).toBe(true);
    });
  });
});
