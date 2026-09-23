# Non-regression harness (desktop rail) — how to run

Baseline = live ayush-yadav.com @ b6ea15df (HEAD 035ab9b), in `baseline/`.

```
H=<this dir>; OUT=$H/<run> URL=http://127.0.0.1:4300/ node $H/sweep.mjs w1512 1512 982 0
OUT=$H/<run> URL=... node $H/sweep.mjs w1440 1440 900 0
OUT=$H/<run> URL=... node $H/sweep.mjs w1280 1280 800 0
OUT=$H/<run> URL=... node $H/sweep.mjs w390 390 844 1
OUT=$H/<run> URL=... node $H/sweep.mjs w320 320 640 1
OUT=$H/<run> LABELS=w1512,w1440,w1280,w390,w320 node $H/analyse.mjs
OUT=$H/<run> LABELS=w1512,w1440,w1280,w390,w320 node $H/metrics.mjs
```

Baseline scorecard (desktop rows are the ones that must not get worse):

| width | screens | manifest overlap steps | thread crosses any text (steps) | thread crossed line-steps | near-empty ≤60w | prose-free ≤25 | blank | sub-12 html pairs | mono % |
|---|---|---|---|---|---|---|---|---|---|
| 1512×982 | 15.91 | 8 | 29/31 | 285 | 6 | 10 | 1 | 166 | 75.6 |
| 1440×900 | 15.97 | 9 | 30/31 | 272 | 5 | 11 | 1 | 170 | 75.5 |
| 1280×800 | 16.12 | 13 | 30/32 | 263 | 4 | 9 | 1 | 164 | 75.3 |
| 390×844 | 23.22 | 13 | 45/46 | 561 | 2 | 26 | 0 | 153 | 74.2 |
| 320×640 | 31.28 | 28 | 60/62 | 715 | 14 | 39 | 0 | 146 | 74.4 |

Caveats:
- `threadSerifSteps` is face-dependent: moving mono prose to serif raises it with no geometry change. Use `threadAnyTextSteps` / `threadCrossedLines`.
- `threadCrossedLines` falls when text is cut, so compare it per unit of text too.
- near-empty/prose-free RISE when copy is cut but station heights stay: less text in the same heights = emptier screens. Copy cuts and height changes must be judged together.
- Metrics are necessary, not sufficient: the owner judges side-by-side screenshots at 1512 for any bucket-B change.
