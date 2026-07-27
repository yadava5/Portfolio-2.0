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
  auditTallyClauses,
  projectCaseStudies,
  receiptAnchor,
  receiptAuditCounts,
  receiptAuditState,
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

  /* The system-card row (2026-07-26). The rail already carried repo and
     live demo; the app's own documentation was the third terminal the
     placement model names and the only one this site never linked.

     Two things are asserted, and the second is the one that matters.
     The row prints a PATH (`/system-card ↗`), not a host — it composes
     with the live-demo row directly above it, which just printed the
     host. That composition is load-bearing: a bare `/system-card` under
     a rail with no host row is a link to nowhere a reader can name. So
     the test asserts the ORDER, not merely the presence. */
  for (const study of projectCaseStudies) {
    const project = projects.find((entry) => entry.id === study.projectId);
    if (!project?.systemCardUrl) continue;
    test(`${study.projectId}: meta ledger renders the system card under the live demo`, async ({
      page,
    }) => {
      await page.goto(`/projects/${study.projectId}/`);
      await page.waitForLoadState("domcontentloaded");

      const card = page.locator(
        `a[data-system-card][href="${project.systemCardUrl}"]`
      );
      await expect(card).toBeVisible();
      await expect(card).toContainText("↗");
      await expect(card).toHaveAttribute("target", "_blank");
      await expect(card).toHaveAttribute("rel", /noopener/);

      const demo = page.locator("a[data-live-demo]");
      await expect(demo).toBeVisible();
      const seats = await page.evaluate(() => {
        const box = (sel: string) =>
          document.querySelector(sel)?.getBoundingClientRect().top ?? null;
        return {
          demo: box("a[data-live-demo]"),
          card: box("a[data-system-card]"),
        };
      });
      expect(seats.demo).not.toBeNull();
      expect(
        seats.card!,
        "the path only reads under the row that printed the host"
      ).toBeGreaterThan(seats.demo!);
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

  test("fast-mnist: the ~97% receipt is stamped HELD until an eval run earns it", async ({
    page,
  }) => {
    await page.goto("/projects/fast-mnist-nn/");
    await page.waitForLoadState("domcontentloaded");

    /* W2 HELD apparatus (friend transposition #1): the reserved
       dashed-clay stamp on the one number that terminates in README
       prose, plus the Newsreader footnote naming when it lifts. */
    const row = page.locator("#v-fast-mnist-nn-1");
    await expect(
      row.getByRole("img", { name: "Stamp: held — not yet earned" })
    ).toBeVisible();
    await expect(row).toContainText(
      "held until a committed eval run earns it — see corrections."
    );

    /* The footnote's pointer resolves: the register carries the entry */
    await expect(page.locator("#corrections")).toContainText("HELD stamp");

    /* And the skeuomorph budget holds — no other stamp on this file */
    await expect(page.getByRole("img", { name: /^Stamp:/ })).toHaveCount(1);
  });

  /* Cadence's isolation section (2026-07-26). The file now argues the
     portfolio's strongest systems story — 7 IDOR endpoints fixed,
     DB-enforced RLS written against a shared pooler, 11/11 isolation
     tests — and exactly one sentence in it is dangerous: the RLS is
     deployed INERT. Nothing in the database is enforcing anything.

     A reader who skims the receipts and stops before the boundary rows
     must still land on that fact, so it is stated in the receipt that
     makes the claim, not only in the boundary block below. This test is
     the reason a future edit cannot quietly promote the claim: it
     asserts the caveat is present in BOTH seats, and that the page
     nowhere says the DB-level isolation is live. */
  test("cadence: the RLS receipt carries its own inert standing", async ({
    page,
  }) => {
    await page.goto("/projects/taskflow-calendar/");
    await page.waitForLoadState("domcontentloaded");

    /* Seat 1 — inside the receipt row that claims it (#v-…-5) */
    const row = page.locator("#v-taskflow-calendar-5");
    await expect(row).toContainText("NOT live");
    await expect(row).toContainText(
      "Nothing in the app auto-applies this file"
    );
    await expect(row).toContainText("deployed inert");

    /* Seat 2 — the boundary block, where it also has to stand alone */
    const boundaries = page
      .locator("#validation div")
      .filter({ hasText: "NOT claiming" })
      .last();
    await expect(boundaries).toContainText(
      "The DB-enforced RLS is not turned on in production"
    );
    /* The two limits that keep the surrounding numbers honest */
    await expect(boundaries).toContainText(
      "The 11 isolation tests are not in CI"
    );
    await expect(boundaries).toContainText(
      "which role the production DATABASE_URL actually uses"
    );

    /* And the page never says the opposite. These are the phrasings a
       well-meaning rewrite would reach for; each one is a promotion of
       the claim, so each one fails the suite. */
    const body = await page.locator("body").innerText();
    for (const overclaim of [
      "RLS is live",
      "RLS is enforced",
      "RLS enforced in production",
      "row-level security is live",
      "database-enforced isolation is live",
    ]) {
      expect(body.toLowerCase()).not.toContain(overclaim.toLowerCase());
    }
  });

  test("cadence: the two pins each name the commit their number came from", async ({
    page,
  }) => {
    await page.goto("/projects/taskflow-calendar/");
    await page.waitForLoadState("domcontentloaded");

    /* The suite count stays at the commit it was measured at; the
       isolation receipts pin the public head where that work landed.
       The register explains the split — delete the note and this
       fails, which is the point of a permanent register. */
    await expect(page.locator("#v-taskflow-calendar-1")).toContainText(
      "69a59e7"
    );
    await expect(page.locator("#v-taskflow-calendar-7")).toContainText(
      "54c79e0"
    );
    /* `⟶`, not `→` (fix round 6): the paper set two different
       right-arrow glyphs at the same 13px in the same Fragment Mono —
       61px apart on the home page — and unified on the house glyph,
       the one SystemDiagram rules its stage edges with. This assertion
       is about the register EXPLAINING the rename, which it still does;
       only the glyph the sentence is set in moved. */
    await expect(page.locator("#corrections")).toContainText(
      "yadava5/taskflow-calendar ⟶ yadava5/cadence"
    );
    /* The superseded demo host is gone from the page, and its erratum
       is on file — the register is how a number changes here. */
    await expect(
      page.locator('a[href="https://taskflow-calendar-ashy.vercel.app"]')
    ).toHaveCount(0);
    await expect(page.locator("#corrections")).toContainText(
      "taskflow-calendar-ashy.vercel.app"
    );
  });

  test("dossier sections carry the [ section ] · § descriptor heads", async ({
    page,
  }) => {
    await page.goto("/projects/automl/");
    await page.waitForLoadState("domcontentloaded");
    for (const head of [
      "[ problem ] · § as found",
      "[ architecture ] · § fig. 2, inked",
      "[ decisions ] · § as filed",
      "[ validation ] · § the receipts",
      "[ corrections ] · § the register",
      "[ appendix ] · § plates & artifacts",
    ]) {
      await expect(page.getByText(head), head).toBeVisible();
    }

    /* Ledger files speak the same grammar over the checked-in table */
    await page.goto("/projects/master-inventory/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText("[ ledger ] · §")).toBeVisible();
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

test.describe("proof glance — the scan strips recount (evviz round)", () => {
  /* The glance strips are NEW presentation (scan-first summary figures
     over the same rows), so they get NEW recount contracts: every drawn
     mark and every caption count must equal an independent recount of
     the data the strip claims to summarize — computed, never typed. No
     pre-existing dossier contract changed hands in this round. */

  test("/evidence glance draws one visibility mark per manifest entry", async ({
    page,
  }) => {
    await page.goto("/evidence/");
    await page.waitForLoadState("domcontentloaded");

    const strip = page.locator("[data-proof-glance]");
    await expect(strip).toHaveCount(1);
    await expect(strip.locator("[data-glance-vis]")).toHaveCount(
      proofManifest.length
    );
    /* Every HELD entry — and only a HELD entry — carries the clay dash */
    await expect(strip.locator("[data-glance-held]")).toHaveCount(
      proofManifest.filter((entry) => entry.held).length
    );
    /* The caption's counts are the manifest's own arithmetic */
    await expect(strip).toContainText(`${proofManifest.length} entries`);
    for (const visibility of ["public", "private-safe", "local-only"]) {
      const n = proofManifest.filter(
        (entry) => entry.visibility === visibility
      ).length;
      await expect(
        strip.locator(`[data-glance-vis="${visibility}"]`)
      ).toHaveCount(n);
    }
  });

  for (const projectId of ["automl", "jobtracker", "fast-mnist-nn"]) {
    test(`${projectId}: validation glance marks match the rows' audit states`, async ({
      page,
    }) => {
      const study = projectCaseStudies.find(
        (candidate) => candidate.projectId === projectId
      )!;
      const expected = [...study.receipts, ...study.outcomes].map(
        receiptAuditState
      );

      await page.goto(`/projects/${projectId}/`);
      await page.waitForLoadState("domcontentloaded");

      const strip = page.locator("#validation [data-proof-glance]");
      await expect(strip).toHaveCount(1);
      /* One mark per receipt row, in walk order, each carrying the
         exact audit state the walk's gutter mark will earn */
      const states = await strip
        .locator("[data-glance-state]")
        .evaluateAll((marks) =>
          marks.map((mark) => mark.getAttribute("data-glance-state"))
        );
      expect(states).toEqual(expected);
      /* The caption speaks the settled line's own tally clauses — one
         composer (auditTallyClauses), so strip and walk cannot drift */
      await expect(strip).toContainText(
        auditTallyClauses(receiptAuditCounts(study)).join(" · ")
      );
    });
  }
});

test.describe("dossier — t-slips as margin sidenotes (W5 round B)", () => {
  /* Visitor #5: on the dossier grid's lg breakpoint every tradeoff
     slip seats as a true right-margin sidenote BESIDE its own decision
     (per-article grid: alignment by entry, top-seated with the d-head)
     while the clause column keeps its continuous measure; below lg the
     stacked flow is byte-identical to the old one. DOM order (head →
     reason → slip) is a reading-order contract in both worlds. */
  for (const projectId of ["automl", "jobtracker"]) {
    test(`${projectId}: every tradeoff slip is seated with its decision`, async ({
      page,
    }) => {
      await page.goto(`/projects/${projectId}/`);
      await page.locator("#decisions [data-tradeoff-slip]").first().waitFor();

      const probe = await page.evaluate(() =>
        Array.from(document.querySelectorAll("#decisions article")).map(
          (article) => {
            const head = article.querySelector("h3");
            const reason = article.querySelector("p");
            const slip = article.querySelector("[data-tradeoff-slip]");
            const box = (el: Element | null) => {
              const rect = el?.getBoundingClientRect();
              return rect
                ? {
                    left: rect.left,
                    right: rect.right,
                    top: rect.top,
                    bottom: rect.bottom,
                  }
                : null;
            };
            return {
              order:
                head && reason && slip
                  ? Boolean(
                      head.compareDocumentPosition(reason) &
                      Node.DOCUMENT_POSITION_FOLLOWING
                    ) &&
                    Boolean(
                      reason.compareDocumentPosition(slip) &
                      Node.DOCUMENT_POSITION_FOLLOWING
                    )
                  : false,
              head: box(head),
              reason: box(reason),
              slip: box(slip),
            };
          }
        )
      );

      expect(probe.length).toBeGreaterThanOrEqual(3);
      const desktop = (page.viewportSize()?.width ?? 0) >= 1024;
      for (const [index, row] of probe.entries()) {
        expect(row.head, `decision ${index + 1} head`).not.toBeNull();
        expect(row.reason, `decision ${index + 1} reason`).not.toBeNull();
        expect(row.slip, `decision ${index + 1} slip`).not.toBeNull();
        /* Reading order never changes hands: head → reason → slip */
        expect(row.order, `decision ${index + 1} DOM order`).toBe(true);
        if (desktop) {
          /* Beside, in the right margin: the slip clears the clause
             column entirely and tops out with its own d-head */
          expect(
            row.slip!.left,
            `decision ${index + 1}: slip sits right of the reason`
          ).toBeGreaterThanOrEqual(row.reason!.right);
          expect(
            Math.abs(row.slip!.top - row.head!.top),
            `decision ${index + 1}: slip top-seats with its head`
          ).toBeLessThanOrEqual(8);
        } else {
          /* The old stacked flow, untouched */
          expect(
            row.slip!.top,
            `decision ${index + 1}: slip stays below the reason`
          ).toBeGreaterThanOrEqual(row.reason!.bottom);
        }
      }

      /* The widened section never costs horizontal integrity */
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true);
    });
  }
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
