/**
 * Dossier contracts — the case files as working-paper dossiers.
 *
 * Covers the build-round guarantees from FRONTEND-COMPLETION-MAP §2/§3:
 *   - every receipts-table row anchor (`#v-<id>-<n>`) resolves, including
 *     the specific anchors the homepage footnote registry deep-links;
 *   - `live demo ↗` renders wherever the data has a liveUrl (the found
 *     bug: data existed, was never rendered);
 *   - /evidence renders every proofManifest entry (the master ledger);
 *   - the folio footer returns to /#work (the dead /#projects anchor is
 *     gone sitewide);
 *   - the header is legible on case routes (reads the archive surface —
 *     no dark-on-dark landing);
 *   - at 390px the home Red Thread stays inside its reserved gutter and
 *     never touches letterforms (journey-critique collision fix).
 */

import { test, expect, Page } from "@playwright/test";
import { projects } from "../../src/lib/data/projects";
import { proofManifest } from "../../src/lib/data/proofManifest";
import {
  projectCaseStudies,
  receiptAnchor,
} from "../../src/lib/data/projectCaseStudies";

/** Anchors the homepage registry/litany deep-link into case files */
const HOME_ROW_ANCHOR_TARGETS = [
  { path: "/projects/jobtracker/", anchor: "v-jobtracker-4" },
  { path: "/projects/jobtracker/", anchor: "v-jobtracker-5" },
  { path: "/projects/fast-mnist-nn/", anchor: "v-fast-mnist-nn-2" },
  { path: "/projects/visual-assist/", anchor: "v-visual-assist-1" },
  { path: "/projects/policybot/", anchor: "v-policybot-1" },
  { path: "/projects/master-inventory/", anchor: "v-master-inventory-5" },
];

/** WCAG relative-luminance contrast from two computed CSS colors */
async function contrastBetween(
  page: Page,
  fgSelector: string,
  bgSelector: string
): Promise<number> {
  return page.evaluate(
    ([fgSel, bgSel]) => {
      const parse = (value: string): [number, number, number] => {
        const match = value.match(/rgba?\(([^)]+)\)/);
        if (!match) return [0, 0, 0];
        const [r, g, b] = match[1]
          .split(",")
          .map((channel) => parseFloat(channel.trim()));
        return [r, g, b];
      };
      const luminance = ([r, g, b]: [number, number, number]) => {
        const lin = (c: number) => {
          const s = c / 255;
          return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      };
      const fg = document.querySelector(fgSel);
      const bg = document.querySelector(bgSel);
      if (!fg || !bg) return 0;
      const fgColor = parse(getComputedStyle(fg).color);
      const bgColor = parse(getComputedStyle(bg).backgroundColor);
      const [l1, l2] = [luminance(fgColor), luminance(bgColor)].sort(
        (a, b) => b - a
      );
      return (l1 + 0.05) / (l2 + 0.05);
    },
    [fgSelector, bgSelector]
  );
}

test.describe("dossier — case files", () => {
  for (const study of projectCaseStudies) {
    test(`${study.projectId}: every receipts-table row anchor resolves`, async ({
      page,
    }) => {
      await page.goto(`/projects/${study.projectId}/`);
      await page.waitForLoadState("domcontentloaded");

      const rowCount = study.receipts.length + study.outcomes.length;
      expect(rowCount).toBeGreaterThan(0);
      for (let n = 1; n <= rowCount; n++) {
        await expect(
          page.locator(`#${receiptAnchor(study.projectId, n)}`),
          `row anchor ${n} of ${study.projectId}`
        ).toBeAttached();
      }
      /* And no anchor beyond the last row */
      await expect(
        page.locator(`#${receiptAnchor(study.projectId, rowCount + 1)}`)
      ).toHaveCount(0);
    });
  }

  for (const target of HOME_ROW_ANCHOR_TARGETS) {
    test(`home deep-link target ${target.anchor} exists on ${target.path}`, async ({
      page,
    }) => {
      await page.goto(target.path);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator(`#${target.anchor}`)).toBeAttached();
    });
  }

  for (const study of projectCaseStudies) {
    const project = projects.find((entry) => entry.id === study.projectId);
    if (!project?.liveUrl) continue;
    test(`${study.projectId}: meta ledger renders the live demo row`, async ({
      page,
    }) => {
      await page.goto(`/projects/${study.projectId}/`);
      await page.waitForLoadState("domcontentloaded");
      const demo = page.locator(`a[data-live-demo][href="${project.liveUrl}"]`);
      await expect(demo).toBeVisible();
      await expect(demo).toContainText("↗");
    });
  }

  for (const study of projectCaseStudies) {
    test(`${study.projectId}: folio footer returns to /#work and links /evidence`, async ({
      page,
    }) => {
      await page.goto(`/projects/${study.projectId}/`);
      await page.waitForLoadState("domcontentloaded");

      const backLink = page.locator('a[href="/#work"]', {
        hasText: "back to the work",
      });
      await expect(backLink).toBeVisible();
      await expect(page.locator('a[href="/evidence/"]').first()).toBeAttached();
      /* The dead anchor is gone for good */
      await expect(page.locator('a[href="/#projects"]')).toHaveCount(0);
      await expect(page.locator('a[href="#projects"]')).toHaveCount(0);
    });
  }

  test("header reads the archive surface on case routes (no dark-on-dark)", async ({
    page,
  }) => {
    await page.goto("/projects/automl/");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("header.site-header")).toHaveAttribute(
      "data-surface",
      "archive"
    );
    /* At scroll-0 the wordmark must hold AA against the dossier stock */
    const ratio = await contrastBetween(
      page,
      "header.site-header a[href='/']",
      "article[data-dossier]"
    );
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test("header reads the archive surface on /evidence too", async ({
    page,
  }) => {
    await page.goto("/evidence/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("header.site-header")).toHaveAttribute(
      "data-surface",
      "archive"
    );
  });

  test("kicker carries two dates and a status word", async ({ page }) => {
    await page.goto("/projects/automl/");
    await page.waitForLoadState("domcontentloaded");
    const kicker = page.locator("[data-dossier-kicker]");
    await expect(kicker).toContainText("filed 2025-09");
    await expect(kicker).toContainText("last verified 2026-07");
    await expect(page.locator("[data-dossier-status]")).toContainText(
      "status:"
    );
  });

  test("flagship renders the honest protocol absence + corrections note", async ({
    page,
  }) => {
    await page.goto("/projects/automl/");
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByText("protocol: not yet documented — see corrections.")
    ).toBeVisible();
    await expect(page.locator("#corrections")).toContainText(
      "Per-run metrics remain withheld"
    );
  });

  test("the AVX-512 retraction lives in the corrections register, permanently", async ({
    page,
  }) => {
    await page.goto("/projects/fast-mnist-nn/");
    await page.waitForLoadState("domcontentloaded");
    const register = page.locator("#corrections");
    await expect(register).toContainText("erratum · 2026-05-28");
    await expect(register).toContainText(
      "classify-throughput rows do not support it"
    );
  });

  test("checked-in ledgers render as tables with raw JSON downloads", async ({
    page,
  }) => {
    for (const id of ["master-inventory", "policybot"]) {
      await page.goto(`/projects/${id}/`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("#ledger table")).toBeVisible();
      const download = page.locator(`#ledger a[href$="-ledger.json"]`);
      await expect(download).toBeVisible();
      const href = await download.getAttribute("href");
      const response = await page.request.get(
        new URL(href ?? "", page.url()).toString()
      );
      expect(response.status()).toBe(200);
    }
  });
});

