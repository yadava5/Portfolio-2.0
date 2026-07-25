/**
 * @fileoverview jetpack-compress — "split → parallel → stitch" (B5, A1+A11).
 *
 * The engine's architecture, drawn running: one input byte-stream splits
 * into blocks across virtual-thread lanes, every block compresses AT THE
 * SAME TIME (the slide-and-shrink tweens overlap on purpose — the
 * concurrency is the picture), and the lanes stitch back into ONE gzip
 * member — the seam takes the figure's single clay mark, and the member
 * carries its real magic bytes, 1f 8b (RFC 1952 notation, not a metric).
 * Block shrink is transform-only (scale on fill-only rects) and the
 * denser ink after the shrink is the compressed bytes — paint honesty,
 * no fake ratio: no measured compression ratio exists in the settled
 * data, so none is drawn.
 *
 * TWO AUTHORED EDITIONS (CRITIC-LEDGER F66, phone half): the wide
 * 512-unit plate (unchanged) and a narrow 280-unit edition for columns
 * under 380px. The narrow edition recomposes, never shrinks: the four
 * virtual-thread lanes stand VERTICAL (blocks fall as they compress —
 * the same slide-and-shrink, axes swapped), and the lanes stitch into
 * the seam at the bottom. Same split, same parallel work, same one
 * member, same 1f 8b — drawn at the full 13px label voice. The drawn
 * shrink ratio is identical in both editions (BLOCK_SCALE), so neither
 * plate implies a different compression claim.
 *
 * A11, the honesty engine's dream: the one interactive press runs YOUR
 * browser's native CompressionStream('gzip') on this very figure's own
 * markup and prints the true byte counts, labeled computed-live — and
 * labeled NOT jetpack's JDK engine (browser gzip ≠ the JDK impl). Works
 * in every world (compute, not motion — the AuditRun precedent); if the
 * API is missing the line says so instead of faking a result.
 *
 * One-shot scroll-in run; the server markup is the settled frame
 * (stream split, blocks compressed, member stitched) in every static
 * world.
 */

"use client";

import { useCallback, useState } from "react";
import { useSceneRun } from "@/components/scenes/useSceneRun";
import { PROJECT_SCENE_MANIFEST } from "@/components/scenes/manifest";
import gsap from "gsap";

/** Virtual-thread lane y-centers — wide plate. */
const LANE_Y = [45, 95, 145, 195];

/** Block geometry: settled = compressed (scale 1 of the small rect). */
const BLOCK_W = 31.5;
const BLOCK_X = 258;
/** Where a block starts (uncompressed, at the lane head). */
const BLOCK_START_X = 164;
/** Uncompressed ÷ compressed (the drawn shrink, not a claim) — the one
 *  ratio BOTH editions draw. */
const BLOCK_SCALE = 70 / BLOCK_W;

/* ── Narrow edition geometry (vertical lanes, seam at the bottom) ──── */
/** Virtual-thread lane x-centers — narrow edition. */
const LANE_X_M = [40, 100, 160, 220];
/** Compressed block: 10 wide, 24 tall, resting near the lane foot. */
const BLOCK_H_M = 24;
const BLOCK_Y_M = 164;
/** Where a block starts (uncompressed, at the lane head). */
const BLOCK_START_Y_M = 68;
/** The stitch seam's center — the narrow plate's one clay mark. */
const SEAM_M = { x: 150, y: 222 };

type GzipResult =
  | { kind: "ran"; inBytes: number; outBytes: number }
  | { kind: "unsupported" }
  | null;

const formatBytes = (n: number) => `${n.toLocaleString("en-US")} B`;

