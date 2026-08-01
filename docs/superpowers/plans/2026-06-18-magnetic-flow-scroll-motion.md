# Magnetic Flow Scroll Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current over-designed rail/elevator motion with a restrained Magnetic Flow system: simple dots, native scrolling, threshold-gated section settling, and subtle arrival motion that does not fight the user.

**Architecture:** Keep normal document scroll and the existing Lenis provider. Add one focused magnetic-settle controller that listens passively to scroll end/debounce state and only settles when the viewport is already near a section boundary. Simplify `SectionRail` to quiet dot navigation and replace the current `atlas-elevator` global CSS/tests with a smaller `magnetic-flow` contract.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4 utilities, Lenis, Playwright, existing `prefers-reduced-motion` checks.

---

## Critical Design Critique

The current implementation contains the exact patterns the user rejected:

- `src/components/layout/SectionRail.tsx` renders a visible rail track, active capsule, cyan inner light, hover labels, and glow.
- `src/app/globals.css` contains `atlas-elevator-*` section sweeps, seam lines, and grid drift.
- `src/components/layout/ScrollProgress.tsx` renders a generic top progress bar.
- `tests/playwright/atlas.spec.ts` currently requires the rail track, tall active marker, and elevator animation names.

These are not polish issues; they are the wrong direction. The production implementation must remove or replace those contracts.

The chosen direction is **Magnetic Flow**:

- Browser/Lenis native scrolling remains the default.
- No `wheel` event listener.
- No `preventDefault`.
- No mandatory CSS scroll snap.
- No full-page lock zones.
- No pinned section theater.
- No top progress bar as a main motion element.
- No rail line, active capsule, hover label boxes, or cyan glow.
- Magnetic settling only runs after scrolling has stopped and only when the viewport is already close to a section start.
- Reduced motion, touch/coarse pointer, mobile, modals, and focused interactive controls disable settling.

The intended feel is: “if the user naturally arrives near a section boundary, the page completes the motion.” It must never feel like the site is taking the scroll wheel away.

## File Structure

- Create `src/components/layout/MagneticScroll.tsx`
  - Owns section-boundary settling only.
  - Uses passive scroll listeners plus native `scrollend` when available and a debounced fallback.
  - Never listens to `wheel`, never calls `preventDefault`.
  - Adds a temporary `data-magnetic-arriving="true"` attribute to the settled-to section for subtle arrival CSS.

- Modify `src/app/layout.tsx`
  - Remove `ScrollProgress` from the rendered shell.
  - Add `MagneticScroll` inside `SmoothScroll`, next to `Header` and `SectionRail`.
  - Keep `SectionRail` rendered only on the homepage.

- Modify `src/components/layout/SectionRail.tsx`
  - Replace the track/capsule/glow rail with simple dot anchors.
  - Keep accessible `aria-label` text.
  - Keep `aria-current="location"` on exactly one active link.
  - Use larger invisible hit targets around tiny visible dots.

- Modify `src/app/globals.css`
  - Remove `atlas-elevator-*` variables, keyframes, seams, section sweeps, and box shadows.
  - Add a small `magnetic-arrive` keyframe used only on sections with `data-magnetic-arriving="true"`.
  - Ensure reduced motion disables the arrival animation.

- Modify `tests/playwright/atlas.spec.ts`
  - Replace rail/elevator/progress assertions with the Magnetic Flow contract.
  - Keep existing section visibility, no overflow, and mobile rail absence coverage.

- Modify `tests/playwright/reduced-motion.spec.ts`
  - Assert magnetic settling is disabled under reduced motion.
  - Update rail marker assertions to simple dots instead of old transition/capsule checks.

## Acceptance Criteria

- The rail has eight quiet dot links on desktop and no rail track.
- The active dot is only slightly larger or more opaque than inactive dots.
- There are no visible rail labels by default.
- The top progress bar is not rendered.
- The homepage keeps eight `[data-atlas-section]` sections.
- Normal wheel scrolling can move through all sections without blank frames, trapped scroll, or horizontal overflow.
- Magnetic settling happens only when already near a section boundary.
- Magnetic settling does not run on mobile/coarse pointer, reduced motion, modal-locked body, or focused interactive elements.
- Reduced motion removes magnetic settling and section arrival transforms.
- Playwright validates desktop, mobile, reduced motion, no overflow, no `wheel` listener, no `preventDefault`, and section visibility.

---

### Task 1: Add Magnetic Flow Controller

**Files:**
- Create: `src/components/layout/MagneticScroll.tsx`
- Test: `tests/playwright/atlas.spec.ts`

