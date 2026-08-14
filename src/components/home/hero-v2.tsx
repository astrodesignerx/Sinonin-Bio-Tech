import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, CalendarCheck } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import BrandRule from "@/components/ui/brand-rule";
import Magnetic from "@/components/ui/magnetic";
import CellsCanvas from "@/components/home/cells-canvas";
import { HERO_CLIPS } from "@/lib/config";
import HeroVideoLoop from "@/components/home/hero-video-loop";

/*
  Hero V2. Full-bleed animated cells fill the fold, the type sits directly on
  them, and the media rides above as a floating card.

  Two departures from V1 worth naming:

  The cells palette is deliberately pale (paper through mist, with a soft leaf
  membrane). Type over a busy background usually needs a dark scrim, and a
  scrim is exactly what would cost this site its light character. Keeping the
  backdrop light instead means the existing ink type stays legible with no
  overlay at all, so nothing is dimmed.

  V1's leaf glow is dropped here: the cells already supply the depth behind the
  headline, and running both would be two ambient effects competing.

  The media is a cycling sequence rather than one looping clip, alternating
  bowl and bench so the fold states the proposition instead of decorating it.
*/
export default function HeroV2() {
  const t = useTranslations("home");

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-14 sm:pb-24 sm:pt-16 lg:flex lg:min-h-[calc(100svh-var(--header-h))] lg:items-center lg:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <CellsCanvas />
        {/*
          A paper wash from the left, strongest under the copy and gone by the
          middle. Not a scrim over the whole frame: it only steadies the text
          column while leaving the cells fully visible behind the media.
        */}
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/70 to-transparent lg:to-transparent" />
        {/* Settles the join where the fold meets the next section. */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-paper" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <BrandRule className="hero-rule-in" />
            <p
              style={{ "--hero-step": 1 } as React.CSSProperties}
              className="hero-step mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-leaf"
            >
              {t("eyebrow")}
            </p>
            <h1
              style={{ "--hero-step": 2 } as React.CSSProperties}
              className="hero-step heading-page mt-4"
            >
              {t("title")}
            </h1>
            <p
              style={{ "--hero-step": 3 } as React.CSSProperties}
              className="hero-step mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg"
            >
              {t("subtitle")}
            </p>
            <div
              style={{ "--hero-step": 4 } as React.CSSProperties}
              className="hero-step mt-8 flex flex-wrap items-center gap-4"
            >
              <Magnetic>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest active:translate-y-px"
                >
                  <CalendarCheck size={16} weight="bold" />
                  {t("primaryCta")}
                </Link>
              </Magnetic>
              <Link
                href="/expertise"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-paper/70 px-6 py-3 text-sm font-semibold text-ink backdrop-blur-sm transition hover:border-ink/40 hover:bg-paper active:translate-y-px"
              >
                {t("secondaryCta")}
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>

          {/*
            Runs off the right edge as in V1. The negative margin is the exact
            gap between the container's content edge and the viewport, so the
            media breaks the container line the rest of the page keeps; the
            section's `overflow-hidden` absorbs the overhang.

            The shadow and ring stay, but the right rounding goes: a corner
            radius on an edge that is off-screen would only announce that the
            frame stops just out of view.
          */}
          <figure className="lg:col-span-6 lg:mr-[calc(-1*((100vw-min(100vw,80rem))/2+2rem))]">
            <div className="hero-media relative h-64 w-full overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_rgba(16,31,56,0.45)] ring-1 ring-white/40 sm:h-80 lg:h-[clamp(24rem,calc(100svh-22rem),34rem)] lg:rounded-r-none">
              {HERO_CLIPS.length > 0 ? (
                <HeroVideoLoop clips={HERO_CLIPS} />
              ) : (
                <>
                  <Image
                    src="/images/hero-pulses.webp"
                    alt={t("heroImageAlt")}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="hero-breathe object-cover"
                  />
                  <figcaption className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-paper/85 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink backdrop-blur-sm">
                    {t("heroCaption")}
                  </figcaption>
                </>
              )}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
