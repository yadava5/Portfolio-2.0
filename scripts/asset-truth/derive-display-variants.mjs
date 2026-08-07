/**
 * Display-size derivatives for committed captures (PERF-AUDIT fixes 3+4).
 *
 * Inputs are the checked-in canonical assets (the promote-proof PNG
 * outputs + the profile portrait); outputs are deterministic display
 * variants — regenerate via `npm run assets:derive`, never hand-edit:
 *
 *   1. Header avatar — 96×96 top-square crop of the portrait, WebP.
 *      The header button renders the portrait at 26–36px; shipping the
 *      full 900×1350/52KB file there burned a preload slot on every
 *      route. The portrait modal keeps the full image.
 *   2. Case heroes — WebP re-encodes of the eager fig-1 screenshots
 *      (automl / mnist / advocacy) at their intrinsic 1376×768. The
 *      PNGs stay on disk as the promote pipeline's canonical captures;
 *      only the WebPs are referenced by the site.
 */

import sharp from "sharp";
import path from "node:path";

const root = process.cwd();
const profileDir = path.join(root, "public", "images", "profile");
const projectsDir = path.join(root, "public", "images", "projects");

/* 1) Header avatar: the button crops object-cover/object-top inside a
   square, so the derivative bakes the same top-square framing. */
const avatarTarget = path.join(profileDir, "ayush-yadav-avatar-96.webp");
await sharp(path.join(profileDir, "ayush-yadav-professional-portrait.webp"))
  .resize(96, 96, { fit: "cover", position: "top" })
  .webp({ quality: 82 })
  .toFile(avatarTarget);
console.log(`derived ${avatarTarget}`);

/* 2) Case heroes: PNG → WebP, intrinsic size preserved (1376×768).

   `automl` left this list on 2026-08-07 with its plate: the deployed
   product says "Coming soon", so no product screenshot of it belongs on a
   shelf that argues finished work, and a generator that keeps deriving a
   variant nobody renders is how a deleted plate quietly comes back. The
   reasoning is in the artifacts comment in projectCaseStudies.ts. */
for (const name of ["mnist", "advocacy"]) {
  const target = path.join(projectsDir, `${name}.webp`);
  await sharp(path.join(projectsDir, `${name}.png`))
    .webp({ quality: 82 })
    .toFile(target);
  console.log(`derived ${target}`);
}
