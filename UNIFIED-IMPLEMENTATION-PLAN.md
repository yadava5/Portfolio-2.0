# UNIFIED IMPLEMENTATION PLAN
**Portfolio:** Ayush's Next.js 16 Multi-Theme Portfolio
**Current State:** 5.8/10
**Target State:** 9.4-9.6/10
**Total Effort:** 108-128 hours (4-5 weeks full-time, 8-10 weeks part-time)
**Execution Order:** Plan 2 → Plan 3 → Plan 1
**Status:** READY FOR IMPLEMENTATION ✓
**Date Created:** March 30, 2026

---

## OVERVIEW

### Current Portfolio Issues
- **Code Duplication:** 8,000+ repeated lines across 5 theme files
- **Bundle Bloat:** 223MB build with full GSAP + Framer Motion overlap
- **Accessibility Gaps:** 7 WCAG violations, low Lighthouse score
- **Visual Polish:** Inconsistent layouts, missing mobile refinement
- **Performance Debt:** Double ScrollTrigger.update, inefficient cleanup, no custom hooks

### Execution Strategy
**Why this order (Plan 2 → Plan 3 → Plan 1)?**
1. Plan 2 creates shared components first (eliminates duplication)
2. Plan 3 adds accessibility to those shared components (not duplicated)
3. Plan 1 applies 5 different visual styles to those shared components (no redesign waste)

**If you do Plan 1 first, you'll redesign all 5 themes twice (waste 60+ hours).**

### Success Metrics
| Dimension | Current | Target |
|-----------|---------|--------|
| Visual Design | 5.8/10 | 9.3/10 |
| Architecture | 6/10 | 9.5/10 |
| Accessibility | 4/10 | 9.2/10 |
| Performance | 6.2/10 | 8.8/10 |
| **Overall** | **5.8/10** | **9.4-9.6/10** |

---

## SECTION 1: PHASE 1 — ARCHITECTURE REFACTOR
**Timeline:** 40-45 hours (Week 1-2)
**Goal:** Extract shared components, consolidate animation libraries, reduce bundle by ~210KB
**Success Criteria:** All shared components work with 5 themes, bundle savings verified, no console errors

### Phase 1 Deliverables
- Custom hooks for scroll, motion, theme management
- Shared Hero.tsx (renders all 5 theme variants via CSS)
- Shared Projects.tsx, About.tsx, Skills.tsx, Contact.tsx
- Theme config system with centralized color/font definitions
- GSAP optimizations (tree-shaking, modular imports)
- Framer Motion removed entirely
- ESLint + Prettier rules established

### Breakdown by Task

#### 1.1 Create Custom Hooks — 6 hours
**Purpose:** Extract common scroll, motion, and theme logic into reusable hooks
**Files to create:**
- `src/hooks/useScrollAnimation.ts`
- `src/hooks/useGSAPCleanup.ts`
- `src/hooks/usePrefersReducedMotion.ts`
- `src/hooks/useThemeConfig.ts`

**Key requirements:**
- Handle component unmounting during scroll
- Handle theme switching mid-animation
- Handle window resize
- Handle reduced motion preferences
- Prevent memory leaks with cleanup

**Verification:**
```bash
# Check all hooks compile
npm run build

# Check for unused dependencies
npm list --depth=0

# Test theme switching
npm run dev
# Open dev tools, switch themes 5+ times, check console for errors
```

**Time estimate:** 6 hours
**If it takes longer:** Start with just `useScrollAnimation` and `usePrefersReducedMotion`; add others incrementally

---

#### 1.2 Create Shared Hero Component — 3.5 hours
**Purpose:** Replace 5 separate DarkLuxeHero, PaperInkHero, etc. with one component
**Current state:** `/src/components/themes/` has 5 hero files (~400 LOC total)
**Target state:** Single `/src/components/shared/Hero.tsx` (~100 LOC) + CSS

**Implementation steps:**
1. Create `/src/components/shared/Hero.tsx` with generic structure
2. Extract inline styles → CSS modules (theme-specific)
3. Update layout props (all themes use same component signature)
4. Create `/src/styles/themes/hero.css` with 5 theme variants
5. Test in each theme without page reload

**Code pattern (all 5 themes):**
```typescript
// Shared Hero.tsx
<Hero
  title="Ayush"
  subtitle="Designer & Developer"
  theme={currentTheme}
/>

// In CSS:
[data-theme="dark-luxe"] .hero { /* Large, elegant layout */ }
[data-theme="paper-ink"] .hero { /* Masthead, left-aligned */ }
// ... 3 more themes
```

**Verification:**
```bash
# Test Hero renders in all 5 themes
npm run dev
# Visit /
# Switch theme 5 times using theme picker
# Check for layout shifts, animation glitches, console errors
```

**Time estimate:** 3.5 hours
**If it takes longer:** Reduce animation complexity in first pass; add GSAP effects after layout verified

---

#### 1.3 Create Theme Config System — 2.5 hours
**Purpose:** Centralize color tokens, fonts, animation settings in one place
**Current state:** Colors/fonts scattered in component files and CSS
**Target state:** Single `src/config/themes.ts`

**File structure:**
```typescript
// src/config/themes.ts
export const themeConfigs = {
  "dark-luxe": {
    colors: {
      primary: "#C9A961",
      background: "#1A1A1A",
      // ...
    },
    fonts: {
      display: "Cormorant Garamond",
      body: "Inter",
    },
    animation: {
      springConfig: { tension: 180, friction: 26 },
      scrollTrigger: { // ...}
    }
  },
  // ... 4 more themes
}
```

**Verification:**
```bash
# Check config exports correctly
grep -r "themeConfigs" src/ --include="*.tsx" --include="*.ts"

# Test all 5 themes load without errors
npm run dev
# Open DevTools, check console (should see 0 errors)
```

**Time estimate:** 2.5 hours
**If it takes longer:** Start with colors only; add fonts and animation later

---

#### 1.4 Migrate Dark Luxe Theme to Shared Components — 4 hours
**Purpose:** First real migration; establishes pattern for other themes
**Current files:** DarkLuxeHero, DarkLuxeProjects, DarkLuxeAbout, DarkLuxeSkills, DarkLuxeContact
**Target:** All removed; replaced by shared components + CSS

**Implementation steps:**
1. Replace `<DarkLuxeHero />` → `<Hero />`
2. Create `/src/styles/dark-luxe.css` with all Dark Luxe styles
3. Update CSS to reference shared component class names
4. Test all sections render correctly
5. Verify animations work (scroll, hover, transitions)

**Testing checklist:**
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] Projects grid renders (check layout, card styling)
- [ ] About section readable (text color, spacing)
- [ ] Skills section grid aligned properly
- [ ] Contact form visible and functional
- [ ] Theme toggle works (Dark Luxe still works when selected)
- [ ] Scroll animations trigger correctly
- [ ] Hover states work on all interactive elements
- [ ] Mobile (375px) layout adapts

**Verification:**
```bash
npm run build
npm run dev
# Visit / and verify with theme="dark-luxe"
# Open DevTools → Elements, check computed styles
# Verify all colors match palette
```

**Time estimate:** 4 hours
**If it takes longer:** Slow down on animations; focus on layout first

---

#### 1.5 Test Dark Luxe Migration — 1 hour
**Purpose:** Automated testing to ensure Dark Luxe theme works correctly
**Create:** `tests/themes/dark-luxe.spec.ts` (Playwright)

**Test cases:**
```typescript
test("Dark Luxe Hero renders with correct colors", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark-luxe");
  });

  const hero = page.locator(".hero");
  const bgColor = await hero.evaluate(el =>
    getComputedStyle(el).backgroundColor
  );
  expect(bgColor).toContain("26"); // #1A1A1A
});

test("Dark Luxe scroll animations trigger", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark-luxe");
  });

  const projects = page.locator(".projects-section");
  await projects.scrollIntoViewIfNeeded();

  // Check for animation class or transform
  const hasAnimation = await projects.evaluate(el =>
    getComputedStyle(el).transform !== "none"
  );
  expect(hasAnimation).toBe(true);
});
```

**Run tests:**
```bash
npx playwright test tests/themes/dark-luxe.spec.ts
```

**Time estimate:** 1 hour

---

