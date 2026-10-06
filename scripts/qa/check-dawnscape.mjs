/**
 * The dawnscape gate — ¶13's ground and sky, measured in a browser.
 *
 * WHAT IT HOLDS. Round 8 drew a landscape under the morning's words and put
 * birds back in its sky, and every rule the owner and the plan set for that
 * is a measurement here rather than a sentence in a comment:
 *
 *   1. INK CLEARANCE. Every text node in .dawnwrap, taken as its own client
 *      rects (the ink, not the box), and the chrome's text (the nameplate,
 *      the run state, the stop chip), keeps clear air from every mark the
 *      drawing makes: the quote and its attribution 64px, everything else
 *      24. Round 9 drew the whole page, so a subject's bounding box is no
 *      longer a measure of anything (the tree's box wraps a corner and
 *      contains the quote): every <path> is SAMPLED along its length, every
 *      6px, through its screen matrix, and it is those points that keep
 *      their distance — plus what could move them: a roamer's ±30px home
 *      range, and for a swaying group the amplitude at that radius, so the
 *      wind cannot carry a leaf into a halo — the sun's two crown groups
 *      turn and are measured the same way. Under the signature the grass
 *      is capped at 10px. At every one of the sixteen seats.
 *      And THE LIGHT'S CLEARING (round 13): the sun rises behind the range,
 *      so the only things that may stand inside the crown's circle are the
 *      sun's own marks and the rock in front of it. Everything else lifts
 *      off it, which is what this drawing has instead of a glow. And every
 *      mark wearing an ACCENT class is inside the group that class belongs
 *      to: the light on .ds-sun, .ds-glit and .ds-eye, growth on .ds-tip,
 *      blossom on .ds-floret and .ds-petal, each in its own home.
 *   6. THE PLANES' MATERIALS (round 12). The range is fixed path data
 *      (RANGE), and .ds-p2 may hold nothing else: every path is a declared
 *      ridge line (.ds-ridge), a facet's hatch (inside a .ds-facet that
 *      carries its closed polygon, every stroke's ends on or inside it) or
 *      a hachure, all inside a .ds-summit, at most three facets a summit,
 *      and no solid or tone at all: far is line and hatch, near is solid.
 *      Nothing of the range comes below its FOOT (the valley floor it
 *      stands on, massifs.haze). And the reserves: the builder registers
 *      every near mass with the bare paper it casts into each plane behind
 *      it; the masks' <use> children (mR for the range and its valley
 *      floor, mB, mG) must be exactly that registry, each resolving to a
 *      live element, each dilated by twice its registered width, and each
 *      cast through the frame the registry declares for it (the tree's
 *      0.78, so its paper is where its crown is). The silhouettes they
 *      cast from are kept in the PAPER'S defs: the masses themselves are
 *      on the wind sheet now, and a mask the paper is cut by may not have
 *      a source anything can redraw.
 *   7. THE TREE STANDS BELOW EVERY SUMMIT (round 12, the owner: "tree's
 *      can't be as high as mountain"). The great tree's crown and every
 *      young tree's top sit at least 40px under the lowest summit on the
 *      sheet (peaks off the sheet do not count). And THE ROCK'S SHADOW IS
 *      NOT SKY: every far crossing flown in the sit, sampled along its own
 *      offset path, keeps 6px off every shadow face of the range except
 *      where a near mass stands in front of it.
 *   2. THE WIND'S CENSUS. Once body.morninglive is on, the continuously
 *      animated groups inside .dawnscape are CSS animations (transitions
 *      and Web Animations are transients and are not counted), and they
 *      match the BUILDER'S DECLARATION exactly: buildDawnscape tallies every
 *      continuous class it emits with its period (window.__world.scape
 *      .census), and this check holds the live count per class and every
 *      duration to that table. Nothing is hand-synced twice: a class emitted
 *      without a declaration, or a duration off the table, is a finding.
 *      The phone is capped at 8 on top of its own declaration.
 *      AND THEY ALL MOVE ON THE WIND SHEET. .dawnscape is a host div with
 *      two sibling svgs in it: .ds-paper, written once by the builder and
 *      never touched again, and .ds-wind, which carries every mark that
 *      moves. An animation on the paper drags all 750 paths through a
 *      raster every frame, which is the defect the split was made to end
 *      (measured 2026-10-06: 54ms p50 while moving and 30ms AT REST, the
 *      owner's Safari 26.6.2 and headless WebKit agreeing), so one
 *      animation on the paper is a finding, and a build that lifted
 *      nothing is a finding.
 *   3. REDUCED MOTION. The drawing is there, at opacity 1, with its paths;
 *      nothing inside it animates; the flock layer is display:none.
 *   4. PALETTE, AS A REGISTRY. Three inks draw freely (--ink, --ink-2,
 *      --hair-strong; never --hair, which is a hard red for check-palette,
 *      and never clay, pine or ember). Round 14's owner opened the palette
 *      for touches — "colors are allowed, just not the entire canvas to be
 *      colors" — so every colour token must be DECLARED with the classes it
 *      may appear on, an accent on any other selector is a finding, a token
 *      nobody declared is a finding, and a declared class whose rule has
 *      gone is a finding too, so the registry cannot rot into a comment.
 *  10. NOT THE ENTIRE CANVAS. The painted area of every coloured mark, a
 *      stroke by its length times its width and a fill by its box, against
 *      the sheet, at every seat. That is the owner's condition as a number:
 *      round 14 ships 0.10% to 0.19% and the cap is 0.6%.
 *  11. THE HORIZON IS DRAWN, NOT RULED. The longest CONTIGUOUS run of ink
 *      in the ground plane, subpath by subpath because every mark here is
 *      batched, stays under 0.2 W. The line this replaced measured 0.224.
 *  12. THE RIM LIGHT IS NOT ON THE DARK SIDE. Every canopy cut-line
 *      records its lobe and where the light was in its own frame, and the
 *      mean of the arc sits on the lit side of that lobe.
 *   9. A CAST FALLS AWAY FROM THE LIGHT. Every mark that claims to be a
 *      shadow (.ds-castshadow) carries the x of what casts it, and its own
 *      centre sits on the far side of that caster from the sun, by 2px.
 *      The grass's feet all hatched east whatever the hour, so the west
 *      half of a meadow lit from 0.503 W threw its shadows at the light.
 *   8. A MASK THAT MOVES IS THE SIZE OF WHAT IT MASKS. A mask on a group
 *      that sways (or inside one) is in that group's frame, so it is drawn
 *      again on every frame of the wind; its box, measured against the
 *      masked group's own bounding box, may be at most 2x its area. The
 *      leaf masks were three sheets square (about 110x the crown) and the
 *      owner saw the crowns and young trees blink, whole or by the tile.
 *   5. THE SKY IS ALIVE AND IN FRAME. A pace-compressed sit at his seat: a
 *      bird at visible ink within 2s of landing, no empty-sky gap over 40s of
 *      the page's own clock, no bird box within 8px of a viewport edge while
 *      it is visible, never more than three far birds at once; and on the
 *      ground, no roamer further from where it was drawn than the range it
 *      declares on its own group (data-range, which the runtime's clamps
 *      read back), with the doe's computed transform agreeing with the log
 *      that claims it. The drawn offset is held against the declaration at
 *      EVERY seat, not only at the seat the sit runs at.
 *
 * SHOWN RED BEFORE GREEN, each on a temp copy of out/ (never on out/ itself),
 * with `--root <dir>`:
 *   · the capped tuft moved under the last line and raised, `tuft(W * 0.50,
 *     60, …)` for `tuft(W * 0.62, 10, …)` → (1) fails on "run 043" twice, the
 *     air and the cap. (The same tuft raised to 60px where it stands, at
 *     0.62 W, stays green, and correctly so: it is 95px east of the line.)
 *   · the wind's media query changed to `@media all` → the source check
 *     fails (8 of 8 selectors outside the query). A browser cannot see this
 *     one, see the note at the check; it was green there before.
 *   · an unguarded `.dawnscape .ds-head{animation:graze …}` rule → (3)
 *     fails, one animation under reduced motion
 *   · a `.dawnscape .ds-far{stroke:var(--hair)}` rule → (4) fails
 *   · `farTimer = setTimeout(spawnFar, at(1500))` removed → (5) fails, gap
 *   · the hop range 30 → 70 and hop size 4–8 → 40–48 → (5) fails, x_off
 * Round 12, each on a temp copy with --only 1456x949:
 *   · a stray `<path class="ds-far w1" d="M0 0L40 40"/>` put into RANGE's
 *     markup outside any summit → (6) fails, a scattered stroke
 *   · a hatch facet put into the notch peak 36px over the kicker → (1)
 *     fails on the hatch rule alone, 35.7 of 64px from ds-facet
 *   · a .ds-fill put into a summit → (6) fails, solid in the far plane
 *   · the range seated with its foot at 0.46 H instead of 0.375 → (1)
 *     fails, a ridge in the kicker's 64px (61.7), and (7) two crossings
 *   · FOOT read 40 board units high → (6) fails, range below its foot
 *   · mR built from the grass plane instead of the massif plane → (6)
 *     fails, reserves missing from mR
 *   · the tree's reserves cast outside its transform → (6) fails, 19
 *     reserves off their frame
 *   · mask="url(#mR)" taken off the valley floor → (6) fails, unmasked
 *   · the tree's scale 0.78 → 1 → (7) fails, crown above the summits
 *   · routeClear returning true → (7) fails, a crossing over a face
 * Check 8, on the build of 7e8d916 (the leaf masks three sheets square):
 *   · (8) fails on all four moving masks at 1456x949, mC1 278x, mC2 112x,
 *     mS1 711x, mS2 1278x; the builder's own box measures 1.44x
 * Round 13, the sun behind the range. Run by labrat on 2026-09-26 against
 * r13/merge at 51b6691, each on a temp copy of out/, with the measured line
 * recorded here; the positive controls (check-palette and check-figures on
 * the unmodified copies) exit 0:
 *   · `.dawnscape .ds-tuft{stroke:var(--sun-g)}` added → (4) fails: "--sun-g
 *     is named by 2 .dawnscape rules — it is the sun's colour and it gets
 *     exactly one selector"
 *   · the sun's rule reselected to `.dawnscape .ds-ink` → (4) fails:
 *     "--sun-g is drawn by ".dawnscape .ds-ink" — only ".dawnscape .ds-sun"
 *     may carry the light's colour"
 *   · `--sun-g` deleted from `:root[data-night]` → check-palette fails: a
 *     figure stroke in --sun-g draws at 2.88:1 / Lc 27.0 on the night field
 *     #43372f, under the 3:1 graphic floor — the 2.88 the author predicted
 *   · class "ds-sun" put on one grass blade in `tuft()` → (1) fails at
 *     1456×949: "17 path(s) wear .ds-sun outside the sun's own groups"
 *   · the `inLight` term dropped from `skyPiece` → (1) fails at 1456×949:
 *     "ds-back stands 87.5px from the sun", of the crown's 122px clearing
 *   · the `inLight` term dropped from `cut` → (1) fails at 390×844:
 *     "ds-vale stands 29.5px from the sun", of a 56px clearing — on the
 *     phone, as predicted
 *   · `"ds-rays"` removed from PERIOD → red, but BY CRASH and not by the
 *     intended message: the builder throws at live(), the scape never
 *     publishes, and check 7 then dies in page.evaluate reading `faces` of
 *     undefined, which hid the rest of the seat. Guarded in 05450ca; the
 *     probe is owed again on a build that carries the guard
 *   · `--amp` raised on `.ds-rays` from 1.4deg to 6deg without re-breaking
 *     the rays → (1) fails, but NOT at the seat the author predicted: at
 *     1280×720 the crown clears by 2.4px (33.3px of the 30.9px owed) and
 *     6deg is not enough. It fires at 1375×800 (31.4 of 33.7), 1165×759
 *     (31.1 of 32.4) and 1366×768 (32 of 32.5); at 1280×720 it takes 12deg
 *     (33.3 of 38) or 24deg (33.3 of 53.3)
 *   · the same on `.ds-rays2`, whose --amp is NEGATIVE: -1deg → -6deg is
 *     SILENT at all sixteen seats, and -12deg is the one that fires, at
 *     1280×720 ("#mast .state" is 36px from ds-rays2 and needs 36.5px);
 *     -24deg needs 50.1px. So the probe does what it was written for — the
 *     check's Math.abs on --amp (below) is sound for the group that turns
 *     the other way — at twice the author's amplitude. A signed tangent
 *     would have made that group's clearance requirement SMALLER the faster
 *     it turned, and nothing else here would have noticed
 * Round 14. The first line here is a correction as much as a probe: the
 * audit that asked for the declared height predicted an 11px swing in the
 * doe's live box across her graze, and the measurement is 2.4px.
 *   · her box top stepped over the whole cycle at 1456×949 measures 60.6 to
 *     63.0, so the rule's own third ran 24.20 to 25.00 by the frame the
 *     gate happened to sample, against a tallest blade of 22.4: the flake
 *     was latent with 1.8px to spare, not live. The declaration does not
 *     move, which is the reason to read it
 *   · the pose dependency shown, on a copy with the corner stand raised to
 *     a rise of 24.50 (h 27.5) and held still: the OLD measure fires with
 *     the graze held at 0.24 of its cycle (her box 60.59, cap 24.20) and is
 *     silent with it held at 0.56 (62.97, cap 24.99); the declared measure
 *     (cap 24.73) is silent at both. The margins are 0.30, 0.49 and 0.23px,
 *     which is the whole size of the effect. Both poses are HELD at
 *     playbackRate 0 rather than paused, because check 2 fails an animation
 *     that is not running, and only the doe and that one stand are held,
 *     because an animation held at its own local time 0 drops out of
 *     getAnimations() and would take the census two short
 *   · a tuft raised to `doeH/3 + 8` → the meadow check fails
 *   · the phone doe declared range 12 and then drawn 28px from home → the
 *     per-seat roamer check fails at 390×844. (Held there by a script in
 *     the copy, not by the hop: hopWalk is module-scoped and cannot be
 *     called from outside. What the probe proves is the CHECK, which is
 *     what makes the declaration binding on the phone at all — the sky sit
 *     that used to hold this runs at 1456×949 only.)
 *   · the mirror reverted in `shadowFoot` → the cast-shadow check fails on
 *     every tuft west of the sun
 *   · each petal emitted as its own `.ds-leaf.airborne` → the sit's
 *     "never two leaves in the air" fails
 *   · a blossom radius of 0.6 → the blossom floor fails
 * Round 16, THE LAYER SPLIT, owed to labrat against the gate itself:
 *   · the lift's selector cut back to drop one declared class (say
 *     `.ds-rays`) -> (2) fails on the paper sheet, 2 animations left on
 *     it; the census itself stays green, which is why the second measure
 *     is here at all
 *   · liftTheLiving returning 0 before it moves anything -> (2) fails,
 *     nothing lifted, at every seat
 *   · round 12's two reserve probes are owed again, because the thing they
 *     read moved: the mass is found by data-res now and the silhouette
 *     lives in defs. Both are PREDICTED red, neither is measured: the
 *     tree's frame dropped from useRes (the wrapper goes, the mass is
 *     still inside .ds-treeframe), and the registration itself deleted
 *     (`for (const q of reserves.slice(res0)) q.tf = treeT`, which drops
 *     the same wrapper from the other end). A gate bound to reserves[].tf
 *     would have been silent on the second one, which is why it is not
 *     bound to it. The 18-off figure measured during this round was the
 *     OLD DOM test read against the split build, not either probe
 *   · the silhouettes left in the drawing instead of defs -> green here,
 *     and that is the limit of this gate: whether the paper's layer is
 *     rebuilt is a frame-time measurement, not a DOM one
 *   · the overlap pass dropped (the companion `units.add(kid)`) -> nothing
 *     in this gate goes red: it is a paint-order claim, and what holds it
 *     is the reduced-motion screenshot diff against the build before the
 *     split, which is where this drawing's "same marks, same places" has
 *     always been measured
 * Round 14 phase B, each verified by picasso with its own instrument and
 * owed to labrat against the gate itself:
 *   · the ruled horizon put back beside the brow → (11) fails, 325.9px of
 *     unbroken ink at 1456×949, which is 0.224 W against a cap of 0.2
 *   · the rim light turned back west whatever the hour → (12) fails on 39
 *     of 65 cut-lines
 *   · an accent painted on a class it is not declared for (--bloom-p on
 *     .ds-far) → (4) fails, the colour is off its registry
 *   · one floret blown up to r 200 → (10) fails at 48.97% of the sheet
 *   · a daisy on a 40px stem → the meadow rule fails at fourteen flowers,
 *     rise 43.5 against a cap of 24.73
 *   · the daisies built closed → the reduced-motion seat fails, 0 of 14
 *   · the daisies opened with a one-iteration @keyframes → (4)'s arc rule
 *     fails at the source. NOT the census, and labrat measured why: the
 *     census is taken a few hundred ms after landing and the first daisy is
 *     due at 6s, so at the moment it counts, 0 of 14 are open and the
 *     animation it would have counted does not exist yet. A gate that can
 *     only see a defect three seconds after it stops looking is not a gate
 *   · NOTE for round 13's P1, P2 and P4: all three still fire, but the
 *     wording they matched has changed with the registry, so their recorded
 *     lines are owed a re-run rather than a re-read
 *
 *   node scripts/qa/check-dawnscape.mjs [--root out] [--only 1456x949]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const argv = process.argv.slice(2);
const argOf = (name) => {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : null;
};
const OUT = resolve(process.cwd(), argOf("--root") ?? "out");
const ONLY = argOf("--only");

/** every seat the owner reads this page at, his own 1456×949 first */
const SEATS = [
  [1456, 949],
  [1512, 982],
  [1440, 900],
  [1375, 800],
  [1280, 800],
  [1728, 1117],
  [1800, 1169],
  [1920, 1080],
  /* the short sheets: his own window at 125% zoom, the recruiters' 1366 and
     1536 laptops, and two lower still. The words-on-the-plain layout ran
     into the horizon, the sun and the crown at every one of them until the
     layout was derived from the room (layMorning) */
  [1165, 759],
  [1366, 768],
  [1536, 864],
  [1280, 720],
  [1024, 768],
  [390, 844],
  [393, 851],
  [320, 720],
].filter(([w, h]) => !ONLY || ONLY === `${w}x${h}`);

