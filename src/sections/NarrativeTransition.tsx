"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface NarrativeTransitionProps {
  lines: string[];
  finalWord: string;
  backgroundUrl: string | null;
  vhPerLine: number;
}

/**
 * The site's most memorable cinematic beat: a long pinned (sticky) scroll
 * where a handful of lines crossfade over a slow Ken Burns zoom, resolving
 * into the artist's name. One scroll-scrubbed GSAP timeline drives
 * everything, so motion always matches scroll position exactly — no
 * autoplay, no independent RAF loop. Section height is derived from
 * `lines.length` (never hardcoded) so pacing stays correct regardless of
 * how many lines are configured.
 */
export function NarrativeTransition({ lines, finalWord, backgroundUrl, vhPerLine }: NarrativeTransitionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!sectionRef.current || prefersReducedMotion || lines.length === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      tl.to(bgRef.current, { scale: 1.18, ease: "none" }, 0);

      lines.forEach((_, i) => {
        tl.to(`.transition-line-${i}`, { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, i + 0.1).to(
          `.transition-line-${i}`,
          { autoAlpha: 0, duration: 0.35, ease: "power2.in" },
          i + 0.75
        );
      });

      tl.fromTo(
        finalRef.current,
        { autoAlpha: 0, scale: 0.85 },
        { autoAlpha: 1, scale: 1, duration: 1, ease: "expo.out" },
        lines.length + 0.1
      );
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion, lines.length] }
  );

  if (lines.length === 0) return null;

  if (prefersReducedMotion) {
    return (
      <section aria-label="From stage to stage" className="relative bg-bg py-[var(--section-padding-y)] text-center">
        <div className="container-edit space-y-6">
          {lines.map((line, i) => (
            <p key={i} className="font-display text-2xl tracking-tight md:text-4xl">
              {line}
            </p>
          ))}
          <p className="font-display text-accent" style={{ fontSize: "var(--font-size-h1)" }}>
            {finalWord}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-label="From stage to stage"
      className="relative"
      style={{ height: `${(lines.length + 1) * vhPerLine}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div ref={bgRef} className="absolute inset-0 scale-100">
          <Image
            src={backgroundUrl ?? "/images/placeholder-transition.png"}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-bg/70" />
          <div className="grain-overlay" />
        </div>

        <div className="relative z-10 px-6 text-center">
          {lines.map((line, i) => (
            <p
              key={i}
              className={`transition-line-${i} absolute inset-0 flex items-center justify-center font-display leading-tight tracking-tight opacity-0`}
              style={{ fontSize: "var(--font-size-h1)" }}
            >
              {line}
            </p>
          ))}
          <div ref={finalRef} className="opacity-0">
            <p className="font-display uppercase tracking-tight text-accent" style={{ fontSize: "var(--font-size-display)" }}>
              {finalWord}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
