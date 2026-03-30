import { chromium } from 'playwright';
import fs from 'fs';

const DIR = '/sessions/intelligent-vigilant-lamport/mnt/Portfolio/portfolio/test-screenshots/videos-scroll';
fs.mkdirSync(DIR, { recursive: true });

const themes = ['dark-luxe', 'paper-ink', 'editorial', 'noir-cinema', 'neon-cyber'];

(async () => {
  const browser = await chromium.launch();

  for (const theme of themes) {
    console.log(`\nRecording scroll behavior: ${theme}`);

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: {
        dir: DIR,
        size: { width: 1440, height: 900 }
      }
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3460', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);

    // Switch theme
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      if (typeof localStorage !== 'undefined') localStorage.setItem('theme', t);
    }, theme);
    await page.waitForTimeout(2000);

    // Slowly scroll through entire page
    const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = 900;
    const scrollStep = 200; // pixels per step
    const steps = Math.ceil(totalHeight / scrollStep);

    console.log(`  Total height: ${totalHeight}px, ${steps} scroll steps`);

    for (let i = 0; i < steps; i++) {
      await page.evaluate((step) => window.scrollBy(0, step), scrollStep);
      await page.waitForTimeout(150); // Slow enough to see transitions
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Fast scroll to test performance
    console.log(`  Fast scroll test...`);
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(1000);
    await page.close();
    await context.close();

    console.log(`  Video saved for ${theme}`);
  }

  await browser.close();

  // List saved videos
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.webm'));
  console.log(`\nSaved ${files.length} videos:`);
  files.forEach(f => {
    const stats = fs.statSync(`${DIR}/${f}`);
    console.log(`  ${f} (${Math.round(stats.size / 1024)}KB)`);
  });

  process.exit(0);
})();
