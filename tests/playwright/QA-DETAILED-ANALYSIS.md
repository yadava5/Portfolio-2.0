# ROUND 2 QA: DETAILED TECHNICAL ANALYSIS

## Issue #1: Project Filtering Inconsistency - Code Audit

### Current Implementation Comparison

#### Theme 1: PAPER & INK (Filters Private)
**File:** `src/components/themes/creative/paper-ink/PaperInkProjects.tsx:174-175`

```tsx
// Filters OUT private projects
const featured = projects.filter(p => p.featured && !p.isPrivate);
const nonFeatured = projects.filter(p => !p.featured && !p.isPrivate);

// Result: Shows 4 featured + 3 others = 7 total
// Hidden: PolicyBot, Master Inventory Pipeline
```

#### Theme 2: GALLERY (Filters Private)
**File:** `src/components/themes/creative/gallery/GalleryProjects.tsx:31`

```tsx
// Filters to public projects only
const publicProjects = projects.filter((p) => !p.isPrivate);

// Result: 7 total (4 featured + 3 others)
// Hidden: PolicyBot, Master Inventory Pipeline
```

#### Theme 3: DARK LUXE (Filters Private via Helper)
**File:** `src/components/themes/creative/dark-luxe/DarkLuxeProjects.tsx:9-10`

```tsx
import { getFeaturedProjects, getPublicProjects } from "@/lib/data/projects";

const featured = getFeaturedProjects();
const nonFeatured = getPublicProjects().filter((p) => !p.featured);

// Result: 7 total (4 featured + 3 others)
// Note: getFeaturedProjects() shows ALL featured (including private)
// Then getPublicProjects() only shows public non-featured
// INCONSISTENCY: Featured projects include private, but non-featured don't!
```

**BUG FOUND:** `getFeaturedProjects()` in `src/lib/data/projects.ts` doesn't filter private:
```tsx
export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);  // <-- NO isPrivate check!
}
```

#### Theme 4: EDITORIAL (Shows All)
**File:** `src/components/themes/creative/editorial/EditorialProjects.tsx:9-10`

```tsx
// NO filtering - shows all projects
const featured = projects.filter((p) => p.featured);
const nonFeatured = projects.filter((p) => !p.featured);

// Result: 9 total (4 featured + 5 others)
// Shows: All projects including PolicyBot, Master Inventory Pipeline
```

#### Theme 5: NOIR CINEMA (Only Featured)
**File:** `src/components/themes/creative/noir-cinema/NoirCinemaProjects.tsx:70`

```tsx
// Only featured projects in horizontal scroll
const featuredProjects = projects.filter((p) => p.featured);

// Later in render: {featuredProjects.map(...)} NO OTHER PROJECTS SECTION

// Result: 4 total (4 featured only, 0 others)
// Hidden: 5 other projects (both featured count as 4, so 5 hidden)
```

#### Theme 6: NEON CYBER (Shows All)
**File:** `src/components/themes/creative/neon-cyber/NeonCyberProjects.tsx:115`

```tsx
// Shows all projects in grid
{projects.map((project, idx) => (
  // NO filtering
))}

// Result: 9 total (all projects shown)
// Includes private projects with "Private" label
```

---

### The Projects Data

From `/src/lib/data/projects.ts`:

```ts
export const projects: Project[] = [
  // FEATURED (4):
  { id: "jobtracker", featured: true, isPrivate: false, ... },
  { id: "automl", featured: true, isPrivate: false, ... },
  { id: "visual-assist", featured: true, isPrivate: false, ... },
  { id: "taskflow-calendar", featured: true, isPrivate: false, ... },

  // OTHER (5):
  { id: "fast-mnist-nn", featured: false, isPrivate: false, ... },
  { id: "lifequest", featured: false, isPrivate: false, ... },
  { id: "master-inventory", featured: false, isPrivate: true, ... },  // PRIVATE
  { id: "policybot", featured: false, isPrivate: true, ... },         // PRIVATE
  { id: "paid-internships", featured: false, isPrivate: false, ... },
];
// Total: 4 featured (all public) + 5 other (3 public + 2 private)
// Public total: 7
// Private total: 2
// All total: 9
```

---

### Test Evidence

#### Test Code
```tsx
test(`${theme.name}: Projects section shows ALL ${EXPECTED_PROJECTS} projects`, async ({ page }) => {
  // ... setup ...
  const projText = await projectsSection.textContent();
  for (const title of EXPECTED_DATA.projectTitles) {
    expect(projText).toContain(title);
  }
});
```

#### Test Result - PAPER & INK
**Status:** ❌ FAILED
```
Expected substring: "Master Inventory Pipeline"
Received string: "...Fast MNIST Neural Network...LifeQuest...Paid Internships Advocacy..."
(Master Inventory Pipeline NOT FOUND)
```

**Root Cause:** Line 174 filters `!p.isPrivate`, hiding the project.

---

## Issue #2: Dynamic CSS Injection Pattern Analysis

