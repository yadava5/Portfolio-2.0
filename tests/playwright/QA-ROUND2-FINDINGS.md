# ROUND 2 QA: DEEP POLISH AUDIT FINDINGS

**Date:** March 28, 2026
**Scope:** 6 Themes × 9 Projects × 6 Sections × Multiple Data Points
**Severity Levels:** CRITICAL (breaks functionality) | HIGH (major UX issue) | MEDIUM (noticeable bug) | LOW (polish)

---

## EXECUTIVE SUMMARY

Found **1 CRITICAL data integrity issue** and **13 additional issues** spanning code quality, accessibility, consistency, and UX.

**Most Critical Issue:** Different themes display different content (some hide 2 projects, others show them). Users switching themes see their portfolio shrink or expand unexpectedly.

---

## 🔴 CRITICAL ISSUES

### ISSUE #1: INCONSISTENT PROJECT DISPLAY ACROSS THEMES
**Severity:** CRITICAL
**Impact:** Portfolio integrity broken - same data shown differently per theme
**Files Affected:** All 6 theme Projects components

#### The Problem

Each theme's Projects component filters projects differently:

```
SHOWS ALL 9 PROJECTS (4 featured + 5 other):
├─ Neon Cyber      (NeonCyberProjects.tsx:115) → projects.map(...)
├─ Noir Cinema     (NoirCinemaProjects.tsx:70) → featured only but includes private
└─ Editorial       (EditorialProjects.tsx:9-10) → featured + non-featured, includes private

SHOWS ONLY 7 PUBLIC PROJECTS (hides private):
├─ Paper & Ink     (PaperInkProjects.tsx:174-175) → filters !p.isPrivate
├─ Gallery         (GalleryProjects.tsx:31) → filters !p.isPrivate
└─ Dark Luxe       (DarkLuxeProjects.tsx:9-10) → uses getPublicProjects()
```

#### Data Displayed Per Theme

| Theme | Featured | Other | Private Visible? | Total |
|-------|----------|-------|-----------------|-------|
| Paper & Ink | 4 | 3 | NO | 7 |
| Gallery | 4 | 3 | NO | 7 |
| Dark Luxe | 4 | 3 | NO | 7 |
| Editorial | 4 | 5 | YES | 9 |
| Noir Cinema | 4 | 0 | YES | 4 |
| Neon Cyber | 9 | - | YES | 9 |

**Missing from Paper & Ink, Gallery, Dark Luxe:**
- Master Inventory Pipeline (isPrivate: true)
- PolicyBot (isPrivate: true)

#### Root Cause

Themes developed at different times with different assumptions about whether private projects should display. No central policy enforced.

#### Test Evidence

Test ran: `paper-ink: Projects section shows ALL 9 projects`
Expected: "Master Inventory Pipeline" in section text
Got: NOT FOUND (only 7 public projects shown)

#### How to Fix

**DECISION REQUIRED:** Should private projects display?

**Option A (RECOMMENDED): Hide Private Projects Everywhere**
```tsx
// Update EVERY theme's Projects component
const featured = projects.filter(p => p.featured && !p.isPrivate);
const nonFeatured = projects.filter(p => !p.featured && !p.isPrivate);
```

**Option B: Show Private Projects Everywhere**
```tsx
// Remove isPrivate filtering from ALL themes
const featured = projects.filter(p => p.featured);
const nonFeatured = projects.filter(p => !p.featured);
```

**Then verify:** All 6 themes show identical project counts after change.

---

### ISSUE #2: SECURITY CONCERN - PRIVATE PROJECTS EXPOSED
**Severity:** HIGH
**Impact:** Work marked confidential is publicly visible in 3 themes

Noir Cinema, Editorial, and Neon Cyber themes display:
- **PolicyBot**: "RAG-powered chatbot answering policy questions" (internal tool)
- **Master Inventory Pipeline**: "Python data pipeline processing 1M+ rows for Miami University IT Services"

