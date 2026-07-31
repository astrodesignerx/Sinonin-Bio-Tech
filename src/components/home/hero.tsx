import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, CalendarCheck } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden pb-20 pt-14 sm:pb-24 sm:pt-16 lg:pb-32 lg:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-[3px] w-16 rounded-full brand-gradient" />
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-leaf">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest active:translate-y-px"
          >
            <CalendarCheck size={16} weight="bold" />
            {t("primaryCta")}
          </Link>
          <Link
            href="/expertise"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink/40 active:translate-y-px"
          >
            {t("secondaryCta")}
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>

        <figure className="mt-10 overflow-hidden rounded-2xl sm:mt-14">
          <div className="relative h-64 w-full sm:h-80 lg:h-96">
            <Image
              src="/images/hero-pulses.webp"
              alt={t("heroImageAlt")}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
            <figcaption className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-paper/85 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink backdrop-blur-sm">
              {t("heroCaption")}
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}
