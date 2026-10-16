/**
 * The site mark: his name, "Ayush" stacked over "Yadav", on the dawn paper,
 * with the run's clay rail laid between the two words.
 *
 * The owner's ruling (2026-10-16): no more live mark, just the whole name,
 * stacked, in a face that sits with the run. The face is the run's own
 * display face, Fraunces, and the letters are OUTLINES, because a favicon
 * cannot load a web font: an SVG icon is drawn without the page, and `<text>`
 * in one sets in whatever the host happens to have.
 *
 * THE CUT. src/run/fonts/fraunces-latin-var.woff2 (Fraunces, SIL Open Font
 * Licence 1.1, the file the page ships) shaped with HarfBuzz, kerning on, at
 * opsz 9, wght 900, SOFT 100, WONK 0, tracking -30 of 2000 units per em.
 *   opsz 9 is the face's small-size master: the widest letters, the lowest
 *     contrast and the biggest counters, which is the most room the face
 *     can give the bowls of a, d and u at 32 and 48 px.
 *   wght 900 is the most ink the face holds, and at 16 px each word is a
 *     line of letters 3 to 4 px tall that has to read as one shape.
 *   SOFT 100 is the warm, rounded end of the face, the sibling of the
 *     masthead's SOFT 30 pushed as far as it goes for a mark seen small.
 *   WONK 0 is pinned rather than inherited, because the file's default is 1
 *     and a font update must not be able to change the letters silently.
 * Both words share one scale (0.00931 tile units per font unit, so 18.6
 * units to the em in the 64-unit tile) and the wider, "Ayush", sets the
 * width at 59 of 64 units; "Yadav" is justified to the same measure by
 * tracking, never by stretching.
 *
 * THE GRID. Laid out in a 64-unit tile and written at 10x (viewBox 640) as
 * integers with relative commands: one unit is a quarter pixel at 16 px.
 * Both baselines (24 and 52) and both edges of the rail (28 and 32) fall on
 * multiples of 4, which is a whole pixel at 16, 32 and 48, so the rail is a
 * crisp 1 px line in the tab and the words sit on hard edges. Moved two
 * units off that grid, the rail rasterised as a pink smear at 16 px.
 *
 * THE RAIL is the run's clay line, the one that carries the reader down the
 * page, laid edge to edge between the words so it runs through the tile the
 * way it runs through the page. The tail of the y comes down onto it. At 16
 * px it is what keeps two lines of letters from fusing into one grey bar.
 *
 * Colours are the page's own: ink #26231c and clay #a03f20 from :root, the
 * paper #fbf3e7 from the dawn field. Measured (WCAG 2.x / APCA):
 *   ink on paper   #26231c on #fbf3e7: 14.24:1 / Lc 96.0
 *   rail on paper  #a03f20 on #fbf3e7: 5.91:1 / Lc 74.9
 *   tile on Chrome's dark strip #202124: 14.62:1 / Lc -98.3
 * The paper tile is what makes the mark findable among dark icons; on white
 * (a result row, the light strip) it is 1.10 to 1.19:1 and the ink and the
 * rail carry it alone.
 *
 * The cut was made at dev time in the v11 mark lab (fontTools + uharfbuzz)
 * and is baked here, which is how the pilcrow was cut in 868de39: the page
 * and the build need no font tooling. To re-cut, shape the two words with
 * the parameters above and replace the paths; then run
 * `npm run assets:render-favicons`.
 */
export const PAPER = "#fbf3e7";
export const INK = "#26231c";
export const CLAY = "#a03f20";

