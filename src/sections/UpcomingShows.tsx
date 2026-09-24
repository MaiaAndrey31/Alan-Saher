"use client";

import type { ShowDto } from "@/lib/content/dto";
import { Reveal } from "@/components/Reveal";
import { MagneticButton } from "@/components/MagneticButton";
import { scrollToSection } from "@/lib/lenisStore";
import { track } from "@/lib/analytics";

function formatDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function UpcomingShows({ shows }: { shows: ShowDto[] }) {
  return (
    <section id="shows" aria-label="Upcoming Shows" className="relative py-[var(--section-padding-y)]">
      <div className="container-edit">
        <Reveal className="mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">Upcoming Shows</span>
          <h2 className="mt-4 font-display leading-[0.95] tracking-tight" style={{ fontSize: "var(--font-size-h2)" }}>
            On the road.
          </h2>
        </Reveal>

        {shows.length === 0 ? (
          <div className="border-t border-border py-16 text-center">
            <p className="mx-auto max-w-md text-sm text-fg-muted">
              No dates announced right now — the agenda is updated as new shows are confirmed.
            </p>
            <MagneticButton className="mt-8 inline-block">
              <button
                onClick={() => {
                  scrollToSection("booking");
                }}
                className="text-xs uppercase tracking-[0.25em] text-accent"
              >
                Book Alan for your event
              </button>
            </MagneticButton>
          </div>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {shows.map((show) => (
              <li key={show.id}>
                <div className="group flex flex-col gap-2 py-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-8">
                    <span className="w-32 shrink-0 text-xs uppercase tracking-[0.2em] text-fg-muted">
                      {formatDate(show.date)}
                    </span>
                    <span className="font-display text-xl md:text-2xl">{show.city}</span>
                    <span className="text-sm text-fg-muted">
                      {show.venue}
                      {show.country ? `, ${show.country}` : ""}
                    </span>
                  </div>
                  {show.soldOut ? (
                    <span className="text-xs uppercase tracking-[0.2em] text-fg-muted">Sold out</span>
                  ) : show.ticketUrl ? (
                    <a
                      href={show.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => track("show_click")}
                      className="text-xs uppercase tracking-[0.25em] text-fg underline-offset-4 transition-colors group-hover:text-accent md:group-hover:underline"
                    >
                      Tickets
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
