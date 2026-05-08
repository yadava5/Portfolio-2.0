# Unique Portfolio Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Final audit status:** Do not execute this original four-theme plan unchanged. First apply the revision and final-audit gates in `docs/superpowers/plans/2026-05-08-unique-portfolio-themes-plan-critique.md`; that addendum supersedes this plan's "four public themes" direction with one flagship **Technical Operations Atlas** identity plus contextual project/case-study treatments.

**Goal:** Replace the generic visual-theme showcase with a content-specific personal portfolio theme system that makes Ayush's data engineering, ML, native app, accessibility, and automation work feel distinct and credible.

**Architecture:** Keep the existing Next.js app and theme persistence, but add a richer theme-pack contract that can drive palette, material, background, cursor, motion, and section presentation from one registry. Build four new public themes as one cohesive portfolio experience, keep legacy themes available during QA, and only remove or hide them after the new set passes visual, accessibility, and Playwright validation.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, next-themes, Framer Motion, GSAP/Lenis only where already used, canvas backgrounds with reduced-motion fallbacks, Playwright, axe-core.

---

## Research Synthesis

### External Sources Used

- Chrome scroll-driven animations: https://developer.chrome.com/docs/css-ui/scroll-driven-animations
- Motion `useScroll`: https://motion.dev/docs/react-use-scroll
- web.dev high-performance animations: https://web.dev/articles/animations-guide
- web.dev reduced-motion guidance: https://web.dev/articles/prefers-reduced-motion
- MDN WebGL best practices: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- three.js responsive canvas notes: https://threejs.org/manual/en/responsive.html
- Codrops glitch/brutalist portfolio case study: https://tympanus.net/codrops/2025/10/15/from-blank-canvas-to-mayhem-eloy-benoffis-brutalist-glitchy-portfolio-built-with-webflow-and-gsap/
- Magic UI portfolio repo: https://github.com/magicuidesign/portfolio
- Brittany Chiang v4 repo: https://github.com/bchiang7/v4
- realstoman Next.js portfolio repo: https://github.com/realstoman/nextjs-tailwindcss-portfolio

### Local Sources Used

- Current theme registry: `src/config/themes.ts`
- Current orchestrator: `src/components/themes/ThemeOrchestrator.tsx`
- Current content sources: `src/lib/data/personal.ts`, `src/lib/data/projects.ts`, `src/lib/data/experience.ts`, `src/lib/data/skills.ts`, `src/lib/data/testimonials.ts`
- Current QA history: `docs/superpowers/plans/2026-05-08-portfolio-qa-fixes.md`
- Previous portfolio to avoid: `/Users/ayush/Documents/Projects/Portfolio/portfolio/README.md`
- Previous portfolio theme critique to avoid: `/Users/ayush/Documents/Projects/Portfolio/portfolio/test-screenshots/critique-desktop/README.md`
- Previous holographic research to avoid: `/Users/ayush/Documents/Projects/Portfolio/HOLOGRAPHIC_BENTO_DASHBOARD_RESEARCH.md`
- GitHub profile README visual language to avoid: `/Users/ayush/Documents/Projects/Ayush Yadav (Readme)/README.md`

## Direction Decision

Ship four new public themes, with **Ops Control Room** as the default:

| Theme id | Label | Core idea | Palette guardrail | Content emphasis |
| --- | --- | --- | --- | --- |
| `ops-control` | Ops Control Room | Data operations command surface: pipelines, run states, trusted datasets, service telemetry | Carbon, zinc, warm amber, signal green, white text. No purple, cyan-pink, rainbow glow, or frosted bento grid. | Miami IT, 1M+ rows, ETL, Tableau, Snowflake, Slack bot, automation |
| `evidence-ledger` | Evidence Ledger | Technical dossier: proof records, metrics, test counts, decision notes, case-study evidence | Ink, cool paper white, stamped red, steel blue as a minor mark. No burgundy editorial clone, no manila-folder beige theme. | Quantified project outcomes: 738 tests, 97%+ accuracy, 5x SIMD, 500+ emails/month |
| `native-intelligence` | Native Intelligence | Local-first native app lab: macOS/iOS panels, privacy marks, ML classifiers, system services | Graphite, titanium, white, safety amber, small green status marks. No Liquid Glass as dominant material. | JobTracker, Visual Assist, SwiftUI, Core ML, Vision, LiDAR, local processing |
| `field-systems` | Field Systems | Accessible field instrument: LiDAR paths, route overlays, readable controls, high contrast | Asphalt, white, safety yellow, route blue, green confirmation. No medical cliche, no soft wellness palette. | Visual Assist, accessibility, navigation, privacy, human-impact software |

Reserve but do not ship in this pass:

- `automation-workbench`: strong idea, but overlaps with Ops Control Room.
- `performance-lab`: strong idea, but better as a case-study treatment inside Evidence Ledger unless Ayush asks for a fifth theme.

## Hard Guardrails

- Do not recreate the old holographic bento dashboard.
- Do not use purple/cyan/pink holographic gradients as a primary visual language.
- Do not use dark luxe gold-on-black, paper-ink burgundy, editorial red, noir-cinema red, or neon-cyber cyan/magenta as primary theme identities.
- Do not make the hero a centered giant name plus animated subtitle.
- Do not use badge/devicon grids as the main proof surface.
- Do not add Three.js or `@react-three/*` unless a concept is approved that genuinely needs WebGL and the user approves the dependency.
- Do not make themes color swaps only. Each theme must define material, section rhythm, motion, background behavior, focus states, and project evidence treatment.
- Respect `prefers-reduced-motion` and coarse pointers. Custom cursors and animated backgrounds must disable or simplify under those conditions.

## File Structure

### Modify

- `src/config/themes.ts` - Extend `ThemeId` and `ThemeConfig` with rich theme metadata, new public theme ids, and legacy visibility flags.
- `src/components/themes/ThemeOrchestrator.tsx` - Route new themes through the new theme-pack renderer while leaving legacy themes stable during QA.
- `src/components/layout/ThemeSwitcher.tsx` - Show the new public themes first, expose legacy themes only through a compact secondary group during validation.
- `src/app/globals.css` - Add CSS variables for the four new themes and shared texture utilities.
- `src/hooks/useThemeConfig.ts` - Keep returning the richer theme config without breaking existing consumers.
- `tests/playwright/themes.spec.ts` - Replace stale theme expectations with the current public theme ids and required interaction checks.
- `tests/playwright/comprehensive-qa.spec.ts` - Replace old theme labels/selectors and add scroll, transition, reduced-motion, and mobile checks for the new public set.