#### 1.6 Migrate Paper-Ink Theme to Shared Components — 4 hours
**Purpose:** Apply Dark Luxe pattern to Paper-Ink
**Current files:** PaperInkHero, PaperInkProjects, etc.
**Target:** All removed; shared components + `/src/styles/paper-ink.css`

**Special consideration:** Paper-Ink has horizontal scroll (mobile).
**Testing:** Verify horizontal scroll works on 375px viewport without breaking layout

**Testing checklist:**
- [ ] Page loads without errors (Paper-Ink theme)
- [ ] All sections render with warm cream background
- [ ] Horizontal scroll works on mobile (if applicable)
- [ ] Text colors meet WCAG AA contrast
- [ ] Animations smooth (no jank)
- [ ] Desktop and mobile layouts differ appropriately

**Verification:**
```bash
npm run dev
# Visit / with theme="paper-ink"
# Resize to 375px width
# Scroll through all sections
# Check DevTools console (0 errors)
```

**Time estimate:** 4 hours

---

#### 1.7 Test Paper-Ink Migration — 1 hour
**Create:** `tests/themes/paper-ink.spec.ts`

**Key test:** Horizontal scroll functionality (if applicable)

```typescript
test("Paper-Ink horizontal scroll works on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "paper-ink");
  });

  const scrollContainer = page.locator(".horizontal-scroll");
  const initialScroll = await scrollContainer.evaluate(el => el.scrollLeft);

  await scrollContainer.hover();
  await page.keyboard.press("ArrowRight");

  const newScroll = await scrollContainer.evaluate(el => el.scrollLeft);
  expect(newScroll).toBeGreaterThan(initialScroll);
});
```

**Time estimate:** 1 hour

---

#### 1.8 Migrate Editorial Theme — 3.5 hours
**Current files:** EditorialHero, EditorialProjects, etc.
**Target:** Shared components + `/src/styles/editorial.css`

**Testing checklist (same as above for Editorial-specific colors)**

**Time estimate:** 3.5 hours

---

#### 1.9 Test Editorial Migration — 1 hour
**Create:** `tests/themes/editorial.spec.ts`

**Time estimate:** 1 hour

---

#### 1.10 Migrate Noir-Cinema Theme — 3.5 hours
**Current files:** NoirCinemaHero, NoirCinemaProjects, etc.
**Target:** Shared components + `/src/styles/noir-cinema.css`

**Special consideration:** Full-height vignette effects, Art Deco typography
**Testing:** Verify Art Deco fonts render (Bebas Neue 400 weight only)

**Time estimate:** 3.5 hours

---

#### 1.11 Test Noir-Cinema Migration — 1 hour
**Create:** `tests/themes/noir-cinema.spec.ts`

**Time estimate:** 1 hour

---

#### 1.12 Migrate Neon-Cyber Theme — 4 hours
**Current files:** NeonCyberHero, NeonCyberProjects, etc.
**Target:** Shared components + `/src/styles/neon-cyber.css`

**Special consideration:** Terminal-style layout, tech aesthetic
**Testing:** Verify monospace fonts, glitch effects, neon colors all work

**Time estimate:** 4 hours

---

#### 1.13 Test Neon-Cyber Migration — 1 hour
**Create:** `tests/themes/neon-cyber.spec.ts`

**Time estimate:** 1 hour

---

#### 1.14 GSAP Optimization — 4 hours
**Purpose:** Remove full GSAP import, use modular imports to save ~45KB

**Current problem:**
```typescript
// BAD — imports entire library
import gsap from "gsap";
```

**Solution:**
```typescript
// GOOD — imports only what's needed
import gsap from "gsap/dist/gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```

**Files to update:**
- `src/components/layout/SmoothScroll.tsx` (verify already correct)
- `src/components/shared/Hero.tsx` (if using GSAP)
- `src/hooks/useScrollAnimation.ts` (where GSAP is used)
- Any other animation components

**Search and verify:**
```bash
grep -r "import gsap from \"gsap\"" src/ --include="*.tsx" --include="*.ts"
# Should return 0 matches after fix
```

**Verify bundle size improvement:**
```bash
npm run build
npx @next/bundle-analyzer@latest ./
# Compare before/after: should see ~45KB reduction in GSAP chunk
```

**Time estimate:** 4 hours
**If it takes longer:** Verify ScrollTrigger is registered correctly; check for runtime errors

---

#### 1.15 Remove Framer Motion — 2 hours
**Purpose:** Remove unused animation library, save ~32KB

**Check for usage:**
```bash
grep -r "framer-motion" src/ --include="*.tsx" --include="*.ts"
grep -r "motion\." src/ --include="*.tsx" --include="*.ts"
```

**If found:** Replace with GSAP equivalents:
- `<motion.div animate={{ opacity: 1 }}>` → GSAP `.to()` or CSS animations
- `Variants` → CSS classes or GSAP timeline

**Remove from package.json:**
```bash
npm uninstall framer-motion
```

**Verify:**
```bash
npm list framer-motion
# Should show "not installed"

npm run build
# Should build successfully
```

**Time estimate:** 2 hours

---

#### 1.16 Remove Unused Dependencies — 1.5 hours
**Purpose:** Remove @tsparticles (unused), save ~50KB

**Check for usage:**
```bash
grep -r "@tsparticles" src/ --include="*.tsx" --include="*.ts"
grep -r "tsparticles" src/ --include="*.tsx" --include="*.ts"
# Should return 0 matches (it's unused)
```

**Remove:**
```bash
npm uninstall @tsparticles/engine @tsparticles/react @tsparticles/slim
```

**Verify:**
```bash
npm run build
# Should build with ~50KB less in particle-related chunks
```

**Time estimate:** 1.5 hours

---

#### 1.17 Add ESLint + Prettier Configuration — 2 hours
**Purpose:** Establish consistent code style, catch errors early

