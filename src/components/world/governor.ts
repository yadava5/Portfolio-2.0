/**
 * @fileoverview The Frame Governor — adaptive quality tiers from MEASURED
 * frame timing (FABLE-VISUAL-BRIEF §F2/§F5).
 *
 * Three authored editions of the same study — full / core / print — and a
 * ~1.5 KB, zero-dependency runtime that only ever moves the tier DOWN when
 * a device is provably struggling. Measurement, not device-sniffing:
 * timing is ground truth; a sniff mislabels a throttled flagship and a
 * fast budget phone alike.
 *
 * What it measures — ONLY while the page is actually being scrolled
 * (no idle rAF, no layout reads, nothing in the hot path but a clock
 * read and arithmetic):
 *   - frame deltas, sampled by riding THE one existing rAF loop
 *     (gsap.ticker — amendment A1; the governor never adds a second
 *     scroll-time rAF) with an early-out when no scroll is recent;
 *   - long tasks >50ms via PerformanceObserver({type:"longtask"}),
 *     counted only inside the same active-scroll window.
 *
 * Downshift logic (§F2, jank-score with decay-as-hysteresis):
 *   +1 per >32ms frame, +2 per >50ms, +4 per >100ms, +2 per longtask;
 *   the score decays 1/sec of smooth active scrolling. A single GC pause
 *   adds 2–4 and melts away; only SUSTAINED jank crosses the ≥8 line.
 *   Downshift is one-way and mid-session only (full→core→print, print is
 *   the floor); the lowest tier reached persists to sessionStorage as the
 *   NEXT load's ceiling — sessionStorage deliberately, not localStorage:
 *   devices get borrowed and a bad afternoon shouldn't brand them.
 *
 * Upshift happens at most ONCE, never after any downshift, and only via
 * the §F3 gates: ≥3s of accumulated smooth active scrolling at Core,
 * viewport ≥1024, Data Saver off — then core→full mounts additively at an
 * idle moment (nothing structural moves; Full is Core plus garnish).
 * Everyone's first paint is Core (or Print) — never a Full flash.
 *
 * Precedence (§F2): motion gate → governor → scene minTier. Reduced
 * motion / the quiet toggle force print and DISABLE the governor
 * entirely (SmoothScroll calls applyGate; the engine and this watcher
 * live and die together). The tier is published as `data-tier` on <html>
 * (stamped synchronously pre-paint by the layout.tsx head script) and as
 * the `useTier()` hook, mirroring `useLenis()`.
 */

"use client";

import { useSyncExternalStore } from "react";
import gsap from "gsap";

/** The three authored editions (§F1). */
export type Tier = "full" | "core" | "print";

/** sessionStorage key: the lowest tier reached this session (the next
 *  load's ceiling — read synchronously by the layout.tsx head script). */
export const TIER_CAP_KEY = "study-tier-cap";

/* ── Scoring constants (§F2) ─────────────────────────────────────── */
const FRAME_SLOW = 32; /* ms — dropped below ~30fps  → +1 */
const FRAME_BAD = 50; /* ms — severe                 → +2 */
const FRAME_SEVERE = 100; /* ms — catastrophic       → +4 */
const LONGTASK_PENALTY = 2;
const DECAY_PER_SEC = 1;
const DOWNSHIFT_AT = 8;
/** A frame counts as scroll-active within this window of a scroll event. */
const ACTIVE_WINDOW_MS = 240;
/** Scroll-while-hidden only forces the print floor after the document has
 *  been hidden this long — a cmd-tab mid-momentum (or mid-flight) can leak
 *  a few trailing scroll events into the first instants of hiddenness, and
 *  a real reader must never come back to a downshifted page for that. */
const HIDDEN_SCROLL_GRACE_MS = 600;
/** §F3: accumulated smooth active scrolling required before full. */
const PROMOTE_AFTER_SMOOTH_MS = 3000;
/** §F3: garnish is desktop-first — phones never get it, even capable. */
const PROMOTE_MIN_VIEWPORT = 1024;

/* ── Module state (one governor per page, like the one scroll loop) ── */
let tier: Tier = "core";
let tierSeeded = false;
let everDownshifted = false;
let promoted = false;
let gateForcedPrint = false;
let watching = false;

let jankScore = 0;
let lastScoreTs = 0;
let stableMs = 0;
let lastScrollTs = -Infinity;
let lastFrameTs = Number.NaN;
/** Sampling is ignored until this timestamp (programmatic flights). */
let suppressUntilTs = 0;

