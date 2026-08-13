import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/section-header";
import StatFigure from "@/components/home/stat-figure";

type Stat = { value: string; label: string };

export default function ProteinSecurity() {
  const t = useTranslations("home");
  const stats = t.raw("stats") as Stat[];

  return (
    <section className="bg-forest">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <SectionHeader
          tone="dark"
          title={t("statsTitle")}
          intro={t("statsIntro")}
        />

        <div className="reveal-stagger mt-12 grid gap-10 sm:mt-14 sm:grid-cols-3 sm:gap-8">
          {stats.map((stat) => (
            <StatFigure key={stat.value} value={stat.value} label={stat.label} />
          ))}
        </div>
        <p className="mt-10 text-xs text-paper/50">{t("statsSources")}</p>
      </div>
    </section>
  );
}
