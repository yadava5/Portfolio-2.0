/**
 * @fileoverview The set name answers the hand by scattering into its own
 * print screen (owner pick, 2026-10-16: "each individual character should
 * scatter, and wherever the dots spread around, that should act as a
 * continuous scatter for the next character").
 *
 * The lab that chose it is tmp/v13/lab/NAME (CONCEPTS-DOTS.md, NOTE.md
 * F1-F15): five ways the scatter could travel were built and measured, and
 * this is their combination. What each part is, and which flaw of the first
 * cut it answers, is said where it lives below.
 *
 * Framework-free and dependency-free, like the machines it follows: the run
 * loads it through nameplateMachines' compiled module graph.
 */

/** The run's `stir` (src/run/index.html, "THE HAND"): the engine calls the
 *  stepper on every frame for as long as it returns true, and drops it on
 *  the frame it returns false. One rAF loop (F3). */
export type Stir = (step: (now: number) => boolean) => void;

/** Cheap, read-only state for the run's `__world.name()` probe. */
export type HandProbe = {
  live: boolean;
  /** the raster the dots are cut from has loaded */
  ready: boolean;
  steps: number;
  /** frames on which the hand's path actually reached the dots: a cursor
   *  parked on the name, and a page scrolled under one, cannot move this */
  driven: number;
  presses: number;
  /** the furthest any dot has been from home since mount, em */
  peak: number;
  dots: number;
  loose: number;
  /** every span's style attribute is byte-for-byte its pre-mount self, and
   *  no script animation (the veil) is left on any letter */
  rest: boolean;
  /** the current (or last) scatter, from the first loose dot to rest: the
   *  letters it broke, the most dots loose at once, the largest step any one
   *  dot took in one frame (px), and its frames */
  episode: {
    broken: number[];
    maxLoose: number;
    maxJump: number;
    frames: number;
  };
};

/** The letters' own axes: `.np-ch`'s, and np-settype's last keyframe. */
const REST_AXES = '"opsz" 144, "SOFT" 50, "WONK" 0, "wght" 600';

/* THE TUNING, every number measured in the lab against a filmstrip on a fake
   clock (8 ms of gesture is 8 ms of simulation, so no screenshot could slow
   what it recorded). Lengths are em unless said, speeds em/s. */
const SCATTER = {
  /** the hand's reach either side of its path */
  reach: 0.46,
  /** below this speed (px/s) the hand does nothing at all: a hand resting
   *  on the name is not a hand moving */
  still: 25,
  /** the throw starts at `throw0` px/s and is full by `throw0 + throwSpan` */
  throw0: 260,
  throwSpan: 700,
  /** how much of the hand's speed a dot takes, and the little give it gets
   *  to either side of the hand's line */
  carry: 0.78,
  push: 0.08,
  /** the angle a dot may leave at, either side of the hand's direction (rad) */
  fan: 1.5,
  /** knock-on: a loose dot faster than `knock` px/s unseats the seated dots
   *  it flies into, gives them `give` of its velocity and keeps `keep` */
  knock: 260,
  give: 0.56,
  keep: 0.72,
  /** the slow hand's loosening: heat per px/s, how far it spreads along the
   *  name (per s) and how fast it cools (per s), the wander it allows (em),
   *  and the speed (px/s) above which a hand gives none */
  heatGain: 1 / 2400,
  heatSpread: 2.2,
  heatCool: 3.6,
  heatAmp: 0.1,
  heatTop: 900,
  /** the re-print: the roller starts this long (ms) after the hand lets go
   *  or stops, and crosses the name at `rollerV` px/s */
  rollerDelay: 360,
  rollerV: 2600,
  /** a dot past `tether` em from home is reeled in */
  tether: 0.85,
  /** air drag (per s), the dot speed limit (em/s), and the hand's (em/s) */
  drag: 6,
  vmax: 7,
  handMax: 12,
  /** one event further than this (em) is a pointer that jumped, not a hand */
  teleport: 2.4,
  /** a press or a tap: radius (em) and strength (px/s) */
  burstR: 0.9,
  burst: 1100,
};

/**
 * Mount the scatter on a settled nameplate.
 *
 * @param plate - The plate (overlay coordinate space)
 * @param h1 - The nameplate
 * @param letters - The character spans
 * @param g0 - The settled geometry the performance measured (its baseline)
 * @param stir - The run's stepper hook
 * @returns unmount (synchronous: every span back to its pre-mount style)
 *   and the probe
 */
