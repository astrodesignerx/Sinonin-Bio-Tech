import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/meta";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { REPORT_COVERS, REPORT_SLUGS } from "@/lib/reports";
import PageHeader from "@/components/ui/page-header";
import { CARD_INTERACTIVE } from "@/components/ui/card";
import Reveal from "@/components/ui/reveal";
import { BLUR } from "@/lib/blur-data";

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
        <div className="reveal-stagger grid gap-5 lg:grid-cols-2">
          {REPORT_SLUGS.map((report) => {
            const points = t.raw(`items.${report.key}.points`) as string[];
            const cover = REPORT_COVERS[report.slug];
            return (
              <Reveal key={report.key} className="h-full">
                <Link
                  href={`/reports/${report.slug}`}
                  className={`${CARD_INTERACTIVE} flex h-full flex-col overflow-hidden sm:flex-row`}
                >
                  <div className="relative min-h-48 sm:w-2/5 sm:min-h-0">
                    <Image
                      src={cover.src}
                  placeholder={BLUR[cover.src] ? "blur" : "empty"}
                  blurDataURL={BLUR[cover.src]}
                      alt={cover.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="img-reveal object-cover"
                    />
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-paper/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink backdrop-blur-sm">
                      {t("insideLabel")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight">
                      {t(`items.${report.key}.title`)}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">
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
                        className="transition motion-press group-hover:translate-x-0.5"
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
