import { chromium } from "playwright";
import fs from "fs";

const DIR =
  "/sessions/intelligent-vigilant-lamport/mnt/Portfolio/portfolio/test-screenshots/a11y";
fs.mkdirSync(DIR, { recursive: true });

const themes = [
  "dark-luxe",
  "paper-ink",
  "editorial",
  "noir-cinema",
  "neon-cyber",
];

(async () => {
  const browser = await chromium.launch();
  const results = {};

  for (const theme of themes) {
    console.log(`\nAuditing: ${theme}`);
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.goto("http://localhost:3460", {
      waitUntil: "networkidle",
      timeout: 20000,
    });
    await page.waitForTimeout(2000);

    await page.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
    }, theme);
    await page.waitForTimeout(1500);

    const audit = await page.evaluate(() => {
      const issues = [];

      // 1. Images without alt text
      document.querySelectorAll("img").forEach((img) => {
        if (!img.alt && !img.getAttribute("aria-hidden")) {
          issues.push({
            type: "missing-alt",
            element: img.src?.split("/").pop() || "unknown",
            severity: "critical",
          });
        }
      });

      // 2. Links without accessible names
      document.querySelectorAll("a").forEach((a) => {
        const name =
          a.textContent?.trim() || a.getAttribute("aria-label") || "";
        if (!name && !a.querySelector("img, svg")) {
          issues.push({
            type: "empty-link",
            href: a.href,
            severity: "critical",
          });
        }
      });

      // 3. Buttons without accessible names
      document.querySelectorAll("button").forEach((btn) => {
        const name =
          btn.textContent?.trim() || btn.getAttribute("aria-label") || "";
        if (!name) {
          issues.push({ type: "empty-button", severity: "critical" });
        }
      });

      // 4. Missing form labels
      document.querySelectorAll("input, textarea, select").forEach((input) => {
        const id = input.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = input.getAttribute("aria-label");
        if (!label && !ariaLabel && input.type !== "hidden") {
          issues.push({
            type: "missing-label",
            inputType: input.type,
            severity: "high",
          });
        }
      });

      // 5. Heading hierarchy
      const headings = [];
      document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        headings.push({
          level: parseInt(h.tagName[1]),
          text: h.textContent?.slice(0, 50),
        });
      });
      let prevLevel = 0;
      headings.forEach((h) => {
        if (h.level > prevLevel + 1) {
          issues.push({
            type: "heading-skip",
            from: `h${prevLevel}`,
            to: `h${h.level}`,
            text: h.text,
            severity: "medium",
          });
        }
        prevLevel = h.level;
      });

      // 6. Color contrast (basic check via computed styles)
      const contrastIssues = [];
      document
        .querySelectorAll("p, span, a, h1, h2, h3, h4, h5, h6, button, li")
        .forEach((el) => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bg = style.backgroundColor;
          // Flag very light text on light bg or very dark text on dark bg
          if (color === bg && el.textContent?.trim()) {
            contrastIssues.push({
              text: el.textContent?.slice(0, 30),
              color,
              bg,
            });
          }
        });
      if (contrastIssues.length > 0) {
        issues.push({
          type: "potential-contrast",
          count: contrastIssues.length,
          severity: "high",
        });
      }

      // 7. Focus indicators
      const focusableCount = document.querySelectorAll(
        "a[href], button, input, select, textarea, [tabindex]"
      ).length;

      // 8. Skip link
      const skipLink = document.querySelector(
        'a[href="#main"], a[href="#content"], .skip-link, [class*="skip"]'
      );
      if (!skipLink) {
        issues.push({ type: "missing-skip-link", severity: "high" });
      }

      // 9. Language attribute
      const lang = document.documentElement.lang;
      if (!lang) {
        issues.push({ type: "missing-lang", severity: "medium" });
      }

      // 10. Viewport meta
      const viewport = document.querySelector('meta[name="viewport"]');

      return {
        issues,
        headings,
        focusableElements: focusableCount,
        hasSkipLink: !!skipLink,
        hasLang: !!lang,
        langValue: lang,
        hasViewport: !!viewport,
        totalImages: document.querySelectorAll("img").length,
        totalLinks: document.querySelectorAll("a").length,
        totalButtons: document.querySelectorAll("button").length,
      };
    });

    results[theme] = audit;
    console.log(`  Issues: ${audit.issues.length}`);
    console.log(
      `  Headings: ${audit.headings.length}, Focusable: ${audit.focusableElements}`
    );
    audit.issues.forEach((i) =>
      console.log(
        `    [${i.severity}] ${i.type}: ${JSON.stringify(i).slice(0, 100)}`
      )
    );
  }

  fs.writeFileSync(
    `${DIR}/audit-results.json`,
    JSON.stringify(results, null, 2)
  );
  console.log("\nAudit complete!");

  await browser.close();
  process.exit(0);
})();
