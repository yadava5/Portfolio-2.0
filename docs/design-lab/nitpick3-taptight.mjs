// NITPICK 3 — is `.tap-target-tight` actually on the ledger, and does it
// actually measure 27? The census says the case-file ledger terminals
// still read 15px tall. Either the class is not applied, or it is applied
// to something else.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-nitpick3";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3601";
const notes = [];
const note = (k, v) => { notes.push({ k, v }); console.log(`\n[${k}]\n${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`); };

const browser = await chromium.launch();
for (const vw of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: 900 } });
  const page = await ctx.newPage();
  const rep = [];
  for (const route of ["/projects/fast-mnist-nn/", "/projects/taskflow-calendar/", "/", "/evidence/"]) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    const v = await page.evaluate(() => {
      const grab = (sel) =>
        [...document.querySelectorAll(sel)]
          .filter((e) => e.getBoundingClientRect().width)
          .map((e) => {
            const b = e.getBoundingClientRect();
            const cs = getComputedStyle(e);
            return {
              t: (e.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 34),
              h: +b.height.toFixed(1),
              pt: cs.paddingTop, pb: cs.paddingBottom,
              mt: cs.marginTop,
              display: cs.display,
            };
          });
      return {
        tight: grab(".tap-target-tight"),
        block: grab(".tap-target-block").slice(0, 6),
        plain: grab(".tap-target").length,
        nTight: document.querySelectorAll(".tap-target-tight").length,
        nBlock: document.querySelectorAll(".tap-target-block").length,
        nPlain: document.querySelectorAll(".tap-target").length,
      };
    });
    rep.push({ route, ...v });
  }
  note(`tapClasses@${vw}`, rep);
  await ctx.close();
}
writeFileSync(`${OUT}/taptight-notes.json`, JSON.stringify(notes, null, 1));
await browser.close();
