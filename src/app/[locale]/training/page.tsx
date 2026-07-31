import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/meta";
import PageHeader from "@/components/ui/page-header";
import CtaBand from "@/components/ui/cta-band";
import Reveal from "@/components/ui/reveal";

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
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("coverTitle")}
          </h2>
        </Reveal>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {cover.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <div className="grid gap-2 py-7 sm:grid-cols-12 sm:gap-8">
                <p className="font-mono text-sm text-leaf sm:col-span-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display text-xl font-semibold tracking-tight sm:col-span-4">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-muted sm:col-span-6">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("processTitle")}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {process.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.06}>
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
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
              <Image
                src="/images/zest-launch.webp"
                alt={t("imageAlt")}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
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
