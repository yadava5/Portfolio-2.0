# How `ayush-yadav.com` is wired

**Executed 2026-08-08.** This file was written before the domain was bought,
as a plan against Porkbun. The domain was bought at **Cloudflare** instead, and
the plan was wrong about the one thing that would have broken the setup — see
*The Cloudflare rule* below. It is rewritten here as a record of what is
actually in place, because a stale plan that would mislead the next reader into
proxying the records is worse than no plan.

The site is a hand-built static export deployed to GitHub Pages by a **custom
workflow** (`.github/workflows/deploy.yml`), not by the branch publisher. That
one fact drives most of what follows.

---

## What changed, and why it had to be one commit

The site used to be a **project page**, served under a path prefix:

```
https://yadava5.github.io/Portfolio-2.0/projects/master-inventory/
└──────── origin ───────┘└─ base path ─┘└──────── route ─────────┘
```

An apex domain serves at the **root**, so the base path disappears at the same
time as the origin changes:

```
https://ayush-yadav.com/projects/master-inventory/
```

Two independent axes, in different files, breaking different things. Move one
without the other and you get `https://ayush-yadav.com/Portfolio-2.0/…`, which
404s across the whole archive. They landed together in `4e6577e`, with the
golden hash re-recorded in `220efc6`.

---

## The Cloudflare rule — the part the Porkbun plan had no concept of

**Every record must be DNS only (grey cloud), never Proxied (orange).** The
dashboard defaults new A/AAAA records to Proxied, and a proxied record in front
of GitHub Pages stops GitHub from provisioning the TLS certificate — *Enforce
HTTPS* stays greyed out indefinitely. If the zone's SSL/TLS mode is also
*Flexible*, you additionally get a redirect loop, because Pages does its own
HTTPS redirect. (This zone is **Full**, so only the certificate problem
applied.)

Cloudflare will actively push you the other way: after the first record lands,
a banner appears reading *"Proxying is required for most security and
performance features."* It is wrong for this site. Ignore it.

**Do not verify proxy status by reading the cloud icon.** Verify it with `dig`,
which cannot be misread:

```bash
dig +short A ayush-yadav.com @1.1.1.1
```

If that returns the four GitHub addresses below, the records are unproxied. If
it returns anything else — Cloudflare anycast addresses such as `104.x` or
`172.67.x` — they are proxied, whatever the dashboard appears to say.

### The nine records

Zone `ayush-yadav.com`, all **DNS only**, TTL Auto:

| Type | Name | Content |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `yadava5.github.io` |

The `www` CNAME points at `yadava5.github.io` **without the repository name** —
that is GitHub's instruction, not a typo. The zone had no CAA record, so
Let's Encrypt issuance was unblocked; if you ever add one, it must permit
`letsencrypt.org`.

## At GitHub

`Settings → Pages → Custom domain` → `ayush-yadav.com`, then **Enforce HTTPS**
once the certificate exists. Both are scriptable, which is how they were set:

```bash
gh api -X PUT repos/yadava5/Portfolio-2.0/pages -f cname=ayush-yadav.com -f build_type=workflow
gh api -X PUT repos/yadava5/Portfolio-2.0/pages -F https_enforced=true   # -F, not -f: booleans
gh api repos/yadava5/Portfolio-2.0/pages                                 # re-read and confirm
```

**Re-read after every PUT.** A PUT that silently resets `build_type` away from
`workflow`, or `source.branch` away from `main`, breaks the deploy pipeline
without touching the domain. Both survived here, confirmed by reading them back.

`https_enforced` flips to `false` when the custom domain is first set and stays
false until the certificate is issued — that is expected, not a failure, and it
has to be turned back on afterwards. Here the certificate was ready within
minutes.

## `public/CNAME`, which this repo must emit itself

GitHub writes a `CNAME` file automatically only when publishing **from a
branch**. This repo publishes a workflow artifact, so nothing would write it and
the Settings field can be cleared on some deploys.

`public/CNAME` contains exactly `ayush-yadav.com`.
`scripts/archive/build-archive.mjs:116` does
`cpSync(PUBLIC, BUILD_ROOT, { recursive: true })` and `:204` renames
`BUILD_ROOT` to `out/`, which `deploy.yml` uploads — so it lands as `out/CNAME`
with no build change. Nothing objects to the extra file: the existence
allowlist names four files and tolerates a fifth, and
`check-static-export-seo.mjs` walks only `.html|.txt|.xml`.

---

## The code, and the trap in it

**Axis A — the origin.** `src/lib/data/personal.ts:191` is the single source for
everything the site *emits*: canonical, `og:url`, `og:image`, the sitemap's
`<loc>`, `robots.txt`, the 404's rejoin links, every JSON-LD `@id`, and the
archive masthead. What *verifies* the site is a separate population that each
re-declares the origin as its own literal — five gates, one spec, the preview
script, the README — plus **12 hand-written anchors** in `src/run/index.html`
that no template touches.

**Axis B — the base path.** `src/lib/basePath.ts` production default → `""`.
The root mount was anticipated: the file already used `??` rather than `||` so
an explicitly empty value survives as a real configuration.

### Never replace `yadava5` alone

The rewrite key is the full string `yadava5.github.io/Portfolio-2.0`. The bare
username also appears in 39 `github.com/yadava5/…` URLs and — the real hazard —
in a **second GitHub Pages site**, `src/lib/data/projects.ts:627`:

```
https://yadava5.github.io/paid-internships-advocacy
```

That one is **fetched over the network** by `check-live-surfaces.mjs` and
counted in its floor of 13. A greedy replace reds that gate.

---

## Verifying it, after any change to either axis

```bash
npm run verify:portfolio        # 20/20, browser step included
npm run test:live-surfaces      # proves the OTHER Pages site survived
```

Then check what is **served**, not what was built — this repo has an erratum
about exactly that mistake:

```bash
curl -s  https://ayush-yadav.com/ | grep -c 'yadava5.github.io/Portfolio-2.0'  # 0
curl -s  https://ayush-yadav.com/ | grep -o 'https://ayush-yadav.com' | wc -l  # 23
curl -sI https://ayush-yadav.com/projects/master-inventory/                    # 200
curl -sI http://ayush-yadav.com/    | grep -i location   # → https://ayush-yadav.com/
curl -sI https://www.ayush-yadav.com/ | grep -i location # → https://ayush-yadav.com/
```

There are **seven** case-file routes — `automl`, `fast-mnist-nn`, `jobtracker`,
`master-inventory`, `policybot`, `taskflow-calendar`, `visual-assist`. Glyph,
Cadence, Applied, LifeQuest and jetpack are cited by URL and have no
`/projects/<id>/` route, so `/projects/glyph/` 404s and always did. Do not read
that as a broken deploy. The honest sweep is the sitemap:

```bash
curl -s https://ayush-yadav.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' \
  | while read -r u; do printf '%s %s\n' "$(curl -sI -o /dev/null -w '%{http_code}' "$u")" "$u"; done
```

All 9 answered 200 on 2026-08-08.

## Old links keep working

GitHub serves a 301 from the retired project page **with the path preserved and
the repository segment stripped** — verified, not assumed:

```
https://yadava5.github.io/Portfolio-2.0/projects/glyph/
  → 301 → http://ayush-yadav.com/projects/glyph/
```

So anything already shared — the résumé, the LinkedIn profile, links in the
wild — still resolves. Nothing needs recalling.