### Create

- `src/config/themeExperiences.ts` - Theme-pack registry for palette, material, motion, background, cursor, section emphasis, and accessibility budget.
- `src/components/theme-experience/ThemeExperiencePage.tsx` - Shared seven-section renderer for the four new themes.
- `src/components/theme-experience/ThemeSection.tsx` - Section wrapper with theme-aware spacing, material, and scroll reveal behavior.
- `src/components/theme-experience/MetricRail.tsx` - Reusable metric rail for evidence-heavy hero, experience, and projects.
- `src/components/theme-experience/ProjectEvidenceCard.tsx` - Project record component that changes surface treatment by theme.
- `src/components/theme-experience/TimelineTrack.tsx` - Experience and education timeline track with keyboard-readable markup.
- `src/components/theme-experience/SkillsMatrix.tsx` - Skills grouped by capability, not icon-badge grids.
- `src/components/theme-experience/ContactConsole.tsx` - Contact section with theme-specific command/action layout.
- `src/components/backgrounds/OpsControlBg.tsx` - Low-cost canvas pipeline/topology background.
- `src/components/backgrounds/EvidenceLedgerBg.tsx` - Static-first linework and stamped-record background.
- `src/components/backgrounds/NativeIntelligenceBg.tsx` - Native panel grid and local-processing signal background.
- `src/components/backgrounds/FieldSystemsBg.tsx` - LiDAR route and field-grid background.
- `src/components/cursors/InstrumentCursor.tsx` - One accessible cursor component with theme variants and coarse-pointer disablement.
- `tests/playwright/theme-visual-audit.spec.ts` - Browser audit for each new theme across desktop/mobile, scroll positions, focus, and reduced motion.
- `docs/design/unique-themes/README.md` - Concept approval ledger with generated concept paths, accepted palette, and implementation notes.

---

## Task 1: Concept Approval Gate

**Files:**
- Create: `docs/design/unique-themes/README.md`
- No app code changes in this task.

- [ ] **Step 1: Generate concept images before coding**

Use the frontend-app-builder workflow to generate one fresh, readable concept image per theme for the first viewport plus one combined downstream-section sheet per theme. The prompt must include this exact constraint block:

```text
Create a personal portfolio theme for Ayush Yadav. This is a code-native Next.js portfolio, not a static poster. Do not use purple/cyan/pink holographic gradients, generic glassmorphism, bento dashboard cards, dark luxe gold, burgundy editorial, noir red, neon cyberpunk, centered giant-name hero, devicon badge grids, or hero eyebrow pills. Use real portfolio content: Miami University data integration work, 1M+ rows, Python/SQL pipelines, Tableau, Snowflake, JobTracker, AutoML, Visual Assist, Fast MNIST, Taskflow Calendar, 738 tests, 97%+ MNIST accuracy, 5x SIMD speedup, 500+ emails/month. The design must include Hero, About, Experience, Projects, Skills, Testimonials, and Contact. Keep text readable, containers practical for HTML/CSS, and motion implied through layout/state marks rather than decorative gradients.
```

Generate concepts for these four theme briefs:

```text
1. Ops Control Room: carbon/zinc operations command surface, warm amber and signal green accents, pipeline topology, run states, telemetry, trusted datasets.
2. Evidence Ledger: technical dossier, proof records, test counts, stamped metrics, cool paper white and ink, restrained red marks, no beige folder theme.
3. Native Intelligence: local-first native app lab, graphite/titanium panels, privacy marks, ML classifier traces, macOS/iOS system cues without dominant glass.
4. Field Systems: accessible field instrument, high contrast, LiDAR path overlays, route blue, safety yellow, large readable controls, privacy and navigation emphasis.
```

- [ ] **Step 2: Save the concept ledger**

Create `docs/design/unique-themes/README.md` with this exact structure after images are generated:

```markdown
# Unique Portfolio Theme Concepts

## Approval Status

| Theme id | Concept path | Status | Notes |
| --- | --- | --- | --- |
| `ops-control` | `/absolute/path/to/ops-control.png` | pending-review | First viewport plus downstream section sheet |
| `evidence-ledger` | `/absolute/path/to/evidence-ledger.png` | pending-review | First viewport plus downstream section sheet |
| `native-intelligence` | `/absolute/path/to/native-intelligence.png` | pending-review | First viewport plus downstream section sheet |
| `field-systems` | `/absolute/path/to/field-systems.png` | pending-review | First viewport plus downstream section sheet |

## Locked Guardrails

- No purple/cyan/pink holographic gradient language.
- No holographic bento dashboard recreation.
- No centered giant-name hero plus animated subtitle.
- No devicon badge grid as the primary skills proof.
- No dominant frosted glass material.
- Custom cursors and animated backgrounds must disable for reduced motion and coarse pointers.
```

- [ ] **Step 3: Stop for user approval**

Do not touch app code until Ayush approves either all four concepts or a smaller selected set. Record approved concepts by changing `pending-review` to `approved` in `docs/design/unique-themes/README.md`.

Expected result: one concept ledger exists, no source files changed.

---

## Task 2: Rich Theme Registry

**Files:**
- Modify: `src/config/themes.ts`
- Create: `src/config/themeExperiences.ts`
- Verify: `npm run typecheck`

- [ ] **Step 1: Replace the shallow theme contract with a richer compatible contract**

In `src/config/themes.ts`, update the type definitions to this shape while preserving `id`, `name`, `label`, and `description`:

```ts
export type ThemeId =
  | "ops-control"
  | "evidence-ledger"
  | "native-intelligence"
  | "field-systems"
  | "liquid-glass"
  | "cosmic-voyage"
  | "retro-terminal"
  | "synthwave-sunset"
  | "bioluminescent-deep";

export type ThemeVisibility = "public" | "legacy";

export interface ThemePalette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentAlt: string;
  danger: string;
  success: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  label: string;
  description: string;
  visibility: ThemeVisibility;
  palette: ThemePalette;
  material: "operations" | "ledger" | "native" | "field" | "legacy";
  motion: "telemetry" | "record-snap" | "panel-shift" | "route-scan" | "legacy";
}
```