- [ ] **Step 1: Add failing tests for magnetic scroll contract**

Add this test block after the existing homepage public surface tests in `tests/playwright/atlas.spec.ts`. It intentionally expects a component/behavior that does not exist yet.

```ts
  test("magnetic flow settles only near section boundaries without hijacking wheel", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      const listenedTypes: string[] = [];
      EventTarget.prototype.addEventListener = function addEventListenerSpy(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ) {
        listenedTypes.push(type);
        return originalAddEventListener.call(this, type, listener, options);
      };

      const scrollCalls: Array<ScrollToOptions> = [];
      const originalScrollTo = window.scrollTo.bind(window);
      Object.defineProperty(window, "__atlasListenedTypes", {
        value: listenedTypes,
        configurable: true,
      });
      Object.defineProperty(window, "__atlasScrollToCalls", {
        value: scrollCalls,
        configurable: true,
      });
      window.scrollTo = function scrollToSpy(
        xOrOptions?: number | ScrollToOptions,
        y?: number
      ) {
        if (typeof xOrOptions === "object") {
          scrollCalls.push(xOrOptions);
          return originalScrollTo(xOrOptions);
        }
        scrollCalls.push({ top: y ?? 0, left: xOrOptions ?? 0 });
        return originalScrollTo(xOrOptions ?? 0, y ?? 0);
      };
    });

    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    const listenedTypes = await page.evaluate(
      () =>
        (window as Window & { __atlasListenedTypes?: string[] })
          .__atlasListenedTypes ?? []
    );
    expect(listenedTypes).not.toContain("wheel");

    await page.evaluate(() => {
      const projects = document.getElementById("projects");
      if (!projects) return;
      window.scrollTo({ top: projects.offsetTop - 96, behavior: "auto" });
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scrollend"));
    });
    await page.waitForTimeout(650);

    const nearBoundaryCalls = await page.evaluate(
      () =>
        (window as Window & { __atlasScrollToCalls?: ScrollToOptions[] })
          .__atlasScrollToCalls ?? []
    );
    expect(
      nearBoundaryCalls.some((call) => call.behavior === "smooth")
    ).toBe(true);
    await expect(page.locator("#projects")).toBeInViewport();

    await page.evaluate(() => {
      (window as Window & { __atlasScrollToCalls?: ScrollToOptions[] })
        .__atlasScrollToCalls?.splice(0);
      const experience = document.getElementById("experience");
      if (!experience) return;
      window.scrollTo({
        top: experience.offsetTop - window.innerHeight * 0.52,
        behavior: "auto",
      });
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scrollend"));
    });
    await page.waitForTimeout(650);

    const farBoundaryCalls = await page.evaluate(
      () =>
        (window as Window & { __atlasScrollToCalls?: ScrollToOptions[] })
          .__atlasScrollToCalls ?? []
    );
    expect(
      farBoundaryCalls.some((call) => call.behavior === "smooth")
    ).toBe(false);

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      )
    ).toBe(true);
  });
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm run test:e2e:browser-smoke -- --project=chromium-desktop tests/playwright/atlas.spec.ts -g "magnetic flow settles"
```

Expected: FAIL because no magnetic scroll controller exists and no smooth settling call is observed.

- [ ] **Step 3: Create the magnetic controller**

Create `src/components/layout/MagneticScroll.tsx` with this implementation:

