import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/reveal";

const REPORTS = [
  { key: "insect", slug: "insect-proteins" },
  { key: "palatants", slug: "vegan-palatants" },
  { key: "petfood", slug: "vegan-petfood" },
  { key: "petcare", slug: "petcare-market" },
] as const;

export default function Reports() {
  const t = useTranslations("home");

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-leaf">
          {t("reportsEyebrow")}
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("reportsTitle")}
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">
          {t("reportsIntro")}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {REPORTS.map((report) => (
          <Link
            key={report.key}
            href={`/reports/${report.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-16px_rgba(16,31,56,0.18)]"
          >
              <div className="relative flex aspect-[4/3] flex-col justify-between bg-navy p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/60">
                  {t("reportLabel")}
                </span>
                <h3 className="font-display text-xl font-semibold leading-snug tracking-tight text-paper">
                  {t(`reports.${report.key}.title`)}
                </h3>
                <span className="absolute inset-x-0 bottom-0 h-[3px] brand-gradient" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="flex-1 text-sm leading-relaxed text-ink-muted">
                  {t(`reports.${report.key}.body`)}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf">
                  {t("reportsCta")}
                  <ArrowRight
                    size={15}
                    weight="bold"
                    className="transition group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </Link>
        ))}
      </div>
    </section>
  );
}
