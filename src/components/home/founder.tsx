import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/ui/reveal";
import BrandRule from "@/components/ui/brand-rule";

export default function Founder() {
  const t = useTranslations("home");
  const credentials = t.raw("founderCredentials") as string[];

  // No top divider: the mist Training band above already provides the edge.
  return (
    <section>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-7">
          <Reveal>
            <BrandRule />
            <h2 className="heading-section mt-6">{t("founderTitle")}</h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-ink-muted">
              {t("founderBody")}
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {credentials.map((c) => (
                <li
                  key={c}
                  className="rounded-full bg-mist px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink"
                >
                  {c}
                </li>
              ))}
            </ul>
            {/*
              The arrow moves, not the gap. Animating `gap` on hover asks the
              browser to lay the line out again every frame and nudges the text
              along with it; translating the arrow is the same picture on the
              compositor, and the label stays put.
            */}
            <Link
              href="/about"
              className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf"
            >
              {t("founderCta")}
              <ArrowRight
                size={15}
                weight="bold"
                className="transition-transform motion-press group-hover:translate-x-0.5"
              />
            </Link>
          </Reveal>
        </div>

        {/*
          Portrait crop, the only 4:5 image on the page, against a run of 16:10
          cards. It also puts a face to the credibility claim the copy makes.
        */}
        <div className="lg:col-span-4 lg:col-start-9">
          <Reveal order={1}>
            <div className="relative aspect-square">
              <Image
                src="/images/about/founder.webp"
                alt={t("founderImageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-contain"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
