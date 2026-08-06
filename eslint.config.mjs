import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

/**
 * WHAT THIS REPLACED, AND WHY IT COULD NOT SURVIVE THE PRUNE.
 *
 * The whole config was three lines: `eslint-config-next/core-web-vitals` and
 * `eslint-config-next/typescript`, spread. `npm run lint` is both a
 * verify:portfolio step and a CI job, so removing `next` without rewriting
 * this would have taken the lint gate down with the framework — which is why
 * the migration plan named it before the prune ran.
 *
 * `eslint-config-next` was also carrying `typescript-eslint` transitively, and
 * that is the part worth keeping: without a TypeScript parser, ESLint cannot
 * read the eleven data modules that survive, and they are where the site's
 * claims live. So one meta-package that assumed a React app becomes two
 * focused ones that assume nothing. The React-specific halves — the hooks
 * rules, Core Web Vitals, the `next/image` and `next/link` advice — had
 * nothing left to apply to.
 *
 * NOT TYPE-AWARE, deliberately. `tseslint.configs.recommendedTypeChecked`
 * would want a project service over every file here, and `npm run typecheck`
 * already runs the compiler over exactly that set. Two passes of the same
 * analysis, one of them slower, is not two gates.
 *
 * THE ENVIRONMENTS ARE DECLARED, because `eslint-config-next` used to declare
 * them and nothing else did. Without the blocks below, `js.configs.recommended`
 * reports `process`, `console` and `document` as undefined and the run comes
 * to 1,896 errors, none of them real. Three environments, because this
 * repository genuinely has three: build scripts and gates in node, the
 * archive's own two client scripts in a browser, and the data layer in both
 * (it reads `process.env.NEXT_PUBLIC_BASE_PATH`, and the nameplate machines
 * measure real glyphs in a real document).
 */
export default defineConfig([
  globalIgnores([
    "out/**",
    ".next/**",
    ".build/**",
    "output/**",
    "*.building/**",
    /* Emscripten's glue for the Glyph station's classifier — vendored,
       minified, and not ours to style. It was producing 81 of this repo's
       warnings, every one of them about a variable name inside a generated
       one-line file. */
    "src/run/wasm/**",
    /* THE LAB NOTEBOOK IS NOT SOURCE. `docs/design-lab/` holds ~60 one-off
       measurement probes, the candidate HTML they were run against, and a
       second vendored copy of the wasm glue. They were written to answer one
       question each, they are kept because the answers cite them, and none of
       them ships. Linted with an environment declared they contribute 1,621
       `no-undef` errors and nothing true; linted without one they would still
       be a style opinion about a finished record. */
    "docs/**",
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    /* Everything that runs under node: the build, the gates, the specs. */
    files: ["scripts/**/*.mjs", "tests/**/*.{ts,mjs}", "*.mjs", "*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    /* The archive's own client scripts. Classic scripts in an IIFE, not
       modules — they are loaded with a plain `<script defer>` and share no
       bindings, which is the whole reason the record room needs no bundler. */
    files: ["scripts/archive/assets/*.js"],
    languageOptions: { sourceType: "script", globals: globals.browser },
  },
  {
    /* THE GATES THAT DRIVE A REAL BROWSER ARE GENUINELY BOTH. Every
       `page.evaluate(() => …)` body in these three is serialized and executed
       in the page, so `document`, `window` and `getComputedStyle` are defined
       exactly where they are used and undefined everywhere else in the same
       file. Declaring both environments is the honest description; the
       alternative was 26 `no-undef` errors about code that runs correctly. */
    files: [
      "scripts/qa/check-nameplate.mjs",
      "scripts/qa/check-nameplate-negative.mjs",
      "scripts/qa/check-cargo-fixture.mjs",
      "scripts/resume/render-resume.mjs",
      "scripts/asset-truth/*.mjs",
    ],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    /* WARN, WHICH IS THE SEVERITY eslint-config-next SET. Kept rather than
       raised, because raising it in the same commit that swapped the config
       would have meant "fix this now or turn the gate off", and what it finds
       deserves neither.
       Measured: two unused symbols in `nameplateMachines.ts`. `MACHINE`, a
       character-index-to-machine map nothing reads, and `personalInfo`, whose
       own comment three lines above promises that "if the data layer ever
       renames the author, the plate renders the new name still — machines
       withheld". That guard was designed and never wired. It is a real
       finding in shipped code and it is recorded in the migration plan as
       Phase 6 work: deciding what "withheld" does at each of five mount
       points is nameplate-engine work, and the nameplate is the one thing
       this migration must not regress. */
    rules: { "@typescript-eslint/no-unused-vars": "warn" },
  },
]);
