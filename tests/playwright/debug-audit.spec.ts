import { test } from "@playwright/test";

test("Debug page structure", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Get page structure
  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      hasMain: !!document.querySelector("main"),
      h1Count: document.querySelectorAll("h1").length,
      h2Count: document.querySelectorAll("h2").length,
      sections: Array.from(document.querySelectorAll("section")).map((s) => ({
        id: s.id,
        height: s.offsetHeight,
      })),
      buttons: Array.from(document.querySelectorAll("button")).map((b) => ({
        text: b.textContent?.substring(0, 30),
        ariaLabel: b.getAttribute("aria-label"),
        visible: b.offsetHeight > 0,
      })),
      links: Array.from(document.querySelectorAll("a"))
        .slice(0, 5)
        .map((a) => ({
          text: a.textContent?.substring(0, 30),
          href: a.href,
        })),
    };
  });

  console.log("Page structure:", JSON.stringify(pageInfo, null, 2));

  // Take screenshot
  await page.screenshot({
    path: "tests/playwright/screenshots/audit/00-debug.png",
  });
});
