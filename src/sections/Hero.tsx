"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import type { HeroDto, SiteDto } from "@/lib/content/dto";
import { useAppReady } from "@/hooks/useAppReady";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useInView } from "@/hooks/useInView";
import { MagneticButton } from "@/components/MagneticButton";
import { scrollToSection } from "@/lib/lenisStore";
import { track } from "@/lib/analytics";
import { youTubeBackgroundEmbedUrl } from "@/lib/youtube";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

const PLACEHOLDER = "/images/placeholder-hero.png";

interface HeroProps {
  hero: HeroDto;
  site: SiteDto;
}

export function Hero({ hero, site }: HeroProps) {
  const { isReady } = useAppReady();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0 });
  const hasPlayedRef = useRef(false);

  const [isYouTubeVisible, setIsYouTubeVisible] = useState(false);

  const backgroundUrl = hero.backgroundUrl ?? PLACEHOLDER;
  // Reduced-motion visitors get the still image only. YouTube wins over an
  // uploaded MP4 (the admin only ever saves one of them anyway).
  const youtubeId = prefersReducedMotion ? null : hero.youtubeId;
  const videoUrl = prefersReducedMotion || youtubeId ? null : hero.videoUrl;
  const hasVideoBackground = Boolean(youtubeId || videoUrl);
  // The WebGL canvas paints the still image over everything — never with a video.
  const enableWebGL = hero.enableWebgl && isDesktop && !prefersReducedMotion && !hasVideoBackground;
  const headlineLines = hero.headlineLines.length > 0 ? hero.headlineLines : [site.artistName];
  const eyebrow = hero.eyebrow ?? site.roles.join(" · ");

  // Same-origin, optimized (avoids a cross-origin WebGL texture fetch, which
  // would fail CORS/taint the canvas once backgroundUrl is a Supabase URL —
  // and it doubles as free downscaling of the source the shader samples).
  const textureSrc = backgroundUrl.startsWith("/")
    ? backgroundUrl
    : `/_next/image?url=${encodeURIComponent(backgroundUrl)}&w=1920&q=75`;

  useGSAP(
    () => {
      if (!isReady || hasPlayedRef.current || !sectionRef.current) return;
      hasPlayedRef.current = true;

      // .hero-frame holds the real LCP <Image> — it must stay visible (opacity)
      // from first paint; only its scale animates, so the image never gets
      // hidden behind the preloader and re-revealed (that would delay LCP).
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(".hero-frame", { scale: 1.12 }, { scale: 1, duration: 1.6 })
        .fromTo(".hero-line", { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.08 }, "-=1.1")
        .fromTo(".hero-sub", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.5")
        .fromTo(".hero-cta", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, "-=0.4")
        .fromTo(".hero-scroll-cue", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, "-=0.2");
    },
    { scope: sectionRef, dependencies: [isReady] }
  );

  useEffect(() => {
    if (prefersReducedMotion && sectionRef.current) {
      gsap.set(".hero-frame, .hero-line, .hero-sub, .hero-cta, .hero-scroll-cue", { autoAlpha: 1, yPercent: 0, y: 0, scale: 1 });
    }
  }, [prefersReducedMotion, sectionRef]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-bg"
    >
      <div className="absolute inset-0">
        <div className="hero-frame absolute inset-0">
          <Image
            src={backgroundUrl}
            alt={`${site.artistName} performing on stage`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {videoUrl && (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              poster={hero.posterUrl ?? backgroundUrl}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
          {/* Mounted only after the preloader so the embed never competes with
              the LCP image; stays invisible until YouTube's own loading UI is gone. */}
          {youtubeId && isReady && (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000 [container-type:size] ${
                isYouTubeVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <iframe
                src={youTubeBackgroundEmbedUrl(youtubeId)}
                title="Background video"
                tabIndex={-1}
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => window.setTimeout(() => setIsYouTubeVisible(true), 1200)}
                className="absolute left-1/2 top-1/2 h-[max(100cqh,56.25cqw)] w-[max(100cqw,177.78cqh)] -translate-x-1/2 -translate-y-1/2 scale-[1.15] border-0"
              />
            </div>
          )}
          {enableWebGL && <HeroCanvas imageSrc={textureSrc} active={isInView} />}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-bg/50" />
          <div className="grain-overlay" />
        </div>
      </div>

      <div className="container-edit relative z-10 w-full pb-16 md:pb-24">
        <p className="hero-sub mb-4 text-xs uppercase tracking-[0.3em] text-fg-muted">{eyebrow}</p>

        <h1 className="font-display leading-[0.85] tracking-tight" style={{ fontSize: "var(--font-size-display)" }}>
          {headlineLines.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <span className="hero-line block">{line}</span>
            </span>
          ))}
        </h1>

        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <MagneticButton className="hero-cta" cursorVariant="view">
            <button
              onClick={() => scrollToSection(hero.primaryCtaTarget)}
              className="group flex items-center gap-2 text-xs uppercase tracking-[0.25em]"
            >
              {hero.primaryCtaLabel}
              <span className="h-px w-8 bg-fg/60 transition-all duration-300 group-hover:w-12 group-hover:bg-accent" />
            </button>
          </MagneticButton>
          <MagneticButton className="hero-cta" cursorVariant="view">
            <button
              onClick={() => {
                track("hero_booking_click");
                scrollToSection(hero.secondaryCtaTarget);
              }}
              className="group flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent"
            >
              {hero.secondaryCtaLabel}
              <span className="h-px w-8 bg-accent/60 transition-all duration-300 group-hover:w-12" />
            </button>
          </MagneticButton>
        </div>
      </div>

      <div className="hero-scroll-cue absolute bottom-8 right-[var(--gutter)] z-10 hidden items-center gap-3 md:flex">
        <span className="text-[10px] uppercase tracking-[0.3em] text-fg-muted">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-fg-muted/50" />
      </div>
    </section>
  );
}
