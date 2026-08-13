import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/meta";
import PageHeader from "@/components/ui/page-header";
import CtaBand from "@/components/ui/cta-band";
import Reveal from "@/components/ui/reveal";
import StaggerWords from "@/components/ui/stagger-words";

type CoverItem = { title: string; body: string };
type ProcessStep = { step: string; title: string; body: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta.training" });
  return seoMetadata({ locale, path: "/training", title: t("title"), description: t("description") });
}

export default async function TrainingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TrainingContent />;
}

function TrainingContent() {
  const t = useTranslations("trainingPage");
  const cover = t.raw("cover") as CoverItem[];
  const process = t.raw("process") as ProcessStep[];

  return (
    <>
      <PageHeader title={t("title")} intro={t("intro")} />

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="heading-section">
            {t("coverTitle")}
          </h2>
        </Reveal>
        <div className="reveal-stagger mt-8 divide-y divide-line border-y border-line">
          {cover.map((item, i) => (
            <Reveal key={item.title}>
              {/*
                Rows, not cards, so a lift would read wrong here. The numeral
                steps right and the row warms instead: same feedback, no layout
                shift, and the divider rhythm stays intact.
              */}
              <div className="group -mx-4 grid gap-2 rounded-xl px-4 py-7 transition-colors duration-200 ease-out-soft hover:bg-mist/50 sm:grid-cols-12 sm:gap-8">
                <p className="font-mono text-sm text-leaf/70 transition-all duration-200 ease-out-soft group-hover:translate-x-1 group-hover:text-leaf sm:col-span-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display text-xl font-semibold tracking-tight transition-colors duration-200 ease-out-soft group-hover:text-leaf sm:col-span-4">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-muted sm:col-span-6">
                  <StaggerWords text={item.body} />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="heading-section">
            {t("processTitle")}
          </h2>
        </Reveal>
        <div className="reveal-stagger mt-8 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {process.map((step) => (
            <Reveal key={step.step}>
              <div className="border-t-2 border-ink/10 pt-5">
                <p className="font-display text-4xl font-semibold tracking-tight text-leaf">
                  {step.step}
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <figure>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
            <Image
              src="/images/zest-launch-hero.webp"
              alt={t("imageAlt")}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="img-parallax object-cover"
            />
            </div>
            <figcaption className="mt-3 text-xs leading-relaxed text-ink-muted">
              {t("caption")}
            </figcaption>
          </figure>
        </Reveal>
      </section>

      <CtaBand title={t("ctaTitle")} body={t("ctaBody")} />
    </>
  );
}
