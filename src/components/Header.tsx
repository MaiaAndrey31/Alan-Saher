"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { scrollToSection } from "@/lib/lenisStore";

export interface NavItem {
  label: string;
  id: string;
}

interface HeaderProps {
  artistName: string;
  navItems: NavItem[];
}

export function Header({ artistName, navItems }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLButtonElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = isMenuOpen ? "hidden" : "";
    // While the fullscreen menu covers the page, keep the content behind it
    // (and the logo, which sits under the menu's z-index) out of tab order
    // and away from screen readers — `inert` handles both at once.
    const main = document.getElementById("main-content");
    if (main) main.inert = isMenuOpen;
    return () => {
      document.documentElement.style.overflow = "";
      if (main) main.inert = false;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = [
        menuToggleRef.current,
        ...Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[data-menu-link]") ?? []),
      ].filter((el): el is HTMLElement => el !== null);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  useGSAP(
    () => {
      if (!menuRef.current) return;
      const links = menuRef.current.querySelectorAll("[data-menu-link]");
      const tl = gsap.timeline({ paused: true })
        .to(menuRef.current, { autoAlpha: 1, duration: 0.4, ease: "power2.out" })
        .from(links, { yPercent: 110, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: "expo.out" }, "-=0.1");
      menuTlRef.current = tl;
    },
    { scope: menuRef }
  );

  useEffect(() => {
    if (!menuTlRef.current) return;
    if (isMenuOpen) {
      menuTlRef.current.play();
      firstMenuLinkRef.current?.focus();
    } else {
      menuTlRef.current.reverse();
      menuToggleRef.current?.focus();
    }
  }, [isMenuOpen]);

  const handleNavClick = (id: string) => {
    setIsMenuOpen(false);
    scrollToSection(id, -80);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[var(--z-header)] transition-colors duration-500 ${
          isScrolled ? "bg-bg/85 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container-edit flex h-20 items-center justify-between">
          <a
            ref={logoRef}
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            tabIndex={isMenuOpen ? -1 : 0}
            className="font-display text-sm tracking-[0.2em] uppercase"
            data-cursor="view"
          >
            {artistName}
          </a>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="group relative text-xs uppercase tracking-[0.2em] text-fg-muted transition-colors duration-300 hover:text-fg"
                data-cursor="view"
              >
                {item.label}
                <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          <button
            ref={menuToggleRef}
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="relative z-[calc(var(--z-menu)+1)] flex h-8 w-8 flex-col items-center justify-center gap-[6px] md:hidden"
          >
            <span
              className={`h-px w-6 bg-fg transition-transform duration-300 ${isMenuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-fg transition-transform duration-300 ${isMenuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        className="fixed inset-0 z-[var(--z-menu)] flex flex-col items-center justify-center gap-8 bg-bg opacity-0 md:hidden"
        style={{ visibility: "hidden" }}
        aria-hidden={!isMenuOpen}
      >
        {navItems.map((item, index) => (
          <button
            key={item.id}
            ref={index === 0 ? firstMenuLinkRef : undefined}
            data-menu-link
            onClick={() => handleNavClick(item.id)}
            className="overflow-hidden font-display text-4xl uppercase tracking-tight"
            tabIndex={isMenuOpen ? 0 : -1}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
