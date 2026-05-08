# Technical Operations Atlas Baseline

## Branch

- Branch: `yadava5/technical-operations-atlas-setup`
- Started from: `main`
- Reason: implementation-plan execution must not proceed on `main`; the existing dirty app tree was preserved in place.

## Pre-Existing Dirty App Files

These files were already modified before artifact inventory or concept-gate docs were created:

```text
src/app/globals.css
src/components/effects/FloatingEntry.tsx
src/components/effects/GlitchBurst.tsx
src/components/effects/SnapScrollWrapper.tsx
src/components/effects/TextReveal.tsx
src/components/effects/TypewriterText.tsx
src/components/effects/WarpTransition.tsx
src/components/layout/Header.tsx
src/components/sections/Hero.tsx
src/components/sections/Projects.tsx
src/hooks/useTheme.ts
```

Diff stat at baseline:

```text
11 files changed, 105 insertions(+), 51 deletions(-)
```

## Baseline Validation

`npm` was not available on the default shell PATH. Equivalent local binary commands were used where possible.

| Check | Command run | Result | Notes |
| --- | --- | --- | --- |
| TypeScript | `node_modules/.bin/tsc --noEmit` | Passed | Exit code 0 |
| ESLint | `node_modules/.bin/eslint . --ext .ts,.tsx` | Passed with warnings | Exit code 0, 39 warnings |
| Next dev server | `/opt/homebrew/bin/npm run dev` | Blocked | Next failed to load `@next/swc-darwin-arm64` because the native binary code signature was rejected |
| Playwright targeted baseline | `npm run test:e2e -- --project=chromium-desktop tests/playwright/themes.spec.ts` | Not run | Blocked by Next/SWC dev server failure |

## ESLint Warning Summary

Baseline ESLint produced 39 warnings and 0 errors. Warning categories:

- Unused `TypewriterText` imports in section components.
- Unused `idx`, `e`, `path`, and similar variables in existing test and QA scripts.
- Unused Playwright helper variables in existing audit specs.

These warnings are baseline drift, not new work from this plan slice.

## E2E Blocker

The dev server failed even when run with the system npm and escalation:

```text
Failed to load SWC binary for darwin/arm64
code signature ... next-swc.darwin-arm64.node not valid for use in process
```

Before claiming browser validation passes, this environment issue needs repair, for example by reinstalling/rebuilding dependencies with a compatible Node/SWC pair or running validation in an environment that can load the Next SWC native binary.

## E2E Repair Notes

Root cause confirmed on 2026-05-08:

- The default Codex shell resolves `node` to `/Applications/Codex.app/Contents/Resources/node` (`v24.14.0`).
- That signed Node runtime rejects ad-hoc native packages used by this app, including `@next/swc-darwin-arm64` and `lightningcss-darwin-arm64`, with the Team ID mismatch error.
- `/usr/local/bin/node` (`v22.14.0`) and `/opt/homebrew/bin/node` can load those native modules directly.
- Next/Turbopack also needed a clean generated cache after earlier failed runs.

Working local dev-server command for Codex validation:

```text
/usr/bin/env PATH=/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /usr/local/bin/node node_modules/next/dist/bin/next dev --hostname 0.0.0.0 --port 3000
```

If the old native-module error appears after switching Node runtimes, clear only the generated Next cache and restart:

```text
rm -rf .next
```

Working targeted Playwright command:

```text
/usr/bin/env PATH=/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /usr/local/bin/node node_modules/@playwright/test/cli.js test tests/playwright/interactions.spec.ts --project=chromium-desktop --workers=1
```

Working full desktop Playwright command:

```text
/usr/bin/env PATH=/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /usr/local/bin/node node_modules/@playwright/test/cli.js test --project=chromium-desktop --workers=1
```

Validation after repair:

- Browser plugin loaded `http://localhost:3000/` with title `Ayush Yadav | Software Engineer`.
- No Next build overlay was present after clearing `.next` and restarting with the pinned Node/PATH command.
- Focused Playwright interaction suite passed: `11 passed`, `6 skipped`, `0 failed`.
- Playwright specs were modernized to use the active source of truth from `src/config/themes.ts` and `src/lib/data/projects.ts`.
- Final Chromium desktop sweep passed on 2026-05-08: `228 passed`, `6 skipped`, `0 failed` in `22.1m`.
- Final Browser plugin check loaded `http://127.0.0.1:3000/`, found the theme switcher, switched to `retro-terminal`, and verified the retro hero has one `h1`.

Remaining non-failing QA warnings:

- The current themed UI does not expose an obvious resume/CV link, though `/resume.pdf` exists and passes direct request checks.
- Some themes do not expose obvious project/skill heading text for the older comprehensive-audit heuristic.
- Next dev logs a future `allowedDevOrigins` warning when tests use `127.0.0.1`.
