# Portfolio Visual Score Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Raise the portfolio from the current audit score of **8.0/10** to **9.0+/10** by fixing visual polish gaps, repairing video validation, and adding a repeatable Playwright score loop.

**Architecture:** Keep Technical Operations Atlas as the recruiter-first default and improve alternate themes so they are impressive without hurting readability. Add a Playwright quality-score suite that records real desktop/mobile walkthroughs, checks theme persistence, and forces the fix-test-fix loop before any phase is considered complete. Prefer targeted component edits over broad redesign.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, GSAP ScrollTrigger, Framer Motion, Playwright, existing static export server.

---

## Required Execution Skills

- `superpowers:executing-plans`: execute the tasks in order with checkbox updates.
- `superpowers:systematic-debugging`: use on any visual, browser, video, or test failure before changing code.
- `superpowers:verification-before-completion`: use before claiming a phase score improved or before committing.
- `playwright`: required for walkthrough videos, responsive screenshot inspection, interaction proof, and score gates.
- `build-web-apps:frontend-testing-debugging`: required for rendered UI, responsive layout, animation, disclosure, and console validation.
- `build-web-apps:react-best-practices`: use after component edits to verify React/Next patterns remain reasonable.

## Audit Evidence From 2026-05-28

Fresh automated validation:

- `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:artifacts` -> `116 passed`, `12 skipped`.
- `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e` -> `136 passed`, `10 skipped`.
- Manual true-viewport video audit generated under `/private/tmp/portfolio-visual-audit/manual`.
- Chrome extension route was blocked: Chrome is running, but the Codex Chrome Extension is missing from the selected Chrome profile (`Profile 1`). It is installed in `Default`, so Chrome-backed inspection cannot be used until the selected profile has the extension enabled.

Current score:

- Functional correctness: **9.4/10**. Routes, nav, CTAs, disclosures, images, a11y checks, and project counts pass.
- Recruiter-facing truth/default Atlas: **8.7/10**. Strong proof and content, still some dense sections and fixed-header screenshot overlap.
- Alternate-theme visual quality: **7.0/10**. Several themes look fun, but some are too generic, blurry, delayed, or hard to read.
- Validation quality: **7.4/10**. Existing video suite passes but records mobile walkthroughs at desktop viewport size.
- Overall current score: **8.0/10**.

Target score:

- Default Atlas: **9.2+**
- All public themes average: **8.8+**
- Validation quality: **9.3+**
- Overall: **9.0+**

Implementation status as of 2026-05-30: completed and verified. Final checks reached `test:e2e` = `136 passed, 10 skipped`, `test:e2e:score` = `12 passed` with all theme/viewport scores at `10`, and `test:e2e:artifacts` = `116 passed, 12 skipped`. Walkthrough videos were regenerated with true responsive dimensions: desktop `800x500`, mobile `392x726`.

## Findings To Fix

1. **Video audit bug:** `tests/playwright/record-walkthroughs.spec.ts` globally forces `viewport: { width: 1440, height: 900 }`, so `chromium-mobile` walkthrough videos are mislabeled desktop recordings.
2. **Audit report blind spot:** `output/playwright/full-audit/audit-report.json` reports `persistence_works: false`, but `tests/playwright/full-audit.spec.ts` never actually validates persistence.
3. **Liquid Glass rhythm:** the hero and contact surfaces lean on a familiar purple/pink gradient; the projects section has a long sticky-scroll/blank-space feel and does not expose project proof as efficiently as Atlas.
4. **Retro Terminal first viewport:** mobile first paint can show command prompts and cursors before meaningful identity text is visible; the recruiter signal is delayed by typewriter timing.
5. **Synthwave readability:** mobile hero/contact can show heavy glitch masks and oversized uppercase contact text, making email/contact details feel clipped or noisy.
6. **Cosmic/Bioluminescent readability:** decorative particles and reveal effects can compete with hero/contact text during scroll video captures.
7. **Section scroll polish:** fixed header and animated reveals can make section screenshots look clipped or mid-transition, even when tests pass.

---

### Task 1: Repair Playwright Video Walkthrough Validation

**Files:**
- Modify: `tests/playwright/record-walkthroughs.spec.ts`
- Modify: `package.json`

