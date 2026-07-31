import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/meta";
import { CheckCircle } from "@phosphor-icons/react/ssr";
import PageHeader from "@/components/ui/page-header";
import CtaBand from "@/components/ui/cta-band";
import Reveal from "@/components/ui/reveal";

const SECTIONS = [
  { key: "proteins", image: "/images/hero-pulses.webp" },
  { key: "palatants", image: "/images/bowls.webp" },
  { key: "enzymes", image: null },
  { key: "insects", image: "/images/insect-powder.webp" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta.expertise" });
  return seoMetadata({ locale, path: "/expertise", title: t("title"), description: t("description") });
}

export default async function ExpertisePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ExpertiseContent />;
}

function ExpertiseContent() {
  const t = useTranslations("expertisePage");

  return (
    <>
      <PageHeader title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {SECTIONS.map((section) => {
          const points = t.raw(`sections.${section.key}.points`) as string[];
          return (
            <section
              key={section.key}
              id={section.key}
              className="scroll-mt-24 border-t border-line py-14 sm:py-16"
            >
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="lg:sticky lg:top-24">
                    <Reveal>
                      <p className="font-mono text-sm text-leaf">
                        {t(`sections.${section.key}.number`)}
                      </p>
                      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                        {t(`sections.${section.key}.title`)}
                      </h2>
                    </Reveal>
                  </div>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <Reveal delay={0.05}>
                    <p className="max-w-2xl leading-relaxed text-ink-muted">
                      {t(`sections.${section.key}.body`)}
                    </p>
                    <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
                      {t("deliverablesLabel")}
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
                    {section.image && (
                      <div className="relative mt-8 h-52 overflow-hidden rounded-2xl sm:h-64">
                        <Image
                          src={section.image}
                          alt={t(`sections.${section.key}.imageAlt`)}
                          fill
                          sizes="(max-width: 1024px) 100vw, 640px"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </Reveal>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <CtaBand title={t("ctaTitle")} body={t("ctaBody")} />
    </>
  );
}