```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SETTLE_DEBOUNCE_MS = 140;
const ARRIVAL_ANIMATION_MS = 520;
const MAX_SETTLE_DISTANCE_PX = 170;
const VIEWPORT_SETTLE_RATIO = 0.18;
const DESKTOP_MEDIA = "(min-width: 1024px) and (pointer: fine)";
const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";
const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, details, summary, [role='button'], [role='dialog'], [contenteditable='true']";

function isInteractiveFocus() {
  const activeElement = document.activeElement;
  return (
    activeElement instanceof HTMLElement &&
    activeElement.matches(INTERACTIVE_SELECTOR)
  );
}

function isPageLocked() {
  const bodyStyle = getComputedStyle(document.body);
  const htmlStyle = getComputedStyle(document.documentElement);

  return (
    bodyStyle.position === "fixed" ||
    bodyStyle.overflow === "hidden" ||
    htmlStyle.overflow === "hidden"
  );
}

function getSectionTop(section: HTMLElement) {
  const scrollPaddingTop = Number.parseFloat(
    getComputedStyle(document.documentElement).scrollPaddingTop || "0"
  );

  return Math.max(0, section.offsetTop - scrollPaddingTop);
}

function findNearestSection(sections: HTMLElement[]) {
  const currentY = window.scrollY;
  const threshold = Math.min(
    MAX_SETTLE_DISTANCE_PX,
    window.innerHeight * VIEWPORT_SETTLE_RATIO
  );

  let nearest:
    | {
        section: HTMLElement;
        top: number;
        distance: number;
      }
    | undefined;

  for (const section of sections) {
    const top = getSectionTop(section);
    const distance = Math.abs(top - currentY);

    if (distance > threshold) continue;
    if (!nearest || distance < nearest.distance) {
      nearest = { section, top, distance };
    }
  }

  return nearest;
}

export function MagneticScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const desktopQuery = window.matchMedia(DESKTOP_MEDIA);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_MEDIA);
    let debounceId = 0;
    let arrivalId = 0;
    let settling = false;
    let lastSettledSectionId = "";

    const clearArrivalState = () => {
      window.clearTimeout(arrivalId);
      document.documentElement.removeAttribute("data-magnetic-settling");
      for (const section of document.querySelectorAll<HTMLElement>(
        "[data-atlas-section][data-magnetic-arriving]"
      )) {
        section.removeAttribute("data-magnetic-arriving");
      }
    };

    const shouldSkipSettling = () =>
      !desktopQuery.matches ||
      reducedMotionQuery.matches ||
      settling ||
      isInteractiveFocus() ||
      isPageLocked();

    const settleIfNearBoundary = () => {
      window.clearTimeout(debounceId);
      if (shouldSkipSettling()) return;

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-atlas-section][id]")
      );
      const nearest = findNearestSection(sections);
      if (!nearest) return;

      if (
        nearest.section.id === lastSettledSectionId &&
        nearest.distance <= 2
      ) {
        return;
      }

      settling = true;
      lastSettledSectionId = nearest.section.id;
      clearArrivalState();
      document.documentElement.setAttribute("data-magnetic-settling", "true");
      nearest.section.setAttribute("data-magnetic-arriving", "true");

      window.scrollTo({
        top: nearest.top,
        behavior: "smooth",
      });

      arrivalId = window.setTimeout(() => {
        settling = false;
        clearArrivalState();
      }, ARRIVAL_ANIMATION_MS);
    };

    const requestDebouncedSettle = () => {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(settleIfNearBoundary, SETTLE_DEBOUNCE_MS);
    };

    const handleResizeOrPreferenceChange = () => {
      clearArrivalState();
      settling = false;
      window.clearTimeout(debounceId);
    };

    window.addEventListener("scroll", requestDebouncedSettle, {
      passive: true,
    });
    window.addEventListener("scrollend", settleIfNearBoundary);
    window.addEventListener("resize", handleResizeOrPreferenceChange);
    desktopQuery.addEventListener("change", handleResizeOrPreferenceChange);
    reducedMotionQuery.addEventListener("change", handleResizeOrPreferenceChange);

    return () => {
      window.clearTimeout(debounceId);
      clearArrivalState();
      window.removeEventListener("scroll", requestDebouncedSettle);
      window.removeEventListener("scrollend", settleIfNearBoundary);
      window.removeEventListener("resize", handleResizeOrPreferenceChange);
      desktopQuery.removeEventListener("change", handleResizeOrPreferenceChange);
      reducedMotionQuery.removeEventListener(
        "change",
        handleResizeOrPreferenceChange
      );
    };
  }, [pathname]);

  return null;
}
```

- [ ] **Step 4: Mount the controller**

Modify `src/app/layout.tsx`:

```tsx
import { MagneticScroll } from "@/components/layout/MagneticScroll";
```

Inside `<SmoothScroll>`, render it after `<Header />` and before `<SectionRail />`:

```tsx
            <Header />
            <MagneticScroll />
            <SectionRail />
```

- [ ] **Step 5: Run the targeted test**

Run:

```bash
npm run test:e2e:browser-smoke -- --project=chromium-desktop tests/playwright/atlas.spec.ts -g "magnetic flow settles"
```

Expected: PASS.

- [ ] **Step 6: Commit this task**

Only after verifying the worktree scope and avoiding unrelated files:

```bash
git add src/components/layout/MagneticScroll.tsx src/app/layout.tsx tests/playwright/atlas.spec.ts
git commit -m "feat: add magnetic flow section settling"
```

---

### Task 2: Simplify Section Rail Into Dots Only

**Files:**
- Modify: `src/components/layout/SectionRail.tsx`
- Test: `tests/playwright/atlas.spec.ts`
- Test: `tests/playwright/reduced-motion.spec.ts`

- [ ] **Step 1: Replace the old rail test with a failing dot-only test**