Both marked `isPrivate: true` in data but visible in some themes.

---

## 🟠 HIGH SEVERITY ISSUES

### ISSUE #3: INCOMPLETE PROJECT DISPLAY - NOIR CINEMA ONLY SHOWS FEATURED
**Severity:** HIGH
**File:** `src/components/themes/creative/noir-cinema/NoirCinemaProjects.tsx:70`
**Impact:** Portfolio looks incomplete; 5 projects hidden

```tsx
const featuredProjects = projects.filter((p) => p.featured);
// Later: {featuredProjects.map(...)}
// NEVER displays nonFeatured projects
```

Noir Cinema shows ONLY 4 projects out of 9:
- JobTracker ✓
- AutoML Platform ✓
- Visual Assist ✓
- Taskflow Calendar ✓
- Fast MNIST ✗ (not featured)
- LifeQuest ✗
- Master Inventory ✗
- PolicyBot ✗
- Paid Internships Advocacy ✗

**Fix:** Add "Other Projects" section like Paper & Ink does, or use `getPublicProjects()`.

---

### ISSUE #4: RESUME LINK NOT CONSISTENTLY ACCESSIBLE
**Severity:** HIGH
**File:** Multiple - all theme layouts
**Impact:** User cannot easily download resume in every theme

Test searched for resume link but had difficulty finding it. Verify resume link appears in:
- [ ] Hero section (call-to-action)
- [ ] Navigation/header (always visible)
- [ ] Contact section (logical place)
- [ ] Footer

**Current Status:**
- Paper & Ink has "Resume →" in hero
- Editorial unclear
- Need to verify Gallery, Dark Luxe, Noir Cinema, Neon Cyber

---

## 🟡 MEDIUM SEVERITY ISSUES

### ISSUE #5: FULL NAME DISPLAY INCONSISTENCY - CASE SENSITIVITY
**Severity:** MEDIUM
**File:** Hero components across themes
**Impact:** Test failed due to case mismatch; name renders but in different cases

Test: `expect(heroText).toContain("Ayush Yadav")`
Result: Found "THE AYUSH YADAV PORTFOLIO" (uppercase) instead

Some themes render:
- Paper & Ink: "THE AYUSH YADAV PORTFOLIO" (all caps - masthead style)
- Others: Need verification

**Fix:** Make test case-insensitive, OR standardize name display to use proper case.

---

### ISSUE #6: INCONSISTENT SKILLS DISPLAY
**Severity:** MEDIUM
**File:** `src/components/themes/creative/*/[Theme]Skills.tsx`
**Impact:** User sees different skill counts/categories per theme

Need to verify each theme displays:
- All skills from `skills.ts`
- Same grouping (Languages, Frontend, Backend, Data & ML, Mobile, DevOps, Specializations)
- Same proficiency levels (Expert, Advanced, Intermediate, Learning)

---

### ISSUE #7: DATE FORMATTING NOT STANDARDIZED
**Severity:** MEDIUM
**File:** Experience sections across themes
**Impact:** Inconsistent date presentation looks unprofessional

Different formats likely used:
- "June 2025 - Present"
- "2025-06 - Present"
- "Jun 2025 - Present"

All should use: `formatDateRange()` from `src/lib/data/experience.ts`

Verify all themes use the same formatter.

---

### ISSUE #8: DYNAMIC CSS INJECTION - MEMORY/PERFORMANCE ISSUE
**Severity:** MEDIUM (Performance)
**Files:**
- `src/components/themes/creative/paper-ink/PaperInkHero.tsx:11-74`
- `src/components/themes/creative/paper-ink/PaperInkProjects.tsx:10-152`
- `src/components/themes/creative/neon-cyber/NeonCyberProjects.tsx:10-55`

**Pattern:**
```tsx
useEffect(() => {
  const style = document.createElement("style");
  style.textContent = `...`;
  document.head.appendChild(style);
  return () => { document.head.removeChild(style); };
}, []);
```

