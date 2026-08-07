# Ayush Yadav — the long run

A portfolio built as a working paper: one workday drawn as a railway run, thirteen
stations from dawn to nightfall, with a record room behind it. Every number on the
page terminates in something you can open — a commit, a benchmark JSON, a CI run —
and the build refuses to ship if one of those links has died.

**Live:** <https://yadava5.github.io/Portfolio-2.0/>

## What this repository actually is

One hand-authored HTML page and a static-site generator written in plain Node.

`src/run/index.html` is the site. It is 5,570 lines of hand-written HTML, CSS and
vanilla JavaScript — thirteen `<section data-beat>` stations, a canvas rail with
freight riding each corridor under a waybill, and a WebAssembly digit classifier
that runs in your browser. `npm run build` runs `scripts/archive/build-archive.mjs`,
which copies that page over `out/index.html` and generates the archive around it:
seven case files at `/projects/<id>/`, an `/evidence/` ledger, `404.html`,
`sitemap.xml`, `robots.txt`, and six vendored machine records at `/proof/*.json`.

**There is no framework.** No Next.js, no React, no Tailwind, no animation library.
An earlier version of this repository was a Next.js App Router app; it was retired,
and this README described it for longer than it was true. The runtime dependency
list is one package (`sharp`, for image derivation at build time). Everything else
is a dev dependency: Playwright, ESLint, Prettier and TypeScript.

## Run it

```bash
npm ci
NEXT_PUBLIC_BASE_PATH= npm run build   # writes out/
npm run preview                        # serves out/ at http://127.0.0.1:4300
```

`npm run preview` also rewrites the deployed origin to the preview's own in the
HTML it serves, so links between the run and the case files stay local instead of
leaving for the published site. Nothing on disk changes.

`NEXT_PUBLIC_BASE_PATH` keeps a name from the framework that is gone. The variable
is still live — `src/lib/basePath.ts` reads it and both workflows set it — and
renaming it is a four-file change with a gate on each, so it kept the name and lost
the framework. Build the deploy artifact with
`NODE_ENV=production NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 npm run build`.

## Verify it

```bash
npm run verify:portfolio
```

Twenty steps and 270 browser tests across five engines. It is the same command CI
runs before a deploy, and it is the point of the repository more than the page is.
Beyond types, lint and format, it asserts:

| gate | what it refuses to let past |
|---|---|
| golden hash | the shipped page reproduces byte-for-byte, pinned to the commit that produced it |
| pinned artifact links | all 57 sha-pinned links into the subject repositories still resolve |
| run ⇄ archive crosswalk | every rejoin, receipt anchor and quoted consignment agrees in five directions |
| stations ⇄ the run | the station table and the page cannot drift apart |
| cargo rides the right corridors | each waybill arrives at the station it is about, checked against the declaration and against a recording |
| headline figures ⇄ data layer | no number appears in a figure that the data layer does not own |
| bench figures ⇄ their records | the benchmark bars are fractions bound to committed JSON, not replayed numbers |
| palette ⇄ the light it is read under | contrast is measured, and a colour change must update its recomputed claim |
| nameplate (negative) | the guard is proven by making it fail in a throwaway copy |

Individual gates live in `scripts/qa/` and each carries a header explaining the
defect that caused it to exist.

## Layout

```text
src/
├── run/index.html        the site — hand-authored, one page
├── run/{fonts,wasm}/     four self-hosted faces, the classifier's own module
├── lib/data/             the declared truth: stations, case studies, proof manifest
└── components/           three modules the generator imports (geometry, constants)

scripts/
├── archive/              the build — plain node, no framework
├── qa/                   the gates, and verify-portfolio.mjs which sequences them
├── run/                  the home-page and nameplate emitters
├── dev/preview.mjs       the local preview server
├── resume/ asset-truth/  résumé rendering, image derivation, OG cards

tests/playwright/         browser specs — assertion-only by default
docs/                     the migration plan and the project ledger
out/                      the built site (generated, not committed)
```

## Contact

**Ayush Yadav** — Computer Science, Miami University, May 2026

- [GitHub](https://github.com/yadava5)
- [LinkedIn](https://www.linkedin.com/in/ayush-yadav-developer/)
- <mailto:aesh.03.23@gmail.com>