### Current Pattern (Bad)

**File:** `src/components/themes/creative/paper-ink/PaperInkProjects.tsx:10-152`

```tsx
export function PaperInkProjects() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .paper-ink-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
      }
      // 140+ lines of CSS...
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);  // Cleanup only removes FIRST matching style!
    };
  }, []);

  return (
    <section id="projects" className="...">
      {/* Component JSX */}
    </section>
  );
}
```

### Problems with This Approach

**1. No Unique ID - Multiple Styles Can Accumulate**
```
Initial render:  <style>  (appended)
Re-mount:        <style>  (new one appended!)
                 <style>  (original still in DOM)
Result:          Duplicate styles, potential conflicts
```

**2. Cleanup Race Condition**
If component is unmounted while effect is running:
```tsx
document.head.removeChild(style);  // Throws if already removed
```

**3. Harder to Debug**
- Styles don't show in CSS files in DevTools
- Hard to search codebase for where styles come from
- Makes component interdependent on DOM order

**4. Performance Impact**
- Re-mounting component = re-parsing CSS in useEffect
- Wasted work on theme switches

### Better Approach

**Option A: CSS Module**
```tsx
// PaperInkProjects.module.css
.grid { display: grid; ... }

// PaperInkProjects.tsx
import styles from './PaperInkProjects.module.css';

export function PaperInkProjects() {
  return <section className={styles.grid}> ... </section>;
}
```

**Option B: Inline Styles (if must be dynamic)**
```tsx
const PAPER_INK_STYLES = `
  .paper-ink-grid { ... }
`;

export function PaperInkProjects() {
  return (
    <>
      <style id="paperink-styles">{PAPER_INK_STYLES}</style>
      <section id="projects">...</section>
    </>
  );
}
```

The `id` prevents duplicate injection.

---

## Issue #3: Helper Function Inconsistency

**File:** `src/lib/data/projects.ts`

```tsx
/**
 * Get featured projects for the bento grid
 */
export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);  // NO isPrivate check!
}

/**
 * Get all public projects
 */
export function getPublicProjects(): Project[] {
  return projects.filter((p) => !p.isPrivate);  // Gets all public (featured + non-featured)
}
```

### The Problem

`getFeaturedProjects()` doesn't filter by `isPrivate`, so it returns:
```
[JobTracker, AutoML, VisualAssist, Taskflow]  // All public (no issue here)
```

But `getPublicProjects()` returns:
```
[JobTracker, AutoML, VisualAssist, Taskflow, FastMNIST, LifeQuest, PaidInternships]
// Missing: Master Inventory, PolicyBot (private)
```

Then DarkLuxe does:
```tsx
const featured = getFeaturedProjects();  // Gets 4
const nonFeatured = getPublicProjects().filter((p) => !p.featured);  // Gets 3
// Total: 7 (all public)
```

But NoirCinema does:
```tsx
const featuredProjects = projects.filter((p) => p.featured);  // Gets 4 (NO privacy filter)
// Then ONLY displays featured
// Total: 4 only
```

And Editorial does:
```tsx
const featured = projects.filter((p) => p.featured);  // Gets 4 (ALL featured, includes none in this case)
const nonFeatured = projects.filter((p) => !p.featured);  // Gets 5 (includes private!)
// Total: 9 (ALL projects)
```

### Solutions

**Option 1: Add helper for featured public projects**
```tsx
export function getFeaturedProjects(publicOnly = false): Project[] {
  return projects.filter((p) => p.featured && (!publicOnly || !p.isPrivate));
}

export function getNonFeaturedProjects(publicOnly = false): Project[] {
  return projects.filter((p) => !p.featured && (!publicOnly || !p.isPrivate));
}
```

**Option 2: Create a theme data accessor**
```tsx
export function getThemeProjects(options: {
  onlyPublic?: boolean;
  onlyFeatured?: boolean;
} = {}): Project[] {
  let filtered = projects;
  if (options.onlyPublic) {
    filtered = filtered.filter(p => !p.isPrivate);
  }
  if (options.onlyFeatured) {
    filtered = filtered.filter(p => p.featured);
  }
  return filtered;
}

// Usage:
const allProjects = getThemeProjects();
const publicOnly = getThemeProjects({ onlyPublic: true });
const featured = getThemeProjects({ onlyFeatured: true });
const featuredPublic = getThemeProjects({ onlyPublic: true, onlyFeatured: true });
```

---

## Issue #4: Name Display Case Inconsistency

### Test Output
```
Expected: "Ayush Yadav"
Got: "THE AYUSH YADAV PORTFOLIO"
```

### Where This Happens

**Paper & Ink Hero** (`src/components/themes/creative/paper-ink/PaperInkHero.tsx`)
```tsx
<h1 className="text-4xl md:text-5xl font-bold mb-4" style={{textTransform: 'uppercase'}}>
  THE {personalInfo.firstName.toUpperCase()} YADAV PORTFOLIO
</h1>
```