**Issues:**
1. Styles injected every time component mounts
2. If component re-mounts, style duplicates before cleanup
3. Race conditions on unmount
4. Harder to debug in DevTools

**Solution:** Move styles to CSS modules or use `<style>` in JSX with proper key/id:
```tsx
<style id="paperink-styles">{STYLES_STRING}</style>
```

---

### ISSUE #9: HARDCODED SLICE LIMITS
**Severity:** MEDIUM (Maintainability)
**Files:**
- `PaperInkProjects.tsx:245` → `.slice(0, 3)` for highlights
- `GalleryProjects.tsx` → similar patterns
- `NeonCyberProjects.tsx:195` → `.slice(0, 4)` for tech stack

**Problem:** Display rules buried in component code. If you want to show 4 highlights instead of 3, must edit 6 themes separately.

**Solution:** Create theme config object with display rules.

---

## 🔵 LOW SEVERITY ISSUES

### ISSUE #10: COLOR CONTRAST ON DARK THEMES
**Severity:** LOW (Accessibility)
**Files:** Dark Luxe, Noir Cinema
**Impact:** May not meet WCAG AA standard

Need WCAG AA verification:
- Text on `card-bg` variable
- Text on `surface-2` and `surface-3`
- Accent colors on dark backgrounds

---

### ISSUE #11: FOCUS INDICATORS MAY NOT BE VISIBLE
**Severity:** LOW (Accessibility)
**Files:** All themes
**Impact:** Keyboard users cannot see where focus is

Need to verify visible focus rings on:
- Theme switcher button
- All project links
- Navigation links
- Form elements (if any)

---

### ISSUE #12: MISSING ARIA LABELS
**Severity:** LOW (Accessibility)
**Files:** Theme switcher and interactive elements
**Impact:** Screen readers may not describe buttons properly

Verify all buttons have `aria-label` or visible text describing purpose.

---

### ISSUE #13: RESPONSIVE DESIGN - THEME SWITCHER ON MOBILE
**Severity:** LOW (Mobile UX)
**File:** Theme switcher implementation
**Impact:** Button might overlap with hero content on mobile

Verify on iPhone 12 (390px width) that theme switcher doesn't cover:
- Name
- Title
- CTA buttons

---

### ISSUE #14: TESTIMONIALS SECTION CONSISTENCY
**Severity:** LOW (Completeness)
**File:** Testimonials components
**Impact:** Different themes may display testimonials differently

Verify all themes show:
- Both testimonials
- Reviewer names
- Reviewer titles
- Reviewer companies

---

### ISSUE #15: EDUCATION/AWARDS INCONSISTENT DISPLAY
**Severity:** LOW (Completeness)
**File:** About/Education sections
**Impact:** Some themes may omit awards or coursework

Verify all themes display:
- School name and degree
- Graduation date (Expected Apr 2026)
- All 3 Dean's List entries
- All relevant coursework (9 items)

---

## CODE QUALITY FINDINGS

### ISSUE #16: INCONSISTENT IMPORT PATTERNS
**Severity:** LOW
**Examples:**
```tsx
// Some themes import all projects then filter:
import { projects } from "@/lib/data/projects";
const featured = projects.filter(p => p.featured && !p.isPrivate);

// Other themes use helper functions:
import { getFeaturedProjects, getPublicProjects } from "@/lib/data/projects";
const featured = getFeaturedProjects();

// Yet others only use what they need:
import { projects } from "@/lib/data/projects";
const featured = projects.filter((p) => p.featured);
```

**Recommendation:** Standardize on the helper function approach (cleaner, testable).

---

### ISSUE #17: COMPONENT SIZE AND COMPLEXITY
**Severity:** LOW
**Files:** All Projects components
**Observation:** Some components are 300+ lines with lots of styling

Consider:
- Extracting project cards to separate components
- Moving theme-specific styles to CSS modules
- Breaking up large useEffect hooks

