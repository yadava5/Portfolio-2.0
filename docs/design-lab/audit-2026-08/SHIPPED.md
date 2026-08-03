# Shipped — 2026-08-03

Supersedes `PUSH-LIST.md`. Everything on that list is now pushed, every CI run is
green, and the two claims it flagged as unverifiable-by-a-reader are now
verifiable.

Each repository was tested **twice** before pushing — once, then again with a
clean build where the project has one — because a single green run is a sample of
one.

---

## What is live

| Repo | Branch | Head | CI |
|---|---|---|---|
| Glyph (`fast-mnist-nn`) | `main` | `001e9b4` | CI · CodeQL · Scorecard · Sanitizers · WASM · gitleaks — all green |
| jetpack-compress | `main` | `7b75e03` | CI · CodeQL · Scorecard · gitleaks |
| LifeQuest | `main` | `5e5744c` | CI · CodeQL · Scorecard · gitleaks |
| VisualAssist | `main` | `b0e6203` | CI · Scorecard · gitleaks |
| PolicyBot | `main` | `0eaad6d` | CI |
| Applied (`jobtracker`) | `integration/web-migration` | `2c17470` | Backend CI |
| Cadence | `fix/method-handler-auth` | `2295044` | CI |
| AutoML | `fix/llm-rate-limit-gh` | `fb7618b3` | CI |
| Portfolio | `audit/provenance-2026-08` | pushed | gates green locally |

Applied, Cadence and AutoML are on feature branches, so their Vercel deployments
are **previews**. Production changes only on merge to `main` — which is a separate
decision, and the CORS fix is waiting behind it.

---

## Two CI failures I caused, and what each taught

Both passed locally and failed on the runner. Both are recorded because the
*shape* of the mistake is more useful than the fix.

### Glyph — a lockfile edited on the wrong platform

`npm audit fix` on macOS/arm64 cleared three high-severity advisories and, in the
same motion, rewrote `package-lock.json` against the host platform — dropping the
`wasm32-wasi` fallbacks for `@tailwindcss/oxide` and `@rolldown/binding`. 21
`@emnapi` references became 14.

Invisible locally. `npm install`, `npm run build` and `npm audit` all pass against
the pruned file. It fails only where the missing entries are needed:

```
npm error `npm ci` can only install packages when your package.json and
package-lock.json are in sync.
npm error Missing: @emnapi/core@1.11.3 from lock file
```

`npm ci` is strict where `npm install` is forgiving — which is the entire reason
CI uses it, and the reason a lockfile touched on one platform must be verified on
the other.

Three attempts to fix it on macOS all pruned again (plain regeneration; delete and
rebuild; targeted `npm install --package-lock-only` — which also silently edited
`package.json`). **The platform was the variable, not the command.** Regenerated
inside `node:20` on `linux/amd64`, matching the runner, then verified on both:

| | linux/amd64 node:20 | macOS arm64 node:24 |
|---|---|---|
| `@emnapi` entries | 21 | 21 |
| `npm ci` | PASS | PASS |
| `npm run build` | PASS | PASS |
| `npm audit --omit=dev` | 0 | 0 |

### PolicyBot — two pytest invocations that are not the same command

```
ModuleNotFoundError: No module named 'slack_app'
```

`python -m pytest` silently prepends the working directory to `sys.path`. Bare
`pytest` does not. I verified with the former; the workflow runs the latter. Both
are "a green pytest run", and only one of them was the run CI would make.

Fixed in `pyproject.toml` rather than in the workflow, so the two cannot diverge
again, and re-verified three ways: bare `pytest`, `python -m pytest`, and an
absolute path from `/tmp` with no CWD to lean on.

### VisualAssist — a subcommand that did not exist yet

`xcresulttool get test-results summary` is Xcode 16+. The `macos-14` runner ships
Xcode 15.x, where the call is rejected, stdout is empty, and the parser then
chokes on nothing — surfacing as a red *test* job rather than the toolchain
difference it was. This machine runs Xcode 26, so the dependency was invisible
from here.

The script now tries the modern interface and falls back to the legacy schema,
which differs in more than syntax: Xcode 15 wraps scalars as `{"_value": …}`,
**omits** the failure and skip counters entirely when they are zero, and reports
only a total — so `passed` must be derived. Getting that last part wrong would
report `passed=0` on a fully green run.

Verified on both paths, the legacy one by shimming `xcrun` to reject the modern
subcommand exactly as Xcode 15 does.

---

## What a reader can check that they could not yesterday

- **VisualAssist's 71 tests run in CI.** They had never executed anywhere —
  not in CI, which had no `xcodebuild test` step, and not locally, for want of an
  iOS runtime. `Build & Test: success` is now a real statement.
- **Cadence runs 1,179 tests with 0 skipped.** The 11 that used to skip were the
  only tests capable of demonstrating its isolation claims.
- **OpenSSF Scorecard publishes a score for four repositories** — computed by a
  third party, at a public URL, re-readable by anyone.

## Still requiring the owner

1. **34 faculty `.eml` files** at the tip of a public AutoML branch. A branch
   deletion, not a push.
2. **The CORS fix reaches production only on merge to Applied's `main`.** Verified
   and green on its branch; the merge is a production deploy and is deliberately
   left as a decision rather than taken.