export function mountNameHand(
  plate: HTMLDivElement,
  h1: HTMLElement,
  letters: HTMLElement[],
  g0: { base: number; capH?: number },
  stir: Stir
): { unmount: () => void; probe: () => HandProbe } {
  const N = letters.length;
  const snap = letters.map((l) => l.style.cssText);
  const bead = letters.map((l) => !l.classList.contains("np-sp"));
  let dead = false;

  /* ── geometry: one batch of reads at mount, none per frame ───────────── */
  const pr0 = plate.getBoundingClientRect();
  const fs = parseFloat(getComputedStyle(h1).fontSize);
  const rects = letters.map((l) => {
    const r = l.getBoundingClientRect();
    return {
      x: r.left - pr0.left,
      y: r.top - pr0.top,
      w: r.width,
      h: r.height,
    };
  });
  const seated0 = rects.filter((_, i) => bead[i]);
  const bx0 = Math.min(...seated0.map((r) => r.x));
  const bx1 = Math.max(...seated0.map((r) => r.x + r.w));
  const by0 = Math.min(...seated0.map((r) => r.y));
  const by1 = Math.max(...seated0.map((r) => r.y + r.h));
  const dpr = Math.min(2, devicePixelRatio || 1);
  const pad = fs * 1.4;
  /* THE CANVAS SITS ON THE DEVICE PIXEL GRID. At a fractional offset its
     raster was resampled half a pixel against the letters it stands in for
     (1.2-1.6px of registration error, measured); snapped, the swap frame
     lands within half a pixel at 1440 and 1280. */
  const onGrid = (v: number, o: number) => Math.floor((v + o) * dpr) / dpr - o;
  const X0 = onGrid(bx0 - pad, pr0.left);
  const Y0 = onGrid(by0 - pad * 0.8, pr0.top);
  const CW = Math.ceil(bx1 - bx0 + 2 * pad);
  const CH = Math.ceil(by1 - by0 + 1.6 * pad);
  const base = g0.base;
  const ink = getComputedStyle(h1).color;
  /* THE CLOUD STAYS IN THE NAME'S OWN LINE. A round tether let dots fly over
     the hourline above and the role line below at every size (seen in the
     films at 1440 and 390). So each dot also meets two soft walls: a fifth
     of an em above the cap line and below the baseline, and never closer
     than 3px to the lines that are really there, read once here with the
     rest of the geometry. */
  const capTop = base - (g0.capH ?? fs * 0.7);
  const near = (el: Element | null, side: "top" | "bottom") => {
    if (!el) return NaN;
    const r = el.getBoundingClientRect();
    if (!r.height || r.right < pr0.left + bx0 || r.left > pr0.left + bx1)
      return NaN;
    return (side === "top" ? r.top : r.bottom) - pr0.top;
  };
  const above = near(plate.previousElementSibling, "bottom");
  const below = near(plate.nextElementSibling, "top");
  /* the screen: a cell this size per dot, so a 166px name is ~1,650 dots */
  const P = Math.max(3.2, fs / 30);
  /* the walls, canvas-local px */
  const wallTop =
    Math.max(capTop - fs * 0.2, above === above ? above + 3 : -Infinity) - Y0;
  const wallBot =
    Math.min(base + fs * 0.2, below === below ? below - 3 : Infinity) - Y0;

  const cv = document.createElement("canvas");
  cv.width = Math.round(CW * dpr);
  cv.height = Math.round(CH * dpr);
  /* PAINT, NOT TEXT: the dots are the name drawn again, and the h1's
     accessible name is its aria-label alone */
  cv.setAttribute("aria-hidden", "true");
  /* max-width:none, and that is the first defect the lab found: the run's
     `img,canvas,svg{max-width:100%}` clamped this canvas to the plate, which
     at 1280 is narrower than the name plus its margin, so it drew 0.74x
     wide and every dot sat left of its letter */
  cv.style.cssText =
    `position:absolute;left:${X0}px;top:${Y0}px;width:${CW}px;height:${CH}px;` +
    "max-width:none;max-height:none;pointer-events:none;visibility:hidden";
  plate.appendChild(cv);
  const ctx = cv.getContext("2d");

  /* ── the veil: the DOM letter hides under its crumbling copy ──────────
     A paused WAAPI opacity, never an inline write: np-settype holds six of
     the letters in an animation, and a script animation is the one thing
     above it. cancel() is exact rest. */
  const veils: (Animation | null)[] = letters.map(() => null);
  const veil = (i: number, on: boolean) => {
    if (!on) {
      veils[i]?.cancel();
      veils[i] = null;
    } else if (!veils[i]) {
      const a = letters[i].animate(
        { opacity: [0, 0] },
        { duration: 1000, fill: "both" }
      );
      a.pause();
      veils[i] = a;
    }
  };
  const unveilAll = () => {
    for (let i = 0; i < N; i++) veil(i, false);
  };

  /* ── the dots ─────────────────────────────────────────────────────── */
  let D = 0;
  let hx = new Float32Array(0);
  let hy = new Float32Array(0);
  let x = new Float32Array(0);
  let y = new Float32Array(0);
  let vx = new Float32Array(0);
  let vy = new Float32Array(0);
  let rr = new Float32Array(0);
  let li = new Uint8Array(0);
  /* each dot's cell, device px within its letter's raster */
  let cellX = new Int32Array(0);
  let cellY = new Int32Array(0);
  let cellW = new Int32Array(0);
  let cellH = new Int32Array(0);
  let seated = new Uint8Array(0);
  let tHit = new Float64Array(0);
  let prevX = new Float32Array(0);
  let prevY = new Float32Array(0);
  const lx0 = new Int32Array(N);
  const lw = new Int32Array(N);
  const looseN = new Int32Array(N);
  /* each letter's pristine raster, and its ink still in place: a cell is
     cut out ONCE when its dot leaves and painted back ONCE, from the
     pristine raster, when it seats (re-cutting every crumbling letter every
     frame was 3.4 of 5.5ms a frame at 4x CPU, measured) */
  const pristine: (HTMLCanvasElement | null)[] = letters.map(() => null);
  const remain: (HTMLCanvasElement | null)[] = letters.map(() => null);
  const cutQ: number[] = [];
  const seatQ: number[] = [];
  /* a static hash of the dots' homes, so a flying dot finds the seated dots
     it flies into without a scan */
  const grid = new Map<number, number[]>();
  const key = (gx: number, gy: number) => gx * 4096 + gy;
  let ready = false;

  /* THE RASTER IS THE PAGE'S OWN INSTANCE OF THE FACE. A canvas cannot set
     font-variation-settings, so canvas text is Fraunces at SOFT 0, not the
     letters' 50: 0.025em off (4.2px on the A at 166px) at any size it is
     drawn at, measured. So the glyphs are drawn by the browser's own text
     engine, in an SVG image that carries the same woff2 and REST_AXES, one
     letter to a row so a kerned neighbour never lands in another letter's
     cells, at the device's pixel ratio. */
  const fontUrl = (): string => {
    for (const ss of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = ss.cssRules;
      } catch {
        continue;
      }
      for (const r of Array.from(rules)) {
        if (!(r instanceof CSSFontFaceRule)) continue;
        if (!/Fraunces/.test(r.style.getPropertyValue("font-family"))) continue;
        const m = r.style.getPropertyValue("src").match(/url\(["']?([^"')]+)/);
        if (m) return new URL(m[1], ss.href || location.href).href;
      }
    }
    return new URL("fonts/fraunces-latin-var.woff2", location.href).href;
  };
  const raster = async (): Promise<HTMLImageElement> => {
    const blob = await (await fetch(fontUrl())).blob();
    const data = await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result));
      fr.onerror = () => rej(fr.error);
      fr.readAsDataURL(blob);
    });
    const esc = (c: string) => c.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const texts = letters
      .map((l, i) =>
        bead[i]
          ? `<text x="${(rects[i].x - X0).toFixed(3)}" y="${(i * CH + base - Y0).toFixed(3)}">${esc(l.textContent ?? "")}</text>`
          : ""
      )
      .join("");
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(CW * dpr)}" height="${Math.ceil(CH * N * dpr)}" viewBox="0 0 ${CW} ${CH * N}">` +
      `<style>@font-face{font-family:NP;src:url(${data}) format("woff2");font-weight:100 900}` +
      `text{font-family:NP;font-size:${fs}px;font-weight:600;font-variation-settings:${REST_AXES};` +
      `font-optical-sizing:none;fill:${ink}}</style>${texts}</svg>`;
    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    await img.decode();
    return img;
  };
  const build = (img: HTMLImageElement) => {
    const S = dpr;
    type Dot = {
      i: number;
      hx: number;
      hy: number;
      r: number;
      cx: number;
      cy: number;
      cw: number;
      ch: number;
    };
    const list: Dot[] = [];
    for (let i = 0; i < N; i++) {
      if (!bead[i]) continue;
      const r = rects[i];
      const gx0 = Math.max(0, Math.floor(r.x - X0 - fs * 0.25));
      const gx1 = Math.min(CW, Math.ceil(r.x - X0 + r.w + fs * 0.25));
      lx0[i] = gx0;
      lw[i] = gx1 - gx0;
      const c = document.createElement("canvas");
      c.width = Math.ceil(lw[i] * S);
      c.height = Math.ceil(CH * S);
      const g = c.getContext("2d", { willReadFrequently: true });
      if (!g) return;
      g.drawImage(
        img,
        gx0 * S,
        i * CH * S,
        c.width,
        c.height,
        0,
        0,
        c.width,
        c.height
      );
      pristine[i] = c;
      const keep = document.createElement("canvas");
      keep.width = c.width;
      keep.height = c.height;
      keep.getContext("2d")?.drawImage(c, 0, 0);
      remain[i] = keep;
      const px = g.getImageData(0, 0, c.width, c.height).data;
      const iw = c.width;
      /* cell edges on whole device pixels, shared by neighbours: cut at
         fractional edges, two adjacent cells left a hairline of ink between
         them across every emptied letter */
      const rows = Math.floor(CH / P);
      const cols = Math.floor(lw[i] / P);
      for (let ry = 0; ry < rows; ry++)
        for (let cx = 0; cx < cols; cx++) {
          const y0 = Math.round(ry * P * S);
          const y1 = Math.round((ry + 1) * P * S);
          const x0 = Math.round(cx * P * S);
          const x1 = Math.round((cx + 1) * P * S);
          let a = 0;
          let ax = 0;
          let ay = 0;
          for (let qy = y0; qy < y1; qy++)
            for (let qx = x0; qx < x1; qx++) {
              const q = px[(qy * iw + qx) * 4 + 3];
              a += q;
              ax += q * (qx + 0.5);
              ay += q * (qy + 0.5);
            }
          const cov = a / ((y1 - y0) * (x1 - x0)) / 255;
          /* every cell with any ink is a dot: at 5% the leftover edge ink of
             the cells that never left stood in the emptied letters as ghosts */
          if (cov < 0.004) continue;
          list.push({
            i,
            /* the dot sits on its cell's own ink, not at the cell's centre */
            hx: gx0 + ax / a / S,
            hy: ay / a / S,
            r: (P / 2) * Math.min(1.12, Math.sqrt(cov) * 1.12),
            cx: x0,
            cy: y0,
            cw: x1 - x0,
            ch: y1 - y0,
          });
        }
    }
    D = list.length;
    hx = Float32Array.from(list, (d) => d.hx);
    hy = Float32Array.from(list, (d) => d.hy);
    rr = Float32Array.from(list, (d) => d.r);
    li = Uint8Array.from(list, (d) => d.i);
    cellX = Int32Array.from(list, (d) => d.cx);
    cellY = Int32Array.from(list, (d) => d.cy);
    cellW = Int32Array.from(list, (d) => d.cw);
    cellH = Int32Array.from(list, (d) => d.ch);
    x = new Float32Array(D);
    y = new Float32Array(D);
    vx = new Float32Array(D);
    vy = new Float32Array(D);
    seated = new Uint8Array(D).fill(1);
    tHit = new Float64Array(D);
    prevX = Float32Array.from(hx);
    prevY = Float32Array.from(hy);
    for (let k = 0; k < D; k++) {
      const gk = key(Math.floor(hx[k] / P), Math.floor(hy[k] / P));
      const cell = grid.get(gk);
      if (cell) cell.push(k);
      else grid.set(gk, [k]);
    }
    ready = true;
  };
  /* A RASTER THAT HAS NEVER BEEN SHOWN IS RASTERISED THE FIRST FRAME IT IS,
     and that frame would be somebody's first hover: one frame of 66.7ms,
     measured on a real GPU. Two frames at four thousandths of opacity, in
     the quiet after the performance, buy it while nothing moves. */
  const warm = () => {
    if (!ctx) return;
    requestAnimationFrame(() => {
      if (dead || live) return;
      for (let i = 0; i < N; i++) {
        const c = pristine[i];
        if (c) ctx.drawImage(c, lx0[i] * dpr, 0);
      }
      cv.style.opacity = "0.004";
      cv.style.visibility = "visible";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          cv.style.opacity = "";
          if (dead || live) return;
          ctx.clearRect(0, 0, cv.width, cv.height);
          cv.style.visibility = "hidden";
        })
      );
    });
  };
  raster()
    .then((img) => {
      if (dead) return;
      build(img);
      warm();
    })
    .catch(() => {
      /* no raster, no scatter: the name simply stays still, which is the
         reduced-motion world and a complete name */
    });

  /* ── the hand ─────────────────────────────────────────────────────── */
  /** plate-local x, y and the event's time, five to a sample with the client
   *  position, collected by the moves and consumed by the frame */
  const path: number[] = [];
  let lastCX = NaN;
  let lastCY = NaN;
  let lastScroll = -1e9;
  let handT = -1e9;
  let presses = 0;
  let driven = 0;
  const inBand = (lx: number, ly: number) =>
    lx > X0 + pad * 0.55 &&
    lx < X0 + CW - pad * 0.55 &&
    ly > Y0 + pad * 0.35 &&
    ly < Y0 + CH - pad * 0.4;
  const onScroll = () => {
    lastScroll = performance.now();
    path.length = 0;
    lastCX = NaN;
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch" || dead) return;
    const t = performance.now();
    /* WebKit sends trusted moves with no movement while the page scrolls
       under a still cursor: those, and anything within 150ms of a scroll,
       are not a hand */
    if (t - lastScroll < 150) {
      path.length = 0;
      lastCX = NaN;
      return;
    }
    if (e.clientX === lastCX && e.clientY === lastCY) return;
    lastCX = e.clientX;
    lastCY = e.clientY;
    const pr = plate.getBoundingClientRect();
    const list = e.getCoalescedEvents?.() ?? [];
    for (const q of list.length ? list : [e])
      path.push(q.clientX - pr.left, q.clientY - pr.top, t);
    if (path.length > 3 * 64) path.splice(0, path.length - 3 * 64);
    if (inBand(e.clientX - pr.left, e.clientY - pr.top)) {
      handT = t;
      wake();
    }
  };
  let touched = false;
  const onDown = (e: PointerEvent) => {
    touched = e.pointerType === "touch";
  };
  /* A PRESS, OR A PHONE'S TAP, IS A BURST under the pointer, and the
     knock-ons carry it into the neighbours. A click and never a touchmove,
     so a scroll that starts on the name is never taken. */
  const onClick = (e: MouseEvent) => {
    const pr = plate.getBoundingClientRect();
    burst(
      e.clientX - pr.left - X0,
      e.clientY - pr.top - Y0,
      touched ? 1 : 0.85
    );
    touched = false;
    presses++;
    wake();
  };
  const scope: HTMLElement = plate.closest("section") ?? document.body;
  scope.addEventListener("pointermove", onMove, { passive: true });
  h1.addEventListener("pointerdown", onDown, { passive: true });
  h1.addEventListener("click", onClick);
  addEventListener("scroll", onScroll, { passive: true });

  /* ── forces ───────────────────────────────────────────────────────── */
  const R = fs * SCATTER.reach;
  const VMAX2 = (fs * SCATTER.vmax) ** 2;
  const hash = (n: number) => {
    n = n ^ 61 ^ (n >>> 16);
    n = n + (n << 3);
    n ^= n >>> 4;
    n = Math.imul(n, 0x27d4eb2d);
    n ^= n >>> 15;
    return (n >>> 0) / 4294967296;
  };
  const noise = (k: number, t: number) => {
    const i = Math.floor(t);
    const f = t - i;
    const u = f * f * (3 - 2 * f);
    return (hash(k * 7919 + i) * (1 - u) + hash(k * 7919 + i + 1) * u) * 2 - 1;
  };
  const cap = (k: number) => {
    const s2 = vx[k] * vx[k] + vy[k] * vy[k];
    if (s2 > VMAX2) {
      const f = Math.sqrt(VMAX2 / s2);
      vx[k] *= f;
      vy[k] *= f;
    }
  };
  const loosen = (k: number, t: number) => {
    if (seated[k]) {
      seated[k] = 0;
      looseN[li[k]]++;
      cutQ.push(k);
    }
    tHit[k] = t;
  };
  const heat = new Float32Array(Math.ceil(CW / P) + 2);
  let releaseAt = 0;
  let rollerOn = false;
  let rollerX = -Infinity;
  const burst = (bx: number, by: number, e: number) => {
    if (!D) return;
    const t = performance.now();
    const rad = fs * SCATTER.burstR;
    for (let k = 0; k < D; k++) {
      const dx = hx[k] + x[k] - bx;
      const dy = hy[k] + y[k] - by;
      const d = Math.hypot(dx, dy);
      if (d > rad) continue;
      const s = e * SCATTER.burst * (1 - d / rad) * (0.6 + 0.4 * hash(k + 3));
      vx[k] += (dx / (d + 1)) * s;
      vy[k] += (dy / (d + 1)) * s - s * 0.15;
      cap(k);
      loosen(k, t);
    }
    releaseAt = t;
    rollerOn = false;
  };
  /** the hand along one segment of its path (canvas-local px, px/s) */
  const handSeg = (
    ax: number,
    ay: number,
    bx: number,
    by: number,
    svx: number,
    svy: number,
    t: number
  ) => {
    const sp = Math.hypot(svx, svy);
    if (sp < SCATTER.still) return;
    const L2 = (bx - ax) ** 2 + (by - ay) ** 2 || 1;
    const L = Math.sqrt(L2);
    const nx = -(by - ay) / L;
    const ny = (bx - ax) / L;
    const minX = Math.min(ax, bx) - R;
    const maxX = Math.max(ax, bx) + R;
    const minY = Math.min(ay, by) - R;
    const maxY = Math.max(ay, by) + R;
    /* how much of the reach this segment covers: a long segment (a fast
       hand, a slow frame) does as much as several short ones */
    const cover = Math.min(1, L / R + 0.25);
    const thr = Math.min(
      1,
      Math.max(0, (sp - SCATTER.throw0) / SCATTER.throwSpan)
    );
    const warmth = Math.max(0, 1 - sp / SCATTER.heatTop);
    const ux = svx / sp;
    const uy = svy / sp;
    let reached = false;
    for (let k = 0; k < D; k++) {
      const px = hx[k] + x[k];
      const py = hy[k] + y[k];
      if (px < minX || px > maxX || py < minY || py > maxY) continue;
      const u = Math.max(
        0,
        Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / L2)
      );
      const qx = ax + (bx - ax) * u;
      const qy = ay + (by - ay) * u;
      const d = Math.hypot(px - qx, py - qy);
      if (d >= R) continue;
      reached = true;
      const w = (1 - d / R) ** 2 * cover;
      /* THE SLOW HAND LOOSENS THE INK instead of throwing it (the loose
         screen's part): a reading pass at 80px/s answered 0 letters in the
         version picked, and answers 5 here */
      if (warmth > 0) {
        const b = Math.floor(px / P);
        if (b >= 0 && b < heat.length)
          heat[b] = Math.min(1.5, heat[b] + sp * SCATTER.heatGain * w * warmth);
      }
      if (thr <= 0) continue;
      /* A SCATTER, NOT A PARTING (carried ink's part): each dot is thrown
         at its own angle about the hand's direction, at its own share of the
         speed, so a letter bursts into a cloud that travels with the hand.
         The first cut pushed dots away from the hand's line and emptied the
         letters into two streams, a comb through sand. */
      const side =
        Math.sign((px - qx) * nx + (py - qy) * ny) || (hash(k) > 0.5 ? 1 : -1);
      const ang = (hash(k + 5) - 0.5) * SCATTER.fan;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const mag = sp * 0.5 * SCATTER.carry * (0.35 + 0.65 * hash(k + 9));
      const tx =
        (ux * ca - uy * sa) * mag + nx * side * SCATTER.push * sp * 0.4;
      const ty =
        (ux * sa + uy * ca) * mag +
        ny * side * SCATTER.push * sp * 0.4 -
        sp * 0.03;
      vx[k] += (tx - vx[k] * 0.5) * w * thr;
      vy[k] += (ty - vy[k] * 0.5) * w * thr;
      cap(k);
      loosen(k, t);
    }
    return reached;
  };

  /* ── one frame ────────────────────────────────────────────────────── */
  let live = false;
  let steps = 0;
  let last = 0;
  let peak = 0;
  let lastLX = NaN;
  let lastLY = 0;
  let lastLT = 0;
  const episode = {
    broken: new Set<number>(),
    maxLoose: 0,
    maxJump: 0,
    frames: 0,
  };
  let episodeOpen = false;
  const SUB = 1 / 240;
  let dirty: { x0: number; y0: number; x1: number; y1: number } | null = null;

  const restAll = () => {
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
    }
    cv.style.visibility = "hidden";
    unveilAll();
    for (let k = 0; k < D; k++) {
      x[k] = y[k] = vx[k] = vy[k] = 0;
      prevX[k] = hx[k];
      prevY[k] = hy[k];
    }
    seated.fill(1);
    looseN.fill(0);
    heat.fill(0);
    for (let i = 0; i < N; i++) {
      const c = pristine[i];
      const g = remain[i]?.getContext("2d");
      if (!c || !g) continue;
      g.clearRect(0, 0, c.width, c.height);
      g.drawImage(c, 0, 0);
    }
    cutQ.length = 0;
    seatQ.length = 0;
    path.length = 0;
    lastLX = NaN;
    rollerOn = false;
    dirty = null;
    last = 0;
    live = false;
    episodeOpen = false;
  };

  const step = (t: number): boolean => {
    if (dead) return false;
    if (!ready) {
      /* the raster is still on its way: hold the loop a moment, then let go */
      if (t - handT < 400) return true;
      live = false;
      return false;
    }
    steps++;
    const dtF = last
      ? Math.min(0.05, Math.max(0.001, (t - last) / 1000))
      : 1 / 60;
    last = t;
    if (!episodeOpen) {
      episodeOpen = true;
      episode.broken.clear();
      episode.maxLoose = 0;
      episode.maxJump = 0;
      episode.frames = 0;
    }

    /* the hand: every segment it drew since the last frame */
    let reached = false;
    for (let p = 0; p + 2 < path.length; p += 3) {
      const lxp = path[p] - X0;
      const lyp = path[p + 1] - Y0;
      const tp = path[p + 2];
      if (lastLX === lastLX && tp - lastLT < 300) {
        const dt = Math.max(0.004, (tp - lastLT) / 1000);
        let svx = (lxp - lastLX) / dt;
        let svy = (lyp - lastLY) / dt;
        /* A POINTER THAT JUMPS IS NOT A HAND: one event 600px off the name
           read as a 75,000px/s swipe and threw a dot 438px in one frame,
           measured. A segment longer than `teleport` in one event is
           skipped, and the forces see a hand of at most `handMax`. */
        const segL = Math.hypot(lxp - lastLX, lyp - lastLY);
        const spd = Math.hypot(svx, svy);
        const SMAX = fs * SCATTER.handMax;
        if (spd > SMAX) {
          svx *= SMAX / spd;
          svy *= SMAX / spd;
        }
        if (segL <= fs * SCATTER.teleport) {
          if (inBand(lxp + X0, lyp + Y0) || inBand(lastLX + X0, lastLY + Y0))
            if (handSeg(lastLX, lastLY, lxp, lyp, svx, svy, t)) reached = true;
        }
      }
      lastLX = lxp;
      lastLY = lyp;
      lastLT = tp;
    }
    path.length = 0;
    if (t - lastLT > 300) lastLX = NaN;
    if (reached) driven++;

    /* the re-print roller (re-print's part): it waits for the hand to let
       go or to stop, then crosses the name once, and every dot flies home
       as it passes over that dot's place */
    const handActive = t - handT < 90;
    if (handActive) {
      rollerOn = false;
      releaseAt = t;
    } else if (!rollerOn && t - releaseAt > SCATTER.rollerDelay) {
      rollerOn = true;
      rollerX = lx0[0] - P * 4;
    }
    if (rollerOn) rollerX += SCATTER.rollerV * dtF;

    /* heat spreads along the name and cools */
    let warmAny = false;
    {
      const sp = Math.min(0.45, SCATTER.heatSpread * dtF);
      const cool = Math.exp(-SCATTER.heatCool * dtF);
      let prev = heat[0];
      for (let b = 0; b < heat.length; b++) {
        const cur = heat[b];
        const nxt = b + 1 < heat.length ? heat[b + 1] : cur;
        heat[b] = (cur + (prev + nxt - 2 * cur) * sp) * cool;
        if (heat[b] < 0.002) heat[b] = 0;
        else warmAny = true;
        prev = cur;
      }
    }

    /* integrate, in fixed substeps so 60Hz and 120Hz fly the same dots */
    const nSub = Math.min(12, Math.max(1, Math.round(dtF / SUB)));
    const h = dtF / nSub;
    const drag = Math.exp(-SCATTER.drag * h);
    const RT = fs * SCATTER.tether;
    let anyLoose = false;
    for (let k = 0; k < D; k++) {
      let hk = 0;
      if (warmAny) {
        const b = Math.floor(hx[k] / P);
        hk = b >= 0 && b < heat.length ? heat[b] : 0;
        if (hk > 0.02) loosen(k, t);
      }
      if (seated[k]) continue;
      anyLoose = true;
      const age = t - tHit[k];
      /* home: free while the roller has not reached it, then a spring; and
         past a deadline the spring holds whatever the roller is doing, so
         nothing is ever left loose */
      let w = rollerOn && rollerX >= hx[k] ? 26 : 0;
      if (age > 2600) w = Math.max(w, 30);
      let ox = 0;
      let oy = 0;
      if (hk > 0.02) {
        const a = Math.min(1, hk) * fs * SCATTER.heatAmp;
        ox = noise(k, t / 300) * a;
        oy = noise(k + 999, t / 330) * a;
        if (w === 0 && age > 260) w = 14;
      }
      const z = 2 * 0.9 * w;
      for (let s = 0; s < nSub; s++) {
        let ax = w * w * (ox - x[k]) - z * vx[k];
        let ay = w * w * (oy - y[k]) - z * vy[k];
        /* the tether (the shockwave's lesson: energy must fall): past it a
           dot is reeled in, so the cloud keeps the shape of the name it came
           from and never leaves the canvas */
        const o = Math.hypot(x[k], y[k]);
        if (o > RT) {
          const e = (o - RT) / o;
          ax -= 900 * e * x[k] + 8 * vx[k];
          ay -= 900 * e * y[k] + 8 * vy[k];
        }
        /* and the line's walls. A dot's own home is always inside them: with
           the radius added after the home was taken in, a dot seated near
           the cap line was pushed off its home for good and the name never
           re-printed (caught by the harness: 6s, stuck, every engine) */
        const py = hy[k] + y[k];
        const top = Math.min(wallTop + rr[k], hy[k]);
        const bot = Math.max(wallBot - rr[k], hy[k]);
        if (py < top) ay += 2600 * (top - py) - (vy[k] < 0 ? 18 * vy[k] : 0);
        else if (py > bot)
          ay -= 2600 * (py - bot) + (vy[k] > 0 ? 18 * vy[k] : 0);
        vx[k] = (vx[k] + ax * h) * drag;
        vy[k] = (vy[k] + ay * h) * drag;
        x[k] += vx[k] * h;
        y[k] += vy[k] * h;
      }
      let s2 = vx[k] * vx[k] + vy[k] * vy[k];
      if (s2 > VMAX2) {
        const f = Math.sqrt(VMAX2 / s2);
        vx[k] *= f;
        vy[k] *= f;
        s2 = VMAX2;
      }
      /* seat: home, slow, and nothing holding it out */
      if (w > 0 && !ox && !oy && x[k] * x[k] + y[k] * y[k] < 0.12 && s2 < 64) {
        x[k] = y[k] = vx[k] = vy[k] = 0;
        seated[k] = 1;
        looseN[li[k]]--;
        seatQ.push(k);
      }
    }

    /* THE KNOCK-ON (dominoes' part), and it is the continuous scatter: a
       fast loose dot unseats the seated dots it flies into and hands them
       most of its momentum, so the scatter of one letter is what breaks
       the next */
    {
      const rc2 = (P * 0.95) ** 2;
      const v2 = SCATTER.knock * SCATTER.knock;
      for (let k = 0; k < D; k++) {
        if (seated[k]) continue;
        if (vx[k] * vx[k] + vy[k] * vy[k] < v2) continue;
        const px = hx[k] + x[k];
        const py = hy[k] + y[k];
        const gx = Math.floor(px / P);
        const gy = Math.floor(py / P);
        for (let a = -1; a <= 1; a++)
          for (let b = -1; b <= 1; b++) {
            const cell = grid.get(key(gx + a, gy + b));
            if (!cell) continue;
            for (const j of cell) {
              if (!seated[j]) continue;
              const dx = hx[j] - px;
              const dy = hy[j] - py;
              if (dx * dx + dy * dy > rc2) continue;
              const jit = 0.75 + 0.5 * hash(j + 17);
              vx[j] = vx[k] * SCATTER.give * jit + dy * 6;
              vy[j] = vy[k] * SCATTER.give * jit - dx * 6;
              vx[k] *= SCATTER.keep;
              vy[k] *= SCATTER.keep;
              loosen(j, t);
            }
          }
      }
    }

    if (!anyLoose && t - handT > 160 && !warmAny) {
      restAll();
      return false;
    }
    draw();
    return true;
  };

  const draw = () => {
    if (!ctx) return;
    const S = dpr;
    /* the cells that changed since the last frame, cut or restored once */
    for (const k of cutQ) {
      if (seated[k]) continue;
      remain[li[k]]
        ?.getContext("2d")
        ?.clearRect(cellX[k], cellY[k], cellW[k], cellH[k]);
    }
    for (const k of seatQ) {
      if (!seated[k]) continue;
      const i = li[k];
      const g = remain[i]?.getContext("2d");
      const c = pristine[i];
      if (!g || !c) continue;
      g.clearRect(cellX[k], cellY[k], cellW[k], cellH[k]);
      g.drawImage(
        c,
        cellX[k],
        cellY[k],
        cellW[k],
        cellH[k],
        cellX[k],
        cellY[k],
        cellW[k],
        cellH[k]
      );
    }
    cutQ.length = 0;
    seatQ.length = 0;
    /* this frame's box: the crumbling letters and every loose dot, so a
       frame clears only what it drew and what the last one did */
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (let i = 0; i < N; i++)
      if (looseN[i]) {
        x0 = Math.min(x0, lx0[i]);
        x1 = Math.max(x1, lx0[i] + lw[i]);
        y0 = 0;
        y1 = CH;
      }
    let jump = 0;
    let loose = 0;
    for (let k = 0; k < D; k++) {
      if (seated[k]) continue;
      const px = hx[k] + x[k];
      const py = hy[k] + y[k];
      const r = rr[k] + 1;
      if (px - r < x0) x0 = px - r;
      if (px + r > x1) x1 = px + r;
      if (py - r < y0) y0 = py - r;
      if (py + r > y1) y1 = py + r;
    }
    const cur =
      x0 < x1
        ? {
            x0: Math.max(0, Math.floor(x0)),
            y0: Math.max(0, Math.floor(y0)),
            x1: Math.min(CW, Math.ceil(x1)),
            y1: Math.min(CH, Math.ceil(y1)),
          }
        : null;
    const clr =
      dirty && cur
        ? {
            x0: Math.min(dirty.x0, cur.x0),
            y0: Math.min(dirty.y0, cur.y0),
            x1: Math.max(dirty.x1, cur.x1),
            y1: Math.max(dirty.y1, cur.y1),
          }
        : dirty || cur;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (clr)
      ctx.clearRect(
        clr.x0 * S,
        clr.y0 * S,
        (clr.x1 - clr.x0) * S,
        (clr.y1 - clr.y0) * S
      );
    dirty = cur;
    /* THE SWAP IS A CRUMBLE. A letter is drawn here only while one of its
       dots is loose, as its own raster less the cells that have left, and
       the DOM letter is veiled in the same frame: at the moment it breaks
       the canvas shows exactly the glyph, so there is no pop, no double ink
       and no gap (340 double-ink letter-frames a gesture in the version
       picked, 0 here) */
    for (let i = 0; i < N; i++) {
      if (!bead[i]) continue;
      const c = remain[i];
      if (!looseN[i] || !c) {
        veil(i, false);
        continue;
      }
      ctx.drawImage(c, lx0[i] * S, 0);
      veil(i, true);
      episode.broken.add(i);
    }
    /* and the loose dots, in the letters' ink */
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.fillStyle = ink;
    ctx.beginPath();
    for (let k = 0; k < D; k++) {
      if (seated[k]) {
        prevX[k] = hx[k];
        prevY[k] = hy[k];
        continue;
      }
      const px = hx[k] + x[k];
      const py = hy[k] + y[k];
      ctx.moveTo(px + rr[k], py);
      ctx.arc(px, py, rr[k], 0, 6.2832);
      loose++;
      jump = Math.max(jump, Math.hypot(px - prevX[k], py - prevY[k]));
      prevX[k] = px;
      prevY[k] = py;
      peak = Math.max(peak, Math.hypot(x[k], y[k]) / fs);
    }
    ctx.fill();
    if (cv.style.visibility !== "visible") cv.style.visibility = "visible";
    episode.frames++;
    episode.maxLoose = Math.max(episode.maxLoose, loose);
    episode.maxJump = Math.max(episode.maxJump, jump);
  };

  const wake = () => {
    if (live || dead) return;
    live = true;
    last = 0;
    stir(step);
  };
  /* a print is the still name */
  const onPrint = () => {
    if (live) restAll();
  };
  addEventListener("beforeprint", onPrint);

  return {
    unmount() {
      dead = true;
      scope.removeEventListener("pointermove", onMove);
      h1.removeEventListener("pointerdown", onDown);
      h1.removeEventListener("click", onClick);
      removeEventListener("scroll", onScroll);
      removeEventListener("beforeprint", onPrint);
      live = false;
      unveilAll();
      cv.remove();
    },
    probe: () => ({
      live,
      ready,
      steps,
      driven,
      presses,
      peak: +peak.toFixed(4),
      dots: D,
      loose: looseN.reduce((a, b) => a + b, 0),
      rest:
        letters.every((l, i) => l.style.cssText === snap[i]) &&
        letters.every(
          (l) => !l.getAnimations().some((a) => !(a instanceof CSSAnimation))
        ),
      episode: {
        broken: [...episode.broken].sort((a, b) => a - b),
        maxLoose: episode.maxLoose,
        maxJump: +episode.maxJump.toFixed(2),
        frames: episode.frames,
      },
    }),
  };
}
