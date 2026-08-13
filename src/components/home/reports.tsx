import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import SectionHeader from "@/components/ui/section-header";
import { CARD_INTERACTIVE } from "@/components/ui/card";
import { REPORT_COVERS, REPORT_SLUGS } from "@/lib/reports";
import { BLUR } from "@/lib/blur-data";

export default function Reports() {
  const t = useTranslations("home");

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <SectionHeader
        eyebrow={t("reportsEyebrow")}
        title={t("reportsTitle")}
        intro={t("reportsIntro")}
      />

      <div className="reveal-stagger mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
        {REPORT_SLUGS.map((report) => {
          const cover = REPORT_COVERS[report.slug];
          return (
            <Link
              key={report.key}
              href={`/reports/${report.slug}`}
              className={`${CARD_INTERACTIVE} flex h-full flex-col overflow-hidden`}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={cover.src}
                  placeholder={BLUR[cover.src] ? "blur" : "empty"}
                  blurDataURL={BLUR[cover.src]}
                  alt={cover.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="img-reveal object-cover"
                />
                <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-paper/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink backdrop-blur-sm">
                  {t("reportLabel")}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl font-semibold leading-snug tracking-tight">
                  {t(`reports.${report.key}.title`)}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
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
          );
        })}
      </div>
    </section>
  );
}
