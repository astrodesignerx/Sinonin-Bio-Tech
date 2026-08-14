import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/reveal";
import BrandRule from "@/components/ui/brand-rule";

export default function Training() {
  const t = useTranslations("home");
  const points = t.raw("trainingPoints") as string[];

  return (
    <section className="overflow-hidden bg-mist">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal order={1}>
          <BrandRule />
          <h2 className="heading-section mt-6">
            {t("trainingTitle")}
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-ink-muted">
            {t("trainingBody")}
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-leaf" />
                <span className="text-sm font-medium text-ink">{point}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/training"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition motion-press hover:border-ink/40 active:translate-y-px"
          >
            {t("trainingCta")}
            <ArrowRight size={16} weight="bold" />
          </Link>
        </Reveal>

        {/*
          Mirror of the hero's right-edge bleed, so the page alternates which
          side breaks the container line instead of repeating itself. Only the
          image bleeds, the caption stays on the container grid.
        */}
        <Reveal className="lg:order-first">
          <figure>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl lg:aspect-auto lg:ml-[calc(-1*((100vw-min(100vw,80rem))/2+2rem))] lg:h-[30rem] lg:rounded-l-none">
              <Image
                src="/images/zest-launch-hero.webp"
                alt={t("trainingImageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="img-parallax object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs leading-relaxed text-ink-muted">
              {t("trainingCaption")}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