In `tests/playwright/atlas.spec.ts`, replace the test named `"section rail uses a quiet marker and navigates desktop sections"` with:

```ts
  test("section rail uses simple dots and navigates desktop sections", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    const rail = page.getByTestId("section-rail");
    await expect(rail).toBeVisible();
    await expect(rail.locator("[data-rail-track]")).toHaveCount(0);
    await expect(rail.locator("[data-rail-label]")).toHaveCount(0);

    const dots = rail.locator("[data-rail-dot]");
    await expect(dots).toHaveCount(8);

    const readDotMetrics = () =>
      dots.evaluateAll((markers) =>
        markers.map((marker) => {
          const rect = marker.getBoundingClientRect();
          const visualDot = marker.querySelector("[data-rail-dot-visual]");
          const visualRect = visualDot?.getBoundingClientRect();
          return {
            active: marker.getAttribute("data-active") === "true",
            height: Math.round(rect.height),
            width: Math.round(rect.width),
            visualHeight: Math.round(visualRect?.height ?? 0),
            visualWidth: Math.round(visualRect?.width ?? 0),
          };
        })
      );

    const initialMetrics = await readDotMetrics();
    expect(initialMetrics).toHaveLength(8);
    expect(initialMetrics.filter((dot) => dot.active)).toHaveLength(1);

    for (const dot of initialMetrics) {
      expect(dot.height).toBeGreaterThanOrEqual(32);
      expect(dot.width).toBeGreaterThanOrEqual(32);
      expect(dot.visualHeight).toBeLessThanOrEqual(12);
      expect(dot.visualWidth).toBeLessThanOrEqual(12);
    }

    const activeDot = initialMetrics.find((dot) => dot.active);
    const inactiveDots = initialMetrics.filter((dot) => !dot.active);
    expect(activeDot).toBeTruthy();
    expect(activeDot!.visualHeight).toBeGreaterThan(
      Math.max(...inactiveDots.map((dot) => dot.visualHeight))
    );

    await rail.getByLabel("Go to Selected work").click();
    await expect(page.locator("#projects")).toBeInViewport();
    await expect(rail.getByLabel("Go to Selected work")).toHaveAttribute(
      "aria-current",
      "location"
    );

    await rail.getByLabel("Go to Contact").click();
    await expect(page.locator("#contact")).toBeInViewport();
    await expect(rail.getByLabel("Go to Contact")).toHaveAttribute(
      "aria-current",
      "location"
    );

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      )
    ).toBe(true);
  });
```

- [ ] **Step 2: Update reduced-motion rail test expectations**

In `tests/playwright/reduced-motion.spec.ts`, inside `"rail navigation uses instant movement with reduced motion"`, replace the old `markerMotion` block with:

```ts
    const markerMotion = await page
      .getByTestId("section-rail")
      .locator("[data-rail-dot]")
      .evaluateAll((markers) =>
        markers.map((marker) => {
          const style = getComputedStyle(marker);
          return {
            property: style.transitionProperty,
            duration: style.transitionDuration,
          };
        })
      );

    for (const transition of markerMotion) {
      expect(transition.property).toBe("none");
      expect(transition.duration).toBe("0s");
    }
```

- [ ] **Step 3: Run the failing rail tests**

Run:

```bash
npm run test:e2e:browser-smoke -- --project=chromium-desktop tests/playwright/atlas.spec.ts -g "section rail uses simple dots"
npm run test:e2e:reduced-motion -- --project=chromium-desktop tests/playwright/reduced-motion.spec.ts -g "rail navigation uses instant movement"
```

Expected: FAIL because `SectionRail` still renders `data-rail-track`, visible labels, and old marker markup.

- [ ] **Step 4: Replace `SectionRail` markup**

Modify `src/components/layout/SectionRail.tsx`.

Remove `shortLabel` from `RailSection` and from `RAIL_SECTIONS`:

```tsx
interface RailSection {
  id: string;
  label: string;
}

const RAIL_SECTIONS: RailSection[] = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "Profile" },
  { id: "projects", label: "Selected work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Technical depth" },
  { id: "project-index", label: "Project index" },
  { id: "testimonials", label: "Recommendations" },
  { id: "contact", label: "Contact" },
];
```

Replace the returned `<nav>` body with:

