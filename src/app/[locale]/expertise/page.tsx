import type { Metadata } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/meta";
import { CheckCircle } from "@phosphor-icons/react/ssr";
import PageHeader from "@/components/ui/page-header";
import CtaBand from "@/components/ui/cta-band";
import Reveal from "@/components/ui/reveal";
import FieldRail from "@/components/expertise/field-rail";

const SECTIONS = [
  { key: "proteins", image: "/images/expertise/proteins.webp" },
  { key: "palatants", image: "/images/expertise/palatants.webp" },
  { key: "enzymes", image: "/images/expertise/enzymes.webp" },
  { key: "insects", image: "/images/expertise/insects.webp" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta.expertise" });
  return seoMetadata({ path: "/expertise", title: t("title"), description: t("description") });
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

      {/*
        One question, four answers. Each field opens with the question a client
        actually arrives with rather than a noun label, and the rail on the left
        doubles as a progress indicator. `overflow-x-clip` contains the images
        that bleed off the right edge without introducing a scrollbar.
      */}
      <div className="mx-auto max-w-7xl overflow-x-clip px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="hidden lg:col-span-3 lg:block">
            <FieldRail
              label={t("railLabel")}
              items={SECTIONS.map((s) => ({
                key: s.key,
                number: t(`sections.${s.key}.number`),
                title: t(`sections.${s.key}.title`),
              }))}
            />
          </div>

          <div className="lg:col-span-9">
            {SECTIONS.map((section, i) => {
              const points = t.raw(`sections.${section.key}.points`) as string[];
              return (
                <section
                  key={section.key}
                  id={section.key}
                  className="scroll-mt-28 border-t border-line py-14 sm:py-20"
                >
                  <Reveal>
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-leaf">
                      {t(`sections.${section.key}.number`)} |{" "}
                      {t(`sections.${section.key}.title`)}
                    </p>
                    <h2 className="heading-section mt-4 max-w-2xl">
                      {t(`sections.${section.key}.question`)}
                    </h2>
                  </Reveal>

                  <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
                    <Reveal order={1}>
                      <p className="leading-relaxed text-ink-muted">
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
                    </Reveal>

                    {section.image && (
                      <Reveal order={1}>
                        {/* Alternating fields bleed to the right edge, so the
                            page has rhythm instead of four identical rows. */}
                        <div
                          className={`relative h-64 overflow-hidden rounded-2xl sm:h-80 lg:h-full lg:min-h-72 ${
                            i % 2 === 0
                              ? "lg:-mr-[calc((100vw-min(100vw,80rem))/2+2rem)] lg:rounded-r-none"
                              : ""
                          }`}
                        >
                          <Image
                            src={section.image}
                            alt={t(`sections.${section.key}.imageAlt`)}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="img-reveal object-cover"
                          />
                        </div>
                      </Reveal>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      <CtaBand title={t("ctaTitle")} body={t("ctaBody")} />
    </>
  );
}
