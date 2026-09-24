import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";

interface NumbersProps {
  startYear: number;
  stageYears: { id: string; year: string }[];
}

/** Editorial credentials composition — no cards, just typography, rules and negative space. */
export function Numbers({ startYear, stageYears }: NumbersProps) {
  const currentYear = new Date().getFullYear();
  const years = Math.max(0, currentYear - startYear);
  const curatedStages = stageYears.slice(0, 6);

  if (years === 0 && curatedStages.length === 0) return null;

  return (
    <section aria-label="Numbers" className="relative border-y border-border py-[var(--section-padding-y)]">
      <div className="container-edit">
        <h2 className="sr-only">
          {years}+ years, performances across major world stages since {startYear}.
        </h2>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
          {years > 0 && (
            <Reveal className="lg:col-span-5">
              <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">Since {startYear}</span>
              <div className="mt-4 flex items-baseline gap-2">
                <CountUp
                  to={years}
                  suffix="+"
                  className="font-display text-[clamp(4rem,12vw,9rem)] leading-none tracking-tight"
                />
                <span className="font-display text-2xl text-fg-muted md:text-4xl">Years</span>
              </div>
            </Reveal>
          )}

          {curatedStages.length > 0 && (
            <div className="lg:col-span-7 lg:border-l lg:border-border lg:pl-12">
              <Reveal delay={0.1}>
                <span className="text-xs uppercase tracking-[0.3em] text-fg-muted">World Stages</span>
              </Reveal>
              <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                {curatedStages.map((stage, i) => (
                  <li key={stage.id}>
                    <Reveal delay={0.15 + i * 0.08}>
                      <span className="font-display text-3xl tracking-tight md:text-5xl">{stage.year}</span>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
