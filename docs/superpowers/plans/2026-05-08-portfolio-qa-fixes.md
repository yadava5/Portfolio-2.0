# Portfolio QA Fix Plan

## Goal

Make the portfolio render cleanly across the current five themes and remove the defects found by the current-theme Playwright audit.

## Evidence

- Current themes are `liquid-glass`, `cosmic-voyage`, `retro-terminal`, `synthwave-sunset`, and `bioluminescent-deep`.
- The checked-in Playwright suite still targets older themes such as `paper-ink`, `gallery`, `dark-luxe`, `editorial`, `noir-cinema`, and `neon-cyber`.
- The current-theme audit output is in `/private/tmp/portfolio-audit/report.json`, with screenshots in `/private/tmp/portfolio-audit/screenshots` and videos in `/private/tmp/portfolio-audit/videos`.

## Findings

1. Non-default themes trigger React hydration mismatches because server-rendered default-theme markup is replaced by localStorage-driven theme markup during hydration.
2. The hero section has no `id="hero"`, so audit coverage and direct `#hero` navigation cannot target the top section.
3. Icon-only project links in the non-featured project cards are missing accessible names.
4. Mobile layouts produce horizontal overflow in multiple themes, mostly around oversized hero text and nested scroll containers.
5. Synthwave snap wrappers create nested `h-screen overflow-y-auto` scrollers, which trap scroll and hide later content on mobile.
6. GSAP ScrollTrigger effects and the typewriter interval create cleanup leaks and can leave animations attached after theme swaps.

## Implementation

1. Add a mounted state to the custom theme hook so theme-dependent markup is stable through hydration.
2. Add `id="hero"` and mobile-safe hero typography across all hero variants.
3. Add accessible labels to icon-only project links.
4. Replace nested snap scrollers with normal page-flow sections that keep the visual style without scroll traps.
5. Clean up ScrollTriggers, GSAP tweens, and typewriter timers on unmount.
6. Re-run `npm run typecheck`, `npm run lint`, and the current-theme Playwright audit.

## Validation

1. `PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin /opt/homebrew/bin/npm run typecheck`
2. `PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin /opt/homebrew/bin/npm run lint`
3. Current-theme Playwright audit against `http://127.0.0.1:3000`; artifacts are in `/private/tmp/portfolio-audit`.

## 2026-05-08 Status

- TypeScript passes with `node_modules/.bin/tsc --noEmit`.
- ESLint passes with 0 errors and 21 baseline warnings.
- Full Chromium desktop Playwright passes: `228 passed`, `6 skipped`, `0 failed` in `22.1m`.
- Browser plugin validation loads the app, verifies no framework overlay, opens the current theme switcher, switches to `retro-terminal`, and confirms the retro hero has one `h1`.
- Non-failing portfolio gaps remain: no obvious visible resume/CV link in the themed UI, some older audit heuristics cannot find clear project/skill headings in every theme, and Next warns that `127.0.0.1` should eventually be configured in `allowedDevOrigins`.

## Cleanup

Remove generated Playwright report directories from the workspace and keep only the tracked source changes plus this plan.