const CLEAR_PX = 24;
const RANGE_PX = 30;
const GRASS_CAP = 10;
const PHONE_MAX = 8;
const PATHS_FLOOR = 6;
/* the smallest radius a blossom hole may be cut at: under 1.2 it is 2.4px
   across, and a cut narrower than that is a device pixel at DPR 1 */
const BLOSSOM_MIN = 1.2;
/* the share of the sheet coloured ink may paint. Set from what round 14
   ships with a wide margin, not from a round number: see check 10. */
const COLOUR_CAP = 0.006;
/* the longest unbroken run of ink the ground plane may carry, as a share of
   the sheet's width. The ruled horizon this replaces measured 0.24 W. */
const RULED_RUN = 0.2;
/* the box a mask may carry over what it masks, when the two move together:
   the builder's is a tenth over each side, 1.44x */
const MOVING_MASK_MAX = 2;

const fails = [];
const notes = [];
const fail = (m) => fails.push(m);
const note = (m) => notes.push(m);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".bin": "application/octet-stream",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

async function serve() {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    let file = join(OUT, p);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, {
        "content-type": MIME[extname(file)] ?? "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, r));
  return { server, port: server.address().port };
}

/* ————— 4 · the palette, read off the shipped page ————— */
{
  const html = await readFile(join(OUT, "index.html"), "utf8");
  const rules = [...html.matchAll(/\.dawnscape[^{]*\{([^}]*)\}/g)].map(
    (m) => m[1]
  );
  const tokens = new Set();
  for (const body of rules)
    for (const m of body.matchAll(/var\(--([\w-]+)\)/g))
      tokens.add(`--${m[1]}`);
  /* THE ACCENT REGISTRY. The sheet was ruled ink-only; round 13 lifted the
     ruling for the sun; round 14's owner lifted it for touches anywhere
     they make the morning feel real, with one condition — "not the entire
     canvas to be colors". So the old leash (one rule, one selector, for the
     sun alone) is replaced rather than deleted, by two things that say the
     same thing about a bigger palette:
       (a) THIS registry. Three inks draw freely. Every colour token must be
           declared here with the classes it is allowed on, the rule for
           each declared class must exist, and an accent on any other
           selector is a finding. A token nobody declared is a finding too.
       (b) A COVERAGE CAP, measured in the browser at every seat (check 10),
           which is the owner's condition as a number instead of a promise.
     The drawing side — no element wearing an accent class outside the group
     that class belongs to — is held at the clearance check, which reads the
     shipped DOM. */
  const INKS = new Set(["--ink", "--ink-2", "--hair-strong"]);
  const ACCENTS = {
    /* the LIGHT: the sun's own rim and rays, the light on water, and the
       heart of a flower, which is the thing the light opens */
    "--sun-g": [
      ".dawnscape .ds-sun",
      ".dawnscape .ds-glit",
      ".dawnscape .ds-eye",
    ],
    /* NEW GROWTH: a living blade's tip, and a daisy's stem */
    "--leaf-g": [".dawnscape .ds-tip"],
    /* BLOSSOM: a floret in the crown, and a petal on its way down */
    "--bloom-p": [".dawnscape .ds-floret", ".dawnscape .ds-petal"],
  };
  const ruleBy = [...html.matchAll(/(\.dawnscape[^{]*)\{([^}]*)\}/g)].map(
    (m2) => [m2[1].trim(), m2[2]]
  );
  const strays = [];
  const declaredUsed = new Set();
  for (const [sel, body] of ruleBy)
    for (const m2 of body.matchAll(/var\(--([\w-]+)\)/g)) {
      const t = `--${m2[1]}`;
      if (INKS.has(t)) continue;
      if (!ACCENTS[t]) {
        strays.push(`${t} is not in the accent registry (on "${sel}")`);
        continue;
      }
      if (!ACCENTS[t].includes(sel))
        strays.push(`${t} is drawn by "${sel}", which it is not declared for`);
      else declaredUsed.add(`${t}|${sel}`);
    }
  /* the registry reads both ways: a declared class whose rule has gone is a
     claim about a colour nobody paints any more */
  const dead = Object.entries(ACCENTS).flatMap(([t, sels]) =>
    sels
      .filter((s) => !declaredUsed.has(`${t}|${s}`))
      .map((s) => `${t} on ${s}`)
  );
  if (!rules.length)
    fail(
      "no .dawnscape rules in out/index.html: the ground is not styled, or the class moved"
    );
  if (strays.length)
    fail(
      `the dawnscape's colour is off its registry — ${strays.join("; ")}. Three inks draw freely; a colour draws only where it is declared`
    );
  else if (dead.length)
    fail(
      `the registry declares ${dead.join(", ")}, and no .dawnscape rule paints it — a colour claim nobody draws`
    );
  else
    note(
      `palette: ${rules.length} .dawnscape rules, inks ${[...tokens].filter((t) => INKS.has(t)).join(", ")}, accents ${Object.keys(
        ACCENTS
      )
        .filter((t) => tokens.has(t))
        .map((t) => `${t} on ${ACCENTS[t].length}`)
        .join(", ")} declared class(es) each`
    );
  /* THE WIND MUST LIVE INSIDE THE NO-PREFERENCE QUERY, and this has to be
     read off the source, because a browser cannot see it: under reduced
     motion the carry is instant, releaseScroll never runs, body.morninglive
     is never set, and a wind rule outside the query animates nothing an RM
     reader is shown. Shown green on exactly that negative before this
     check existed. So every body.morninglive .dawnscape selector is counted
     against the ones found inside a brace-matched no-preference block. */
  /* AN ARC IS A TRANSITION, NOT AN ANIMATION. Everything on this sheet
     that happens ONCE — a daisy opening, the chicks rising, a socket
     filling, a leaf fading, the owl arriving — changes state by adding a
     class and letting a transition carry it. A one-iteration @keyframes
     would look identical and be counted by nothing: the census reads
     CSSAnimation, and it is taken a few hundred ms after landing, when the
     first daisy is still eight seconds from opening. So this is held at the
     SOURCE, the way the wind's own no-preference rule is: no .dawnscape
     rule may put `animation` on a class that carries an arc. */
  const ARC_CLASSES = [
    "ds-daisy",
    "ds-budg",
    "ds-bloomg",
    "ds-chicks",
    "ds-leaf",
    "ds-perch",
    "ds-nestsock",
    "ds-owl",
    "ds-twig",
  ];
  /* ONE ENTRY PER RULE, not one per class it happens to name: a selector
     like `.ds-daisy.open .ds-bloomg` carries two arc classes and was
     counted twice, so the gate said "2 rules" over one rule printed
     twice. */
  const arcAnim = [];
  for (const [sel, body] of ruleBy)
    if (
      /(^|[^-])animation\s*:/.test(body) &&
      ARC_CLASSES.some((c) => sel.includes(c))
    )
      arcAnim.push(`${sel} { animation … }`);
  if (arcAnim.length)
    fail(
      `${arcAnim.length} .dawnscape rule(s) animate a one-time arc — ${arcAnim.slice(0, 3).join("; ")}. An arc is a class and a transition: a one-iteration @keyframes reads the same and is counted by nothing, because the census is taken before the first of them is due`
    );
  else
    note(
      `no .dawnscape rule animates any of the ${ARC_CLASSES.length} arc classes`
    );
  const live = [...html.matchAll(/body\.morninglive \.dawnscape/g)].length;
  let guarded = 0;
  const head = "@media (prefers-reduced-motion: no-preference){";
  for (let i = html.indexOf(head); i > -1; i = html.indexOf(head, i + 1)) {
    let depth = 1;
    let j = i + head.length;
    while (j < html.length && depth) {
      if (html[j] === "{") depth++;
      else if (html[j] === "}") depth--;
      j++;
    }
    guarded += [...html.slice(i, j).matchAll(/body\.morninglive \.dawnscape/g)]
      .length;
  }
  if (!live) fail("no body.morninglive .dawnscape rule: the wind is gone");
  else if (guarded < live)
    fail(
      `${live - guarded} of ${live} body.morninglive .dawnscape selectors sit outside a prefers-reduced-motion: no-preference block — a reduced-motion reader who gets the wind is not measurable in a browser, so this is held at the source`
    );
  else
    note(
      `${live} morninglive rule selectors, all inside a no-preference query`
    );
}

const { server, port } = await serve();
const base = `http://127.0.0.1:${port}/`;
let browser;
try {
  const { chromium } = await import("@playwright/test");
  browser = await chromium.launch();

  /* to the morning: scroll to the end, approve, wait for the carry to let go */
  async function land(page, pace) {
    await page.goto(`${base}?pace=${pace}`, { waitUntil: "load" });
    await page
      .waitForSelector("html[data-np-ready]", { timeout: 20000 })
      .catch(() => {});
    await page.waitForTimeout(400);
    await page.evaluate(() =>
      scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      })
    );
    await page.waitForTimeout(400);
    await page.click("#approve");
    await page.waitForFunction(
      () =>
        document.body.classList.contains("atmorning") &&
        !document.body.classList.contains("carrying") &&
        document.body.classList.contains("morninglive"),
      null,
      { timeout: 30000 }
    );
  }

  /* the measurement, in the page: text ink vs subject boxes, the grass cap,
     and the animation census */
  const MEASURE = ({ CLEAR_PX, RANGE_PX, GRASS_CAP }) => {
    /* THE HOST, AND THE TWO SHEETS IN IT. .dawnscape is a div now: the
       drawing is two sibling <svg>s inside it, .ds-paper (written once,
       never touched again, so a scroll composites it instead of
       rasterising 750 paths) and .ds-wind (everything that moves). Every
       selector below reads the whole drawing through the host exactly as
       it did when the host WAS the svg; the point factory is the paper's,
       which carries the viewBox both sheets are drawn in — the same one,
       so every screen matrix and every transform-origin here means what it
       always meant. */
    const svg = document.querySelector(".dawnscape");
    const sheet = document.querySelector(".dawnscape .ds-paper");
    const wrap = document.querySelector(".dawnwrap");
    const scape = window.__world.scape;
    /* the words: each text node's own rects with its halo, and the chrome */
    const texts = [];
    const walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      const quote = !!n.parentElement.closest(".endquote");
      const kind = quote
        ? "quote"
        : n.parentElement.closest(".kicker")
          ? "kicker"
          : "word";
      const halo = quote ? 64 : CLEAR_PX;
      for (const r of rg.getClientRects())
        if (r.width && r.height)
          texts.push([
            r.left,
            r.top,
            r.right,
            r.bottom,
            halo,
            n.textContent.trim().slice(0, 20),
            kind,
          ]);
    }
    for (const sel of ["#mast a", "#mast .state", "#mtoggle"]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width && r.height && getComputedStyle(el).visibility !== "hidden")
        texts.push([r.left, r.top, r.right, r.bottom, CLEAR_PX, sel, "chrome"]);
    }
    /* the ink: every path sampled along its length through its screen
       matrix, plus what could move the point: a roamer's range, a sway's
       amplitude at that radius */
    const pt = sheet.createSVGPoint();
    let worst = { margin: Infinity, gap: 0, need: 0, text: "", sub: "" };
    let samples = 0;
    const toneEls = [];
    const toneAt = (x, y) => {
      const q = sheet.createSVGPoint();
      q.x = x;
      q.y = y;
      return toneEls.some((t) => t.isPointInFill(q));
    };
    /* every sampled point, kept for the edge walk */
    const pts = [];
    /* THE LIGHT'S CLEARING. The sun used to sit on the meadow and the rule
       was "nothing but the horizon and its own arcs" — the .ds-line plane —
       within 3.5 radii. It rises behind the rock now, so the two things that
       may stand inside its clearing are ITS OWN MARKS and THE RANGE, which
       is in front of it; everything else (the etched sky, the haze, the
       vale, the tree, the meadow, a creature) lifts off it, because bare
       paper is what this drawing has instead of a glow.
       Measured on the SCREEN point, not the raw one: the tree and the range
       are drawn inside their own transforms, so a raw path coordinate is in
       a different frame from scape.sun and the old comparison was measuring
       board units against viewport pixels. */
    const sun = scape && scape.sun;
    let halo = { d: Infinity, sub: "" };
    /* EVERY MARK THAT WEARS AN ACCENT, AND WHERE IT IS. Check (4) holds the
       rule that says which class may carry which colour; this holds the
       drawing that obeys it, one home per class. A blush petal in the
       canopy or a gold ray on the grass would pass the stylesheet and be a
       different drawing. */
    const ACCENT_HOME = {
      "ds-sun": ".ds-sundisc, .ds-rays, .ds-rays2",
      "ds-glit": ".ds-pool",
      "ds-eye": ".ds-daisy",
      "ds-tip": ".ds-blades, .ds-daisy",
      "ds-floret": ".ds-canopy, .ds-sap",
      "ds-petal": ".ds-leaf",
    };
    let sunOff = [];
    let colourPx = 0;
    for (const el of svg.querySelectorAll(
      ".ds-sun, .ds-glit, .ds-eye, .ds-tip, .ds-floret, .ds-petal"
    )) {
      const cls = Object.keys(ACCENT_HOME).find((c) =>
        el.classList.contains(c)
      );
      if (cls && !el.closest(ACCENT_HOME[cls]))
        sunOff.push(`${cls} outside ${ACCENT_HOME[cls]}`);
      /* and its painted area, in screen px: a stroke is its length times
         its width, a fill is its box, both through the element's own
         screen matrix (the tree draws at 0.78). The box overstates a disc
         by 4/π, which is the right direction for a cap. */
      const mm = el.getScreenCTM();
      const sc = mm ? Math.abs(mm.a * mm.d - mm.b * mm.c) : 1;
      const cs = getComputedStyle(el);
      const sw = parseFloat(cs.strokeWidth) || 0;
      if (cs.stroke !== "none" && sw && el.getTotalLength)
        colourPx += el.getTotalLength() * sw * sc;
      if (cs.fill !== "none") {
        const bb = el.getBBox();
        colourPx += bb.width * bb.height * sc;
      }
    }
    for (const p of svg.querySelectorAll("path")) {
      /* a mask's or a pattern's path is a hole or a tile, not a mark; a
         tone field's outline is not a mark either (its dots stop at the
         mask's cuts, which the reserve gate holds), but the field counts
         for the edge walk */
      if (p.closest("defs")) continue;
      if (p.classList.contains("ds-tone")) {
        toneEls.push(p);
        continue;
      }
      const L = p.getTotalLength();
      if (!L) continue;
      const m = p.getScreenCTM();
      const inSun = !!p.closest(".ds-sundisc, .ds-rays, .ds-rays2");
      const inRock = !!p.closest(".ds-p2");
      /* (the accent classes are walked above, over every element rather
         than over paths alone, because a floret is a circle) */
      /* a roamer declares its own axis and range on its group */
      const roamer = p.closest("[data-range]");
      const range = roamer ? +roamer.dataset.range : 0;
      const axisY = roamer && roamer.dataset.axis === "y";
      /* a group that turns about its own origin: every sway- class, and the
         sun's two crown groups, which declare --amp the same way and would
         otherwise be measured as if they never moved */
      const sw = p.closest("[class*=sway-], [class*=ds-rays]");
      let ox = 0,
        oy = 0,
        tanA = 0;
      if (sw) {
        const o = (sw.style.transformOrigin || "0px 0px")
          .split(" ")
          .map(parseFloat);
        ox = o[0];
        oy = o[1];
        /* ABSOLUTE. --amp carries a direction as well as a size — the sun's
           second crown group turns -1deg against the first — and a signed
           tangent makes every clearance LOOSER for the group that turns the
           other way, which is a gate arguing itself down. A mark's travel is
           the same either way round. */
        const amp = Math.abs(
          parseFloat(getComputedStyle(sw).getPropertyValue("--amp")) || 0
        );
        tanA = Math.tan((amp * Math.PI) / 180);
      }
      const g = p.parentElement;
      const sub = (
        (g && g !== svg && g.className.baseVal) ||
        p.className.baseVal ||
        "path"
      ).trim();
      /* hatch keeps the quote's own 64px from every word and 48px from
         the chrome; a ridgeline keeps 64px from the quote and the kicker.
         (Round 10's 120 was set for hatch fields flanking the column; the
         range stands above it now, across its valley floor.) */
      const isHatch = p.classList.contains("ds-hatch");
      const isRidge = p.classList.contains("ds-ridge");
      const step = L > 3000 ? 10 : 6;
      for (let s = 0; s <= L; s += step) {
        const q = p.getPointAtLength(s);
        pt.x = q.x;
        pt.y = q.y;
        const v = pt.matrixTransform(m);
        const sway = tanA ? Math.hypot(q.x - ox, q.y - oy) * tanA : 0;
        samples++;
        pts.push([v.x, v.y]);
        if (sun && !inSun && !inRock) {
          const d = Math.hypot(v.x - sun.x, v.y - sun.y) - range - sway;
          if (d < halo.d) halo = { d: +d.toFixed(1), sub };
        }
        for (const t of texts) {
          /* the range is a roam, and a roam is along x only */
          const dx = Math.max(t[0] - v.x, v.x - t[2], 0) - (axisY ? 0 : range);
          const dy = Math.max(t[1] - v.y, v.y - t[3], 0) - (axisY ? range : 0);
          const gap = Math.max(dx, dy, 0);
          const need = isHatch
            ? t[6] === "chrome"
              ? 48
              : 64
            : isRidge && (t[6] === "quote" || t[6] === "kicker")
              ? 64 + sway
              : t[4] + sway;
          if (gap - need < worst.margin)
            worst = {
              margin: +(gap - need).toFixed(1),
              gap: +gap.toFixed(1),
              need: +need.toFixed(1),
              text: t[5],
              sub,
            };
        }
      }
    }
    /* the grass under the signature: the rule exists so the tallest ink stays
       clear of the LAST line, so the column here is that line's own ink
       extent, "run 043 · not yet begun", wherever this seat puts it */
    const runRects = [];
    const rw = document.createTreeWalker(
      document.querySelector(".dawnrun"),
      NodeFilter.SHOW_TEXT
    );
    for (let n = rw.nextNode(); n; n = rw.nextNode()) {
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width) runRects.push(r);
    }
    const colL = Math.min(...runRects.map((r) => r.left)) - CLEAR_PX,
      colR = Math.max(...runRects.map((r) => r.right)) + CLEAR_PX,
      colB = Math.max(...runRects.map((r) => r.bottom));
    /* a tuft in the near foreground, standing wholly BELOW the signature, is
       not under it; the clearance measure holds its 24px like any mark */
    const tallUnder = [...svg.querySelectorAll(".ds-tuft")]
      .map((el) => {
        const b = el.getBoundingClientRect();
        return { x: +el.dataset.x, h: b.height, top: b.top };
      })
      .filter(
        (t) =>
          t.x >= colL && t.x <= colR && t.top < colB && t.h > GRASS_CAP + 1.5
      );
    const decl = (scape && scape.census) || [];
    /* the meadow at the cast's scale: no tuft rises above a third of the
       doe, measured from its own base to its bbox top against her height
       from the ground line to her ears (4px for the hand and the sway).
       HER HEIGHT IS THE BUILDER'S DECLARATION, not her live box. Measured
       over the whole graze at 1456×949: her box top runs 60.6 to 63.0, so
       this rule's own third ran 24.20 to 25.00 by the frame the gate
       sampled, against a tallest blade of 22.4. The swing is 0.8px and not
       the 11px the round 14 audit estimated — the ears turn about the neck
       joint, so dipping her head 38° barely lowers their tips — but a gate
       that moves with the pose it measures cannot be read either way. */
    const doeH = (scape && scape.doeH) || 0;
    /* the daisies stand in the same meadow and answer to the same rule:
       a flower taller than a third of the doe is not a daisy */
    const meadow = [
      ...svg.querySelectorAll(".ds-tuft[data-y], .ds-daisy[data-y]"),
    ]
      .map((el) => ({
        x: +el.dataset.x,
        rise: +(+el.dataset.y - el.getBoundingClientRect().top).toFixed(1),
      }))
      .filter((t) => doeH && t.rise > doeH / 3 + 4);
    /* 12 · THE RIM LIGHT IS ON THE LIT SIDE. The canopy's cut-lines are the
       light on the foliage, and they always began on the upper WEST of a
       lobe whatever the hour. Each one records the lobe it belongs to and
       where the light was IN ITS OWN FRAME (the tree draws inside its own
       transform), so this is check 9 read the other way round: a rim light
       is never cut on the DARK side of its lobe, by more than a pixel.
       Not "is on the lit side": measured, a west cut that runs the long end
       of its span sweeps from due west over the top and comes back almost
       symmetric in x, so the strong form reports five false findings a seat
       on the saplings' small lobes. What the turn actually changed is the
       east cuts, and they measure 0.71 to 0.90 of a radius toward the
       light; the old west ones measure 0.03 to 0.47 the other way.
       Measured on the geometry, not the box: these paths live in a mask. */
    const rims = [...svg.querySelectorAll("defs mask path[data-x]")]
      .map((p) => {
        const L = p.getTotalLength();
        if (!L) return null;
        const at = +p.dataset.x,
          lit = parseFloat(p.dataset.lit);
        if (!Number.isFinite(at) || !Number.isFinite(lit)) return null;
        /* the MEAN of the arc, not its midpoint: a cut that sweeps from the
           west round to the top has its midpoint over the lobe's own
           centre, where x says nothing at all. Nine samples say which half
           of the lobe the light is on. (Measured the hard way: the midpoint
           form reported 1 to 5 false findings a seat, all on small lobes
           whose cut ends near the top.) */
        let sx = 0;
        for (let i = 0; i <= 8; i++) sx += p.getPointAtLength((L * i) / 8).x;
        return { at, lit, away: +(sx / 9 - at).toFixed(1) };
      })
      .filter(Boolean);
    const rimDark = rims.filter((q) => q.away * Math.sign(q.lit - q.at) < -1);
    /* 11 · THE HORIZON IS DRAWN, NOT RULED. It was one full-width line in
       six pieces and it was the only ruled thing on a sheet that is
       otherwise all marks. What holds the replacement is not "there are
       ticks" — that is a rule made of ticks — but the length of the longest
       CONTIGUOUS run of ink in the ground plane: a subpath, not a batched
       path, because every mark here is batched (one path carries a whole
       clump, or a whole hatch field) and their totals mean nothing. The old
       line's longest run measured 0.24 W; the brow's longest is an edge
       piece at 0.14 W. */
    let runLong = { len: 0, of: "" };
    const lineG = svg.querySelector(".ds-line");
    if (lineG) {
      const probe = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      svg.appendChild(probe);
      for (const p of lineG.querySelectorAll("path")) {
        const d = p.getAttribute("d") || "";
        for (const piece of d.split(/(?=M)/)) {
          if (piece.length < 4) continue;
          probe.setAttribute("d", piece);
          const L = probe.getTotalLength();
          if (L > runLong.len)
            runLong = { len: +L.toFixed(1), of: p.className.baseVal || "path" };
        }
      }
      probe.remove();
    }
    /* THE BLOSSOM IS A HOLE, AND A HOLE UNDER A DEVICE PIXEL IS NOTHING.
       The florets are cut out of each canopy's own mask, and they were
       authored at r 0.6–0.9: 1.2 to 1.8px across, which at DPR 1 is under
       one device pixel, so the spring tree the owner asked for carried
       blossom nobody could see. Nothing cut into a leaf mask is smaller
       than 1.2. (A pattern's dots are tone, not a cut, and are not here.) */
    const florets = [...svg.querySelectorAll("defs mask circle")].map(
      (c) => +c.getAttribute("r")
    );
    /* 9 · A CAST MARK FALLS AWAY FROM THE LIGHT. Every mark that claims to
       be a shadow wears .ds-castshadow and the x of the thing that casts
       it, and its own centre must sit on the far side of that caster from
       the sun — by 2px, so a foot that merely lies UNDER its caster is a
       finding too. The tufts' feet all hatched east whatever the hour, and
       the sun is at 0.503 W, so the west half of the meadow was throwing
       its shadows toward the light. */
    const casts = [];
    if (sun)
      for (const el of svg.querySelectorAll(".ds-castshadow")) {
        const b = el.getBoundingClientRect();
        let from = +el.dataset.x;
        if (!b.width || !Number.isFinite(from)) continue;
        /* a roamer's rake is drawn inside the roamer, so it travels with
           it: home is where the creature IS, not where it was drawn, or a
           hare at the far end of its range casts what reads as a shadow on
           the wrong side of itself */
        const rg = el.closest("[data-range]");
        if (rg && rg.dataset.axis !== "y") {
          const n = (rg.style.transform || "")
            .replace(/^translate\(/, "")
            .split(",")
            .map(parseFloat);
          from += n[0] || 0;
        }
        const away = (b.left + b.right) / 2 - from;
        casts.push({
          from: +from.toFixed(1),
          away: +away.toFixed(1),
          lit: Math.sign(from - sun.x),
        });
      }
    const wrongSide = casts.filter((c) => c.away * c.lit <= 2);
    /* EVERY DECLARED ROAMER, AT EVERY SEAT: drawn no further from home than
       the range it declares. The sky sit holds this too (below), but only
       at his own seat and only for a creature something moved in the sit —
       a phone roamer is never stepped there, so the phone's own declaration
       was unheld until this round wrote one. */
    const strayed = [...svg.querySelectorAll("[data-range]")]
      .map((el) => {
        const n = (el.style.transform || "")
          .replace(/^translate\(/, "")
          .split(",")
          .map(parseFloat);
        return {
          id:
            el.dataset.id ||
            el.className.baseVal.split(" ")[0].replace("ds-", ""),
          shown: +Math.abs(
            (el.dataset.axis === "y" ? n[1] : n[0]) || 0
          ).toFixed(1),
          range: +el.dataset.range,
        };
      })
      .filter((q) => q.shown > q.range + 0.6);
    const anims = document
      .getAnimations()
      .filter(
        (a) => a instanceof CSSAnimation && svg.contains(a.effect.target)
      );
    const cls = (el) => {
      const d = decl.find((c) => el.classList.contains(c.cls));
      return d ? d.cls : "?";
    };
    /* THE EDGE WALK: every 40px of every edge has ink within 90px inboard,
       except where the chrome's text reserves the edge (its halo boxes) */
    const vw = innerWidth,
      vh = innerHeight;
    const chromeBoxes = scape && scape.keep ? scape.keep.slice(0, 3) : [];
    const edgeGaps = {};
    if (vw >= 760)
      for (const [name, along, inboard, len] of [
        ["top", (q) => q[0], (q) => q[1], vw],
        ["bottom", (q) => q[0], (q) => vh - q[1], vw],
        ["left", (q) => q[1], (q) => q[0], vh],
        ["right", (q) => q[1], (q) => vw - q[0], vh],
      ]) {
        const bins = new Array(Math.ceil(len / 40)).fill(false);
        for (const q of pts)
          if (inboard(q) <= 90 && inboard(q) >= -2) {
            const i = Math.floor(along(q) / 40);
            if (i >= 0 && i < bins.length) bins[i] = true;
          }
        /* a tone field within 90px counts as ink on that edge: probed at
           three depths, since a crest can sit 60px down with sky above it */
        for (let i = 0; i < bins.length; i++) {
          if (bins[i]) continue;
          const a = i * 40 + 20;
          for (const d of [18, 45, 88]) {
            const p =
              name === "top"
                ? [a, d]
                : name === "bottom"
                  ? [a, vh - d]
                  : name === "left"
                    ? [d, a]
                    : [vw - d, a];
            if (toneAt(p[0], p[1])) {
              bins[i] = true;
              break;
            }
          }
        }
        /* the chrome's text reserves the edge it sits against: its own span
           and the corner bin beside it (the nameplate and the stop chip sit
           in the top corners, and the tone is cut out under them by design) */
        for (const [l, t, r, b] of chromeBoxes) {
          const touches =
            name === "top"
              ? t <= 90
              : name === "bottom"
                ? b >= vh - 90
                : name === "left"
                  ? l <= 120
                  : r >= vw - 120;
          if (!touches) continue;
          const a0 = name === "top" || name === "bottom" ? l : t,
            a1 = name === "top" || name === "bottom" ? r : b;
          /* a chrome box within 120px of the sheet's end owns its corner */
          const i0 = a0 < 120 ? 0 : Math.floor(a0 / 40) - 1,
            i1 = a1 > len - 120 ? bins.length - 1 : Math.floor(a1 / 40) + 1;
          for (let i = i0; i <= i1; i++)
            if (i >= 0 && i < bins.length) bins[i] = true;
        }
        const runs = [];
        let start = null;
        bins.forEach((v, i) => {
          if (!v && start === null) start = i;
          if ((v || i === bins.length - 1) && start !== null) {
            runs.push(`${start * 40}–${Math.min((v ? i : i + 1) * 40, len)}`);
            start = null;
          }
        });
        if (runs.length) edgeGaps[name] = runs;
      }
    /* where a leaf may fall: both envelopes keep every word's halo */
    let leafWorst = { margin: Infinity, env: "", text: "" };
    if (scape && scape.leaf)
      for (const k of Object.keys(scape.leaf).filter((n) =>
        n.endsWith("Env")
      )) {
        const e = scape.leaf[k];
        for (const t of texts) {
          const dx = Math.max(t[0] - e[2], e[0] - t[2], 0);
          const dy = Math.max(t[1] - e[3], e[1] - t[3], 0);
          const margin = Math.max(dx, dy) - t[4];
          if (margin < leafWorst.margin)
            leafWorst = { margin: +margin.toFixed(1), env: k, text: t[5] };
        }
      }
    /* THE RANGE'S RULES (round 11). Inside .ds-p2 every path is a declared
       line (.ds-ridge) or lives in a facet or a hachure group: no scattered
       stroke. A hatch field is a closed facet with a hard edge: the group
       carries its polygon and every stroke's ends lie inside it (2.5px for
       the hand). At most three facets per summit. And FAR never comes below
       the 0.66 H haze: no point of the range under it. Canopies: the fills
       of a tree's canopy cover at least 70% of the canopy's hull; a young
       tree's crown fills at most a 2.2th of the big tree's. The bank's and
       the grass's masks still carry the registry. */
    const p2 = svg.querySelector(".ds-p2");
    const p2paths = p2 ? [...p2.querySelectorAll("path")] : [];
    const p2bad = p2paths.filter(
      (p) =>
        !p.closest(".ds-summit") ||
        !(
          p.classList.contains("ds-ridge") ||
          p.parentElement.classList.contains("ds-facet") ||
          p.parentElement.classList.contains("ds-hachure")
        )
    ).length;
    /* far is line and hatch; a solid or a tone inside the range is near
       material in the far plane */
    const p2solid = p2
      ? p2.querySelectorAll(".ds-fill, .ds-tone, [fill]:not([fill=none])")
          .length
      : 0;
    const inPolyG = ([px, py], poly) => {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i],
          [xj, yj] = poly[j];
        if (
          yi > py !== yj > py &&
          px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
        )
          inside = !inside;
      }
      return inside;
    };
    const segDist = ([px, py], [ax, ay], [bx, by]) => {
      const dx = bx - ax,
        dy = by - ay,
        L2 = dx * dx + dy * dy || 1;
      const t = Math.max(
        0,
        Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2)
      );
      return Math.hypot(px - ax - dx * t, py - ay - dy * t);
    };
    let facetsOpen = 0,
      facetsLeaky = 0,
      facetsMax = 0,
      p2Low = 0;
    const hazeY = scape && scape.massifs ? scape.massifs.haze : null;
    for (const sm of p2 ? p2.querySelectorAll(".ds-summit") : [])
      facetsMax = Math.max(facetsMax, sm.querySelectorAll(".ds-facet").length);
    for (const fg of p2 ? p2.querySelectorAll(".ds-facet") : []) {
      const poly = (fg.dataset.poly || "")
        .split(" ")
        .filter(Boolean)
        .map((t) => t.split(",").map(parseFloat));
      if (poly.length < 3) {
        facetsOpen++;
        continue;
      }
      for (const p of fg.querySelectorAll("path")) {
        const L = p.getTotalLength();
        for (const q of [p.getPointAtLength(0), p.getPointAtLength(L)]) {
          const pt2 = [q.x, q.y];
          if (inPolyG(pt2, poly)) continue;
          let dmin = Infinity;
          for (let i = 0; i < poly.length; i++)
            dmin = Math.min(
              dmin,
              segDist(pt2, poly[i], poly[(i + 1) % poly.length])
            );
          if (dmin > 2.5) facetsLeaky++;
        }
      }
    }
    /* the range's paths are in its board's frame and seated by a
       transform: read them through their screen matrix */
    if (hazeY !== null)
      for (const p of p2paths) {
        const L = p.getTotalLength(),
          mx = p.getScreenCTM(),
          q2 = sheet.createSVGPoint();
        for (let sI = 0; sI <= L; sI += 8) {
          const q = p.getPointAtLength(sI);
          q2.x = q.x;
          q2.y = q.y;
          if (q2.matrixTransform(mx).y > hazeY + 4) {
            p2Low++;
            break;
          }
        }
      }
    /* 7 · the tree below every summit: the crown's and each young tree's
       top against the lowest peak on the sheet */
    const peaks = ((scape && scape.massifs && scape.massifs.summits) || [])
      .map((m) => m.peak)
      .filter(([x]) => x >= 0 && x <= innerWidth);
    const lowestPeak = peaks.length
      ? Math.max(...peaks.map((p) => p[1]))
      : null;
    const tops = [
      ...[...svg.querySelectorAll(".ds-tree")].map((g) => [
        "the crown",
        g.getBoundingClientRect().top,
      ]),
      ...[...svg.querySelectorAll(".ds-sap")].map((g, i) => [
        `young tree ${i + 1}`,
        g.getBoundingClientRect().top,
      ]),
    ];
    /* A TREE'S RESERVE IS CAST THROUGH THE TREE'S OWN FRAME. The <use>
       resolves to the silhouette in the paper's defs now (the masses
       themselves are on the wind sheet, and a mask the paper is cut by may
       not cast from something that sways), so the id alone no longer says
       where the mass is DRAWN: the mass keeps its name on data-res, and
       that is what this follows. Deliberately not the builder's own
       reserves[].tf — useRes emits the wrapper FROM that field, so a check
       written against it would be comparing the markup with the data that
       made it and would stay green if the registration were lost. */
    const treeT = svg.querySelector(".ds-treeframe")
      ? svg.querySelector(".ds-treeframe").getAttribute("transform")
      : null;
    let treeResOff = 0;
    for (const u of svg.querySelectorAll("mask#mR use")) {
      const id = (u.getAttribute("href") || "").slice(1);
      const drawn =
        svg.querySelector(`[data-res="${id}"]`) || svg.querySelector(`#${id}`);
      const inTree =
        drawn && (drawn.closest(".ds-treeframe") || id === "trunkSil");
      const tf = u.parentElement.getAttribute("transform");
      if (inTree ? tf !== treeT : tf) treeResOff++;
    }
    const unmasked = [...svg.querySelectorAll(".ds-p2, .ds-vale")].filter(
      (g) => g.getAttribute("mask") !== "url(#mR)"
    ).length;
    const canvasArea = (paths) => {
      const cv = document.createElement("canvas");
      cv.width = Math.ceil(scape.W);
      cv.height = Math.ceil(scape.H);
      const g = cv.getContext("2d");
      for (const p of paths) g.fill(new Path2D(p.getAttribute("d")), "evenodd");
      const data = g.getImageData(0, 0, cv.width, cv.height).data;
      let n = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 60) n++;
      return n;
    };
    const hullOf = (pts) => {
      pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
      const cross = (o, a2, b2) =>
        (a2[0] - o[0]) * (b2[1] - o[1]) - (a2[1] - o[1]) * (b2[0] - o[0]);
      const lower = [];
      for (const p of pts) {
        while (
          lower.length >= 2 &&
          cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
        )
          lower.pop();
        lower.push(p);
      }
      const upper = [];
      for (const p of [...pts].reverse()) {
        while (
          upper.length >= 2 &&
          cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
        )
          upper.pop();
        upper.push(p);
      }
      return [...lower.slice(0, -1), ...upper.slice(0, -1)];
    };
    const polyArea = (poly) => {
      let a2 = 0;
      for (let i = 0; i < poly.length; i++) {
        const [x0, y0] = poly[i],
          [x1, y1] = poly[(i + 1) % poly.length];
        a2 += x0 * y1 - x1 * y0;
      }
      return Math.abs(a2) / 2;
    };
    /* per layer: each swaying canopy layer is one connected canopy, and
       its fills cover its own hull; the whole crown's hull is reported too */
    let hullCover = null,
      treeFill = 0;
    const layerCover = [];
    const canopies = [...svg.querySelectorAll(".ds-canopy")];
    if (canopies.length && scape) {
      const hullPts = (els) => {
        const pts = [];
        for (const p of els.flatMap((c) => [
          ...c.querySelectorAll("path.ds-fill"),
        ])) {
          const L = p.getTotalLength();
          for (let sI = 0; sI <= L; sI += 10) {
            const q = p.getPointAtLength(sI);
            pts.push([q.x, q.y]);
          }
        }
        return pts;
      };
      treeFill = canvasArea(
        canopies.flatMap((c) => [...c.querySelectorAll("path.ds-fill")])
      );
      hullCover = +(treeFill / polyArea(hullOf(hullPts(canopies)))).toFixed(3);
      for (const c of canopies)
        layerCover.push(
          +(
            canvasArea([...c.querySelectorAll("path.ds-fill")]) /
            polyArea(hullOf(hullPts([c])))
          ).toFixed(3)
        );
    }
    const youngShare = [...svg.querySelectorAll(".ds-sap")].map((sp) =>
      treeFill
        ? +(
            canvasArea([...sp.querySelectorAll("path.ds-fill")]) / treeFill
          ).toFixed(3)
        : 0
    );
    const reg = (scape && scape.reserves) || [];
    const masks = {};
    for (const [id, plane] of [
      ["mR", "massif"],
      ["mB", "bank"],
      ["mG", "grass"],
    ]) {
      const mk = svg.querySelector(`mask#${id}`);
      if (!mk) continue;
      const uses = [...mk.querySelectorAll("use")];
      const expect = reg.filter((q) => q[plane] > 0);
      const missing = expect
        .filter((q) => !uses.some((u) => u.getAttribute("href") === "#" + q.id))
        .map((q) => q.id);
      const orphan = uses.filter(
        (u) => !svg.querySelector(u.getAttribute("href"))
      ).length;
      const widthOff = uses.filter((u) => {
        const q = expect.find((e) => "#" + e.id === u.getAttribute("href"));
        return (
          q && Math.abs(parseFloat(u.style.strokeWidth) - 2 * q[plane]) > 0.01
        );
      }).length;
      masks[id] = {
        uses: uses.length,
        expect: expect.length,
        missing,
        orphan,
        widthOff,
      };
    }
    /* 8 · a mask on anything that moves is the size of what it masks */
    const moving = (el) => {
      for (let e = el; e && e !== svg; e = e.parentElement)
        if (e.getAnimations().some((a) => a.playState === "running"))
          return true;
      return false;
    };
    const frac = (v, d) =>
      v == null ? d : v.trim().endsWith("%") ? parseFloat(v) / 100 : +v;
    const movingMasks = [...svg.querySelectorAll("[mask]")]
      .filter(moving)
      .map((el) => {
        const id = (el.getAttribute("mask").match(/#([^)"']+)/) || [])[1];
        const mk = id && svg.querySelector(`mask#${CSS.escape(id)}`);
        const b = el.getBBox();
        if (!mk || !b.width || !b.height) return { id, ratio: Infinity };
        const obb =
          (mk.getAttribute("maskUnits") || "objectBoundingBox") ===
          "objectBoundingBox";
        const w = obb
          ? frac(mk.getAttribute("width"), 1.2) * b.width
          : frac(mk.getAttribute("width"), 1.2 * svg.viewBox.baseVal.width);
        const h = obb
          ? frac(mk.getAttribute("height"), 1.2) * b.height
          : frac(mk.getAttribute("height"), 1.2 * svg.viewBox.baseVal.height);
        return { id, ratio: +((w * h) / (b.width * b.height)).toFixed(2) };
      });
    return {
      scape,
      movingMasks,
      p2: p2
        ? {
            paths: p2paths.length,
            bad: p2bad,
            facetsOpen,
            facetsLeaky,
            facetsMax,
            low: p2Low,
            solid: p2solid,
            unmasked,
            treeResOff,
          }
        : null,
      lowestPeak,
      tops: tops.map(([n, t]) => [n, +t.toFixed(1)]),
      doeH: +doeH.toFixed(1),
      meadow,
      strayed,
      casts: casts.length,
      wrongSide,
      colourFrac: +(colourPx / (innerWidth * innerHeight)).toFixed(5),
      runLong,
      rims: rims.length,
      rimDark,
      florets: florets.length,
      floretMin: florets.length ? Math.min(...florets) : null,
      hullCover,
      layerCover,
      youngShare,
      masks,
      paths: svg.querySelectorAll("path").length,
      /* THE PAPER IS PAINTED ONCE. Anything that animates on the paper
         sheet drags all 750 paths through a raster every frame, which is
         the whole defect this layer split was made to end — a transition
         is excluded because the planes' own arrival fade is still landing
         when this is measured. */
      paperAnim: document
        .getAnimations()
        .filter(
          (a) =>
            a.effect &&
            a.effect.target &&
            a.effect.target.closest &&
            a.effect.target.closest(".ds-paper") &&
            !(a instanceof CSSTransition)
        ).length,
      lifted: (scape && scape.lifted) || 0,
      worst,
      halo,
      sunOff,
      leafWorst,
      edgeGaps,
      texts: texts.length,
      samples,
      tallUnder,
      census: anims.map((a) => [
        a.animationName,
        a.effect.getTiming().duration,
        a.playState,
        cls(a.effect.target),
      ]),
      decl,
      flock: getComputedStyle(document.getElementById("flock")).display,
      op: getComputedStyle(svg).opacity,
      CLEAR_PX,
    };
  };

  /* ————— 1, 2 · every seat ————— */
  for (const [W, H] of SEATS) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H } });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    await land(page, 0.25);
    await page.waitForTimeout(300);
    const m = await page.evaluate(MEASURE, { CLEAR_PX, RANGE_PX, GRASS_CAP });
    const seat = `${W}×${H}`;
    if (errs.length) fail(`${seat}: page errors — ${errs.join(" | ")}`);
    if (!m.scape)
      fail(
        `${seat}: window.__world.scape is missing — buildDawnscape never ran`
      );
    else if (m.scape.room < 0) {
      /* no ground to draw on: the column already overflows the panel */
      if (m.paths !== 0)
        fail(
          `${seat}: ${m.paths} paths drawn with ${m.scape.free}px under the column — nothing may be drawn under 20px`
        );
      else
        note(
          `${seat}: ${m.scape.free}px under the column, nothing drawn (room ${m.scape.room})`
        );
    } else {
      /* the floor the phone's lowest rung draws above (room 0: two bands, 12 paths);
         the ¶13 spec holds the same number */
      if (m.paths < PATHS_FLOOR)
        fail(`${seat}: only ${m.paths} paths — the ground is not drawn`);
      if (m.worst.margin < 0)
        fail(
          `${seat}: "${m.worst.text}" is ${m.worst.gap}px from ${m.worst.sub} and needs ${m.worst.need}px (halo plus sway, the roam already taken off) — the words keep their air from every mark of the drawing`
        );
      else
        note(
          `${seat}: clearance margin ${m.worst.margin}px ("${m.worst.text}" vs ${m.worst.sub}, ${m.worst.gap}px of ${m.worst.need}px), ${m.texts} text rects vs ${m.samples} sampled points`
        );
      /* THE CLEARING, and the tolerance in it. The builder lifts every other
         mark at the crown's own radius (2.75 r); a polyline is cut at its
         SAMPLES, so a segment between two cut points can graze the boundary
         by a pixel — measured 149.8 against 150.2 at 1920×1080. The gate
         holds 0.95 of the crown, which is a real clearing and not a
         rounding argument: a sky line drawn straight through the sun
         measures near zero, not 149. */
      if (m.scape.sun) {
        const crown = m.scape.sun.crown || m.scape.sun.r * 2.75;
        if (m.halo.d < crown * 0.95)
          fail(
            `${seat}: ${m.halo.sub} stands ${m.halo.d}px from the sun — nothing but the sun's own marks and the rock it rises behind may stand inside the crown's clearing (${crown.toFixed(0)}px)`
          );
        else
          note(
            `${seat}: the crown's clearing holds — nearest other ink ${m.halo.d}px out of ${crown.toFixed(0)} (${m.halo.sub}), sun at ${m.scape.sun.x},${m.scape.sun.y} r${m.scape.sun.r} with ${m.scape.sun.rays} rays`
          );
      }
      /* every accent stays in the group its class belongs to */
      if (m.sunOff && m.sunOff.length)
        fail(
          `${seat}: ${m.sunOff.length} coloured mark(s) drawn outside the group their class belongs to (${[...new Set(m.sunOff)].slice(0, 3).join(", ")}) — a colour draws where it is declared and nowhere else`
        );
      /* 10 · NOT THE ENTIRE CANVAS. The owner lifted the ink-only ruling
         with one condition, and this is that condition as a number: the
         painted area of every coloured mark, stroke length times width and
         fill by its box, against the sheet. Measured on what round 14
         ships (0.10% to 0.20% across the seats) and capped with headroom,
         so a wash, a filled field or an accent that grew into one is a
         finding and a drawing that gains a few more touches is not. */
      if (m.colourFrac > COLOUR_CAP)
        fail(
          `${seat}: coloured ink covers ${(m.colourFrac * 100).toFixed(3)}% of the sheet — the cap is ${(COLOUR_CAP * 100).toFixed(2)}%, and colour on this drawing is an accent on ink, never a field`
        );
      else
        note(
          `${seat}: coloured ink covers ${(m.colourFrac * 100).toFixed(3)}% of the sheet (cap ${(COLOUR_CAP * 100).toFixed(2)}%)`
        );
      if (Object.keys(m.edgeGaps).length)
        fail(
          `${seat}: the sheet's edge is bare for more than 40px at ${Object.entries(
            m.edgeGaps
          )
            .map(([e, r]) => `${e} ${r.join(", ")}`)
            .join(
              "; "
            )} — every edge carries ink within 90px, the chrome's halos excepted`
        );
      if (m.scape.leaf && m.leafWorst.margin < 0)
        fail(
          `${seat}: the leaf's ${m.leafWorst.env} is ${-m.leafWorst.margin}px inside "${m.leafWorst.text}"'s halo — a falling leaf never crosses the clearing`
        );
      if (m.tallUnder.length)
        fail(
          `${seat}: grass under the column at ${m.tallUnder.map((t) => `${t.h.toFixed(1)}px @x${t.x}`).join(", ")} — capped at ${GRASS_CAP}px`
        );
      if (m.meadow.length)
        fail(
          `${seat}: grass taller than a third of the doe (${m.doeH}px, the builder's declared height) at ${m.meadow.map((t) => `${t.rise}px @x${t.x}`).join(", ")} — grass is grass-sized against the cast`
        );
      if (m.rimDark && m.rimDark.length)
        fail(
          `${seat}: ${m.rimDark.length} of ${m.rims} rim light(s) cut on the dark side of their lobe (${m.rimDark
            .slice(0, 3)
            .map(
              (q) =>
                `lobe x${q.at}, cut ${q.away}px ${q.away < 0 ? "west" : "east"}, light at ${q.lit}`
            )
            .join("; ")}) — the light on the foliage faces the light`
        );
      else if (m.rims)
        note(`${seat}: ${m.rims} rim lights, every one on its lobe's lit side`);
      if (m.runLong && m.runLong.len > RULED_RUN * W)
        fail(
          `${seat}: the ground plane carries a ${m.runLong.len}px run of unbroken ink (${m.runLong.of}), ${(m.runLong.len / W).toFixed(3)} of the sheet's width — the horizon is drawn, and the cap on any one run is ${RULED_RUN} W`
        );
      else if (m.runLong && m.runLong.len)
        note(
          `${seat}: longest unbroken run in the ground plane ${m.runLong.len}px (${(m.runLong.len / W).toFixed(3)} W, cap ${RULED_RUN})`
        );
      if (m.floretMin !== null && m.floretMin < BLOSSOM_MIN)
        fail(
          `${seat}: a floret is cut at r ${m.floretMin} (${(m.floretMin * 2).toFixed(1)}px across) — blossom under ${(BLOSSOM_MIN * 2).toFixed(1)}px is a hole nobody sees at DPR 1`
        );
      else if (m.florets)
        note(`${seat}: ${m.florets} florets cut, smallest r ${m.floretMin}`);
      if (m.wrongSide && m.wrongSide.length)
        fail(
          `${seat}: ${m.wrongSide.length} of ${m.casts} cast mark(s) fall toward the light — ${m.wrongSide
            .slice(0, 3)
            .map(
              (c) =>
                `the one cast by x${c.from} lies ${Math.abs(c.away)}px ${c.away < 0 ? "west" : "east"} of it and the sun is ${c.lit < 0 ? "east" : "west"}`
            )
            .join(", ")} — a shadow falls away from the light`
        );
      else if (m.casts)
        note(
          `${seat}: ${m.casts} cast marks, every one away from the light at ${m.scape.sun ? m.scape.sun.x : "?"}`
        );
      if (m.strayed && m.strayed.length)
        fail(
          `${seat}: ${m.strayed.map((q) => `${q.id} is drawn ${q.shown}px from home, range ±${q.range}px`).join(", ")} — a roamer is drawn inside the range it declares`
        );
      /* 6 · the range's rules, the canopies, and the masks that remain */
      if (m.p2) {
        if (m.p2.bad)
          fail(
            `${seat}: ${m.p2.bad} scattered stroke(s) inside .ds-p2 — every mark of the range is a ridgeline, a facet or a hachure`
          );
        if (m.p2.facetsOpen)
          fail(
            `${seat}: ${m.p2.facetsOpen} hatch field(s) without a closed facet polygon`
          );
        if (m.p2.facetsLeaky)
          fail(
            `${seat}: ${m.p2.facetsLeaky} hatch stroke end(s) outside their facet — a hatch field has a hard edge`
          );
        if (m.p2.facetsMax > 3)
          fail(
            `${seat}: a summit carries ${m.p2.facetsMax} facets — at most three`
          );
        if (m.p2.low)
          fail(
            `${seat}: ${m.p2.low} path(s) of the range below its foot (${m.scape.massifs.haze}px) — the range stands on its valley floor`
          );
        if (m.p2.solid)
          fail(
            `${seat}: ${m.p2.solid} solid or tone element(s) inside .ds-p2 — far is line and hatch`
          );
        if (m.p2.unmasked)
          fail(
            `${seat}: ${m.p2.unmasked} of the range's groups not masked by mR — the near masses must bare the paper behind them`
          );
        if (m.p2.treeResOff)
          fail(
            `${seat}: ${m.p2.treeResOff} reserve(s) in mR cast outside the frame of what casts them — the tree's paper must be where its crown is`
          );
        if (
          !fails.some(
            (f) => f.startsWith(seat) && /ds-p2|facet|its foot|mR/.test(f)
          )
        )
          note(
            `${seat}: the range is ${m.p2.paths} marks, no stray, no solid, facets closed, at most ${m.p2.facetsMax} per summit, all above its foot at ${m.scape.massifs.haze}px, masked by mR`
          );
      }
      /* 7 · the tree below every summit */
      if (m.lowestPeak !== null) {
        const high = m.tops.filter(([, t]) => t < m.lowestPeak + 40);
        if (high.length)
          fail(
            `${seat}: ${high.map(([n, t]) => `${n} tops out at ${t}px`).join(", ")}, not 40px under the lowest summit at ${m.lowestPeak}px — trees can't be as high as the mountains`
          );
        else
          note(
            `${seat}: every tree tops out at least 40px under the lowest summit (${m.lowestPeak}px): ${m.tops.map(([n, t]) => `${n} ${t}`).join(", ")}`
          );
      }
      for (const lc of m.layerCover)
        /* 45, not the plan's 70: measured 52 and 62 with the crown at its
           coverage cap (24% of the corner); 70 of a hull that wraps a fork
           is a blot, and the owner approved this crown's read */
        if (lc < 0.45)
          fail(
            `${seat}: a canopy layer's fills cover ${(lc * 100).toFixed(0)}% of its hull — spring is at least 45%`
          );
      for (const sh of m.youngShare)
        if (sh > 1 / 2.2)
          fail(
            `${seat}: a young tree's crown is ${(sh * 100).toFixed(0)}% of the big tree's — at most a 2.2th`
          );
      if (m.hullCover !== null)
        note(
          `${seat}: canopy hull cover ${(m.hullCover * 100).toFixed(0)}% (layers ${m.layerCover.map((v) => (v * 100).toFixed(0) + "%").join("/")}), young trees ${m.youngShare.map((v) => (v * 100).toFixed(0) + "%").join("/")}`
        );
      for (const [id, mk] of Object.entries(m.masks)) {
        if (mk.missing.length)
          fail(
            `${seat}: mask ${id} is missing the reserve(s) ${mk.missing.join(", ")} the builder registered`
          );
        if (mk.orphan)
          fail(
            `${seat}: mask ${id} has ${mk.orphan} reserve(s) pointing at nothing`
          );
        if (mk.widthOff)
          fail(
            `${seat}: mask ${id} has ${mk.widthOff} reserve(s) dilated off their registered width`
          );
      }
      /* 8 · a mask that moves is drawn again every frame, so its box is
         paid for every frame: sized to the sheet it blinked the crowns out */
      for (const mm of m.movingMasks.filter(
        (q) => !(q.ratio <= MOVING_MASK_MAX)
      ))
        fail(
          `${seat}: mask ${mm.id} rides a moving group at ${mm.ratio}x the area of what it masks — at most ${MOVING_MASK_MAX}x, or Chrome falls behind redrawing it and the group blinks`
        );
      if (m.movingMasks.length)
        note(
          `${seat}: ${m.movingMasks.length} masks move with the wind, the largest ${Math.max(...m.movingMasks.map((q) => q.ratio))}x what it masks`
        );
      const n = m.census.length;
      const table = new Set(m.decl.map((d) => d.ms));
      const expected = m.decl.reduce((s, d) => s + d.n, 0);
      const bad = m.census.filter(([, d]) => !table.has(Math.round(d)));
      /* per class: what the builder declared against what animates */
      const liveBy = {};
      for (const [, , , c] of m.census) liveBy[c] = (liveBy[c] || 0) + 1;
      const off = m.decl
        .filter((d) => (liveBy[d.cls] || 0) !== d.n)
        .map((d) => `${d.cls} declared ${d.n}, live ${liveBy[d.cls] || 0}`);
      if (liveBy["?"]) off.push(`${liveBy["?"]} undeclared`);
      if (!m.decl.length)
        fail(`${seat}: the builder declared no census — the registry is gone`);
      if (n !== expected || off.length)
        fail(
          `${seat}: ${n} groups animate but the builder declared ${expected} — ${off.join("; ") || "same total, different classes"}`
        );
      if (W < 760 && n > PHONE_MAX)
        fail(
          `${seat}: ${n} groups animate on the phone — the cap is ${PHONE_MAX}`
        );
      if (W < 760 && n < 1)
        fail(`${seat}: nothing animates on the phone's strip`);
      if (bad.length)
        fail(
          `${seat}: durations off the declared table — ${bad.map(([k, d]) => `${k} ${d}ms`).join(", ")}`
        );
      const idle = m.census.filter(([, , s]) => s !== "running");
      if (idle.length)
        fail(
          `${seat}: ${idle.length} animations not running (${idle.map(([k]) => k).join(", ")})`
        );
      /* and every one of them is on the wind sheet. The census above says
         the right number of groups move; this says they move where the
         repaint is cheap. */
      if (!m.lifted)
        fail(
          `${seat}: nothing was lifted onto the wind sheet — the morning is one layer again, and every frame of the wind rasterises the whole drawing`
        );
      if (m.paperAnim)
        fail(
          `${seat}: ${m.paperAnim} animation(s) run on the paper sheet — the paper is written once and only composited, and what moves belongs on the wind`
        );
      if (!m.paperAnim && m.lifted)
        note(
          `${seat}: ${m.lifted} group(s) on the wind sheet, nothing animating on the paper`
        );
      if (!bad.length && !off.length && n === expected)
        note(
          `${seat}: ${n} groups animate, exactly as declared (${m.decl.length} classes), all running`
        );
    }
    await ctx.close();
  }

  /* ————— 3 · reduced motion, at his seat and on the phone ————— */
  for (const [W, H] of SEATS.filter(
    ([w, h]) => (w === 1456 && h === 949) || (w === 390 && h === 844)
  )) {
    const ctx = await browser.newContext({
      viewport: { width: W, height: H },
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base, { waitUntil: "load" });
    await page
      .waitForSelector("html[data-np-ready]", { timeout: 20000 })
      .catch(() => {});
    await page.waitForTimeout(400);
    await page.evaluate(() =>
      scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      })
    );
    await page.waitForTimeout(400);
    await page.click("#approve");
    await page.waitForTimeout(700);
    const m = await page.evaluate(MEASURE, { CLEAR_PX, RANGE_PX, GRASS_CAP });
    const rm = await page.evaluate(() => ({
      daisies: document.querySelectorAll(".dawnscape .ds-daisy").length,
      daisiesOpen: document.querySelectorAll(".dawnscape .ds-daisy.open")
        .length,
      atmorning: document.body.classList.contains("atmorning"),
      live: document.body.classList.contains("morninglive"),
      settled: document.querySelector(".dawnscape").dataset.settled,
      scape: window.__world.marks.scape,
      owlDrawn: document.querySelectorAll(".dawnscape .ds-owl path.ds-fill")
        .length,
    }));
    const seat = `${W}×${H} reduced`;
    if (!rm.atmorning) fail(`${seat}: the page is not at the morning`);
    if (m.scape && m.scape.room >= 0 && m.paths < PATHS_FLOOR)
      fail(`${seat}: the ground is not drawn (${m.paths} paths)`);
    if (m.op !== "1")
      fail(
        `${seat}: the dawnscape is at opacity ${m.op} — it must simply be there`
      );
    if (m.census.length)
      fail(
        `${seat}: ${m.census.length} animations inside .dawnscape under reduced motion — the wind must be inside the no-preference query`
      );
    if (m.flock !== "none")
      fail(`${seat}: .flock is display:${m.flock} under reduced motion`);
    if (m.scape && m.scape.owl && !rm.owlDrawn)
      fail(
        `${seat}: the owl is not in the notch — reduced motion draws it home from the start`
      );
    if (rm.scape === undefined)
      fail(
        `${seat}: mark("scape") never recorded — settleScape did not run on the reduced-motion path`
      );
    /* THE DAISIES ARE OUT AT BUILD. They open over the morning's first
       minute on a timer, and settleScape returns before any timer under
       reduced motion, so a reader who asked for stillness would be given a
       meadow of buds that never opens. The end state is built instead. */
    if (rm.daisies && rm.daisiesOpen !== rm.daisies)
      fail(
        `${seat}: ${rm.daisiesOpen} of ${rm.daisies} daisies are open under reduced motion — the end state is built, not waited for`
      );
    else if (rm.daisies) note(`${seat}: all ${rm.daisies} daisies built open`);
    /* and the nest is a parent and three raised chicks, built: an end state
       with an empty nest over three raised heads is a story with its middle
       missing, and the sit's invariant has to hold on every path */
    if (rm.chicks && !rm.chicksUp)
      fail(
        `${seat}: the chicks are in the cup and down under reduced motion — the end state is built`
      );
    if (rm.chicksUp && !rm.nested)
      fail(
        `${seat}: the chicks are up under reduced motion with an empty nest — they rise to a parent`
      );
    if (!fails.some((f) => f.startsWith(seat)))
      note(
        `${seat}: ground present at opacity 1 (${m.paths} paths), 0 animations, flock hidden, scape mark ${rm.scape}ms`
      );
    await ctx.close();
  }

  /* ————— 5 · the sky, at his seat, over a compressed sit ————— */
  if (SEATS.some(([w, h]) => w === 1456 && h === 949)) {
    const W = 1456,
      H = 949;
    const ctx = await browser.newContext({ viewport: { width: W, height: H } });
    const page = await ctx.newPage();
    await land(page, 0.25);
    const PACE = 0.25;
    const READ = () => {
      const out = [];
      for (const el of document.querySelectorAll(".bird")) {
        const svg = el.querySelector("svg");
        if (!svg) continue;
        const r = svg.getBoundingClientRect();
        let o = 1,
          n = el;
        while (n && n.nodeType === 1) {
          const v = parseFloat(getComputedStyle(n).opacity);
          if (!Number.isNaN(v)) o *= v;
          n = n.parentElement;
        }
        if (
          o < 0.05 ||
          r.width < 1 ||
          getComputedStyle(el).visibility === "hidden"
        )
          continue;
        out.push([
          el.classList.contains("far") && !el.classList.contains("speck")
            ? 1
            : 0,
          r.left,
          r.top,
          r.right,
          r.bottom,
        ]);
      }
      return {
        birds: out,
        t: performance.now() - window.__world.departure.t0,
        perched: document.querySelectorAll(".dawnscape .ds-perch path.ds-fill")
          .length,
        airborne: document.querySelectorAll(".dawnscape .ds-leaf.airborne")
          .length,
        flies: document.querySelectorAll(".dawnscape .ds-fly").length,
        nested: document.querySelectorAll(
          ".dawnscape .ds-nestsock path.ds-fill"
        ).length,
        chicksUp: document.querySelectorAll(".dawnscape .ds-chicks.up").length,
      };
    };
    const SIT_MS = 30000; /* 30s of wall clock is two minutes of the page's own */
    let first = null,
      orphanBeg = 0,
      gapFrom = null,
      worstGap = 0,
      escapes = 0,
      maxFar = 0,
      samples = 0,
      twoPerched = 0,
      twoNested = 0,
      twoLeaves = 0,
      twoFlies = 0;
    const tLand = await page.evaluate(
      () => performance.now() - window.__world.departure.t0
    );
    for (let t = 0; t < SIT_MS; t += 1000) {
      const {
        birds,
        t: now,
        perched,
        airborne,
        flies,
        nested,
        chicksUp,
      } = await page.evaluate(READ);
      samples++;
      if (perched > 1) twoPerched++;
      /* the chicks rise TO a parent: up over an empty cup is a beg at
         nobody, and it is the shape a stale timer after a rebuild takes */
      if (chicksUp && !nested) orphanBeg++;
      if (nested > 1) twoNested++;
      if (airborne > 1) twoLeaves++;
      if (flies > 1) twoFlies++;
      if (birds.length && first === null) first = now - tLand;
      const far = birds.filter((b) => b[0]).length;
      maxFar = Math.max(maxFar, far);
      for (const [, l, tp, r, bt] of birds)
        if (l < 8 || tp < 8 || r > W - 8 || bt > H - 8) escapes++;
      if (!birds.length) {
        if (gapFrom === null) gapFrom = now;
        worstGap = Math.max(worstGap, now - gapFrom + 1000);
      } else gapFrom = null;
      await page.waitForTimeout(1000);
    }
    /* 7 · every crossing flown, sampled along its own offset path against
       the shadow faces, near masses excepted */
    const routes = await page.evaluate(() => {
      /* no scape is check 1's failure, already reported; this one must not
         crash over it and hide the rest of the seat */
      const s = window.__world.scape || {},
        faces = s.faces || [],
        near = s.near || [];
      const inside = ([px, py], poly) => {
        let hit = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const [xi, yi] = poly[i],
            [xj, yj] = poly[j];
          if (
            yi > py !== yj > py &&
            px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
          )
            hit = !hit;
          const dx = xj - xi,
            dy = yj - yi,
            t = Math.max(
              0,
              Math.min(
                1,
                ((px - xi) * dx + (py - yi) * dy) / (dx * dx + dy * dy || 1)
              )
            );
          if (Math.hypot(px - xi - t * dx, py - yi - t * dy) < 6) return true;
        }
        return hit;
      };
      return (window.__world.routes || []).map((r) => {
        const n = r.path.match(/-?\d+(\.\d+)?/g).map(Number);
        const P = [];
        for (let i = 0; i + 1 < n.length; i += 2) P.push([n[i], n[i + 1]]);
        const bez = (a, b, c, d, t) => {
          const u = 1 - t;
          return [0, 1].map(
            (k) =>
              u * u * u * a[k] +
              3 * u * u * t * b[k] +
              3 * u * t * t * c[k] +
              t * t * t * d[k]
          );
        };
        let hit = null;
        for (const [a, b, c, d] of [
          [P[0], P[1], P[2], P[3]],
          [P[3], P[4], P[5], P[6]],
        ])
          for (let i = 0; i <= 40 && !hit; i++) {
            const q = bez(a, b, c, d, i / 40);
            if (
              near.some(
                ([x, y, rr]) => Math.hypot(q[0] - x, q[1] - y) < rr + 12
              )
            )
              continue;
            if (faces.some((f) => inside(q, f))) hit = q.map(Math.round);
          }
        return { entry: r.entry, hit };
      });
    });
    const overRock = routes.filter((r) => r.hit);
    const fin = await page.evaluate(() => ({
      sky: window.__world.sky,
      perch: window.__world.perch || { lands: 0, leaves: 0, perched: 0 },
      nest: window.__world.nest || { lands: 0, leaves: 0, perched: 0 },
      nestedNow: document.querySelectorAll(
        ".dawnscape .ds-nestsock path.ds-fill"
      ).length,
      perchedNow: document.querySelectorAll(".dawnscape .ds-perch path.ds-fill")
        .length,
      leaves: window.__world.leaves || { shed: 0, landed: 0, airborne: 0 },
      poses: (window.__world.poses || []).length,
      owl: window.__world.owl || { state: "away" },
      owlDrawn: document.querySelectorAll(".dawnscape .ds-owl path.ds-fill")
        .length,
      flies: window.__world.flies || 0,
      ground: window.__world.ground || [],
      roamers: (window.__world.scape || {}).roamers,
      tf: [...document.querySelectorAll(".dawnscape [data-range]")].map(
        (el) => [
          el.dataset.id ||
            el.className.baseVal.split(" ")[0].replace("ds-", ""),
          el.style.transform,
          el.dataset.axis || "x",
        ]
      ),
    }));
    const seat = `sky 1456×949`;
    /* a morning that never built publishes no sky, and every read below
       would die on it with a TypeError, which reports nothing. Check 1
       has already said why (the missing scape); say it here too, once,
       and let the seat close. */
    sit: {
      if (!fin.sky) {
        fail(
          `${seat}: window.__world.sky is missing — the morning never built, so there is no sky to sit under`
        );
        break sit;
      }
      /* clocks: the sit is wall time; the page's own is PACE times shorter */
      const gapCode = worstGap / PACE;
      if (first === null)
        fail(`${seat}: no bird was ever visible in ${SIT_MS}ms of sitting`);
      else if (first > 2000 * PACE + 500)
        fail(
          `${seat}: first visible bird ${(first / PACE).toFixed(0)}ms after landing on the page's clock — the morning lands with birds in it (2s)`
        );
      if (gapCode > 40000)
        fail(
          `${seat}: empty sky for ${(gapCode / 1000).toFixed(1)}s of the page's clock — the cap is 40s`
        );
      if (escapes)
        fail(
          `${seat}: ${escapes} samples with a visible bird within 8px of the viewport's edge`
        );
      if (maxFar > 3)
        fail(`${seat}: ${maxFar} far birds at once — the cap is three`);
      if (!routes.length)
        fail(`${seat}: no route was logged — window.__world.routes is gone`);
      if (overRock.length)
        fail(
          `${seat}: ${overRock.length} of ${routes.length} crossings pass over a shadow face of the range (${overRock.map((r) => `${r.entry} at ${r.hit}`).join(", ")}) — the rock's shadow is not sky`
        );
      /* the perch: capacity one, and the socket agrees with the log: a bird
       that landed and has not left is on the twig, and no other */
      if (twoPerched)
        fail(
          `${seat}: two birds on the perch in ${twoPerched} sample(s) — capacity one`
        );
      if (fin.perchedNow !== fin.perch.lands - fin.perch.leaves)
        fail(
          `${seat}: ${fin.perchedNow} bird(s) drawn on the perch, but the log says ${fin.perch.lands} landed and ${fin.perch.leaves} left — an orphan or a missing bird`
        );
      if (orphanBeg)
        fail(
          `${seat}: the chicks were up with an empty nest in ${orphanBeg} sample(s) — they rise to a parent`
        );
      if (twoNested)
        fail(
          `${seat}: two birds in the nest in ${twoNested} sample(s) — capacity one`
        );
      if (fin.nestedNow !== fin.nest.lands - fin.nest.leaves)
        fail(
          `${seat}: ${fin.nestedNow} bird(s) drawn in the nest, but the log says ${fin.nest.lands} landed and ${fin.nest.leaves} left`
        );
      if (!fin.sky.entries.some((e) => e.exit === "pass"))
        fail(
          `${seat}: no crossing left through the pass in the sit — the second canopy crossing does`
        );
      if (fin.perch.lands < 1)
        fail(
          `${seat}: no bird landed on the perch in the sit — the first canopy crossing lands`
        );
      if (
        fin.perch.leaves >= 1 &&
        !fin.sky.entries.some((e) => e.entry === "perch")
      )
        fail(`${seat}: a bird left the perch but no "perch" entry was logged`);
      if (twoLeaves)
        fail(
          `${seat}: two leaves in the air in ${twoLeaves} sample(s) — never two`
        );
      if (twoFlies)
        fail(
          `${seat}: two butterflies in ${twoFlies} sample(s) — one at a time`
        );
      /* the owl: drawn if and only if it has come home; an "owl" entry logged
       when it set out */
      if ((fin.owl.state === "home") !== fin.owlDrawn > 0)
        fail(
          `${seat}: the owl is ${fin.owl.state} but ${fin.owlDrawn} owl fill(s) are drawn in the notch`
        );
      if (
        fin.owl.state !== "away" &&
        !fin.sky.entries.some((e) => e.entry === "owl")
      )
        fail(`${seat}: the owl set out but no "owl" entry was logged`);
      if (!fin.sky || fin.sky.spawned < 2)
        fail(
          `${seat}: only ${fin.sky ? fin.sky.spawned : 0} far crossings in ${(SIT_MS / PACE / 1000).toFixed(0)}s of morning`
        );
      const maxOff = {};
      for (const g of fin.ground)
        maxOff[g.id] = Math.max(maxOff[g.id] || 0, Math.abs(g.x_off));
      const roamers = fin.roamers || {};
      for (const [id, off] of Object.entries(maxOff)) {
        const lim = roamers[id] ? roamers[id].range : RANGE_PX;
        if (off > lim)
          fail(
            `${seat}: ${id} strayed ${off}px from where it was drawn — its declared home range is ±${lim}px`
          );
      }
      /* the log against the ink: one roamer's computed translate must be what
       the log says its offset is */
      /* every DECLARED roamer, moved or not: its drawn offset within its range */
      for (const [id, tf, axis] of fin.tf) {
        const nums0 = tf
          ? tf
              .replace(/^translate\(/, "")
              .split(",")
              .map(parseFloat)
          : [0, 0];
        const shown0 = Math.abs(axis === "y" ? nums0[1] || 0 : nums0[0] || 0);
        const lim0 = roamers[id] ? roamers[id].range : RANGE_PX;
        if (shown0 > lim0 + 0.6)
          fail(
            `${seat}: ${id} is drawn ${shown0.toFixed(1)}px from home — its declared range is ±${lim0}px`
          );
      }
      for (const [id, tf, axis] of fin.tf) {
        const last = [...fin.ground].reverse().find((g) => g.id === id);
        const nums = tf
          ? tf
              .replace(/^translate\(/, "")
              .split(",")
              .map(parseFloat)
          : [0, 0];
        const shown = axis === "y" ? nums[1] || 0 : nums[0] || 0;
        /* a move is logged whole as it starts and drawn in two halves, so a
         sample mid-hop sits at the previous offset plus half the step */
        const mid = last ? last.x_off - last.dx / 2 : 0;
        if (
          last &&
          Math.abs(shown - last.x_off) > 0.6 &&
          Math.abs(shown - mid) > 0.6
        )
          fail(
            `${seat}: ${id} is drawn at ${shown}px but the log says ${last.x_off}px`
          );
      }
      if (!fails.some((f) => f.startsWith(seat)))
        note(
          `${seat}: first bird ${first.toFixed(0)}ms after landing, worst gap ${(gapCode / 1000).toFixed(1)}s (page clock), 0 escapes in ${samples} samples, ` +
            `max ${maxFar} far at once, ${routes.length} routes flown and none over the rock, ${fin.sky.spawned} crossings (${fin.sky.entries.map((e) => e.entry).join("/")}), ${fin.ground.length} ground events, ` +
            `max |x_off| ${JSON.stringify(maxOff)}, perch ${fin.perch.lands}/${fin.perch.leaves} (on twig now: ${fin.perchedNow}), ` +
            `leaves ${fin.leaves.shed} shed / ${fin.leaves.landed} on the ground, owl ${fin.owl.state}, ${fin.flies} butterflies, nest ${fin.nest.lands}/${fin.nest.leaves}, ${fin.sky.entries.filter((e) => e.exit === "pass").length} by the pass`
        );
    }
    await ctx.close();
  }
} finally {
  if (browser) await browser.close();
  server.close();
}

for (const n of notes) console.log(`  · ${n}`);
if (fails.length) {
  console.error(`\ncheck-dawnscape FAILED — ${fails.length} finding(s):\n`);
  for (const f of fails) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(
  `\ncheck-dawnscape: the morning's ground keeps its air at ${SEATS.length} seat(s), the wind is exactly what the builder declared, reduced motion is still, and the sky stays alive and in frame.`
);
