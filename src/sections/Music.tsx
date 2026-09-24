"use client";

import type { ReleaseDto, SocialLinkDto } from "@/lib/content/dto";
import { Reveal } from "@/components/Reveal";
import { MagneticButton } from "@/components/MagneticButton";
import { track } from "@/lib/analytics";

function ReleaseRow({ release }: { release: ReleaseDto }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-6">
      <div>
        <span className="text-xs uppercase tracking-[0.2em] text-fg-muted">{release.year}</span>
        <h3 className="mt-1 font-display text-xl md:text-2xl">{release.title}</h3>
      </div>
      <div className="flex gap-6 text-xs uppercase tracking-[0.2em] text-fg-muted">
        {release.spotifyUrl && (
          <a href={release.spotifyUrl} target="_blank" rel="noreferrer" className="hover:text-fg" data-cursor="play">
            Spotify
          </a>
        )}
        {release.appleMusicUrl && (
          <a href={release.appleMusicUrl} target="_blank" rel="noreferrer" className="hover:text-fg" data-cursor="play">
            Apple Music
          </a>
        )}
      </div>
    </div>
  );
}

function ConnectState({ socialLinks }: { socialLinks: SocialLinkDto[] }) {
  const spotify = socialLinks.find((link) => link.platform === "spotify");
  const appleMusic = socialLinks.find((link) => link.platform === "appleMusic");

  return (
    <div className="border-t border-border py-16 text-center">
      <p className="mx-auto max-w-md text-sm text-fg-muted">
        Releases are on their way here. In the meantime, follow Alan Saher on streaming platforms.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
        {[spotify, appleMusic].map(
          (link) =>
            link && (
              <MagneticButton key={link.platform} cursorVariant="play">
                <a
                  href={link.url}
                  target={link.configured ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-disabled={!link.configured}
                  onClick={(e) => {
                    if (!link.configured) e.preventDefault();
                    else track(link.platform === "spotify" ? "spotify_click" : "hero_booking_click");
                  }}
                  className={`text-xs uppercase tracking-[0.25em] ${
                    link.configured ? "text-fg hover:text-accent" : "cursor-not-allowed text-fg-muted/50"
                  }`}
                >
                  {link.label} {!link.configured && "— coming soon"}
                </a>
              </MagneticButton>
            )
        )}
      </div>
    </div>
  );
}

interface MusicProps {
  releases: ReleaseDto[];
  socialLinks: SocialLinkDto[];
}

export function Music({ releases, socialLinks }: MusicProps) {
  return (
    <section id="music" aria-label="Music" className="relative py-[var(--section-padding-y)]">
      <div className="container-edit">
        <Reveal className="mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">Music</span>
          <h2 className="mt-4 font-display leading-[0.95] tracking-tight" style={{ fontSize: "var(--font-size-h2)" }}>
            Listen.
          </h2>
        </Reveal>

        {releases.length > 0 ? (
          <div>
            {releases.map((release) => (
              <ReleaseRow key={release.id} release={release} />
            ))}
          </div>
        ) : (
          <ConnectState socialLinks={socialLinks} />
        )}
      </div>
    </section>
  );
}
