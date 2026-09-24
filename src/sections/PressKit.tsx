import type { PressKitDto } from "@/lib/content/dto";
import { Reveal } from "@/components/Reveal";

/**
 * Prepared for promoters/press: short + full bio now, downloadable assets
 * (photos, logos, one-sheet PDF) once they exist. See README > "Press Kit".
 */
export function PressKit({ pressKit }: { pressKit: PressKitDto }) {
  return (
    <section aria-label="Press Kit" className="relative border-t border-border py-[var(--section-padding-y)]">
      <div className="container-edit grid grid-cols-1 gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">{pressKit.eyebrow}</span>
          <h2 className="mt-4 font-display leading-[0.95] tracking-tight" style={{ fontSize: "var(--font-size-h3)" }}>
            {pressKit.heading}
          </h2>
        </Reveal>

        <div className="lg:col-span-8">
          <Reveal>
            <p className="max-w-2xl text-fg-muted" style={{ fontSize: "var(--font-size-body)" }}>
              {pressKit.bio}
            </p>
          </Reveal>
          {pressKit.downloadsNote && (
            <Reveal delay={0.1} className="mt-8">
              <span className="text-xs uppercase tracking-[0.2em] text-fg-muted/60">{pressKit.downloadsNote}</span>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