```tsx
  return (
    <nav
      aria-label="Section navigation"
      className="pointer-events-none fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 xl:block"
      data-testid="section-rail"
    >
      <div className="pointer-events-auto flex flex-col items-center gap-1.5">
        {sections.map((section) => {
          const isActive = section.id === activeSection;

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={isActive ? "location" : undefined}
              aria-label={`Go to ${section.label}`}
              onClick={(event) => scrollToId(event, section.id)}
              className="group/rail-link relative flex h-9 w-9 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 motion-reduce:transition-none"
              data-active={isActive ? "true" : "false"}
              data-rail-dot
            >
              <span
                aria-hidden="true"
                className={`block rounded-full border transition-[height,width,background-color,border-color,opacity] duration-200 ease-out motion-reduce:transition-none motion-reduce:duration-0 ${
                  isActive
                    ? "h-3 w-3 border-zinc-100 bg-zinc-100 opacity-100"
                    : "h-2 w-2 border-zinc-600 bg-zinc-700/70 opacity-70 group-hover/rail-link:border-zinc-300 group-hover/rail-link:bg-zinc-300 group-hover/rail-link:opacity-95"
                }`}
                data-rail-dot-visual
              />
            </a>
          );
        })}
      </div>
    </nav>
  );
```

Do not add a track element, hover label, capsule, glow, line, icon route, or nested layers.

- [ ] **Step 5: Run rail tests**

Run:

```bash
npm run test:e2e:browser-smoke -- --project=chromium-desktop tests/playwright/atlas.spec.ts -g "section rail uses simple dots"
npm run test:e2e:reduced-motion -- --project=chromium-desktop tests/playwright/reduced-motion.spec.ts -g "rail navigation uses instant movement"
```

Expected: PASS.

- [ ] **Step 6: Commit this task**

```bash
git add src/components/layout/SectionRail.tsx tests/playwright/atlas.spec.ts tests/playwright/reduced-motion.spec.ts
git commit -m "style: simplify section rail to dots"
```

---

### Task 3: Remove Elevator Seams and Top Progress Bar

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Test: `tests/playwright/atlas.spec.ts`
- Test: `tests/playwright/reduced-motion.spec.ts`

- [ ] **Step 1: Replace elevator/progress tests with magnetic arrival tests**

In `tests/playwright/atlas.spec.ts`, replace the test named `"homepage sections expose atlas elevator transition hooks"` with:

```ts
  test("homepage sections expose restrained magnetic arrival hooks", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    const sections = page.locator("[data-atlas-section]");
    await expect(sections).toHaveCount(8);
    await expect(page.getByTestId("scroll-progress")).toHaveCount(0);

    const sectionContract = await sections.evaluateAll((nodes) =>
      nodes.map((node) => {
        const styles = getComputedStyle(node);
        const seam = getComputedStyle(node, "::before");
        const sweep = getComputedStyle(node, "::after");
        return {
          id: node.id,
          animationName: styles.animationName,
          boxShadow: styles.boxShadow,
          beforeContent: seam.content,
          afterContent: sweep.content,
        };
      })
    );

    for (const section of sectionContract) {
      expect(section.animationName).not.toContain("atlas-elevator");
      expect(section.boxShadow).not.toContain("rgba(0, 0, 0, 0.28)");
      expect(section.beforeContent).toBe("none");
      expect(section.afterContent).toBe("none");
    }

    await page.evaluate(() => {
      document.documentElement.setAttribute("data-magnetic-settling", "true");
      document
        .getElementById("projects")
        ?.setAttribute("data-magnetic-arriving", "true");
    });

    const arrivingStyle = await page.locator("#projects").evaluate((section) => {
      const styles = getComputedStyle(section);
      return {
        animationName: styles.animationName,
        transformOrigin: styles.transformOrigin,
      };
    });

    expect(arrivingStyle.animationName).toContain("magnetic-section-arrive");
    expect(arrivingStyle.transformOrigin).toContain("top");
  });
```

Delete the entire test named `"scroll progress uses transform instead of layout width"` because the top progress bar is no longer part of the design.

In `tests/playwright/reduced-motion.spec.ts`, replace the section animation assertion with:

```ts
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-magnetic-settling", "true");
      document
        .getElementById("projects")
        ?.setAttribute("data-magnetic-arriving", "true");
    });

    const sectionAnimations = await page
      .locator("[data-atlas-section]")
      .evaluateAll((sections) =>
        sections.map((section) => getComputedStyle(section).animationName)
      );
    for (const animationName of sectionAnimations) {
      expect(animationName).toBe("none");
    }
```

- [ ] **Step 2: Run failing CSS/layout tests**

Run:

```bash
npm run test:e2e:browser-smoke -- --project=chromium-desktop tests/playwright/atlas.spec.ts -g "magnetic arrival hooks"
npm run test:e2e:reduced-motion -- --project=chromium-desktop tests/playwright/reduced-motion.spec.ts -g "page remains usable"
```

Expected: FAIL because elevator CSS and top progress are still present.