- [x] **Step 1: Remove the global viewport override**

In `tests/playwright/record-walkthroughs.spec.ts`, replace:

```ts
test.use({
  video: { mode: "on", size: { width: 1440, height: 900 } },
  viewport: { width: 1440, height: 900 },
});
```

With:

```ts
test.use({
  video: "on",
});
```

- [x] **Step 2: Add real wheel scrolling to the walkthrough**

Replace the scroll loop:

```ts
for (let i = 0; i <= steps; i++) {
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    i * vh * 0.7
  );
  await page.waitForTimeout(400);
}
```

With:

```ts
for (let i = 0; i <= steps; i++) {
  await page.mouse.wheel(0, vh * 0.7);
  await page.waitForTimeout(350);
}
```

- [x] **Step 3: Add focused scripts for videos and scoring**

In `package.json`, add:

```json
"test:e2e:videos": "playwright test tests/playwright/record-walkthroughs.spec.ts",
"test:e2e:score": "playwright test tests/playwright/portfolio-quality-score.spec.ts"
```

- [x] **Step 4: Verify the video dimensions**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:videos
```

Expected:

- `12 passed` or `12 passed` plus known project skips only if Playwright project config changes.
- Fresh videos under `output/playwright/test-results/**/video.webm`.

Then run:

```bash
find output/playwright/test-results -path '*record-walkthroughs*' -name 'video.webm' -print0 | while IFS= read -r -d '' f; do dirname "$f"; /opt/homebrew/bin/ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$f"; done
```

Expected:

- Desktop videos keep a desktop landscape aspect ratio.
- Mobile videos keep a mobile portrait aspect ratio.
- No `chromium-mobile` walkthrough reports `1440,900`.

- [x] **Step 5: Commit**

```bash
git add package.json tests/playwright/record-walkthroughs.spec.ts
git commit -m "test: record true responsive walkthrough videos"
```

---

### Task 2: Add A Portfolio Quality Score Gate

**Files:**
- Create: `tests/playwright/portfolio-quality-score.spec.ts`
- Modify: `tests/playwright/full-audit.spec.ts`

- [x] **Step 1: Create the score spec**

Create `tests/playwright/portfolio-quality-score.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import {
  THEMES,
  artifactPath,
  switchThemeAndWait,
} from "./portfolio-fixtures";

type ThemeScore = {
  theme: string;
  viewport: string;
  score: number;
  deductions: string[];
};

function deduct(
  deductions: string[],
  condition: boolean,
  message: string,
  amount: number
) {
  if (condition) deductions.push(`${amount.toFixed(1)} ${message}`);
}

