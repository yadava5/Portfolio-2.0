import { chromium } from 'playwright';
import fs from 'fs';

const DIR = '/sessions/intelligent-vigilant-lamport/mnt/Portfolio/portfolio/test-screenshots/final';
fs.mkdirSync(DIR, { recursive: true });

const themes = ['dark-luxe', 'paper-ink', 'editorial', 'noir-cinema', 'neon-cyber'];

(async () => {
  const browser = await chromium.launch();

  // Test desktop
  for (const theme of themes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3456', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Switch theme via JavaScript
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', t);
    }, theme);
    await page.waitForTimeout(1500);

    await page.screenshot({ path: `${DIR}/${theme}-desktop-hero.png` });

    // Scroll through page
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: `${DIR}/${theme}-desktop-scrolled.png` });

    // Check for issues
    const issues = await page.evaluate(() => {
      const problems = [];
      if (document.documentElement.scrollWidth > window.innerWidth + 5)
        problems.push('horizontal-overflow');
      document.querySelectorAll('section').forEach((s, i) => {
        if (s.getBoundingClientRect().height < 50)
          problems.push(`empty-section-${s.id || i}`);
      });
      return problems;
    });
    console.log(`${theme} desktop: ${issues.length === 0 ? 'OK' : issues.join(', ')}`);
    await page.close();
  }

  // Test mobile
  for (const theme of themes) {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto('http://localhost:3456', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', t);
    }, theme);
    await page.waitForTimeout(1500);

    await page.screenshot({ path: `${DIR}/${theme}-mobile-hero.png` });

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: `${DIR}/${theme}-mobile-scrolled.png` });

    const issues = await page.evaluate(() => {
      const problems = [];
      if (document.documentElement.scrollWidth > window.innerWidth + 5)
        problems.push(`horizontal-overflow: ${document.documentElement.scrollWidth}px`);
      const h1 = document.querySelector('h1');
      if (h1) {
        const rect = h1.getBoundingClientRect();
        if (rect.right > window.innerWidth)
          problems.push(`h1-overflow: ${rect.right}px`);
      }
      return problems;
    });
    console.log(`${theme} mobile: ${issues.length === 0 ? 'OK' : issues.join(', ')}`);
    await page.close();
  }

  await browser.close();
  console.log('Done! Screenshots in ' + DIR);
  process.exit(0);
})();
