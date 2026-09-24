"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { FrameDto } from "@/lib/content/dto";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Reveal } from "@/components/Reveal";

// Tailwind v4 generates CSS by scanning source files — a class string read
// from the database would produce no CSS at all, so the CMS only ever picks
// an enum (FrameDto.layout) and this is the single place that maps it to a
// real, statically-written Tailwind class. Never read `layout` into a
// template-literal class name.
const LAYOUT: Record<FrameDto["layout"], string> = {
  WIDE: "col-span-12 md:col-span-7 aspect-[16/10]",
  TALL: "col-span-12 md:col-span-5 aspect-[3/4]",
};

const FALLBACK_BY_SLOT: Record<number, string> = {
  1: "/images/placeholder-experience-1.png",
  2: "/images/placeholder-experience-2.png",
  3: "/images/placeholder-experience-3.png",
  4: "/images/placeholder-experience-4.png",
};

function ParallaxFrame({ frame }: { frame: FrameDto }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion) return;

      gsap.fromTo(
        ref.current,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        }
      );
    },
    { scope: ref, dependencies: [prefersReducedMotion] }
  );

  return (
    <div className={LAYOUT[frame.layout]} style={{ marginTop: isDesktop ? frame.offsetPx : 0 }}>
      <div ref={ref} className="relative aspect-[inherit] w-full overflow-hidden">
        <Image
          src={frame.mediaUrl ?? FALLBACK_BY_SLOT[frame.slot] ?? "/images/placeholder-experience-1.png"}
          alt={frame.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}

interface ExperienceProps {
  eyebrow: string;
  heading: string;
  frames: FrameDto[];
}

/** Energy of the live show — editorial asymmetric grid, each frame with its own motion. */
export function Experience({ eyebrow, heading, frames }: ExperienceProps) {
  if (frames.length < 2) return null;

  return (
    <section aria-label="The Experience" className="relative py-[var(--section-padding-y)]">
      <div className="container-edit">
        <Reveal className="mb-16 max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">{eyebrow}</span>
          <h2 className="mt-4 font-display leading-[0.95] tracking-tight" style={{ fontSize: "var(--font-size-h2)" }}>
            {heading}
          </h2>
        </Reveal>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {frames.map((frame) => (
            <ParallaxFrame key={frame.slot} frame={frame} />
          ))}
        </div>
      </div>
    </section>
  );
}