test.describe("Portfolio quality score", () => {
  test.setTimeout(120000);

  for (const theme of THEMES) {
    test(`${theme.name}: rendered quality score`, async ({ page }, testInfo) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await switchThemeAndWait(page, theme);
      await page.waitForTimeout(900);

      const viewport = page.viewportSize();
      const viewportName =
        testInfo.project.name.includes("mobile") || (viewport?.width ?? 0) < 768
          ? "mobile"
          : "desktop";

      const result = await page.evaluate(() => {
        const text = document.body.innerText;
        const sections = Array.from(document.querySelectorAll("section")).map(
          (section) => {
            const rect = section.getBoundingClientRect();
            return {
              id: section.id,
              height: Math.round(rect.height),
            };
          }
        );
        const fixedHeader = document.querySelector("header");
        const headerRect = fixedHeader?.getBoundingClientRect();
        return {
          title: document.title,
          dataTheme: document.documentElement.getAttribute("data-theme"),
          textLength: text.length,
          hasGeneratedPlaceholders:
            /lorem ipsum|TODO|PLACEHOLDER|CUNY Brooklyn/i.test(text),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          scrollHeight: document.documentElement.scrollHeight,
          clientHeight: document.documentElement.clientHeight,
          sections,
          headerHeight: headerRect ? Math.round(headerRect.height) : 0,
          visibleImages: Array.from(document.images).filter(
            (image) => image.offsetWidth > 0 && image.offsetHeight > 0
          ).length,
          brokenImages: Array.from(document.images).filter(
            (image) =>
              image.offsetWidth > 0 &&
              image.offsetHeight > 0 &&
              image.naturalWidth === 0
          ).length,
        };
      });

      const deductions: string[] = [];
      deduct(deductions, result.dataTheme !== theme.name, "theme did not apply", 2);
      deduct(deductions, result.textLength < 2500, "page has too little rendered text", 1);
      deduct(
        deductions,
        result.scrollWidth > result.clientWidth,
        "horizontal overflow detected",
        2
      );
      deduct(deductions, result.brokenImages > 0, "broken visible image", 2);
      deduct(
        deductions,
        result.hasGeneratedPlaceholders,
        "placeholder/generated content detected",
        2
      );

      const longSections = result.sections.filter(
        (section) =>
          section.height > result.clientHeight * (viewportName === "mobile" ? 7 : 5)
      );
      deduct(
        deductions,
        longSections.length > 0,
        `overlong sections: ${longSections.map((s) => s.id || "unnamed").join(", ")}`,
        0.8
      );

      const score = Math.max(
        0,
        10 -
          deductions.reduce((sum, deduction) => {
            const value = Number(deduction.split(" ")[0]);
            return sum + (Number.isFinite(value) ? value : 0);
          }, 0)
      );

      const screenshot = await artifactPath(
        "quality-score",
        `${theme.name}-${viewportName}.png`
      );
      await page.screenshot({ path: screenshot, fullPage: false });

      const scoreResult: ThemeScore = {
        theme: theme.name,
        viewport: viewportName,
        score,
        deductions,
      };

      console.log(JSON.stringify(scoreResult, null, 2));
      expect(score, `${theme.name} ${viewportName} score`).toBeGreaterThanOrEqual(
        theme.name === "technical-operations-atlas" ? 9.2 : 8.5
      );
    });
  }
});
```

- [x] **Step 2: Fix persistence reporting in `full-audit.spec.ts`**

Inside the `"Switcher Test"` test, after the theme-switch loop, add:

```ts
const persistenceTheme = THEMES[THEMES.length - 1];
await switchThemeAndWait(page, persistenceTheme);
await page.reload({ waitUntil: "domcontentloaded" });
await expect(page.locator("html")).toHaveAttribute(
  "data-theme",
  persistenceTheme.name,
  { timeout: 10000 }
);
auditResult.crossTheme.persistence_works = true;
```

- [x] **Step 3: Run the score spec and expect failures**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:score
```

Expected:

- The score report must list per-theme scores and deductions.
- If every theme passes before polish, inspect the generated `output/playwright/quality-score/*.png` screenshots and tighten the score thresholds before proceeding. The gate must catch at least one current visual debt item, such as overlong Liquid Glass scroll rhythm or blurred/revealed alternate-theme contact states.

- [x] **Step 4: Commit**

```bash
git add tests/playwright/portfolio-quality-score.spec.ts tests/playwright/full-audit.spec.ts package.json
git commit -m "test: add portfolio visual quality score gate"
```

---

### Task 3: Fix Liquid Glass Scroll Rhythm And Recruiter Signal

**Files:**
- Modify: `src/components/effects/HorizontalScrollWrapper.tsx`
- Modify: `src/components/sections/Projects.tsx`
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/components/sections/Contact.tsx`

- [x] **Step 1: Cap horizontal-scroll height**

In `src/components/effects/HorizontalScrollWrapper.tsx`, replace:

```ts
const scrollHeight =
  maxTranslate < 0 ? `calc(100vh + ${Math.abs(maxTranslate)}px)` : "100vh";
```

With:

```ts
const scrollHeight =
  maxTranslate < 0
    ? `calc(100vh + ${Math.min(Math.abs(maxTranslate), 1400)}px)`
    : "100vh";
```

- [x] **Step 2: Reduce Liquid Glass project card width**

In the Liquid Glass project card wrapper in `src/components/sections/Projects.tsx`, replace:

```tsx
className="w-[90vw] flex-shrink-0 md:w-[800px] lg:w-[1000px]"
```

With:

```tsx
className="w-[88vw] flex-shrink-0 md:w-[720px] lg:w-[860px]"
```

- [x] **Step 3: Replace generic Liquid Glass hero copy styling with portfolio proof**

In the Liquid Glass branch of `src/components/sections/Hero.tsx`, add a proof row below the tagline:

```tsx
<TextReveal className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-3 delay-300 md:grid-cols-4">
  {[
    ["1.9M+", "Tableau rows"],
    ["738", "Automated tests"],
    ["71", "iOS tests"],
    ["19/20", "Policy validation"],
  ].map(([value, label]) => (
    <div
      key={label}
      className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-xl"
    >
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs tracking-wide text-white/55 uppercase">
        {label}
      </div>
    </div>
  ))}
