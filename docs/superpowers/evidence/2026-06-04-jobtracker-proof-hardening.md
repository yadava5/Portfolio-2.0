# JobTracker Proof Hardening Evidence

## Source Repo

- Path: `/Users/ayush/Documents/Projects/jobtracker`
- Branch: `integration/web-migration`
- Remote HEAD: `origin/main` at `7cfce81a8986a0f7219f6a7ce789a9afbb492e5c`
- Audited branch HEAD: `2223a90c24b4b8c398f1da695e1127e35334750b`
- Status before portfolio edits: clean

## What Is Safe To Show

- Keep the public portfolio on the architecture diagram and source links.
- Do not promote the local web login screenshot as a main project image. It only proves the web beta auth shell, and the source README explicitly says current screenshots are intentionally omitted because old images were outdated.
- Do not expose personal mailbox, application, or labeling data.

## Validation Commands

```bash
env JOBTRACKER_ENVIRONMENT=test PYTHON_KEYRING_BACKEND=keyring.backends.null.Keyring .venv311/bin/pytest tests -q
```

Result: `182 passed`.

```bash
env JOBTRACKER_ENVIRONMENT=test PYTHON_KEYRING_BACKEND=keyring.backends.null.Keyring .venv311/bin/python -m jobtracker.scripts.evaluate_classifier --mode rules --dataset data/evaluation/classifier_eval_v3.jsonl --baseline data/evaluation/baseline_rules_v3.json --tolerance 0.001 --min-macro-f1 0.95
```

Result: 96 samples, accuracy `0.9792`, macro-F1 `0.9791`, non-regression checks passed.

```bash
env JOBTRACKER_ENVIRONMENT=test PYTHON_KEYRING_BACKEND=keyring.backends.null.Keyring .venv311/bin/python -m jobtracker.scripts.evaluate_classifier --mode hybrid --dataset data/evaluation/classifier_eval_v3.jsonl --baseline data/evaluation/baseline_hybrid_v3.json --hybrid-profile deterministic --min-macro-f1 0.95 --tolerance 0.001
```

Result: 96 samples, accuracy `0.9792`, macro-F1 `0.9791`, non-regression checks passed.

```bash
env NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=ci-placeholder-anon-key BACKEND_API_URL=http://localhost:8000 pnpm typecheck
env NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=ci-placeholder-anon-key BACKEND_API_URL=http://localhost:8000 pnpm lint
env NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=ci-placeholder-anon-key BACKEND_API_URL=http://localhost:8000 pnpm build
```

Result: web typecheck, lint, and production build passed.

```bash
env PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test --project=chromium
```

Result: `1 passed`; login page renders the sign-in form.

```bash
xcodebuild -project apps/macos/JobTracker/JobTracker/JobTracker.xcodeproj -scheme JobTracker -configuration Debug -destination 'platform=macOS' -derivedDataPath /tmp/JobTrackerDerivedData CODE_SIGNING_ALLOWED=NO build
```

Result: `BUILD SUCCEEDED`.

## Browser Artifacts

- Screenshot: `output/playwright/jobtracker-proof-hardening/jobtracker-web-login-playwright.png`
- Video: `output/playwright/jobtracker-proof-hardening/jobtracker-web-login-playwright-video.webm`

These artifacts stay ignored under `output/playwright/` and are evidence only, not promoted portfolio assets.
