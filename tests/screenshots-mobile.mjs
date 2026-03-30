import { chromium } from 'playwright';
import fs from 'fs';

const DIR = '/sessions/intelligent-vigilant-lamport/mnt/Portfolio/portfolio/test-screenshots/critique-mobile';
fs.mkdirSync(DIR, { recursive: true });

const themes = ['dark-luxe', 'paper-ink', 'editorial', 'noir-cinema', 'neon-cyber'];

(async () => {
  const browser = await chromium.launch();

  for (const theme of themes) {
    console.log(`\n=== ${theme} (Mobile 375x812) ===`);
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

    await page.goto('http://localhost:3460', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Switch theme
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      if (typeof localStorage !== 'undefined') localStorage.setItem('theme', t);
    }, theme);
    await page.waitForTimeout(2000);

    // Full page
    await page.screenshot({ path: `${DIR}/${theme}-fullpage.png`, fullPage: true });

    // Hero
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/${theme}-hero.png` });

    // Each section
    const sectionIds = ['about', 'experience', 'projects', 'skills', 'testimonials', 'contact'];
    for (const sid of sectionIds) {
      const exists = await page.evaluate((id) => {
        const el = document.getElementById(id);
        if (el) { el.scrollIntoView({ behavior: 'instant' }); return true; }
        return false;
      }, sid);
      if (exists) {
        await page.waitForTimeout(800);
        await page.screenshot({ path: `${DIR}/${theme}-${sid}.png` });
      }
    }

    // Mobile-specific checks
    const diagnostics = await page.evaluate(() => {
      const r = {};
      r.horizontalOverflow = document.documentElement.scrollWidth - window.innerWidth;
      r.viewportWidth = window.innerWidth;

      // Touch target sizes
      r.smallTouchTargets = [];
      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
          r.smallTouchTargets.push({
            tag: el.tagName,
            text: el.textContent?.slice(0, 30),
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`
          });
        }
      });

      // Text too small
      r.smallText = [];
      document.querySelectorAll('p, span, a, li').forEach(el => {
        const style = window.getComputedStyle(el);
        const size = parseFloat(style.fontSize);
        if (size < 12 && el.textContent?.trim().length > 3) {
          r.smallText.push({
            text: el.textContent?.slice(0, 40),
            fontSize: style.fontSize
          });
        }
      });

      // h1 check
      const h1 = document.querySelector('h1');
      if (h1) {
        const rect = h1.getBoundingClientRect();
        r.h1 = { right: rect.right, overflow: rect.right > window.innerWidth, width: rect.width };
      }

      // Sections
      r.sections = [];
      document.querySelectorAll('section').forEach(s => {
        r.sections.push({
          id: s.id || '(unnamed)',
          height: Math.round(s.getBoundingClientRect().height),
          hasText: (s.innerText?.trim().length || 0) > 10
        });
      });

      return r;
    });

    console.log(`  Diagnostics:`, JSON.stringify(diagnostics, null, 2));
    fs.writeFileSync(`${DIR}/${theme}-diagnostics.json`, JSON.stringify(diagnostics, null, 2));

    await page.close();
  }

  await browser.close();
  console.log('\nAll mobile screenshots complete!');
  process.exit(0);
})();
