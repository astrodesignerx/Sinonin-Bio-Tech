import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/reveal";

export default function Training() {
  const t = useTranslations("home");
  const points = t.raw("trainingPoints") as string[];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
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
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink/40 active:translate-y-px"
          >
            {t("trainingCta")}
            <ArrowRight size={16} weight="bold" />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <figure>
            <div className="relative aspect-[7/6] overflow-hidden rounded-2xl">
              <Image
                src="/images/zest-launch.webp"
                alt={t("trainingImageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
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
