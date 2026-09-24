"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type CursorVariant = "default" | "view" | "play" | "drag";

/**
 * Discrete custom cursor — desktop (fine pointer) only. It supplements the
 * native cursor rather than hiding it everywhere: `cursor: none` is scoped to
 * `.has-custom-cursor`, applied only once a fine-pointer device is confirmed,
 * so keyboard navigation and touch devices are entirely unaffected.
 * Interactive elements opt in to a variant via `data-cursor="view|play|drag"`.
 */
export function CustomCursor() {
  const isFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const prefersReducedMotion = usePrefersReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [visible, setVisible] = useState(false);

  const enabled = isFinePointer && !prefersReducedMotion;

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("has-custom-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const quickDot = { x: gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" }), y: gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" }) };
    const quickRing = { x: gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" }), y: gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" }) };

    const handleMove = (event: PointerEvent) => {
      if (!visible) setVisible(true);
      quickDot.x(event.clientX);
      quickDot.y(event.clientY);
      quickRing.x(event.clientX);
      quickRing.y(event.clientY);
    };

    const handleOver = (event: PointerEvent) => {
      const target = (event.target as HTMLElement)?.closest<HTMLElement>("[data-cursor]");
      setVariant((target?.dataset.cursor as CursorVariant) ?? "default");
    };

    const handleLeaveWindow = () => setVisible(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerover", handleOver);
    document.addEventListener("mouseleave", handleLeaveWindow);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
      document.removeEventListener("mouseleave", handleLeaveWindow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[var(--z-cursor)]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.2s ease" }}
    >
      <div
        ref={ringRef}
        data-variant={variant}
        className="fixed left-0 top-0 -ml-5 -mt-5 h-10 w-10 rounded-full border border-fg/40 transition-[width,height,border-color,background-color] duration-200 ease-out data-[variant=view]:h-16 data-[variant=view]:w-16 data-[variant=view]:border-fg data-[variant=play]:h-16 data-[variant=play]:w-16 data-[variant=play]:bg-accent/90 data-[variant=play]:border-transparent data-[variant=drag]:h-14 data-[variant=drag]:w-14 data-[variant=drag]:border-accent"
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-fg"
      />
    </div>
  );
}
