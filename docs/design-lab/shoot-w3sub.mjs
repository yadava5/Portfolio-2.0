/**
 * Wave 3 subpage shots — the surfaces this wave changed, on screen.
 *
 * Captures the gate's new references block (F58), /evidence's source
 * qualifiers and crosswalk spacing (F44/F55/F43), a case file with and
 * without a local-only row (F57), and the OG cards' own routes.
 *
 * Usage: PORT=3200 node docs/design-lab/shoot-w3sub.mjs [tag]
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "after";
const PORT = process.env.PORT ?? "3200";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(process.cwd(), "docs/design-lab/shots-w3sub");
fs.mkdirSync(OUT, { recursive: true });

const server = spawn(process.execPath, ["tests/playwright/static-server.mjs"], {
  env: { ...process.env, PORT },
  stdio: "inherit",
});
await new Promise((r) => setTimeout(r, 2500));

const browser = await chromium.launch();
const report = {};

/* ── The gate's references block (F58) ───────────────────────────── */
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.addInitScript(() => localStorage.setItem("motion-off", "1"));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const block = page.locator("#gate").getByText("on file — references");
  await block.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(OUT, `${TAG}-gate-references.png`),
    clip: await page
      .locator("#gate")
      .boundingBox()
      .then((b) => ({
        x: 0,
        y: Math.max(0, 0),
        width: 1440,
        height: 900,
      })),
  });
  report.gateReferences = await page.evaluate(() => {
    const heads = [...document.querySelectorAll("#gate h2")].map((h) =>
      h.textContent?.trim()
    );
    const quote = document.querySelector("#gate blockquote")?.textContent ?? "";
    const body = document.getElementById("gate")?.innerText ?? "";
    return {
      headings: heads,
      quoteChars: quote.length,
      miamiMentions: (body.match(/Miami/gi) ?? []).length,
      namesRandall: body.includes("Randall Vollen"),
      namesShree: body.includes("Shree"),
      discloses: body.toLowerCase().includes("excerpted, not edited"),
    };
  });
  report.homeMiamiMentions = await page.evaluate(
    () => (document.body.innerText.match(/Miami/gi) ?? []).length
  );
  await page.close();
}

/* ── /evidence (F43/F44/F54/F55) ─────────────────────────────────── */
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
  });
  await page.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT, `${TAG}-evidence-top.png`),
  });
  report.evidence = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      entries: document.querySelectorAll("ol > li[id]").length,
      receiptWord: (text.match(/receipt/gi) ?? []).length,
      arguedIn: (text.match(/argued in:/gi) ?? []).length,
      selfHosted: (text.match(/\[self-hosted/g) ?? []).length,
      selfAuthored: (text.match(/\[self-authored/g) ?? []).length,
      arrowsIntoSite: [...document.querySelectorAll("dd a")].filter(
        (a) =>
          !a.getAttribute("href")?.startsWith("http") &&
          a.textContent?.includes("↗")
      ).length,
      noCaseFileRows: (text.match(/no case file/g) ?? []).length,
      notRecordedDates: (text.match(/not recorded/g) ?? []).length,
    };
  });
  await page.close();
}

/* ── Case files: the local-only legend (F57) ─────────────────────── */
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const legend = {};
  for (const id of [
    "automl",
    "jobtracker",
    "fast-mnist-nn",
    "master-inventory",
    "policybot",
    "taskflow-calendar",
    "visual-assist",
  ]) {
    await page.goto(`${BASE}/projects/${id}/`, { waitUntil: "networkidle" });
    legend[id] = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        badgeOnPage: text.includes("[local — verified on request]"),
        legendPrinted: text.includes("rows marked [local"),
      };
    });
    if (id === "automl" || id === "jobtracker") {
      await page.screenshot({
        path: path.join(OUT, `${TAG}-case-${id}.png`),
        fullPage: false,
      });
    }
  }
  report.localOnlyLegend = legend;
  report.legendLiars = Object.entries(legend)
    .filter(([, v]) => v.legendPrinted !== v.badgeOnPage)
    .map(([id]) => id);
  await page.close();
}

fs.writeFileSync(
  path.join(OUT, `probe-${TAG}.json`),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));

await browser.close();
server.kill();
