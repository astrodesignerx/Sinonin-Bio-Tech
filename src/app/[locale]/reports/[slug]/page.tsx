import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import LeadForm from "@/components/forms/lead-form";
import Reveal from "@/components/ui/reveal";
import { CARD } from "@/components/ui/card";
import BrandRule from "@/components/ui/brand-rule";
import BrandShowcase from "@/components/reports/brand-showcase";
import { REPORT_BRANDS } from "@/lib/brands";
import {
  REPORT_SLUGS,
  findReport,
  getReport,
  getReports,
  type ReportCopy,
} from "@/lib/reports";
import { seoMetadata } from "@/lib/meta";

type Params = { locale: string; slug: string };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    REPORT_SLUGS.map((report) => ({ locale, slug: report.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const report = await getReport(slug, locale);
  if (!report) return {};
  return seoMetadata({
    path: `/reports/${slug}`,
    title: `${report.title} | Sinonin Biotech`,
    description: report.body,
  });
}

export default async function ReportPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!findReport(slug)) notFound();
  setRequestLocale(locale);

  const all = await getReports(locale);
  const report = all.find((r) => r.slug === slug);
  if (!report) notFound();

  return (
    <ReportContent report={report} others={all.filter((r) => r.slug !== slug)} />
  );
}

function ReportContent({
  report,
  others,
}: {
  report: ReportCopy;
  others: ReportCopy[];
}) {
  /* Page chrome ("What's inside", "View Report") stays in the message files;
     only the per-report wording moved to Sanity. */
  const t = useTranslations("reportsPage");
  const rp = useTranslations("reportPage");
  const points = report.points;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
      <Reveal>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition motion-press hover:text-ink"
        >
          <ArrowLeft size={15} weight="bold" />
          {rp("back")}
        </Link>
      </Reveal>

      <div className="mt-8 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <BrandRule />
            <h1 className="heading-page mt-6 max-w-xl">
              {report.title}
            </h1>
            <p className="mt-5 max-w-2xl leading-relaxed text-ink-muted sm:text-lg">
              {report.body}
            </p>

            <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
              {t("insideLabel")}
            </p>
            <ul className="mt-4 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-leaf"
                  />
                  <span className="text-sm leading-relaxed text-ink">
                    {point}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
              {rp("forLabel")}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink">
              {rp("forBody")}
            </p>

            <BrandShowcase
              label={rp("brandsLabel")}
              title={rp("brandsTitle")}
              note={rp("brandsNote")}
              items={REPORT_BRANDS[report.slug] ?? []}
            />

            <div className="mt-12 border-t border-line pt-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
                {rp("otherTitle")}
              </p>
              <ul className="mt-4 space-y-2.5">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/reports/${other.slug}`}
                      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-leaf"
                    >
                      {other.title}
                      <ArrowRight
                        size={14}
                        weight="bold"
                        className="transition motion-press group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal order={1}>
            <div className={`${CARD} overflow-hidden lg:sticky lg:top-24`}>
              <figure>
                <div className="relative aspect-[16/9]">
                  <Image
                    src={report.cover ?? ""}
                    placeholder={report.coverLqip ? "blur" : "empty"}
                    blurDataURL={report.coverLqip}
                    alt={report.coverAlt ?? report.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="img-reveal object-cover"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-paper/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink backdrop-blur-sm">
                    {rp("freeLabel")}
                  </span>
                </div>
                <figcaption className="bg-white px-1 pt-2 text-xs leading-relaxed text-ink-muted">
                  {report.coverCredit}
                </figcaption>
              </figure>
              <div className="p-6">
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  {rp("formTitle")}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {rp("formBody")}
                </p>
                <div className="mt-6">
                  <LeadForm
                    variant="report"
                    subject={`Report request: ${report.title}`}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
