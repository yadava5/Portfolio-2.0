/**
 * @fileoverview Homepage — a head, and nothing else.
 *
 * The rendered home is `src/run/index.html`. `npm run build` is
 * `next build && node scripts/run/build-home.mjs`, and that second step
 * OVERWRITES `out/index.html` with the run. Everything this file used to
 * render — StoryShell, the rail, the world — was built, shipped as ~1 MB of
 * `_next` JS, and then thrown away on every deploy. Measured on the live
 * site: the served home referenced `_next` zero times and carried zero of
 * this tree's markup.
 *
 * What this route still earns is its HEAD. `build-home.mjs` lifts the
 * `<title>`, canonical, description, JSON-LD, OG and Twitter tags out of the
 * built page and injects them into the run, and those come from
 * `layout.tsx`'s `metadata` export — which only runs if the route exists. So
 * the route stays and the body goes.
 *
 * Deleting the file outright would strip the run of its title, structured
 * data and social cards, and fail `test:seo`. That is why this is a stub
 * rather than a deletion.
 */
export default function Home() {
  return null;
}