- [ ] **Step 2: Add the four public theme configs**

Use these configs in `src/config/themes.ts`:

```ts
const opsControl: ThemeConfig = {
  id: "ops-control",
  name: "ops-control",
  label: "Ops Control Room",
  description: "A data-operations command surface for pipelines, telemetry, and trusted outcomes.",
  visibility: "public",
  material: "operations",
  motion: "telemetry",
  palette: {
    bg: "#070A08",
    surface: "#111711",
    surfaceAlt: "#1B241F",
    text: "#EEF4EA",
    muted: "#9CA99C",
    border: "#314035",
    accent: "#F2B84B",
    accentAlt: "#63D471",
    danger: "#E05D44",
    success: "#63D471",
  },
};

const evidenceLedger: ThemeConfig = {
  id: "evidence-ledger",
  name: "evidence-ledger",
  label: "Evidence Ledger",
  description: "A case-study dossier system for metrics, tests, constraints, and outcomes.",
  visibility: "public",
  material: "ledger",
  motion: "record-snap",
  palette: {
    bg: "#F7F8F2",
    surface: "#FFFFFF",
    surfaceAlt: "#ECEFE8",
    text: "#101210",
    muted: "#5B625A",
    border: "#C9D0C6",
    accent: "#B52B2B",
    accentAlt: "#2E5266",
    danger: "#B52B2B",
    success: "#2D7D46",
  },
};

const nativeIntelligence: ThemeConfig = {
  id: "native-intelligence",
  name: "native-intelligence",
  label: "Native Intelligence",
  description: "A local-first native app lab for privacy, classifiers, and system-level automation.",
  visibility: "public",
  material: "native",
  motion: "panel-shift",
  palette: {
    bg: "#0B0D10",
    surface: "#171A1F",
    surfaceAlt: "#242930",
    text: "#F3F7FA",
    muted: "#AAB3BB",
    border: "#3A424B",
    accent: "#F6B94A",
    accentAlt: "#40C463",
    danger: "#FF6B5F",
    success: "#40C463",
  },
};

const fieldSystems: ThemeConfig = {
  id: "field-systems",
  name: "field-systems",
  label: "Field Systems",
  description: "An accessible field instrument for navigation, privacy, and human-impact software.",
  visibility: "public",
  material: "field",
  motion: "route-scan",
  palette: {
    bg: "#111416",
    surface: "#F9FAF7",
    surfaceAlt: "#E7ECEA",
    text: "#101416",
    muted: "#4E5A5C",
    border: "#AEB9B8",
    accent: "#F6D34D",
    accentAlt: "#1E88E5",
    danger: "#C64032",
    success: "#2E7D4F",
  },
};
```

- [ ] **Step 3: Mark legacy configs explicitly**

Keep the five existing configs, but add these fields to each legacy config:

```ts
visibility: "legacy",
material: "legacy",
motion: "legacy",
palette: {
  bg: "#030014",
  surface: "#111827",
  surfaceAlt: "#1F2937",
  text: "#F9FAFB",
  muted: "#A1A1AA",
  border: "#374151",
  accent: "#8B5CF6",
  accentAlt: "#06B6D4",
  danger: "#EF4444",
  success: "#22C55E",
},
```

- [ ] **Step 4: Export public and legacy theme ids**

Add these exports at the bottom of `src/config/themes.ts`:

```ts
export const publicThemeIds = themeIds.filter(
  (themeId) => themeConfigs[themeId].visibility === "public",
);

export const legacyThemeIds = themeIds.filter(
  (themeId) => themeConfigs[themeId].visibility === "legacy",
);

export const defaultThemeId: ThemeId = "ops-control";
```

- [ ] **Step 5: Create the theme experience registry**

Create `src/config/themeExperiences.ts`:

```ts
import type { ThemeId } from "@/config/themes";

export interface ThemeExperience {
  id: ThemeId;
  headlineMode: "systems-map" | "case-dossier" | "native-lab" | "field-instrument";
  projectMode: "pipeline-records" | "evidence-records" | "app-lab" | "route-cards";
  background: "ops-control" | "evidence-ledger" | "native-intelligence" | "field-systems" | "legacy";
  cursor: "instrument" | "legacy";
  sectionLabel: {
    about: string;
    experience: string;
    projects: string;
    skills: string;
    testimonials: string;
    contact: string;
  };
}

export const themeExperiences: Record<ThemeId, ThemeExperience> = {
  "ops-control": {
    id: "ops-control",
    headlineMode: "systems-map",
    projectMode: "pipeline-records",
    background: "ops-control",
    cursor: "instrument",
    sectionLabel: {
      about: "System Profile",
      experience: "Operational Proof",
      projects: "Build Pipelines",
      skills: "Capability Matrix",
      testimonials: "Delivery Signals",
      contact: "Open Channel",
    },
  },
  "evidence-ledger": {
    id: "evidence-ledger",
    headlineMode: "case-dossier",
    projectMode: "evidence-records",
    background: "evidence-ledger",
    cursor: "instrument",
    sectionLabel: {
      about: "Profile Record",
      experience: "Verified Work",
      projects: "Evidence Files",
      skills: "Skill Index",
      testimonials: "References",
      contact: "Request File",
    },
  },
  "native-intelligence": {
    id: "native-intelligence",
    headlineMode: "native-lab",
    projectMode: "app-lab",
    background: "native-intelligence",
    cursor: "instrument",
    sectionLabel: {
      about: "Local Context",
      experience: "System Services",
      projects: "Native Builds",
      skills: "Framework Stack",
      testimonials: "Reliability Notes",
      contact: "Start Session",
    },
  },
  "field-systems": {
    id: "field-systems",
    headlineMode: "field-instrument",
    projectMode: "route-cards",
    background: "field-systems",
    cursor: "instrument",
    sectionLabel: {
      about: "Field Notes",
      experience: "Routes Tested",
      projects: "Assistive Systems",
      skills: "Tools Carried",
      testimonials: "Human Signals",
      contact: "Send Signal",
    },
  },
  "liquid-glass": legacyExperience("liquid-glass"),
  "cosmic-voyage": legacyExperience("cosmic-voyage"),
  "retro-terminal": legacyExperience("retro-terminal"),
  "synthwave-sunset": legacyExperience("synthwave-sunset"),
  "bioluminescent-deep": legacyExperience("bioluminescent-deep"),
};

function legacyExperience(id: ThemeId): ThemeExperience {
  return {
    id,
    headlineMode: "systems-map",
    projectMode: "pipeline-records",
    background: "legacy",
    cursor: "legacy",
    sectionLabel: {
      about: "About",
      experience: "Experience",
      projects: "Projects",
      skills: "Skills",
      testimonials: "Testimonials",
      contact: "Contact",
    },
  };
}
```