- [ ] **Step 3: Remove `ScrollProgress` from layout**

Modify `src/app/layout.tsx`:

Delete this import:

```tsx
import { ScrollProgress } from "@/components/layout/ScrollProgress";
```

Delete this render line:

```tsx
            <ScrollProgress />
```

Do not delete `src/components/layout/ScrollProgress.tsx` in this task; leave file deletion for a cleanup pass if no references remain after all tests pass.

- [ ] **Step 4: Replace elevator CSS with restrained arrival CSS**

In `src/app/globals.css`, replace everything from `[data-atlas-section] {` through `@keyframes atlas-grid-drift` with:

```css
[data-atlas-section] {
  position: relative;
  isolation: isolate;
  transform-origin: center top;
}

@media (prefers-reduced-motion: no-preference) {
  html[data-magnetic-settling="true"]
    [data-atlas-section][data-magnetic-arriving="true"] {
    animation: magnetic-section-arrive 460ms cubic-bezier(0.22, 1, 0.36, 1)
      both;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-atlas-section],
  [data-atlas-section]::before,
  [data-atlas-section]::after {
    animation: none !important;
    transform: none !important;
  }
}

@keyframes magnetic-section-arrive {
  from {
    opacity: 0.96;
    transform: translate3d(0, 12px, 0) scale(0.998);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}
```

Do not add seam lines, radial sweeps, cyan glow variables, section box shadows, or scroll timeline animation names.

- [ ] **Step 5: Run CSS/layout tests**

Run:

```bash
npm run test:e2e:browser-smoke -- --project=chromium-desktop tests/playwright/atlas.spec.ts -g "magnetic arrival hooks"
npm run test:e2e:reduced-motion -- --project=chromium-desktop tests/playwright/reduced-motion.spec.ts -g "page remains usable"
```

Expected: PASS.

- [ ] **Step 6: Commit this task**

```bash
git add src/app/layout.tsx src/app/globals.css tests/playwright/atlas.spec.ts tests/playwright/reduced-motion.spec.ts
git commit -m "style: replace elevator seams with magnetic arrival"
```

---

### Task 4: Harden Reduced Motion, Mobile, and Non-Interference

**Files:**
- Modify: `tests/playwright/atlas.spec.ts`
- Modify: `tests/playwright/reduced-motion.spec.ts`
- Modify: `src/components/layout/MagneticScroll.tsx`

- [ ] **Step 1: Add failing tests for non-interference gates**

Add this test to `tests/playwright/atlas.spec.ts`:

```ts
  test("magnetic flow stays disabled for mobile and focused controls", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      const scrollCalls: Array<ScrollToOptions> = [];
      const originalScrollTo = window.scrollTo.bind(window);
      Object.defineProperty(window, "__atlasScrollToCalls", {
        value: scrollCalls,
        configurable: true,
      });
      window.scrollTo = function scrollToSpy(
        xOrOptions?: number | ScrollToOptions,
        y?: number
      ) {
        if (typeof xOrOptions === "object") {
          scrollCalls.push(xOrOptions);
          return originalScrollTo(xOrOptions);
        }
        scrollCalls.push({ top: y ?? 0, left: xOrOptions ?? 0 });
        return originalScrollTo(xOrOptions ?? 0, y ?? 0);
      };
    });

    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    await page.evaluate(() => {
      const projects = document.getElementById("projects");
      if (!projects) return;
      window.scrollTo({ top: projects.offsetTop - 96, behavior: "auto" });
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scrollend"));
    });
    await page.waitForTimeout(650);

    const mobileCalls = await page.evaluate(
      () =>
        (window as Window & { __atlasScrollToCalls?: ScrollToOptions[] })
          .__atlasScrollToCalls ?? []
    );
    expect(mobileCalls.some((call) => call.behavior === "smooth")).toBe(false);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await page.locator("#hero").waitFor({ state: "attached" });
    await page
      .locator("header")
      .getByRole("button", { name: "Resume" })
      .focus();

    await page.evaluate(() => {
      (window as Window & { __atlasScrollToCalls?: ScrollToOptions[] })
        .__atlasScrollToCalls?.splice(0);
      const projects = document.getElementById("projects");
      if (!projects) return;
      window.scrollTo({ top: projects.offsetTop - 96, behavior: "auto" });
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scrollend"));
    });
    await page.waitForTimeout(650);

    const focusedControlCalls = await page.evaluate(
      () =>
        (window as Window & { __atlasScrollToCalls?: ScrollToOptions[] })
          .__atlasScrollToCalls ?? []
    );
    expect(
      focusedControlCalls.some((call) => call.behavior === "smooth")
    ).toBe(false);
  });
```