const AYUSH =
  "M55 180h59v20h-59v-20zM73 231q0 4-3 6-2 3-8 3h-26q-6 0-8-3-3-2-3-6q0-3 1-5 2-3 4-5l2-1q2-2 3-4 2-1 4-8l21-68q2-5 1-7 0-2-3-4q-3-2-5-4-1-3-1-6q0-4 3-7 2-2 8-2h64q5 0 8 2 2 3 2 7q0 4-1 6-2 3-5 4q-2 1-2 4 0 2 1 6l20 62q3 9 4 13 2 4 5 6q4 2 5 4 2 3 2 7q0 4-3 6-2 3-8 3h-46q-5 0-8-3-2-2-2-6q0-4 1-6 2-2 5-4l3-1q2-2 1-4 0-2-2-7l-24-82h2l-24 77q-1 5-2 7-1 3 0 5q1 2 5 4l3 1q2 2 4 4 2 2 2 6zM237 228l-20 38-44-91q-2-4-4-5-2-2-5-4q-2-1-4-3-1-2-1-5q0-4 2-6 3-2 7-2h48q4 0 6 2 2 2 2 6q0 3-1 5-2 2-5 3l-2 1q-3 1-2 4 0 4 2 10l21 47zM211 248l2-3 8-12l20-51q3-6 2-10-1-4-4-5l-3-1q-2-1-4-3-1-2-1-5q0-4 2-6 2-2 6-2h27q4 0 6 2 3 2 3 6q0 3-1 5-1 2-4 3q-2 2-5 5-2 3-5 9l-25 59q-7 16-13 26-7 9-14 14q-7 4-16 4-15 0-23-7q-8-8-8-20 0-8 4-12q4-5 11-5 7 0 10 4q3 4 6 10l2 3q1 3 3 4 2 2 3 2q2 0 4-2 2-1 3-4q2-3 4-8zM346 223v-3l-2-1v-36q0-4-1-6-1-1-3-2l-1-1q-2-1-4-3-1-1-1-4q0-3 2-5 2-2 5-3l20-8q5-2 8-3 3-1 7-1q3 0 5 3 2 2 2 6v58q0 4 1 6 1 2 2 3l1 1q2 1 4 3 1 2 1 5q0 4-3 6-2 2-6 2h-20q-7 0-12-5-5-5-5-12zM284 213v-30q0-4-1-6-2-1-3-2l-1-1q-3-1-4-3-1-1-1-4q0-3 2-5 1-2 5-3l20-8q5-2 8-3 3-1 6-1q4 0 6 3 2 2 2 6v47q0 6 2 9 3 3 7 3q3 0 5-1 3-1 6-3l3-3 7 8l-4 4q-13 12-22 17-9 6-17 6q-12 0-19-9-7-8-7-21zM445 163q-5 0-7 1-2 2-2 4q0 2 1 3 1 2 2 3q2 1 5 1 16 3 26 8q9 5 14 12 4 7 4 15q0 15-10 24-11 9-32 9q-6 0-10-1-4-1-7-2q-3-1-5-1-2 0-4 1q-1 1-2 2-2 1-4 1q-3 0-5-2-3-2-5-7l-3-8q-3-7-1-11 1-5 5-6q4-2 9 0 4 1 7 5q3 4 7 7 3 3 7 5q4 2 9 2 5 0 8-2q2-3 2-6 0-2-1-4q-1-2-4-3-3-1-7-1q-15-2-23-7-9-4-13-11q-4-7-4-16 0-9 5-16q5-7 15-11 9-4 21-4q8 0 12 1 5 1 7 2q3 2 3 2 2 0 4-2q2-1 3-2 2-1 4-1q2 0 4 2 3 2 4 7l2 10q2 5 1 10-1 4-6 5q-3 1-6-1-4-2-7-6q-4-5-10-8-6-3-13-3zM541 182l-7-8 4-4q13-13 23-18 10-5 18-5q12 0 20 9 7 8 7 21v37q0 4 1 6 1 2 2 3l1 1q3 1 4 3 1 2 1 5q0 4-2 6-3 2-7 2h-39q-8 0-8-8 0-4 4-7l2-1q1-1 1-3 1-2 1-7v-27q0-6-3-9-2-3-7-3q-3 0-7 1-3 1-6 3l-3 3zM544 108v106q0 5 1 7 0 2 2 3l1 1q4 3 4 7 0 8-8 8h-39q-4 0-6-2-3-2-3-6q0-3 1-5 2-2 4-3l1-1q1-1 2-3 1-2 1-6v-79q0-4-1-6-1-1-3-2l-1-1q-2-1-4-3-1-1-1-4q0-3 2-5 2-2 5-3l20-8q5-2 8-3 3-1 7-1q3 0 5 3 2 2 2 6z";
