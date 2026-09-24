"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { MilestoneDto } from "@/lib/content/dto";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Reveal } from "@/components/Reveal";

interface StoryContentProps {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
}

function StoryDesktop({ content, milestones }: { content: StoryContentProps; milestones: MilestoneDto[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const getDistance = () => Math.max(0, track.scrollWidth - section.clientWidth);
      // Not enough content to justify pinning — let the panels sit inline.
      if (getDistance() < window.innerWidth * 0.25) return;

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) progressRef.current.style.width = `${self.progress * 100}%`;
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [milestones.length] }
  );

  return (
    <section id="story" ref={sectionRef} aria-label="The Story" className="relative h-screen overflow-hidden bg-bg">
      <div ref={trackRef} className="flex h-full w-max items-center">
        <div className="flex h-full w-[45vw] shrink-0 flex-col justify-center pl-[var(--gutter)] pr-12">
          <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">{content.eyebrow}</span>
          <h2 className="mt-4 font-display leading-[0.9] tracking-tight" style={{ fontSize: "var(--font-size-h2)" }}>
            {content.headingLine1}
            <br />
            {content.headingLine2}
          </h2>
        </div>

        {milestones.map((milestone) => (
          <article
            key={milestone.id}
            className="timeline-panel relative flex h-full w-[65vw] shrink-0 items-end overflow-hidden border-l border-border"
          >
            <Image
              src={milestone.image ?? "/images/placeholder-story.png"}
              alt={`${milestone.title} — ${milestone.year}`}
              fill
              sizes="65vw"
              className="object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
            <div className="relative z-10 p-12 md:p-16">
              <span className="font-display text-accent" style={{ fontSize: "var(--font-size-h2)" }}>
                {milestone.year}
              </span>
              <h3 className="mt-2 font-display text-2xl tracking-tight md:text-3xl">
                {milestone.title}
                {milestone.subtitle && <span className="block text-fg-muted">{milestone.subtitle}</span>}
              </h3>
              <p className="mt-4 max-w-md text-sm text-fg-muted">{milestone.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-border">
        <div ref={progressRef} className="h-px w-0 bg-accent" />
      </div>
    </section>
  );
}

function StoryMobile({ content, milestones }: { content: StoryContentProps; milestones: MilestoneDto[] }) {
  return (
    <section id="story" aria-label="The Story" className="relative py-[var(--section-padding-y)]">
      <div className="container-edit">
        <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">{content.eyebrow}</span>
        <h2 className="mt-4 mb-16 font-display leading-[0.9] tracking-tight" style={{ fontSize: "var(--font-size-h2)" }}>
          {content.headingLine1} {content.headingLine2}
        </h2>

        <ol className="space-y-16">
          {milestones.map((milestone) => (
            <li key={milestone.id}>
              <Reveal>
                <div className="relative mb-6 aspect-[4/5] w-full overflow-hidden rounded-sm">
                  <Image
                    src={milestone.image ?? "/images/placeholder-story.png"}
                    alt={`${milestone.title} — ${milestone.year}`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="font-display text-3xl text-accent">{milestone.year}</span>
                <h3 className="mt-1 font-display text-xl tracking-tight">
                  {milestone.title}
                  {milestone.subtitle && <span className="block text-fg-muted">{milestone.subtitle}</span>}
                </h3>
                <p className="mt-3 text-sm text-fg-muted">{milestone.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

interface StoryProps {
  content: StoryContentProps;
  milestones: MilestoneDto[];
}

/** Cinematic timeline: pinned horizontal scroll on desktop, a calmer vertical list on touch/small/short screens. */
export function Story({ content, milestones }: StoryProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const prefersReducedMotion = usePrefersReducedMotion();

  if (milestones.length === 0) return null;
  if (!isDesktop || prefersReducedMotion || milestones.length < 3) {
    return <StoryMobile content={content} milestones={milestones} />;
  }
  return <StoryDesktop content={content} milestones={milestones} />;
}