Add this test to `tests/playwright/reduced-motion.spec.ts`:

```ts
  test("magnetic settling is disabled with reduced motion", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      const scrollCalls: Array<ScrollToOptions> = [];
      const originalScrollTo = window.scrollTo.bind(window);
      Object.defineProperty(window, "__atlasScrollToCalls", {
        value: scrollCalls,
        configurable: true,
      });
      window.scrollTo = function scrollToSpy(
        xOrOptions?: number | ScrollToOptions,
        y?: number
      ) {
        if (typeof xOrOptions === "object") {
          scrollCalls.push(xOrOptions);
          return originalScrollTo(xOrOptions);
        }
        scrollCalls.push({ top: y ?? 0, left: xOrOptions ?? 0 });
        return originalScrollTo(xOrOptions ?? 0, y ?? 0);
      };
    });

    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    await page.evaluate(() => {
      const projects = document.getElementById("projects");
      if (!projects) return;
      window.scrollTo({ top: projects.offsetTop - 96, behavior: "auto" });
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scrollend"));
    });
    await page.waitForTimeout(650);

    const calls = await page.evaluate(
      () =>
        (window as Window & { __atlasScrollToCalls?: ScrollToOptions[] })
          .__atlasScrollToCalls ?? []
    );
    expect(calls.some((call) => call.behavior === "smooth")).toBe(false);
    await expect(page.locator("#projects")).toBeInViewport();
  });
```

- [ ] **Step 2: Run the non-interference tests**

Run:

```bash
npm run test:e2e:browser-smoke -- --project=chromium-desktop tests/playwright/atlas.spec.ts -g "magnetic flow stays disabled"
npm run test:e2e:reduced-motion -- --project=chromium-desktop tests/playwright/reduced-motion.spec.ts -g "magnetic settling is disabled"
```

Expected: PASS if Task 1 implemented the gates correctly. If either fails, update `MagneticScroll.tsx` instead of weakening the tests.

- [ ] **Step 3: Tighten modal/body-lock skip if needed**

If the focused-control test passes but resume modal testing later shows magnetic settling while the resume viewer is open, update `isPageLocked()` in `src/components/layout/MagneticScroll.tsx` to also skip when any modal dialog is visible:

```tsx
function isPageLocked() {
  const bodyStyle = getComputedStyle(document.body);
  const htmlStyle = getComputedStyle(document.documentElement);
  const openDialog = document.querySelector(
    "[role='dialog'], [data-state='open'], [aria-modal='true']"
  );

  return (
    openDialog != null ||
    bodyStyle.position === "fixed" ||
    bodyStyle.overflow === "hidden" ||
    htmlStyle.overflow === "hidden"
  );
}
```

After changing it, rerun:

```bash
npm run test:e2e:browser-smoke -- --project=chromium-desktop tests/playwright/atlas.spec.ts -g "magnetic flow stays disabled"
```

Expected: PASS.

- [ ] **Step 4: Commit this task**

```bash
git add src/components/layout/MagneticScroll.tsx tests/playwright/atlas.spec.ts tests/playwright/reduced-motion.spec.ts
git commit -m "test: guard magnetic flow non-interference"
```

---

### Task 5: Full Browser Validation and Motion Score Gate

**Files:**
- Modify: `tests/playwright/record-walkthroughs.spec.ts`
- Test: `tests/playwright/record-walkthroughs.spec.ts`
- Test: existing Playwright suites

- [ ] **Step 1: Add a focused walkthrough assertion**

In `tests/playwright/record-walkthroughs.spec.ts`, add a desktop walkthrough checkpoint after the existing scroll recording flow:

```ts
    const motionContract = await page.evaluate(() => ({
      railDots: document.querySelectorAll("[data-rail-dot]").length,
      railTracks: document.querySelectorAll("[data-rail-track]").length,
      progressBars: document.querySelectorAll("[data-testid='scroll-progress']")
        .length,
      elevatorStyles: [...document.styleSheets].some((sheet) => {
        try {
          return [...sheet.cssRules].some((rule) =>
            rule.cssText.includes("atlas-elevator")
          );
        } catch {
          return false;
        }
      }),
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    }));

    expect(motionContract.railDots).toBe(8);
    expect(motionContract.railTracks).toBe(0);
    expect(motionContract.progressBars).toBe(0);
    expect(motionContract.elevatorStyles).toBe(false);
    expect(motionContract.overflow).toBe(false);
```

If `record-walkthroughs.spec.ts` structure makes this exact placement awkward, place the assertion in the same test after `page.goto("/")` and before the final screenshot/video cleanup.

