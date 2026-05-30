import { test, expect } from "@playwright/test";
import {
  absoluteUrl,
  applyThemeState,
  COMPANY_LOGOS,
  EXPECTED_CONTENT,
  EXPECTED_LINKS,
  PUBLIC_PROJECT_IMAGES,
  THEMES,
  switchThemeAndWait,
} from "./portfolio-fixtures";

const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

interface ConsoleMessage {
  text: string;
  type: string;
}

test.describe("COMPREHENSIVE QA TEST - ALL THEMES", () => {
  test.setTimeout(120000); // 2 minutes per test
  test.use({ viewport: { width: 1280, height: 720 } }); // Desktop only

  for (const theme of THEMES) {
    test(`[${theme.name}] Full page audit`, async ({ page }) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const consoleLogs: ConsoleMessage[] = [];

      // Set up console listener
      page.on("console", (msg) => {
        consoleLogs.push({
          text: msg.text(),
          type: msg.type(),
        });
        if (msg.type() === "error") {
          errors.push(`Console error: ${msg.text()}`);
        }
      });

      // Set up error listener
      page.on("pageerror", (err) => {
        errors.push(`Page error: ${err.message}`);
      });

      // Navigate and load
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      // Switch theme
      await switchThemeAndWait(page, theme);

      // ========== SECTION 1: NAVIGATION & SECTION IDs ==========
      for (const section of NAV_LINKS) {
        const sectionEl = page.locator(`#${section.id}`);
        if (!(await sectionEl.isVisible())) {
          errors.push(`[${theme.name}] Section #${section.id} not visible`);
        }
        await expect(sectionEl).toBeAttached({ timeout: 10000 });
      }

      // ========== SECTION 2: PERSONAL INFO CONTENT ==========
      // Check for name
      const nameElements = await page
        .locator(`:text("${EXPECTED_CONTENT.name}")`)
        .all();
      if (nameElements.length === 0) {
        errors.push(
          `[${theme.name}] Name "${EXPECTED_CONTENT.name}" not found on page`
        );
      }

      // Check for email
      const emailElements = await page
        .locator(`:text("${EXPECTED_CONTENT.email}")`)
        .all();
      if (emailElements.length === 0) {
        errors.push(
          `[${theme.name}] Email "${EXPECTED_CONTENT.email}" not found on page`
        );
      }

      // Check for location
      const locationElements = await page
        .locator(`:text("${EXPECTED_CONTENT.location}")`)
        .all();
      if (locationElements.length === 0) {
        warnings.push(
          `[${theme.name}] Location "${EXPECTED_CONTENT.location}" not found`
        );
      }

      // ========== SECTION 3: NAV LINK FUNCTIONALITY ==========
      // Get all anchor links with href starting with #
      const navLinks = await page.locator('a[href^="#"]').all();
      for (const link of navLinks) {
        const href = await link.getAttribute("href");
        if (href && href.startsWith("#")) {
          const sectionId = href.substring(1);
          const targetSection = page.locator(`#${sectionId}`);
          try {
            await expect(targetSection).toBeAttached({ timeout: 5000 });
          } catch {
            errors.push(
              `[${theme.name}] Nav link ${href} points to non-existent section`
            );
          }
        }
      }

      // ========== SECTION 4: EXTERNAL LINKS ==========
      // Check for GitHub link
      const githubLink = page.locator(`a[href="${EXPECTED_LINKS.github}"]`);
      if (
        (await githubLink.count()) === 0 ||
        !(await githubLink.first().isVisible())
      ) {
        warnings.push(`[${theme.name}] GitHub link not visible on page`);
      }

      // Check for LinkedIn link
      const linkedinLink = page.locator(`a[href="${EXPECTED_LINKS.linkedin}"]`);
      if (
        (await linkedinLink.count()) === 0 ||
        !(await linkedinLink.first().isVisible())
      ) {
        warnings.push(`[${theme.name}] LinkedIn link not visible on page`);
      }

      // ========== SECTION 5: SOCIAL LINKS & ICONS ==========
      // Check for mail icon/link
      const mailLinks = await page.locator('a[href*="mailto:"]').all();
      if (mailLinks.length === 0) {
        warnings.push(`[${theme.name}] No mailto links found`);
      } else {
        // Verify it has correct email
        const mailLink = mailLinks[0];
        const href = await mailLink.getAttribute("href");
        if (!href?.includes(EXPECTED_CONTENT.email)) {
          errors.push(
            `[${theme.name}] mailto link does not include correct email`
          );
        }
      }

      // ========== SECTION 6: PROJECT SECTION CONTENT ==========
      const projectsSection = page.locator("#projects");
      if ((await projectsSection.count()) === 0) {
        errors.push(`[${theme.name}] Projects section #projects not found`);
      }

      // Check that the project section has visible heading/content. Theme copy
      // varies intentionally, so avoid matching only legacy heading labels.
      const projectHeadings = await projectsSection.locator("h2, h3, h4").all();
      if (projectHeadings.length === 0) {
        warnings.push(`[${theme.name}] No project section heading found`);
      }

      // ========== SECTION 7: PROJECT IMAGES ==========
      for (const imgPath of PUBLIC_PROJECT_IMAGES) {
        try {
          const response = await page.request.get(absoluteUrl(page, imgPath));
          if (response.status() !== 200) {
            errors.push(
              `[${theme.name}] Project image ${imgPath} returned status ${response.status()}`
            );
          }
        } catch {
          errors.push(
            `[${theme.name}] Failed to fetch project image ${imgPath}`
          );
        }
      }

      // ========== SECTION 8: COMPANY LOGOS ==========
      for (const logoPath of COMPANY_LOGOS) {
        try {
          const response = await page.request.get(absoluteUrl(page, logoPath));
          if (response.status() !== 200) {
            errors.push(
              `[${theme.name}] Company logo ${logoPath} returned status ${response.status()}`
            );
          }
        } catch {
          errors.push(
            `[${theme.name}] Failed to fetch company logo ${logoPath}`
          );
        }
      }

      // ========== SECTION 9: EXPERIENCE SECTION ==========
      const experienceSection = page.locator("#experience");
      if ((await experienceSection.count()) === 0) {
        errors.push(`[${theme.name}] Experience section #experience not found`);
      }

      // Check for job titles
      const jobTitleElements = await page
        .locator(`:text("ITSM Data Integration")`)
        .all();
      if (jobTitleElements.length === 0) {
        warnings.push(
          `[${theme.name}] Job title not found in Experience section`
        );
      }

      // ========== SECTION 10: SKILLS SECTION ==========
      const skillsSection = page.locator("#skills");
      if ((await skillsSection.count()) === 0) {
        errors.push(`[${theme.name}] Skills section #skills not found`);
      }

      // Check for visible skill/depth content. The Atlas theme presents proof
      // categories instead of generic skill chips, and alternate themes do not
      // need CSS class names containing "skill" to satisfy this contract.
      const skillsText = (await skillsSection.first().innerText()).trim();
      if (skillsText.length < 20) {
        warnings.push(`[${theme.name}] Skills section has too little content`);
      }

      // ========== SECTION 11: CONTACT SECTION ==========
      const contactSection = page.locator("#contact");
      if ((await contactSection.count()) === 0) {
        errors.push(`[${theme.name}] Contact section #contact not found`);
      }

      // Check for contact form or contact info
      const contactForms = await page.locator("form, [role='form']").all();
      const hasContactInfo = await page
        .locator(`:text("${EXPECTED_CONTENT.email}")`)
        .isVisible();

      if (contactForms.length === 0 && !hasContactInfo) {
        warnings.push(`[${theme.name}] No contact form or email info found`);
      }

      // ========== SECTION 12: RESUME LINK ==========
      const resumeLinks = await page.locator('a[href*="resume"]').all();
      if (resumeLinks.length === 0) {
        warnings.push(`[${theme.name}] No resume/CV link found`);
      }

      // ========== SECTION 13: THEME SWITCHER ==========
      const themeSwitcher = page.locator(
        "button[aria-label*='Select theme'], button[aria-label*='theme']"
      );
      if (!(await themeSwitcher.isVisible())) {
        errors.push(`[${theme.name}] Theme switcher not visible`);
      }

      // ========== SECTION 14: PLACEHOLDER CONTENT CHECK ==========
      const pageText = await page.textContent("body");
      if (pageText?.includes("Lorem ipsum")) {
        errors.push(
          `[${theme.name}] Lorem ipsum placeholder text found on page`
        );
      }
      if (pageText?.includes("PLACEHOLDER")) {
        errors.push(`[${theme.name}] PLACEHOLDER text found on page`);
      }
      if (pageText?.includes("TODO")) {
        errors.push(`[${theme.name}] TODO marker found on page`);
      }

      // ========== SECTION 15: IMAGES WITH LOADING ==========
      const images = await page.locator("img").all();
      for (const img of images) {
        // Responsive themes can keep alternate mobile/desktop copies in the DOM.
        // Hidden copies are validated by source-image checks above.
        if (!(await img.isVisible())) continue;

        const alt = await img.getAttribute("alt");
        if (!alt || alt.trim() === "") {
          const src = await img.getAttribute("src");
          if (!src?.includes("data:")) {
            warnings.push(`[${theme.name}] Image without alt text: ${src}`);
          }
        }
      }

      // ========== SECTION 16: CONSOLE ERRORS ==========
      const errorLogs = consoleLogs.filter((log) => log.type === "error");
      if (errorLogs.length > 0) {
        errors.push(
          `[${theme.name}] ${errorLogs.length} console errors detected`
        );
      }

      // ========== SECTION 17: ACCESSIBILITY CHECKS ==========
      // Check for buttons without accessible names
      const buttons = await page.locator("button").all();
      for (const btn of buttons) {
        const ariaLabel = await btn.getAttribute("aria-label");
        const textContent = await btn.textContent();
        if (!ariaLabel && (!textContent || textContent.trim() === "")) {
          warnings.push(
            `[${theme.name}] Button without aria-label or text content found`
          );
          break;
        }
      }

      // ========== SECTION 18: LINK HREFS ==========
      // Check that all external links have proper href
      const allLinks = await page.locator("a").all();
      let brokenLinks = 0;
      for (const link of allLinks) {
        const href = await link.getAttribute("href");
        if (!href || href.trim() === "") {
          brokenLinks++;
        }
      }
      if (brokenLinks > 0) {
        errors.push(
          `[${theme.name}] Found ${brokenLinks} links without href attribute`
        );
      }

      // ========== SECTION 19: SPECIFIC CONTENT CHECKS ==========
      // Check for graduation date mention
      const gradDateMatches = page.getByText(EXPECTED_CONTENT.graduation);
      const gradDateCount = await gradDateMatches.count();
      let gradDate = false;
      for (let index = 0; index < gradDateCount; index += 1) {
        if (await gradDateMatches.nth(index).isVisible()) {
          gradDate = true;
          break;
        }
      }

      if (!gradDate) {
        warnings.push(
          `[${theme.name}] Graduation date "${EXPECTED_CONTENT.graduation}" not found`
        );
      }

      // ========== SECTION 20: VIEWPORT & RESPONSIVENESS ==========
      // Check that no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      if (bodyWidth > viewportWidth) {
        warnings.push(
          `[${theme.name}] Horizontal overflow detected (${bodyWidth}px > ${viewportWidth}px)`
        );
      }

      // ========== REPORT RESULTS ==========
      console.log(`\n=== ${theme.name.toUpperCase()} QA REPORT ===`);
      console.log(`Errors found: ${errors.length}`);
      console.log(`Warnings: ${warnings.length}`);

      if (errors.length > 0) {
        console.log("\nCRITICAL ERRORS:");
        errors.forEach((e) => console.log(`  - ${e}`));
      }

      if (warnings.length > 0) {
        console.log("\nWARNINGS:");
        warnings.forEach((w) => console.log(`  - ${w}`));
      }

      // Assert no critical errors
      expect(
        errors,
        `[${theme.name}] Critical errors found:\n${errors.join("\n")}`
      ).toHaveLength(0);
    });
  }

  // ========== CROSS-THEME TESTS ==========
  test("Theme state applies on all themes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    for (const theme of THEMES) {
      await applyThemeState(page, theme);
      // Verify theme attribute
      const themeAttr = await page.locator("html").getAttribute("data-theme");
      expect(themeAttr).toBe(theme.name);
    }
  });

  test("All project links are valid URLs", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check each external project link
    const projectLinks = await page
      .locator('a[href*="github.com/yadava5"]')
      .all();
    for (const link of projectLinks) {
      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toMatch(/^https:\/\//);
    }
  });

  test("No dead image references in source", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const allImages = await page.locator("img").all();
    let missingImages = 0;

    for (const img of allImages) {
      const src = await img.getAttribute("src");
      if (src && !src.includes("data:")) {
        try {
          const response = await page.request.head(src).catch(() => null);
          if (!response || response.status() !== 200) {
            missingImages++;
            console.log(`Missing image: ${src}`);
          }
        } catch {
          missingImages++;
        }
      }
    }

    expect(missingImages, "All images should load successfully").toBe(0);
  });

  test("Contact form has required fields or contact info", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Scroll to contact section
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Check for either form or contact info
    const form = page.locator("form, [role='form']");
    const nameInput = page.locator('input[type="text"], input[name*="name" i]');
    const emailInput = page.locator(
      'input[type="email"], input[name*="email" i]'
    );
    const messageInput = page.locator(
      'textarea, input[type="text"][name*="message" i]'
    );

    const hasForm = (await form.count()) > 0;
    const hasNameField = (await nameInput.count()) > 0;
    const hasEmailField = (await emailInput.count()) > 0;
    const hasMessageField = (await messageInput.count()) > 0;

    // Either have a complete form or clear contact info
    const hasContactInfo = await page
      .locator(`:text("${EXPECTED_CONTENT.email}")`)
      .isVisible();

    const isValid = hasForm && hasNameField && hasEmailField && hasMessageField;
    expect(
      isValid || hasContactInfo,
      "Should have either a contact form with required fields or visible contact info"
    ).toBeTruthy();
  });

  test("Mobile view: Theme switcher stays hidden", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const switcher = page.locator(
      "button[aria-label*='Select theme'], button[aria-label*='theme']"
    );
    await expect(switcher).toBeHidden();
  });

  test("Section IDs do not have HTML issues", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check each section ID is unique and properly formatted
    const sectionIds = [];
    for (const section of NAV_LINKS) {
      const elements = await page.locator(`#${section.id}`).all();
      expect(
        elements.length,
        `Section #${section.id} should have exactly 1 element`
      ).toBe(1);
      sectionIds.push(section.id);
    }

    // Check no duplicate IDs on page
    const allIds = await page.evaluate(() => {
      const allElements = document.querySelectorAll("[id]");
      const idMap: Record<string, number> = {};
      allElements.forEach((el) => {
        const id = el.id;
        idMap[id] = (idMap[id] || 0) + 1;
      });
      return idMap;
    });

    for (const sectionId of sectionIds) {
      expect(
        allIds[sectionId],
        `Section ID #${sectionId} should be unique`
      ).toBe(1);
    }
  });

  test("Resume file exists and is accessible", async ({ page }) => {
    await page.goto("/");
    const response = await page.request.get(absoluteUrl(page, "/resume.pdf"));
    expect(response.status()).toBe(200);
  });
});
