import { expect, test } from "@playwright/test";
import { THEMES, artifactPath, switchThemeAndWait } from "./portfolio-fixtures";

type ThemeScore = {
  theme: string;
  viewport: string;
  score: number;
  deductions: string[];
};

function deduct(
  deductions: string[],
  condition: boolean,
  message: string,
  amount: number
) {
  if (condition) deductions.push(`${amount.toFixed(1)} ${message}`);
}

function sumDeductions(deductions: string[]) {
  return deductions.reduce((sum, deduction) => {
    const value = Number(deduction.split(" ")[0]);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
}

test.describe("Portfolio quality score", () => {
  test.setTimeout(120000);

  for (const theme of THEMES) {
    test(`${theme.name}: rendered quality score`, async ({
      page,
    }, testInfo) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await switchThemeAndWait(page, theme);

      await page.waitForTimeout(900);

      const viewport = page.viewportSize();
      const viewportName =
        testInfo.project.name.includes("mobile") || (viewport?.width ?? 0) < 768
          ? "mobile"
          : "desktop";

      const result = await page.evaluate(() => {
        const text = document.body.innerText;
        const sections = Array.from(document.querySelectorAll("section")).map(
          (section) => {
            const rect = section.getBoundingClientRect();
            return {
              id: section.id,
              height: Math.round(rect.height),
            };
          }
        );
        const fixedHeader = document.querySelector("header");
        const headerRect = fixedHeader?.getBoundingClientRect();
        const projects = document.getElementById("projects");
        const projectsRect = projects?.getBoundingClientRect();
        const horizontalScrollWrapper = document.querySelector<HTMLElement>(
          '[data-horizontal-scroll-wrapper="true"]'
        );
        const horizontalScrollWrapperRect =
          horizontalScrollWrapper?.getBoundingClientRect();
        const email =
          document.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
        const emailRect = email?.getBoundingClientRect();
        const heroTitle =
          document.querySelector<HTMLElement>("#hero h1") ??
          document.querySelector<HTMLElement>("h1");
        const heroTitleStyles = heroTitle
          ? window.getComputedStyle(heroTitle)
          : null;

        const viewportImages = Array.from(document.images).filter((image) => {
          const rect = image.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom > 0 &&
            rect.top < window.innerHeight &&
            rect.right > 0 &&
            rect.left < window.innerWidth
          );
        });

        return {
          title: document.title,
          dataTheme: document.documentElement.getAttribute("data-theme"),
          textLength: text.length,
          visibleTypedText: Array.from(
            document.querySelectorAll<HTMLElement>('[aria-hidden="true"]')
          )
            .map((element) => element.innerText)
            .join(" "),
          hasGeneratedPlaceholders:
            /lorem ipsum|TODO|PLACEHOLDER|CUNY Brooklyn/i.test(text),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          scrollHeight: document.documentElement.scrollHeight,
          clientHeight: document.documentElement.clientHeight,
          sections,
          projectsHeight: projectsRect ? Math.round(projectsRect.height) : 0,
          horizontalScrollWrapperHeight: horizontalScrollWrapperRect
            ? Math.round(horizontalScrollWrapperRect.height)
            : 0,
          headerHeight: headerRect ? Math.round(headerRect.height) : 0,
          emailWidth: emailRect ? Math.round(emailRect.width) : 0,
          emailLeft: emailRect ? Math.round(emailRect.left) : 0,
          emailRight: emailRect ? Math.round(emailRect.right) : 0,
          heroTitleLetterSpacing: heroTitleStyles?.letterSpacing ?? "normal",
          visibleImages: viewportImages.length,
          brokenImages: viewportImages.filter(
            (image) => image.complete && image.naturalWidth === 0
          ).length,
        };
      });

      const deductions: string[] = [];
      deduct(
        deductions,
        result.dataTheme !== theme.name,
        "theme did not apply",
        2
      );
      deduct(
        deductions,
        result.textLength < 2500,
        "page has too little rendered text",
        1
      );
      deduct(
        deductions,
        result.scrollWidth > result.clientWidth,
        "horizontal overflow detected",
        2
      );
      deduct(deductions, result.brokenImages > 0, "broken visible image", 2);
      deduct(
        deductions,
        result.hasGeneratedPlaceholders,
        "placeholder/generated content detected",
        2
      );

      const longSections = result.sections.filter(
        (section) =>
          section.height >
          result.clientHeight * (viewportName === "mobile" ? 7 : 5)
      );
      deduct(
        deductions,
        longSections.length > 0,
        `overlong sections: ${longSections.map((s) => s.id || "unnamed").join(", ")}`,
        0.8
      );

      deduct(
        deductions,
        viewportName === "mobile" &&
          result.emailWidth > 0 &&
          (result.emailLeft < 16 ||
            result.emailRight > result.clientWidth - 16),
        "mobile email text risks clipping",
        1.2
      );

      const score = Math.max(0, 10 - sumDeductions(deductions));

      const screenshot = await artifactPath(
        "quality-score",
        `${theme.name}-${viewportName}.png`
      );
      await page.screenshot({ path: screenshot, fullPage: false });

      const scoreResult: ThemeScore = {
        theme: theme.name,
        viewport: viewportName,
        score,
        deductions,
      };

      console.log(JSON.stringify(scoreResult, null, 2));
      expect(
        score,
        `${theme.name} ${viewportName} score`
      ).toBeGreaterThanOrEqual(9.2);
    });
  }
});