- [ ] **Step 6: Run the type check**

Run:

```bash
npm run typecheck
```

Expected: TypeScript may fail where code assumes the old default theme or exhaustive `ThemeId` checks. Fix only type errors introduced by this task before continuing.

---

## Task 3: Theme Routing and Switcher

**Files:**
- Modify: `src/components/themes/ThemeOrchestrator.tsx`
- Modify: `src/components/layout/ThemeSwitcher.tsx`
- Create: `src/components/theme-experience/ThemeExperiencePage.tsx`
- Verify: `npm run typecheck`

- [ ] **Step 1: Add a placeholder-free new-theme renderer shell**

Create `src/components/theme-experience/ThemeExperiencePage.tsx`:

```tsx
"use client";

import type { ThemeId } from "@/config/themes";
import { getThemeConfig } from "@/config/themes";
import { themeExperiences } from "@/config/themeExperiences";

interface ThemeExperiencePageProps {
  theme: ThemeId;
}

export function ThemeExperiencePage({ theme }: ThemeExperiencePageProps) {
  const config = getThemeConfig(theme);
  const experience = themeExperiences[theme];

  return (
    <main
      className="theme-experience-page"
      data-theme-material={config.material}
      data-theme-motion={config.motion}
      data-theme-headline={experience.headlineMode}
      style={
        {
          "--theme-bg": config.palette.bg,
          "--theme-surface": config.palette.surface,
          "--theme-surface-alt": config.palette.surfaceAlt,
          "--theme-text": config.palette.text,
          "--theme-muted": config.palette.muted,
          "--theme-border": config.palette.border,
          "--theme-accent": config.palette.accent,
          "--theme-accent-alt": config.palette.accentAlt,
          "--theme-danger": config.palette.danger,
          "--theme-success": config.palette.success,
        } as React.CSSProperties
      }
    >
      <section id="hero" aria-label="Introduction" className="min-h-screen px-6 py-28 text-[color:var(--theme-text)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-[color:var(--theme-accent)]">
              {config.label}
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
              Building reliable data, ML, and native software systems.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--theme-muted)]">
              Senior CS student and ITSM Data Integration Student Associate focused on Python/SQL pipelines, applied ML, full-stack products, and accessibility-minded native apps.
            </p>
          </div>
          <div className="min-h-[420px] border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] p-6">
            <dl className="grid gap-5">
              <div>
                <dt className="font-mono text-xs uppercase text-[color:var(--theme-muted)]">Current signal</dt>
                <dd className="mt-2 text-3xl font-semibold">1M+ rows to trusted datasets</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase text-[color:var(--theme-muted)]">Build mode</dt>
                <dd className="mt-2 text-3xl font-semibold">Pipelines, ML, native apps</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}
```

This first renderer is a working minimal page used to validate routing before component extraction. Tasks 6 and 7 expand it without changing the route branch.

- [ ] **Step 2: Route public themes through the new renderer**

Update `src/components/themes/ThemeOrchestrator.tsx` so public themes use `ThemeExperiencePage`:

```tsx
import { publicThemeIds, type ThemeId } from "@/config/themes";
import { ThemeExperiencePage } from "@/components/theme-experience/ThemeExperiencePage";

const isPublicTheme = (theme: ThemeId) => publicThemeIds.includes(theme);
```

Inside the component after reading `theme`, add:

```tsx
if (isPublicTheme(theme)) {
  return (
    <div className="relative min-h-screen w-full">
      <ThemeExperiencePage theme={theme} />
    </div>
  );
}
```

Keep the existing legacy background/cursor/section stack below that branch.

- [ ] **Step 3: Update the switcher list**

In `src/components/layout/ThemeSwitcher.tsx`, import public and legacy ids:

```ts
import { getThemeConfig, legacyThemeIds, publicThemeIds } from "@/config/themes";
```

Render `publicThemeIds` first. Render legacy ids under a visually smaller group labelled `Legacy QA themes` so Ayush can compare during validation but the new themes define the public identity.

- [ ] **Step 4: Run the type check**

Run:

```bash
npm run typecheck
```

Expected: PASS.

---

## Task 4: Theme Tokens and Visual Guardrails

**Files:**
- Modify: `src/app/globals.css`
- Verify: `npm run typecheck`

- [ ] **Step 1: Add token-backed page styles**

Append this block to `src/app/globals.css` after the base theme variables:

```css
.theme-experience-page {
  min-height: 100vh;
  background:
    linear-gradient(transparent, transparent),
    var(--theme-bg);
  color: var(--theme-text);
}

.theme-experience-page * {
  letter-spacing: 0;
}

.theme-experience-page [data-theme-card] {
  border: 1px solid color-mix(in oklab, var(--theme-border) 82%, transparent);
  background: color-mix(in oklab, var(--theme-surface) 92%, transparent);
  color: var(--theme-text);
}

.theme-experience-page [data-theme-muted] {
  color: var(--theme-muted);
}

.theme-experience-page [data-theme-accent] {
  color: var(--theme-accent);
}

@media (prefers-reduced-motion: reduce) {
  .theme-experience-page *,
  .theme-experience-page *::before,
  .theme-experience-page *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}
```

The first `linear-gradient(transparent, transparent)` keeps the declaration syntactically stable without introducing a visible gradient treatment.

- [ ] **Step 2: Add material-specific texture rules**

Add this block below the shared page styles:

```css
.theme-experience-page[data-theme-material="operations"] {
  background-image:
    linear-gradient(rgba(99, 212, 113, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(242, 184, 75, 0.05) 1px, transparent 1px);
  background-size: 56px 56px, 56px 56px;
}

.theme-experience-page[data-theme-material="ledger"] {
  background-image:
    repeating-linear-gradient(0deg, rgba(16, 18, 16, 0.05) 0 1px, transparent 1px 32px),
    repeating-linear-gradient(90deg, rgba(16, 18, 16, 0.04) 0 1px, transparent 1px 32px);
}

.theme-experience-page[data-theme-material="native"] {
  background-image:
    linear-gradient(rgba(246, 185, 74, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64, 196, 99, 0.04) 1px, transparent 1px);
  background-size: 72px 72px, 72px 72px;
}

.theme-experience-page[data-theme-material="field"] {
  background:
    radial-gradient(circle at 18% 22%, rgba(246, 211, 77, 0.14), transparent 28%),
    linear-gradient(rgba(30, 136, 229, 0.06) 1px, transparent 1px),
    var(--theme-bg);
  background-size: auto, 64px 64px, auto;
}
```

These are texture fields, not generic purple/blue hero gradients. If concept approval rejects any texture, replace the rejected material rule with the approved concept texture.

- [ ] **Step 3: Run the type check**

Run:

```bash
npm run typecheck
```

Expected: PASS.

---

## Task 5: Backgrounds and Accessible Cursor

**Files:**
- Create: `src/components/backgrounds/OpsControlBg.tsx`
- Create: `src/components/backgrounds/EvidenceLedgerBg.tsx`
- Create: `src/components/backgrounds/NativeIntelligenceBg.tsx`
- Create: `src/components/backgrounds/FieldSystemsBg.tsx`
- Create: `src/components/cursors/InstrumentCursor.tsx`
- Modify: `src/components/themes/ThemeOrchestrator.tsx`
- Verify: `npm run typecheck`

- [ ] **Step 1: Create the instrument cursor**

Create `src/components/cursors/InstrumentCursor.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { ThemeId } from "@/config/themes";
import { getThemeConfig } from "@/config/themes";

interface InstrumentCursorProps {
  theme: ThemeId;
}

export function InstrumentCursor({ theme }: InstrumentCursorProps) {
  const [point, setPoint] = useState({ x: -100, y: -100 });
  const config = getThemeConfig(theme);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(any-pointer: coarse)").matches;
    if (reduced || coarse) return;

    const onMove = (event: PointerEvent) => {
      setPoint({ x: event.clientX, y: event.clientY });
    };

    document.documentElement.classList.add("has-instrument-cursor");
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      document.documentElement.classList.remove("has-instrument-cursor");
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 border md:block"
      style={{
        transform: `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)`,
        borderColor: config.palette.accent,
        boxShadow: `0 0 0 1px ${config.palette.bg}, 0 0 22px ${config.palette.accent}33`,
      }}
    />
  );
}
```

Add this CSS to `src/app/globals.css`:

```css
@media (hover: hover) and (pointer: fine) {
  html.has-instrument-cursor,
  html.has-instrument-cursor * {
    cursor: none;
  }
}
```

- [ ] **Step 2: Create static-first backgrounds**

Each new background component must return `null` when reduced motion is on. Use this exact structure for `src/components/backgrounds/OpsControlBg.tsx`, then copy the same lifecycle pattern for the other three files with different draw functions:

```tsx
"use client";

import { useEffect, useRef } from "react";

export function OpsControlBg() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.strokeStyle = "rgba(99, 212, 113, 0.18)";
      context.lineWidth = 1;

      for (let y = 80; y < window.innerHeight; y += 96) {
        context.beginPath();
        for (let x = 0; x < window.innerWidth; x += 28) {
          const offset = Math.sin((x + frame) * 0.012 + y * 0.01) * 7;
          if (x === 0) context.moveTo(x, y + offset);
          else context.lineTo(x, y + offset);
        }
        context.stroke();
      }

      context.fillStyle = "rgba(242, 184, 75, 0.42)";
      for (let x = 120; x < window.innerWidth; x += 220) {
        const y = 120 + ((x + frame * 0.7) % Math.max(window.innerHeight - 240, 240));
        context.fillRect(x, y, 5, 5);
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-70" />;
}
```

- [ ] **Step 3: Wire backgrounds and cursor into public theme routing**

In `src/components/themes/ThemeOrchestrator.tsx`, import all four new backgrounds and `InstrumentCursor`, then render them inside the public theme branch:

```tsx
{theme === "ops-control" && <OpsControlBg />}
{theme === "evidence-ledger" && <EvidenceLedgerBg />}
{theme === "native-intelligence" && <NativeIntelligenceBg />}
{theme === "field-systems" && <FieldSystemsBg />}
<InstrumentCursor theme={theme} />
<div className="relative z-10">
  <ThemeExperiencePage theme={theme} />
</div>
```

- [ ] **Step 4: Run the type check**

Run:

```bash
npm run typecheck
```

Expected: PASS.

---

## Task 6: Shared Theme Experience Components

**Files:**
- Create: `src/components/theme-experience/ThemeSection.tsx`
- Create: `src/components/theme-experience/MetricRail.tsx`
- Create: `src/components/theme-experience/ProjectEvidenceCard.tsx`
- Create: `src/components/theme-experience/TimelineTrack.tsx`
- Create: `src/components/theme-experience/SkillsMatrix.tsx`
- Create: `src/components/theme-experience/ContactConsole.tsx`
- Modify: `src/components/theme-experience/ThemeExperiencePage.tsx`
- Verify: `npm run typecheck`

- [ ] **Step 1: Create the section wrapper**

Create `src/components/theme-experience/ThemeSection.tsx`:

```tsx
import type { ReactNode } from "react";

interface ThemeSectionProps {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}

export function ThemeSection({ id, label, children, className = "" }: ThemeSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`px-6 py-24 md:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--theme-accent)]">
          {label}
        </p>
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create the metric rail**

Create `src/components/theme-experience/MetricRail.tsx`:

