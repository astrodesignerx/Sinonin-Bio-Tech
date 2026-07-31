import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/meta";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { REPORT_SLUGS } from "@/lib/reports";
import PageHeader from "@/components/ui/page-header";
import Reveal from "@/components/ui/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta.reports" });
  return seoMetadata({ locale, path: "/reports", title: t("title"), description: t("description") });
}

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ReportsContent />;
}

function ReportsContent() {
  const t = useTranslations("reportsPage");

  return (
    <>
      <PageHeader title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {REPORT_SLUGS.map((report, i) => {
            const points = t.raw(`items.${report.key}.points`) as string[];
            return (
              <Reveal key={report.key} delay={i * 0.05} className="h-full">
                <Link
                  href={`/reports/${report.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-16px_rgba(16,31,56,0.18)] sm:flex-row"
                >
                  <div className="relative flex min-h-40 flex-col justify-between bg-navy p-6 sm:w-2/5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/60">
                      {t("insideLabel")}
                    </span>
                    <h2 className="mt-8 font-display text-2xl font-semibold leading-snug tracking-tight text-paper">
                      {t(`items.${report.key}.title`)}
                    </h2>
                    <span className="absolute inset-x-0 bottom-0 h-[3px] brand-gradient sm:inset-y-0 sm:left-auto sm:h-auto sm:w-[3px]" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {t(`items.${report.key}.body`)}
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <CheckCircle
                            size={17}
                            weight="fill"
                            className="mt-0.5 shrink-0 text-leaf"
                          />
                          <span className="text-sm leading-relaxed text-ink">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <span className="mt-5 inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-leaf">
                      {t("cta")}
                      <ArrowRight
                        size={15}
                        weight="bold"
                        className="transition group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </>
  );
}