export function JetpackScene() {
  const [gzip, setGzip] = useState<GzipResult>(null);

  const rootRef = useSceneRun<HTMLDivElement>((tl, root) => {
    /* Choreograph the edition the container query shows. */
    const plates = Array.from(
      root.querySelectorAll<SVGSVGElement>("[data-sc-plate]")
    );
    const plate =
      plates.find((p) => p.getBoundingClientRect().width > 0) ?? plates[0];
    const narrow = plate.dataset.scPlate === "narrow";
    const q = gsap.utils.selector(plate);
    const input = q<SVGPathElement>("[data-sc-input]");
    const splits = q<SVGPathElement>("[data-sc-split]");
    const rails = q<SVGPathElement>("[data-sc-vrail]");
    const blocks = q<SVGRectElement>("[data-sc-block]");
    const merges = q<SVGPathElement>("[data-sc-merge]");
    const seam = q<SVGRectElement>("[data-sc-seam]");
    const pulse = q<SVGCircleElement>("[data-sc-pulse]");
    const output = q<SVGPathElement>("[data-sc-output]");
    const header = q<SVGTextElement>("[data-sc-header], [data-sc-member]");
    const label = q<SVGTextElement>("[data-sc-vt-label]");

    /* ── Start frame: nothing split, blocks whole at the lane heads ── */
    gsap.set([...input, ...splits, ...rails, ...merges, ...output], {
      strokeDashoffset: 1.5,
    });
    if (narrow) {
      gsap.set(blocks, {
        y: BLOCK_START_Y_M - BLOCK_Y_M,
        scaleY: BLOCK_SCALE,
        opacity: 0.28,
        transformOrigin: "center top",
      });
    } else {
      gsap.set(blocks, {
        x: BLOCK_START_X - BLOCK_X,
        scaleX: BLOCK_SCALE,
        opacity: 0.28,
        transformOrigin: "left center",
      });
    }
    gsap.set([...seam, ...header, ...label], { opacity: 0 });

    /* ── The run ─────────────────────────────────────────────────── */
    tl.to(input, { strokeDashoffset: 0, duration: 0.4, ease: "power1.inOut" })
      .to(splits, { strokeDashoffset: 0, duration: 0.3, stagger: 0.06 }, 0.35)
      .to(rails, { strokeDashoffset: 0, duration: 0.3, stagger: 0.06 }, 0.5)
      .to(label, { opacity: 1, duration: 0.35 }, 0.55)
      /* every block at once — the virtual threads working in parallel.
         The travel axis snaps to whole SVG units (1 unit = 1 CSS px at
         full width): four fill rects sliding through sub-pixel
         positions over the fine-dashed rails re-rasterized every frame
         as a moiré glitter; on the pixel grid the slide reads as solid
         ink moving. The scale stays continuous — the shrink is one
         antialiased edge, and IS the compression picture. The narrow
         edition runs the same beat with the axes swapped: blocks FALL
         their lanes as they compress. */
      .to(
        blocks,
        narrow
          ? {
              y: 0,
              scaleY: 1,
              opacity: 0.55,
              duration: 0.55,
              stagger: 0.06,
              ease: "power2.inOut",
              snap: { y: 1 },
            }
          : {
              x: 0,
              scaleX: 1,
              opacity: 0.55,
              duration: 0.55,
              stagger: 0.06,
              ease: "power2.inOut",
              snap: { x: 1 },
            },
        0.85
      )
      .to(merges, { strokeDashoffset: 0, duration: 0.3, stagger: 0.06 }, 1.35)
      /* the stitch seam: the figure's one clay moment */
      .to(seam, { opacity: 1, duration: 0.2 }, 1.65)
      .fromTo(
        pulse,
        {
          opacity: 0.55,
          scale: 0.5,
          svgOrigin: narrow ? `${SEAM_M.x} ${SEAM_M.y}` : "378 118",
        },
        {
          opacity: 0,
          scale: 1.9,
          duration: 0.55,
          ease: "power2.out",
          immediateRender: false,
        },
        1.65
      )
      .to(output, { strokeDashoffset: 0, duration: 0.4 }, 1.75)
      .to(header, { opacity: 1, duration: 0.4 }, 1.9);
  });

  /** A11: real gzip, real bytes, the VISIBLE plate's markup as the
   *  sample — the figure you see is the figure that gets compressed. */
  const runBrowserGzip = useCallback(async () => {
    const svg =
      Array.from(
        rootRef.current?.querySelectorAll<SVGSVGElement>("svg") ?? []
      ).find((p) => p.getBoundingClientRect().width > 0) ??
      rootRef.current?.querySelector("svg");
    if (!svg) return;
    const sample = new TextEncoder().encode(svg.outerHTML);
    if (typeof CompressionStream === "undefined") {
      setGzip({ kind: "unsupported" });
      return;
    }
    const stream = new Blob([sample])
      .stream()
      .pipeThrough(new CompressionStream("gzip"));
    const compressed = await new Response(stream).arrayBuffer();
    setGzip({
      kind: "ran",
      inBytes: sample.byteLength,
      outBytes: compressed.byteLength,
    });
  }, [rootRef]);

  return (
    <div ref={rootRef} className="scene-fig" data-scene-jetpack>
      <svg
        role="img"
        aria-label={PROJECT_SCENE_MANIFEST["jetpack-compress"].alt}
        viewBox="0 0 512 240"
        data-sc-plate="wide"
        className="scene-plate-wide block h-auto w-full max-w-[512px]"
      >
        {/* the input stream */}
        <text x="12" y="102" className="sc-quiet">
          input
        </text>
        <path
          data-sc-input
          className="scene-edge scene-edge-heavy"
          d="M 12 118 H 100"
          pathLength={1}
        />

        {/* the split into virtual-thread lanes */}
        <text data-sc-vt-label x="164" y="26" className="sc-quiet">
          virtual threads
        </text>
        {LANE_Y.map((y) => (
          <path
            key={y}
            data-sc-split
            className="scene-edge"
            d={`M 100 118 C 128 118, 136 ${y}, 164 ${y}`}
            pathLength={1}
          />
        ))}
        {LANE_Y.map((y) => (
          <path
            key={y}
            data-sc-vrail
            className="scene-rail"
            d={`M 164 ${y} H 324`}
            pathLength={1}
          />
        ))}

        {/* one block per lane — compressed at rest (denser ink) */}
        {LANE_Y.map((y) => (
          <rect
            key={y}
            data-sc-block
            className="scene-block"
            x={BLOCK_X}
            y={y - 5}
            width={BLOCK_W}
            height="10"
          />
        ))}

        {/* the stitch back into one member */}
        {LANE_Y.map((y) => (
          <path
            key={y}
            data-sc-merge
            className="scene-edge"
            d={`M 324 ${y} C 350 ${y}, 354 118, 378 118`}
            pathLength={1}
          />
        ))}

        {/* the seam — the one clay mark — and the member's real magic */}
        <rect
          data-sc-seam
          className="scene-gate"
          x="374"
          y="114"
          width="8"
          height="8"
        />
        <circle data-sc-pulse className="scene-pulse" cx="378" cy="118" r="7" />
        <text data-sc-header x="392" y="104" className="sc-quiet">
          1f 8b
        </text>
        <path
          data-sc-output
          className="scene-edge scene-edge-heavy"
          d="M 382 118 H 500"
          pathLength={1}
        />
        {/* Right-anchored on the output rail's terminus (x=500) instead
            of left-anchored at x=392: measured on the live export, the
            left-anchored label ran to x≈515 — three units PAST the
            512-unit viewBox, where the outer <svg> clips it, at every
            viewport. The figure voice moving 12.5px → 13px (the label
            token) would have widened the clip to eight units. Hanging
            the caption off the end of the rail it describes keeps it
            inside the plate and ties it to its own drawing. */}
        <text
          data-sc-member
          x="500"
          y="140"
          textAnchor="end"
          className="sc-quiet"
        >
          one gzip member
        </text>
      </svg>

      {/* ── the narrow edition: the same engine, stood upright ──
          Input splits at the top, the four virtual threads fall as
          vertical lanes (blocks compress on the way down), and the
          lanes stitch into the one member at the foot — seam, 1f 8b
          and the member label all kept, at the full 13px voice. */}
      <svg
        role="img"
        aria-label={PROJECT_SCENE_MANIFEST["jetpack-compress"].alt}
        viewBox="0 0 280 256"
        data-sc-plate="narrow"
        className="scene-plate-narrow h-auto w-full max-w-[280px]"
      >
        {/* the input stream */}
        <text x="10" y="14" className="sc-quiet">
          input
        </text>
        <path
          data-sc-input
          className="scene-edge scene-edge-heavy"
          d="M 10 26 H 80"
          pathLength={1}
        />

        {/* the split into virtual-thread lanes */}
        <text
          data-sc-vt-label
          x="270"
          y="14"
          textAnchor="end"
          className="sc-quiet"
        >
          virtual threads
        </text>
        {LANE_X_M.map((x) => (
          <path
            key={x}
            data-sc-split
            className="scene-edge"
            d={`M 80 26 C 80 46, ${x} 46, ${x} 64`}
            pathLength={1}
          />
        ))}
        {LANE_X_M.map((x) => (
          <path
            key={x}
            data-sc-vrail
            className="scene-rail"
            d={`M ${x} 64 V 194`}
            pathLength={1}
          />
        ))}

        {/* one block per lane — compressed at rest (denser ink) */}
        {LANE_X_M.map((x) => (
          <rect
            key={x}
            data-sc-block
            className="scene-block"
            x={x - 5}
            y={BLOCK_Y_M}
            width="10"
            height={BLOCK_H_M}
          />
        ))}

        {/* the stitch back into one member */}
        {LANE_X_M.map((x) => (
          <path
            key={x}
            data-sc-merge
            className="scene-edge"
            d={`M ${x} 194 C ${x} 208, ${SEAM_M.x} 208, ${SEAM_M.x} ${SEAM_M.y}`}
            pathLength={1}
          />
        ))}

        {/* the seam — the one clay mark — and the member's real magic */}
        <rect
          data-sc-seam
          className="scene-gate"
          x={SEAM_M.x - 4}
          y={SEAM_M.y - 4}
          width="8"
          height="8"
        />
        <circle
          data-sc-pulse
          className="scene-pulse"
          cx={SEAM_M.x}
          cy={SEAM_M.y}
          r="7"
        />
        <text
          data-sc-header
          x="270"
          y="210"
          textAnchor="end"
          className="sc-quiet"
        >
          1f 8b
        </text>
        <path
          data-sc-output
          className="scene-edge scene-edge-heavy"
          d={`M ${SEAM_M.x + 4} ${SEAM_M.y} H 270`}
          pathLength={1}
        />
        <text
          data-sc-member
          x="270"
          y="246"
          textAnchor="end"
          className="sc-quiet"
        >
          one gzip member
        </text>
      </svg>

      {/* A11 — the honest live press: your browser's own gzip, labeled.
          currentColor + opacity muting only (A4): this row can sit in
          near-dusk light, where day tokens would fail on the browns.
          Below sm the press wears a 44px hit area (WCAG 2.5.8 / the
          F66 tap-target floor) without moving the desktop line. */}
      <div className="mt-4">
        <button
          type="button"
          onClick={runBrowserGzip}
          className="link-draw label-mono cursor-pointer max-sm:inline-flex max-sm:min-h-11 max-sm:items-center"
        >
          gzip this figure in your browser ⟶
        </button>
        <p
          role="status"
          className="label-mono mt-1.5 min-h-[1.25rem] normal-case opacity-70"
        >
          {gzip?.kind === "ran"
            ? `sample ${formatBytes(gzip.inBytes)} → ${formatBytes(
                gzip.outBytes
              )} — computed live by your browser's CompressionStream · browser gzip, not jetpack's JDK engine`
            : gzip?.kind === "unsupported"
              ? "compressionstream is unavailable in this browser — nothing to show, nothing faked"
              : ""}
        </p>
      </div>
    </div>
  );
}
