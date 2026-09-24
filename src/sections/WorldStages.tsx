"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { StageDto } from "@/lib/content/dto";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function StagePanel({ stage }: { stage: StageDto }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion) return;
      const image = ref.current.querySelector(".stage-image");
      const copy = ref.current.querySelectorAll(".stage-copy");

      gsap.fromTo(
        image,
        { clipPath: "inset(0 0 0 100%)" },
        {
          clipPath: "inset(0 0 0 0%)",
          duration: 1.4,
          ease: "power4.inOut",
          scrollTrigger: { trigger: ref.current, start: "top 70%", once: true, invalidateOnRefresh: true },
        }
      );
      gsap.fromTo(
        copy,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          delay: 0.5,
          ease: "expo.out",
          scrollTrigger: { trigger: ref.current, start: "top 70%", once: true, invalidateOnRefresh: true },
        }
      );
    },
    { scope: ref, dependencies: [prefersReducedMotion] }
  );

  return (
    <div ref={ref} className="relative flex h-[90vh] min-h-[520px] w-full items-end overflow-hidden">
      <div className="stage-image absolute inset-0">
        <Image
          src={stage.imageUrl ?? "/images/placeholder-stage.png"}
          alt={`${stage.title} — ${stage.location}`}
          fill
          sizes="100vw"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-bg/30" />
      </div>

      <div className="container-edit relative z-10 pb-16">
        <span className="stage-copy block font-display text-accent" style={{ fontSize: "var(--font-size-h1)" }}>
          {stage.year}
        </span>
        <h3 className="stage-copy font-display uppercase leading-[0.9] tracking-tight" style={{ fontSize: "var(--font-size-h2)" }}>
          {stage.title}
        </h3>
        <p className="stage-copy mt-4 text-sm uppercase tracking-[0.2em] text-fg-muted">{stage.location}</p>
      </div>
    </div>
  );
}

/** Scale over cards — each stage takes near-full viewport with a progressive wipe reveal. */
export function WorldStages({ stages }: { stages: StageDto[] }) {
  if (stages.length === 0) return null;

  return (
    <section aria-label="World Stages" className="relative">
      <div className="container-edit py-16">
        <h2 className="text-xs uppercase tracking-[0.3em] text-fg-muted">World Stages</h2>
      </div>
      <div className="flex flex-col gap-2">
        {stages.map((stage) => (
          <StagePanel key={stage.id} stage={stage} />
        ))}
      </div>
    </section>
  );
}