```tsx
import type { ProjectMetric } from "@/lib/data/projects";

interface MetricRailProps {
  metrics: ProjectMetric[];
}

export function MetricRail({ metrics }: MetricRailProps) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div key={`${metric.label}-${metric.value}`} data-theme-card className="p-4">
          <dt className="font-mono text-xs uppercase text-[color:var(--theme-muted)]">{metric.label}</dt>
          <dd className="mt-2 text-2xl font-semibold text-[color:var(--theme-text)]">{metric.value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

- [ ] **Step 3: Create the project evidence card**

Create `src/components/theme-experience/ProjectEvidenceCard.tsx`:

```tsx
import type { Project } from "@/lib/data/projects";
import { ExternalLink, Github } from "lucide-react";

interface ProjectEvidenceCardProps {
  project: Project;
}

export function ProjectEvidenceCard({ project }: ProjectEvidenceCardProps) {
  return (
    <article data-theme-card className="grid gap-6 p-5 md:grid-cols-[1fr_0.75fr]">
      <div>
        <h3 className="text-2xl font-semibold text-[color:var(--theme-text)]">{project.title}</h3>
        <p className="mt-3 text-base leading-7 text-[color:var(--theme-muted)]">{project.shortDescription}</p>
        <ul className="mt-5 grid gap-2">
          {project.highlights.slice(0, 3).map((highlight) => (
            <li key={highlight} className="flex gap-3 text-sm leading-6 text-[color:var(--theme-text)]">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-[color:var(--theme-accent)]" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col justify-between gap-6 border-t border-[color:var(--theme-border)] pt-5 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <div className="flex flex-wrap gap-2">
          {project.techStack.slice(0, 6).map((tech) => (
            <span key={tech.name} className="border border-[color:var(--theme-border)] px-2 py-1 font-mono text-xs text-[color:var(--theme-muted)]">
              {tech.name}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          {project.githubUrl && (
            <a href={project.githubUrl} className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--theme-accent)]">
              <Github className="h-4 w-4" aria-hidden="true" />
              Code
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--theme-accent)]">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Live
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Create the timeline track**

Create `src/components/theme-experience/TimelineTrack.tsx`:

```tsx
import type { Experience } from "@/lib/data/experience";
import { formatDateRange } from "@/lib/data/experience";

interface TimelineTrackProps {
  experiences: Experience[];
}

export function TimelineTrack({ experiences }: TimelineTrackProps) {
  return (
    <ol className="grid gap-5">
      {experiences.map((experience) => (
        <li key={experience.id} data-theme-card className="grid gap-5 p-5 md:grid-cols-[0.35fr_1fr]">
          <div>
            <p className="font-mono text-xs uppercase text-[color:var(--theme-muted)]">
              {formatDateRange(experience.startDate, experience.endDate)}
            </p>
            <p className="mt-2 text-sm text-[color:var(--theme-muted)]">{experience.location}</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-[color:var(--theme-text)]">{experience.title}</h3>
            <p className="mt-1 text-sm font-medium text-[color:var(--theme-accent)]">{experience.company}</p>
            <ul className="mt-5 grid gap-3">
              {experience.achievements.map((achievement) => (
                <li key={achievement} className="flex gap-3 text-sm leading-6 text-[color:var(--theme-text)]">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-[color:var(--theme-accent-alt)]" />
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 5: Create the skills matrix**

Create `src/components/theme-experience/SkillsMatrix.tsx`:

```tsx
import type { SkillCategory } from "@/lib/data/skills";

interface SkillsMatrixProps {
  categories: SkillCategory[];
}

export function SkillsMatrix({ categories }: SkillsMatrixProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <section key={category.id} data-theme-card className="p-5" aria-labelledby={`skill-${category.id}`}>
          <h3 id={`skill-${category.id}`} className="text-xl font-semibold text-[color:var(--theme-text)]">
            {category.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--theme-muted)]">{category.description}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {category.skills.map((skill) => (
              <li key={skill.name} className="border border-[color:var(--theme-border)] px-2 py-1 font-mono text-xs text-[color:var(--theme-text)]">
                {skill.name}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Create the contact console**

Create `src/components/theme-experience/ContactConsole.tsx`:

```tsx
import { Github, Linkedin, Mail } from "lucide-react";
import { personalInfo, socialLinks } from "@/lib/data/personal";

const iconMap = {
  Email: Mail,
  GitHub: Github,
  LinkedIn: Linkedin,
} as const;

export function ContactConsole() {
  return (
    <div data-theme-card className="grid gap-8 p-6 md:grid-cols-[1fr_0.8fr]">
      <div>
        <h2 id="contact-heading" className="text-4xl font-semibold text-[color:var(--theme-text)]">
          Open a channel for data, ML, or product engineering work.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[color:var(--theme-muted)]">
          {personalInfo.availability}. Based in {personalInfo.location}, focused on reliable systems that turn messy workflows into usable software.
        </p>
      </div>
      <div className="grid gap-3">
        {socialLinks.map((link) => {
          const Icon = iconMap[link.name as keyof typeof iconMap] ?? Mail;
          return (
            <a key={link.name} href={link.url} className="flex items-center justify-between border border-[color:var(--theme-border)] px-4 py-3 text-[color:var(--theme-text)]">
              <span className="inline-flex items-center gap-3">
                <Icon className="h-4 w-4 text-[color:var(--theme-accent)]" aria-hidden="true" />
                {link.name}
              </span>
              <span aria-hidden="true" className="font-mono text-xs text-[color:var(--theme-muted)]">
                CONNECT
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Run the type check**

Run:

```bash
npm run typecheck
```

Expected: PASS.

---

## Task 7: Full Seven-Section Experience

**Files:**
- Modify: `src/components/theme-experience/ThemeExperiencePage.tsx`
- Verify: `npm run typecheck`

- [ ] **Step 1: Replace the initial renderer with all seven sections**

Update `src/components/theme-experience/ThemeExperiencePage.tsx`:

```tsx
"use client";

import type { CSSProperties } from "react";
import type { ThemeId } from "@/config/themes";
import { getThemeConfig } from "@/config/themes";
import { themeExperiences } from "@/config/themeExperiences";
import { personalInfo } from "@/lib/data/personal";
import { experiences } from "@/lib/data/experience";
import { projects } from "@/lib/data/projects";
import { testimonials } from "@/lib/data/testimonials";
import { skillCategories } from "@/lib/data/skills";
import { ThemeSection } from "@/components/theme-experience/ThemeSection";
import { MetricRail } from "@/components/theme-experience/MetricRail";
import { ProjectEvidenceCard } from "@/components/theme-experience/ProjectEvidenceCard";
import { TimelineTrack } from "@/components/theme-experience/TimelineTrack";
import { SkillsMatrix } from "@/components/theme-experience/SkillsMatrix";
import { ContactConsole } from "@/components/theme-experience/ContactConsole";

interface ThemeExperiencePageProps {
  theme: ThemeId;
}

const heroMetrics = [
  { label: "Operational data", value: "1M+ rows" },
  { label: "Calendar tests", value: "738" },
  { label: "MNIST accuracy", value: "97%+" },
  { label: "SIMD speedup", value: "5x" },
];

export function ThemeExperiencePage({ theme }: ThemeExperiencePageProps) {
  const config = getThemeConfig(theme);
  const experience = themeExperiences[theme];
  const featuredProjects = projects.filter((project) => project.featured);
  const supportingProjects = projects.filter((project) => !project.featured);

  const style = {
    "--theme-bg": config.palette.bg,
    "--theme-surface": config.palette.surface,
    "--theme-surface-alt": config.palette.surfaceAlt,
    "--theme-text": config.palette.text,
    "--theme-muted": config.palette.muted,
    "--theme-border": config.palette.border,
    "--theme-accent": config.palette.accent,
    "--theme-accent-alt": config.palette.accentAlt,
    "--theme-danger": config.palette.danger,
    "--theme-success": config.palette.success,
  } as CSSProperties;

  return (
    <main
      className="theme-experience-page"
      data-theme-material={config.material}
      data-theme-motion={config.motion}
      data-theme-headline={experience.headlineMode}
      style={style}
    >
      <section id="hero" aria-labelledby="hero-heading" className="min-h-screen px-6 py-28 text-[color:var(--theme-text)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-[color:var(--theme-accent)]">
              {config.label}
            </p>
            <h1 id="hero-heading" className="mt-6 max-w-5xl text-5xl font-semibold leading-tight md:text-7xl">
              I build the systems between messy data, reliable models, and useful products.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--theme-muted)]">
              {personalInfo.name} is a {personalInfo.title} focused on Python/SQL pipelines, applied ML, full-stack products, and accessibility-minded native apps.
            </p>
          </div>
          <div data-theme-card className="flex min-h-[420px] flex-col justify-between p-6">
            <div>
              <p className="font-mono text-xs uppercase text-[color:var(--theme-muted)]">Current availability</p>
              <p className="mt-2 text-2xl font-semibold">{personalInfo.availability}</p>
            </div>
            <MetricRail metrics={heroMetrics} />
          </div>
        </div>
      </section>

      <ThemeSection id="about" label={experience.sectionLabel.about}>
        <h2 id="about-heading" className="text-4xl font-semibold text-[color:var(--theme-text)]">Profile built from shipped systems.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {personalInfo.bio.map((paragraph) => (
            <p key={paragraph} data-theme-card className="p-5 text-base leading-8 text-[color:var(--theme-muted)]">
              {paragraph}
            </p>
          ))}
        </div>
      </ThemeSection>

      <ThemeSection id="experience" label={experience.sectionLabel.experience}>
        <h2 id="experience-heading" className="text-4xl font-semibold text-[color:var(--theme-text)]">Operational proof from real teams.</h2>
        <div className="mt-8">
          <TimelineTrack experiences={experiences} />
        </div>
      </ThemeSection>

      <ThemeSection id="projects" label={experience.sectionLabel.projects}>
        <h2 id="projects-heading" className="text-4xl font-semibold text-[color:var(--theme-text)]">Projects as evidence records.</h2>
        <div className="mt-8 grid gap-5">
          {[...featuredProjects, ...supportingProjects.slice(0, 3)].map((project) => (
            <ProjectEvidenceCard key={project.id} project={project} />
          ))}
        </div>
      </ThemeSection>

      <ThemeSection id="skills" label={experience.sectionLabel.skills}>
        <h2 id="skills-heading" className="text-4xl font-semibold text-[color:var(--theme-text)]">Capabilities grouped by work performed.</h2>
        <div className="mt-8">
          <SkillsMatrix categories={skillCategories} />
        </div>
      </ThemeSection>

      <ThemeSection id="testimonials" label={experience.sectionLabel.testimonials}>
        <h2 id="testimonials-heading" className="text-4xl font-semibold text-[color:var(--theme-text)]">External validation.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.id} data-theme-card className="p-5">
              <blockquote className="text-base leading-8 text-[color:var(--theme-muted)]">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-5 font-mono text-xs uppercase text-[color:var(--theme-accent)]">
                {testimonial.name} - {testimonial.company}
              </figcaption>
            </figure>
          ))}
        </div>
      </ThemeSection>

      <ThemeSection id="contact" label={experience.sectionLabel.contact}>
        <ContactConsole />
      </ThemeSection>
    </main>
  );
}
```

- [ ] **Step 2: Make the hero non-generic**

The hero must not be centered-name-first. It must lead with the work shape:

```tsx
<h1 id="hero-heading" className="max-w-5xl text-5xl font-semibold leading-tight text-[color:var(--theme-text)] md:text-7xl">
  I build the systems between messy data, reliable models, and useful products.