- [ ] **Step 2: Run static checks**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
```

Expected: all pass. If `format:check` fails only because of plan/test formatting, run:

```bash
npm run format
```

Then rerun `npm run format:check`.

- [ ] **Step 3: Run targeted browser suites**

Run:

```bash
npm run test:e2e:browser-smoke
npm run test:e2e:reduced-motion -- --project=chromium-desktop
npm run test:e2e:videos -- --project=chromium-desktop
```

Expected:

- Browser smoke passes on Chromium desktop, Chromium mobile, and Firefox desktop.
- Reduced-motion suite passes.
- Video walkthrough suite passes and produces a current walkthrough artifact.

- [ ] **Step 4: Manual browser inspection**

Start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Inspect:

- Desktop normal scroll from Hero to Contact.
- Desktop dot click from Hero to Selected Work and Contact.
- Desktop scroll near but not at section boundary: page should not force a snap.
- Desktop scroll close to a section start: page should settle gently.
- Resume modal open: page should not magnetically settle behind the modal.
- 390px mobile: no section rail, no horizontal overflow, normal touch-like scroll.
- Reduced motion emulation: no settling, no arrival transforms.

Score the outcome:

```text
Natural flow: /10
Non-interference: /10
Rail restraint: /10
Recruiter readability: /10
Mobile safety: /10
```

Do not accept implementation unless every score is at least `9/10`.

- [ ] **Step 5: Commit validation updates**

```bash
git add tests/playwright/record-walkthroughs.spec.ts
git commit -m "test: validate magnetic flow walkthrough"
```

---

### Task 6: Cleanup and Documentation

**Files:**
- Modify or delete: `src/components/layout/ScrollProgress.tsx`
- Modify: `docs/superpowers/plans/2026-06-18-magnetic-flow-scroll-motion.md` only if execution notes are appended later
- Test: repository-wide checks

- [ ] **Step 1: Confirm `ScrollProgress` is unused**

Run:

```bash
rg -n "ScrollProgress|scroll-progress" src tests
```

Expected: no `src` references and no active tests expecting `scroll-progress`.

- [ ] **Step 2: Delete unused progress component if safe**

If Step 1 shows no `src` references, delete:

```text
src/components/layout/ScrollProgress.tsx
```

If any source reference remains, stop and remove that reference first.

- [ ] **Step 3: Run final checks**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:e2e:browser-smoke
npm run test:e2e:reduced-motion -- --project=chromium-desktop
```

Expected: all pass.

- [ ] **Step 4: Commit cleanup**

```bash
git add src/components/layout/ScrollProgress.tsx
git commit -m "chore: remove unused scroll progress chrome"
```

If the file was already removed in another task, skip this commit and record that the cleanup was already covered.

---

## Plan Self-Review

### Spec Coverage

- Simple dots only: Task 2.
- No old rail/capsule/glow/labels: Task 2 tests.
- No elevator seam sweeps: Task 3 CSS/test replacement.
- Remove top progress bar: Task 3 and Task 6.
- Natural scroll, no wheel hijack: Task 1 tests and controller implementation.
- Threshold-gated magnetic settling: Task 1.
- Non-interference with mobile, reduced motion, focused controls, and modals: Task 4.
- Browser and video validation: Task 5.
- Cleanup: Task 6.

### Critique Against Failure Modes

- **Risk: scroll feels hijacked.** Mitigated by no wheel listener, no `preventDefault`, desktop/fine-pointer only, threshold-gated settling, and focused-control/modal skips.
- **Risk: rail becomes decorative again.** Mitigated by deleting track/label/capsule/glow markup and testing for absence.
- **Risk: motion becomes a generic overlay.** Mitigated by removing top progress and elevator seams; only arrival animation remains.
- **Risk: reduced-motion regression.** Mitigated by direct Playwright reduced-motion tests.
- **Risk: mobile interference.** Mitigated by disabling magnetic flow and hiding rail on mobile.
- **Risk: tests preserve old design.** Mitigated by replacing the old rail/elevator/progress tests rather than adding new tests beside them.

### Placeholder Scan

No `TBD`, `TODO`, or unspecified implementation blocks are intentionally left in this plan. Every task names the files, test commands, expected outcomes, and code changes needed to implement the plan.

### Type Consistency

The plan consistently uses:

- `MagneticScroll` as the new component name.
- `[data-atlas-section]` as the existing section selector.
- `data-magnetic-settling` on `document.documentElement`.
- `data-magnetic-arriving` on the arriving section.
- `data-rail-dot` and `data-rail-dot-visual` for simplified rail tests.

