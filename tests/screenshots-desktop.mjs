import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DIR = '/sessions/intelligent-vigilant-lamport/mnt/Portfolio/portfolio/test-screenshots/critique-desktop';
fs.mkdirSync(DIR, { recursive: true });

const themes = ['dark-luxe', 'paper-ink', 'editorial', 'noir-cinema', 'neon-cyber'];

(async () => {
  const browser = await chromium.launch();

  for (const theme of themes) {
    console.log(`\n=== ${theme} (Desktop 1440x900) ===`);
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    await page.goto('http://localhost:3460', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Switch theme
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      if (typeof localStorage !== 'undefined') localStorage.setItem('theme', t);
    }, theme);
    await page.waitForTimeout(2000);

    // 1. Full page screenshot
    await page.screenshot({ path: `${DIR}/${theme}-fullpage.png`, fullPage: true });
    console.log(`  Saved fullpage`);

    // 2. Hero section (viewport)
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/${theme}-hero.png` });
    console.log(`  Saved hero`);

    // 3. Scroll to each section and screenshot
    const sectionIds = ['about', 'experience', 'projects', 'skills', 'testimonials', 'contact'];
    for (const sid of sectionIds) {
      try {
        const exists = await page.evaluate((id) => {
          const el = document.getElementById(id);
          if (el) { el.scrollIntoView({ behavior: 'instant' }); return true; }
          return false;
        }, sid);

        if (exists) {
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `${DIR}/${theme}-${sid}.png` });
          console.log(`  Saved ${sid}`);
        } else {
          console.log(`  Section #${sid} not found`);
        }
      } catch (e) {
        console.log(`  Error on ${sid}: ${e.message}`);
      }
    }

    // 4. Check for visual issues
    const diagnostics = await page.evaluate(() => {
      const results = {};

      // Horizontal overflow
      results.horizontalOverflow = document.documentElement.scrollWidth - window.innerWidth;

      // Section heights
      results.sections = [];
      document.querySelectorAll('section').forEach(s => {
        results.sections.push({
          id: s.id || '(unnamed)',
          height: s.getBoundingClientRect().height,
          hasText: (s.innerText?.trim().length || 0) > 10
        });
      });

      // h1 overflow
      const h1 = document.querySelector('h1');
      if (h1) {
        const r = h1.getBoundingClientRect();
        results.h1 = { right: r.right, width: r.width, overflow: r.right > window.innerWidth };
      }

      // Images
      results.brokenImages = [];
      document.querySelectorAll('img').forEach(img => {
        if (img.naturalWidth === 0 && img.src) {
          results.brokenImages.push(img.src.split('/').pop());
        }
      });

      // Check overlapping elements
      results.overlaps = [];
      const allSections = document.querySelectorAll('section');
      for (let i = 0; i < allSections.length - 1; i++) {
        const a = allSections[i].getBoundingClientRect();
        const b = allSections[i+1].getBoundingClientRect();
        if (a.bottom > b.top + 5) {
          results.overlaps.push(`${allSections[i].id} overlaps ${allSections[i+1].id} by ${a.bottom - b.top}px`);
        }
      }

      return results;
    });

    console.log(`  Diagnostics:`, JSON.stringify(diagnostics, null, 2));

    // Save diagnostics
    fs.writeFileSync(`${DIR}/${theme}-diagnostics.json`, JSON.stringify(diagnostics, null, 2));

    await page.close();
  }

  await browser.close();
  console.log('\nAll desktop screenshots complete!');
  process.exit(0);
})();