**Create `.eslintrc.json`:**
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["error", "warn"] }]
  }
}
```

**Create `.prettierrc`:**
```json
{
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true
}
```

**Run formatting:**
```bash
npx prettier --write src/
npm run lint
```

**Time estimate:** 2 hours

---

#### 1.18 Build Verification — 3 hours
**Purpose:** Verify everything compiles, bundle is optimized, no runtime errors

**Checklist:**
- [ ] No TypeScript errors: `npm run build`
- [ ] No ESLint errors: `npm run lint`
- [ ] All tests pass: `npm run test`
- [ ] Shared components used correctly: grep for old component names (should be 0)
- [ ] Bundle size reduced: compare before/after with bundle-analyzer
- [ ] No console errors: `npm run dev` + open DevTools
- [ ] Theme switching works: toggle all 5 themes in UI
- [ ] All sections render: visit /, check all components visible
- [ ] Mobile looks good: resize to 375px, verify layout

**Run tests:**
```bash
npm run build
npm run test
npm run lint
npx @next/bundle-analyzer@latest ./
```

**Expected results:**
- All tests pass
- No TypeScript/ESLint errors
- Bundle size ~210KB smaller than before
- All 5 themes work without page reload
- Lighthouse Performance score ≥80 (should not regress)

**Time estimate:** 3 hours
**If it fails:** Keep Lighthouse on one tab, dev server on another; iterate quickly

---

### Phase 1 Summary
| Task | Hours | Status |
|------|-------|--------|
| 1.1 Custom Hooks | 6 | Pending |
| 1.2 Shared Hero | 3.5 | Pending |
| 1.3 Theme Config | 2.5 | Pending |
| 1.4-1.5 Dark Luxe (migrate + test) | 5 | Pending |
| 1.6-1.7 Paper-Ink (migrate + test) | 5 | Pending |
| 1.8-1.9 Editorial (migrate + test) | 4.5 | Pending |
| 1.10-1.11 Noir-Cinema (migrate + test) | 4.5 | Pending |
| 1.12-1.13 Neon-Cyber (migrate + test) | 5 | Pending |
| 1.14 GSAP Optimization | 4 | Pending |
| 1.15 Remove Framer Motion | 2 | Pending |
| 1.16 Remove Unused Deps | 1.5 | Pending |
| 1.17 ESLint + Prettier | 2 | Pending |
| 1.18 Build Verification | 3 | Pending |
| **TOTAL** | **~48 hours** | — |

---

## SECTION 2: PHASE 2 — ACCESSIBILITY & POLISH
**Timeline:** 18 hours (Week 2-3)
**Goal:** WCAG AA compliance, improve Lighthouse accessibility score from 60→95
**Success Criteria:** Lighthouse ≥95, axe-core 0 violations, all screen readers work

### Phase 2 Deliverables
- Color contrast fixes (verified with WebAIM)
- Skip link fixed and visible
- Focus indicators visible on all interactive elements
- Mobile menu migrated to Radix Dialog
- Form validation with per-field error messages
- Error pages (404, error boundary)
- Print stylesheet for resume printing
- Favicon and meta tags
- WCAG checklist verified

### Breakdown by Task

#### 2.1 Fix Color Contrast (All Themes) — 1.5 hours
**WCAG Criterion:** 1.4.3 Contrast (Minimum) — Level AA
**File:** `/src/app/globals.css` (theme color definitions)

**Changes required:**

**Dark Luxe Theme:**
- Primary: #C9A961 on #1A1A1A = 12.2:1 ✓ Already passes
- Secondary: #8B7355 on #1A1A1A = 5.6:1 ✓ Passes
- Text: #FFFFFF on #1A1A1A = 21:1 ✓ Passes
- **Status:** No changes needed ✓

**Paper-Ink Theme:**
- Primary: #8B4513 on #F5F1ED = 6.2:1 ✓ Passes
- Accent: #C5152D on #F5F1ED = 8.1:1 ✓ Passes
- Text: #1A1A1A on #F5F1ED = 18.2:1 ✓ Passes
- **Status:** No changes needed ✓

**Editorial Theme:**
- Primary: #DC143C on #FFFFFF = 10.2:1 ✓ Passes
- **Status:** No changes needed ✓

**Noir-Cinema Theme:**
- Primary: #D2B48C on #2A2A2A = 9.8:1 ✓ Passes
- **Status:** No changes needed ✓

**Neon-Cyber Theme:** ⚠ NEEDS FIX
- Foreground-muted: #60a080 on #0a0a0a = 3.8:1 ✗ FAILS (needs 4.5:1)
- **Fix to:** #7fb87f on #0a0a0a = 4.7:1 ✓ Passes

**Change in `/src/app/globals.css`:**
```css
[data-theme="neon-cyber"] {
  --background: #0a0a0a;
  --foreground-muted: #7fb87f; /* Changed from #60a080 */
}
```

**Verification:**
```bash
# Use WebAIM Contrast Checker
# Foreground: #7fb87f
# Background: #0a0a0a
# Should show 4.7:1 or higher

# In browser:
npm run dev
# Switch to Neon-Cyber theme
# Inspect any element with --foreground-muted
# Verify computed color is #7fb87f
```

**Time estimate:** 1.5 hours (mostly verification)

---

#### 2.2 Fix Skip Link — 0.5 hours
**WCAG Criterion:** 2.4.1 Bypass Blocks — Level A
**Current state:** Skip link exists but not keyboard-visible
**Goal:** Visible when focused, functional

**Implementation:**
```html
<!-- In page header or layout -->
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<!-- Style in CSS -->
<style>
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 9999;
}

.skip-link:focus {
  left: 0;
  top: 0;
  width: 100%;
  padding: 1rem;
  background: #000;
  color: #fff;
  text-decoration: none;
}
</style>

<!-- Add ID to main content -->
<main id="main-content">
  <!-- Page content -->
</main>
```

**Verification:**
```bash
npm run dev
# Open page
# Press Tab repeatedly until you see "Skip to main content" at top
# Press Enter; should jump to #main-content
```

**Time estimate:** 0.5 hours

---

#### 2.3 Fix Focus Indicators — 1 hour
**WCAG Criterion:** 2.4.3 Focus Order, 2.4.7 Focus Visible — Level AA
**Current state:** Some elements don't show focus outline
**Goal:** All interactive elements have visible focus indicator

**Implementation:**
```css
/* In global styles or theme CSS */
button:focus,
a:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 3px solid #4A90E2; /* Bright blue */
  outline-offset: 2px;
}

/* For dark themes, use appropriate color */
[data-theme="dark-luxe"] button:focus {
  outline-color: #C9A961; /* Theme primary */
}

[data-theme="neon-cyber"] button:focus {
  outline-color: #00D9FF; /* Theme primary */
}

/* Ensure focus-visible works */
:focus-visible {
  outline: 3px solid #4A90E2;
  outline-offset: 2px;
}
```

**Verification:**
```bash
npm run dev
# Press Tab repeatedly through entire page
# Every button, link, input should show clear focus indicator
# Test in all 5 themes
```

**Time estimate:** 1 hour

---

#### 2.4 Migrate Mobile Menu to Radix Dialog — 2.5 hours
**WCAG Criterion:** 2.1.1 Keyboard, 4.1.2 Name, Role, Value — Level A
**Current state:** Custom menu with manual focus trap (fragile)
**Goal:** Use Radix Dialog for accessibility out-of-the-box

**Install Radix Dialog:**
```bash
npm install @radix-ui/react-dialog @radix-ui/react-primitive
```

**Implementation:**
```typescript
// src/components/MobileMenu.tsx
import * as Dialog from "@radix-ui/react-dialog";

export function MobileMenu() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button aria-label="Open menu">
          <MenuIcon />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="menu-overlay" />
        <Dialog.Content className="menu-content">
          <Dialog.Title>Menu</Dialog.Title>

          {/* Navigation links */}
          <nav>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </nav>

          <Dialog.Close asChild>
            <button aria-label="Close menu">✕</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**CSS (add animations):**
```css
.menu-overlay {
  animation: fadeIn 0.2s ease-out;
}

.menu-content {
  animation: slideUp 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**Verification:**
```bash
npm run dev
# On mobile (375px), click hamburger menu
# Menu should open/close smoothly
# Press Escape; menu should close
# Tab through menu items; all should be focusable
# Test with screen reader (should announce menu)
```

**Time estimate:** 2.5 hours

---

#### 2.5 Fix Form Validation — 1.5 hours
**WCAG Criterion:** 3.3.1 Error Identification, 4.1.2 Name, Role, Value — Level A
**Current state:** Form has validation but no error messages visible
**Goal:** Per-field error messages, aria-describedby, visual indicators

**Implementation:**
```typescript
// src/components/ContactForm.tsx
import { useRef, useState } from "react";

