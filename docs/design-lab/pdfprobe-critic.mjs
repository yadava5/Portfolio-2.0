import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
// browser default: printBackground FALSE — what a recruiter's Cmd+P preview shows
await p.pdf({ path: "docs/design-lab/shots-critic/verify-print-nobg.pdf", format: "Letter", printBackground: false });
await p.pdf({ path: "docs/design-lab/shots-critic/verify-print-bg.pdf", format: "Letter", printBackground: true });
console.log("pdfs written");
await b.close();