</TextReveal>
```

- [x] **Step 4: Make Liquid Glass contact readable on mobile**

In the Liquid Glass branch of `src/components/sections/Contact.tsx`, change the contact card class from:

```tsx
<GlassCard className="flex flex-col items-center justify-between gap-8 p-8 md:flex-row md:p-12">
```

To:

```tsx
<GlassCard className="flex flex-col items-center justify-between gap-8 p-6 text-left md:flex-row md:p-12">
```

And change the email link class from:

```tsx
className="text-xl transition-colors hover:text-white"
```

To:

```tsx
className="break-all text-lg transition-colors hover:text-white md:text-xl"
```

- [x] **Step 5: Run focused score and screenshots**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:score -- --grep "liquid-glass"
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm exec -- playwright test tests/playwright/critique-screenshots.spec.ts --project=chromium-desktop --grep "liquid-glass"
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm exec -- playwright test tests/playwright/critique-screenshots.spec.ts --project=chromium-mobile --grep "liquid-glass"
```

Expected:

- Liquid Glass score >= `8.5`.
- Projects screenshot no longer has a long dead-scroll feel.
- Mobile contact email is readable.

- [x] **Step 6: Commit**

```bash
git add src/components/effects/HorizontalScrollWrapper.tsx src/components/sections/Projects.tsx src/components/sections/Hero.tsx src/components/sections/Contact.tsx
git commit -m "fix: tighten liquid glass portfolio flow"
```

---

### Task 4: Make Reveal Animations Inspection-Safe

**Files:**
- Modify: `src/components/effects/TextReveal.tsx`
- Modify: `src/components/effects/WarpTransition.tsx`
- Modify: `src/components/effects/GlitchBurst.tsx`
- Modify: `src/components/effects/FloatingEntry.tsx`

- [x] **Step 1: Stop reversing reveal animations during audit scroll**

In each file, replace:

```ts
toggleActions: "play none none reverse",
```

With:

```ts
toggleActions: "play none none none",
```

- [x] **Step 2: Shorten heavy blur effects**

In `TextReveal.tsx`, change initial filter from:

```ts
filter: "blur(10px)",
```

To:

```ts
filter: "blur(4px)",
```

In `WarpTransition.tsx`, change initial filter from:

```ts
filter: "blur(20px)",
```

To:

```ts
filter: "blur(6px)",
```

