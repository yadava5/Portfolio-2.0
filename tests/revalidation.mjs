import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/sessions/intelligent-vigilant-lamport/mnt/Portfolio/portfolio/test-screenshots/revalidation';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const themes = ['dark-luxe', 'paper-ink', 'editorial', 'noir-cinema', 'neon-cyber'];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 }
];

(async () => {
  const browser = await chromium.launch();
  const results = {};

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });
    const page = await context.newPage();

    for (const theme of themes) {
      console.log(`Testing ${theme} at ${vp.name}...`);

      await page.goto('http://localhost:3458', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Try to switch theme
      try {
        // Look for theme switcher - it might be a select, button, or dropdown
        const switcher = await page.locator('[data-testid="theme-switcher"], select, [aria-label*="theme"], button:has-text("Theme")').first();
        if (await switcher.isVisible()) {
          await switcher.click();
          await page.waitForTimeout(500);

          // Try to find and click the theme option
          const option = await page.locator(`text=${theme}`).first();
          if (await option.isVisible()) {
            await option.click();
          } else {
            // Try select option
            await switcher.selectOption({ value: theme });
          }
          await page.waitForTimeout(1500);
        }
      } catch (e) {
        console.log(`Could not switch to ${theme}: ${e.message}`);
      }

      // Screenshot hero
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${theme}-${vp.name}-hero.png`),
        fullPage: false
      });

      // Scroll through page and take screenshots
      const sections = ['about', 'experience', 'projects', 'skills', 'contact'];
      for (const section of sections) {
        try {
          const el = await page.locator(`#${section}, section[id="${section}"]`).first();
          if (await el.isVisible()) {
            await el.scrollIntoViewIfNeeded();
            await page.waitForTimeout(800);
          }
        } catch (e) {
          // Try manual scroll
          await page.evaluate(() => window.scrollBy(0, window.innerHeight));
          await page.waitForTimeout(800);
        }
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `${theme}-${vp.name}-${section}.png`),
          fullPage: false
        });
      }

      // Check for visual issues
      const issues = await page.evaluate(() => {
        const problems = [];

        // Check for horizontal overflow
        if (document.documentElement.scrollWidth > window.innerWidth + 5) {
          problems.push(`Horizontal overflow: ${document.documentElement.scrollWidth}px vs ${window.innerWidth}px`);
        }

        // Check for empty sections
        document.querySelectorAll('section').forEach((section, i) => {
          const rect = section.getBoundingClientRect();
          if (rect.height < 50) {
            problems.push(`Section ${i} (${section.id || 'unnamed'}) is too short: ${rect.height}px`);
          }
          // Check if section has visible text
          const text = section.innerText?.trim();
          if (!text || text.length < 10) {
            problems.push(`Section ${i} (${section.id || 'unnamed'}) has no visible text`);
          }
        });

        // Check for overlapping elements
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          const rect = img.getBoundingClientRect();
          if (rect.bottom > window.innerHeight * 3 || rect.right > window.innerWidth + 20) {
            problems.push(`Image overflow: ${img.src?.split('/').pop()} at ${rect.right}x${rect.bottom}`);
          }
        });

        // Check text readability
        const headings = document.querySelectorAll('h1, h2, h3');
        headings.forEach(h => {
          const style = window.getComputedStyle(h);
          if (parseFloat(style.fontSize) < 12) {
            problems.push(`Heading too small: "${h.textContent?.slice(0,30)}" at ${style.fontSize}`);
          }
        });

        return problems;
      });

      results[`${theme}-${vp.name}`] = issues;
      console.log(`  Issues: ${issues.length > 0 ? issues.join('; ') : 'None'}`);
    }

    await context.close();
  }

  // Write results
  const report = JSON.stringify(results, null, 2);
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'results.json'), report);
  console.log('\nFull results:', report);

  await browser.close();
  process.exit(0);
})();
