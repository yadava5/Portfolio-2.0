"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ArrowUpRight, ExternalLink, X } from "lucide-react";
import { CaseStudyArtifact } from "@/lib/data/projectCaseStudies";

interface ArtifactGalleryProps {
  artifacts: CaseStudyArtifact[];
}

function isExternalArtifact(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function isImageArtifact(href: string) {
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(href);
}

function ArtifactLabel({ artifact }: { artifact: CaseStudyArtifact }) {
  return (
    <>
      <span className="block text-xs tracking-[0.2em] text-zinc-500 uppercase">
        {artifact.type}
      </span>
      <span className="mt-2 inline-flex items-center gap-2 text-left">
        {artifact.label}
        <ArrowUpRight size={14} aria-hidden="true" />
      </span>
    </>
  );
}

export function ArtifactGallery({ artifacts }: ArtifactGalleryProps) {
  const [activeArtifact, setActiveArtifact] =
    useState<CaseStudyArtifact | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
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
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded border border-zinc-700 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs tracking-[0.2em] text-sky-300 uppercase">
                  {activeArtifact.type}
                </p>
                <h2 className="mt-1 truncate text-sm font-semibold text-zinc-100 md:text-base">
                  {activeArtifact.label}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={activeArtifact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open original artifact"
                  className="inline-flex h-10 items-center gap-2 rounded border border-zinc-700 px-3 text-sm font-semibold text-zinc-200 transition hover:border-sky-400 hover:text-zinc-50"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">Open original</span>
                  <span className="sm:hidden">Open</span>
                </a>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded border border-zinc-700 text-zinc-200 transition hover:border-sky-400 hover:text-zinc-50 focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:outline-none"
                  aria-label="Close artifact viewer"
                  onClick={() => setActiveArtifact(null)}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 bg-zinc-950 p-3 md:p-5">
              {isImageArtifact(activeArtifact.href) ? (
                <div className="relative h-[72vh] w-full">
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
                  className="h-[72vh] w-full rounded border border-zinc-800 bg-white"
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
      <div className="grid gap-3 md:grid-cols-3">
        {artifacts.map((artifact) => {
          const className =
            "rounded border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-300 transition hover:border-sky-400/50 hover:text-zinc-100";

          if (isExternalArtifact(artifact.href)) {
            return (
              <a
                key={`${artifact.type}-${artifact.label}`}
                href={artifact.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                <ArtifactLabel artifact={artifact} />
              </a>
            );
          }

          return (
            <button
              key={`${artifact.type}-${artifact.label}`}
              type="button"
              className={`${className} text-left`}
              onClick={() => setActiveArtifact(artifact)}
            >
              <ArtifactLabel artifact={artifact} />
            </button>
          );
        })}
      </div>

      {artifactViewer}
    </>
  );
}
