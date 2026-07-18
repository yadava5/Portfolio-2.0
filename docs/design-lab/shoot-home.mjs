/** Shoot the new chapter-shell homepage across the arc + lenses.
 *  Requires the static server (out/) on :3000. Writes docs/design-lab/shots-home/.
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

await mkdir("docs/design-lab/shots-home", { recursive: true });
const browser = await chromium.launch();

async function settle(page, ms = 900) {
  await page.waitForTimeout(ms);
}

/* ── Desktop, motion on ── */
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3000/");
await page.evaluate(() => document.fonts.ready);
await settle(page, 1500);
await page.screenshot({ path: "docs/design-lab/shots-home/d1-arrival.png" });

for (const [name, id] of [
  ["d2-who", "who"],
  ["d3-path", "path"],
  ["d4-automl", "automl"],
  ["d5-work", "work"],
  ["d6-values-dusk", "values"],
  ["d7-gate-night", "gate"],
]) {
  await page.evaluate((sel) => {
    document.getElementById(sel)?.scrollIntoView({ behavior: "auto" });
  }, id);
  await settle(page);
  await page.screenshot({ path: `docs/design-lab/shots-home/${name}.png` });
}
await page.close();

/* ── Mobile, motion on ── */
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto("http://127.0.0.1:3000/");
await mob.evaluate(() => document.fonts.ready);
await settle(mob, 1500);
await mob.screenshot({ path: "docs/design-lab/shots-home/m1-arrival.png" });
await mob.evaluate(() =>
  document.getElementById("work")?.scrollIntoView({ behavior: "auto" })
);
await settle(mob);
await mob.screenshot({ path: "docs/design-lab/shots-home/m2-work.png" });
await mob.evaluate(() =>
  document.getElementById("gate")?.scrollIntoView({ behavior: "auto" })
);
await settle(mob);
await mob.screenshot({ path: "docs/design-lab/shots-home/m3-gate.png" });
await mob.close();

/* ── Desktop, reduced motion ── */
const rm = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
await rm.goto("http://127.0.0.1:3000/");
await rm.evaluate(() => document.fonts.ready);
await settle(rm, 1200);
await rm.screenshot({ path: "docs/design-lab/shots-home/r1-arrival.png" });
await rm.evaluate(() =>
  document.getElementById("values")?.scrollIntoView({ behavior: "auto" })
);
await settle(rm);
await rm.screenshot({ path: "docs/design-lab/shots-home/r2-values.png" });
await rm.close();

/* ── Dossier pass: the rebuilt case files (desktop + mobile) ── */
async function shootDossier(pagePath, prefix) {
  const desk = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await desk.goto(`http://127.0.0.1:3000${pagePath}`);
  await desk.evaluate(() => document.fonts.ready);
  await settle(desk, 1200);
  await desk.screenshot({
    path: `docs/design-lab/shots-home/${prefix}-1-opening.png`,
  });
  for (const [suffix, id] of [
    ["2-architecture", "architecture"],
    ["3-validation", "validation"],
    ["4-artifacts", "artifacts"],
  ]) {
    await desk.evaluate((sel) => {
      document.getElementById(sel)?.scrollIntoView({ behavior: "auto" });
    }, id);
    await settle(desk);
    await desk.screenshot({
      path: `docs/design-lab/shots-home/${prefix}-${suffix}.png`,
    });
  }
  await desk.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" })
  );
  await settle(desk);
  await desk.screenshot({
    path: `docs/design-lab/shots-home/${prefix}-5-footer.png`,
  });
  await desk.close();

  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mob.goto(`http://127.0.0.1:3000${pagePath}`);
  await mob.evaluate(() => document.fonts.ready);
  await settle(mob, 1200);
  await mob.screenshot({
    path: `docs/design-lab/shots-home/${prefix}-m1-opening.png`,
  });
  await mob.evaluate(() => {
    document.getElementById("validation")?.scrollIntoView({ behavior: "auto" });
  });
  await settle(mob);
  await mob.screenshot({
    path: `docs/design-lab/shots-home/${prefix}-m2-validation.png`,
  });
  await mob.close();
}

await shootDossier("/projects/automl/", "c-automl");
await shootDossier("/projects/jobtracker/", "c-jobtracker");

/* ── The evidence index ── */
const ev = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await ev.goto("http://127.0.0.1:3000/evidence/");
await ev.evaluate(() => document.fonts.ready);
await settle(ev, 1200);
await ev.screenshot({ path: "docs/design-lab/shots-home/e1-evidence.png" });
await ev.close();

await browser.close();
console.log("home + dossier shots done");
