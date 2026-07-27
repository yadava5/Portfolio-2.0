"use client";

/**
 * @fileoverview Plates & artifacts — tipped-in figures + the artifact viewer.
 *
 * DOSSIER-SPEC pt 4: every local visual is a tipped-in plate — thin ink
 * frame, paper mat, mono caption. Captions either terminate off-page or
 * are relabeled as descriptions (EVIDENCE-MODEL: a caption may never cite
 * the portfolio as its own source). External artifacts render as a mono
 * artifact index with bracketed type words — text links, never badges.
 *
 * Composition rules from the rejudge round (plate/dead-zone fixes):
 *   - an artifact with `panels` (the expo poster) renders as READABLE
 *     column-width CSS crops of the checked-in image — no derivative
 *     assets — spanning the full grid, caption + "open the full poster"
 *     seated in the fourth cell;
 *   - a lone (odd-last) plate widens across both columns with its
 *     caption moved into the previously-empty margin column.
 *
 * The viewer dialog is KEPT (same contracts: role=dialog labelled
 * "<label> artifact viewer", open-original link, close button, backdrop
 * testid, Escape) and gains a provenance strip: source · date · boundary.
 *
 * W1 thread-as-citation: every plate carries `id="fig-N"` so receipts
 * rows can cite it precisely (`#fig-N` links + CitationInk's hover
 * stroke). Scroll seating for those anchors lives in globals.css.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ArrowUpRight, ExternalLink, X } from "lucide-react";
import {
  CaseStudyArtifact,
  CaseStudyArtifactPanel,
} from "@/lib/data/projectCaseStudies";

interface ArtifactGalleryProps {
  artifacts: CaseStudyArtifact[];
  /** Figure number of the first plate (continues the page's fig count) */
  figStart: number;
}

