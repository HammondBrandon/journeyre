"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/cn";

interface PhotoGalleryProps {
  /** Full-resolution CDN URLs, ordered (preferred first, then by MediaOrder). */
  photos: string[];
  /** Thumbnail CDN URLs — parallel array to photos; falls back to full URL. */
  thumbnails?: string[];
}

const NO_PHOTO_PLACEHOLDER = (
  <div className="aspect-[16/10] bg-gradient-to-br from-surface to-border-light flex items-center justify-center">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="w-12 h-12 text-border"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  </div>
);

export default function PhotoGallery({ photos = [], thumbnails }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const count = photos.length;

  if (count === 0) return NO_PHOTO_PLACEHOLDER;

  const thumbUrls = thumbnails ?? photos;
  const thumbCount = Math.min(count, 6); // show up to 6 thumbnails

  const prev = () => setActiveIndex((i) => (i - 1 + count) % count);
  const next = () => setActiveIndex((i) => (i + 1) % count);

  const openLightbox = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  return (
    <>
      {/* Main image */}
      <div className="relative aspect-[16/10] bg-surface-alt overflow-hidden group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={activeIndex}
          src={photos[activeIndex]}
          alt={`Listing photo ${activeIndex + 1} of ${count}`}
          className="w-full h-full object-cover"
          loading="eager"
        />

        {/* Prev / Next arrows */}
        {count > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Zoom */}
        <button
          onClick={() => openLightbox(activeIndex)}
          className="absolute top-3 right-3 w-9 h-9 bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="View full size"
        >
          <ZoomIn size={15} />
        </button>

        {/* Counter */}
        {count > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/60 text-white font-raleway text-[10px] px-2 py-0.5">
            {activeIndex + 1} / {count}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {thumbCount > 1 && (
        <div className="grid grid-cols-6 gap-1.5 mt-1.5">
          {Array.from({ length: thumbCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "aspect-[4/3] overflow-hidden relative focus-visible:outline-2 focus-visible:outline-primary cursor-pointer",
                activeIndex === i && "ring-2 ring-primary ring-offset-1"
              )}
              aria-label={`View photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbUrls[i]}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* "+N more" overlay on last thumbnail */}
              {i === thumbCount - 1 && count > thumbCount && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-raleway font-bold text-white text-xs">
                    +{count - thumbCount}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close lightbox"
          >
            <X size={18} />
          </button>

          {/* Prev */}
          {count > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i - 1 + count) % count);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Full-size image */}
          <div
            className="max-w-5xl max-h-[85vh] w-full px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={lightboxIndex}
              src={photos[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1} of ${count}`}
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />
            <p className="text-center font-raleway text-xs text-white/60 mt-3">
              {lightboxIndex + 1} / {count}
            </p>
          </div>

          {/* Next */}
          {count > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i + 1) % count);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
