import type { Metadata } from "next";
import Image from "next/image";
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

      <Reveal>
        <figure className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
            <Image
              src="/images/about/nandi.webp"
              alt="Rolling green tea-covered hills in the Nandi highlands of Kenya, with a small insect farm building on the ridge, the same lush green habitat that gives Sinonin its name."
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="img-parallax object-cover"
            />
          </div>
          <figcaption className="mt-3 text-xs leading-relaxed text-ink-muted">
            Nandi highlands, Kenya, the same lush green habitat that gives Sinonin its name.
          </figcaption>
        </figure>
      </Reveal>

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <section className="border-t border-line py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                {/* The mark sits with the name section because this is where
                    the name is explained: Nandi for the green habitat the
                    logo's leaf refers to. It follows the heading rather than
                    leading it, so the section reads as the claim first and the
                    mark as what the claim resolves to.

                    Shown as the header's lockup, mark beside wordmark, rather
                    than the mark alone in a tile: this section is about the
                    name, so the name itself should be the thing on show. */}
                <div className="lg:sticky lg:top-24">
                  <h2 className="heading-sub">{t("nameTitle")}</h2>
                  <div className="mt-5 flex items-center gap-3">
                    <Image
                      src="/brand/logo.png"
                      alt=""
                      width={34}
                      height={34}
                      className="h-[34px] w-auto"
                    />
                    <span className="font-display text-lg font-semibold tracking-tight">
                      Sinonin Biotech
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
            {/* Starts on the same column as the founder section's body, so the
                two sections share one reading edge down the page. */}
            <div className="lg:col-span-7 lg:col-start-5">
              <Reveal order={1}>
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
                <h2 className="heading-sub lg:sticky lg:top-24">
                  {t("founderTitle")}
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-5 lg:col-start-5">
              <Reveal order={1}>
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
            <div className="lg:col-span-3 lg:col-start-10">
              <Reveal order={1}>
                <div className="relative aspect-square">
                  <Image
                    src="/images/about/founder.webp"
                    alt="Portrait of Dr. Seronei Chelulei Cheison, founder of Sinonin Biotech, in a dark suit and blue tie."
                    fill
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    className="object-contain"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-t border-line py-14 sm:py-16">
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="group h-full overflow-hidden rounded-2xl bg-mist p-7 shadow-card transition motion-quick hover:-translate-y-0.5 hover:shadow-card-hover sm:p-8">
                <span aria-hidden="true" className="mb-5 block h-[2px] w-12 origin-left scale-x-0 rounded-full brand-gradient transition-transform motion-panel group-hover:scale-x-100" />
                <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-leaf">
                  {t("missionTitle")}
                </h2>
                <p className="mt-4 leading-relaxed text-ink">
                  {t("missionBody")}
                </p>
              </div>
            </Reveal>
            <Reveal order={1}>
              <div className="group h-full overflow-hidden rounded-2xl bg-mist p-7 shadow-card transition motion-quick hover:-translate-y-0.5 hover:shadow-card-hover sm:p-8">
                <span aria-hidden="true" className="mb-5 block h-[2px] w-12 origin-left scale-x-0 rounded-full brand-gradient transition-transform motion-panel group-hover:scale-x-100" />
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
