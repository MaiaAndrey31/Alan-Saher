"use client";

import type { SiteDto, SocialLinkDto } from "@/lib/content/dto";
import Image from "next/image";
import { scrollToSection } from "@/lib/lenisStore";
import { track } from "@/lib/analytics";

interface FooterProps {
  site: SiteDto;
  socialLinks: SocialLinkDto[];
}

export function Footer({ site, socialLinks }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border pt-20">
      <div className="container-edit relative z-10 pb-10">
        <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-fg-muted">{site.roles.join(" · ")}</p>
            <Image
              src="/images/logo-alan-saher.png"
              alt={site.artistName}
              width={559}
              height={480}
              sizes="(min-width: 768px) 140px, 112px"
              className="mt-5 h-24 w-auto md:h-30"
            />
          </div>

          <nav aria-label="Social" className="flex flex-col gap-3 text-sm uppercase tracking-[0.2em]">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target={link.configured ? "_blank" : undefined}
                rel="noreferrer"
                aria-disabled={!link.configured}
                onClick={(e) => {
                  if (!link.configured) e.preventDefault();
                  else if (link.platform === "instagram") track("instagram_click");
                }}
                className={link.configured ? "text-fg-muted transition-colors hover:text-fg" : "text-fg-muted/40"}
                data-cursor="view"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            onClick={() => scrollToSection("booking")}
            className="text-sm uppercase tracking-[0.2em] text-accent"
            data-cursor="view"
          >
            Booking
          </button>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-border py-6 text-xs text-fg-muted md:flex-row md:items-center md:justify-between">
          <span>
            © {year} {site.artistName}. All rights reserved.
          </span>
          <span>{site.footerNote}</span>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[6vw] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[18vw] leading-none text-fg/5"
      >
        {site.artistName}
      </span>
    </footer>
  );
}
