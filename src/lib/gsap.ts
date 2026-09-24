import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Shared motion timings — keep in sync with the CSS tokens in globals.css. */
export const motion = {
  duration: {
    fast: 0.25,
    normal: 0.55,
    slow: 0.95,
    cinematic: 1.7,
  },
  ease: {
    outExpo: "expo.out",
    cinematic: "power4.inOut",
    inOutQuart: "power4.inOut",
  },
} as const;

export { gsap, ScrollTrigger };