</h1>
```

Use `personalInfo.name`, `personalInfo.title`, and `personalInfo.availability` as supporting metadata, not as the giant primary visual.

- [ ] **Step 3: Use projects as proof records**

Render featured projects first:

```ts
const featuredProjects = projects.filter((project) => project.featured);
const supportingProjects = projects.filter((project) => !project.featured);
```

Render at least four featured projects and at least three supporting projects using `ProjectEvidenceCard`.

- [ ] **Step 4: Run the type check**

Run:

```bash
npm run typecheck
```

Expected: PASS.

---

## Task 8: Playwright Theme QA

**Files:**
- Modify: `tests/playwright/themes.spec.ts`
- Modify: `tests/playwright/comprehensive-qa.spec.ts`
- Create: `tests/playwright/theme-visual-audit.spec.ts`
- Verify: `npm run test:e2e -- --project=chromium`

- [ ] **Step 1: Update theme id expectations**

In `tests/playwright/themes.spec.ts`, replace stale theme ids with:

```ts
const publicThemes = [
  "ops-control",
  "evidence-ledger",
  "native-intelligence",
  "field-systems",
] as const;
```

Assert each theme can be selected through the visible switcher and that `document.documentElement.dataset.theme` matches the selected id.

- [ ] **Step 2: Add reduced-motion audit**

Create `tests/playwright/theme-visual-audit.spec.ts` with this baseline:

```ts
import { test, expect } from "@playwright/test";

