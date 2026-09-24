"use client";

import type { PressDto } from "@/lib/content/dto";
import { Reveal } from "@/components/Reveal";
import { track } from "@/lib/analytics";

export function Press({ items }: { items: PressDto[] }) {
  return (
    <section aria-label="Press" className="relative border-t border-border py-[var(--section-padding-y)]">
      <div className="container-edit">
        <Reveal className="mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">Press</span>
          <h2 className="mt-4 font-display leading-[0.95] tracking-tight" style={{ fontSize: "var(--font-size-h2)" }}>
            Selected stories.
          </h2>
        </Reveal>

        {items.length === 0 ? (
          <p className="max-w-md text-sm text-fg-muted">Press coverage will be featured here as it is published.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {items.map((item) => (
              <Reveal key={item.id}>
                <a
                  href={item.url ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("press_click")}
                  className="group block border-t border-border pt-6"
                  data-cursor="view"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-fg-muted">
                    {item.outlet} — {item.date}
                  </span>
                  <h3 className="mt-2 font-display text-xl transition-colors group-hover:text-accent">{item.title}</h3>
                  {item.excerpt && <p className="mt-2 text-sm text-fg-muted">{item.excerpt}</p>}
                </a>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