- [x] **Step 3: Run focused visual score**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:score
```

Expected:

- No theme loses score.
- Contact screenshots no longer capture unreadable blur during normal scroll.

- [x] **Step 4: Commit**

```bash
git add src/components/effects/TextReveal.tsx src/components/effects/WarpTransition.tsx src/components/effects/GlitchBurst.tsx src/components/effects/FloatingEntry.tsx
git commit -m "fix: keep reveal animations readable after scroll"
```

---

### Task 5: Fix Retro Terminal First Viewport

**Files:**
- Modify: `src/components/effects/TypewriterText.tsx`
- Modify: `src/components/sections/Hero.tsx`

- [x] **Step 1: Add an immediate mode to TypewriterText**

In `src/components/effects/TypewriterText.tsx`, update props:

```ts
interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
  immediate?: boolean;
}
```

Update the function signature:

```ts
export function TypewriterText({
  text,
  className = "",
  delay = 0,
  immediate = false,
}: TypewriterTextProps) {
```

Add this before the visibility trigger effect:

```ts
useEffect(() => {
  if (immediate) {
    setDisplayedText(text);
    setIsVisible(true);
  }
}, [immediate, text]);
```

And change the existing interval effect guard:

```ts
if (!isVisible || immediate) return;
```

- [x] **Step 2: Make Retro hero identity immediately visible**

In `src/components/sections/Hero.tsx`, set the first Retro typewriter to immediate:

```tsx
<TypewriterText
  text={`> HELLO, I'M ${personalInfo.name.toUpperCase()}`}
  delay={0}
  immediate
/>
```

Set the title delay to `400` and status delay to `900`.

- [x] **Step 3: Verify mobile first viewport**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:score -- --grep "retro-terminal"
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm exec -- playwright test tests/playwright/critique-screenshots.spec.ts --project=chromium-mobile --grep "retro-terminal"
```

Expected:

- The first mobile viewport shows Ayush’s name immediately.
- Retro score >= `8.5`.

- [x] **Step 4: Commit**

```bash
git add src/components/effects/TypewriterText.tsx src/components/sections/Hero.tsx
git commit -m "fix: show retro terminal identity immediately"
```

---

### Task 6: Tighten Synthwave Mobile Readability

**Files:**
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/components/sections/Contact.tsx`

- [x] **Step 1: Reduce mobile hero mask/noise**

In the Synthwave branch of `src/components/sections/Hero.tsx`, change the `h1` class from:

```tsx
className="max-w-full bg-gradient-to-b from-[#00ffff] via-[#ff00ff] to-[#ffff00] bg-clip-text text-5xl font-bold tracking-tighter break-words text-transparent uppercase sm:text-6xl md:text-8xl"
```

To:

```tsx
className="max-w-full bg-gradient-to-b from-[#00ffff] via-[#ff7af5] to-[#ffff00] bg-clip-text text-5xl font-bold tracking-normal break-words text-transparent uppercase sm:text-6xl md:text-8xl md:tracking-tighter"
```

- [x] **Step 2: Make Synthwave contact email wrap**

In the Synthwave branch of `src/components/sections/Contact.tsx`, change the contact card layout from:

```tsx
<NeonBorder
  color="cyan"
  className="flex flex-col items-center justify-between gap-8 bg-black/60 p-8 md:flex-row md:p-12"
>
```

To:

```tsx
<NeonBorder
  color="cyan"
  className="flex flex-col items-center justify-between gap-8 bg-black/70 p-6 md:flex-row md:p-12"
>
```

Change the email link class from:

```tsx
className="text-xl tracking-wider uppercase transition-colors hover:text-[#00ffff]"
```

To:

```tsx
className="max-w-[16rem] break-all text-base tracking-wide uppercase transition-colors hover:text-[#00ffff] sm:max-w-none md:text-xl md:tracking-wider"
```

- [x] **Step 3: Run focused mobile score**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:score -- --grep "synthwave-sunset"
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm exec -- playwright test tests/playwright/critique-screenshots.spec.ts --project=chromium-mobile --grep "synthwave-sunset"
```

Expected:

- Synthwave score >= `8.5`.
- Mobile contact email is fully legible and not visually clipped.

- [x] **Step 4: Commit**

```bash
git add src/components/sections/Hero.tsx src/components/sections/Contact.tsx
git commit -m "fix: improve synthwave mobile readability"
```

---

### Task 7: Reduce Decorative Interference In Cosmic And Bioluminescent

**Files:**
- Modify: `src/components/backgrounds/CosmicVoyageBg.tsx`
- Modify: `src/components/backgrounds/BioluminescentBg.tsx`
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/components/sections/Contact.tsx`

- [x] **Step 1: Lower particle opacity near text**

In `CosmicVoyageBg.tsx`, change the star generation opacity from:

```ts
opacity: Math.random(),
```

To:

```ts
opacity: Math.random() * 0.35 + 0.1,
```

And change the star fill style from:

```ts
ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * (0.5 + Math.sin(time * 5 + star.x) * 0.5)})`;
```

To:

