/* CERT pass LIVE — the deployed edition under its real basePath.
   Hunts basePath-only faults the local empty-basePath build cannot show.
   REPORT ONLY. */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://yadava5.github.io/Portfolio-2.0";
const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-cert";
const R = {};
const browser = await chromium.launch();

/* desktop + mobile first frames, console + network health */
for (const [w, h, tag] of [[1440, 900, "live-desk"], [390, 844, "live-mob"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
  const p = await ctx.newPage();
  const errs = [];
  const bad = [];
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 200)); });
  p.on("pageerror", (e) => errs.push("PAGEERROR " + String(e).slice(0, 200)));
  p.on("response", (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: path.join(OUT, `${tag}-hero.png`) });
  R[`${tag}_console`] = errs;
  R[`${tag}_badResponses`] = bad;
  R[`${tag}_height`] = await p.evaluate(() => document.documentElement.scrollHeight);
  R[`${tag}_overflow`] = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  R[`${tag}_links`] = await p.evaluate(() =>
    [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => h && !h.startsWith("#"))
  );
  // scroll the whole page, watch for 404s and errors
  await p.evaluate(async () => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y < H; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 130)); }
  });
  await p.waitForTimeout(1500);
  await p.evaluate(() => document.getElementById("gate")?.scrollIntoView());
  await p.waitForTimeout(2000);
  await p.screenshot({ path: path.join(OUT, `${tag}-gate.png`) });
  R[`${tag}_console_after`] = errs.slice();
  R[`${tag}_bad_after`] = bad.slice();
  await ctx.close();
}

/* the real 404 — GitHub Pages serves 404.html for an unknown path */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const res = await p.goto(BASE + "/this-page-does-not-exist/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1600);
  await p.screenshot({ path: path.join(OUT, "live-404.png") });
  R.live404 = {
    status: res?.status(),
    title: await p.title(),
    h1: await p.evaluate(() => document.querySelector("h1")?.innerText),
    links: await p.evaluate(() => [...document.querySelectorAll("a[href],button")].map((n) => ({ t: (n.innerText || "").replace(/\s+/g, " ").trim().slice(0, 26), href: n.getAttribute("href") }))),
  };
  // click the recovery control and see where it lands
  const home = p.locator('a:has-text("Return to Home"), button:has-text("Return to Home")').first();
  if (await home.count()) {
    await home.click();
    await p.waitForTimeout(2500);
    R.live404Recovery = { url: p.url(), title: await p.title() };
  }
  await ctx.close();
}

/* resume + mailto + evidence reachability on the live basePath */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const targets = await p.evaluate(() =>
    [...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => h && !h.startsWith("#") && !h.startsWith("mailto:"))
  );
  const uniq = [...new Set(targets)];
  const results = [];
  for (const h of uniq) {
    const url = /^https?:/.test(h) ? h : new URL(h, BASE + "/").href;
    if (!url.startsWith("https://yadava5.github.io")) { results.push({ h, status: "external", url }); continue; }
    const res = await p.request.get(url).catch(() => null);
    results.push({ h, url, status: res ? res.status() : "ERR" });
  }
  R.liveLinks = results;
  R.liveBroken = results.filter((r) => r.status !== 200 && r.status !== "external");
  await ctx.close();
}

fs.writeFileSync(path.join(OUT, "cert-live.json"), JSON.stringify(R, null, 2));
await browser.close();
console.log(JSON.stringify({
  deskConsole: R["live-desk_console_after"], deskBad: R["live-desk_bad_after"],
  mobConsole: R["live-mob_console_after"], mobBad: R["live-mob_bad_after"],
  deskHeight: R["live-desk_height"], mobHeight: R["live-mob_height"],
  overflowDesk: R["live-desk_overflow"], overflowMob: R["live-mob_overflow"],
  live404: R.live404, live404Recovery: R.live404Recovery,
  liveBroken: R.liveBroken,
}, null, 2));