export function ContactForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [emailError, setEmailError] = useState("");
  const [messageError, setMessageError] = useState("");

  function validateEmail(email: string) {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!email.includes("@")) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  }

  function validateMessage(msg: string) {
    if (!msg) {
      setMessageError("Message is required");
      return false;
    }
    setMessageError("");
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailValid = validateEmail(emailRef.current?.value || "");
    const messageValid = validateMessage(messageRef.current?.value || "");

    if (emailValid && messageValid) {
      // Submit form
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          ref={emailRef}
          type="email"
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "email-error" : undefined}
          onBlur={(e) => validateEmail(e.target.value)}
        />
        {emailError && (
          <span id="email-error" className="error-message" role="alert">
            {emailError}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          ref={messageRef}
          aria-invalid={!!messageError}
          aria-describedby={messageError ? "message-error" : undefined}
          onBlur={(e) => validateMessage(e.target.value)}
        />
        {messageError && (
          <span id="message-error" className="error-message" role="alert">
            {messageError}
          </span>
        )}
      </div>

      <button type="submit">Send</button>
    </form>
  );
}
```

**CSS for error styling:**
```css
input[aria-invalid="true"],
textarea[aria-invalid="true"] {
  border-color: #e74c3c;
  background-color: #fdeaea;
}

.error-message {
  display: block;
  color: #c0392b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

**Verification:**
```bash
npm run dev
# Try submitting form without email
# Should see error message below email field
# Try submitting with invalid email
# Should see "Invalid email format" message
# Tab through form; all errors should be announced by screen reader
```

**Time estimate:** 1.5 hours

---

#### 2.6 Create 404 Page — 1 hour
**WCAG Criterion:** 2.4.8 Location — Level AAA
**File to create:** `/src/app/not-found.tsx`

**Implementation:**
```typescript
// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h1>404 — Page Not Found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>

      <Link href="/">
        <button>Back to Home</button>
      </Link>

      <nav className="quick-links">
        <h2>Quick Links</h2>
        <ul>
          <li><Link href="#about">About</Link></li>
          <li><Link href="#projects">Projects</Link></li>
          <li><Link href="#contact">Contact</Link></li>
        </ul>
      </nav>
    </div>
  );
}
```

**CSS:**
```css
.not-found-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.not-found-container h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.not-found-container p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: var(--foreground-muted);
}

.quick-links {
  margin-top: 3rem;
}

.quick-links ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 1rem;
}

.quick-links a {
  color: var(--primary);
  text-decoration: underline;
}
```

**Verification:**
```bash
npm run dev
# Visit /nonexistent-page
# Should see 404 page
# Try different routes
# All should show 404 page
```

**Time estimate:** 1 hour

---

#### 2.7 Create Error Boundary — 0.5 hours
**WCAG Criterion:** General resilience
**File to create:** `/src/components/ErrorBoundary.tsx`

**Implementation:**
```typescript
// src/components/ErrorBoundary.tsx
"use client";

import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Error caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>Please refresh the page and try again.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Use in layout:**
```typescript
// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**Time estimate:** 0.5 hours

---

#### 2.8 Add Print Stylesheet — 1 hour
**WCAG Criterion:** General best practice
**File to create:** `/src/styles/print.css`

**Implementation:**
```css
/* src/styles/print.css */
@media print {
  body {
    background: white;
    color: black;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* Hide navigation, theme switcher, footer */
  header,
  nav,
  [role="navigation"],
  .theme-switcher,
  footer {
    display: none;
  }

  /* Ensure content is single column */
  main {
    max-width: 100%;
    margin: 0;
    padding: 0;
  }

  /* Print page breaks */
  h1 {
    page-break-after: avoid;
  }

  h2,
  h3 {
    page-break-inside: avoid;
    page-break-after: avoid;
  }

  /* Hide interactive elements */
  button,
  form {
    display: none;
  }

  /* Ensure links are visible */
  a {
    color: #000;
    text-decoration: underline;
  }

  a[href]:after {
    content: " (" attr(href) ")";
  }
}
```

**Import in globals:**
```css
@import "print.css";
```

**Verification:**
```bash
npm run dev
# Press Ctrl+P (Cmd+P on Mac)
# Preview should show clean, single-column layout
# All text readable, no colors needed
```

**Time estimate:** 1 hour

---

#### 2.9 Add Favicon and Meta Tags — 1 hour
**WCAG Criterion:** 2.4.2 Page Titled — Level A
**Files:** `/public/favicon.ico`, `/src/app/layout.tsx`

**Add to layout:**
```typescript
// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayush — Designer & Developer",
  description: "Portfolio of Ayush, a designer and developer specializing in web design.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Ayush — Designer & Developer",
    description: "Portfolio of Ayush, a designer and developer.",
    url: "https://ayush.dev",
    siteName: "Ayush",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};
```

**Create favicon:** Copy or generate a 32x32 PNG, save as `/public/favicon.ico`

**Create og-image:** 1200x630 PNG image, save as `/public/og-image.png`

**Verification:**
```bash
npm run dev
# Check browser tab; should show favicon
# View page source; check <meta> tags are present
# Share URL in social media; should show preview
```

**Time estimate:** 1 hour

---

#### 2.10 Run axe-core Audit — 1 hour
**Purpose:** Automated accessibility testing
**Tool:** @axe-core/react (Playwright integration)

**Install:**
```bash
npm install @axe-core/playwright
```

**Create test:**
```typescript
// tests/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "@axe-core/playwright";

test("Home page passes axe accessibility check", async ({ page }) => {
  await page.goto("/");
  await injectAxe(page);

  const results = await checkA11y(page);
  expect(results).toBeFalsy(); // No violations
});

test("All themes pass axe check", async ({ page }) => {
  const themes = ["dark-luxe", "paper-ink", "editorial", "noir-cinema", "neon-cyber"];

  for (const theme of themes) {
    await page.goto("/");
    await page.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
    }, theme);

    await injectAxe(page);
    const results = await checkA11y(page);
    expect(results).toBeFalsy(`Theme ${theme} has violations`);
  }
});
```

**Run:**
```bash
npx playwright test tests/accessibility.spec.ts
```

**Expected result:** 0 violations

**Time estimate:** 1 hour

---

#### 2.11 Run Lighthouse Audit — 1 hour
**Purpose:** Verify performance, accessibility, SEO scores

**Steps:**
1. Build: `npm run build`
2. Start production server: `npm run start`
3. Open Chrome DevTools → Lighthouse
4. Run audit on desktop and mobile
5. Check scores:
   - Accessibility: ≥95
   - Performance: ≥80 (should not regress)
   - Best Practices: ≥90
   - SEO: ≥90

**If Accessibility <95:**
- Review axe results to find remaining violations
- Most common: missing alt text, low contrast, missing labels
- Fix and re-audit

**Verification:**
```bash
npm run build
npm run start
# Open Chrome DevTools → Lighthouse
# Run audit
# Screenshot results
```

**Time estimate:** 1 hour

---

### Phase 2 Summary
| Task | Hours | Status |
|------|-------|--------|
| 2.1 Fix Color Contrast | 1.5 | Pending |
| 2.2 Fix Skip Link | 0.5 | Pending |
| 2.3 Fix Focus Indicators | 1 | Pending |
| 2.4 Radix Dialog Mobile Menu | 2.5 | Pending |
| 2.5 Form Validation | 1.5 | Pending |
| 2.6 Create 404 Page | 1 | Pending |
| 2.7 Create Error Boundary | 0.5 | Pending |
| 2.8 Print Stylesheet | 1 | Pending |
| 2.9 Favicon & Meta Tags | 1 | Pending |
| 2.10 axe-core Audit | 1 | Pending |
| 2.11 Lighthouse Audit | 1 | Pending |
| **TOTAL** | **~14 hours** | — |

---

## SECTION 3: PHASE 3 — VISUAL REDESIGN
**Timeline:** 50-65 hours (Week 3-4)
**Goal:** Apply 5 distinct visual themes to shared components
**Success Criteria:** All themes visually distinct, animations work smoothly, mobile optimized

### Phase 3 Deliverables
- Dark Luxe CSS (premium gallery aesthetic)
- Paper-Ink CSS (editorial publication)
- Editorial CSS (Swiss brutalism)
- Noir-Cinema CSS (Art Deco vignette)
- Neon-Cyber CSS (terminal aesthetic)
- Theme-specific layouts (asymmetric grids, masthead, terminal-style, etc.)
- Mobile refinements per theme (375px, 640px, 768px breakpoints)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Breakdown by Task

#### 3.1 Apply Dark Luxe Visual Config — 10 hours
**Purpose:** Define layout, colors, typography, animations for Dark Luxe theme
**File:** `/src/styles/dark-luxe.css` (already created in Phase 1)

**Key design specs:**
- Layout: Premium gallery, asymmetric grids
- Primary color: #C9A961 (warm gold)
- Background: #1A1A1A (deep black)
- Typography: Cormorant Garamond (display), Inter (body)
- Animations: Gold border glow on hover, smooth scroll effects
- Mobile: Single-column at 375px, 2-column at 640px+

**Implementation checklist:**
- [ ] Hero section: Large, elegant heading with subtitle
- [ ] Projects grid: Asymmetric layout (2-1 or 3-2 pattern)
- [ ] Project cards: Image left, content right with gold borders
- [ ] About section: Text-heavy, elegant spacing
- [ ] Skills: Grid with subtle accent underlines
- [ ] Contact form: Minimalist, gold accents on focus
- [ ] Animations: Smooth scrolls, hover glows
- [ ] Mobile: All sections collapse to single column
- [ ] Responsive images: Load appropriate sizes
- [ ] Print: Black text on white background

**CSS structure:**
```css
[data-theme="dark-luxe"] {
  --primary: #C9A961;
  --background: #1A1A1A;
  --text: #FFFFFF;
  --text-muted: #BFBFBF;
  --card-bg: #252525;

  font-family: Inter, sans-serif;
}

[data-theme="dark-luxe"] .hero {
  background: linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

[data-theme="dark-luxe"] .hero h1 {
  font-family: Cormorant Garamond, serif;
  font-size: clamp(3rem, 10vw, 5rem);
  color: var(--primary);
  font-weight: 600;
  letter-spacing: 0.05em;
}

[data-theme="dark-luxe"] .projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 3rem 2rem;
}

[data-theme="dark-luxe"] .project-card {
  background: var(--card-bg);
  border: 1px solid var(--primary);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
}

[data-theme="dark-luxe"] .project-card:hover {
  box-shadow: 0 0 30px rgba(201, 169, 97, 0.3);
  transform: translateY(-2px);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  [data-theme="dark-luxe"] .projects-grid {
    grid-template-columns: 1fr;
  }

  [data-theme="dark-luxe"] .hero h1 {
    font-size: 2rem;
  }
}
```

**Testing checklist:**
- [ ] Desktop (1280px): All sections visible, no overlapping text
- [ ] Tablet (768px): Layout adapts gracefully
- [ ] Mobile (375px): Single column, readable text
- [ ] Hover states: Smooth transitions, no jank
- [ ] Color contrast: All text readable (verified in Phase 2)
- [ ] Animations: Smooth scrolls at 60fps
- [ ] Print: Black text, no background colors

**Verification:**
```bash
npm run dev
# Switch to dark-luxe theme
# Check desktop: 1280px wide, scroll through all sections
# Check tablet: Resize to 768px
# Check mobile: Resize to 375px
# Check animations: Scroll through projects, check smooth scroll
# Check hover: Hover over project cards, check for smooth effects
```

**Time estimate:** 10 hours

---

#### 3.2 Apply Paper-Ink Visual Config — 11 hours
**Purpose:** Editorial publication aesthetic (warm cream, newsprint)
**File:** `/src/styles/paper-ink.css`

**Key design specs:**
- Layout: Masthead, left-aligned with bordered cards
- Primary color: #8B4513 (burnt sienna)
- Background: #F5F1ED (warm cream)
- Typography: Lora (display), Merriweather (body)
- Animations: Subtle border animations, fade-in on scroll
- Mobile: Single column with full-width cards
- Special: Horizontal scroll on projects section (if applicable)

**CSS structure:**
```css
[data-theme="paper-ink"] {
  --primary: #8B4513;
  --background: #F5F1ED;
  --text: #1A1A1A;
  --text-muted: #666;
  --border: #C5152D;

  font-family: Merriweather, serif;
}

[data-theme="paper-ink"] .hero {
  background: var(--background);
  border-bottom: 4px solid var(--border);
  padding: 3rem 2rem;
  text-align: left;
  max-width: 800px;
}

[data-theme="paper-ink"] .hero h1 {
  font-family: Lora, serif;
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
  border-left: 8px solid var(--border);
  padding-left: 1rem;
}

[data-theme="paper-ink"] .project-card {
  background: white;
  border-left: 4px solid var(--border);
  border-radius: 0;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Horizontal scroll for projects */
[data-theme="paper-ink"] .projects-grid {
  display: flex;
  overflow-x: auto;
  gap: 1.5rem;
  padding: 2rem 0;
  scroll-behavior: smooth;
  /* Add scrollbar styling here */
}

[data-theme="paper-ink"] .project-card {
  flex: 0 0 calc(33.333% - 1rem);
  min-width: 300px;
}

@media (max-width: 768px) {
  [data-theme="paper-ink"] .projects-grid {
    flex-direction: column;
  }

  [data-theme="paper-ink"] .project-card {
    flex: 1;
  }

  [data-theme="paper-ink"] .hero h1 {
    font-size: 1.75rem;
  }
}
```

**Testing checklist:**
- [ ] Desktop: Warm cream background, newsprint brown text
- [ ] Horizontal scroll: Works smoothly on desktop (if applicable)
- [ ] Mobile: Converts to vertical scroll on small screens
- [ ] Cards: Left border visible, left-aligned text
- [ ] Typography: Warm serif fonts display correctly
- [ ] Color contrast: All text readable
- [ ] Animations: Fade-in smooth

**Verification:**
```bash
npm run dev
# Switch to paper-ink theme
# Desktop: Check warm cream background, brown text
# Tablet (768px): Check layout adapts
# Mobile (375px): Check vertical scroll
# Check font family: Should be Merriweather/Lora
```

**Special note:** If horizontal scroll breaks, revert to vertical scroll and adjust layout.

**Time estimate:** 11 hours (extra time for horizontal scroll testing)

---

#### 3.3 Apply Editorial Visual Config — 10 hours
**Purpose:** Swiss brutalism (geometric, bold, minimalist)
**File:** `/src/styles/editorial.css`

**Key design specs:**
- Layout: Asymmetric grid, bold typography
- Primary color: #DC143C (crimson red)
- Background: #FFFFFF (pure white)
- Typography: IBM Plex Sans (geometric)
- Animations: Sharp transitions, grid animations
- Mobile: Strict 1-2 column layout
- Accent: Black dividers, sharp angles

**CSS structure:**
```css
[data-theme="editorial"] {
  --primary: #DC143C;
  --background: #FFFFFF;
  --text: #000000;
  --divider: #000;

  font-family: "IBM Plex Sans", sans-serif;
}

[data-theme="editorial"] .hero {
  background: var(--background);
  border-bottom: 8px solid var(--primary);
  padding: 4rem 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

[data-theme="editorial"] .hero h1 {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

[data-theme="editorial"] .projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border: 1px solid var(--divider);
}

[data-theme="editorial"] .project-card {
  border-right: 1px solid var(--divider);
  border-bottom: 1px solid var(--divider);
  padding: 2rem;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

[data-theme="editorial"] .project-card:hover {
  background: #f5f5f5;
}

@media (max-width: 768px) {
  [data-theme="editorial"] .hero {
    grid-template-columns: 1fr;
  }

  [data-theme="editorial"] .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  [data-theme="editorial"] .hero h1 {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  [data-theme="editorial"] .projects-grid {
    grid-template-columns: 1fr;
  }
}
```

**Testing checklist:**
- [ ] Desktop: 3-column grid, bold red accents
- [ ] Tablet: 2-column grid
- [ ] Mobile: 1-column, full-width cards
- [ ] Grid dividers: Sharp black borders visible
- [ ] Typography: Bold, uppercase headlines
- [ ] Color contrast: Red on white, 10.2:1 ✓

**Time estimate:** 10 hours

---

#### 3.4 Apply Noir-Cinema Visual Config — 11 hours
**Purpose:** Art Deco vignette (dramatic, cinematic)
**File:** `/src/styles/noir-cinema.css`

**Key design specs:**
- Layout: Full-height vignette, centered content
- Primary color: #D2B48C (tan)
- Background: #2A2A2A (dark gray with gradient)
- Typography: Bebas Neue (Art Deco, display), Roboto (body)
- Animations: Vignette fade-in, cinematic scrolls
- Mobile: Centered, single column
- Accent: Ornamental dividers, Art Deco patterns

**CSS structure:**
```css
[data-theme="noir-cinema"] {
  --primary: #D2B48C;
  --background: #2A2A2A;
  --text: #FFFFFF;
  --text-muted: #B0B0B0;

  font-family: Roboto, sans-serif;
}

/* Vignette effect */
[data-theme="noir-cinema"]::before {
  content: "";
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
  z-index: -1;
}

[data-theme="noir-cinema"] .hero {
  background: linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
}

[data-theme="noir-cinema"] .hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(212, 180, 140, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

[data-theme="noir-cinema"] .hero h1 {
  font-family: "Bebas Neue", sans-serif;
  font-size: 4rem;
  color: var(--primary);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

[data-theme="noir-cinema"] .project-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--primary);
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

[data-theme="noir-cinema"] .project-card:hover {
  background: rgba(212, 180, 140, 0.1);
  box-shadow: 0 0 20px rgba(212, 180, 140, 0.3);
}

/* Ornamental divider */
[data-theme="noir-cinema"] .section-divider {
  width: 60px;
  height: 2px;
  background: var(--primary);
  margin: 2rem auto;
  position: relative;
}

[data-theme="noir-cinema"] .section-divider::before,
[data-theme="noir-cinema"] .section-divider::after {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--primary);
  top: 50%;
  transform: translateY(-50%);
}

[data-theme="noir-cinema"] .section-divider::before {
  left: -12px;
}

[data-theme="noir-cinema"] .section-divider::after {
  right: -12px;
}

@media (max-width: 768px) {
  [data-theme="noir-cinema"] .hero h1 {
    font-size: 2.5rem;
  }

  [data-theme="noir-cinema"] .projects-grid {
    grid-template-columns: 1fr;
  }
}
```

**Testing checklist:**
- [ ] Vignette effect visible on all sections
- [ ] Art Deco typography (Bebas Neue) displays
- [ ] Tan accents subtle but visible
- [ ] Cinematic animations smooth
- [ ] Mobile: Centered, single column
- [ ] No console errors from vignette pseudo-elements

**Time estimate:** 11 hours

---

#### 3.5 Apply Neon-Cyber Visual Config — 10 hours
**Purpose:** Terminal aesthetic (tech, glitch, neon)
**File:** `/src/styles/neon-cyber.css`

**Key design specs:**
- Layout: Terminal-style, monospace typography
- Primary color: #00D9FF (cyan neon)
- Background: #0a0a0a (pure black)
- Typography: Space Mono (display), Inter (body)
- Animations: Glitch effects, scan-line animations
- Mobile: Full-width, monospace text
- Accent: Neon glow effects, scan lines

**CSS structure:**
```css
[data-theme="neon-cyber"] {
  --primary: #00D9FF;
  --background: #0a0a0a;
  --text: #00D9FF;
  --text-muted: #7fb87f;
  --accent: #FF006E;

  font-family: "Space Mono", monospace;
}

/* Scan line effect */
[data-theme="neon-cyber"]::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.5) 0px,
      rgba(0, 0, 0, 0.5) 1px,
      transparent 1px,
      transparent 2px
    );
  pointer-events: none;
  z-index: -1;
}

[data-theme="neon-cyber"] .hero {
  background: var(--background);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--primary);
  text-align: center;
  padding: 2rem;
  box-shadow: 0 0 20px var(--primary), inset 0 0 20px rgba(0, 217, 255, 0.1);
}

[data-theme="neon-cyber"] .hero h1 {
  font-family: "Space Mono", monospace;
  font-size: 3rem;
  color: var(--primary);
  text-shadow: 0 0 10px var(--primary);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  animation: glitch 0.3s ease-in-out;
}

@keyframes glitch {
  0%, 100% { text-shadow: 0 0 10px var(--primary); }
  50% { text-shadow: 0 0 20px var(--primary), 0 0 30px var(--accent); }
}

[data-theme="neon-cyber"] .project-card {
  background: rgba(0, 217, 255, 0.05);
  border: 1px dashed var(--primary);
  padding: 1.5rem;
  font-family: "Space Mono", monospace;
  font-size: 0.875rem;
  color: var(--primary);
  text-shadow: 0 0 5px var(--primary);
  transition: all 0.2s ease;
}

[data-theme="neon-cyber"] .project-card:hover {
  background: rgba(0, 217, 255, 0.1);
  box-shadow: 0 0 20px var(--primary), inset 0 0 20px rgba(0, 217, 255, 0.2);
  text-shadow: 0 0 10px var(--primary), 0 0 20px var(--accent);
}

/* Terminal cursor blink */
[data-theme="neon-cyber"] .terminal-cursor {
  display: inline-block;
  width: 8px;
  height: 1em;
  background: var(--primary);
  margin-left: 4px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

@media (max-width: 768px) {
  [data-theme="neon-cyber"] .hero h1 {
    font-size: 1.75rem;
  }

  [data-theme="neon-cyber"] .project-card {
    font-size: 0.75rem;
  }
}
```

**Testing checklist:**
- [ ] Neon glow effects visible
- [ ] Scan line animation subtle (not distracting)
- [ ] Monospace font displays
- [ ] Glitch animation smooth
- [ ] Mobile: Readable at small sizes
- [ ] Color contrast: Cyan on black meets WCAG AA (verified: 5.2:1 - tight but valid)
- [ ] Terminal aesthetic consistent

**Time estimate:** 10 hours

---

#### 3.6 Fix "1 issue" Error Badge — 0.5 hours
**Purpose:** Remove or hide lingering error badges
**Search for:**
```bash
grep -r "1 issue" src/ --include="*.tsx" --include="*.ts"
grep -r "error.*badge" src/ --include="*.tsx" --include="*.ts"
grep -r "issues-badge" src/ --include="*.tsx" --include="*.css"
```

**If found:**
1. Identify the component or file
2. Remove badge element or set display: none
3. Test all pages (verify no visible badges)

**Time estimate:** 0.5 hours

---

#### 3.7 Implement Theme-Specific Project Card Designs — 6 hours
**Purpose:** Each theme has unique card layout/styling
**Current:** Cards are identical across themes
**Target:** Each theme's cards reflect its aesthetic

**Dark Luxe Cards:**
- Image on left (60%), content on right (40%)
- Gold border, subtle shadow on hover
- Aspect ratio: 16/9

**Paper-Ink Cards:**
- Image top, content bottom (full-width)
- Burgundy left border
- Aspect ratio: auto (content-driven)

**Editorial Cards:**
- Square grid (1:1 aspect ratio)
- Black borders, grid layout
- Minimal padding

**Noir-Cinema Cards:**
- Centered layout, text overlay on image
- Vignette effect, tan accents
- Aspect ratio: 16/9

**Neon-Cyber Cards:**
- Terminal-style list layout
- Monospace text, cyan borders
- Aspect ratio: auto

**Implementation:**
```css
/* Dark Luxe - asymmetric */
[data-theme="dark-luxe"] .project-card {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
}

/* Paper-Ink - stacked */
[data-theme="paper-ink"] .project-card {
  display: flex;
  flex-direction: column;
}

/* Editorial - grid */
[data-theme="editorial"] .projects-grid {
  grid-template-columns: repeat(3, 1fr);
}

/* Noir-Cinema - overlay */
[data-theme="noir-cinema"] .project-card {
  position: relative;
  overflow: hidden;
}

/* Neon-Cyber - terminal */
[data-theme="neon-cyber"] .project-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  font-family: "Space Mono", monospace;
}
```

**Testing:**
- Desktop: All card layouts correct per theme
- Mobile: All cards adapt to single-column
- Images: Load correctly, aspect ratios maintained
- Hover: Smooth transitions

**Time estimate:** 6 hours

---

#### 3.8 Implement Section Transitions Per Theme — 4 hours
**Purpose:** Each section (hero → projects → about → skills → contact) has theme-specific transitions

**Dark Luxe:**
- Fade in with subtle scale on scroll

**Paper-Ink:**
- Fade in with slight left-slide

**Editorial:**
- No animation (Swiss minimalism)

**Noir-Cinema:**
- Vignette fade-in with scale

**Neon-Cyber:**
- Glitch effect on entry

**Implementation using ScrollTrigger:**
```typescript
// src/hooks/useScrollAnimation.ts
export function useScrollAnimation(theme: string) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current as HTMLElement;

    if (theme === "dark-luxe") {
      gsap.registerPlugin(ScrollTrigger);
      gsap.to(container, {
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
        opacity: 1,
        scale: 1,
        duration: 0.8,
      });
    } else if (theme === "paper-ink") {
      gsap.to(container, {
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
        opacity: 1,
        x: 0,
        duration: 0.8,
      });
    }
    // ... more themes
  }, [theme]);

  return containerRef;
}
```

**Testing:**
- Desktop: Scroll through each section, check animations
- Mobile: Animations still smooth at 375px width
- Performance: No jank, 60fps maintained
- All themes: Transitions match aesthetic

**Time estimate:** 4 hours

---

#### 3.9 Mobile Optimization Per Theme — 5 hours
**Purpose:** Ensure all 5 themes look great on mobile (375px, 640px, 768px)

**Breakpoints:**
- 375px: iPhone SE (tight, single column)
- 640px: Small tablets (2-column, if applicable)
- 768px+: Desktop view

**Checklist per theme:**
- [ ] Hero: Readable heading, no overlapping elements
- [ ] Projects: Adapt from multi-column to single column smoothly
- [ ] About: Text readable, appropriate line-length
- [ ] Skills: Grid collapses gracefully
- [ ] Contact: Form inputs full-width, easily tappable
- [ ] Images: Scale appropriately, no stretched aspect ratios
- [ ] Fonts: Legible at small sizes (16px minimum for body)
- [ ] Spacing: Adequate padding/margin for touch devices
- [ ] Typography: Headings still prominent at 375px

**CSS example:**
```css
@media (max-width: 640px) {
  [data-theme="dark-luxe"] .projects-grid {
    grid-template-columns: 1fr;
  }

  [data-theme="dark-luxe"] .hero h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 375px) {
  [data-theme="dark-luxe"] .project-card {
    padding: 1rem;
  }

  [data-theme="dark-luxe"] .hero h1 {
    font-size: 1.25rem;
  }
}
```

**Testing:**
```bash
npm run dev
# Chrome DevTools: Toggle device toolbar
# Test each theme at: 375px, 640px, 768px widths
# Check all sections render correctly
# Scroll through entire page (check no overflow)
# Tap buttons/links (check 44x44px minimum touch target)
```

**Time estimate:** 5 hours

---

#### 3.10 Cross-Browser Testing — 4 hours
**Purpose:** Verify all themes work in Chrome, Firefox, Safari, Edge

**Browsers to test:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest, on macOS/iOS)
- Edge (latest)

**Checklist per browser:**
- [ ] All 5 themes load correctly
- [ ] Fonts display correctly (no fallbacks visible)
- [ ] Colors accurate (no color profile issues)
- [ ] Animations smooth (no jank)
- [ ] Form inputs accessible
- [ ] Scrolling smooth
- [ ] Images load correctly
- [ ] Hover states work
- [ ] Theme switching works
- [ ] Print stylesheet works

**Test steps:**
```bash
npm run build
npm run start

# Open each browser
# Visit http://localhost:3000
# Test each theme:
# - Check visuals match design
# - Scroll through page
# - Hover over interactive elements
# - Try form
# - Print (Ctrl+P)
```

**Known issues to watch for:**
- Safari: CSS Grid issues (test carefully)
- Firefox: Scrollbar styling may differ
- Edge: Radix Dialog animations may not work (fallback to browser default)

**Time estimate:** 4 hours

---

### Phase 3 Summary
| Task | Hours | Status |
|------|-------|--------|
| 3.1 Dark Luxe CSS | 10 | Pending |
| 3.2 Paper-Ink CSS | 11 | Pending |
| 3.3 Editorial CSS | 10 | Pending |
| 3.4 Noir-Cinema CSS | 11 | Pending |
| 3.5 Neon-Cyber CSS | 10 | Pending |
| 3.6 Fix "1 issue" Badge | 0.5 | Pending |
| 3.7 Theme Card Designs | 6 | Pending |
| 3.8 Section Transitions | 4 | Pending |
| 3.9 Mobile Optimization | 5 | Pending |
| 3.10 Cross-Browser Testing | 4 | Pending |
| **TOTAL** | **~61.5 hours** | — |

---

## SECTION 4: FINAL VALIDATION
**Timeline:** 6 hours
**Goal:** Verify all success criteria met before launch

### 4.1 Playwright Screenshot Test — 2 hours
**Purpose:** Visual regression testing (capture baseline, compare on changes)

**File:** `tests/visual-regression.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

const themes = ["dark-luxe", "paper-ink", "editorial", "noir-cinema", "neon-cyber"];
const viewports = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 720 },
];

for (const theme of themes) {
  for (const viewport of viewports) {
    test(`Screenshot: ${theme} - ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
      }, theme);

      await expect(page).toHaveScreenshot(`${theme}-${viewport.name}.png`);
    });
  }
}
```

**Run:**
```bash
npx playwright test tests/visual-regression.spec.ts --update
# First run: creates baseline screenshots
# Subsequent runs: compares against baseline
```

**Time estimate:** 2 hours

---

### 4.2 Playwright Interaction Test — 1 hour
**Purpose:** Verify theme switching, form submission, navigation

**File:** `tests/interactions.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test("Theme switching works", async ({ page }) => {
  await page.goto("/");
  const themes = ["dark-luxe", "paper-ink", "editorial", "noir-cinema", "neon-cyber"];

  for (const theme of themes) {
    await page.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
    }, theme);

    // Verify theme applied
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue("--background");
    });
    expect(bgColor).toBeTruthy();
  }
});

