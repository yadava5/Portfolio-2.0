import { chromium } from 'playwright';
import fs from 'fs';

const DIR = '/sessions/intelligent-vigilant-lamport/mnt/Portfolio/portfolio/test-screenshots/videos-interactions';
fs.mkdirSync(DIR, { recursive: true });

const themes = ['dark-luxe', 'paper-ink', 'editorial', 'noir-cinema', 'neon-cyber'];

(async () => {
  const browser = await chromium.launch();

  // VIDEO 1: Theme switching
  console.log('Recording theme switching...');
  const ctx1 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: DIR, size: { width: 1440, height: 900 } }
  });
  const page1 = await ctx1.newPage();
  await page1.goto('http://localhost:3460', { waitUntil: 'networkidle', timeout: 20000 });
  await page1.waitForTimeout(2000);

  // Cycle through all themes
  for (const theme of themes) {
    console.log(`  Switching to ${theme}...`);
    await page1.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      if (typeof localStorage !== 'undefined') localStorage.setItem('theme', t);
    }, theme);
    await page1.waitForTimeout(2500); // Watch transition

    // Scroll down a bit to see more content
    await page1.evaluate(() => window.scrollBy(0, 400));
    await page1.waitForTimeout(1000);
    await page1.evaluate(() => window.scrollTo(0, 0));
    await page1.waitForTimeout(500);
  }

  await page1.close();
  await ctx1.close();
  console.log('Theme switching video saved');

  // VIDEO 2: Hover and interaction states
  console.log('\nRecording hover interactions...');
  const ctx2 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: DIR, size: { width: 1440, height: 900 } }
  });
  const page2 = await ctx2.newPage();
  await page2.goto('http://localhost:3460', { waitUntil: 'networkidle', timeout: 20000 });
  await page2.waitForTimeout(2000);

  // Test hover states on buttons
  const buttons = await page2.locator('a, button').all();
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    try {
      if (await buttons[i].isVisible()) {
        await buttons[i].hover();
        await page2.waitForTimeout(400);
      }
    } catch(e) {}
  }

  // Scroll to projects and hover cards
  await page2.evaluate(() => {
    const el = document.getElementById('projects');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page2.waitForTimeout(1000);

  const cards = await page2.locator('[class*="project"], [class*="card"]').all();
  for (let i = 0; i < Math.min(cards.length, 5); i++) {
    try {
      if (await cards[i].isVisible()) {
        await cards[i].hover();
        await page2.waitForTimeout(600);
      }
    } catch(e) {}
  }

  // Test header navigation
  await page2.evaluate(() => window.scrollTo(0, 0));
  await page2.waitForTimeout(500);
  const navLinks = await page2.locator('nav a, header a').all();
  for (let i = 0; i < Math.min(navLinks.length, 6); i++) {
    try {
      if (await navLinks[i].isVisible()) {
        await navLinks[i].hover();
        await page2.waitForTimeout(300);
      }
    } catch(e) {}
  }

  await page2.waitForTimeout(1000);
  await page2.close();
  await ctx2.close();
  console.log('Interaction video saved');

  // VIDEO 3: Mobile interactions
  console.log('\nRecording mobile interactions...');
  const ctx3 = await browser.newContext({
    viewport: { width: 375, height: 812 },
    recordVideo: { dir: DIR, size: { width: 375, height: 812 } }
  });
  const page3 = await ctx3.newPage();
  await page3.goto('http://localhost:3460', { waitUntil: 'networkidle', timeout: 20000 });
  await page3.waitForTimeout(2000);

  // Scroll through on mobile
  for (let i = 0; i < 15; i++) {
    await page3.evaluate(() => window.scrollBy(0, 300));
    await page3.waitForTimeout(300);
  }

  // Test theme switch on mobile
  for (const theme of ['editorial', 'neon-cyber']) {
    await page3.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
    }, theme);
    await page3.waitForTimeout(1500);
    await page3.evaluate(() => window.scrollTo(0, 0));
    await page3.waitForTimeout(500);
    for (let i = 0; i < 8; i++) {
      await page3.evaluate(() => window.scrollBy(0, 300));
      await page3.waitForTimeout(200);
    }
  }

  await page3.close();
  await ctx3.close();
  console.log('Mobile interaction video saved');

  await browser.close();

  // List videos
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.webm'));
  console.log(`\nSaved ${files.length} videos:`);
  files.forEach(f => {
    const stats = fs.statSync(`${DIR}/${f}`);
    console.log(`  ${f} (${Math.round(stats.size / 1024)}KB)`);
  });

  process.exit(0);
})();