const publicThemes = [
  "ops-control",
  "evidence-ledger",
  "native-intelligence",
  "field-systems",
] as const;

test.describe("new portfolio theme visual audit", () => {
  for (const theme of publicThemes) {
    test(`${theme} renders all sections without overflow`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await page.evaluate((themeId) => {
        localStorage.setItem("portfolio-theme", themeId);
      }, theme);
      await page.reload();
      await expect(page.locator("body")).toBeVisible();

      for (const id of ["hero", "about", "experience", "projects", "skills", "testimonials", "contact"]) {
        await expect(page.locator(`#${id}`)).toBeVisible();
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
```

- [ ] **Step 3: Add scroll-position screenshots**

Extend `theme-visual-audit.spec.ts` to capture screenshots at hero, projects, and contact:

```ts
await page.screenshot({ path: `test-results/theme-audit/${theme}-hero.png`, fullPage: false });
await page.locator("#projects").scrollIntoViewIfNeeded();
await page.screenshot({ path: `test-results/theme-audit/${theme}-projects.png`, fullPage: false });
await page.locator("#contact").scrollIntoViewIfNeeded();
await page.screenshot({ path: `test-results/theme-audit/${theme}-contact.png`, fullPage: false });
```

- [ ] **Step 4: Run Chromium E2E**

Run:

```bash
npm run test:e2e -- --project=chromium-desktop
npm run test:e2e -- --project=chromium-mobile
```

Expected: all Chromium tests pass, screenshots exist under `test-results/theme-audit/`.

---

## Task 9: Browser Fidelity Review

**Files:**
- Modify only files needed to fix concrete issues found during review.
- Verify: browser screenshots plus Playwright screenshots.

- [ ] **Step 1: Start the app**

Run:

```bash
npm run dev
```

Expected: local Next.js server starts and prints a localhost URL.

- [ ] **Step 2: Inspect every new theme manually**

For each public theme:

```text
1. Open the page.
2. Select the theme.
3. Check first viewport at desktop width.
4. Scroll through About, Experience, Projects, Skills, Testimonials, and Contact.
5. Check theme transition from the switcher.
6. Check keyboard tab focus.
7. Toggle reduced motion in browser emulation.
8. Resize to mobile width and repeat hero, projects, and contact.
```

- [ ] **Step 3: Compare against accepted concept images**

Use `view_image` on the accepted concept image and the latest browser screenshot for each theme. Check at least these five points per theme:

```text
1. First viewport composition and hierarchy.
2. Palette and absence of generic purple/cyan/pink gradient language.
3. Section rhythm and whether it avoids repeated bento card grids.
4. Project evidence readability and metric credibility.
5. Mobile text fit, focus visibility, and reduced-motion behavior.
```

- [ ] **Step 4: Fix visible mismatches**

Only fix mismatches grounded in the accepted concept or browser evidence. After each fix, rerun:

```bash
npm run typecheck
npm run test:e2e -- --project=chromium-desktop tests/playwright/theme-visual-audit.spec.ts
```

Expected: both commands pass.

---

## Task 10: Final Validation and Cleanup

**Files:**
- Modify: `docs/design/unique-themes/README.md`
- Verify: `npm run typecheck`, `npm run test:e2e -- --project=chromium-desktop`, `npm run test:e2e -- --project=chromium-mobile`

- [ ] **Step 1: Record final concept-to-render status**

Update `docs/design/unique-themes/README.md`:

```markdown
## Final Render Status

| Theme id | Desktop hero | Desktop projects | Mobile hero | Reduced motion | Status |
| --- | --- | --- | --- | --- | --- |
| `ops-control` | passed | passed | passed | passed | accepted |
| `evidence-ledger` | passed | passed | passed | passed | accepted |
| `native-intelligence` | passed | passed | passed | passed | accepted |
| `field-systems` | passed | passed | passed | passed | accepted |
```

- [ ] **Step 2: Run final checks**

Run:

```bash
npm run typecheck
npm run test:e2e -- --project=chromium-desktop
npm run test:e2e -- --project=chromium-mobile
```

Expected: both commands pass.

- [ ] **Step 3: Commit if Ayush asks for implementation to be committed**

Use one commit for the full theme implementation unless Ayush requests a different commit structure:

```bash
git add src/config/themes.ts src/config/themeExperiences.ts src/components src/app/globals.css tests/playwright docs/design/unique-themes
git commit -m "feat: add unique portfolio theme system"
```

Expected: commit succeeds.

---

## Self-Review

### Spec Coverage

- Online and GitHub research: covered in Research Synthesis with external design, motion, accessibility, and portfolio repo sources.
- Current repo inspection: covered by local source list and architecture-driven file structure.
- Previous portfolio avoidance: covered by local old-portfolio research and hard guardrails.
- No boring generic gradients: covered by Direction Decision, Hard Guardrails, CSS texture rules, and Playwright visual review.
- No implementation before approval: Task 1 stops before app code, and this document is plan-only.
- Four to six research agents: six read-only agents were used before this plan.
- Complete implementation path: Tasks 1 through 10 cover concept approval, registry, routing, visuals, seven sections, tests, browser QA, and cleanup.

### Placeholder Scan

A red-flag scan was run after writing the plan. The only explicit review-state strings are concept-ledger status values, not missing plan content.

### Type Consistency

- New `ThemeId` values match `themeConfigs`, `themeExperiences`, Playwright lists, and planned component props.
- `ThemeConfig.palette` property names match CSS variables in `ThemeExperiencePage`.
- `ThemeExperience` values match the planned public theme ids.
