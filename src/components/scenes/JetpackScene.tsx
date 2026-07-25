/**
 * @fileoverview jetpack-compress — "split → parallel → stitch" (B5, A1+A11).
 *
 * The engine's architecture, drawn running: one input byte-stream splits
 * into blocks across virtual-thread lanes, every block compresses AT THE
 * SAME TIME (the slide-and-shrink tweens overlap on purpose — the
 * concurrency is the picture), and the lanes stitch back into ONE gzip
 * member — the seam takes the figure's single clay mark, and the member
 * carries its real magic bytes, 1f 8b (RFC 1952 notation, not a metric).
 * Block shrink is transform-only (scaleX on fill-only rects) and the
 * denser ink after the shrink is the compressed bytes — paint honesty,
 * no fake ratio: no measured compression ratio exists in the settled
 * data, so none is drawn.
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

/** Virtual-thread lane y-centers. */
const LANE_Y = [45, 95, 145, 195];

/** Block geometry: settled = compressed (scaleX 1 of the small rect). */
const BLOCK_W = 31.5;
const BLOCK_X = 258;
/** Where a block starts (uncompressed, at the lane head). */
const BLOCK_START_X = 164;
/** Uncompressed width ÷ compressed width (the drawn shrink, not a claim). */
const BLOCK_SCALE = 70 / BLOCK_W;

type GzipResult =
  | { kind: "ran"; inBytes: number; outBytes: number }
  | { kind: "unsupported" }
  | null;

const formatBytes = (n: number) => `${n.toLocaleString("en-US")} B`;

export function JetpackScene() {
  const [gzip, setGzip] = useState<GzipResult>(null);

  const rootRef = useSceneRun<HTMLDivElement>((tl, root) => {
    const q = gsap.utils.selector(root);
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
    gsap.set(blocks, {
      x: BLOCK_START_X - BLOCK_X,
      scaleX: BLOCK_SCALE,
      opacity: 0.28,
      transformOrigin: "left center",
    });
    gsap.set([...seam, ...header, ...label], { opacity: 0 });

    /* ── The run ─────────────────────────────────────────────────── */
    tl.to(input, { strokeDashoffset: 0, duration: 0.4, ease: "power1.inOut" })
      .to(splits, { strokeDashoffset: 0, duration: 0.3, stagger: 0.06 }, 0.35)
      .to(rails, { strokeDashoffset: 0, duration: 0.3, stagger: 0.06 }, 0.5)
      .to(label, { opacity: 1, duration: 0.35 }, 0.55)
      /* every block at once — the virtual threads working in parallel.
         x snaps to whole SVG units (1 unit = 1 CSS px at full width):
         four fill rects sliding through sub-pixel positions over the
         fine-dashed rails re-rasterized every frame as a moiré glitter;
         on the pixel grid the slide reads as solid ink moving. scaleX
         stays continuous — the shrink is one antialiased edge, and IS
         the compression picture. */
      .to(
        blocks,
        {
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
        { opacity: 0.55, scale: 0.5, svgOrigin: "378 118" },
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

  /** A11: real gzip, real bytes, this figure's own markup as the sample. */
  const runBrowserGzip = useCallback(async () => {
    const svg = rootRef.current?.querySelector("svg");
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
        className="block h-auto w-full max-w-[512px]"
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

      {/* A11 — the honest live press: your browser's own gzip, labeled.
          currentColor + opacity muting only (A4): this row can sit in
          near-dusk light, where day tokens would fail on the browns. */}
      <div className="mt-4">
        <button
          type="button"
          onClick={runBrowserGzip}
          className="link-draw label-mono cursor-pointer"
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
