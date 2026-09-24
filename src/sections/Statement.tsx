"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface StatementProps {
  lines: string[];
  accentIndex: number | null;
}

/** Large typographic statement, revealed line-by-line as the section scrolls through view. */
export function Statement({ lines, accentIndex }: StatementProps) {
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
    <section aria-label="Statement" className="relative py-[var(--section-padding-y)]">
      <div ref={ref} className="container-edit">
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
