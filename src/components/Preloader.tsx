"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useAppReady } from "@/hooks/useAppReady";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const SESSION_KEY = "as-preloader-seen";

// sessionStorage never changes from outside this tab during the component's
// life, so there's nothing to subscribe to — this just gives us a
// hydration-safe one-time client read (server snapshot = "first visit").
const noopSubscribe = () => () => {};

/**
 * Fullscreen intro. First visit in a session: monogram + a thin progress
 * line synced to fonts/document readiness (capped so it never hangs, and
 * capped short overall — this covers the Hero's real LCP image underneath,
 * so it must never run long enough to become the LCP bottleneck itself).
 * Return visits within the same session get a fast, reduced version.
 */
export function Preloader() {
  const { setReady } = useAppReady();
  const prefersReducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);
  const isReturningVisit = useSyncExternalStore(
    noopSubscribe,
    () => sessionStorage.getItem(SESSION_KEY) === "1",
    () => false
  );

  useGSAP(
    () => {
      if (!rootRef.current) return;

      const finish = () => {
        sessionStorage.setItem(SESSION_KEY, "1");
        document.documentElement.style.overflow = "";
        setReady();
        setIsDone(true);
      };

      document.documentElement.style.overflow = "hidden";

      if (prefersReducedMotion) {
        const tl = gsap.timeline({ onComplete: finish });
        tl.to(rootRef.current, { autoAlpha: 0, duration: 0.3, delay: 0.1 });
        return;
      }

      if (isReturningVisit) {
        const tl = gsap.timeline({ onComplete: finish });
        tl.to(rootRef.current, { yPercent: -100, duration: 0.5, ease: "power4.inOut", delay: 0.1 });
        return;
      }

      const fontsReady =
        typeof document !== "undefined" && "fonts" in document ? document.fonts.ready : Promise.resolve();
      const safetyTimeout = new Promise((resolve) => setTimeout(resolve, 1200));

      const progress = { value: 0 };
      const setWidth = () => {
        if (progressRef.current) progressRef.current.style.width = `${progress.value}%`;
      };

      const tl = gsap.timeline();
      tl.to(progress, { value: 85, duration: 0.9, ease: "power2.out", onUpdate: setWidth });

      Promise.race([fontsReady, safetyTimeout]).then(() => {
        gsap.to(progress, {
          value: 100,
          duration: 0.25,
          ease: "power1.out",
          onUpdate: setWidth,
          onComplete: () => {
            const exitTl = gsap.timeline({ onComplete: finish, delay: 0.15 });
            exitTl
              .to(".preloader-monogram", { autoAlpha: 0, y: -16, duration: 0.35, ease: "power3.in" })
              .to(rootRef.current, { yPercent: -100, duration: 0.6, ease: "power4.inOut" }, "-=0.1");
          },
        });
      });
    },
    { scope: rootRef, dependencies: [isReturningVisit, prefersReducedMotion] }
  );

  if (isDone) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[var(--z-preloader)] flex flex-col items-center justify-center bg-bg text-fg"
      role="status"
      aria-label="Loading"
    >
      <div className="preloader-monogram flex flex-col items-center gap-5">
        <span className="font-display text-[clamp(3rem,10vw,7rem)] leading-none tracking-tight">AS</span>
        {!isReturningVisit && !prefersReducedMotion && (
          <div className="h-px w-24 overflow-hidden bg-border">
            <div ref={progressRef} className="h-full w-0 bg-accent" />
          </div>
        )}
      </div>
    </div>
  );
}
