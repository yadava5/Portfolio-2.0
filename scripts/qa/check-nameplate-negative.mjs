/**
 * Prove check-nameplate.mjs can actually SEE each defect it claims to guard.
 *
 * A guard that has never had anything to catch proves nothing, and this repo
 * has shipped four of those (a resume check that required the stale resume, a
 * spec pinning a retracted sentence, a probe needle matching its own erratum,
 * a claims guard reading markup as prose). So each defect below is
 * reintroduced for real, the injection is VERIFIED to have landed, and the
 * guard must then fail.
 *
 * Everything happens in a throwaway copy of out/. Never mutate the directory
 * that is being served.
 */
import { cp, rm, readFile, writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const SRC = resolve(process.cwd(), "out");
/** the compiled scatter, relative to the site root */
const SCATTER_JS = "run/components/story/nameScatter.js";
/** the line that mounts the hand on the settled name, verbatim in the page */
const MOUNT = "hand = M.mountNameHand(plate, h1, letters, geo, window.__stir);";

/** Each: mutate the page, and state how to confirm the mutation landed. */
const DEFECTS = [
  {
    name: "the variable axes animate again (type drifts under the machines)",
    apply: (s) =>
      s.replace(
        /(@keyframes np-settype\s*\{\s*0%\s*\{[^}]*?font-variation-settings:\s*)"opsz"\s*144/,
        '$1"opsz" 18'
      ),
    landed: (s) => /@keyframes np-settype\s*\{\s*0%[^}]*"opsz"\s*18/.test(s),
  },
  {
    name: "the scroll-fx rides the h1 (type translates away from the overlay)",
    apply: (s) =>
      s
        .replace(/(<div class="np-plate" data-nameplate) data-fx="[^"]*"/, "$1")
        .replace(
          /(class="nameplate" data-np-machines)/,
          '$1 data-fx="in .0 .22 y 5 | drift 26"'
        ),
    landed: (s) =>
      /data-np-machines data-fx=/.test(s) &&
      !/np-plate" data-nameplate data-fx=/.test(s),
  },
  {
    name: "the overlay is sized from a box that is not the plate",
    apply: (s) =>
      s.replace(
        /(\.np-mech\s*\{\s*position:\s*absolute;\s*)inset:\s*0;\s*width:\s*100%;\s*height:\s*100%;/,
        "$1inset: auto; left: 0; top: 0; width: 100%; height: 60%;"
      ),
    landed: (s) => /\.np-mech[^}]*height:\s*60%/.test(s),
  },
  {
    /* The historical loop needed BOTH halves and neither alone suffices,
       which is worth recording. Removing the observer's re-baseline is
       inert while the axes are held, because then nothing resizes the
       plate mid-run and the observer never fires. Animating the axes is
       merely ugly while the observer ignores its own run. Together they
       are the perpetual motion machine that performed the name every
       4.54 seconds forever. */
    name: "the performance loops (axes animate AND the observer reacts to its own run)",
    apply: (s) =>
      s
        .replace(
          /(@keyframes np-settype\s*\{\s*0%\s*\{[^}]*?font-variation-settings:\s*)"opsz"\s*144/,
          '$1"opsz" 18'
        )
        .replace(
          "lastW = Math.round(plate.getBoundingClientRect().width);",
          "/* re-baseline removed */"
        )
        .replace(
          "if (!w || w === lastW || running) return;",
          "if (!w || w === lastW) return;"
        ),
    landed: (s) =>
      /@keyframes np-settype\s*\{\s*0%[^}]*"opsz"\s*18/.test(s) &&
      !s.includes("lastW = Math.round(plate.getBoundingClientRect().width)") &&
      s.includes("if (!w || w === lastW) return;"),
  },
  /* The hand's replays, reintroduced the plainest way a regression could
     bring them back: the settled name re-runs its assembly when the
     pointer arrives, or when it presses. Either is the defect the owner
     ruled out on 2026-10-16, whatever overlay class it draws. */
  {
    name: "the hover replays the assembly",
    apply: (s) =>
      s.replace(
        MOUNT,
        `${MOUNT} h1.addEventListener("pointerenter", () => perform());`
      ),
    landed: (s) => s.includes(`${MOUNT} h1.addEventListener("pointerenter"`),
  },
  {
    name: "a press replays the assembly",
    apply: (s) =>
      s.replace(
        MOUNT,
        `${MOUNT} h1.addEventListener("pointerdown", () => perform());`
      ),
    landed: (s) => s.includes(`${MOUNT} h1.addEventListener("pointerdown"`),
  },
  /* The scatter's own three ways to ship broken. Each breaks the compiled
     module or the mount, the way a regression would. */
  {
    name: "the hover is dead (the scatter never mounts)",
    apply: (s) => s.replace(MOUNT, "/* hand removed */"),
    landed: (s) => !s.includes(MOUNT) && s.includes("/* hand removed */"),
  },
  {
    name: "a letter hides with no dots over it (the canvas is never shown)",
    file: SCATTER_JS,
    apply: (s) =>
      s.replace('if (cv.style.visibility !== "visible")', "if (false)"),
    landed: (s) =>
      !s.includes('if (cv.style.visibility !== "visible")') &&
      s.includes("if (false)"),
  },
  {
    name: "the name never re-prints (no dot can seat)",
    file: SCATTER_JS,
    apply: (s) =>
      s.replace(
        "x[k] * x[k] + y[k] * y[k] < 0.12",
        "x[k] * x[k] + y[k] * y[k] < -1"
      ),
    landed: (s) => s.includes("x[k] * x[k] + y[k] * y[k] < -1"),
  },
];

let missed = 0;
for (const d of DEFECTS) {
  const dir = await mkdtemp(join(tmpdir(), "np-neg-"));
  try {
    await cp(SRC, join(dir, "out"), { recursive: true });
    const f = join(dir, "out", d.file ?? "index.html");
    const before = await readFile(f, "utf8");
    const after = d.apply(before);

    if (after === before || !d.landed(after)) {
      console.log(
        `  ✗ ${d.name}\n      INJECTION DID NOT LAND — this proves nothing`
      );
      missed++;
      continue;
    }
    await writeFile(f, after);

    let failed = false;
    try {
      await run(
        "node",
        ["scripts/qa/check-nameplate.mjs", "--root", join(dir, "out")],
        {
          cwd: process.cwd(),
          maxBuffer: 1 << 22,
        }
      );
    } catch {
      failed = true;
    }
    if (failed) {
      console.log(`  ✓ caught — ${d.name}`);
    } else {
      console.log(`  ✗ MISSED — ${d.name}`);
      missed++;
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

if (missed) {
  console.error(
    `\ncheck-nameplate is blind to ${missed} of ${DEFECTS.length} defects`
  );
  process.exit(1);
}
console.log(`\nall ${DEFECTS.length} defects are visible to check-nameplate`);
