"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, requestScrollRefresh } from "@/lib/gsap";
import type { MilestoneDto } from "@/lib/content/dto";
import { useMotionProfile } from "@/hooks/useMotionProfile";
import { useLocale } from "@/i18n/LocaleProvider";
import { scrollToY } from "@/lib/lenisStore";

interface StoryContentProps {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
}

const PLACEHOLDER = "/images/placeholder-story.png";
/** Scroll distance per chapter, as a fraction of the viewport height. */
const VH_PER_EVENT = 0.6;

/**
 * Desktop: a pinned chapter viewer. Scroll picks the active milestone; year,
 * photograph, title and copy hand over together (directional clip-path for
 * the image, mask reveals for the text, a giant ghost year behind). Every
 * milestone is rendered up front and only GSAP moves them — no React
 * re-render while scrolling.
 */
function StoryDesktop({ content, milestones }: { content: StoryContentProps; milestones: MilestoneDto[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const { tc, t } = useLocale();
  const count = milestones.length;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const images = q<HTMLElement>(".sty-img");
      const texts = q<HTMLElement>(".sty-text");
      const ghosts = q<HTMLElement>(".sty-ghost");
      const dots = q<HTMLElement>(".sty-dot");
      const linesOf = (i: number) => texts[i].querySelectorAll(".sty-l");

      gsap.set(images, { clipPath: "inset(100% 0% 0% 0%)", zIndex: 1 });
      gsap.set(images[0], { clipPath: "inset(0% 0% 0% 0%)", zIndex: 2 });
      texts.forEach((_, i) => gsap.set(linesOf(i), { yPercent: i === 0 ? 0 : 110, y: 0 }));
      gsap.set(ghosts, { autoAlpha: 0 });
      gsap.set(ghosts[0], { autoAlpha: 1 });

      let active = 0;
      let z = 2;
      const counter = q<HTMLElement>(".sty-count")[0];
      const setDots = (index: number) => {
        dots.forEach((dot, i) => dot.toggleAttribute("data-active", i === index));
        if (counter) counter.textContent = String(index + 1).padStart(2, "0");
      };
      setDots(0);

      const go = (next: number) => {
        if (next === active) return;
        const dir = next > active ? 1 : -1;
        const prev = active;
        active = next;
        z += 1;

        const nextImg = images[next];
        gsap.killTweensOf([nextImg, ...linesOf(next), ghosts[next]]);
        gsap.fromTo(
          nextImg,
          { clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", zIndex: z },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.inOut" }
        );
        gsap.fromTo(nextImg.querySelector(".sty-img-inner"), { scale: 1.22 }, { scale: 1, duration: 1.7, ease: "expo.out" });
        gsap.to(images[prev].querySelector(".sty-img-inner"), { scale: 1.06, duration: 1.1, ease: "power4.inOut" });

        gsap.to(linesOf(prev), { yPercent: -110 * dir, duration: 0.55, stagger: 0.03, ease: "power3.in", overwrite: true });
        gsap.fromTo(
          linesOf(next),
          { yPercent: 110 * dir, y: 0 },
          { yPercent: 0, duration: 1, stagger: 0.06, ease: "expo.out", delay: 0.3, overwrite: true }
        );

        gsap.to(ghosts[prev], { autoAlpha: 0, yPercent: -12 * dir, duration: 0.8, ease: "power2.inOut", overwrite: true });
        gsap.fromTo(ghosts[next], { autoAlpha: 0, yPercent: 12 * dir }, { autoAlpha: 1, yPercent: 0, duration: 1.2, ease: "power3.out", overwrite: true });

        setDots(next);
      };

      const setFill = gsap.quickSetter(q(".sty-fill")[0], "scaleX");

      triggerRef.current = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * count * VH_PER_EVENT}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const raw = self.progress * count;
          setFill(gsap.utils.clamp(0, 1, (raw - 0.5) / Math.max(1, count - 1)));
          go(Math.min(count - 1, Math.floor(raw)));
        },
      });

      requestScrollRefresh();
      return () => {
        triggerRef.current = null;
      };
    },
    { scope: sectionRef, dependencies: [count] }
  );

  const jumpTo = (index: number) => {
    const st = triggerRef.current;
    if (!st) return;
    scrollToY(st.start + ((index + 0.5) / count) * (st.end - st.start));
  };

  return (
    <section id="story" ref={sectionRef} aria-label={tc(content.eyebrow)} className="relative h-screen overflow-hidden bg-bg">
      {/* Giant ghost year */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[8vh] select-none">
        {milestones.map((m) => (
          <span
            key={m.id}
            className="sty-ghost absolute bottom-0 left-[var(--gutter)] whitespace-nowrap font-display leading-none tracking-tighter text-fg/[0.045]"
            style={{ fontSize: "clamp(10rem, 26vw, 30rem)" }}
          >
            {m.year.split(/[–-]/)[0]}
          </span>
        ))}
      </div>

      <div className="container-edit relative grid h-full grid-cols-12 items-center gap-8 pb-32 pt-28">
        <div className="col-span-5 flex h-full flex-col justify-between">
          <div>
            <span className="eyebrow">{tc(content.eyebrow)}</span>
            <h2 className="mt-4 font-display leading-[0.95] tracking-tight" style={{ fontSize: "var(--font-size-h3)" }}>
              {tc(content.headingLine1)} <span className="text-fg-muted">{tc(content.headingLine2)}</span>
            </h2>
          </div>

          <div className="relative min-h-[19rem]">
            {milestones.map((m, i) => (
              <article key={m.id} className="sty-text absolute inset-x-0 bottom-0">
                <span className="line-mask">
                  <span className="sty-l tabular font-display text-accent" style={{ fontSize: "var(--font-size-h2)" }}>
                    {m.year}
                  </span>
                </span>
                <h3 className="mt-3 font-display text-3xl uppercase leading-[1.05] tracking-tight xl:text-4xl">
                  <span className="line-mask">
                    <span className="sty-l">{tc(m.title)}</span>
                  </span>
                  {m.subtitle && (
                    <span className="line-mask">
                      <span className="sty-l text-fg-muted">{tc(m.subtitle)}</span>
                    </span>
                  )}
                </h3>
                <span className="line-mask mt-5">
                  <span className="sty-l max-w-md text-fg-muted" style={{ fontSize: "var(--font-size-body)" }}>
                    {tc(m.description)}
                  </span>
                </span>
                <span className="sr-only">
                  {t.storyProgress} {i + 1} / {count}
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="relative col-span-6 col-start-7 h-[64vh] overflow-hidden">
          {milestones.map((m, i) => (
            <div key={m.id} className="sty-img absolute inset-0 overflow-hidden">
              <div className="sty-img-inner absolute inset-0 will-change-transform">
                <Image
                  src={m.image ?? PLACEHOLDER}
                  alt={`${tc(m.title)} — ${m.year}`}
                  fill
                  sizes="50vw"
                  className="object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
            </div>
          ))}
          <span className="absolute right-4 top-4 z-[100] text-[10px] uppercase tracking-[0.3em] text-fg/70 mix-blend-difference">
            <span className="sty-count">01</span> / {String(count).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Chapter axis */}
      <div className="container-edit absolute inset-x-0 bottom-8">
        <div className="relative">
          <div className="absolute left-0 right-0 top-[5px] h-px bg-fg/10">
            <div className="sty-fill h-px origin-left scale-x-0 bg-accent" />
          </div>
          <ol className="relative flex justify-between">
            {milestones.map((m, i) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => jumpTo(i)}
                  className="sty-dot group flex min-h-11 flex-col items-start gap-3 text-[10px] uppercase tracking-[0.2em] text-fg-muted transition-colors duration-300 hover:text-fg data-[active]:text-fg"
                  aria-label={`${m.year} — ${tc(m.title)}`}
                >
                  <span className="block size-[11px] rounded-full border border-fg/30 bg-bg transition-[transform,background-color,border-color] duration-500 group-data-[active]:scale-110 group-data-[active]:border-accent group-data-[active]:bg-accent" />
                  <span className="tabular">{m.year}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * Touch / narrow screens: no pinning. A vertical timeline whose rail fills
 * as you scroll; each chapter rises in as it enters the viewport.
 */
function StoryMobile({ content, milestones, reduced }: { content: StoryContentProps; milestones: MilestoneDto[]; reduced: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { tc } = useLocale();

  useGSAP(
    () => {
      if (!ref.current || reduced) return;
      gsap.fromTo(
        ".stm-fill",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".stm-list", start: "top 70%", end: "bottom 70%", scrub: true } }
      );
      gsap.utils.toArray<HTMLElement>(".stm-item", ref.current).forEach((item) => {
        gsap.fromTo(
          item.querySelectorAll(".stm-rise"),
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: item, start: "top 82%", once: true } }
        );
        gsap.fromTo(
          item.querySelector(".stm-dot"),
          { backgroundColor: "rgb(5 5 5)", borderColor: "rgb(245 245 242 / 0.3)" },
          { backgroundColor: "#d9a94e", borderColor: "#d9a94e", duration: 0.4, scrollTrigger: { trigger: item, start: "top 70%", toggleActions: "play none none reverse" } }
        );
      });
    },
    { scope: ref, dependencies: [reduced, milestones.length], revertOnUpdate: true }
  );

  return (
    <section id="story" ref={ref} aria-label={tc(content.eyebrow)} className="relative py-[var(--section-padding-y)]">
      <div className="container-edit">
        <span className="eyebrow">{tc(content.eyebrow)}</span>
        <h2 className="mb-16 mt-4 font-display leading-[0.9] tracking-tight" style={{ fontSize: "var(--font-size-h2)" }}>
          {tc(content.headingLine1)} {tc(content.headingLine2)}
        </h2>

        <ol className="stm-list relative space-y-20 pl-8 md:pl-12">
          <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-2 w-px bg-fg/10">
            <span className={`stm-fill absolute inset-0 origin-top bg-accent ${reduced ? "" : "scale-y-0"}`} />
          </span>
          {milestones.map((m) => (
            <li key={m.id} className="stm-item relative">
              <span aria-hidden="true" className="stm-dot absolute -left-8 top-2 size-[11px] rounded-full border border-fg/30 bg-bg md:-left-12" />
              <span className="stm-rise tabular block font-display text-3xl text-accent">{m.year}</span>
              <h3 className="stm-rise mt-1 font-display text-xl uppercase tracking-tight">
                {tc(m.title)}
                {m.subtitle && <span className="block text-fg-muted">{tc(m.subtitle)}</span>}
              </h3>
              <p className="stm-rise mt-3 max-w-prose text-fg-muted" style={{ fontSize: "var(--font-size-body)" }}>
                {tc(m.description)}
              </p>
              <div className="stm-rise relative mt-6 aspect-[4/3] w-full overflow-hidden md:aspect-[16/9]">
                <Image
                  src={m.image ?? PLACEHOLDER}
                  alt={`${tc(m.title)} — ${m.year}`}
                  fill
                  sizes="(min-width: 768px) 90vw, 100vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
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

/** Cinematic chapter viewer on desktop; a calm vertical timeline on touch/small screens and for reduced motion. */
export function Story({ content, milestones }: StoryProps) {
  const { desktop, reduced } = useMotionProfile();

  if (milestones.length === 0) return null;
  if (!desktop || milestones.length < 3) {
    return <StoryMobile content={content} milestones={milestones} reduced={reduced} />;
  }
  return <StoryDesktop content={content} milestones={milestones} />;
}
