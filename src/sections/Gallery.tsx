"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryDto } from "@/lib/content/dto";
import { Reveal } from "@/components/Reveal";
import { Lightbox } from "@/components/Lightbox";

export function Gallery({ items }: { items: GalleryDto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section id="gallery" aria-label="Gallery" className="relative py-[var(--section-padding-y)]">
      <div className="container-edit">
        <Reveal className="mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">Gallery</span>
          <h2 className="mt-4 font-display leading-[0.95] tracking-tight" style={{ fontSize: "var(--font-size-h2)" }}>
            Frames from the road.
          </h2>
        </Reveal>

        <div className="columns-2 gap-4 md:columns-3">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(i)}
              className="group relative mb-4 block w-full overflow-hidden break-inside-avoid"
              aria-label={`View ${item.alt}`}
              data-cursor="view"
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(min-width: 768px) 33vw, 50vw"
                className="w-full object-cover grayscale contrast-110 transition-[filter] duration-700 ease-out group-hover:grayscale-0"
                loading="lazy"
              />
              <span className="pointer-events-none absolute inset-0 bg-bg/0 transition-colors duration-500 group-hover:bg-bg/10" />
              <span className="pointer-events-none absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.25em] text-fg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <Lightbox
          items={items.map((item) => ({ src: item.src, alt: item.alt, caption: item.caption ?? undefined }))}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onIndexChange={setActiveIndex}
        />
      )}
    </section>
  );
}
