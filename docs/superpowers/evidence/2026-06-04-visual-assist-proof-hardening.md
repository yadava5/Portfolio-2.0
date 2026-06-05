# Visual Assist Proof Hardening Evidence

## Source Repository

- Source repo: `/Users/ayush/Documents/Projects/Wearable LiDAR Visual Assistance System/VisualAssist`
- Source branch/state: `main...origin/main`, clean worktree during audit.
- Remote HEAD verified: `22ebdaacf209c0ab65ebfe061de237d5f1acfa68`.

## Source Truth

- README identifies the project as beta and documents LiDAR-required hardware, iOS 17+, camera, microphone, and speech-recognition permissions.
- Source code contains ARKit/LiDAR services, Vision OCR, object-awareness paths, haptics, speech, voice commands, and VoiceOver-related utilities.
- Test source audit found 71 XCTest functions across 8 files under `VisualAssistTests/`.
- `ObjectDetectionService.swift` notes that a custom Core ML model would be loaded in a full implementation; no custom model artifact was present in the audited repo.

## Native Runtime Attempt

Commands run:

```bash
xcodebuild -list -project "/Users/ayush/Documents/Projects/Wearable LiDAR Visual Assistance System/VisualAssist/VisualAssist.xcodeproj"
xcrun simctl list devices
xcodebuild -runFirstLaunch
xcodebuild -project "/Users/ayush/Documents/Projects/Wearable LiDAR Visual Assistance System/VisualAssist/VisualAssist.xcodeproj" -scheme VisualAssist -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /tmp/VisualAssistDerivedData CODE_SIGNING_ALLOWED=NO build
```

Result:

- Xcode project discovery passed and found scheme `VisualAssist`.
- `simctl` recovered after simulator support registration and listed iOS 18.3 and iOS 26.2 simulator devices.
- Simulator build remained blocked before compilation with `Found no destinations for the scheme 'VisualAssist' and action build`.
- The destination report listed only an ineligible physical iOS placeholder and said iOS 26.5 is not installed, even though the target build settings include `SUPPORTED_PLATFORMS = "iphoneos iphonesimulator"`.

Interpretation:

- The current machine/toolchain cannot produce a live simulator screenshot for Visual Assist in this pass.
- The portfolio should keep the architecture diagram as the primary proof visual and should not imply a fresh simulator run.

## Asset Decision

- Did not promote `Assets/social-preview.png` because it is a branded social card, not product proof, and leans into a dark purple visual style that conflicts with Technical Operations Atlas.
- Did not promote `Assets/Hero-Banner.png` because it is a feature banner rather than runtime proof.
- Added source-proof artifacts instead:
  - `README beta and LiDAR requirements`
  - `XCTest source evidence`

## Portfolio Guardrail

`tests/playwright/atlas.spec.ts` now verifies the Visual Assist case study exposes the architecture, README, test-source, 71-test-function, and Core ML boundary evidence while avoiding stale `68 unit tests` and unsupported `Core ML object detection` copy.

## Portfolio Validation

- `npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts`: `41 passed`, `6 skipped`.
- `npm run lint`: passed.
- `npm run format:check`: passed.
- `npm run test:e2e:score -- --project=chromium-desktop`: score `10`, no deductions.
- `npm run typecheck`: passed on rerun after the score command finished rebuilding `.next`.

Note: running `npm run typecheck` in parallel with `npm run test:e2e:score` is unreliable because `next build` can regenerate `.next/types` while TypeScript is reading them.