Renders: `THE AYUSH YADAV PORTFOLIO`

**Data Source** (`src/lib/data/personal.ts`)
```tsx
export const personalInfo = {
  name: "Ayush Yadav",  // <-- Proper case stored here
  firstName: "Ayush",   // <-- Proper case
  ...
};
```

### Other Themes

Need to check if they use:
```tsx
// Option 1: Display proper case
{personalInfo.name}  // "Ayush Yadav"

// Option 2: Apply CSS text-transform
style={{ textTransform: 'uppercase' }}  // "AYUSH YADAV"

// Option 3: Call .toUpperCase()
{personalInfo.name.toUpperCase()}  // "AYUSH YADAV"
```

---

## Issue #5: Mobile Viewport Overlap Analysis

### Scenario: iPhone 12 (390px width)

**Probable HTML structure:**
```html
<html>
  <body>
    <nav class="theme-switcher-button fixed top-4 right-4 z-50">
      <button>Theme</button>
      <div class="dropdown">...</div>
    </nav>

    <main>
      <section id="hero" class="min-h-screen">
        <h1>{name}</h1>
        <p>{title}</p>
        <div class="flex gap-4">
          <button>View Work</button>
          <button>Resume</button>
        </div>
      </section>
    </main>
  </body>
</html>
```

**Overlap Risk:**
- Theme button is `fixed` with `z-50` (stays on screen)
- Hero content is `min-h-screen` (takes full viewport)
- On 390px width, button might overlap:
  - Right edge of `<h1>`
  - CTA buttons in hero
  - Resume button especially

### Check Required
```tsx
// test/playwright/deep-qa.spec.ts - Mobile section
test.use({ viewport: { width: 390, height: 844 } });  // iPhone 12

test(`Theme switcher doesn't cover hero content`, async ({ page }) => {
  const switcher = page.locator('[role="button"]').filter({ has: /theme/i });
  const hero = page.locator('#hero');

  const switcherBox = await switcher.boundingBox();
  const heroBox = await hero.boundingBox();

  // Switcher should be in right 50px of viewport, not covering content
  expect(switcherBox?.left).toBeGreaterThan(viewport.width - 60);
});
```

---

## Issue #6: WCAG AA Color Contrast Issues

### Dark Luxe Theme
**File:** `src/components/themes/creative/dark-luxe/DarkLuxe.tsx` (CSS variables)

Need to check contrast ratios for:
```css
--card-bg: /* Need value */
--surface-2: /* Need value */
--surface-3: /* Need value */
--foreground: /* Need value */
--foreground-muted: /* Need value */
```

### WCAG AA Requirements
- **Normal text:** 4.5:1 contrast ratio minimum
- **Large text:** 3:1 contrast ratio minimum
- **UI components:** 3:1 contrast ratio minimum

### Test Plan
```tsx
test('Dark Luxe meets WCAG AA contrast', async ({ page }) => {
  const textElements = await page.locator('p, h1, h2, h3, span').all();

  for (const el of textElements) {
    const computed = await el.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
      };
    });

    const ratio = calculateContrastRatio(computed.color, computed.backgroundColor);
    expect(ratio).toBeGreaterThanOrEqual(4.5);  // AA standard
  }
});
```

---

## Issue #7: Focus Indicator Visibility

### Current Implementation
Most themes likely use default browser focus (outline), which may be:
- Hard to see on dark backgrounds
- Styled away accidentally with `outline: none` without replacement

### Required Check
```tsx
test('Theme switcher has visible focus indicator', async ({ page }) => {
  const switcher = page.locator('button[aria-label*="theme"]');

  // Press Tab to focus
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');  // Navigate to button

  // Check if focused element has visible outline/ring
  const hasFocus = await switcher.evaluate((el) => {
    const style = window.getComputedStyle(el);
    const outline = style.outline;
    const boxShadow = style.boxShadow;

    // Should have either outline or box-shadow visible
    return outline !== 'none' || (boxShadow && boxShadow !== 'none');
  });

  expect(hasFocus).toBe(true);
});
```

### Best Practice
```css
button:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

/* OR */

button:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
}
```

---

## Summary Table: What Each Theme Shows

| Metric | Editorial | Noir Cinema | Neon Cyber | Paper & Ink | Gallery | Dark Luxe |
|--------|-----------|-------------|-----------|------------|---------|-----------|
| Featured projects | 4 | 4 | 9 | 4 | 4 | 4 |
| Other projects | 5 | 0 | - | 3 | 3 | 3 |
| Total shown | 9 | 4 | 9 | 7 | 7 | 7 |
| Shows private | YES | YES | YES | NO | NO | NO |
| Filter logic | featured + non-featured | featured only | all in grid | featured + non-featured, public | all public | featured + non-featured, public |
| CSS strategy | Tailwind | Tailwind | Dynamic inject | Dynamic inject | Tailwind | Tailwind |
| Shows resume link | ? | ? | ? | YES | ? | ? |

**Conclusion:** No two themes are consistent!

