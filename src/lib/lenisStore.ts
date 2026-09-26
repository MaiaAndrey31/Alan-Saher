import type Lenis from "lenis";

let activeLenis: Lenis | null = null;
let isLocked = false;

export function setActiveLenis(instance: Lenis | null) {
  activeLenis = instance;
  if (instance && isLocked) instance.stop();
}

export function getActiveLenis() {
  return activeLenis;
}

/**
 * Locks page scroll (preloader, lightbox, mobile menu). Uses Lenis' own
 * stop/start when smooth scroll is active; `overflow: hidden` is only the
 * native-scroll fallback — `scrollbar-gutter: stable` in globals.css keeps
 * the layout from shifting when the scrollbar disappears.
 */
export function lockScroll(locked: boolean) {
  isLocked = locked;
  if (activeLenis) {
    if (locked) activeLenis.stop();
    else activeLenis.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/** Scrolls to a section by id, using the shared Lenis instance when smooth scroll is active. */
export function scrollToSection(id: string, offset = 0) {
  const target = document.getElementById(id);
  if (!target) return;

  if (activeLenis) {
    activeLenis.scrollTo(target, { offset, duration: 1.4 });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/** Scrolls to an absolute Y position (used by the Story timeline's chapter dots). */
export function scrollToY(y: number) {
  if (activeLenis) activeLenis.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}
