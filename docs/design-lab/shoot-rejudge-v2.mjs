// v2 rejudge shoot — full journey: home, automl, jobtracker, evidence
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/design-lab/shots-rejudge';
mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:3000';

const browser = await chromium.launch();

async function settle(page, ms = 1400) {
  await page.waitForTimeout(ms);
}

async function scrollToFrac(page, frac) {
  await page.evaluate((f) => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: h * f, behavior: 'instant' });
  }, frac);
  await settle(page);
}

async function scrollToId(page, id) {
  const found = await page.evaluate((sel) => {
    const el = document.getElementById(sel);
    if (!el) return false;
    const y = el.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo({ top: y, behavior: 'instant' });
    return true;
  }, id);
  if (!found) console.log(`  !! #${id} not found`);
  await settle(page);
}

async function shoot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`  ✓ ${name}`);
}

// ---------- DESKTOP ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  // HOME — top + 3 depths
  console.log('home desktop');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await settle(page, 2200);
  await shoot(page, 'v2-home-d1-top');
  await scrollToFrac(page, 0.3);
  await shoot(page, 'v2-home-d2-depth30');
  await scrollToFrac(page, 0.55);
  await shoot(page, 'v2-home-d3-depth55');
  await scrollToFrac(page, 0.82);
  await shoot(page, 'v2-home-d4-depth82');

  // CASE FILES desktop
  for (const id of ['automl', 'jobtracker']) {
    console.log(`${id} desktop`);
    await page.goto(`${BASE}/projects/${id}/`, { waitUntil: 'networkidle' });
    await settle(page, 2200);
    await shoot(page, `v2-${id}-d1-opening`);
    await scrollToId(page, 'architecture');
    await shoot(page, `v2-${id}-d2-architecture`);
    await scrollToId(page, 'validation');
    await shoot(page, `v2-${id}-d3-validation`);
    await scrollToFrac(page, 1.0);
    await shoot(page, `v2-${id}-d4-footer`);
  }

  // EVIDENCE desktop — top + mid
  console.log('evidence desktop');
  await page.goto(`${BASE}/evidence/`, { waitUntil: 'networkidle' });
  await settle(page, 2000);
  await shoot(page, 'v2-evidence-d1-top');
  await scrollToFrac(page, 0.5);
  await shoot(page, 'v2-evidence-d2-mid');

  await ctx.close();
}

// ---------- MOBILE ----------
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  console.log('home mobile');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await settle(page, 2200);
  await shoot(page, 'v2-home-m1-top');
  await scrollToFrac(page, 0.45);
  await shoot(page, 'v2-home-m2-depth45');

  for (const id of ['automl', 'jobtracker']) {
    console.log(`${id} mobile`);
    await page.goto(`${BASE}/projects/${id}/`, { waitUntil: 'networkidle' });
    await settle(page, 2200);
    await shoot(page, `v2-${id}-m1-opening`);
    await scrollToId(page, 'validation');
    await shoot(page, `v2-${id}-m2-validation`);
  }

  console.log('evidence mobile');
  await page.goto(`${BASE}/evidence/`, { waitUntil: 'networkidle' });
  await settle(page, 2000);
  await shoot(page, 'v2-evidence-m1-top');

  await ctx.close();
}

await browser.close();
console.log('done');