const YADAV =
  "M109 483l-32 5-37-68q-2-4-3-6-1-2-4-4l-3-1q-2-2-4-4-1-3-1-6q0-4 3-7 2-2 8-2h49q5 0 8 2 3 3 3 7q0 7-6 10l-2 1q-4 2-4 5 0 2 2 8l23 45-18 9l29-57q2-4 2-6 0-2-3-4l-3-1q-2-2-3-4-2-2-2-6q0-4 3-7 3-2 8-2h24q5 0 8 2 3 3 3 7q0 3-2 5-1 3-3 4l-2 1q-1 1-2 2-1 1-3 3q-2 3-4 8l-32 61zM70 470h43v21q0 2 1 4 1 2 4 4l3 1q6 4 6 11 0 4-3 6q-2 3-8 3h-49q-6 0-8-3-3-2-3-6q0-7 6-11l3-1q3-2 4-4 1-2 1-4v-21zM214 505v-3h-3v-53q0-3-2-5-2-3-6-3q-2 0-4 2-2 1-2 3v5q0 8-5 13-5 4-15 4q-9 0-13-4-4-3-4-10q0-6 6-12 6-6 18-10q12-4 30-4 18 0 27 7q9 7 9 20v40q0 1 0 2 1 2 3 2q1 0 2-1 1 0 1 0q1-1 1-1 1 0 1 0q3 0 4 2 2 1 2 4q0 5-3 9-3 5-9 8q-6 3-13 3-11 0-18-5q-7-6-7-13zM157 500q0-13 12-21 12-7 31-7q6 0 10 0 4 1 7 2l-4 11q-2-1-4-2-2 0-4 0q-4 0-6 2-3 3-3 7q0 5 3 7 2 3 7 3q3 0 5-1 2-1 3-3l3 11q-5 7-13 10-9 4-19 4q-13 0-21-7-7-6-7-16zM337 500h-1v-85q0-4-1-6-1-1-3-2l-1-1q-2-1-4-3-1-1-1-4q0-3 2-5 1-2 5-3l20-8q5-2 8-3 3-1 6-1q4 0 6 3 2 2 2 6v106q0 4 1 6 0 2 2 3l1 1q2 1 3 3 2 2 2 5q0 4-3 6-2 2-6 2h-21q-6 0-11-5-6-4-6-10v-5zM270 478q0-15 6-26 6-12 17-18q11-7 24-7 12 0 20 5q8 5 15 15l-11 12q-3-7-7-9-4-2-8-2q-5 0-8 3-4 3-6 8q-2 6-2 15 0 9 3 14q2 6 5 9 4 3 9 3q4 0 8-3 4-3 7-10l7 8q-8 13-18 20-10 8-23 8q-11 0-19-6-9-6-14-16q-5-10-5-23zM452 505v-3h-3v-53q0-3-2-5-2-3-5-3q-3 0-5 2-1 1-1 3v5q0 8-6 13-5 4-15 4q-9 0-13-4-4-3-4-10q0-6 6-12 6-6 18-10q12-4 31-4 17 0 26 7q9 7 9 20v40q0 1 1 2 0 2 2 2q1 0 2-1 1 0 1 0q1-1 1-1 1 0 1 0q3 0 4 2 2 1 2 4q0 5-3 9-3 5-9 8q-5 3-13 3-11 0-18-5q-7-6-7-13zM395 500q0-13 12-21 12-7 32-7q5 0 9 0 4 1 7 2l-4 11q-2-1-4-2-1 0-4 0q-4 0-6 2-3 3-3 7q0 5 3 7 3 3 7 3q3 0 5-1 3-1 4-3l2 11q-5 7-13 10-9 4-19 4q-13 0-21-7-7-6-7-16zM566 522h-14q-5 0-9-3-3-3-6-9l-24-55q-1-2-2-5-1-2-2-3l-1-1q-2-1-4-3-1-2-1-5q0-4 2-6 3-2 7-2h47q8 0 8 8 0 3-2 5q-2 2-5 3l-1 1q-2 2-3 5-1 3 1 9l18 46h-9l17-45q2-6 1-10 0-3-3-5l-2-1q-2-1-4-3-1-2-1-5q0-4 2-6 2-2 6-2h24q4 0 7 2 2 2 2 6q0 3-1 5-1 1-4 3l-1 1q-1 1-3 4-1 3-4 9l-22 51q-2 6-6 9-4 2-8 2z";

export const siteMarkSvg = () =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">' +
  `<rect width="640" height="640" fill="${PAPER}"/>` +
  `<rect y="280" width="640" height="40" fill="${CLAY}"/>` +
  `<path fill="${INK}" d="${AYUSH}${YADAV}"/>` +
  "</svg>";
