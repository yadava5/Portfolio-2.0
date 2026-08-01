
---

## DECIDED 2026-08-01: delete it

Owner: *"i will not go back to the old portfolio, and we are going to stick
with the current working portfolio! so can delete if not needed!"*

### The blocker to clear FIRST

`scripts/run/build-home.mjs` reads the **built Next home** and lifts its head
into the run:

    const nextHome = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
    const canonical   = takeTag(/<link rel="canonical"[^>]*>/);
    const title       = takeTag(/<title>[\s\S]*?<\/title>/);
    const description = takeTag(/<meta name="description"[^>]*>/);

plus JSON-LD, OG and Twitter tags. So `src/app/page.tsx` cannot simply be
deleted — the run would lose its title, canonical, structured data and social
cards, and `test:seo` would fail. **Move that head generation to
`src/lib/seo.ts` (which already computes it) and have `build-home.mjs` call it
directly, BEFORE removing the page.** That is step one, not a follow-up.

### Then, in order

1. Rewire `build-home.mjs` head generation off the Next home. Gate: `test:seo`
   and `assets:check-og` still pass.
2. Point the e2e suite at what deploys — `test:e2e` must run `build-home.mjs`,
   not just `next build`. Expect `pipeline-run.spec.ts` and
   `text-garnish.spec.ts` to FAIL at that moment: that is the correct result,
   they assert markup the shipped site does not contain. Delete them with the
   components they cover.
3. Delete `src/app/page.tsx` and the 22 orphaned modules.
4. **Keep** `lib/data/experience.ts` and `lib/data/testimonials.ts` regardless.
   They are orphaned only because no station renders them yet, and the owner's
   open item 3 is "add more stations" — the ITSM experience and the Shree
   Chaturvedi testimonial are exactly the content a new station would want.

### The tail (item 4), measured

Document 13,632px; last ink at 13,108px; **524px of empty tail = 0.58
viewports.** The cause is not body padding (0) or a trailing element — the
beats carry an explicit `min-height` (the final three are 1224 / 1134 / 1062px)
which holds each section open past its content: 254px, 329px and 145px of slack
after the deepest child respectively. The fix belongs in the beat sizing rule,
not in a trailing spacer.
