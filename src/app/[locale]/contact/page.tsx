import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { seoMetadata } from "@/lib/meta";
import {
  CalendarCheck,
  Clock,
  EnvelopeSimple,
} from "@phosphor-icons/react/ssr";
import PageHeader from "@/components/ui/page-header";
import { CARD } from "@/components/ui/card";
import Magnetic from "@/components/ui/magnetic";
import LeadForm from "@/components/forms/lead-form";
import Reveal from "@/components/ui/reveal";
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pageMeta.contact" });
  return seoMetadata({ locale, path: "/contact", title: t("title"), description: t("description") });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const settings = await getSiteSettings();

  return <ContactContent settings={settings} />;
}

function ContactContent({ settings }: { settings: SiteSettings }) {
  const t = useTranslations("contactPage");

  return (
    <>
      <PageHeader title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Reveal>
              <div className={`${CARD} p-7`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-leaf">
                  <CalendarCheck size={20} />
                </span>
                <h2 className="mt-5 heading-sub">
                  {t("bookingTitle")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {t("bookingBody")}
                </p>
                <Magnetic className="mt-6">
                  <a
                    href={settings.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-white transition motion-press hover:bg-forest active:translate-y-px"
                  >
                    <CalendarCheck size={16} weight="bold" />
                    {t("bookingCta")}
                  </a>
                </Magnetic>
              </div>
            </Reveal>

            <Reveal order={1}>
              <div className={`${CARD} p-7`}>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
                  {t("detailsTitle")}
                </h2>
                <a
                  href={`mailto:${settings.email}`}
                  className="mt-4 flex items-center gap-3 text-sm text-ink transition motion-press hover:text-leaf"
                >
                  <EnvelopeSimple size={18} className="shrink-0 text-leaf" />
                  {settings.email}
                </a>
                <div className="mt-4 flex items-center gap-3 text-sm text-ink">
                  <Clock size={18} className="shrink-0 text-leaf" />
                  <span>
                    {t("hoursTitle")}: {t("hoursDays")}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal order={1}>
              <div className={`${CARD} p-7 sm:p-8`}>
                <h2 className="heading-sub">
                  {t("formTitle")}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {t("formBody")}
                </p>
                <div className="mt-6">
                  <LeadForm
                    variant="contact"
                    subject="Website contact, Sinonin Biotech"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