test.describe("dossier — the evidence index", () => {
  test("/evidence renders every proof-manifest entry", async ({ page }) => {
    await page.goto("/evidence/");
    await page.waitForLoadState("domcontentloaded");

    for (const entry of proofManifest) {
      const row = page.locator(`#${entry.id}`);
      await expect(row, `manifest entry ${entry.id}`).toBeVisible();
      await expect(row).toContainText(entry.label);
      await expect(row).toContainText(entry.verification);
      await expect(row).toContainText(entry.privacyBoundary);
      if (entry.source.startsWith("http")) {
        await expect(row.locator(`a[href="${entry.source}"]`)).toBeAttached();
      }
    }
  });

  test("home gate references link the evidence index", async ({ page }) => {
    await page.goto("/");
    await page.locator("#gate").waitFor({ state: "attached" });
    await expect(
      page.locator('#gate a[href="/evidence/"]').first()
    ).toBeAttached();
  });
});

test.describe("dossier — mobile thread gutter (home)", () => {
  test("at 390 the thread never touches letterforms in chapters 02–06", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page
      .locator("svg[data-thread-segment='03'] path.thread-past")
      .waitFor({ state: "attached", timeout: 15000 });
    /* Give ResizeObserver/font re-measures a beat to settle */
    await page.waitForTimeout(600);

    const probe = await page.evaluate(() => {
      const GUTTER_CHAPTERS = ["02", "03", "04", "05", "06"];
      const results: {
        seg: string;
        threadRight: number;
        textLeft: number;
      }[] = [];
      for (const id of GUTTER_CHAPTERS) {
        const svg = document.querySelector(`svg[data-thread-segment='${id}']`);
        const past = svg?.querySelector<SVGPathElement>("path.thread-past");
        const section = svg?.closest("[data-chapter]");
        if (!svg || !past || !section) continue;
        /* The ink's rightmost reach, sampled along the path */
        const svgBox = svg.getBoundingClientRect();
        const total = past.getTotalLength();
        let right = -Infinity;
        for (let i = 0; i <= 140; i++) {
          const pt = past.getPointAtLength((total * i) / 140);
          right = Math.max(right, svgBox.left + pt.x);
        }
        /* The nearest letterforms: text elements inside the chapter */
        let textLeft = Infinity;
        for (const el of section.querySelectorAll("p, h2, h3, li, a, span")) {
          if (!el.textContent?.trim()) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) continue;
          textLeft = Math.min(textLeft, rect.left);
        }
        results.push({ seg: id, threadRight: right, textLeft });
      }
      return results;
    });

    expect(probe.length).toBe(5);
    for (const row of probe) {
      /* A true reserved gutter: ink stops ≥4px before any letterform */
      expect(
        row.threadRight,
        `segment ${row.seg} thread reach vs text at ${row.textLeft}`
      ).toBeLessThanOrEqual(row.textLeft - 4);
    }

    /* And the gutter never costs horizontal integrity */
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
});
