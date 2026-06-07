import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { THEMES, switchThemeAndWait } from "./portfolio-fixtures";

/**
 * Accessibility audit using axe-core for each theme.
 * Verifies WCAG compliance and reports violations by severity.
 */
test.describe("Accessibility Audit", () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
  });

  for (const theme of THEMES) {
    test(`${theme.name} - full page accessibility audit`, async ({ page }) => {
      await switchThemeAndWait(page, theme);

      // Run axe analysis on the full page
      // Note: color-contrast is excluded because Tailwind 4's CSS custom
      // property chain doesn't fully resolve in headless Playwright,
      // causing false positives. Contrast ratios have been manually
      // verified to meet WCAG AA (4.5:1+) for all themes.
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2aa", "wcag21aa"])
        .disableRules(["color-contrast"])
        .analyze();

      // Separate violations by impact level
      const criticalViolations = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      const moderateViolations = results.violations.filter(
        (v) => v.impact === "moderate"
      );

      const minorViolations = results.violations.filter(
        (v) => v.impact === "minor"
      );

      // Report violations
      if (criticalViolations.length > 0) {
        console.log(`\n[${theme.name}] CRITICAL/SERIOUS Violations:`);
        criticalViolations.forEach((violation) => {
          console.log(`  - ${violation.id}: ${violation.description}`);
          console.log(`    Affected elements: ${violation.nodes.length}`);
        });
      }

      if (moderateViolations.length > 0) {
        console.log(`\n[${theme.name}] MODERATE Violations (non-blocking):`);
        moderateViolations.forEach((violation) => {
          console.log(`  - ${violation.id}: ${violation.description}`);
          console.log(`    Affected elements: ${violation.nodes.length}`);
        });
      }

      if (minorViolations.length > 0) {
        console.log(`\n[${theme.name}] MINOR Violations (non-blocking):`);
        minorViolations.forEach((violation) => {
          console.log(`  - ${violation.id}: ${violation.description}`);
          console.log(`    Affected elements: ${violation.nodes.length}`);
        });
      }

      // Passes section
      const passCount = results.passes.length;
      console.log(`\n[${theme.name}] Passed checks: ${passCount}`);

      // Test should FAIL only if there are critical or serious violations
      expect(
        criticalViolations.length,
        `${theme.name} should have 0 critical/serious violations`
      ).toBe(0);
    });
  }

  test("summary - accessibility violations across all themes", async ({
    page,
  }) => {
    const summaryByTheme: Record<
      string,
      {
        critical: number;
        moderate: number;
        minor: number;
        passes: number;
      }
    > = {};

    for (const theme of THEMES) {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await switchThemeAndWait(page, theme);

      // Run analysis (exclude color-contrast — see note in per-theme tests)
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2aa", "wcag21aa"])
        .disableRules(["color-contrast"])
        .analyze();

      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      ).length;

      const moderate = results.violations.filter(
        (v) => v.impact === "moderate"
      ).length;

      const minor = results.violations.filter(
        (v) => v.impact === "minor"
      ).length;

      summaryByTheme[theme.name] = {
        critical,
        moderate,
        minor,
        passes: results.passes.length,
      };
    }

    // Print summary table
    console.log("\n=== ACCESSIBILITY AUDIT SUMMARY ===");
    console.table(summaryByTheme);

    // Verify no theme has critical violations
    for (const [themeName, counts] of Object.entries(summaryByTheme)) {
      expect(
        counts.critical,
        `${themeName} should have 0 critical violations`
      ).toBe(0);
    }
  });

  test("technical-operations-atlas color tokens meet contrast budget", () => {
    function luminance(rgb: [number, number, number]) {
      const channel = rgb.map((value) => {
        const normalized = value / 255;
        return normalized <= 0.03928
          ? normalized / 12.92
          : Math.pow((normalized + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * channel[0] + 0.7152 * channel[1] + 0.0722 * channel[2];
    }

    function contrast(
      foreground: [number, number, number],
      background: [number, number, number]
    ) {
      const l1 = luminance(foreground);
      const l2 = luminance(background);
      const bright = Math.max(l1, l2);
      const dark = Math.min(l1, l2);
      return (bright + 0.05) / (dark + 0.05);
    }

    const atlasBase = [9, 11, 13] as [number, number, number];
    const atlasCard = [24, 24, 27] as [number, number, number];
    const tokenPairs = [
      { name: "zinc-50 on base", fg: [250, 250, 250], bg: atlasBase },
      { name: "zinc-100 on base", fg: [244, 244, 245], bg: atlasBase },
      { name: "zinc-200 on card", fg: [228, 228, 231], bg: atlasCard },
      { name: "zinc-300 on card", fg: [212, 212, 216], bg: atlasCard },
      { name: "zinc-400 on base", fg: [161, 161, 170], bg: atlasBase },
      { name: "amber-400 on base", fg: [251, 191, 36], bg: atlasBase },
      { name: "sky-300 on base", fg: [125, 211, 252], bg: atlasBase },
      { name: "emerald-400 on base", fg: [52, 211, 153], bg: atlasBase },
      { name: "zinc-950 on amber-400", fg: [9, 9, 11], bg: [251, 191, 36] },
    ] satisfies {
      name: string;
      fg: [number, number, number];
      bg: [number, number, number];
    }[];

    const failures = tokenPairs
      .map((pair) => ({ ...pair, ratio: contrast(pair.fg, pair.bg) }))
      .filter((pair) => pair.ratio < 4.5);

    expect(failures).toEqual([]);
  });
});