```ts
ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * (0.45 + Math.sin(time * 5 + star.x) * 0.25)})`;
```

In `BioluminescentBg.tsx`, change particles and bubbles from:

```ts
const particles = Array.from({ length: 150 }).map(() => ({
```

```ts
opacity: Math.random() * 0.5 + 0.1,
```

```ts
const bubbles = Array.from({ length: 30 }).map(() => ({
```

```ts
ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
```

```ts
ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
```

To:

```ts
const particles = Array.from({ length: 100 }).map(() => ({
```

```ts
opacity: Math.random() * 0.35 + 0.08,
```

```ts
const bubbles = Array.from({ length: 18 }).map(() => ({
```

```ts
ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
```

```ts
ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
```

- [x] **Step 2: Strengthen text surfaces**

In Cosmic and Bioluminescent `Hero.tsx` branches, add a subtle text backing on mobile:

Append `rounded-2xl bg-black/15 px-3 py-2` to the existing mobile-visible hero title wrapper or title `className`, keeping the existing font size, theme color, and responsive typography classes intact.

Use the existing theme colors and do not add a card around the whole hero.

- [x] **Step 3: Make contact details readable**

In Cosmic and Bioluminescent `Contact.tsx` branches, add `break-all` to email links and increase mobile contact card opacity by one step:

```tsx
className="break-all text-lg tracking-wider transition-colors hover:text-white"
```

- [x] **Step 4: Run focused score**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:score -- --grep "cosmic-voyage|bioluminescent-deep"
```

Expected:

- Cosmic and Bioluminescent scores >= `8.5`.
- Hero/contact text remains readable in mobile screenshots.

- [x] **Step 5: Commit**

```bash
git add src/components/backgrounds/CosmicVoyageBg.tsx src/components/backgrounds/BioluminescentBg.tsx src/components/sections/Hero.tsx src/components/sections/Contact.tsx
git commit -m "fix: reduce alternate theme text interference"
```

---

### Task 8: Run The Score-Fix-Score Loop Until Target

**Files:**
- Modify only files surfaced by failing focused score/tests.

- [x] **Step 1: Run score and artifact pass**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:score
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:artifacts
```

Expected:

- Score spec passes.
- Artifact suite reports `116 passed`, `12 skipped` unless intentional test counts changed.

- [x] **Step 2: Inspect screenshots and videos**

Inspect:

```bash
output/playwright/critique-screenshots/*-hero-mobile.png
output/playwright/critique-screenshots/*-projects-desktop.png
output/playwright/critique-screenshots/*-projects-mobile.png
output/playwright/test-results/**/video.webm
```

Use `ffmpeg` contact sheets:

```bash
mkdir -p /private/tmp/portfolio-visual-audit/contact-sheets
find output/playwright/test-results -path '*record-walkthroughs*' -name 'video.webm' -print0 | while IFS= read -r -d '' f; do b=$(basename "$(dirname "$f")"); /opt/homebrew/bin/ffmpeg -y -loglevel error -i "$f" -vf "fps=1/2,scale=360:-1,tile=6x3" -frames:v 1 "/private/tmp/portfolio-visual-audit/contact-sheets/${b}.jpg"; done
```

- [x] **Step 3: If any score is below target, fix and repeat**

If any score is below target:

1. Identify the exact section/theme/viewport.
2. Open the owning component file.
3. Make the smallest visual fix.
4. Run the focused score command for that theme.
5. Re-capture the focused screenshot.
6. Repeat until target passes.
7. Commit the focused fix.

- [x] **Step 4: Final full verification**

Run:

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run typecheck
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run lint
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run format:check
NEXT_PUBLIC_BASE_PATH= /opt/homebrew/bin/node node_modules/next/dist/bin/next build --webpack
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:artifacts
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm run test:e2e:score
```

Expected:

- All commands exit `0`.
- Full E2E remains green.
- Artifact videos show true mobile/desktop viewports.
- Final overall score is **9.0+**.

- [x] **Step 5: Commit verification updates**

```bash
git status --short
git log --oneline -n 8
```

If generated artifact files are ignored and only source/test files changed, commit the final validation polish:

```bash
git add package.json tests/playwright src/components
git commit -m "test: lock portfolio visual quality score"
```

---

## Execution Notes

- In Codex, use Homebrew Node/npm:

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/npm <command>
```

- For explicit Next builds, use Homebrew Node:

```bash
NEXT_PUBLIC_BASE_PATH= /opt/homebrew/bin/node node_modules/next/dist/bin/next build --webpack
```

- Local Playwright server startup may need sandbox escalation because binding `127.0.0.1:3000` can fail with `listen EPERM`.
- Chrome extension validation is blocked until the Codex Chrome Extension is installed/enabled in Chrome’s selected profile (`Profile 1`), or Chrome’s selected profile is changed to the `Default` profile where the extension exists.