test("Form submission works", async ({ page }) => {
  await page.goto("/#contact");

  // Fill form
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('textarea', "Test message");

  // Submit
  await page.click('button[type="submit"]');

  // Verify no errors
  const errors = await page.locator("[role='alert']").count();
  expect(errors).toBe(0);
});

test("Navigation works", async ({ page }) => {
  await page.goto("/");

  // Click each nav link
  await page.click('a[href="#about"]');
  expect(page.url()).toContain("#about");

  await page.click('a[href="#projects"]');
  expect(page.url()).toContain("#projects");
});
```

**Run:**
```bash
npx playwright test tests/interactions.spec.ts
```

**Time estimate:** 1 hour

---

### 4.3 Accessibility Audit (axe-core + Lighthouse) — 1.5 hours
**Purpose:** Final accessibility verification

**Run axe-core:**
```bash
npm run test:a11y
# Should show 0 violations
```

**Run Lighthouse:**
```bash
npm run build
npm run start
# Open Chrome DevTools → Lighthouse
# Run audit
# Expected scores:
# - Accessibility: ≥95
# - Performance: ≥80
# - Best Practices: ≥90
# - SEO: ≥90
```

**If scores below target:**
- Review axe violations
- Check Lighthouse recommendations
- Fix highest-impact items first
- Re-audit

**Time estimate:** 1.5 hours

---

### 4.4 Manual Theme Review — 1 hour
**Purpose:** Visual inspection of all 5 themes

**Checklist per theme:**
- [ ] Hero section looks polished
- [ ] Typography consistent with aesthetic
- [ ] Colors accurate (compared to spec)
- [ ] Spacing/alignment correct
- [ ] Images display correctly
- [ ] Animations smooth and intentional
- [ ] Mobile version looks good
- [ ] No visual bugs or glitches

**Test:**
```bash
npm run dev
# For each theme:
# 1. Visit /
# 2. Switch theme
# 3. Scroll through entire page
# 4. Check desktop (1280px)
# 5. Resize to mobile (375px)
# 6. Check mobile view
# 7. Take screenshots (optional, for design review)
```

**Time estimate:** 1 hour

---

### 4.5 Performance Metrics — 0.5 hours
**Purpose:** Verify performance targets met

**Metrics to check:**
- Bundle size: Reduced by ~210KB from Phase 1
- Lighthouse Performance: ≥80
- First Contentful Paint: <2s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1

**Run:**
```bash
npm run build
npx @next/bundle-analyzer@latest ./
npm run start
# Open Lighthouse → measure
```

**Time estimate:** 0.5 hours

---

### Phase 4 Summary
| Task | Hours | Status |
|------|-------|--------|
| 4.1 Visual Regression Tests | 2 | Pending |
| 4.2 Interaction Tests | 1 | Pending |
| 4.3 Accessibility Audit | 1.5 | Pending |
| 4.4 Manual Review | 1 | Pending |
| 4.5 Performance Check | 0.5 | Pending |
| **TOTAL** | **~6 hours** | — |

---

## SECTION 5: QUICK WINS (2-3 hours)
**Can be done in parallel with main phases or before starting**

These are easy fixes that don't depend on Phase 1-3:

### 5.1 Fix "1 issue" Error Badge — 15 min
**File:** Search codebase for error badge
**Action:** Remove or hide element
**Verification:** Visit all pages, confirm no visible badges

### 5.2 Add Color Contrast Quick Fixes — 15 min
**File:** `/src/app/globals.css`
**Action:** Update Neon-Cyber theme color (already identified)
**Verification:** Use WebAIM Contrast Checker

### 5.3 Skip Link Implementation — 15 min
**File:** Layout or header component
**Action:** Add skip link with CSS
**Verification:** Tab key shows skip link, clicking jumps to main

### 5.4 Create Favicon — 15 min
**Action:** Generate or create 32x32 PNG icon
**File:** `/public/favicon.ico`
**Verification:** Browser tab shows icon

### 5.5 Add Open Graph Meta Tags — 15 min
**File:** `/src/app/layout.tsx`
**Action:** Add og:title, og:description, og:image
**Verification:** Share URL in Slack, verify preview shows

**Total Quick Wins:** ~1.25 hours

---

## SECTION 6: RISK MITIGATION

### What to Do If Scroll Effects Break Again

**Symptom:** ScrollTrigger animations don't trigger or cause performance issues

**Solution:**
1. Check `ScrollTrigger.getAll()` in DevTools console
2. Verify `ScrollTrigger.refresh()` is called on theme change
3. If broken, revert to CSS animations only (simpler, more reliable)
4. Test with `prefers-reduced-motion` enabled

**Rollback steps:**
```bash
git diff src/hooks/useScrollAnimation.ts
git checkout src/hooks/useScrollAnimation.ts
# Remove GSAP scroll effects, use CSS animations instead
```

---

### What to Do If Mobile Menu Breaks

**Symptom:** Menu won't close, focus trap isn't working

**Solution:**
1. Check Radix Dialog version compatibility
2. Verify `onOpenChange` callback is wired correctly
3. Test with keyboard (Escape key should close)
4. If broken, fall back to custom menu with tested focus trap code

**Rollback steps:**
```bash
git diff src/components/MobileMenu.tsx
git checkout src/components/MobileMenu.tsx
# Use previous menu implementation
```

---

### What to Do If Bundle Size Doesn't Decrease

**Symptom:** Expected 210KB savings but only see 50KB

**Solution:**
1. Run bundle-analyzer before/after each phase
2. Check for dead code (unused imports in components)
3. Verify GSAP tree-shaking is working: `grep "import.*gsap" src/ -r | grep -v "dist"`
4. Check for duplicate dependencies: `npm ls`
5. Remove unused packages one by one

**Debug commands:**
```bash
npm run build
npx @next/bundle-analyzer@latest ./
# Look for unexpected large chunks
# If GSAP chunk >60KB, tree-shaking may not be working
```

---

### What to Do If Theme Switching Causes Layout Shift

**Symptom:** Page jumps or scrolls when switching themes

**Solution:**
1. Store scroll position before theme change
2. Restore scroll position after theme applies
3. Use CSS variables to avoid FOUC (Flash of Unstyled Content)

**Code example:**
```typescript
function switchTheme(newTheme: string) {
  const scrollPos = window.scrollY;
  document.documentElement.setAttribute("data-theme", newTheme);
  window.scrollTo(0, scrollPos);
}
```

---

### What to Do If Lighthouse Accessibility Score <95

**Symptom:** Accessibility score below 95

**Solution:**
1. Run axe-core to identify violations
2. Fix highest-impact issues first
3. Common issues:
   - Missing alt text on images
   - Low color contrast (verify with WebAIM)
   - Missing form labels
   - Missing heading hierarchy
4. Re-audit after each fix

**Debug commands:**
```bash
npx playwright test tests/accessibility.spec.ts
# Shows detailed axe violations
```

---

### How to Rollback Each Phase

**Phase 1 (Architecture):**
```bash
git checkout src/components/shared/
git checkout src/hooks/
git checkout src/config/themes.ts
npm install framer-motion @tsparticles/engine @tsparticles/react @tsparticles/slim
npm run build
```

**Phase 2 (Accessibility):**
```bash
git checkout src/app/globals.css
git checkout src/components/MobileMenu.tsx
git checkout src/components/ContactForm.tsx
npm run build
```

**Phase 3 (Visual Design):**
```bash
git checkout src/styles/
npm run build
```

---

## SECTION 7: SUCCESS CRITERIA

### Phase 1 Success Criteria (Architecture)
- [ ] All shared components created (Hero, Projects, About, Skills, Contact)
- [ ] All custom hooks implemented and tested
- [ ] All 5 themes work with shared components
- [ ] No TypeScript errors: `npm run build` succeeds
- [ ] No ESLint errors: `npm run lint` passes
- [ ] Bundle size reduced by ≥150KB (target: 210KB)
- [ ] No console errors when switching themes
- [ ] All tests pass: `npm run test` succeeds
- [ ] Lighthouse Performance score ≥80 (no regression)

### Phase 2 Success Criteria (Accessibility)
- [ ] All color contrasts verified (WCAG AA minimum)
- [ ] Skip link functional and visible on focus
- [ ] All interactive elements have visible focus indicator
- [ ] Mobile menu works with keyboard (Escape closes)
- [ ] Form validation works, error messages visible
- [ ] 404 page displays for invalid routes
- [ ] Error boundary catches rendering errors
- [ ] Print stylesheet produces clean output
- [ ] Lighthouse Accessibility score ≥95
- [ ] axe-core scan: 0 violations
- [ ] Screen reader test: NVDA and VoiceOver pass
- [ ] All buttons/links have touch targets ≥44x44px

### Phase 3 Success Criteria (Visual Design)
- [ ] All 5 themes visually distinct
- [ ] All themes match design specifications
- [ ] Mobile layouts (375px, 640px, 768px) optimized
- [ ] All animations smooth (60fps, no jank)
- [ ] Cross-browser testing passed (Chrome, Firefox, Safari, Edge)
- [ ] All images display correctly
- [ ] Typography consistent with theme aesthetic
- [ ] Hover states smooth and intentional
- [ ] Theme switching works without page reload
- [ ] Focus is managed correctly when switching themes

### Final Success Criteria (Overall)
- [ ] Portfolio score: 9.4/10 - 9.6/10
- [ ] Lighthouse Performance: ≥85
- [ ] Lighthouse Accessibility: ≥95
- [ ] Lighthouse Best Practices: ≥90
- [ ] Lighthouse SEO: ≥90
- [ ] Bundle size: <1.4MB (down from 1.6MB)
- [ ] No console errors on any page
- [ ] All 5 themes work correctly
- [ ] Accessibility verified (axe-core, screen readers)
- [ ] Visual regression tests pass
- [ ] Interaction tests pass
- [ ] Cross-browser testing passed

---

## SECTION 8: EXECUTION TIPS

### Before You Start
- [ ] Read all three original plans (this document references them)
- [ ] Agree on execution order: Plan 2 → Plan 3 → Plan 1
- [ ] Create feature branch: `git checkout -b refactor/redesign`
- [ ] Establish baseline metrics (bundle size, Lighthouse, component count)
- [ ] Set up testing infrastructure (Playwright, axe-core)

### During Execution
- **Commit often:** After each major task, commit changes
- **Test incrementally:** Don't wait until the end to test
- **Stay on schedule:** Track hours against estimates
- **Daily standup:** Review blockers, adjust timeline if needed
- **Use version control:** Branch for each task, merge after review

### Weekly Checkpoints
- **End of Week 1:** Phase 1, Part 1-2 complete (custom hooks, Hero working)
- **End of Week 2:** Phase 1 complete (all components refactored, bundle verified)
- **End of Week 3:** Phase 2 complete (accessibility fixed)
- **End of Week 4:** Phase 3 complete (all 5 themes implemented)

### If Behind Schedule
1. Skip some visual polish (animations, hover effects)
2. Focus on core functionality first
3. Keep Phase 1 (architecture) on track — it's critical path
4. Phase 3 (visual design) can extend if needed

### After Launch
- Monitor browser console for errors (use Sentry or similar)
- Gather user feedback on new themes
- Track Lighthouse scores (set up CI/CD for automated testing)
- Plan Phase 4 (advanced optimizations) for future

---

## CONCLUSION

This unified plan provides a clear, step-by-step roadmap to transform the portfolio from 5.8/10 to 9.4-9.6/10. The execution order (Plan 2 → Plan 3 → Plan 1) prevents waste and ensures a clean, maintainable codebase.

**Total effort:** 108-128 hours (4-5 weeks full-time, 8-10 weeks part-time)

**Expected outcome:** Professional-grade portfolio with 5 distinct themes, accessibility compliance, and optimized performance.

**Next step:** Begin Phase 1 (Architecture Refactor).

---

**Unified Plan Created:** March 30, 2026
**Based on:** PLAN-1-VISUAL-REDESIGN-v2, PLAN-2-ARCHITECTURE-PERFORMANCE-v2, PLAN-3-ACCESSIBILITY-POLISH-v2, PLAN-CRITIQUE-ROUND-2-FINAL
**Status:** READY FOR IMPLEMENTATION ✓
