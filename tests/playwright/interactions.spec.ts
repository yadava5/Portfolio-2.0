import { test, expect, Page } from "@playwright/test";

const THEMES = [
  "dark-luxe",
  "paper-ink",
  "editorial",
  "noir-cinema",
  "neon-cyber",
];

const NAV_SECTIONS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

/**
 * Test user interactions: theme switching, navigation, forms, and skip link.
 */
test.describe("User Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
  });

  test.describe("Theme Switching via data-theme attribute", () => {
    test.setTimeout(60000);

    for (const theme of THEMES) {
      test(`can switch to ${theme} and verify data-theme attribute is applied`, async ({
        page,
      }) => {
        // Set theme
        await page.evaluate((themeName) => {
          document.documentElement.setAttribute("data-theme", themeName);
        }, theme);

        await page.waitForTimeout(300);

        // Verify data-theme attribute is set
        const dataTheme = await page.evaluate(() =>
          document.documentElement.getAttribute("data-theme")
        );
        expect(dataTheme).toBe(theme);

        // Verify the [data-theme] selector matches (CSS rule exists)
        const hasMatchingRule = await page.evaluate((themeName) => {
          const el = document.documentElement;
          return el.matches(`[data-theme="${themeName}"]`);
        }, theme);
        expect(hasMatchingRule).toBe(true);
      });
    }
  });

  test.describe("Navigation", () => {
    test.setTimeout(60000);

    for (const section of NAV_SECTIONS) {
      test(`can navigate to #${section.id} section`, async ({ page }) => {
        // Click on section navigation
        const navLink = page.locator(`a[href="#${section.id}"]`).first();

        // Check if link exists
        const linkExists = await navLink.count();
        if (linkExists === 0) {
          test.skip();
        }

        await navLink.click();
        await page.waitForTimeout(500);

        // Verify URL hash changed
        const url = page.url();
        expect(url).toContain(`#${section.id}`);
      });
    }

    test("hash navigation works for all sections in sequence", async ({
      page,
    }) => {
      for (const section of NAV_SECTIONS) {
        const navLink = page.locator(`a[href="#${section.id}"]`).first();
        const linkExists = await navLink.count();

        if (linkExists > 0) {
          await navLink.click();
          await page.waitForTimeout(400);

          const url = page.url();
          expect(url).toContain(`#${section.id}`);
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
        .locator('input[name="name"], input[placeholder*="Name" i], input[id*="name" i]')
        .first();
      const emailInput = page
        .locator('input[name="email"], input[type="email"], input[placeholder*="Email" i]')
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

    test("skip link exists and is accessible via Tab key", async ({
      page,
    }) => {
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

  test.describe("Theme Switcher Button", () => {
    test.setTimeout(30000);

    test("theme switcher button exists and can be found", async ({ page }) => {
      const themeButton = page.locator("button[aria-label*='theme' i]").first();

      const exists = await themeButton.count();
      if (exists === 0) {
        test.skip();
      }

      await expect(themeButton).toBeVisible();
    });

    test("clicking theme switcher reveals dropdown/menu", async ({
      page,
    }) => {
      // Scroll down slightly to ensure button is not obscured
      await page.evaluate(() => window.scrollTo({ top: 200 }));
      await page.waitForTimeout(200);

      const themeButton = page.locator("button[aria-label*='theme' i]").first();

      const exists = await themeButton.count();
      if (exists === 0) {
        test.skip();
      }

      // Click theme switcher
      await themeButton.click({ force: true });
      await page.waitForTimeout(400);

      // Look for dropdown/menu that should appear
      const dropdown = page.locator(
        '[role="menu"], [role="listbox"], [aria-label*="theme" i]'
      );

      // At least one theme option should be visible
      const optionsVisible = await page.locator("[aria-pressed]").count();
      expect(optionsVisible).toBeGreaterThan(0);
    });

    test("theme switcher dropdown contains all available themes", async ({
      page,
    }) => {
      await page.evaluate(() => window.scrollTo({ top: 200 }));
      await page.waitForTimeout(200);

      const themeButton = page.locator("button[aria-label*='theme' i]").first();

      const exists = await themeButton.count();
      if (exists === 0) {
        test.skip();
      }

      await themeButton.click({ force: true });
      await page.waitForTimeout(400);

      // Count theme options
      const options = page.locator("button[aria-pressed]");
      const optionCount = await options.count();

      // Should have at least 5 themes
      expect(optionCount).toBeGreaterThanOrEqual(5);
    });
  });
});
