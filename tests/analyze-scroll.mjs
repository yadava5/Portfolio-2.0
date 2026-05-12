import { chromium } from "playwright";
import fs from "fs";

const BASE_URL = process.env.PORTFOLIO_BASE_URL ?? "http://127.0.0.1:3000";
const DIR = "output/playwright/legacy/scroll-analysis";

const themes = [
  "technical-operations-atlas",
  "liquid-glass",
  "cosmic-voyage",
  "retro-terminal",
  "synthwave-sunset",
  "bioluminescent-deep",
];
const results = {};

(async () => {
  const browser = await chromium.launch();

  for (const theme of themes) {
    console.log(`\nAnalyzing: ${theme}`);

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    await page.goto(BASE_URL, {
      waitUntil: "networkidle",
      timeout: 20000,
    });
    await page.waitForTimeout(2000);

    // Switch theme
    await page.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("portfolio-theme", t);
      }
    }, theme);
    await page.waitForTimeout(2000);

    // Collect scroll metrics
    const metrics = await page.evaluate(() => {
      const totalHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const sections = document.querySelectorAll('section, [role="region"]');

      return {
        totalHeight,
        viewportHeight,
        sectionCount: sections.length,
        hasHorizontalScroll:
          document.body.scrollWidth > document.body.clientWidth,
        cssTransforms: Array.from(document.querySelectorAll("*")).filter(
          (el) => getComputedStyle(el).transform !== "none"
        ).length,
        animations: Array.from(document.querySelectorAll("*")).filter(
          (el) => getComputedStyle(el).animation !== "none"
        ).length,
      };
    });

    // Test scroll performance
    const scrollMetrics = await page.evaluate(async () => {
      const samples = [];
      const scrollSteps = [200, 500, 1000];

      for (const step of scrollSteps) {
        const start = performance.now();
        window.scrollBy(0, step);
        await new Promise((r) => requestAnimationFrame(r));
        const elapsed = performance.now() - start;
        samples.push({ step, elapsed });
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 100));
      }

      return samples;
    });

    results[theme] = {
      ...metrics,
      scrollPerformance: scrollMetrics,
    };

    await page.close();
    await context.close();

    console.log(`  Total height: ${metrics.totalHeight}px`);
    console.log(`  Sections: ${metrics.sectionCount}`);
    console.log(`  CSS Transforms: ${metrics.cssTransforms}`);
    console.log(`  Animations: ${metrics.animations}`);
    console.log(`  Horizontal scroll: ${metrics.hasHorizontalScroll}`);
  }

  await browser.close();

  // Save analysis
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(
    `${DIR}/scroll-analysis.json`,
    JSON.stringify(results, null, 2)
  );

  console.log("\nAnalysis saved to scroll-analysis.json");
  process.exit(0);
})();