function isExternalArtifact(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function isImageArtifact(href: string) {
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(href);
}

/**
 * One readable CSS crop of a plate image: the frame's aspect ratio is
 * the crop's, and the full image is scaled/offset inside it so exactly
 * the panel shows — the checked-in asset is the only file involved.
 */
function PanelCrop({
  artifact,
  panel,
}: {
  artifact: CaseStudyArtifact;
  panel: CaseStudyArtifactPanel;
}) {
  const source = artifact.sourceSize;
  if (!source) return null;
  return (
    <span className="plate-paper border-ink/40 group-hover:border-ink block border p-3 transition-colors sm:p-4">
      <span
        className="relative block w-full overflow-hidden"
        style={{ aspectRatio: `${panel.width} / ${panel.height}` }}
      >
        <Image
          src={artifact.href}
          alt=""
          width={source.width}
          height={source.height}
          unoptimized
          className="absolute max-w-none"
          style={{
            width: `${((source.width / panel.width) * 100).toFixed(4)}%`,
            height: "auto",
            left: `-${((panel.x / panel.width) * 100).toFixed(4)}%`,
            top: `-${((panel.y / panel.height) * 100).toFixed(4)}%`,
          }}
        />
      </span>
    </span>
  );
}

export function ArtifactGallery({ artifacts, figStart }: ArtifactGalleryProps) {
  const [activeArtifact, setActiveArtifact] =
    useState<CaseStudyArtifact | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const plates = artifacts.filter(
    (artifact) => !isExternalArtifact(artifact.href)
  );
  const indexRows = artifacts.filter((artifact) =>
    isExternalArtifact(artifact.href)
  );

  useEffect(() => {
    if (!activeArtifact) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveArtifact(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeArtifact]);

  const artifactViewer = activeArtifact
    ? createPortal(
        <div
          data-testid="artifact-viewer-backdrop"
          className="bg-ink/70 fixed inset-0 z-[1000] flex items-center justify-center p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveArtifact(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeArtifact.label} artifact viewer`}
            className="border-ink/40 bg-surface-1 text-ink flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden border"
          >
            <div className="border-ink/20 flex items-center justify-between gap-4 border-b px-4 py-3">
              <div className="min-w-0">
                <p className="label-mono text-ink-secondary">
                  {activeArtifact.type}
                </p>
                <h2 className="font-display mt-0.5 truncate text-sm md:text-base">
                  {activeArtifact.label}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={activeArtifact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open original artifact"
                  className="label-mono border-ink/40 text-ink hover:border-ink inline-flex h-10 items-center gap-2 border px-3 transition-colors"
                >
                  <ExternalLink size={15} aria-hidden="true" />
                  <span className="hidden sm:inline">open original</span>
                  <span className="sm:hidden">open</span>
                </a>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="border-ink/40 text-ink hover:border-ink inline-flex h-10 w-10 items-center justify-center border transition-colors focus:outline-none focus-visible:outline-2"
                  aria-label="Close artifact viewer"
                  onClick={() => setActiveArtifact(null)}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Provenance strip — date / source / boundary, always in
                frame. normal-case: sources carry case-sensitive names. */}
            <p className="label-mono text-ink-secondary border-ink/20 border-b px-4 py-2 normal-case">
              source: {activeArtifact.source} · date:{" "}
              {activeArtifact.date ?? "not recorded"} · boundary:{" "}
              {activeArtifact.boundary}
            </p>

            <div className="bg-surface-1 min-h-0 flex-1 p-3 md:p-5">
              {isImageArtifact(activeArtifact.href) ? (
                <div className="relative h-[68vh] w-full">
                  <Image
                    src={activeArtifact.href}
                    alt={`${activeArtifact.label} artifact`}
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="(min-width: 1024px) 80vw, 94vw"
                  />
                </div>
              ) : (
                <iframe
                  src={activeArtifact.href}
                  title={`${activeArtifact.label} artifact`}
                  className="border-ink/25 h-[68vh] w-full border bg-white"
                />
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {plates.length > 0 ? (
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
          {plates.map((artifact, index) => {
            const fig = figStart + index;
            const key = `${artifact.type}-${artifact.label}`;
            /* The poster: column-width readable panel crops spanning the
               full grid; the caption seats in the fourth cell. */
            if (artifact.panels && artifact.sourceSize) {
              return (
                <button
                  key={key}
                  id={`fig-${fig}`}
                  type="button"
                  className="group block text-left md:col-span-2"
                  onClick={() => setActiveArtifact(artifact)}
                >
                  <span className="grid gap-x-10 gap-y-8 md:grid-cols-2">
                    {artifact.panels.map((panel) => (
                      <span key={panel.label} className="block">
                        <PanelCrop artifact={artifact} panel={panel} />
                        <span className="label-mono text-ink-secondary mt-2 block">
                          {panel.label}
                        </span>
                      </span>
                    ))}
                    <span className="label-mono block md:self-end">
                      <span className="text-ink block">
                        fig. {fig} — {artifact.label}.
                      </span>
                      <span className="text-ink-secondary mt-1 block">
                        panels cropped at column width from the checked-in
                        capture — titles quoted from the poster.
                      </span>
                      <span className="text-ink-secondary mt-1 block">
                        description: {artifact.source} ·{" "}
                        {artifact.date ?? "date not recorded"}
                      </span>
                      <span className="link-draw text-ink mt-3 inline-block">
                        open the full poster ⟶
                      </span>
                    </span>
                  </span>
                </button>
              );
            }
            /* A lone (odd-last) plate widens across both columns; its
               caption moves into the margin column the pair grid left
               empty (the dead-zone fix). */
            const wide = plates.length % 2 === 1 && index === plates.length - 1;
            if (wide) {
              return (
                <button
                  key={key}
                  id={`fig-${fig}`}
                  type="button"
                  className="group block text-left md:col-span-2"
                  onClick={() => setActiveArtifact(artifact)}
                >
                  <span className="grid gap-x-10 gap-y-3 md:grid-cols-[minmax(0,1fr)_260px]">
                    <span className="plate-paper border-ink/40 group-hover:border-ink block border p-3 transition-colors sm:p-4">
                      <span className="relative block aspect-[4/3] w-full md:aspect-video">
                        <Image
                          src={artifact.href}
                          alt={`${artifact.label} plate`}
                          fill
                          unoptimized
                          className="object-contain"
                          sizes="(min-width: 768px) 70vw, 90vw"
                        />
                      </span>
                    </span>
                    <span className="label-mono block md:self-end">
                      <span className="text-ink block">
                        fig. {fig} — {artifact.label}.
                      </span>
                      <span className="text-ink-secondary mt-1 block">
                        description: {artifact.source} ·{" "}
                        {artifact.date ?? "date not recorded"} · open to inspect
                        ⟶
                      </span>
                    </span>
                  </span>
                </button>
              );
            }
            return (
              <button
                key={key}
                id={`fig-${fig}`}
                type="button"
                className="group block text-left"
                onClick={() => setActiveArtifact(artifact)}
              >
                <span className="plate-paper border-ink/40 group-hover:border-ink block border p-3 transition-colors sm:p-4">
                  <span className="relative block aspect-[4/3] w-full">
                    <Image
                      src={artifact.href}
                      alt={`${artifact.label} plate`}
                      fill
                      unoptimized
                      className="object-contain"
                      sizes="(min-width: 768px) 40vw, 90vw"
                    />
                  </span>
                </span>
                <span className="label-mono mt-3 block">
                  <span className="text-ink block">
                    fig. {fig} — {artifact.label}.
                  </span>
                  <span className="text-ink-secondary mt-1 block">
                    description: {artifact.source} ·{" "}
                    {artifact.date ?? "date not recorded"} · open to inspect ⟶
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {indexRows.length > 0 ? (
        <div className={plates.length > 0 ? "mt-10" : undefined}>
          <p className="label-mono text-ink-secondary">artifact index —</p>
          <ul className="mt-3">
            {indexRows.map((artifact) => (
              <li
                key={`${artifact.type}-${artifact.label}`}
                className="border-ink/15 label-mono flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t py-2.5"
              >
                <a
                  href={artifact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw text-ink inline-flex items-baseline gap-2"
                >
                  {artifact.label}
                  <ArrowUpRight
                    size={13}
                    aria-hidden="true"
                    className="self-center"
                  />
                </a>
                {/* N19 sweep (fix round 7) — THE ORPHANED FOLIO
                    (globals.css). `[type] · source` is the row's
                    provenance folio; the row is `flex-wrap` +
                    `justify-between`, so wherever the label and the
                    provenance could not share a line the provenance
                    printed flush LEFT under the label instead of flush
                    right. Measured on /projects/jobtracker/ at 360,
                    390, 430 and 640 — the whole phone band and the
                    small-tablet step. `folio-seat` moves nothing at
                    the widths that were already right. */}
                <span className="folio-seat text-ink-secondary normal-case">
                  [{artifact.type}] · {artifact.source}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {artifactViewer}
    </>
  );
}
