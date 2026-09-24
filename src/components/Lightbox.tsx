"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

interface LightboxItem {
  src: string;
  alt: string;
  caption?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

/** Fullscreen, keyboard-accessible image viewer with focus trapping and ESC to close. */
export function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const item = items[index];

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndexChange((index + 1) % items.length);
      if (event.key === "ArrowLeft") onIndexChange((index - 1 + items.length) % items.length);
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, items.length, onClose, onIndexChange]);

  if (!item) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      tabIndex={-1}
      className="fixed inset-0 z-[var(--z-lightbox)] flex items-center justify-center bg-bg/97 backdrop-blur-sm outline-none"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-6 top-6 text-xs uppercase tracking-[0.25em] text-fg-muted hover:text-fg"
        data-cursor="view"
      >
        Close (Esc)
      </button>

      <button
        onClick={() => onIndexChange((index - 1 + items.length) % items.length)}
        aria-label="Previous image"
        className="absolute left-4 top-1/2 -translate-y-1/2 px-3 text-2xl text-fg-muted hover:text-fg md:left-8"
        data-cursor="view"
      >
        ‹
      </button>

      <figure className="relative mx-16 aspect-[4/5] max-h-[80vh] w-full max-w-2xl">
        <Image src={item.src} alt={item.alt} fill sizes="80vw" className="object-contain" />
        {item.caption && (
          <figcaption className="absolute -bottom-10 left-0 text-xs uppercase tracking-[0.2em] text-fg-muted">
            {item.caption}
          </figcaption>
        )}
      </figure>

      <button
        onClick={() => onIndexChange((index + 1) % items.length)}
        aria-label="Next image"
        className="absolute right-4 top-1/2 -translate-y-1/2 px-3 text-2xl text-fg-muted hover:text-fg md:right-8"
        data-cursor="view"
      >
        ›
      </button>
    </div>
  );
}
