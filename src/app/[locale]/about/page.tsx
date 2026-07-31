import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/meta";
import PageHeader from "@/components/ui/page-header";
import CtaBand from "@/components/ui/cta-band";
import Reveal from "@/components/ui/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta.about" });
  return seoMetadata({ locale, path: "/about", title: t("title"), description: t("description") });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations("aboutPage");
  const credentials = t.raw("credentials") as string[];

  return (
    <>
      <PageHeader title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <section className="border-t border-line py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <h2 className="font-display text-3xl font-semibold tracking-tight lg:sticky lg:top-24">
                  {t("nameTitle")}
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <Reveal delay={0.05}>
                <p className="max-w-2xl text-lg leading-relaxed text-ink">
                  {t("nameBody")}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-t border-line py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <h2 className="font-display text-3xl font-semibold tracking-tight lg:sticky lg:top-24">
                  {t("founderTitle")}
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <Reveal delay={0.05}>
                <p className="max-w-2xl leading-relaxed text-ink-muted">
                  {t("founderBody")}
                </p>
                <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">
                  {t("founderBody2")}
                </p>
                <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
                  {t("credentialsLabel")}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {credentials.map((c) => (
                    <li
                      key={c}
                      className="rounded-full bg-mist px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-t border-line py-14 sm:py-16">
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl bg-mist p-7 sm:p-8">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-leaf">
                  {t("missionTitle")}
                </h2>
                <p className="mt-4 leading-relaxed text-ink">
                  {t("missionBody")}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="h-full rounded-2xl bg-mist p-7 sm:p-8">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-leaf">
                  {t("visionTitle")}
                </h2>
                <p className="mt-4 leading-relaxed text-ink">
                  {t("visionBody")}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      <CtaBand title={t("ctaTitle")} body={t("ctaBody")} />
    </>
  );
}
