# The browser suites

Five specs, all of them run by something. This directory held twenty-six until
Phase 4, of which CI executed six and no npm script named twenty-four — a suite
that large is not coverage, it is a place for a red to hide. What is left is
listed here with the command that runs it, and nothing is here that nothing
runs.

Generated reports, screenshots and videos are written to `output/playwright/`,
which git ignores. Nothing generated belongs in this directory.

| Spec                        | Run by                        | What it asserts |
| --------------------------- | ----------------------------- | --------------- |
| `run-home.spec.ts`          | `test:e2e:browser-smoke`      | the home page IS the run — thirteen stations dawn to nightfall, the work rows reach their case files, the wasm classifier instantiates, no horizontal overflow at 320/390/1440 |
| `atlas.spec.ts`             | `test:e2e:browser-smoke`      | the seven generated case files: artifact-backed proof, the receipts and the boundaries that keep them honest, fig. 1 as a contained labelled plate, the artifact viewer, the private stamp |
| `reduced-motion.spec.ts`    | `test:e2e:reduced-motion`     | the page arrives complete under `prefers-reduced-motion`, nothing waits to be scrolled into, anchor navigation does not depend on animation |
| `performance-budget.spec.ts`| `test:e2e:performance`        | the launch budgets |
| `a11y-audit.spec.ts`        | `test:e2e:a11y`               | axe over the run, a case file and the evidence index; and the archive's skip link, which no other gate reads |
| `static-seo.spec.ts`        | `test:e2e:static-seo`         | canonical and social metadata on the production export |

`case-file-fixtures.ts` is not a spec. It holds what `atlas.spec.ts` asserts:
strings written out by hand, deliberately, so that a fixture cannot agree with
the data it is checking by construction.

`static-server.mjs` serves `out/` for every one of these. There is no dev
server in the loop — the static export is what a reader gets, so it is what the
browser sees here.

## Running one

Every `test:e2e:*` script builds first, because a spec run against a stale
`out/` reports on a site that no longer exists:

```bash
npm run test:e2e:browser-smoke     # atlas + run-home, five engines
npm run test:e2e:a11y              # axe + the skip link, chromium
npm run test:e2e:ui                # the Playwright UI, against whatever out/ holds
```

They build with an EMPTY `NEXT_PUBLIC_BASE_PATH` and re-run `build-home.mjs`,
so `out/` afterwards is a rebuild rather than the artifact that was hashed. To
put it back:

```bash
NODE_ENV=production NEXT_PUBLIC_BASE_PATH= npm run build
```

Since the site moved to `ayush-yadav.com` the deploy base path is *also* empty,
so the two builds currently agree — `out/index.html` after the browser smoke was
measured byte-identical to the pinned deploy hash. Do not lean on that: it is two
settings coinciding, it was checked for one file, and it ends the moment anyone
builds a subpath preview.

`npm run verify:portfolio` runs the browser smoke last for exactly this reason,
and says so in its closing note.

## Before committing

```bash
npm run verify:portfolio
```

One command, in a fixed order, first failure stops. Do not run the pieces
individually and read the last line — a pipe eats the exit code, and that hid a
red gate here for twelve CI runs.