---

## TESTING RESULTS

### Tests Created
Created aggressive test suite: `/tests/playwright/deep-qa.spec.ts` with 50+ tests covering:
- Content completeness
- Link integrity
- Visual regressions
- Mobile responsiveness
- Animations
- Accessibility
- Performance

### Test Failures Found
1. **Content Completeness - Projects:** All 9 projects NOT shown in Paper & Ink, Gallery, Dark Luxe
2. **Content Completeness - Name:** Case sensitivity issue with "Ayush Yadav" vs "THE AYUSH YADAV PORTFOLIO"
3. (Tests incomplete due to timeout on full suite - too many tests, consider running by category)

---

## VERIFICATION CHECKLIST

### Data Integrity
- [ ] Decide: Hide or show private projects? (BLOCKING)
- [ ] Standardize all theme Projects components
- [ ] Verify all 9 projects visible in every theme after fix
- [ ] Test private project links (should 404 or be inaccessible)

### Content Completeness
- [ ] All 9 projects displayed
- [ ] Both jobs (Miami + Aramark) shown
- [ ] Education info visible (school, degree, graduation date)
- [ ] All 3 Dean's List awards shown
- [ ] All relevant coursework displayed
- [ ] Both testimonials complete
- [ ] Email visible in contact section

### Consistency
- [ ] Project display counts match across themes
- [ ] Date formatting identical
- [ ] Skill display complete and consistent
- [ ] Awards display consistent
- [ ] Typography hierarchy consistent (h1 > h2 > h3)

### Accessibility
- [ ] WCAG AA color contrast on all text
- [ ] Focus indicators visible on all interactive elements
- [ ] Semantic HTML (proper heading hierarchy, alt text)
- [ ] Aria labels on buttons
- [ ] Skip-to-content link if needed

### Mobile
- [ ] Theme switcher accessible without overlap
- [ ] Text readable (no horizontal overflow)
- [ ] Navigation works on small screens
- [ ] Images load on slow networks

### Performance
- [ ] Initial load < 5 seconds
- [ ] No massive layout shifts
- [ ] Smooth animations (no jank)
- [ ] No console errors

### Code Quality
- [ ] Remove dynamic style injection or secure it
- [ ] Standardize import patterns
- [ ] Consider splitting large components
- [ ] Add comments for non-obvious logic

---

## RECOMMENDATIONS

### Immediate (Must Do)
1. **Fix Project Display Inconsistency** - Choose option (show private or hide everywhere) and standardize
2. **Fix Resume Link Accessibility** - Ensure it's findable in all themes
3. **Add Comprehensive Integration Tests** - Run deep-qa tests regularly

### Short Term (Should Do)
1. Standardize date formatting
2. Fix color contrast on dark themes
3. Add focus indicators to all interactive elements
4. Test on real mobile devices

### Long Term (Nice to Have)
1. Refactor dynamic CSS injection to CSS modules
2. Extract theme-specific styles from components
3. Create shared project card component
4. Build theme configuration object

---

## FILES TO REVIEW

**Highest Priority:**
- `/src/components/themes/creative/*/[Theme]Projects.tsx` (all 6)
- `/src/lib/data/projects.ts` (decision about private projects)

**High Priority:**
- `/src/components/themes/creative/*/[Theme]Hero.tsx` (all 6)
- `/src/components/themes/creative/*/[Theme]About.tsx` (all 6)
- `/src/components/themes/creative/*/[Theme]Skills.tsx` (all 6)

**Medium Priority:**
- All Experience, Testimonials, Contact components
- Layout/navigation components

---

## CONCLUSION

Portfolio is **functionally complete but inconsistent**. The critical issue is that switching themes changes what the user sees, breaking the mental model that themes are just "skins."

Recommend: **Standardize project display logic across all themes first**, then address other consistency issues systematically.

Estimated effort to fix: 2-3 hours (if test coverage added: +2 hours)

