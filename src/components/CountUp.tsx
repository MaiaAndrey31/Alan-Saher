"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface CountUpProps {
  to: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function CountUp({ to, suffix = "", className, duration = 1.6 }: CountUpProps) {
  const [ref, isInView] = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasPlayedRef = useRef(false);

  useGSAP(() => {
    if (!isInView || hasPlayedRef.current || !ref.current) return;
    hasPlayedRef.current = true;

    if (prefersReducedMotion) {
      ref.current.textContent = `${to}${suffix}`;
      return;
    }

    const counter = { value: 0 };
    gsap.to(counter, {
      value: to,
      duration,
      ease: "expo.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = `${Math.floor(counter.value)}${suffix}`;
      },
    });
  }, [isInView]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
