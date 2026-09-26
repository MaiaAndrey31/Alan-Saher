"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface StatementProps {
  lines: string[];
  accentIndex: number | null;
  backgroundUrl: string | null;
}

const DEFAULT_BACKGROUND = "/images/statement-bg.jpg";

/** Large typographic statement, revealed line-by-line as the section scrolls through view. */
export function Statement({ lines, accentIndex, backgroundUrl }: StatementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion || lines.length === 0) return;
      const lineEls = ref.current.querySelectorAll(".statement-line");

      gsap.fromTo(
        lineEls,
        { autoAlpha: 0.12 },
        {
          autoAlpha: 1,
          stagger: Math.min(0.3, 1.8 / lines.length),
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 75%",
            end: "bottom 55%",
            scrub: 0.6,
          },
        }
      );
    },
    { scope: ref, dependencies: [prefersReducedMotion, lines.length] }
  );

  if (lines.length === 0) return null;

  return (
    <section aria-label="Statement" className="relative flex min-h-[80svh] items-center overflow-hidden py-[var(--section-padding-y)]">
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src={backgroundUrl ?? DEFAULT_BACKGROUND}
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover object-[70%_center] md:object-right"
        />
        {/* Left-to-right fade keeps the headline legible over the artwork; top/bottom fades blend into the neighbouring sections. */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/10 md:via-bg/60 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg" />
      </div>
      <div ref={ref} className="container-edit relative z-10 w-full">
        <h2 className="font-display leading-[0.95] tracking-tight" style={{ fontSize: "var(--font-size-h1)" }}>
          {lines.map((line, i) => (
            <span key={i} className="statement-line block">
              <span className={i === accentIndex ? "text-accent" : "text-fg"}>{line}</span>
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
