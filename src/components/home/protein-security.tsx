import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/reveal";

type Stat = { value: string; label: string };

export default function ProteinSecurity() {
  const t = useTranslations("home");
  const stats = t.raw("stats") as Stat[];

  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("statsTitle")}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">
            {t("statsIntro")}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.value}>
              <div className="border-t-2 border-ink/10 pt-5">
                <p className="font-display text-5xl font-semibold tracking-tight text-ink lg:text-6xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-ink-muted/70">
          {t("statsSources")}
        </p>
      </div>
    </section>
  );
}
