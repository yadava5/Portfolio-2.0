import { test, expect, Page } from "@playwright/test";

const THEMES = [
  { name: "paper-ink", label: "Paper & Ink" },
  { name: "gallery", label: "Gallery" },
  { name: "dark-luxe", label: "Dark Luxe" },
  { name: "editorial", label: "Editorial" },
  { name: "noir-cinema", label: "Noir Cinema" },
  { name: "neon-cyber", label: "Neon Cyber" },
];

const NAV_SECTIONS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const EXPECTED_CONTENT = {
  name: "Ayush Yadav",
  email: "aesh_1055@icloud.com",
  location: "Oxford, Ohio",
};

const PROJECT_IMAGES = [
  "/images/projects/jobtracker.png",
  "/images/projects/automl.png",
  "/images/projects/visual-assist.png",
  "/images/projects/taskflow.png",
  "/images/projects/mnist.png",
  "/images/projects/lifequest.png",
  "/images/projects/pipeline.png",
  "/images/projects/policybot.png",
  "/images/projects/advocacy.png",
];

const COMPANY_LOGOS = [
  "/images/companies/miami.png",
  "/images/companies/aramark.png",
];

const EXTERNAL_LINKS = {
  github: "https://github.com/yadava5",
  linkedin: "https://www.linkedin.com/in/ayush-yadav-developer/",
  jobtracker: "https://github.com/yadava5/jobtracker",
  visualAssist: "https://github.com/yadava5/VisualAssist",
  taskflow: "https://github.com/yadava5/taskflow-calendar",
  fastMnist: "https://github.com/yadava5/fast-mnist-nn",
  lifequest: "https://github.com/yadava5/lifequest",
  advocacy: "https://github.com/yadava5/paid-internships-advocacy",
  advocacyLive: "https://yadava5.github.io/paid-internships-advocacy",
};

interface ConsoleMessage {
  text: string;
  type: string;
}

async function switchThemeAndWait(
  page: Page,
  theme: { name: string; label: string }
) {
  // Scroll down to prevent hero elements overlapping the theme switcher on mobile
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await page.waitForTimeout(300);

  // Open theme switcher
  const switcher = page.locator("button[aria-label*='Select theme']");
  await switcher.click({ force: true });
  await page.waitForTimeout(500);

  // Click the target theme
  const themeButton = page
    .locator("button[aria-pressed]")
    .filter({ hasText: theme.label });
  await themeButton.first().click();
  await page.waitForTimeout(1000);

  // Verify the theme attribute was set
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme.name, {
    timeout: 10000,
  });

  // Wait for lazy-loaded components to mount
  await page.locator("#about").waitFor({ state: "attached", timeout: 20000 });

  // Scroll through the full page to ensure all sections are loaded
  const totalHeight = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const steps = Math.ceil(totalHeight / (viewportHeight * 0.6));
  for (let i = 0; i <= steps; i++) {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      i * viewportHeight * 0.6
    );
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(1000);
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
      for (const section of NAV_SECTIONS) {
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
      const githubLink = page.locator(`a[href="${EXTERNAL_LINKS.github}"]`);
      if (!(await githubLink.isVisible())) {
        warnings.push(`[${theme.name}] GitHub link not visible on page`);
      }

      // Check for LinkedIn link
      const linkedinLink = page.locator(`a[href="${EXTERNAL_LINKS.linkedin}"]`);
      if (!(await linkedinLink.isVisible())) {
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

      // Check for "Featured Work" or similar heading
      const projectHeadings = await page
        .locator("h2, h3")
        .filter({ hasText: /Featured|Project/i })
        .all();
      if (projectHeadings.length === 0) {
        warnings.push(`[${theme.name}] No project section heading found`);
      }

      // ========== SECTION 7: PROJECT IMAGES ==========
      for (const imgPath of PROJECT_IMAGES) {
        try {
          const response = await page.request.get(
            `http://localhost:3000${imgPath}`
          );
          if (response.status() !== 200) {
            errors.push(
              `[${theme.name}] Project image ${imgPath} returned status ${response.status()}`
            );
          }
        } catch (e) {
          errors.push(
            `[${theme.name}] Failed to fetch project image ${imgPath}`
          );
        }
      }

      // ========== SECTION 8: COMPANY LOGOS ==========
      for (const logoPath of COMPANY_LOGOS) {
        try {
          const response = await page.request.get(
            `http://localhost:3000${logoPath}`
          );
          if (response.status() !== 200) {
            errors.push(
              `[${theme.name}] Company logo ${logoPath} returned status ${response.status()}`
            );
          }
        } catch (e) {
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

      // Check for skill tags
      const skillElements = await page
        .locator("[class*='skill'], [class*='tag']")
        .all();
      if (skillElements.length === 0) {
        warnings.push(`[${theme.name}] No skill elements found`);
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
        const alt = await img.getAttribute("alt");
        if (!alt || alt.trim() === "") {
          const src = await img.getAttribute("src");
          if (!src?.includes("data:")) {
            warnings.push(`[${theme.name}] Image without alt text: ${src}`);
          }
        }
        // Check if image is visible (loaded)
        const visible = await img.isVisible();
        if (!visible) {
          const src = await img.getAttribute("src");
          warnings.push(`[${theme.name}] Image not visible: ${src}`);
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
      const gradDate = await page.locator(`:text("May 2026")`).isVisible();
      if (!gradDate) {
        warnings.push(`[${theme.name}] Graduation date "May 2026" not found`);
      }

      // Check for featured projects count
      const featuredText = await page
        .locator("text=/5 featured|featured.*project/i")
        .isVisible();
      if (!featuredText) {
        warnings.push(
          `[${theme.name}] Featured projects reference not clearly visible`
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

      // ========== SECTION 21: DARK LUXE SPECIFIC CHECKS ==========
      if (theme.name === "dark-luxe") {
        // Check for gold/accent colors in styles
        const hasAccentColor = await page.evaluate(() => {
          const html = document.documentElement;
          const computed = getComputedStyle(html);
          return (
            computed.getPropertyValue("--accent-primary") ||
            computed.getPropertyValue("--color-primary")
          );
        });
        if (!hasAccentColor) {
          warnings.push(
            `[${theme.name}] Dark Luxe theme colors not properly set`
          );
        }
      }

      // ========== SECTION 22: NEON CYBER SPECIFIC CHECKS ==========
      if (theme.name === "neon-cyber") {
        // Check for neon colors
        const pageHTML = await page.content();
        if (!pageHTML.includes("00ff88") && !pageHTML.includes("#00ff88")) {
          warnings.push(`[${theme.name}] Neon green color not found in HTML`);
        }
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
  test("Theme switcher works on all themes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    for (const theme of THEMES) {
      await switchThemeAndWait(page, theme);
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
        } catch (e) {
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

  test("Mobile view: Theme switcher accessible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const switcher = page.locator(
      "button[aria-label*='Select theme'], button[aria-label*='theme']"
    );
    await expect(switcher).toBeVisible();
    await expect(switcher).toBeEnabled();
  });

  test("Section IDs do not have HTML issues", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check each section ID is unique and properly formatted
    const sectionIds = [];
    for (const section of NAV_SECTIONS) {
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
    const response = await page.request.get("http://localhost:3000/resume.pdf");
    expect(response.status()).toBe(200);
  });
});