let longtaskObserver: PerformanceObserver | null = null;
const listeners = new Set<(tier: Tier) => void>();

/** Lazily seed the tier from the head script's pre-paint stamp. */
function seedTier(): void {
  if (tierSeeded || typeof document === "undefined") return;
  tierSeeded = true;
  const stamped = document.documentElement.dataset.tier;
  if (stamped === "print" || stamped === "core" || stamped === "full") {
    tier = stamped;
  }
}

/** Current tier (module-var read — safe in per-frame code). */
export function getTier(): Tier {
  seedTier();
  return tier;
}

/** Accumulated smooth active-scroll ms at the current tier (§F3 gate).
 *  Poll at a deferred mount moment — deliberately NOT reactive, so no
 *  re-render churn while it accumulates. */
export function getStableMs(): number {
  return stableMs;
}

/**
 * Subscribe to tier changes. Returns the unsubscribe.
 */
export function subscribeTier(listener: (tier: Tier) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setTier(next: Tier): void {
  seedTier();
  if (next === tier) return;
  tier = next;
  if (typeof document !== "undefined") {
    document.documentElement.dataset.tier = next;
  }
  for (const listener of listeners) listener(next);
}

function persistCap(lowest: Tier): void {
  try {
    const existing = window.sessionStorage.getItem(TIER_CAP_KEY);
    /* Only ever lower the ceiling. */
    if (existing === "print") return;
    window.sessionStorage.setItem(TIER_CAP_KEY, lowest);
  } catch {
    /* storage unavailable — session-only governance */
  }
}

function readCap(): Tier | null {
  try {
    const cap = window.sessionStorage.getItem(TIER_CAP_KEY);
    return cap === "print" || cap === "core" ? cap : null;
  } catch {
    return null;
  }
}

/* ── The scorer ──────────────────────────────────────────────────── */

function decayedScore(now: number): number {
  const decayed =
    jankScore - Math.max(0, ((now - lastScoreTs) / 1000) * DECAY_PER_SEC);
  return decayed > 0 ? decayed : 0;
}

function addPenalty(points: number, now: number): void {
  /* Same-burst penalties (sub-frame gaps) stack UNDECAYED: two
     back-to-back catastrophic frames are exactly the sustained case the
     ≥8 line exists for, and the continuous decay used to shave an
     epsilon off the boundary (4 + 3.9997 < 8) — a flaky contract. Any
     real gap (> one frame) still melts the score at 1/sec. */
  if (now - lastScoreTs > 50) {
    jankScore = decayedScore(now);
  }
  jankScore += points;
  lastScoreTs = now;
  stableMs = 0;
  if (jankScore >= DOWNSHIFT_AT) downshift();
}

function downshift(): void {
  jankScore = 0;
  everDownshifted = true;
  if (tier === "full") {
    setTier("core");
    persistCap("core");
    return;
  }
  if (tier === "core") {
    forcePrintFloor();
  }
}

/** Core/Full → Print in one move: the print edition takes over.
 *  SmoothScroll subscribes and unmounts the engine (static === final
 *  frame, so the swap costs no CLS); the governor has nothing left to
 *  govern. Session-capped — every later page this session starts at the
 *  floor the device (or surface) proved it needs. */
function forcePrintFloor(): void {
  if (tier === "print") return;
  jankScore = 0;
  everDownshifted = true;
  persistCap("print");
  stopWatching();
  setTier("print");
}

function promotionAllowed(): boolean {
  if (everDownshifted || gateForcedPrint) return false;
  if (tier !== "core") return false;
  if (readCap() !== null) return false;
  if (window.innerWidth < PROMOTE_MIN_VIEWPORT) return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (connection?.saveData === true) return false;
  if (
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "slow-2g"
  ) {
    return false;
  }
  return true;
}

function maybePromote(): void {
  if (promoted || stableMs < PROMOTE_AFTER_SMOOTH_MS || !promotionAllowed()) {
    return;
  }
  promoted = true;
  /* Additive, at an idle beat — never inside the scroll frame. */
  const promote = () => {
    if (watching && promotionAllowed()) setTier("full");
    else promoted = false;
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(promote);
  } else {
    setTimeout(promote, 200);
  }
}

/**
 * One tick of the shared rAF loop. Cost when idle: one clock read + one
 * compare. Cost when scrolling: the same plus arithmetic — no DOM, no
 * layout, no allocation. The governor must be unmeasurable (§F2).
 */
function sample(): void {
  const now = performance.now();
  if (now < suppressUntilTs) {
    /* Controller-driven flight in progress: machine scrolling is not
       the visitor's experience (§F2 measures the visitor). Firefox in
       particular paces smooth window.scrollTo at a cadence that reads
       as sustained jank and false-downshifted the engine mid-flight. */
    lastFrameTs = Number.NaN;
    return;
  }
  if (now - lastScrollTs > ACTIVE_WINDOW_MS) {
    lastFrameTs = Number.NaN;
    return;
  }
  const delta = now - lastFrameTs;
  lastFrameTs = now;
  if (Number.isNaN(delta)) return; /* first active frame seeds only */

  if (delta > FRAME_SEVERE) addPenalty(4, now);
  else if (delta > FRAME_BAD) addPenalty(2, now);
  else if (delta > FRAME_SLOW) addPenalty(1, now);
  else {
    stableMs += delta;
    if (jankScore > 0) jankScore = decayedScore(now);
    lastScoreTs = now;
    maybePromote();
  }
}

/** When the document last became hidden (engine world only — the
 *  listener lives exactly as long as the watcher). -Infinity means "was
 *  already hidden when watching began", which trips the guard at once. */
let hiddenSinceTs = -Infinity;

function onVisibilityFlip(): void {
  if (document.visibilityState === "hidden") {
    hiddenSinceTs = performance.now();
  }
}

function markScrolled(): void {
  const now = performance.now();
  lastScrollTs = now;
  /* THE BLANK-PLATE GUARD. A scroll event while `document.hidden` means
     the page is being consumed through a surface whose rAF is frozen —
     embedded preview panes, occluded webviews, programmatic captures.
     A frozen rAF means every engine-held reveal is stuck at its start
     frame (invisible ink), and screenshots of such a surface show blank
     paper where figures should be. The honest edition for a surface
     that scrolls without frames is the print floor — the complete
     resting monograph, no rAF required. Guards: a controller flight's
     suppression window, and a short grace after hiding, so a cmd-tab
     mid-momentum (trailing scroll events in the first instants of
     hiddenness) never downshifts a real reader's page. */
  if (
    document.visibilityState === "hidden" &&
    now >= suppressUntilTs &&
    now - hiddenSinceTs > HIDDEN_SCROLL_GRACE_MS
  ) {
    forcePrintFloor();
  }
}

function onLongTasks(list: PerformanceObserverEntryList): void {
  const now = performance.now();
  if (now < suppressUntilTs + 200) return; /* programmatic flight */
  if (now - lastScrollTs > ACTIVE_WINDOW_MS + 200) return;
  const count = list.getEntries().length;
  if (count > 0) addPenalty(LONGTASK_PENALTY * count, now);
}

/**
 * Ignore sampling for the next `ms` milliseconds (§F2: the governor
 * measures the VISITOR's scroll experience; a controller-driven smooth
 * flight is machine scrolling). The window extends, never shrinks, and
 * the frame clock re-seeds so the first post-flight frame scores clean.
 */
export function suppressSampling(ms: number): void {
  const until = performance.now() + ms;
  if (until > suppressUntilTs) suppressUntilTs = until;
  lastFrameTs = Number.NaN;
}

/**
 * Start measuring. Called by SmoothScroll exactly when the motion engine
 * mounts — the governor operates ONLY inside the motion world.
 */
export function startWatching(): void {
  if (watching || typeof window === "undefined") return;
  seedTier();
  if (tier === "print") return; /* nothing below the floor to govern */
  watching = true;
  lastFrameTs = Number.NaN;
  hiddenSinceTs =
    document.visibilityState === "hidden"
      ? -Infinity
      : Number.POSITIVE_INFINITY;
  document.addEventListener("visibilitychange", onVisibilityFlip);
  window.addEventListener("scroll", markScrolled, { passive: true });
  gsap.ticker.add(sample);
  try {
    longtaskObserver = new PerformanceObserver(onLongTasks);
    longtaskObserver.observe({ type: "longtask", buffered: false });
  } catch {
    longtaskObserver = null; /* longtask unsupported — rAF deltas remain */
  }
}

/** Stop measuring (engine unmount, gate close, or the print floor). */
export function stopWatching(): void {
  if (!watching) return;
  watching = false;
  document.removeEventListener("visibilitychange", onVisibilityFlip);
  window.removeEventListener("scroll", markScrolled);
  gsap.ticker.remove(sample);
  longtaskObserver?.disconnect();
  longtaskObserver = null;
  lastFrameTs = Number.NaN;
}

/**
 * The motion gate reports its state (SmoothScroll, on mount and on every
 * gate change). The gate ALWAYS wins over the governor: reduced motion or
 * the quiet toggle force print and disable measurement; when the gate
 * re-opens, the tier returns to the session ceiling (cap ?? core) — never
 * to full directly (full is re-earned via §F3).
 */
export function applyGate(gatedOff: boolean): void {
  seedTier();
  gateForcedPrint = gatedOff;
  if (gatedOff) {
    stopWatching();
    setTier("print");
    return;
  }
  const cap = readCap();
  setTier(cap ?? (everDownshifted ? "print" : "core"));
}

/**
 * Tier hook for scenes/engines — mirrors `useLenis()`: subscribe via
 * context-free store, re-render only on tier CHANGES. `stableForMs` is a
 * render-time snapshot; poll `getStableMs()` at a deferred moment for
 * §F3 mount decisions (it accumulates without re-rendering anything).
 */
export function useTier(): { tier: Tier; stableForMs: number } {
  const current = useSyncExternalStore(
    subscribeTier,
    getTier,
    () => "core" as Tier
  );
  return { tier: current, stableForMs: getStableMs() };
}

/* ── Test probe (frame-governor.spec.ts) ─────────────────────────────
   Unit-style assertions need to drive the REAL scorer deterministically:
   the probe feeds synthetic frame deltas / long tasks through the same
   addPenalty path the samplers use. A handful of bytes, no behavior.

   CRITIC-LEDGER F74 — it shipped to production, unconditionally. Any
   script on the page could call `injectFrame(200)` four times and force
   every reader to the print tier: a remote control for someone else's
   experience, mounted on every load.

   The obvious fix (`NODE_ENV !== "production"`) does not work here. The
   e2e scripts run a real `next build`, so NODE_ENV is "production" in
   the very build frame-governor.spec.ts exercises — gating on it would
   delete the probe from the only build that tests it, and the spec
   would go green by never running its own assertions.

   The gate is therefore an explicit, opt-in build flag.
   NEXT_PUBLIC_TEST_PROBES is set by the test:e2e:* scripts in
   package.json and by nothing else, so:
     · `npm run build`      (and every deploy) → flag unset → no probe;
     · `npm run test:e2e:*` → flag "1"         → probe present.
   Next inlines NEXT_PUBLIC_* at build time, so with the flag unset the
   condition folds to `false` and the whole block is dead code the
   bundler drops — the harness is not merely disabled in production, it
   is not shipped.

   playwright.config.ts asserts the same flag before it starts the
   static server, so a probe-dependent spec run against a probe-less
   build fails loudly with a build instruction rather than a null
   dereference. */
declare global {
  interface Window {
    __frameGovernor?: {
      state: () => {
        tier: Tier;
        score: number;
        stableMs: number;
        watching: boolean;
      };
      injectFrame: (deltaMs: number) => void;
      injectLongTask: () => void;
      /** Detach the samplers without touching the tier — for A/B
       *  overhead measurement only (the PERF-AUDIT harness). */
      pause: () => void;
    };
  }
}

if (
  process.env.NEXT_PUBLIC_TEST_PROBES === "1" &&
  typeof window !== "undefined"
) {
  window.__frameGovernor = {
    state: () => ({
      tier: getTier(),
      score: decayedScore(performance.now()),
      stableMs,
      watching,
    }),
    injectFrame: (deltaMs: number) => {
      const now = performance.now();
      if (deltaMs > FRAME_SEVERE) addPenalty(4, now);
      else if (deltaMs > FRAME_BAD) addPenalty(2, now);
      else if (deltaMs > FRAME_SLOW) addPenalty(1, now);
      else {
        stableMs += deltaMs;
        if (jankScore > 0) jankScore = decayedScore(now);
        lastScoreTs = now;
      }
    },
    injectLongTask: () => {
      addPenalty(LONGTASK_PENALTY, performance.now());
    },
    pause: () => {
      stopWatching();
    },
  };
}
